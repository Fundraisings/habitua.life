// ==========================================================================
// CONFIGURACIÓN — reemplazar con tus valores reales antes de publicar
// ==========================================================================
const SUPABASE_URL = 'https://wwnyjfftrujydapeqxxx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eJPhRFf1ejrhwYTooJYMJA_DI6_bMz0';

// Link del producto gratuito en Payhip (checkout que entrega el ebook)
// TODO Tom: reemplazar con el link real del producto "Diseño de Entorno" en Payhip
const PAYHIP_URL = 'https://payhip.com/b/REEMPLAZAR';

// Si tu plan de Payhip permite pre-rellenar el correo por URL, cambia esto a true
// y ajusta PAYHIP_EMAIL_PARAM al nombre exacto del parámetro que use Payhip.
const PAYHIP_PREFILL_EMAIL = false;
const PAYHIP_EMAIL_PARAM = 'email';

// ==========================================================================
// ESTADO DEL QUIZ
// ==========================================================================
let currentStep = 1;
const totalQuestionSteps = 4; // energía, claridad, entorno, tiempo
const scores = { energia: null, claridad: null, entorno: null, tiempo: null };

const PILLARS = {
  energia: {
    label: '⚡ Energía & Bienestar Físico',
    fortaleza: 'Tu cuerpo ya te está sosteniendo — tienes una base sólida para construir sobre ella.',
    oportunidad: 'Tu energía es el motor de todo lo demás. Un pequeño ajuste aquí puede destrabar el resto.'
  },
  claridad: {
    label: '🧠 Claridad Mental & Enfoque',
    fortaleza: 'Tienes una mente que sabe filtrar el ruido — eso es más raro de lo que crees.',
    oportunidad: 'Tu mente está pidiendo espacio. No es falta de disciplina, es falta de silencio.'
  },
  entorno: {
    label: '🌿 Entorno & Constancia',
    fortaleza: 'Tu entorno ya está trabajando a tu favor — eso hace que la constancia se sienta natural.',
    oportunidad: 'Tu entorno tiene más poder sobre tus hábitos del que imaginas. Ahí está tu punto de apalancamiento.'
  },
  tiempo: {
    label: '✨ Tiempo con Propósito',
    fortaleza: 'Sabes proteger tu tiempo para lo que de verdad importa — no todos lo logran.',
    oportunidad: 'Tu tiempo se está yendo en piloto automático. Recuperarlo empieza con una decisión pequeña, no con una revolución.'
  }
};

// Orden fijo para desempatar (si hay empate en el más bajo, gana el primero en este orden)
const PILLAR_ORDER = ['energia', 'claridad', 'entorno', 'tiempo'];

// ==========================================================================
// NAVEGACIÓN DEL QUIZ
// ==========================================================================
function selectScore(field, value) {
  scores[field] = value;

  // Marca visualmente el botón elegido dentro del paso actual
  const currentStepEl = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
  if (currentStepEl) {
    currentStepEl.querySelectorAll('.score-btn').forEach((btn) => btn.classList.remove('selected'));
    const clicked = [...currentStepEl.querySelectorAll('.score-btn')].find(
      (btn) => parseInt(btn.textContent, 10) === value
    );
    if (clicked) clicked.classList.add('selected');
  }

  // Pequeña pausa para que se vea la selección antes de avanzar
  setTimeout(() => {
    if (currentStep === totalQuestionSteps) {
      renderResult();
    }
    nextStep();
  }, 150);
}

function nextStep() {
  const totalSteps = 6;
  if (currentStep >= totalSteps) return;

  const current = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
  if (current) current.classList.add('hidden');

  currentStep++;

  const next = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
  if (next) next.classList.remove('hidden');

  updateStepIndicator();
}

function updateStepIndicator() {
  const indicator = document.getElementById('step-indicator');
  if (!indicator) return;

  if (currentStep <= totalQuestionSteps) {
    indicator.innerText = `Paso ${currentStep} de ${totalQuestionSteps}`;
  } else if (currentStep === 5) {
    indicator.innerText = '✨ Tu Resultado';
  } else {
    indicator.innerText = 'Paso Final';
  }
}

// ==========================================================================
// RESULTADO DINÁMICO (fortaleza / oportunidad)
// ==========================================================================
function renderResult() {
  let strongest = PILLAR_ORDER[0];
  let weakest = PILLAR_ORDER[0];

  PILLAR_ORDER.forEach((key) => {
    if (scores[key] > scores[strongest]) strongest = key;
    if (scores[key] < scores[weakest]) weakest = key;
  });

  document.getElementById('result-strength-title').textContent = PILLARS[strongest].label;
  document.getElementById('result-strength-text').textContent = PILLARS[strongest].fortaleza;
  document.getElementById('result-opportunity-title').textContent = PILLARS[weakest].label;
  document.getElementById('result-opportunity-text').textContent = PILLARS[weakest].oportunidad;
}

// ==========================================================================
// ENVÍO FINAL: guarda en Supabase (silencioso) + redirige a Payhip
// ==========================================================================
async function submitEmail() {
  const emailInput = document.getElementById('email-input');
  const submitBtn = document.getElementById('submit-btn');
  const errorMessage = document.getElementById('error-message');
  const email = emailInput.value.trim();

  errorMessage.classList.add('hidden');

  if (!email || !email.includes('@')) {
    errorMessage.textContent = 'Ingresa un correo válido para continuar.';
    errorMessage.classList.remove('hidden');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Guardando...';

  // Guardado silencioso en Supabase — si falla, no bloquea la entrega del ebook
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        email: email,
        score_energia: scores.energia,
        score_claridad: scores.claridad,
        score_entorno: scores.entorno,
        score_tiempo: scores.tiempo
      })
    });
  } catch (err) {
    console.error('No se pudo guardar el lead en Supabase:', err);
    // Continúa igual — el usuario no debe perder su ebook por un fallo de backend
  }

  showSuccessAndRedirect(email);
}

function buildPayhipUrl(email) {
  if (!PAYHIP_PREFILL_EMAIL) return PAYHIP_URL;
  const separator = PAYHIP_URL.includes('?') ? '&' : '?';
  return `${PAYHIP_URL}${separator}${PAYHIP_EMAIL_PARAM}=${encodeURIComponent(email)}`;
}

function showSuccessAndRedirect(email) {
  const form = document.getElementById('clarity-quiz-form');
  const success = document.getElementById('success-message');
  const fallbackLink = document.getElementById('fallback-link');
  const destination = buildPayhipUrl(email);

  form.classList.add('hidden');
  success.classList.remove('hidden');
  fallbackLink.href = destination;

  setTimeout(() => {
    window.location.href = destination;
  }, 900);
}
