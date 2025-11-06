-- Add admin RLS policies for user_profiles table
-- This allows admins to view and manage all user profiles

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any profile (for user management)
CREATE POLICY "Admins can delete any profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));