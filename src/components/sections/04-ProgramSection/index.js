(function registerProgramSection() {
  const ProgramSection = {
    name: 'ProgramSection',
    data() {
      const source =
        (window.Landing && window.Landing.content && window.Landing.content.program) || {};

      const program = {
        title: '',
        text: '',
        actions: {
          primary: '',
          primaryUrl: '#pricing',
          secondary: ''
        },
        steps: [],
        mobileNote: '',
        webinars: [],
        ...source,
        actions: {
          primary: '',
          primaryUrl: '#pricing',
          secondary: '',
          ...(source.actions || {})
        }
      };

      const webinars = Array.isArray(program.webinars)
        ? program.webinars.map((webinar, index, list) => {
            const rawImages = Array.isArray(webinar && webinar.images) ? webinar.images.filter(Boolean) : [];
            const normalizedImages = rawImages.length >= 2
              ? rawImages.slice(0, 2)
              : rawImages.length === 1
              ? [rawImages[0], rawImages[0]]
              : ['', ''];
            const learn = Array.isArray(webinar && webinar.learn) ? webinar.learn : [];

            return {
              stepLabel: `Шаг ${index + 1} из ${list.length}`,
              title: webinar && webinar.title ? webinar.title : '',
              date: webinar && webinar.date ? webinar.date : '',
              text: webinar && webinar.text ? webinar.text : '',
              learn,
              previewImage: webinar && webinar.previewImage ? webinar.previewImage : normalizedImages[0],
              images: normalizedImages
            };
          })
        : [];

      return {
        activeWebinarIndex: -1,
        animatingWebinarIndex: -1,
        isSwitching: false,
        program,
        webinars,
        panelRefs: {},
        panelHeights: {},
        resizeFrameId: 0,
        scrollFrameId: 0,
        restoreScrollBehavior: null,
        programPreloadObserver: null,
        preloadIdleId: 0,
        preloadTimerId: 0,
        programImagesPreloaded: false
      };
    },
    mounted() {
      window.addEventListener('resize', this.handleResize, { passive: true });
      this.$nextTick(() => {
        this.updateAllPanelHeights();
      });
      this.initProgramPreloadObserver();
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
      if (this.resizeFrameId) {
        window.cancelAnimationFrame(this.resizeFrameId);
        this.resizeFrameId = 0;
      }
      if (this.scrollFrameId) {
        window.cancelAnimationFrame(this.scrollFrameId);
        this.scrollFrameId = 0;
      }
      if (typeof this.restoreScrollBehavior === 'function') {
        this.restoreScrollBehavior();
        this.restoreScrollBehavior = null;
      }
      if (this.programPreloadObserver) {
        this.programPreloadObserver.disconnect();
        this.programPreloadObserver = null;
      }
      if (this.preloadIdleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(this.preloadIdleId);
        this.preloadIdleId = 0;
      }
      if (this.preloadTimerId) {
        window.clearTimeout(this.preloadTimerId);
        this.preloadTimerId = 0;
      }
    },
    methods: {
      initProgramPreloadObserver() {
        if (this.programImagesPreloaded) {
          return;
        }

        const section = this.$el;

        if (!section) {
          this.scheduleProgramImagePreload();
          return;
        }

        if (!('IntersectionObserver' in window)) {
          this.scheduleProgramImagePreload();
          return;
        }

        if (this.programPreloadObserver) {
          this.programPreloadObserver.disconnect();
        }

        this.programPreloadObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) {
                return;
              }

              this.scheduleProgramImagePreload();

              if (this.programPreloadObserver) {
                this.programPreloadObserver.disconnect();
                this.programPreloadObserver = null;
              }
            });
          },
          {
            root: null,
            threshold: 0.01,
            rootMargin: '42% 0px 42% 0px'
          }
        );

        this.programPreloadObserver.observe(section);
      },
      scheduleProgramImagePreload() {
        if (this.programImagesPreloaded) {
          return;
        }

        if (this.preloadIdleId || this.preloadTimerId) {
          return;
        }

        const runPreload = () => {
          this.preloadIdleId = 0;
          this.preloadTimerId = 0;
          this.preloadProgramImages();
        };

        if ('requestIdleCallback' in window) {
          this.preloadIdleId = window.requestIdleCallback(runPreload, { timeout: 900 });
          return;
        }

        this.preloadTimerId = window.setTimeout(runPreload, 120);
      },
      collectProgramImageUrls() {
        const urls = new Set();

        this.webinars.forEach((webinar) => {
          const sources = [
            webinar && webinar.previewImage ? webinar.previewImage : '',
            ...(Array.isArray(webinar && webinar.images) ? webinar.images : [])
          ];

          sources.forEach((src) => {
            if (typeof src !== 'string') {
              return;
            }

            const normalized = src.trim();

            if (!normalized) {
              return;
            }

            urls.add(normalized);
          });
        });

        return Array.from(urls);
      },
      preloadImage(url) {
        return new Promise((resolve) => {
          const image = new Image();

          const done = () => {
            resolve();
          };

          image.decoding = 'async';
          image.addEventListener(
            'load',
            () => {
              if (typeof image.decode === 'function') {
                image.decode().catch(() => {}).finally(done);
                return;
              }

              done();
            },
            { once: true }
          );
          image.addEventListener('error', done, { once: true });
          image.src = url;

          if (image.complete) {
            if (typeof image.decode === 'function') {
              image.decode().catch(() => {}).finally(done);
              return;
            }

            done();
          }
        });
      },
      async preloadProgramImages() {
        if (this.programImagesPreloaded) {
          return;
        }

        this.programImagesPreloaded = true;

        if (this.programPreloadObserver) {
          this.programPreloadObserver.disconnect();
          this.programPreloadObserver = null;
        }

        const urls = this.collectProgramImageUrls();

        if (!urls.length) {
          return;
        }

        const batchSize = 2;

        for (let index = 0; index < urls.length; index += batchSize) {
          const batch = urls.slice(index, index + batchSize);
          await Promise.all(batch.map((url) => this.preloadImage(url)));

          await new Promise((resolve) => {
            window.requestAnimationFrame(() => {
              resolve();
            });
          });
        }

        this.$nextTick(() => {
          this.updateAllPanelHeights();
        });
      },
      getPanelContent(index) {
        const panelWrap = this.panelRefs[index];

        if (!panelWrap) {
          return null;
        }

        return panelWrap.querySelector('.program-card__panel');
      },
      getPanelWrap(index) {
        return this.panelRefs[index] || null;
      },
      getCardElement(index) {
        const panelWrap = this.getPanelWrap(index);

        if (!panelWrap || !panelWrap.closest) {
          return null;
        }

        return panelWrap.closest('.program-card');
      },
      setPanelHeight(index, height) {
        const panelWrap = this.getPanelWrap(index);
        const normalized = `${Math.max(0, Math.ceil(height || 0))}px`;

        this.panelHeights[index] = normalized;

        if (panelWrap) {
          panelWrap.style.setProperty('--panel-height', normalized);
        }
      },
      handleResize() {
        if (this.resizeFrameId) {
          window.cancelAnimationFrame(this.resizeFrameId);
        }

        this.resizeFrameId = window.requestAnimationFrame(() => {
          this.resizeFrameId = 0;
          this.updateAllPanelHeights();
        });
      },
      setPanelRef(index, el) {
        if (!el) {
          return;
        }

        this.panelRefs[index] = el;
        this.bindPanelMediaListeners(index);
        this.updatePanelHeight(index);
      },
      bindPanelMediaListeners(index) {
        const panelWrap = this.panelRefs[index];

        if (!panelWrap || panelWrap.dataset.panelMediaBound === 'true') {
          return;
        }

        const images = panelWrap.querySelectorAll('img');

        images.forEach((image) => {
          if (image.complete) {
            return;
          }

          const recalc = () => {
            if (this.animatingWebinarIndex === index) {
              return;
            }

            this.updatePanelHeight(index);
          };

          image.addEventListener('load', recalc, { once: true });
          image.addEventListener('error', recalc, { once: true });
        });

        panelWrap.dataset.panelMediaBound = 'true';
      },
      measurePanelHeight(index) {
        const panel = this.getPanelContent(index);

        if (!panel) {
          return 0;
        }

        const measured = Math.max(0, Math.ceil(panel.scrollHeight + 1));

        return measured;
      },
      updatePanelHeight(index) {
        const measured = this.measurePanelHeight(index);

        this.setPanelHeight(index, measured);
      },
      updateAllPanelHeights() {
        this.webinars.forEach((_, index) => {
          this.updatePanelHeight(index);
        });
      },
      getViewportHeight() {
        const visualViewport = window.visualViewport;

        if (visualViewport && Number.isFinite(visualViewport.height) && visualViewport.height > 0) {
          return visualViewport.height;
        }

        return window.innerHeight || document.documentElement.clientHeight || 1;
      },
      clampScrollTop(value, viewportHeight = this.getViewportHeight()) {
        const root = document.documentElement;
        const body = document.body;
        const documentHeight = Math.max(
          root ? root.scrollHeight : 0,
          body ? body.scrollHeight : 0
        );
        const maxScrollTop = Math.max(0, Math.round(documentHeight - viewportHeight));

        return Math.max(0, Math.min(maxScrollTop, Math.round(value)));
      },
      getPanelStyle(index) {
        return {
          '--panel-height': this.panelHeights[index] || '0px'
        };
      },
      getPanelDurationMs(index, phase = 'current') {
        const card = this.getCardElement(index);
        const fallbackByPhase = {
          current: 620,
          open: 930,
          close: 520
        };
        const varByPhase = {
          current: '--program-panel-duration',
          open: '--program-open-duration',
          close: '--program-close-duration'
        };
        const normalizedPhase = Object.prototype.hasOwnProperty.call(varByPhase, phase) ? phase : 'current';
        const fallbackDuration = fallbackByPhase[normalizedPhase];

        if (!card) {
          return fallbackDuration;
        }

        const raw = window.getComputedStyle(card).getPropertyValue(varByPhase[normalizedPhase]) || '';
        const numeric = Number.parseFloat(raw.replace('ms', '').trim());
        return Number.isFinite(numeric) ? Math.max(120, numeric) : fallbackDuration;
      },
      waitForPanelTransition(index, timeoutMs = null, phase = 'current') {
        const panelWrap = this.getPanelWrap(index);

        if (!panelWrap) {
          return Promise.resolve();
        }

        const duration = this.getPanelDurationMs(index, phase);
        const effectiveTimeout = Number.isFinite(timeoutMs) ? timeoutMs : Math.round(duration + 220);

        return new Promise((resolve) => {
          let finished = false;
          let timeoutId = 0;

          const done = () => {
            if (finished) {
              return;
            }

            finished = true;
            panelWrap.removeEventListener('transitionend', handleTransitionEnd);
            window.clearTimeout(timeoutId);
            resolve();
          };

          const handleTransitionEnd = (event) => {
            if (event.target !== panelWrap || event.propertyName !== 'height') {
              return;
            }

            done();
          };

          panelWrap.addEventListener('transitionend', handleTransitionEnd);
          timeoutId = window.setTimeout(done, effectiveTimeout);
        });
      },
      getPanelHeightValue(index) {
        const raw = this.panelHeights[index] || '0';
        const numeric = Number.parseFloat(raw);
        return Number.isFinite(numeric) ? numeric : 0;
      },
      ensurePanelHeight(index) {
        if (this.getPanelHeightValue(index) > 0) {
          return;
        }

        this.updatePanelHeight(index);
      },
      getScrollDuration(targetTop, index) {
        const currentTop = window.scrollY || window.pageYOffset || 0;
        const distance = Math.abs(targetTop - currentTop);
        const panelDuration = this.getPanelDurationMs(index);
        const viewportHeight = this.getViewportHeight();
        const distanceRatio = Math.min(1.4, distance / Math.max(1, viewportHeight));
        const minDuration = Math.max(320, Math.round(panelDuration * 0.88));
        const maxDuration = Math.max(minDuration + 140, Math.round(panelDuration * 1.55));
        const distanceComponent = Math.round(distanceRatio * panelDuration * 0.52);
        return Math.max(minDuration, Math.min(maxDuration, minDuration + distanceComponent));
      },
      getCubicBezierEasing(x1, y1, x2, y2) {
        const cx = 3 * x1;
        const bx = 3 * (x2 - x1) - cx;
        const ax = 1 - cx - bx;
        const cy = 3 * y1;
        const by = 3 * (y2 - y1) - cy;
        const ay = 1 - cy - by;
        const sampleCurveX = (t) => ((ax * t + bx) * t + cx) * t;
        const sampleCurveY = (t) => ((ay * t + by) * t + cy) * t;
        const sampleCurveDerivativeX = (t) => (3 * ax * t + 2 * bx) * t + cx;
        const solveCurveX = (x) => {
          let t = x;

          for (let i = 0; i < 8; i += 1) {
            const xEstimate = sampleCurveX(t) - x;

            if (Math.abs(xEstimate) < 0.00001) {
              return t;
            }

            const derivative = sampleCurveDerivativeX(t);

            if (Math.abs(derivative) < 0.000001) {
              break;
            }

            t -= xEstimate / derivative;
          }

          let lower = 0;
          let upper = 1;
          t = x;

          for (let i = 0; i < 12; i += 1) {
            const xEstimate = sampleCurveX(t);

            if (Math.abs(xEstimate - x) < 0.00001) {
              return t;
            }

            if (xEstimate > x) {
              upper = t;
            } else {
              lower = t;
            }

            t = (lower + upper) * 0.5;
          }

          return t;
        };

        return (value) => {
          const progress = Math.max(0, Math.min(1, value));

          if (progress === 0 || progress === 1) {
            return progress;
          }

          return sampleCurveY(solveCurveX(progress));
        };
      },
      getPanelEasing(index, phase = 'current') {
        const card = this.getCardElement(index);
        const varByPhase = {
          current: '--program-panel-ease',
          open: '--program-open-ease',
          close: '--program-close-ease'
        };
        const normalizedPhase = Object.prototype.hasOwnProperty.call(varByPhase, phase) ? phase : 'current';

        if (!card) {
          return (value) => value;
        }

        const raw = window.getComputedStyle(card).getPropertyValue(varByPhase[normalizedPhase]) || '';
        const normalized = raw.trim().toLowerCase();
        const keywordMap = {
          linear: [0, 0, 1, 1],
          ease: [0.25, 0.1, 0.25, 1],
          'ease-in': [0.42, 0, 1, 1],
          'ease-out': [0, 0, 0.58, 1],
          'ease-in-out': [0.42, 0, 0.58, 1]
        };

        if (!normalized) {
          return (value) => value;
        }

        if (Object.prototype.hasOwnProperty.call(keywordMap, normalized)) {
          const [x1, y1, x2, y2] = keywordMap[normalized];
          return this.getCubicBezierEasing(x1, y1, x2, y2);
        }

        const match = normalized.match(
          /^cubic-bezier\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)$/
        );

        if (!match) {
          return (value) => value;
        }

        const x1 = Number.parseFloat(match[1]);
        const y1 = Number.parseFloat(match[2]);
        const x2 = Number.parseFloat(match[3]);
        const y2 = Number.parseFloat(match[4]);

        if (![x1, y1, x2, y2].every((value) => Number.isFinite(value))) {
          return (value) => value;
        }

        return this.getCubicBezierEasing(x1, y1, x2, y2);
      },
      animateScrollTo(targetTop, durationMs, options = {}) {
        const startTop = window.scrollY || window.pageYOffset || 0;
        const delta = targetTop - startTop;

        if (Math.abs(delta) < 1 || durationMs <= 0) {
          window.scrollTo(0, targetTop);
          return;
        }

        if (typeof this.restoreScrollBehavior === 'function') {
          this.restoreScrollBehavior();
          this.restoreScrollBehavior = null;
        }

        const documentElement = document.documentElement;
        const previousInlineScrollBehavior = documentElement.style.scrollBehavior;
        documentElement.style.scrollBehavior = 'auto';
        this.restoreScrollBehavior = () => {
          documentElement.style.scrollBehavior = previousInlineScrollBehavior;
        };

        if (this.scrollFrameId) {
          window.cancelAnimationFrame(this.scrollFrameId);
          this.scrollFrameId = 0;
        }

        const start = performance.now();
        const easing = typeof options.easingFn === 'function'
          ? options.easingFn
          : options.easing === 'linear'
          ? (value) => value
          : (value) => 1 - Math.pow(1 - value, 3);

        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.max(0, Math.min(1, elapsed / durationMs));
          const eased = easing(progress);
          const nextTop = startTop + (delta * eased);
          window.scrollTo(0, nextTop);

          if (progress < 1) {
            this.scrollFrameId = window.requestAnimationFrame(tick);
            return;
          }

          this.scrollFrameId = 0;
          window.scrollTo(0, targetTop);
          if (typeof this.restoreScrollBehavior === 'function') {
            this.restoreScrollBehavior();
            this.restoreScrollBehavior = null;
          }
        };

        this.scrollFrameId = window.requestAnimationFrame(tick);
      },
      animateScrollToOnPanelStart(index, targetTop, durationMs, options = {}) {
        const panelWrap = this.getPanelWrap(index);

        if (!panelWrap) {
          this.animateScrollTo(targetTop, durationMs, options);
          return;
        }

        let started = false;
        let fallbackId = 0;

        const cleanup = () => {
          panelWrap.removeEventListener('transitionrun', startIfHeightTransition);
          panelWrap.removeEventListener('transitionstart', startIfHeightTransition);
          window.clearTimeout(fallbackId);
        };

        const start = () => {
          if (started) {
            return;
          }

          started = true;
          cleanup();
          this.animateScrollTo(targetTop, durationMs, options);
        };

        const startIfHeightTransition = (event) => {
          if (event.target !== panelWrap || event.propertyName !== 'height') {
            return;
          }

          start();
        };

        panelWrap.addEventListener('transitionrun', startIfHeightTransition);
        panelWrap.addEventListener('transitionstart', startIfHeightTransition);
        fallbackId = window.setTimeout(start, 220);
      },
      focusCardInViewport(index, options = {}) {
        const card = this.getCardElement(index);
        const panelWrap = this.getPanelWrap(index);

        if (!card || !panelWrap) {
          return;
        }

        const rect = card.getBoundingClientRect();
        const rectTopOffset = Number.isFinite(options.rectTopOffset)
          ? Number(options.rectTopOffset)
          : 0;
        const predictedRectTop = rect.top + rectTopOffset;
        const currentPanelHeight = Math.max(0, Math.round(panelWrap.getBoundingClientRect().height));
        const targetPanelHeight = Number.isFinite(options.targetPanelHeight)
          ? Math.max(0, Math.round(options.targetPanelHeight))
          : currentPanelHeight;
        const predictedCardHeight = Math.max(
          0,
          Math.round(rect.height - currentPanelHeight + targetPanelHeight)
        );
        const viewportHeight = this.getViewportHeight();
        const currentTop = window.scrollY || window.pageYOffset || 0;
        const topPadding = Math.max(36, Math.round(viewportHeight * 0.14));
        const bottomPadding = Math.max(28, Math.round(viewportHeight * 0.12));
        const availableHeight = Math.max(1, viewportHeight - topPadding - bottomPadding);
        const fitsViewport = predictedCardHeight <= availableHeight;
        let targetTop = currentTop;
        const predictedBottom = predictedRectTop + predictedCardHeight;
        const topAlignedTarget = currentTop + predictedRectTop - topPadding;

        if (fitsViewport) {
          targetTop = topAlignedTarget;
        } else {
          const preferredTop = topPadding;
          const preferredBottom = viewportHeight - bottomPadding;
          const needsAdjustment = predictedRectTop < preferredTop || predictedBottom > preferredBottom;

          if (!needsAdjustment && !options.forceReposition) {
            return;
          }

          const topAlignedTarget = currentTop + predictedRectTop - preferredTop;
          const bottomAlignedTarget = currentTop + predictedBottom - preferredBottom;
          if (predictedRectTop < preferredTop || options.preferTop !== false) {
            targetTop = topAlignedTarget;
          } else {
            targetTop = bottomAlignedTarget;
          }
        }

        targetTop = this.clampScrollTop(targetTop, viewportHeight);

        if (Math.abs(targetTop - currentTop) < 6) {
          return;
        }

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion || options.behavior === 'auto') {
          window.scrollTo(0, targetTop);
          return;
        }

        const syncDurationMs = Number.isFinite(options.syncDurationMs)
          ? Math.max(180, Math.round(options.syncDurationMs))
          : null;
        const duration = syncDurationMs || this.getScrollDuration(targetTop, index);

        if (options.syncWithPanel) {
          this.animateScrollToOnPanelStart(index, targetTop, duration, {
            easingFn: options.syncEasingFn
          });
          return;
        }

        this.animateScrollTo(targetTop, duration);
      },
      async switchPanels(currentIndex, nextIndex) {
        if (currentIndex < 0 || nextIndex < 0 || currentIndex === nextIndex) {
          return;
        }

        this.updatePanelHeight(nextIndex);

        const targetPanelHeight = this.getPanelHeightValue(nextIndex);
        const openDuration = this.getPanelDurationMs(nextIndex, 'open');
        const openEasing = this.getPanelEasing(nextIndex, 'open');
        const closeDuration = this.getPanelDurationMs(currentIndex, 'close');
        const closingPanelWrap = this.getPanelWrap(currentIndex);
        const closingPanelHeight = closingPanelWrap
          ? Math.max(0, Math.round(closingPanelWrap.getBoundingClientRect().height))
          : 0;
        const rectTopOffset = nextIndex > currentIndex ? -closingPanelHeight : 0;
        const closePromise = this.waitForPanelTransition(
          currentIndex,
          Math.round(closeDuration + 180),
          'close'
        );
        const openPromise = this.waitForPanelTransition(
          nextIndex,
          Math.round(openDuration + 220),
          'open'
        );

        this.animatingWebinarIndex = nextIndex;
        this.activeWebinarIndex = nextIndex;
        this.focusCardInViewport(nextIndex, {
          behavior: 'smooth',
          targetPanelHeight,
          syncDurationMs: openDuration,
          syncWithPanel: true,
          syncEasingFn: openEasing,
          forceReposition: true,
          rectTopOffset
        });

        await Promise.all([closePromise, openPromise]);
        this.animatingWebinarIndex = -1;
      },
      async closePanel(index) {
        if (index < 0) {
          return;
        }

        const closeDuration = this.getPanelDurationMs(index, 'close');
        const transitionPromise = this.waitForPanelTransition(index, Math.round(closeDuration + 180), 'close');
        this.animatingWebinarIndex = index;
        this.activeWebinarIndex = -1;
        await transitionPromise;
        this.animatingWebinarIndex = -1;
      },
      async openPanel(index) {
        if (index < 0) {
          return;
        }

        this.updatePanelHeight(index);
        const targetPanelHeight = this.getPanelHeightValue(index);
        const panelDuration = this.getPanelDurationMs(index, 'open');
        const panelEasing = this.getPanelEasing(index, 'open');
        const transitionPromise = this.waitForPanelTransition(index, Math.round(panelDuration + 220), 'open');
        this.animatingWebinarIndex = index;
        this.activeWebinarIndex = index;
        this.focusCardInViewport(index, {
          behavior: 'smooth',
          targetPanelHeight,
          syncDurationMs: panelDuration,
          syncWithPanel: true,
          syncEasingFn: panelEasing
        });
        await transitionPromise;
        this.animatingWebinarIndex = -1;
      },
      async toggleWebinar(index) {
        if (this.isSwitching) {
          return;
        }

        this.isSwitching = true;

        try {
          const current = this.activeWebinarIndex;
          const closeOnly = current === index;

          if (current >= 0 && closeOnly) {
            await this.closePanel(current);
            return;
          }

          if (current >= 0) {
            await this.switchPanels(current, index);
            return;
          }

          await this.openPanel(index);
        } finally {
          this.isSwitching = false;
        }
      },
      isWebinarOpen(index) {
        return this.activeWebinarIndex === index;
      },
      getWebinarButtonId(index) {
        return `program-webinar-button-${index}`;
      },
      getWebinarPanelId(index) {
        return `program-webinar-panel-${index}`;
      },
      getCardTitle(title) {
        const source = typeof title === 'string' ? title : '';
        return source.replace(/^Вебинар\s*\d+\s*[.:\-]?\s*/i, '').trim();
      }
    },
    template: `
<section class="program section" id="program" aria-labelledby="program-title">
  <div class="container">
    <div class="program__surface" data-reveal="zoom">
      <header class="program__header" data-reveal data-reveal-delay="40">
        <h2 class="section-title program__title" id="program-title" data-reveal data-reveal-delay="100">{{ program.title }}</h2>
        <p class="section-text program__text" data-reveal data-reveal-delay="160">{{ program.text }}</p>
      </header>

      <div class="program__actions" data-reveal data-reveal-delay="220">
        <a
          class="btn btn--primary program__btn"
          :href="program.actions.primaryUrl"
          :target="program.actions.primaryUrl && program.actions.primaryUrl.indexOf('http') === 0 ? '_blank' : null"
          :rel="program.actions.primaryUrl && program.actions.primaryUrl.indexOf('http') === 0 ? 'noopener noreferrer' : null"
        >
          {{ program.actions.primary }}
        </a>
        <a class="btn btn--ghost program__btn" href="#pricing">{{ program.actions.secondary }}</a>
      </div>

      <p class="program__mobile-note" data-reveal data-reveal-delay="360">{{ program.mobileNote }}</p>

      <div class="program__list">
        <article
          class="program-card"
          :class="{
            'program-card--open': isWebinarOpen(webinarIndex),
            'program-card--animating': animatingWebinarIndex === webinarIndex
          }"
          v-for="(webinar, webinarIndex) in webinars"
          :key="webinar.title + webinarIndex"
          data-reveal
          :data-reveal-delay="80 + (webinarIndex * 40)"
        >
          <button
            class="program-card__toggle"
            type="button"
            :id="getWebinarButtonId(webinarIndex)"
            :aria-expanded="isWebinarOpen(webinarIndex) ? 'true' : 'false'"
            :aria-controls="getWebinarPanelId(webinarIndex)"
            @click="toggleWebinar(webinarIndex)"
          >
            <div class="program-card__preview">
              <div class="program-card__content">
                <span class="program-card__step">{{ webinar.stepLabel }}</span>
                <span class="program-card__date">{{ webinar.date }}</span>
                <span class="program-card__title">{{ getCardTitle(webinar.title) }}</span>
              </div>

              <figure class="program-card__thumb" aria-hidden="true">
                <img :src="webinar.previewImage" :alt="webinar.title" loading="lazy" decoding="async" data-fade-image />
              </figure>
            </div>

            <span class="program-card__icon" aria-hidden="true"></span>
          </button>

          <div
            class="program-card__panel-wrap"
            :class="{ 'program-card__panel-wrap--open': isWebinarOpen(webinarIndex) }"
            :style="getPanelStyle(webinarIndex)"
            :ref="(el) => setPanelRef(webinarIndex, el)"
            :id="getWebinarPanelId(webinarIndex)"
            role="region"
            :aria-labelledby="getWebinarButtonId(webinarIndex)"
            :aria-hidden="isWebinarOpen(webinarIndex) ? 'false' : 'true'"
          >
            <div class="program-card__panel">
              <p class="program-card__text">{{ webinar.text }}</p>
              <h4>Чему вы научитесь:</h4>
              <ul>
                <li v-for="(item, itemIndex) in webinar.learn" :key="webinar.title + item + itemIndex">{{ item }}</li>
              </ul>

              <div class="program-card__gallery">
                <figure class="program-card__figure" v-for="(img, imageIndex) in webinar.images" :key="webinar.title + img + imageIndex">
                  <img :src="img" :alt="webinar.title" loading="lazy" decoding="async" data-fade-image />
                </figure>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.ProgramSection = ProgramSection;
})();
