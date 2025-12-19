import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AppointmentConfirmationRequest {
  appointmentId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);

    const { appointmentId }: AppointmentConfirmationRequest = await req.json();
    console.log("Processing appointment confirmation for:", appointmentId);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch appointment details with related data
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select(`
        id,
        date,
        time,
        patient_name,
        patient_email,
        cancellation_token,
        shift_name,
        professionals:professional_id (name, specialty),
        clinics:clinic_id (name, phone, address, email)
      `)
      .eq("id", appointmentId)
      .single();

    if (fetchError || !appointment) {
      console.error("Error fetching appointment:", fetchError);
      return new Response(
        JSON.stringify({ error: "Appointment not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Appointment data:", appointment);

    const professional = appointment.professionals as unknown as { name: string; specialty: string };
    const clinic = appointment.clinics as unknown as { name: string; phone: string | null; address: string | null; email: string | null };

    // Format date
    const dateObj = new Date(appointment.date + "T00:00:00");
    const formattedDate = dateObj.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Format time
    const formattedTime = appointment.time.slice(0, 5);

    // Build cancellation URL
    const baseUrl = Deno.env.get("SITE_URL") || "https://agendaberta.lovable.app";
    const cancelUrl = `${baseUrl}/cancelar-agendamento?token=${appointment.cancellation_token}`;

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmação de Agendamento</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background-color: #22c55e; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <span style="font-size: 30px;">✓</span>
                </div>
                <h1 style="color: #111827; font-size: 24px; margin: 0;">Agendamento Confirmado!</h1>
              </div>
              
              <!-- Greeting -->
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Olá <strong>${appointment.patient_name}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Seu agendamento foi confirmado com sucesso. Confira os detalhes abaixo:
              </p>
              
              <!-- Appointment Details -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Clínica</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${clinic.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Profissional</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${professional.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Especialidade</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${professional.specialty}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Data</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Horário</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${formattedTime}${appointment.shift_name ? ` (${appointment.shift_name})` : ""}</td>
                  </tr>
                  ${clinic.address ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Endereço</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${clinic.address}</td>
                  </tr>
                  ` : ""}
                  ${clinic.phone ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Telefone</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${clinic.phone}</td>
                  </tr>
                  ` : ""}
                </table>
              </div>
              
              <!-- Cancel Link -->
              <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
                  Precisa cancelar este agendamento?
                </p>
                <a href="${cancelUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
                  Cancelar Agendamento
                </a>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px;">
                  Este email foi enviado por ${clinic.name} através do Agendaberta.
                </p>
              </div>
              
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Agendaberta <noreply@agendaberta.com.br>",
      to: [appointment.patient_email],
      subject: `Agendamento confirmado - ${clinic.name}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
