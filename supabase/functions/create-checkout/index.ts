import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('create-checkout function called');

  try {
    // Check if Stripe key exists
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is missing');
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    console.log('Stripe key found');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Attempting to authenticate user with token');
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      console.error('User authentication failed:', userError);
      throw new Error('User not authenticated');
    }
    console.log('User authenticated:', userData.user.id);

    const requestBody = await req.json();
    const { priceType, vehicleCount } = requestBody;
    console.log('Request data:', { priceType, vehicleCount });

    // Get user profile to get phone number (since auth is phone-based)
    console.log('Fetching user profile');
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('telefono, phone')
      .eq('user_id', userData.user.id)
      .single();

    if (profileError) {
      console.log('Profile error (might be normal for new users):', profileError);
    }

    const phone = profile?.telefono || profile?.phone || userData.user.phone;
    const userEmail = userData.user.email || `${userData.user.id}@caravel.com`;
    console.log('User contact info:', { phone, email: userEmail });

    console.log('Initializing Stripe');
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Check if customer exists by email or phone
    let customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    // If no customer found by email, try by phone
    if (customers.data.length === 0 && phone) {
      customers = await stripe.customers.list({
        phone: phone,
        limit: 1,
      });
    }

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate price based on vehicle count and type
    let unitAmount;
    if (priceType === 'annual') {
      unitAmount = vehicleCount * 59900; // $599/year per vehicle
    } else {
      unitAmount = vehicleCount * 7900; // $79/month per vehicle
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Protección CARAVEL - ${vehicleCount} vehículo(s)`,
              description: `Suscripción ${priceType === 'annual' ? 'anual' : 'mensual'} para ${vehicleCount} vehículo(s)`,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: priceType === 'annual' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/success`,
      cancel_url: `${req.headers.get('origin')}/cancel`,
    });

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-checkout function:', error);
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