import Stripe from 'https://esm.sh/stripe@14.23.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1) Trae todas las subscriptions relevantes desde Stripe (paginadas)
    let starting_after: string | undefined = undefined;
    const upserts: any[] = [];

    do {
      const page = await stripe.subscriptions.list({
        status: 'all',
        limit: 100,
        starting_after
      });

      for (const s of page.data) {
        const vehicleId =
          s.metadata?.vehicle_id ||
          (s.items?.data?.[0]?.metadata?.vehicle_id ?? null) ||
          null;

        // Si no hay vehicleId específico, busca por user_id
        let targetVehicleId = vehicleId;
        if (!targetVehicleId || targetVehicleId === 'multiple' || targetVehicleId === 'pending') {
          const userId = s.metadata?.user_id;
          if (userId) {
            // Busca el primer vehículo del usuario
            const { data: vehicles } = await supabaseAdmin
              .from('vehicles')
              .select('id')
              .eq('user_id', userId)
              .limit(1);
            
            if (vehicles && vehicles.length > 0) {
              targetVehicleId = vehicles[0].id;
            }
          }
        }

        const periodEndIso = s.current_period_end
          ? new Date(s.current_period_end * 1000).toISOString()
          : null;

        if (targetVehicleId && targetVehicleId !== 'multiple' && targetVehicleId !== 'pending') {
          upserts.push({
            vehicle_id: targetVehicleId,
            stripe_subscription_id: s.id,
            status: s.status,
            current_period_end: periodEndIso,
            cancel_at_period_end: Boolean(s.cancel_at_period_end),
            updated_at: new Date().toISOString(),
          });
        }
      }

      starting_after = page.has_more ? page.data[page.data.length - 1].id : undefined;
    } while (starting_after);

    if (upserts.length) {
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .upsert(upserts, { onConflict: 'vehicle_id' });

      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true, upserts: upserts.length }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(String(e?.message ?? e), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});