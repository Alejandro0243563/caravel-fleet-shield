-- Fix security warning: Function Search Path Mutable
-- Update the handle_new_user function to have a proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'cliente'
  );
  RETURN NEW;
END;
$$;

-- Create security definer function to get current user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE 
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Update RLS policies to use the security definer function to prevent recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can manage all vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Admins can view all fines" ON public.fines;
DROP POLICY IF EXISTS "Admins can manage all fines" ON public.fines;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can manage all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all vehicles" 
ON public.vehicles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all vehicles" 
ON public.vehicles 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all fines" 
ON public.fines 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all fines" 
ON public.fines 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all leads" 
ON public.leads 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all leads" 
ON public.leads 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' AND 
  public.get_current_user_role() = 'admin'
);