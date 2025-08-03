import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VehicleData {
  circulationCardFile: File;
  ownerIneFile?: File;
  isCorporate: boolean;
  sameOwnerAs?: number;
}

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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const { vehicles } = await req.json();
    console.log('Saving vehicles for user:', userData.user.id);

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
        
        // Determine file extension from mime type or default to pdf
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
          throw new Error(`Error uploading circulation card: ${circulationError.message}`);
        }
        
        circulationCardUrl = circulationUpload.path;
      }

      // Upload INE if provided
      let ineUrl = null;
      if (vehicleData.ownerIneBase64) {
        const ineBlob = new Uint8Array(
          atob(vehicleData.ownerIneBase64)
            .split('')
            .map(char => char.charCodeAt(0))
        );
        
        // Determine file extension from mime type or default to pdf
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
          throw new Error(`Error uploading INE: ${ineError.message}`);
        }
        
        ineUrl = ineUpload.path;
      }

      // Extract license plate from circulation card filename or use index
      const licensePlate = vehicleData.licensePlate || `TEMP-${Date.now()}-${i}`;

      // Save vehicle to database
      const { data: vehicle, error: vehicleError } = await supabaseClient
        .from('vehicles')
        .insert({
          user_id: userData.user.id,
          license_plate: licensePlate,
          circulation_card_url: circulationCardUrl,
          ine_url: ineUrl,
          es_persona_moral: vehicleData.isCorporate || false,
          status: 'En revisión'
        })
        .select()
        .single();

      if (vehicleError) {
        console.error('Error saving vehicle:', vehicleError);
        throw new Error(`Error saving vehicle: ${vehicleError.message}`);
      }

      savedVehicles.push(vehicle);
    }

    console.log('Successfully saved vehicles:', savedVehicles.length);

    return new Response(
      JSON.stringify({
        success: true,
        vehicles: savedVehicles,
        message: `Successfully saved ${savedVehicles.length} vehicle(s)`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in save-vehicles function:', error);
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