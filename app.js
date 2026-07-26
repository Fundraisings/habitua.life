const SUPABASE_URL = 'https://wwnyjfftrujydapeqxxx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eJPhRFf1ejrhwYTooJYMJA_DI6_bMz0';

// 🔑 Pega aquí tu API Key de Resend (empieza por re_...)
const RESEND_API_KEY = 'PEGA_AQUI_TU_RESEND_API_KEY';

document.addEventListener('DOMContentLoaded', () => {
  const waitlistForm = document.getElementById('waitlist-form');
  const emailInput = document.getElementById('email-input');
  const successMessage = document.getElementById('success-message');

  if (waitlistForm) {
    waitlistForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = emailInput.value.trim();
      if (!email) return;

      try {
        // 1. Guardar el correo en Supabase
        const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ email: email })
        });

        if (dbResponse.ok) {
          // Mostrar mensaje de éxito inmediatamente
          waitlistForm.classList.add('hidden');
          successMessage.classList.remove('hidden');

          // 2. Enviar el correo de bienvenida vía Resend
          sendWelcomeEmail(email);

        } else {
          const errorData = await dbResponse.json().catch(() => ({}));
          
          if (dbResponse.status === 409 || (errorData.message && errorData.message.includes('unique'))) {
            alert('¡Este correo ya está registrado en la lista VIP!');
          } else {
            alert('Hubo un inconveniente al guardar. Por favor intenta nuevamente.');
          }
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        alert('Error de conexión. Por favor intenta de nuevo.');
      }
    });
  }
});

// Función para enviar el correo directamente a la API de Resend
async function sendWelcomeEmail(userEmail) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Habitua <hola@habitua.life>',
        to: [userEmail],
        subject: '✨ Tu lugar como Fundadora en habitua.life está reservado',
        html: `
          <div style="font-family: sans-serif; color: #2C2A29; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FDFBF7; border-radius: 16px; border: 1px solid #EFECE6;">
            <h2 style="font-family: Georgia, serif; color: #2D3A2F; font-size: 26px; margin-bottom: 20px;">¡Hola! 🌿</h2>
            <p style="line-height: 1.6; font-size: 15px; color: #4A4745;">
              Qué alegría darte la bienvenida al grupo oficial de <strong>Fundadoras de habitua.life</strong>.
            </p>
            <p style="line-height: 1.6; font-size: 15px; color: #4A4745;">
              Diseñamos Habitua porque nos cansamos de las agendas estáticas que ignoran cómo nos sentimos cada día. Queríamos un sistema inteligente que se adapte a tu energía, traiga claridad a tus finanzas y te acompañe en tu crecimiento sin agotamiento.
            </p>
            <div style="background-color: #F0F4EC; padding: 20px; border-radius: 12px; color: #4A5D4E; margin: 25px 0;">
              <p style="margin: 0; font-weight: bold; font-size: 15px;">🐾 Tu impacto con nosotros:</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; line-height: 1.5;">
                Cada hábito que completes dentro de la plataforma contribuirá a financiar alimento y atención médica para animales en refugios y fundaciones.
              </p>
            </div>
            <h3 style="font-family: Georgia, serif; color: #2D3A2F; font-size: 18px; margin-top: 25px;">🌸 ¿Qué recibes como Fundadora?</h3>
            <ul style="line-height: 1.8; font-size: 14px; color: #4A4745; padding-left: 20px;">
              <li><strong>Acceso Preferente Prioritario:</strong> Serás de las primeras personas en probar la plataforma.</li>
              <li><strong>30% de Descuento Vitalicio:</strong> Tarifa preferencial garantizada de por vida.</li>
              <li><strong>Voz en la Comunidad:</strong> Podrás darnos feedback para priorizar las herramientas que necesitas.</li>
            </ul>
            <p style="line-height: 1.6; font-size: 15px; color: #4A4745; margin-top: 25px;">
              Te avisaremos por este mismo medio tan pronto abramos el primer lote de accesos.
            </p>
            <hr style="border: none; border-top: 1px solid #EFECE6; margin: 30px 0;" />
            <p style="font-size: 13px; color: #8C8581; margin: 0;">
              Con cariño,<br>
              <strong style="color: #2C2A29;">El equipo de Habitua</strong><br>
              <em>habitua.life — Un producto del ecosistema Altrua.</em>
            </p>
          </div>
        `
      })
    });

    const data = await res.json();
    console.log('Respuesta de Resend:', data);
  } catch (err) {
    console.error('Error al enviar con Resend:', err);
  }
}
