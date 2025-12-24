-- Add document management columns to vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS documents_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS additional_documents JSONB DEFAULT '[]'::jsonb;

-- Comment on columns for better understanding
COMMENT ON COLUMN public.vehicles.documents_enabled IS 'Indicates if the admin has enabled additional document uploads for this vehicle';
COMMENT ON COLUMN public.vehicles.additional_documents IS 'List of additional documents uploaded by the client, stored as JSON objects with name and url';
