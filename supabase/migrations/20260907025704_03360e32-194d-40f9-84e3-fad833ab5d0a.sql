CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.admin_users TO service_role;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages admin users" ON public.admin_users FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO public.admin_users (username, password_hash, label)
VALUES ('iotadmin@123', '9aef9a45250f03b66ca32e3908befb9de3fbc47aef635e155c77d4a289ec4937', 'Primary organiser');

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS details_sent_at timestamptz;

GRANT ALL ON public.registrations TO service_role;