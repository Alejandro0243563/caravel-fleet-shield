import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { urlOrPath, expiresIn } = req.body || {};

    if (!urlOrPath || typeof urlOrPath !== 'string') {
      res.status(400).json({ error: 'Invalid urlOrPath' });
      return;
    }

    if (/^https?:\/\//i.test(urlOrPath)) {
      res.status(200).json({ signedUrl: urlOrPath });
      return;
    }

    if (urlOrPath.includes('..')) {
      res.status(400).json({ error: 'Invalid path' });
      return;
    }

    const [bucket, ...rest] = urlOrPath.split('/');
    const objectPath = rest.join('/');

    if (!bucket || !objectPath) {
      res.status(400).json({ error: 'Path must be in the form bucket/path/to/object' });
      return;
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      res.status(500).json({ error: 'Server not configured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
      return;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(objectPath, typeof expiresIn === 'number' ? expiresIn : 300);

    if (error || !data?.signedUrl) {
      res.status(500).json({ error: error?.message || 'Failed to create signed URL' });
      return;
    }

    res.status(200).json({ signedUrl: data.signedUrl });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}