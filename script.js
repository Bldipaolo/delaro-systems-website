const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
const navLinks = [...document.querySelectorAll('[data-section-link]')];

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

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });
