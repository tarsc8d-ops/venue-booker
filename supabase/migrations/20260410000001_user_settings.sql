-- Optional settings row per user (used when load_all / save_settings runs in Edge Function)

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id text PRIMARY KEY,
  survey_link text DEFAULT '',
  sheet_id text DEFAULT '',
  data jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_settings_no_direct" ON public.user_settings FOR ALL USING (false);
