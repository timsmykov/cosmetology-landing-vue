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
        activeIndex: items.length ? 0 : -1,
        faqContent,
        items
      };
    },
    methods: {
      toggle(index) {
        this.activeIndex = this.activeIndex === index ? -1 : index;
      },
      isOpen(index) {
        return this.activeIndex === index;
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
    <div class="faq__surface">
      <header class="faq__header">
        <p class="faq__kicker">Ответы и поддержка</p>
        <h2 class="section-title faq__title" id="faq-title">{{ faqContent.title }}</h2>
      </header>

      <div class="faq__list">
        <article class="faq__item" :class="{ 'faq__item--open': isOpen(index) }" v-for="(item, index) in items" :key="item.q + index">
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
              <span class="faq__icon" aria-hidden="true">{{ isOpen(index) ? '−' : '+' }}</span>
            </button>
          </h3>

          <div
            class="faq__answer-wrap"
            :class="{ 'faq__answer-wrap--open': isOpen(index) }"
            :id="getAnswerId(index)"
            role="region"
            :aria-labelledby="getQuestionId(index)"
            :aria-hidden="isOpen(index) ? 'false' : 'true'"
          >
            <p class="faq__answer">{{ item.a }}</p>
          </div>
        </article>
      </div>

      <div class="faq__cta">
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
