// Lógica para capturar el formulario de la lista de espera
document.addEventListener('DOMContentLoaded', () => {
  const waitlistForm = document.getElementById('waitlist-form');
  const emailInput = document.getElementById('email-input');
  const successMessage = document.getElementById('success-message');

  if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = emailInput.value.trim();

      if (email) {
        // Ocultar formulario y mostrar confirmación
        waitlistForm.classList.add('hidden');
        successMessage.classList.remove('hidden');

        console.log('Nuevo registro en la lista VIP de habitua.life:', email);
        // Aquí conectarás más adelante tu base de datos o servicio de correo (Ej. Supabase, Mailchimp, Resend, etc.)
      }
    });
  }
});
