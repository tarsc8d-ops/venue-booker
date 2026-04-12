import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2"

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
}

type GoogleUser = { sub: string; email: string }

async function verifyGoogle(accessToken: string): Promise<GoogleUser> {
  const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`Invalid Google token: ${r.status} ${t}`)
  }
  return r.json() as Promise<GoogleUser>
}

function normalizeRow(row: Record<string, unknown>): Record<string, unknown> {
  if (row.data != null && typeof row.data === "object" && !Array.isArray(row.data)) {
    return { id: row.id, ...(row.data as Record<string, unknown>) }
  }
  const { user_id: _u, data: _d, ...rest } = row
  return rest as Record<string, unknown>
}

const TABLES = [
  "tours",
  "venues",
  "saved_venues",
  "saved_artists",
  "email_templates",
  "survey_links",
] as const

async function loadTable(
  supabase: SupabaseClient,
  table: string,
  userId: string,
): Promise<unknown[]> {
  const { data, error } = await supabase.from(table).select("*").eq("user_id", userId)
  if (error) {
    console.error(`loadTable ${table}:`, error.message)
    return []
  }
  return (data || []).map((row) => normalizeRow(row as Record<string, unknown>))
}

async function upsertRow(
  supabase: SupabaseClient,
  table: string,
  userId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const id = payload.id
  if (!id) throw new Error("Missing id in data")
  const { id: _i, user_id: _u, ...rest } = payload
  const row: Record<string, unknown> = {
    id,
    user_id: userId,
    ...rest,
  }
  const { error } = await supabase.from(table).upsert(row, { onConflict: "id" })
  if (error) throw new Error(`${table} upsert: ${error.message}`)
}

async function deleteRow(
  supabase: SupabaseClient,
  table: string,
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id).eq("user_id", userId)
  if (error) throw new Error(`${table} delete: ${error.message}`)
}

async function loadSettings(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()
  if (error && error.code !== "PGRST116") {
    console.warn("user_settings:", error.message)
  }
  if (!data) return { surveyLink: "", sheetId: "" }
  const row = data as Record<string, unknown>
  if (row.data && typeof row.data === "object") {
    const d = row.data as Record<string, unknown>
    return {
      surveyLink: String(d.surveyLink ?? ""),
      sheetId: String(d.sheetId ?? ""),
    }
  }
  return {
    surveyLink: String(row.survey_link ?? row.surveyLink ?? ""),
    sheetId: String(row.sheet_id ?? row.sheetId ?? ""),
  }
}

async function saveSettings(
  supabase: SupabaseClient,
  userId: string,
  settings: { surveyLink?: string; sheetId?: string },
): Promise<void> {
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      survey_link: settings.surveyLink ?? "",
      sheet_id: settings.sheetId ?? "",
      data: settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )
  if (error) throw new Error(`save_settings: ${error.message}`)
}

function randomInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let s = ""
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

