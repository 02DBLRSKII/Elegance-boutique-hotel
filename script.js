/* ============================================================
   ELEGANCE BOUTIQUE HOTEL — SCRIPT
   Shared behaviour across all five pages. Every block checks
   for its target elements before running, so this one file
   is safe to include on every page regardless of content.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');

  if (navToggle && primaryNav) {
    const closeNav = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      primaryNav.classList.remove('is-open');
      document.body.classList.remove('nav-open-lock');
    };
    const openNav = () => {
      navToggle.setAttribute('aria-expanded', 'true');
      primaryNav.classList.add('is-open');
      document.body.classList.add('nav-open-lock');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });

    // Close menu when a nav link is tapped (mobile)
    primaryNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    // Close if resized back to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.getElementById('site-header');
  if (header) {
    const setHeaderState = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll(
    '.section-head, .room-card, .room-plate, .amenity, .testimonial, ' +
    '.value-card, .timeline-item, .team-card, .welcome-media, .welcome-body, ' +
    '.masonry-item'
  );

  if (revealTargets.length && 'IntersectionObserver' in window) {
    revealTargets.forEach((el) => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    // No IntersectionObserver support (or reduced motion) — show everything
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- FAQ accordion ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (!question || !answer) return;

      question.addEventListener('click', () => {
        const isOpen = question.getAttribute('aria-expanded') === 'true';

        // Close all other items (single-open accordion)
        faqItems.forEach((other) => {
          const otherQ = other.querySelector('.faq-question');
          const otherA = other.querySelector('.faq-answer');
          if (otherQ && otherA && other !== item) {
            otherQ.setAttribute('aria-expanded', 'false');
            otherA.style.maxHeight = null;
          }
        });

        question.setAttribute('aria-expanded', String(!isOpen));
        answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
      });
    });
  }

  /* ---------- Gallery: category filter ---------- */
  const filterBar = document.querySelector('.filter-bar');
  const masonryItems = document.querySelectorAll('.masonry-item');

  if (filterBar && masonryItems.length) {
    const filterButtons = filterBar.querySelectorAll('.filter-btn');

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.filter;

        filterButtons.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        masonryItems.forEach((item) => {
          const match = category === 'all' || item.dataset.category === category;
          item.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  /* ---------- Gallery: lightbox viewer ---------- */
  const lightbox = document.getElementById('lightbox');

  if (lightbox && masonryItems.length) {
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    let visibleItems = [];
    let currentIndex = 0;
    let lastFocusedEl = null;

    const getVisibleItems = () =>
      Array.from(masonryItems).filter((item) => !item.classList.contains('is-hidden'));

    const showImage = (index) => {
      visibleItems = getVisibleItems();
      if (!visibleItems.length) return;
      currentIndex = (index + visibleItems.length) % visibleItems.length;

      const item = visibleItems[currentIndex];
      const img = item.querySelector('img');
      const captionText = item.querySelector('.masonry-caption')?.textContent.trim() || '';

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      if (lightboxCaption) lightboxCaption.textContent = captionText;
    };

    const openLightbox = (index) => {
      lastFocusedEl = document.activeElement;
      visibleItems = getVisibleItems();
      showImage(index);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-open-lock');
      closeBtn.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open-lock');
      if (lastFocusedEl) lastFocusedEl.focus();
    };

    masonryItems.forEach((item) => {
      item.addEventListener('click', () => {
        const all = getVisibleItems();
        const index = all.indexOf(item);
        openLightbox(index);
      });
    });

    closeBtn?.addEventListener('click', closeLightbox);
    prevBtn?.addEventListener('click', () => showImage(currentIndex - 1));
    nextBtn?.addEventListener('click', () => showImage(currentIndex + 1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });
  }

  /* ---------- Contact form (front-end only, no backend wired up) ---------- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const statusEl = document.getElementById('form-status');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      // No backend connected yet — this simply confirms receipt in the UI.
      // Wire this up to your booking system or a form endpoint (e.g. Formspree)
      // by replacing this block with a fetch() call.
      if (statusEl) {
        statusEl.textContent = 'Thank you — your message has been noted. We will reply shortly.';
        statusEl.classList.add('is-success');
      }
      contactForm.reset();
    });
  }

});
