import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { userId } = await req.json();
    console.log('Updating vehicle status for user:', userId);

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Update all pending payment vehicles to "En revisión"
    const { data, error } = await supabaseClient
      .from('vehicles')
      .update({ status: 'En revisión' })
      .eq('user_id', userId)
      .eq('status', 'Pago pendiente')
      .select();

    if (error) {
      console.error('Error updating vehicle status:', error);
      throw new Error(`Error updating vehicle status: ${error.message}`);
    }

    console.log('Successfully updated vehicles:', data?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        updatedVehicles: data?.length || 0,
        message: `Successfully updated ${data?.length || 0} vehicle(s) status`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in update-vehicle-status function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});