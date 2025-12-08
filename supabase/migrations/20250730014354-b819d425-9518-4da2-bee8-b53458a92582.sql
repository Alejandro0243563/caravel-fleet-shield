-- Update profiles table for SMS-based authentication
-- Remove email dependency and add new fields for better vehicle management
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefono TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMPTZ DEFAULT now();

-- Update vehicles table with new document fields
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS es_persona_moral BOOLEAN DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS ine_url TEXT;

-- Create new table for SMS verification codes (OTP)
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefono TEXT NOT NULL,
  code TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on verification_codes
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for verification codes
CREATE POLICY "Anyone can insert verification codes" 
ON public.verification_codes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own verification codes" 
ON public.verification_codes 
FOR SELECT 
USING (telefono = (SELECT telefono FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can update verification codes" 
ON public.verification_codes 
FOR UPDATE 
USING (true);

-- Update the handle_new_user function to work with phone-based auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, telefono, role, fecha_registro)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'telefono', NEW.phone),
    'cliente',
    now()
  );
  RETURN NEW;
END;
$function$;