import Stripe from 'https://esm.sh/stripe@14.23.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

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
    const { session_id } = await req.json();
    if (!session_id) return new Response('Missing session_id', { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription']
    });

    const sub = session.subscription as Stripe.Subscription | null;
    if (!sub) return new Response('No subscription on session', { status: 400 });

    // intenta extraer vehicle_id de varios lugares
    const vehicleId =
      sub.metadata?.vehicle_id ||
      (sub.items?.data?.[0]?.metadata?.vehicle_id ?? null) ||
      session.metadata?.vehicle_id ||
      null;

    // Si no hay vehicle_id específico, busca vehículos del usuario
    let targetVehicleId = vehicleId;
    if (!targetVehicleId || targetVehicleId === 'multiple' || targetVehicleId === 'pending') {
      const userId = sub.metadata?.user_id || session.client_reference_id;
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

    if (!targetVehicleId || targetVehicleId === 'multiple' || targetVehicleId === 'pending') {
      return new Response('Missing vehicle_id metadata', { status: 400 });
    }

    const periodEndIso = sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        vehicle_id: targetVehicleId,
        stripe_subscription_id: sub.id,
        status: sub.status, // 'active' | 'trialing' | 'past_due' | 'unpaid' | 'canceled'...
        current_period_end: periodEndIso,
        cancel_at_period_end: Boolean(sub.cancel_at_period_end),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'vehicle_id' });

    if (error) return new Response(error.message, { status: 500 });

    // Send email notification
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        const amount = session.amount_total ? (session.amount_total / 100).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : 'N/A';
        const customerEmail = session.customer_details?.email || 'No email provided';

        await resend.emails.send({
          from: 'Caravel Notificaciones <noreply@caravel.com.mx>', // Update this to your verified domain
          to: ['caravel@gmail.com', 'acalderoncha@gmail.com', 'santiagocalderonchavez@gmail.com'],
          subject: '💰 Nuevo Pago Recibido - Caravel Fleet Shield',
          html: `
            <h1>Nuevo Pago Confirmado</h1>
            <p>Se ha recibido un nuevo pago de suscripción.</p>
            <ul>
              <li><strong>Monto:</strong> ${amount}</li>
              <li><strong>Cliente:</strong> ${customerEmail}</li>
              <li><strong>Vehículo ID:</strong> ${targetVehicleId}</li>
              <li><strong>Estado:</strong> ${sub.status}</li>
              <li><strong>ID de Suscripción:</strong> ${sub.id}</li>
            </ul>
            <p>Verifica los detalles en el Dashboard Administrativo.</p>
          `
        });
        console.log('Email notification sent successfully');
      } else {
        console.log('RESEND_API_KEY not found, skipping email notification');
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email fails, just log it
    }

    return new Response(JSON.stringify({ ok: true }), {
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
