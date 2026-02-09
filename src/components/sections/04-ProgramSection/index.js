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
        journeyMessages: [],
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
            const normalizedImages = rawImages.length ? rawImages.slice(0, 1) : [];
            const learn = Array.isArray(webinar && webinar.learn) ? webinar.learn : [];

            return {
              stepLabel: `Шаг ${index + 1} из ${list.length}`,
              title: webinar && webinar.title ? webinar.title : '',
              date: webinar && webinar.date ? webinar.date : '',
              text: webinar && webinar.text ? webinar.text : '',
              learn,
              previewImage: webinar && webinar.previewImage ? webinar.previewImage : normalizedImages[0] || '',
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
        journeyPointRefs: {},
        journeyPath: '',
        journeyViewWidth: 0,
        journeyViewHeight: 0,
        journeyStartDot: null,
        journeyEndDot: null,
        resizeFrameId: 0,
        scrollFrameId: 0,
        journeyFrameId: 0,
        restoreScrollBehavior: null
      };
    },
    mounted() {
      window.addEventListener('resize', this.handleResize, { passive: true });
      this.$nextTick(() => {
        this.updateAllPanelHeights();
        this.scheduleJourneyLayout();
      });
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
      if (this.journeyFrameId) {
        window.cancelAnimationFrame(this.journeyFrameId);
        this.journeyFrameId = 0;
      }
      if (typeof this.restoreScrollBehavior === 'function') {
        this.restoreScrollBehavior();
        this.restoreScrollBehavior = null;
      }
    },
    methods: {
      getJourneyMessages() {
        const source = Array.isArray(this.program && this.program.journeyMessages)
          ? this.program.journeyMessages
          : [];

        return source
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter(Boolean);
      },
      getJourneyMessage(index) {
        const messages = this.getJourneyMessages();
        return index >= 0 && index < messages.length ? messages[index] : '';
      },
      hasJourneyMessage(index) {
        return Boolean(this.getJourneyMessage(index));
      },
      getJourneyLabelClass(index) {
        return index % 2 === 0
          ? 'program__journey-item program__journey-item--left'
          : 'program__journey-item program__journey-item--right';
      },
      setJourneyPointRef(index, el) {
        if (!el) {
          return;
        }

        if (this.journeyPointRefs[index] === el) {
          return;
        }

        this.journeyPointRefs[index] = el;
        this.scheduleJourneyLayout();
      },
      buildJourneyPath(points) {
        if (!Array.isArray(points) || points.length < 2) {
          return '';
        }

        let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

        for (let index = 1; index < points.length; index += 1) {
          const previous = points[index - 1];
          const current = points[index];
          const controlY = previous.y + ((current.y - previous.y) / 2);
          path += ` C ${previous.x.toFixed(2)} ${controlY.toFixed(2)}, ${current.x.toFixed(2)} ${controlY.toFixed(2)}, ${current.x.toFixed(2)} ${current.y.toFixed(2)}`;
        }

        return path;
      },
      getJourneySvgStyle() {
        return {
          height: `${Math.max(0, Math.ceil(this.journeyViewHeight || 0))}px`
        };
      },
      getJourneyViewBox() {
        return `0 0 ${Math.max(1, Math.ceil(this.journeyViewWidth || 1))} ${Math.max(1, Math.ceil(this.journeyViewHeight || 1))}`;
      },
      scheduleJourneyLayout() {
        if (this.journeyFrameId) {
          window.cancelAnimationFrame(this.journeyFrameId);
        }

        this.journeyFrameId = window.requestAnimationFrame(() => {
          this.journeyFrameId = 0;
          this.updateJourneyLayout();
        });
      },
      updateJourneyLayout() {
        const host = this.$refs.journeyHost;

        if (!host || typeof host.getBoundingClientRect !== 'function') {
          this.journeyPath = '';
          this.journeyStartDot = null;
          this.journeyEndDot = null;
          this.journeyViewWidth = 0;
          this.journeyViewHeight = 0;
          return;
        }

        const hostRect = host.getBoundingClientRect();
        const messages = this.getJourneyMessages();
        const points = [];

        messages.forEach((_, index) => {
          const point = this.journeyPointRefs[index];

          if (!point || typeof point.getBoundingClientRect !== 'function') {
            return;
          }

          const pointRect = point.getBoundingClientRect();
          const y = Math.max(0, (pointRect.top - hostRect.top) + (pointRect.height / 2));
          const xRatio = index % 2 === 0 ? 0.22 : 0.78;
          const x = Math.max(0, hostRect.width * xRatio);

          points.push({ x, y });
        });

        if (points.length < 2) {
          this.journeyPath = '';
          this.journeyStartDot = null;
          this.journeyEndDot = null;
          this.journeyViewWidth = Math.max(0, Math.ceil(hostRect.width || 0));
          this.journeyViewHeight = Math.max(0, Math.ceil(host.scrollHeight || 0));
          return;
        }

        this.journeyPath = this.buildJourneyPath(points);
        this.journeyStartDot = points[0];
        this.journeyEndDot = points[points.length - 1];
        this.journeyViewWidth = Math.max(0, Math.ceil(hostRect.width || 0));
        this.journeyViewHeight = Math.max(
          Math.ceil((points[points.length - 1].y || 0) + 24),
          Math.ceil(host.scrollHeight || 0)
        );
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
          this.scheduleJourneyLayout();
        });
      },
      setPanelRef(index, el) {
        if (!el) {
          return;
        }

        if (this.panelRefs[index] === el) {
          return;
        }

        this.panelRefs[index] = el;
        this.bindPanelMediaListeners(index);
        this.updatePanelHeight(index);
        this.scheduleJourneyLayout();
      },
      bindPanelMediaListeners(index) {
        const panelWrap = this.panelRefs[index];

        if (!panelWrap) {
          return;
        }

        const images = panelWrap.querySelectorAll('img');

        images.forEach((image) => {
          if (image.dataset.panelMediaBound === 'true') {
            return;
          }

          image.dataset.panelMediaBound = 'true';

          if (image.complete) {
            return;
          }

          const recalc = () => {
            if (this.animatingWebinarIndex === index) {
              return;
            }

            this.updatePanelHeight(index);
            this.scheduleJourneyLayout();
          };

          image.addEventListener('load', recalc, { once: true });
          image.addEventListener('error', recalc, { once: true });
        });
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
        this.scheduleJourneyLayout();
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
      shouldRenderGalleryImage(index) {
        return this.isSwitching || this.activeWebinarIndex === index || this.animatingWebinarIndex === index;
      },
      parseDurationMs(raw, fallbackMs) {
        if (typeof raw !== 'string') {
          return fallbackMs;
        }

        const normalized = raw.trim().toLowerCase();

        if (!normalized) {
          return fallbackMs;
        }

        if (normalized.endsWith('ms')) {
          const numeric = Number.parseFloat(normalized.slice(0, -2).trim());
          return Number.isFinite(numeric) ? Math.max(120, numeric) : fallbackMs;
        }

        if (normalized.endsWith('s')) {
          const numeric = Number.parseFloat(normalized.slice(0, -1).trim());
          return Number.isFinite(numeric) ? Math.max(120, Math.round(numeric * 1000)) : fallbackMs;
        }

        const numeric = Number.parseFloat(normalized);
        return Number.isFinite(numeric) ? Math.max(120, numeric) : fallbackMs;
      },
      getMotionDurationMs(index, phase = 'open') {
        const card = this.getCardElement(index);
        const fallbackByPhase = {
          open: 860,
          close: 520
        };
        const varByPhase = {
          open: '--program-open-duration',
          close: '--program-close-duration'
        };
        const normalizedPhase = Object.prototype.hasOwnProperty.call(varByPhase, phase) ? phase : 'open';
        const fallbackDuration = fallbackByPhase[normalizedPhase];

        if (!card) {
          return fallbackDuration;
        }

        const raw = window.getComputedStyle(card).getPropertyValue(varByPhase[normalizedPhase]) || '';
        return this.parseDurationMs(raw, fallbackDuration);
      },
      getProgramCards() {
        const root = this.$el;

        if (!root || typeof root.querySelectorAll !== 'function') {
          return [];
        }

        return Array.from(root.querySelectorAll('.program-card'));
      },
      captureProgramCardRects() {
        const rects = new Map();

        this.getProgramCards().forEach((card, index) => {
          rects.set(index, card.getBoundingClientRect());
        });

        return rects;
      },
      animateProgramFlip(beforeRects, durationMs, easing = 'cubic-bezier(0.45, 0, 0.55, 1)') {
        const cards = this.getProgramCards();

        if (!cards.length || !beforeRects || !beforeRects.size || durationMs <= 0) {
          return Promise.resolve();
        }

        const animatedCards = [];
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
        const maxFlipDistance = Math.max(160, Math.round(viewportHeight * 0.24));

        cards.forEach((card, index) => {
          const beforeRect = beforeRects.get(index);

          if (!beforeRect) {
            return;
          }

          const afterRect = card.getBoundingClientRect();
          const deltaY = beforeRect.top - afterRect.top;

          if (!Number.isFinite(deltaY) || Math.abs(deltaY) < 0.5) {
            return;
          }

          if (Math.abs(deltaY) > maxFlipDistance) {
            return;
          }

          card.style.transition = 'none';
          card.style.transform = `translate3d(0, ${deltaY.toFixed(2)}px, 0)`;
          card.style.willChange = 'transform';
          animatedCards.push(card);
        });

        if (!animatedCards.length) {
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          let finished = false;
          let completed = 0;
          let timeoutId = 0;
          const totalCards = cards.length;

          cards.forEach((card, index) => {
            // Keep paint order deterministic during FLIP:
            // top cards always stay above lower cards while transforms are in flight.
            card.style.zIndex = String(totalCards - index);
          });

          const cleanup = () => {
            cards.forEach((card) => {
              card.removeEventListener('transitionend', handleTransitionEnd);
              card.style.transition = '';
              card.style.transform = '';
              card.style.willChange = '';
              card.style.zIndex = '';
            });
            window.clearTimeout(timeoutId);
          };

          const done = () => {
            if (finished) {
              return;
            }

            finished = true;
            cleanup();
            resolve();
          };

          const handleTransitionEnd = (event) => {
            if (!event || event.propertyName !== 'transform') {
              return;
            }

            completed += 1;

            if (completed >= animatedCards.length) {
              done();
            }
          };

          animatedCards.forEach((card) => {
            // Ensure inverse transforms are committed before the animated frame.
            card.getBoundingClientRect();
          });

          window.requestAnimationFrame(() => {
            animatedCards.forEach((card) => {
              card.addEventListener('transitionend', handleTransitionEnd);
              card.style.transition = `transform ${Math.max(120, Math.round(durationMs))}ms ${easing}`;
              card.style.transform = 'translate3d(0, 0, 0)';
            });

            timeoutId = window.setTimeout(done, Math.max(120, Math.round(durationMs)) + 96);
          });
        });
      },
      getPanelHeightValue(index) {
        const raw = this.panelHeights[index] || '0';
        const numeric = Number.parseFloat(raw);
        return Number.isFinite(numeric) ? numeric : 0;
      },
      getSyncDuration(targetTop, panelDuration) {
        const currentTop = window.scrollY || window.pageYOffset || 0;
        const distance = Math.abs(targetTop - currentTop);
        const scrollVelocityPxMs = 2.6;
        const distanceDuration = distance / scrollVelocityPxMs;
        const minDuration = Math.max(420, Math.round(panelDuration * 0.92));
        const maxDuration = Math.max(minDuration + 260, Math.round(panelDuration * 2.05));
        const syncDuration = Math.max(panelDuration, distanceDuration);
        return Math.max(minDuration, Math.min(maxDuration, Math.round(syncDuration)));
      },
      getSyncEasing(progress) {
        const clamped = Math.max(0, Math.min(1, progress));
        return clamped < 0.5
          ? 4 * clamped * clamped * clamped
          : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
      },
      animateScrollTo(targetTop, durationMs, easingFn = (value) => this.getSyncEasing(value)) {
        const startTop = window.scrollY || window.pageYOffset || 0;
        const delta = targetTop - startTop;

        if (Math.abs(delta) < 1 || durationMs <= 0) {
          window.scrollTo(0, targetTop);
          return Promise.resolve();
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

        return new Promise((resolve) => {
          const start = performance.now();
          const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.max(0, Math.min(1, elapsed / durationMs));
            const eased = easingFn(progress);
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
            resolve();
          };

          this.scrollFrameId = window.requestAnimationFrame(tick);
        });
      },
      resolveCardTargetTop(index, options = {}) {
        const card = this.getCardElement(index);
        const panelWrap = this.getPanelWrap(index);

        if (!card || !panelWrap) {
          return null;
        }

        const rect = card.getBoundingClientRect();
        const predictedTopShift = Number.isFinite(options.predictedTopShift)
          ? Number(options.predictedTopShift)
          : 0;
        const predictedRectTop = rect.top + predictedTopShift;
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
        const predictedBottom = predictedRectTop + predictedCardHeight;
        if (fitsViewport) {
          return this.clampScrollTop(currentTop + predictedRectTop - topPadding, viewportHeight);
        }

        const preferredBottom = viewportHeight - bottomPadding;
        return this.clampScrollTop(currentTop + predictedBottom - preferredBottom, viewportHeight);
      },
      setRuntimeMotion(index, durationMs) {
        const card = this.getCardElement(index);

        if (!card) {
          return;
        }

        card.style.setProperty('--program-panel-duration', `${Math.max(120, Math.round(durationMs))}ms`);
        card.style.setProperty('--program-panel-ease', 'cubic-bezier(0.45, 0, 0.55, 1)');
      },
      resetRuntimeMotion(index) {
        const card = this.getCardElement(index);

        if (!card) {
          return;
        }

        card.style.removeProperty('--program-panel-duration');
        card.style.removeProperty('--program-panel-ease');
      },
      async runProgramTransition(currentIndex, nextIndex) {
        const openingIndex = nextIndex >= 0 ? nextIndex : -1;
        const closingIndex = currentIndex >= 0 && currentIndex !== nextIndex ? currentIndex : -1;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const beforeRects = this.captureProgramCardRects();

        if (openingIndex >= 0) {
          this.updatePanelHeight(openingIndex);
        }

        const targetPanelHeight = openingIndex >= 0 ? this.getPanelHeightValue(openingIndex) : 0;
        const closingPanelWrap = closingIndex >= 0 ? this.getPanelWrap(closingIndex) : null;
        const closingPanelHeight = closingPanelWrap
          ? Math.max(0, Math.round(closingPanelWrap.getBoundingClientRect().height))
          : 0;
        const predictedTopShift = openingIndex > closingIndex ? -closingPanelHeight : 0;
        const predictedTargetTop = openingIndex >= 0
          ? this.resolveCardTargetTop(openingIndex, {
              targetPanelHeight,
              predictedTopShift
            })
          : null;
        const baseDuration = openingIndex >= 0
          ? this.getMotionDurationMs(openingIndex, 'open')
          : this.getMotionDurationMs(closingIndex, 'close');
        const syncDuration = reducedMotion
          ? 0
          : this.getSyncDuration(Number.isFinite(predictedTargetTop) ? predictedTargetTop : window.scrollY || 0, baseDuration);
        const affected = [openingIndex, closingIndex].filter((index, position, list) => {
          return index >= 0 && list.indexOf(index) === position;
        });

        affected.forEach((index) => {
          this.setRuntimeMotion(index, syncDuration || baseDuration);
        });

        this.animatingWebinarIndex = openingIndex >= 0 ? openingIndex : closingIndex;
        this.activeWebinarIndex = nextIndex;
        await this.$nextTick();

        if (openingIndex >= 0) {
          this.bindPanelMediaListeners(openingIndex);
          this.updatePanelHeight(openingIndex);
        }

        const targetTop = openingIndex >= 0
          ? this.resolveCardTargetTop(openingIndex, {
              targetPanelHeight: this.getPanelHeightValue(openingIndex)
            })
          : null;

        if (reducedMotion) {
          if (Number.isFinite(targetTop)) {
            window.scrollTo(0, targetTop);
          }
          this.animatingWebinarIndex = -1;
          affected.forEach((index) => this.resetRuntimeMotion(index));
          this.scheduleJourneyLayout();
          return;
        }

        const flipPromise = this.animateProgramFlip(beforeRects, syncDuration);
        const scrollPromise = Number.isFinite(targetTop)
          ? this.animateScrollTo(targetTop, syncDuration)
          : Promise.resolve();

        await Promise.all([flipPromise, scrollPromise]);
        this.animatingWebinarIndex = -1;
        affected.forEach((index) => this.resetRuntimeMotion(index));
        this.scheduleJourneyLayout();
      },
      async toggleWebinar(index) {
        if (this.isSwitching) {
          return;
        }

        this.isSwitching = true;

        try {
          const current = this.activeWebinarIndex;
          const next = current === index ? -1 : index;
          await this.runProgramTransition(current, next);
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

      <div class="program__list" ref="journeyHost">
        <svg v-if="journeyPath" class="program__journey-svg" :style="getJourneySvgStyle()" :viewBox="getJourneyViewBox()" preserveAspectRatio="none" aria-hidden="true">
          <path class="program__journey-path" :d="journeyPath" />
          <circle
            v-if="journeyStartDot"
            class="program__journey-dot"
            :cx="journeyStartDot.x"
            :cy="journeyStartDot.y"
            r="10"
          />
          <circle
            v-if="journeyEndDot"
            class="program__journey-dot"
            :cx="journeyEndDot.x"
            :cy="journeyEndDot.y"
            r="10"
          />
        </svg>

        <template v-for="(webinar, webinarIndex) in webinars" :key="webinar.title + webinarIndex">
          <div
            v-if="webinarIndex === 0 && hasJourneyMessage(0)"
            :class="getJourneyLabelClass(0)"
            :ref="(el) => setJourneyPointRef(0, el)"
            data-reveal
            data-reveal-delay="80"
          >
            <p class="program__journey-text">{{ getJourneyMessage(0) }}</p>
          </div>

          <article
            class="program-card"
            :class="{
              'program-card--open': isWebinarOpen(webinarIndex),
              'program-card--animating': animatingWebinarIndex === webinarIndex
            }"
            data-reveal
            :data-reveal-delay="110 + (webinarIndex * 40)"
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

                <div v-if="webinar.images.length" class="program-card__gallery">
                  <figure class="program-card__figure">
                    <img
                      v-if="shouldRenderGalleryImage(webinarIndex)"
                      :src="webinar.images[0]"
                      :alt="webinar.title"
                      loading="eager"
                      decoding="async"
                      data-fade-image
                    />
                  </figure>
                </div>
              </div>
            </div>
          </article>

          <div
            v-if="hasJourneyMessage(webinarIndex + 1)"
            :class="getJourneyLabelClass(webinarIndex + 1)"
            :ref="(el) => setJourneyPointRef(webinarIndex + 1, el)"
            data-reveal
            :data-reveal-delay="140 + (webinarIndex * 40)"
          >
            <p class="program__journey-text">{{ getJourneyMessage(webinarIndex + 1) }}</p>
          </div>
        </template>
      </div>

      <p class="program__mobile-note" data-reveal data-reveal-delay="360">{{ program.mobileNote }}</p>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.ProgramSection = ProgramSection;
})();