async function loadTeamData(supabase: SupabaseClient, userId: string, email: string) {
  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role, teams(id, name, owner_user_id, invite_code, created_at)")
    .eq("user_id", userId)

  const teamsList: unknown[] = []
  const teamIds: string[] = []
  for (const m of memberships || []) {
    const row = m as Record<string, unknown>
    const t = row.teams as Record<string, unknown> | null
    if (t?.id) {
      teamIds.push(String(t.id))
      teamsList.push({
        id: t.id,
        name: t.name,
        ownerUserId: t.owner_user_id,
        inviteCode: t.invite_code,
        createdAt: t.created_at,
        role: row.role,
      })
    }
  }

  let shares: unknown[] = []
  if (teamIds.length) {
    const { data: sh } = await supabase.from("team_shares").select("*").in("team_id", teamIds)
    shares = sh || []
  }

  const sharedTours: unknown[] = []
  const sharedTemplates: unknown[] = []
  const sharedArtists: unknown[] = []

  for (const sh of shares as Record<string, unknown>[]) {
    const ownerId = String(sh.shared_by_user_id)
    const rid = String(sh.resource_id)
    const rt = String(sh.resource_type)
    try {
      if (rt === "tour") {
        const { data } = await supabase.from("tours").select("*").eq("id", rid).eq("user_id", ownerId).maybeSingle()
        if (data) {
          const t = normalizeRow(data as Record<string, unknown>)
          sharedTours.push({
            ...t,
            _shared: true,
            _teamId: sh.team_id,
            _ownerUserId: ownerId,
          })
        }
      } else if (rt === "email_template") {
        const { data } = await supabase
          .from("email_templates")
          .select("*")
          .eq("id", rid)
          .eq("user_id", ownerId)
          .maybeSingle()
        if (data) {
          sharedTemplates.push({
            ...normalizeRow(data as Record<string, unknown>),
            _shared: true,
            _teamId: sh.team_id,
            _ownerUserId: ownerId,
          })
        }
      } else if (rt === "saved_artist") {
        const { data } = await supabase
          .from("saved_artists")
          .select("*")
          .eq("id", rid)
          .eq("user_id", ownerId)
          .maybeSingle()
        if (data) {
          sharedArtists.push({
            ...normalizeRow(data as Record<string, unknown>),
            _shared: true,
            _teamId: sh.team_id,
            _ownerUserId: ownerId,
          })
        }
      }
    } catch (e) {
      console.warn("shared fetch", e)
    }
  }

  let allMembers: unknown[] = []
  if (teamIds.length) {
    const { data: am } = await supabase
      .from("team_members")
      .select("team_id, user_id, email, role, joined_at")
      .in("team_id", teamIds)
    allMembers = am || []
  }

  return {
    teams: teamsList,
    teamMembers: allMembers,
    teamShares: shares,
    sharedTours,
    sharedTemplates,
    sharedArtists,
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization") || ""
    const accessToken = authHeader.replace(/^Bearer\s+/i, "")
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401,
        headers: corsHeaders,
      })
    }

    const user = await verifyGoogle(accessToken)
    const userId = user.sub

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, serviceKey)

    const body = await req.json().catch(() => ({}))
    const action = body.action as string

    if (action === "load_all") {
      const out: Record<string, unknown> = {
        tours: await loadTable(supabase, "tours", userId),
        venues: await loadTable(supabase, "venues", userId),
        savedVenues: await loadTable(supabase, "saved_venues", userId),
        savedArtists: await loadTable(supabase, "saved_artists", userId),
        templates: await loadTable(supabase, "email_templates", userId),
        surveyLinks: await loadTable(supabase, "survey_links", userId),
        settings: await loadSettings(supabase, userId),
      }
      const teamData = await loadTeamData(supabase, userId, user.email)
      Object.assign(out, teamData)
      return new Response(JSON.stringify({ data: out }), { headers: corsHeaders })
    }

    if (action === "upsert") {
      const table = body.table as string
      const data = body.data as Record<string, unknown>
      if (!TABLES.includes(table as (typeof TABLES)[number])) {
        return new Response(JSON.stringify({ error: `Invalid table: ${table}` }), {
          status: 400,
          headers: corsHeaders,
        })
      }
      await upsertRow(supabase, table, userId, data)
      return new Response(JSON.stringify({ data: true }), { headers: corsHeaders })
    }

    if (action === "delete") {
      const table = body.table as string
      const id = body.id as string
      if (!TABLES.includes(table as (typeof TABLES)[number])) {
        return new Response(JSON.stringify({ error: `Invalid table: ${table}` }), {
          status: 400,
          headers: corsHeaders,
        })
      }
      await deleteRow(supabase, table, userId, id)
      return new Response(JSON.stringify({ data: true }), { headers: corsHeaders })
    }

    if (action === "save_settings") {
      const data = body.data as { surveyLink?: string; sheetId?: string }
      await saveSettings(supabase, userId, data)
      return new Response(JSON.stringify({ data: true }), { headers: corsHeaders })
    }

    if (action === "team_create") {
      const name = String(body.name || "").trim()
      if (!name) {
        return new Response(JSON.stringify({ error: "Team name required" }), {
          status: 400,
          headers: corsHeaders,
        })
      }
      let code = randomInviteCode()
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: team, error } = await supabase
          .from("teams")
          .insert({
            name,
            owner_user_id: userId,
            invite_code: code,
          })
          .select()
          .single()
        if (!error && team) {
          await supabase.from("team_members").insert({
            team_id: team.id,
            user_id: userId,
            email: user.email,
            role: "owner",
          })
          return new Response(JSON.stringify({ data: team }), { headers: corsHeaders })
        }
        code = randomInviteCode()
      }
      return new Response(JSON.stringify({ error: "Could not create team" }), {
        status: 500,
        headers: corsHeaders,
      })
    }

    if (action === "team_join") {
      const invite_code = String(body.invite_code || body.inviteCode || "").trim().toUpperCase()
      if (!invite_code) {
        return new Response(JSON.stringify({ error: "invite_code required" }), {
          status: 400,
          headers: corsHeaders,
        })
      }
      const { data: team, error: teamErr } = await supabase
        .from("teams")
        .select("*")
        .eq("invite_code", invite_code)
        .maybeSingle()
      if (teamErr || !team) {
        return new Response(JSON.stringify({ error: "Invalid invite code" }), {
          status: 404,
          headers: corsHeaders,
        })
      }
      const { error: insErr } = await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: userId,
        email: user.email,
        role: "member",
      })
      if (insErr) {
        if (insErr.code === "23505") {
          return new Response(JSON.stringify({ data: team }), { headers: corsHeaders })
        }
        throw new Error(insErr.message)
      }
      return new Response(JSON.stringify({ data: team }), { headers: corsHeaders })
    }

    if (action === "team_share") {
      const team_id = String(body.team_id || "")
      const resource_type = String(body.resource_type || "")
      const resource_id = String(body.resource_id || "")
      if (!team_id || !resource_type || !resource_id) {
        return new Response(JSON.stringify({ error: "team_id, resource_type, resource_id required" }), {
          status: 400,
          headers: corsHeaders,
        })
      }
      const { data: m } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", team_id)
        .eq("user_id", userId)
        .maybeSingle()
      if (!m) {
        return new Response(JSON.stringify({ error: "Not a team member" }), {
          status: 403,
          headers: corsHeaders,
        })
      }
      const { error } = await supabase.from("team_shares").insert({
        team_id,
        resource_type,
        resource_id,
        shared_by_user_id: userId,
      })
      if (error?.code === "23505") {
        return new Response(JSON.stringify({ data: { ok: true } }), { headers: corsHeaders })
      }
      if (error) throw new Error(error.message)
      return new Response(JSON.stringify({ data: { ok: true } }), { headers: corsHeaders })
    }

    if (action === "team_unshare") {
      const team_id = String(body.team_id || "")
      const resource_type = String(body.resource_type || "")
      const resource_id = String(body.resource_id || "")
      const { data: m } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", team_id)
        .eq("user_id", userId)
        .maybeSingle()
      if (!m) {
        return new Response(JSON.stringify({ error: "Not a team member" }), {
          status: 403,
          headers: corsHeaders,
        })
      }
      await supabase
        .from("team_shares")
        .delete()
        .eq("team_id", team_id)
        .eq("resource_type", resource_type)
        .eq("resource_id", resource_id)
      return new Response(JSON.stringify({ data: { ok: true } }), { headers: corsHeaders })
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: corsHeaders,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
