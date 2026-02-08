(function registerMotionSystem() {
  function parseDelay(value) {
    if (!value) {
      return null;
    }

    const numeric = Number(value);

    if (Number.isFinite(numeric)) {
      return `${Math.max(0, numeric)}ms`;
    }

    return value;
  }

  function initHeroParallax() {
    const hero = document.querySelector('#hero .hero__surface');
    const topOrb = hero && hero.querySelector('.hero__orb--top');
    const bottomOrb = hero && hero.querySelector('.hero__orb--bottom');

    if (!hero || !topOrb || !bottomOrb) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      return;
    }

    let isTicking = false;

    const update = () => {
      const rect = hero.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;

      if (rect.bottom < 0 || rect.top > viewportHeight) {
        topOrb.style.setProperty('--orb-shift-x', '0px');
        topOrb.style.setProperty('--orb-shift-y', '0px');
        bottomOrb.style.setProperty('--orb-shift-x', '0px');
        bottomOrb.style.setProperty('--orb-shift-y', '0px');
        return;
      }

      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const centeredProgress = progress - 0.5;
      const yShift = centeredProgress * 20;
      const xShift = centeredProgress * 12;

      topOrb.style.setProperty('--orb-shift-x', `${xShift.toFixed(2)}px`);
      topOrb.style.setProperty('--orb-shift-y', `${(-yShift * 0.8).toFixed(2)}px`);
      bottomOrb.style.setProperty('--orb-shift-x', `${(-xShift * 0.65).toFixed(2)}px`);
      bottomOrb.style.setProperty('--orb-shift-y', `${(yShift * 0.55).toFixed(2)}px`);
    };

    const requestTick = () => {
      if (isTicking) {
        return;
      }

      isTicking = true;

      window.requestAnimationFrame(() => {
        update();
        isTicking = false;
      });
    };

    update();
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick, { passive: true });
  }

  function initFadeImages() {
    const images = Array.from(document.querySelectorAll('[data-fade-image]'));

    images.forEach((image) => {
      if (image.complete) {
        image.classList.add('is-loaded');
        return;
      }

      const markLoaded = () => {
        image.classList.add('is-loaded');
      };

      image.addEventListener('load', markLoaded, { once: true });
      image.addEventListener('error', markLoaded, { once: true });
    });
  }

  function initMotion() {
    const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));

    if (!revealItems.length) {
      initFadeImages();
      initHeroParallax();
      return;
    }

    revealItems.forEach((item) => {
      const delay = parseDelay(item.getAttribute('data-reveal-delay'));

      if (delay) {
        item.style.setProperty('--reveal-delay', delay);
      }
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => {
        item.classList.add('is-inview');
      });
      initHeroParallax();
      return;
    }

    revealItems.forEach((item) => {
      item.classList.add('reveal-ready');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target;
          const repeat = target.getAttribute('data-reveal-repeat') === 'true';

          if (entry.isIntersecting) {
            target.classList.add('is-inview');

            if (!repeat) {
              observer.unobserve(target);
            }
          } else if (repeat) {
            target.classList.remove('is-inview');
          }
        });
      },
      {
        root: null,
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px'
      }
    );

    revealItems.forEach((item) => {
      observer.observe(item);
    });

    initFadeImages();
    initHeroParallax();
  }

  window.Landing = window.Landing || {};
  window.Landing.initMotion = initMotion;
})();
