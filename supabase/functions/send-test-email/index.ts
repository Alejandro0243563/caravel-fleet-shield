import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
            throw new Error('RESEND_API_KEY is not set');
        }

        const resend = new Resend(resendApiKey);

        const { data, error } = await resend.emails.send({
            from: 'Caravel Test <onboarding@resend.dev>',
            to: ['caravel@gmail.com', 'acalderoncha@gmail.com', 'santiagocalderonchavez@gmail.com'],
            subject: '🧪 Prueba de Notificación - Caravel',
            html: `
        <h1>Correo de Prueba</h1>
        <p>Esta es una prueba para verificar la configuración de Resend.</p>
        <p>Si recibes esto, ¡el sistema de notificaciones está funcionando correctamente!</p>
        <hr />
        <p><small>Enviado desde Caravel Admin Dashboard</small></p>
      `
        });

        if (error) {
            throw error;
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
