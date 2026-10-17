const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
const navLinks = [...document.querySelectorAll('[data-section-link]')];
const contactForm = document.querySelector('[data-contact-form]');
const mediaStages = [...document.querySelectorAll('[data-media-stage]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileNavigation = window.matchMedia('(max-width: 820px)');
const saveData = navigator.connection?.saveData === true;
const supportsIntersectionObserver = 'IntersectionObserver' in window;

if (!reduceMotion.matches && supportsIntersectionObserver) document.documentElement.classList.add('motion-ready');

const closeMenu = ({ returnFocus = false } = {}) => {
  if (!navigation || !menuToggle) return;
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  if (mobileNavigation.matches) navigation.inert = true;
  document.body.classList.remove('menu-open');
  if (returnFocus) menuToggle.focus();
};

const openMenu = ({ moveFocus = false } = {}) => {
  if (!navigation || !menuToggle) return;
  navigation.inert = false;
  navigation.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
  if (moveFocus) requestAnimationFrame(() => navigation.querySelector('a')?.focus());
};

const syncNavigationMode = () => {
  if (!navigation || !menuToggle) return;
  if (mobileNavigation.matches) {
    closeMenu();
  } else {
    navigation.inert = false;
    navigation.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
};

menuToggle?.addEventListener('click', (event) => {
  if (!navigation) return;
  if (navigation.classList.contains('is-open')) closeMenu();
  else openMenu({ moveFocus: event.detail === 0 });
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => closeMenu());
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation?.classList.contains('is-open')) {
    closeMenu({ returnFocus: true });
  }
});

document.addEventListener('pointerdown', (event) => {
  if (!navigation?.classList.contains('is-open')) return;
  if (!header?.contains(event.target)) closeMenu();
});

mobileNavigation.addEventListener('change', syncNavigationMode);
syncNavigationMode();

const managedVideos = new Set();

const pauseManagedVideos = () => {
  managedVideos.forEach((video) => video.pause());
};

const syncManagedVideo = (video) => {
  const shouldPlay = video.dataset.inViewport === 'true'
    && document.visibilityState === 'visible'
    && !reduceMotion.matches;
  if (shouldPlay) video.play().catch(() => {});
  else video.pause();
};

const hydrateVideoStage = (stage) => {
  if (stage.dataset.videoHydrated === 'true' || reduceMotion.matches || saveData) return;

  const webm = stage.dataset.videoWebm;
  const mp4 = stage.dataset.videoMp4;
  if (!webm && !mp4) return;

  stage.dataset.videoHydrated = 'true';
  const video = document.createElement('video');
  const poster = stage.querySelector('.media-stage-poster img');
  video.className = 'media-stage-video';
  video.muted = true;
  video.playsInline = true;
  video.loop = stage.dataset.videoLoop === 'true';
  video.preload = 'metadata';
  video.setAttribute('aria-hidden', 'true');
  if (poster?.currentSrc || poster?.src) video.poster = poster.currentSrc || poster.src;

  if (webm) {
    const source = document.createElement('source');
    source.src = webm;
    source.type = 'video/webm';
    video.append(source);
  }
  if (mp4) {
    const source = document.createElement('source');
    source.src = mp4;
    source.type = 'video/mp4';
    video.append(source);
  }

  stage.querySelector('.media-stage-poster')?.after(video);
  managedVideos.add(video);
  video.addEventListener('canplay', () => stage.classList.add('is-video-ready'), { once: true });

  if (stage.dataset.videoAutoplay === 'true' && supportsIntersectionObserver) {
    const playbackObserver = new IntersectionObserver(([entry]) => {
      video.dataset.inViewport = String(entry.isIntersecting);
      syncManagedVideo(video);
    }, { threshold: 0.2 });
    playbackObserver.observe(stage);
  }

  video.load();
};

if (!reduceMotion.matches && !saveData) {
  if (supportsIntersectionObserver) {
    const videoHydrationObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        hydrateVideoStage(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '240px 0px', threshold: 0 });
    mediaStages.forEach((stage) => videoHydrationObserver.observe(stage));
  } else {
    mediaStages.forEach(hydrateVideoStage);
  }
}

