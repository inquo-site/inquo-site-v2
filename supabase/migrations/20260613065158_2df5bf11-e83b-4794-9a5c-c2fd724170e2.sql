
-- 1) ai_agents: restrict column-level SELECT to exclude system_prompt
REVOKE SELECT ON public.ai_agents FROM anon, authenticated;
GRANT SELECT (id, name, description, category, icon, is_premium, is_active, display_order, created_at, updated_at, monthly_price, one_time_price, yearly_price, usd_monthly_price, usd_one_time_price, usd_yearly_price) ON public.ai_agents TO anon, authenticated;

-- 2) user_profiles: replace self-update policy with one that locks sensitive columns
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND plan = (SELECT plan FROM public.user_profiles WHERE user_id = auth.uid())
  AND daily_credits = (SELECT daily_credits FROM public.user_profiles WHERE user_id = auth.uid())
  AND max_daily_credits = (SELECT max_daily_credits FROM public.user_profiles WHERE user_id = auth.uid())
  AND words_used = (SELECT words_used FROM public.user_profiles WHERE user_id = auth.uid())
  AND images_used = (SELECT images_used FROM public.user_profiles WHERE user_id = auth.uid())
);

-- 3) storage.objects policies for private bucket 'inquodata1'
--    File path convention: <auth.uid()>/<filename>
DROP POLICY IF EXISTS "inquodata1 owner select" ON storage.objects;
DROP POLICY IF EXISTS "inquodata1 owner insert" ON storage.objects;
DROP POLICY IF EXISTS "inquodata1 owner update" ON storage.objects;
DROP POLICY IF EXISTS "inquodata1 owner delete" ON storage.objects;
DROP POLICY IF EXISTS "inquodata1 admin all" ON storage.objects;

CREATE POLICY "inquodata1 owner select"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'inquodata1' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "inquodata1 owner insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'inquodata1' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "inquodata1 owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'inquodata1' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'inquodata1' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "inquodata1 owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'inquodata1' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "inquodata1 admin all"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'inquodata1' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'inquodata1' AND public.has_role(auth.uid(), 'admin'));
