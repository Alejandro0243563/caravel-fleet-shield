import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders, status: 200 });
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Get the requester's token to check if they are an admin
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'No authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user: requester }, error: requesterError } = await supabaseAdmin.auth.getUser(token);

        if (requesterError || !requester) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Check if requester is admin
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('user_id', requester.id)
            .single();

        if (profileError || profile?.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Forbidden: Only admins can create users' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { telefono, role, full_name, email } = await req.json();

        if (!telefono) {
            return new Response(JSON.stringify({ error: 'Telefono is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Create user with phone auto-confirmed
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            phone: telefono,
            phone_confirm: true,
            user_metadata: { telefono, full_name, email },
        });

        if (createError) {
            return new Response(JSON.stringify({ error: createError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // The profile will be created by the database trigger `on_auth_user_created`
        // Wait a bit or update it manually to ensure role is correct if not default
        if (userData?.user?.id) {
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    role: role || 'cliente',
                    full_name: full_name || null,
                    email: email || null
                })
                .eq('user_id', userData.user.id);

            if (updateError) {
                console.error('Error updating profile:', updateError);
            }
        }

        return new Response(JSON.stringify({ user: userData.user }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
