(function registerTeamSection() {
  const TeamSection = {
    name: 'TeamSection',
    data() {
      const source = (window.Landing && window.Landing.content && window.Landing.content.team) || {};
      const team = {
        title: '',
        expertsTitle: '',
        leads: [],
        experts: [],
        ...source
      };

      return {
        team,
        leads: Array.isArray(team.leads) ? team.leads : [],
        experts: Array.isArray(team.experts) ? team.experts : [],
        isTabletUp: false,
        openExperts: {},
        closingExperts: {},
        animatingExperts: {},
        switchingExperts: {},
        expertBodyRefs: {},
        expertHeights: {},
        resizeFrameId: 0
      };
    },
    mounted() {
      this.syncViewportMode();
      window.addEventListener('resize', this.handleResize, { passive: true });
      this.$nextTick(() => {
        this.initializeTyping();
        this.updateAllExpertHeights();
        this.syncViewportMode();
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
      nextTickAsync() {
        return new Promise((resolve) => {
          this.$nextTick(resolve);
        });
      },
      nextFrameAsync() {
        return new Promise((resolve) => {
          window.requestAnimationFrame(() => resolve());
        });
      },
      getTypingApi() {
        return window.Landing && window.Landing.typing;
      },
      getExpertContent(index) {
        const body = this.expertBodyRefs[index];

        if (!body) {
          return null;
        }

        return body.querySelector('.team__expert-body-inner');
      },
      getExpertBody(index) {
        return this.expertBodyRefs[index] || null;
      },
      setExpertAnimationVars(index, payload = {}) {
        const body = this.getExpertBody(index);

        if (!body) {
          return;
        }

        if (Number.isFinite(payload.height)) {
          body.style.setProperty('--expert-height', `${Math.max(0, Math.ceil(payload.height))}px`);
        }
      },
      initializeTyping() {
        const typing = this.getTypingApi();

        if (!typing) {
          return;
        }

        this.experts.forEach((_, index) => {
          const expertContent = this.getExpertContent(index);

          if (!expertContent) {
            return;
          }

          typing.setProgress(expertContent, this.isTabletUp ? 1 : 0);
        });
      },
      detectTabletUp() {
        return window.matchMedia('(min-width: 48em)').matches;
      },
      syncViewportMode() {
        const nextMode = this.detectTabletUp();

        if (nextMode === this.isTabletUp) {
          return;
        }

        this.isTabletUp = nextMode;
        this.openExperts = {};
        this.closingExperts = {};
        this.animatingExperts = {};
        this.switchingExperts = {};

        const typing = this.getTypingApi();

        if (!typing) {
          return;
        }

        this.experts.forEach((_, index) => {
          const expertContent = this.getExpertContent(index);

          if (!expertContent) {
            return;
          }

          typing.setProgress(expertContent, this.isTabletUp ? 1 : 0);
        });
      },
      handleResize() {
        if (this.resizeFrameId) {
          return;
        }

        this.resizeFrameId = window.requestAnimationFrame(() => {
          this.resizeFrameId = 0;
          this.syncViewportMode();
          this.updateAllExpertHeights();
        });
      },
      setExpertBodyRef(index, el) {
        if (!el) {
          return;
        }

        this.expertBodyRefs[index] = el;
        this.updateExpertHeight(index);
      },
      updateExpertHeight(index, options = {}) {
        const expertContent = this.getExpertContent(index);

        if (!expertContent) {
          return;
        }

        const typing = this.getTypingApi();
        const useCurrent = Boolean(options.useCurrent);
        const measured = useCurrent || !typing
          ? Math.ceil(expertContent.scrollHeight + 1)
          : typing.measureHeight(expertContent, () => Math.ceil(expertContent.scrollHeight + 1));

        this.expertHeights[index] = `${measured}px`;
      },
      updateAllExpertHeights() {
        this.experts.forEach((_, index) => {
          this.updateExpertHeight(index);
        });
      },
      isExpertOpen(index) {
        if (this.isTabletUp) {
          return true;
        }

        return Boolean(this.openExperts[index]) || Boolean(this.closingExperts[index]);
      },
      isExpertSwitching(index) {
        return Boolean(this.switchingExperts[index]);
      },
      setExpertOpen(index, value) {
        this.openExperts = {
          ...this.openExperts,
          [index]: Boolean(value)
        };
      },
      setExpertClosing(index, value) {
        this.closingExperts = {
          ...this.closingExperts,
          [index]: Boolean(value)
        };
      },
      setExpertSwitching(index, value) {
        this.switchingExperts = {
          ...this.switchingExperts,
          [index]: Boolean(value)
        };
      },
      setExpertAnimating(index, value) {
        this.animatingExperts = {
          ...this.animatingExperts,
          [index]: Boolean(value)
        };
      },
      getExpertBodyStyle(index) {
        if (this.isTabletUp) {
          return null;
        }

        return {
          '--expert-height': this.expertHeights[index] || '0px'
        };
      },
      getExpertButtonId(index) {
        return `team-expert-button-${index}`;
      },
      getExpertPanelId(index) {
        return `team-expert-panel-${index}`;
      },
      getFullExpertHeight(index) {
        const expertContent = this.getExpertContent(index);

        if (!expertContent) {
          return 0;
        }

        const typing = this.getTypingApi();
        const measured = typing
          ? typing.measureHeight(expertContent, () => Math.ceil(expertContent.scrollHeight + 1))
          : Math.ceil(expertContent.scrollHeight + 1);

        return Math.max(0, measured);
      },
      async playTyping(index, direction, options = {}) {
        const typing = this.getTypingApi();
        const expertContent = this.getExpertContent(index);

        if (!typing || !expertContent) {
          return;
        }

        const collapseWithPanel = Boolean(options.collapseWithPanel);
        const fullHeight = collapseWithPanel ? this.getFullExpertHeight(index) : 0;
        const normalizedFullHeight = Math.ceil(Math.max(0, fullHeight));

        if (direction === 'forward') {
          typing.setProgress(expertContent, 0);
          this.setExpertAnimationVars(index, { height: 0 });
        } else if (collapseWithPanel) {
          this.expertHeights[index] = `${normalizedFullHeight}px`;
          this.setExpertAnimationVars(index, { height: normalizedFullHeight });
          await this.nextFrameAsync();
          this.expertHeights[index] = '0px';
          this.setExpertAnimationVars(index, { height: 0 });
        }

        if (collapseWithPanel && direction === 'forward') {
          this.expertHeights[index] = '0px';
          await this.nextFrameAsync();
          this.expertHeights[index] = `${normalizedFullHeight}px`;
          this.setExpertAnimationVars(index, { height: normalizedFullHeight });
        }

        const animateOptions = {
          duration: Number.isFinite(options.duration) ? options.duration : 420
        };

        if (Array.isArray(options.progressWindow) && options.progressWindow.length === 2) {
          animateOptions.progressWindow = options.progressWindow;
        }

        await typing.animate(expertContent, direction, animateOptions);
        const finalProgress = direction === 'forward' ? 1 : 0;
        this.setExpertAnimationVars(index, { height: normalizedFullHeight * finalProgress });
        this.expertHeights[index] = `${Math.ceil(normalizedFullHeight * finalProgress)}px`;
      },
      async toggleExpert(index) {
        if (this.isTabletUp) {
          return;
        }

        if (this.isExpertSwitching(index)) {
          return;
        }

        this.setExpertSwitching(index, true);

        try {
          const duration = 420;
          const shouldClose = Boolean(this.openExperts[index]);

          if (shouldClose) {
            this.setExpertClosing(index, true);
            this.setExpertAnimating(index, true);
            this.expertHeights[index] = `${this.getFullExpertHeight(index)}px`;
            await this.playTyping(index, 'reverse', {
              collapseWithPanel: true,
              duration,
              progressWindow: [0.34, 0.98]
            });
            this.setExpertOpen(index, false);
            this.setExpertClosing(index, false);
            this.setExpertAnimating(index, false);
            await this.nextTickAsync();
            return;
          }

          this.setExpertOpen(index, true);
          this.setExpertAnimating(index, true);
          await this.nextTickAsync();
          await this.playTyping(index, 'forward', {
            collapseWithPanel: true,
            duration,
            progressWindow: [0.34, 0.98]
          });
          this.setExpertAnimating(index, false);
        } finally {
          this.setExpertSwitching(index, false);
        }
      }
    },
    template: `
<section class="team section" id="team" aria-labelledby="team-title">
  <div class="container">
    <div class="team__surface" data-reveal="zoom">
      <header class="team__header" data-reveal data-reveal-delay="40">
        <p class="team__kicker">Кто вас ведёт</p>
        <h2 class="section-title team__title" id="team-title" data-reveal data-reveal-delay="100">{{ team.title }}</h2>
      </header>

      <div class="team__leads">
        <article
          class="team__lead"
          v-for="(lead, leadIndex) in leads"
          :key="lead.name + leadIndex"
          data-reveal
          :data-reveal-delay="140 + (leadIndex * 90)"
        >
          <div class="team__photo-frame">
            <img class="team__photo" :src="lead.photo" :alt="lead.name" loading="lazy" data-fade-image />
          </div>
          <h3>{{ lead.name }}</h3>
          <p class="team__role">{{ lead.role }}</p>
          <ul>
            <li
              v-for="(point, pointIndex) in (Array.isArray(lead.points) ? lead.points : [])"
              :key="lead.name + point + pointIndex"
            >
              {{ point }}
            </li>
          </ul>
        </article>
      </div>

      <div class="team__experts-wrap">
        <h3 class="team__subtitle" data-reveal data-reveal-delay="260">{{ team.expertsTitle }}</h3>

        <div class="team__experts">
          <article
            class="team__expert"
            :class="{
              'team__expert--open': isExpertOpen(index),
              'team__expert--closing': closingExperts[index],
              'team__expert--animating': animatingExperts[index]
            }"
            v-for="(expert, index) in experts"
            :key="expert.name + index"
            data-reveal
            :data-reveal-delay="300 + (index * 90)"
          >
            <button
              v-if="!isTabletUp"
              class="team__expert-summary"
              type="button"
              :id="getExpertButtonId(index)"
              :aria-expanded="isExpertOpen(index) ? 'true' : 'false'"
              :aria-controls="getExpertPanelId(index)"
              @click="toggleExpert(index)"
            >
              <span class="team__expert-name">{{ expert.name }}</span>
              <span class="team__role">{{ expert.role }}</span>
              <span class="team__expert-icon" aria-hidden="true"></span>
            </button>
            <div v-else class="team__expert-summary">
              <span class="team__expert-name">{{ expert.name }}</span>
              <span class="team__role">{{ expert.role }}</span>
            </div>

            <div
              class="team__expert-body"
              :class="{ 'team__expert-body--open': isExpertOpen(index) }"
              :style="getExpertBodyStyle(index)"
              :ref="(el) => setExpertBodyRef(index, el)"
              :id="getExpertPanelId(index)"
              role="region"
              :aria-labelledby="isTabletUp ? null : getExpertButtonId(index)"
              :aria-hidden="isExpertOpen(index) ? 'false' : 'true'"
            >
              <div class="team__expert-body-inner">
                <p data-type-text>{{ expert.text }}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.TeamSection = TeamSection;
})();
