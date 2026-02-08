(function registerMotionSystem() {
  function parseDelay(value) {
    if (!value) {
      return null;
    }

    const numeric = Number(value);

    if (Number.isFinite(numeric)) {
      return `${Math.min(280, Math.max(0, numeric))}ms`;
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
    const previousShifts = {
      topX: '',
      topY: '',
      bottomX: '',
      bottomY: ''
    };

    const setShift = (target, xVar, yVar, xValue, yValue) => {
      if (previousShifts[xVar] !== xValue) {
        target.style.setProperty('--orb-shift-x', xValue);
        previousShifts[xVar] = xValue;
      }

      if (previousShifts[yVar] !== yValue) {
        target.style.setProperty('--orb-shift-y', yValue);
        previousShifts[yVar] = yValue;
      }
    };

    const update = () => {
      const rect = hero.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;

      if (rect.bottom < 0 || rect.top > viewportHeight) {
        setShift(topOrb, 'topX', 'topY', '0px', '0px');
        setShift(bottomOrb, 'bottomX', 'bottomY', '0px', '0px');
        return;
      }

      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const centeredProgress = progress - 0.5;
      const yShift = centeredProgress * 20;
      const xShift = centeredProgress * 12;

      setShift(topOrb, 'topX', 'topY', `${xShift.toFixed(2)}px`, `${(-yShift * 0.8).toFixed(2)}px`);
      setShift(bottomOrb, 'bottomX', 'bottomY', `${(-xShift * 0.65).toFixed(2)}px`, `${(yShift * 0.55).toFixed(2)}px`);
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
    let scheduleVisibleChecks = () => {};

    const getInPageTarget = (href) => {
      if (!href || href === '#' || href.charAt(0) !== '#') {
        return null;
      }

      const rawId = href.slice(1);

      if (!rawId) {
        return null;
      }

      const targetId = window.decodeURIComponent(rawId);

      if (!targetId) {
        return null;
      }

      return document.getElementById(targetId);
    };

    const scrollToTarget = (target) => {
      if (!target || typeof target.scrollIntoView !== 'function') {
        return;
      }

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      target.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    };

    const clearHash = () => {
      if (!window.location.hash || !window.history || typeof window.history.replaceState !== 'function') {
        return;
      }

      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    };

    const shouldBypassCustomAnchor = (event) => {
      if (!event) {
        return false;
      }

      if (event.defaultPrevented) {
        return true;
      }

      if (event.button !== 0) {
        return true;
      }

      return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    };

    const handleAnchorClick = (event) => {
      const trigger = event.target && event.target.closest && event.target.closest('a[href^="#"]');

      if (!trigger || shouldBypassCustomAnchor(event)) {
        return;
      }

      const href = trigger.getAttribute('href') || '';

      if (!href || href === '#') {
        return;
      }

      const target = getInPageTarget(href);

      if (!target) {
        return;
      }

      event.preventDefault();
      clearHash();
      scrollToTarget(target);
      window.requestAnimationFrame(() => {
        scheduleVisibleChecks();
      });
    };

    const handleHashChange = () => {
      const target = getInPageTarget(window.location.hash || '');

      if (target) {
        clearHash();
        scrollToTarget(target);
      }

      scheduleVisibleChecks();
    };

    document.addEventListener('click', handleAnchorClick);

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
      initFadeImages();
      initHeroParallax();
      return;
    }

    revealItems.forEach((item) => {
      item.classList.add('reveal-ready');
    });
    const unresolvedItems = new Set(
      revealItems.filter((item) => item.getAttribute('data-reveal-repeat') !== 'true')
    );

    const revealVisibleNow = () => {
      if (!unresolvedItems.size) {
        return;
      }

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const topBoundary = viewportHeight * 1.22;
      const bottomBoundary = -viewportHeight * 0.2;

      unresolvedItems.forEach((item) => {
        if (!item || !item.isConnected || item.classList.contains('is-inview')) {
          unresolvedItems.delete(item);
          return;
        }

        const rect = item.getBoundingClientRect();
        const isVisibleEnough = rect.top <= topBoundary && rect.bottom >= bottomBoundary;

        if (isVisibleEnough) {
          item.classList.add('is-inview');
          unresolvedItems.delete(item);
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target;
          const repeat = target.getAttribute('data-reveal-repeat') === 'true';

          if (entry.isIntersecting) {
            target.classList.add('is-inview');

            if (!repeat) {
              unresolvedItems.delete(target);
              observer.unobserve(target);
            }
          } else if (repeat) {
            target.classList.remove('is-inview');
          }
        });
      },
      {
        root: null,
        threshold: 0.01,
        rootMargin: '18% 0px 18% 0px'
      }
    );

    revealItems.forEach((item) => {
      observer.observe(item);
    });

    let isTicking = false;
    const requestVisibleCheck = () => {
      if (!unresolvedItems.size) {
        return;
      }

      if (isTicking) {
        return;
      }

      isTicking = true;

      window.requestAnimationFrame(() => {
        revealVisibleNow();
        isTicking = false;
      });
    };

    scheduleVisibleChecks = () => {
      requestVisibleCheck();
      [120, 280, 520].forEach((delay) => {
        window.setTimeout(requestVisibleCheck, delay);
      });
    };

    const revealFallback = () => {
      if (!unresolvedItems.size) {
        return;
      }

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;

      unresolvedItems.forEach((item) => {
        if (!item || !item.isConnected || item.classList.contains('is-inview')) {
          unresolvedItems.delete(item);
          return;
        }

        const rect = item.getBoundingClientRect();
        const shouldReveal = rect.top <= viewportHeight * 1.65;

        if (shouldReveal) {
          item.classList.add('is-inview');
          unresolvedItems.delete(item);
        }
      });
    };

    revealVisibleNow();
    window.addEventListener('resize', requestVisibleCheck, { passive: true });
    window.addEventListener('orientationchange', requestVisibleCheck, { passive: true });
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('pageshow', scheduleVisibleChecks);
    window.setTimeout(scheduleVisibleChecks, 420);
    window.setTimeout(revealFallback, 1800);

    initFadeImages();
    initHeroParallax();
  }

  window.Landing = window.Landing || {};
  window.Landing.initMotion = initMotion;
})();
