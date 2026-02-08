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
          secondary: ''
        },
        steps: [],
        mobileNote: '',
        webinars: [],
        ...source,
        actions: {
          primary: '',
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
              previewImage: normalizedImages[0],
              images: normalizedImages
            };
          })
        : [];

      return {
        activeWebinarIndex: -1,
        closingWebinarIndex: -1,
        animatingWebinarIndex: -1,
        isSwitching: false,
        program,
        webinars,
        panelRefs: {},
        panelHeights: {}
      };
    },
    mounted() {
      window.addEventListener('resize', this.handleResize, { passive: true });
      this.$nextTick(() => {
        this.initializeTyping();
        this.updateAllPanelHeights();
      });
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      nextTickAsync() {
        return new Promise((resolve) => {
          this.$nextTick(resolve);
        });
      },
      getTypingApi() {
        return window.Landing && window.Landing.typing;
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
      setPanelAnimationVars(index, payload = {}) {
        const panelWrap = this.getPanelWrap(index);

        if (!panelWrap) {
          return;
        }

        if (Number.isFinite(payload.height)) {
          panelWrap.style.setProperty('--panel-height', `${Math.max(0, Math.ceil(payload.height))}px`);
        }

        if (Number.isFinite(payload.progress)) {
          panelWrap.style.setProperty(
            '--panel-progress',
            String(Math.max(0, Math.min(1, payload.progress)))
          );
        }
      },
      initializeTyping() {
        const typing = this.getTypingApi();

        if (!typing) {
          return;
        }

        this.webinars.forEach((_, index) => {
          const panel = this.getPanelContent(index);

          if (!panel) {
            return;
          }

          typing.setProgress(panel, 0);
        });
      },
      handleResize() {
        this.updateAllPanelHeights();
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
            this.updatePanelHeight(index);
          };

          image.addEventListener('load', recalc, { once: true });
          image.addEventListener('error', recalc, { once: true });
        });

        panelWrap.dataset.panelMediaBound = 'true';
      },
      updatePanelHeight(index, options = {}) {
        const panel = this.getPanelContent(index);

        if (!panel) {
          return;
        }

        const typing = this.getTypingApi();
        const useCurrent = Boolean(options.useCurrent);
        const measured = useCurrent || !typing
          ? Math.ceil(panel.scrollHeight + 1)
          : typing.measureHeight(panel, () => Math.ceil(panel.scrollHeight + 1));

        this.panelHeights[index] = `${measured}px`;
      },
      updateAllPanelHeights() {
        this.webinars.forEach((_, index) => {
          this.updatePanelHeight(index);
        });
      },
      getFullPanelHeight(index) {
        const panel = this.getPanelContent(index);

        if (!panel) {
          return 0;
        }

        const typing = this.getTypingApi();
        const measured = typing
          ? typing.measureHeight(panel, () => Math.ceil(panel.scrollHeight + 1))
          : Math.ceil(panel.scrollHeight + 1);

        return Math.max(0, measured);
      },
      getPanelStyle(index) {
        return {
          '--panel-height': this.panelHeights[index] || '0px'
        };
      },
      async playTyping(index, direction, options = {}) {
        const typing = this.getTypingApi();
        const panel = this.getPanelContent(index);

        if (!typing || !panel) {
          return;
        }

        const collapseWithPanel = Boolean(options.collapseWithPanel);
        const fullHeight = collapseWithPanel ? this.getFullPanelHeight(index) : 0;

        if (direction === 'forward') {
          typing.setProgress(panel, 0);
          this.panelHeights[index] = '0px';
          await this.nextTickAsync();
          this.setPanelAnimationVars(index, { height: 0, progress: 0 });
        }

        const animateOptions = {
          duration: Number.isFinite(options.duration) ? options.duration : 420
        };

        if (Array.isArray(options.progressWindow) && options.progressWindow.length === 2) {
          animateOptions.progressWindow = options.progressWindow;
        }

        if (collapseWithPanel) {
          animateOptions.onUpdate = (progress) => {
            const nextHeight = Math.ceil(fullHeight * Math.max(0, Math.min(1, progress)));
            this.setPanelAnimationVars(index, {
              height: nextHeight,
              progress
            });
          };
        }

        await typing.animate(panel, direction, animateOptions);

        const finalProgress = direction === 'forward' ? 1 : 0;
        this.setPanelAnimationVars(index, {
          height: fullHeight * finalProgress,
          progress: finalProgress
        });
        this.panelHeights[index] = `${Math.ceil(fullHeight * finalProgress)}px`;
      },
      async toggleWebinar(index) {
        if (this.isSwitching) {
          return;
        }

        this.isSwitching = true;

        try {
          const duration = 420;
          const current = this.activeWebinarIndex;
          const closeOnly = current === index;

          if (current >= 0) {
            this.closingWebinarIndex = current;
            this.animatingWebinarIndex = current;
            this.panelHeights[current] = `${this.getFullPanelHeight(current)}px`;
            await this.playTyping(current, 'reverse', {
              collapseWithPanel: true,
              duration,
              progressWindow: [0.34, 0.98]
            });
            this.activeWebinarIndex = -1;
            this.closingWebinarIndex = -1;
            this.animatingWebinarIndex = -1;
            await this.nextTickAsync();
          }

          if (!closeOnly) {
            this.activeWebinarIndex = index;
            this.animatingWebinarIndex = index;
            await this.nextTickAsync();
            await this.playTyping(index, 'forward', {
              collapseWithPanel: true,
              duration,
              progressWindow: [0.34, 0.98]
            });
            this.animatingWebinarIndex = -1;
          }
        } finally {
          this.isSwitching = false;
        }
      },
      isWebinarOpen(index) {
        return this.activeWebinarIndex === index || this.closingWebinarIndex === index;
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
        <a class="btn btn--primary program__btn" href="#pricing">{{ program.actions.primary }}</a>
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
                <img :src="webinar.previewImage" :alt="webinar.title" loading="lazy" data-fade-image />
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
              <p class="program-card__text" data-type-text>{{ webinar.text }}</p>
              <h4 data-type-text>Чему вы научитесь:</h4>
              <ul>
                <li v-for="(item, itemIndex) in webinar.learn" :key="webinar.title + item + itemIndex" data-type-text>{{ item }}</li>
              </ul>

              <div class="program-card__gallery">
                <figure class="program-card__figure" v-for="(img, imageIndex) in webinar.images" :key="webinar.title + img + imageIndex">
                  <img :src="img" :alt="webinar.title" loading="lazy" data-fade-image />
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
