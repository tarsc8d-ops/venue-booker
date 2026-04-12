-- Team collaboration tables (VenBook). Core venue tables are managed separately; Edge Function uses service role.

CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_user_id text NOT NULL,
  invite_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  email text,
  role text NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

CREATE TABLE IF NOT EXISTS public.team_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('tour', 'email_template', 'saved_artist')),
  resource_id text NOT NULL,
  shared_by_user_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_team_shares_team ON public.team_shares(team_id);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_shares ENABLE ROW LEVEL SECURITY;

-- Direct client access is not used (only Edge Function with service role). Deny public access.
CREATE POLICY "teams_no_direct" ON public.teams FOR ALL USING (false);
CREATE POLICY "team_members_no_direct" ON public.team_members FOR ALL USING (false);
CREATE POLICY "team_shares_no_direct" ON public.team_shares FOR ALL USING (false);
