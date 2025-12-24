-- Add full_name and email to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Comment on columns
COMMENT ON COLUMN public.profiles.full_name IS 'Full name of the user';
COMMENT ON COLUMN public.profiles.email IS 'Email address for information only';
