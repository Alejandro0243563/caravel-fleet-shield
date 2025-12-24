-- Create a new RLS policy to allow admins to update all user profiles
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Also allow admins to delete profiles if needed
CREATE POLICY "Admins can delete all profiles" 
ON public.profiles 
FOR DELETE 
USING (public.get_current_user_role() = 'admin');

-- Ensure admins can insert profiles (though usually handled by trigger)
CREATE POLICY "Admins can insert all profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.get_current_user_role() = 'admin');
