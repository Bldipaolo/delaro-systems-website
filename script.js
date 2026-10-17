const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
const navLinks = [...document.querySelectorAll('[data-section-link]')];
const contactForm = document.querySelector('[data-contact-form]');

const syncHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
};

const closeMenu = ({ returnFocus = false } = {}) => {
  if (!navigation || !menuToggle) return;
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  if (returnFocus) menuToggle.focus();
};

menuToggle?.addEventListener('click', () => {
  if (!navigation) return;
  const isOpen = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) navigation.querySelector('a')?.focus();
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => closeMenu());
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation?.classList.contains('is-open')) {
    closeMenu({ returnFocus: true });
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 820) closeMenu();
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle('is-current', link.dataset.sectionLink === entry.target.id);
    });
  });
}, { rootMargin: '-30% 0px -60%', threshold: 0 });

navLinks.forEach((link) => {
  const section = document.getElementById(link.dataset.sectionLink);
  if (section) sectionObserver.observe(section);
});

if (contactForm) {
  const startedAt = contactForm.querySelector('[data-started-at]');
  const status = contactForm.querySelector('[data-form-status]');
  const submit = contactForm.querySelector('button[type="submit"]');
  const submitLabel = contactForm.querySelector('[data-submit-label]');

  const markStarted = () => {
    if (startedAt) startedAt.value = String(Date.now());
  };

  const clearErrors = () => {
    contactForm.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
    contactForm.querySelectorAll('.field-error').forEach((error) => { error.textContent = ''; });
    status.textContent = '';
    status.className = 'form-status';
  };

  const showErrors = (fields = {}) => {
    Object.entries(fields).forEach(([name, message]) => {
      const field = contactForm.elements.namedItem(name);
      const error = document.getElementById(`${name}-error`);
      field?.setAttribute('aria-invalid', 'true');
      if (error) error.textContent = message;
    });
    const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
  };

  markStarted();

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();

    const fields = {};
    for (const name of ['name', 'email', 'company', 'challenge']) {
      const field = contactForm.elements.namedItem(name);
      if (!field.checkValidity()) fields[name] = field.validity.typeMismatch ? 'Enter a valid work email.' : 'Complete this field.';
    }
    if (contactForm.elements.namedItem('challenge').value.trim().length < 30) fields.challenge = 'Describe the operational challenge in at least 30 characters.';

    if (Object.keys(fields).length) {
      showErrors(fields);
      status.textContent = 'Review the highlighted fields.';
      status.classList.add('is-error');
      return;
    }

    submit.disabled = true;
    contactForm.setAttribute('aria-busy', 'true');
    submitLabel.textContent = 'Sending…';
    status.textContent = 'Sending your inquiry…';

    const payload = Object.fromEntries(new FormData(contactForm).entries());

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({ ok: false, message: 'The service returned an unexpected response.' }));
      if (!response.ok || !result.ok) {
        showErrors(result.fields);
        throw new Error(result.message || 'Your inquiry could not be delivered.');
      }
      contactForm.reset();
      markStarted();
      status.textContent = result.message;
      status.classList.add('is-success');
    } catch (error) {
      status.textContent = error.message || 'Your inquiry could not be delivered. Please try again.';
      status.classList.add('is-error');
    } finally {
      submit.disabled = false;
      contactForm.removeAttribute('aria-busy');
      submitLabel.textContent = 'Send Inquiry';
    }
  });
}

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });
