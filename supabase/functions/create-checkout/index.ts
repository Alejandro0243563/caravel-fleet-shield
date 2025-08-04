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
    const { priceType, vehicleCount, vehicles } = requestBody;
    console.log('Request data:', { priceType, vehicleCount, vehiclesCount: vehicles?.length });

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
    const formattedPhone = phone ? `+${phone}` : null;
    const userEmail = userData.user.email || `${userData.user.id}@caravel.com`;
    console.log('User contact info:', { phone, formattedPhone, email: userEmail });

    console.log('Initializing Stripe');
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    console.log('Searching for existing Stripe customer by email');
    // Check if customer exists by email only (phone search not supported by Stripe API)
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });
    console.log('Customer search by email result:', customers.data.length);

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('Using existing customer:', customerId);
    } else {
      console.log('No existing customer found, will create new one during checkout');
    }

    // Calculate price based on vehicle count and type
    console.log('Calculating prices for:', { priceType, vehicleCount });
    let unitAmount;
    if (priceType === 'annual') {
      unitAmount = vehicleCount * 59900; // $599/year per vehicle
    } else {
      unitAmount = vehicleCount * 7900; // $79/month per vehicle
    }
    console.log('Calculated unit amount:', unitAmount);

    console.log('Creating Stripe checkout session');
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

    // Save vehicles before payment if provided
    if (vehicles && vehicles.length > 0) {
      console.log('Saving vehicles before payment');
      try {
        const savedVehicles = [];

        for (let i = 0; i < vehicles.length; i++) {
          const vehicleData = vehicles[i];
          
          // Upload circulation card
          let circulationCardUrl = null;
          if (vehicleData.circulationCardBase64) {
            const circulationCardBlob = new Uint8Array(
              atob(vehicleData.circulationCardBase64)
                .split('')
                .map(char => char.charCodeAt(0))
            );
            
            const fileExtension = vehicleData.circulationCardMimeType ? 
              (vehicleData.circulationCardMimeType.includes('image') ? 'jpg' : 'pdf') : 'pdf';
            const contentType = vehicleData.circulationCardMimeType || 'application/pdf';
            
            const circulationFileName = `${userData.user.id}/circulation_${Date.now()}_${i}.${fileExtension}`;
            const { data: circulationUpload, error: circulationError } = await supabaseClient.storage
              .from('documents')
              .upload(circulationFileName, circulationCardBlob, {
                contentType: contentType,
                upsert: false
              });

            if (circulationError) {
              console.error('Error uploading circulation card:', circulationError);
            } else {
              circulationCardUrl = circulationUpload.path;
            }
          }

          // Upload INE if provided
          let ineUrl = null;
          if (vehicleData.ownerIneBase64) {
            const ineBlob = new Uint8Array(
              atob(vehicleData.ownerIneBase64)
                .split('')
                .map(char => char.charCodeAt(0))
            );
            
            const fileExtension = vehicleData.ownerIneMimeType ? 
              (vehicleData.ownerIneMimeType.includes('image') ? 'jpg' : 'pdf') : 'pdf';
            const contentType = vehicleData.ownerIneMimeType || 'application/pdf';
            
            const ineFileName = `${userData.user.id}/ine_${Date.now()}_${i}.${fileExtension}`;
            const { data: ineUpload, error: ineError } = await supabaseClient.storage
              .from('documents')
              .upload(ineFileName, ineBlob, {
                contentType: contentType,
                upsert: false
              });

            if (ineError) {
              console.error('Error uploading INE:', ineError);
            } else {
              ineUrl = ineUpload.path;
            }
          }

          const licensePlate = vehicleData.licensePlate || `TEMP-${Date.now()}-${i}`;

          // Save vehicle to database with 'Pago pendiente' status
          const { data: vehicle, error: vehicleError } = await supabaseClient
            .from('vehicles')
            .insert({
              user_id: userData.user.id,
              license_plate: licensePlate,
              circulation_card_url: circulationCardUrl,
              ine_url: ineUrl,
              es_persona_moral: vehicleData.isCorporate || false,
              status: 'Pago pendiente'
            })
            .select()
            .single();

          if (vehicleError) {
            console.error('Error saving vehicle:', vehicleError);
          } else {
            savedVehicles.push(vehicle);
          }
        }

        console.log('Successfully saved vehicles before payment:', savedVehicles.length);
      } catch (error) {
        console.error('Error saving vehicles before payment:', error);
      }
    }

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