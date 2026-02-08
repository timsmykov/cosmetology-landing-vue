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
        resizeFrameId: 0
      };
    },
    mounted() {
      window.addEventListener('resize', this.handleResize, { passive: true });
      this.$nextTick(() => {
        this.updateAllPanelHeights();
      });
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
      if (this.resizeFrameId) {
        window.cancelAnimationFrame(this.resizeFrameId);
        this.resizeFrameId = 0;
      }
    },
    methods: {
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
      getPanelStyle(index) {
        return {
          '--panel-height': this.panelHeights[index] || '0px'
        };
      },
      waitForPanelTransition(index, timeoutMs = 560) {
        const panelWrap = this.getPanelWrap(index);

        if (!panelWrap) {
          return Promise.resolve();
        }

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
          timeoutId = window.setTimeout(done, timeoutMs);
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
      focusCardInViewport(index, options = {}) {
        const card = this.getCardElement(index);
        const panelWrap = this.getPanelWrap(index);

        if (!card || !panelWrap) {
          return;
        }

        const rect = card.getBoundingClientRect();
        const currentPanelHeight = Math.max(0, Math.round(panelWrap.getBoundingClientRect().height));
        const targetPanelHeight = Number.isFinite(options.targetPanelHeight)
          ? Math.max(0, Math.round(options.targetPanelHeight))
          : currentPanelHeight;
        const predictedCardHeight = Math.max(
          0,
          Math.round(rect.height - currentPanelHeight + targetPanelHeight)
        );
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
        const currentTop = window.scrollY || window.pageYOffset || 0;
        const topPadding = Math.max(14, Math.round(viewportHeight * 0.08));
        const bottomPadding = Math.max(14, Math.round(viewportHeight * 0.1));
        const fitsViewport = predictedCardHeight + topPadding + bottomPadding <= viewportHeight;
        let targetTop = currentTop;

        if (fitsViewport) {
          const centeredTop = (viewportHeight - predictedCardHeight) / 2;
          targetTop = currentTop + rect.top - centeredTop;
        } else {
          const preferredTop = topPadding;
          const preferredBottom = viewportHeight - bottomPadding;
          const predictedBottom = rect.top + predictedCardHeight;
          const needsAdjustment = rect.top < preferredTop || predictedBottom > preferredBottom;

          if (!needsAdjustment) {
            return;
          }

          targetTop = currentTop + rect.top - preferredTop;
        }

        targetTop = Math.max(0, Math.round(targetTop));

        if (Math.abs(targetTop - currentTop) < 6) {
          return;
        }

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
          top: targetTop,
          behavior: reducedMotion ? 'auto' : (options.behavior || 'smooth')
        });
      },
      async closePanel(index) {
        if (index < 0) {
          return;
        }

        const transitionPromise = this.waitForPanelTransition(index);
        this.animatingWebinarIndex = index;
        this.activeWebinarIndex = -1;
        await transitionPromise;
        this.animatingWebinarIndex = -1;
      },
      async openPanel(index) {
        if (index < 0) {
          return;
        }

        this.ensurePanelHeight(index);
        const targetPanelHeight = this.getPanelHeightValue(index);
        const transitionPromise = this.waitForPanelTransition(index);
        this.animatingWebinarIndex = index;
        this.activeWebinarIndex = index;
        this.focusCardInViewport(index, {
          behavior: 'smooth',
          targetPanelHeight
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

          if (current >= 0) {
            await this.closePanel(current);
          }

          if (!closeOnly) {
            await this.openPanel(index);
          }
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
