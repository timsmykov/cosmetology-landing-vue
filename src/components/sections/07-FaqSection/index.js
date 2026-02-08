(function registerFaqSection() {
  const FaqSection = {
    name: 'FaqSection',
    data() {
      const source = (window.Landing && window.Landing.content && window.Landing.content.faq) || {};

      const faqContent = {
        title: '',
        items: [],
        cta: {
          text: '',
          supportAction: '',
          buyAction: ''
        },
        ...source,
        cta: {
          text: '',
          supportAction: '',
          buyAction: '',
          ...((source && source.cta) || {})
        }
      };

      const items = Array.isArray(faqContent.items)
        ? faqContent.items.map((item) => ({
            q: item && item.q ? item.q : '',
            a: item && item.a ? item.a : ''
          }))
        : [];

      return {
        activeIndex: -1,
        closingIndex: -1,
        animatingIndex: -1,
        isSwitching: false,
        faqContent,
        items,
        answerRefs: {},
        answerHeights: {}
      };
    },
    mounted() {
      window.addEventListener('resize', this.handleResize, { passive: true });
      this.$nextTick(() => {
        this.initializeTyping();
        this.updateAllAnswerHeights();
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
      getAnswerContent(index) {
        const answerWrap = this.answerRefs[index];

        if (!answerWrap) {
          return null;
        }

        return answerWrap.querySelector('.faq__answer-inner');
      },
      getAnswerWrap(index) {
        return this.answerRefs[index] || null;
      },
      setAnswerAnimationVars(index, payload = {}) {
        const answerWrap = this.getAnswerWrap(index);

        if (!answerWrap) {
          return;
        }

        if (Number.isFinite(payload.height)) {
          answerWrap.style.setProperty('--answer-height', `${Math.max(0, Math.ceil(payload.height))}px`);
        }
      },
      initializeTyping() {
        const typing = this.getTypingApi();

        if (!typing) {
          return;
        }

        this.items.forEach((_, index) => {
          const answer = this.getAnswerContent(index);

          if (!answer) {
            return;
          }

          typing.setProgress(answer, 0);
        });
      },
      handleResize() {
        this.updateAllAnswerHeights();
      },
      setAnswerRef(index, el) {
        if (!el) {
          return;
        }

        this.answerRefs[index] = el;
        this.updateAnswerHeight(index);
      },
      updateAnswerHeight(index, options = {}) {
        const answerInner = this.getAnswerContent(index);

        if (!answerInner) {
          return;
        }

        const typing = this.getTypingApi();
        const useCurrent = Boolean(options.useCurrent);
        const measured = useCurrent || !typing
          ? Math.ceil(answerInner.scrollHeight + 1)
          : typing.measureHeight(answerInner, () => Math.ceil(answerInner.scrollHeight + 1));

        this.answerHeights[index] = `${measured}px`;
      },
      updateAllAnswerHeights() {
        this.items.forEach((_, index) => {
          this.updateAnswerHeight(index);
        });
      },
      getAnswerStyle(index) {
        return {
          '--answer-height': this.answerHeights[index] || '0px'
        };
      },
      getFullAnswerHeight(index) {
        const answerInner = this.getAnswerContent(index);

        if (!answerInner) {
          return 0;
        }

        const typing = this.getTypingApi();
        const measured = typing
          ? typing.measureHeight(answerInner, () => Math.ceil(answerInner.scrollHeight + 1))
          : Math.ceil(answerInner.scrollHeight + 1);

        return Math.max(0, measured);
      },
      async playTyping(index, direction, options = {}) {
        const typing = this.getTypingApi();
        const answerInner = this.getAnswerContent(index);

        if (!typing || !answerInner) {
          return;
        }

        const collapseWithPanel = Boolean(options.collapseWithPanel);
        const fullHeight = collapseWithPanel ? this.getFullAnswerHeight(index) : 0;

        if (direction === 'forward') {
          typing.setProgress(answerInner, 0);
          this.answerHeights[index] = '0px';
          await this.nextTickAsync();
          this.setAnswerAnimationVars(index, { height: 0 });
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
            this.setAnswerAnimationVars(index, { height: nextHeight });
          };
        }

        await typing.animate(answerInner, direction, animateOptions);
        const finalProgress = direction === 'forward' ? 1 : 0;
        this.setAnswerAnimationVars(index, { height: fullHeight * finalProgress });
        this.answerHeights[index] = `${Math.ceil(fullHeight * finalProgress)}px`;
      },
      async toggle(index) {
        if (this.isSwitching) {
          return;
        }

        this.isSwitching = true;

        try {
          const duration = 420;
          const current = this.activeIndex;
          const closeOnly = current === index;

          if (current >= 0) {
            this.closingIndex = current;
            this.animatingIndex = current;
            this.answerHeights[current] = `${this.getFullAnswerHeight(current)}px`;
            await this.playTyping(current, 'reverse', {
              collapseWithPanel: true,
              duration,
              progressWindow: [0.34, 0.98]
            });
            this.activeIndex = -1;
            this.closingIndex = -1;
            this.animatingIndex = -1;
            await this.nextTickAsync();
          }

          if (!closeOnly) {
            this.activeIndex = index;
            this.animatingIndex = index;
            await this.nextTickAsync();
            await this.playTyping(index, 'forward', {
              collapseWithPanel: true,
              duration,
              progressWindow: [0.34, 0.98]
            });
            this.animatingIndex = -1;
          }
        } finally {
          this.isSwitching = false;
        }
      },
      isOpen(index) {
        return this.activeIndex === index || this.closingIndex === index;
      },
      getQuestionId(index) {
        return `faq-question-${index}`;
      },
      getAnswerId(index) {
        return `faq-answer-${index}`;
      }
    },
    template: `
<section class="faq section" id="faq" aria-labelledby="faq-title">
  <div class="container">
    <div class="faq__surface" data-reveal="zoom">
      <header class="faq__header" data-reveal data-reveal-delay="40">
        <p class="faq__kicker">Ответы и поддержка</p>
        <h2 class="section-title faq__title" id="faq-title" data-reveal data-reveal-delay="100">{{ faqContent.title }}</h2>
      </header>

      <div class="faq__list">
        <article
          class="faq__item"
          :class="{
            'faq__item--open': isOpen(index),
            'faq__item--animating': animatingIndex === index
          }"
          v-for="(item, index) in items"
          :key="item.q + index"
          data-reveal
          :data-reveal-delay="170 + (index * 55)"
        >
          <h3 class="faq__question-wrap">
            <button
              class="faq__question"
              type="button"
              :id="getQuestionId(index)"
              :aria-expanded="isOpen(index) ? 'true' : 'false'"
              :aria-controls="getAnswerId(index)"
              @click="toggle(index)"
            >
              <span>{{ item.q }}</span>
              <span class="faq__icon" aria-hidden="true"></span>
            </button>
          </h3>

          <div
            class="faq__answer-wrap"
            :class="{ 'faq__answer-wrap--open': isOpen(index) }"
            :style="getAnswerStyle(index)"
            :ref="(el) => setAnswerRef(index, el)"
            :id="getAnswerId(index)"
            role="region"
            :aria-labelledby="getQuestionId(index)"
            :aria-hidden="isOpen(index) ? 'false' : 'true'"
          >
            <div class="faq__answer-inner">
              <p class="faq__answer" data-type-text>{{ item.a }}</p>
            </div>
          </div>
        </article>
      </div>

      <div class="faq__cta" data-reveal data-reveal-delay="420">
        <p>{{ faqContent.cta.text }}</p>

        <div class="faq__cta-actions">
          <a class="btn btn--ghost faq__btn" href="#pricing">{{ faqContent.cta.supportAction }}</a>
          <a class="btn btn--primary faq__btn" href="#pricing">{{ faqContent.cta.buyAction }}</a>
        </div>
      </div>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.FaqSection = FaqSection;
})();