document.addEventListener('visibilitychange', () => {
  managedVideos.forEach(syncManagedVideo);
});

reduceMotion.addEventListener('change', ({ matches }) => {
  document.documentElement.classList.toggle('motion-ready', !matches && supportsIntersectionObserver);
  if (matches) pauseManagedVideos();
  else {
    mediaStages.forEach(hydrateVideoStage);
    managedVideos.forEach(syncManagedVideo);
  }
});

if (header && supportsIntersectionObserver) {
  const headerSentinel = document.createElement('span');
  headerSentinel.className = 'header-sentinel';
  headerSentinel.setAttribute('aria-hidden', 'true');
  header.before(headerSentinel);

  const headerObserver = new IntersectionObserver(([entry]) => {
    header.classList.toggle('is-scrolled', !entry.isIntersecting);
  });
  headerObserver.observe(headerSentinel);
} else {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
}

if (supportsIntersectionObserver) {
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
}

if (!reduceMotion.matches && supportsIntersectionObserver) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12%', threshold: 0.08 });

  const registerReveal = (element, order = 0) => {
    if (!element || element.closest('.hero, .page-hero, .contact-page')) return;
    element.classList.add('motion-reveal');
    element.style.setProperty('--motion-order', String(Math.min(order, 4)));
    revealObserver.observe(element);
  };

  document.querySelectorAll('main section:not(.hero):not(.page-hero):not(.contact-page) h2').forEach((heading) => {
    registerReveal(heading);
    const supportingCopy = heading.parentElement?.querySelector('.section-lede, .large-copy');
    if (supportingCopy) registerReveal(supportingCopy, 1);
  });

  const sequenceSelectors = [
    '.method-sequence',
    '.diagnostic-sequence',
    '.capability-list',
    '.capability-detail-list',
    '.relationship-cycle',
    '.evidence-sequence',
    '.company-principles',
  ];

  sequenceSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((sequence) => {
      sequence.classList.add('motion-sequence');
      [...sequence.children].forEach((item, index) => {
        item.style.setProperty('--motion-order', String(Math.min(index, 5)));
      });
      revealObserver.observe(sequence);
    });
  });

  document.querySelectorAll('.architecture-line i, .relationship-orbit i, .impact-axis i, .starting-flow i').forEach((line) => {
    line.classList.add('motion-line');
    revealObserver.observe(line);
  });

  const prepareDiagram = (diagram, pathSelector, nodeSelector, emphasisSelector) => {
    if (!diagram) return;
    diagram.classList.add('motion-diagram');
    diagram.querySelectorAll(pathSelector).forEach((path, index) => {
      path.setAttribute('pathLength', '1');
      path.classList.add('motion-path');
      path.style.setProperty('--motion-order', String(Math.min(index, 5)));
    });
    diagram.querySelectorAll(nodeSelector).forEach((node, index) => {
      node.classList.add('motion-node');
      node.style.setProperty('--motion-order', String(Math.min(index, 5)));
    });
    diagram.querySelectorAll(emphasisSelector).forEach((element) => {
      element.classList.add('motion-emphasis');
    });
    revealObserver.observe(diagram);
  };

  prepareDiagram(
    document.querySelector('.friction-diagram'),
    '.lane-lines path, .flow-path path, .friction-marker line',
    '.flow-node, .friction-marker circle, .friction-marker text',
    '.friction-marker circle:last-of-type',
  );
  prepareDiagram(
    document.querySelector('.operating-map'),
    '.map-lanes path, .map-connections path, .map-friction path',
    '.map-flow > g, .map-friction circle, .map-support',
    '.map-friction circle',
  );
}

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
