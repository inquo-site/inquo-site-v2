
CREATE TABLE public.company_directives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  directive text NOT NULL,
  ceo_plan jsonb,
  team_outputs jsonb,
  final_report text,
  status text NOT NULL DEFAULT 'pending',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_directives TO authenticated;
GRANT ALL ON public.company_directives TO service_role;

ALTER TABLE public.company_directives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view directives" ON public.company_directives
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert directives" ON public.company_directives
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

CREATE POLICY "Admins update directives" ON public.company_directives
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete directives" ON public.company_directives
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
