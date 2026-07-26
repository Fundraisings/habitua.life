const SUPABASE_URL = 'https://wwnyjfftrujydapeqxxx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eJPhRFf1ejrhwYTooJYMJA_DI6_bMz0';

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
        const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ email: email })
        });

        if (response.ok) {
          waitlistForm.classList.add('hidden');
          successMessage.classList.remove('hidden');
        } else {
          const errorData = await response.json().catch(() => ({}));
          
          // Manejo de correo ya existente
          if (response.status === 409 || (errorData.message && errorData.message.includes('unique'))) {
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
