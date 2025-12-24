-- Add legal_documents column to fines table for document tracking
ALTER TABLE public.fines 
ADD COLUMN IF NOT EXISTS legal_documents JSONB DEFAULT '[]'::jsonb;

-- Comment on column for better understanding
COMMENT ON COLUMN public.fines.legal_documents IS 'List of legal documents (PDFs, images) related to the fine case, stored as JSON objects with name and url';
