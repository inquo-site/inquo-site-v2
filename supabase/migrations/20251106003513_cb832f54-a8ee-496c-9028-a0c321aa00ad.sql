-- Update handle_new_user function to support all auth methods (email, phone, Google, etc.)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Insert profile with email OR phone
  INSERT INTO public.user_profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.phone),  -- Use phone if email is null
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'User'
    )
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;