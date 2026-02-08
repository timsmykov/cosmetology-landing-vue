(function registerFaqSection() {
  const FaqSection = {
    name: 'FaqSection',
    data() {
      const faqContent = (window.Landing && window.Landing.content && window.Landing.content.faq) || {};

      return {
        activeIndex: 0,
        faqContent
      };
    },
    methods: {
      toggle(index) {
        this.activeIndex = this.activeIndex === index ? -1 : index;
      },
      getQuestionId(index) {
        return `faq-question-${index}`;
      },
      getAnswerId(index) {
        return `faq-answer-${index}`;
      }
    },
    template: `
<section class="faq section" id="faq">
  <div class="container">
    <h2 class="section-title">{{ faqContent.title }}</h2>

    <div class="faq__list">
      <article class="faq__item" v-for="(item, index) in faqContent.items" :key="item.q">
        <button
          class="faq__question"
          type="button"
          :id="getQuestionId(index)"
          :aria-expanded="activeIndex === index ? 'true' : 'false'"
          :aria-controls="getAnswerId(index)"
          @click="toggle(index)"
        >
          <span>{{ item.q }}</span>
          <span class="faq__icon" aria-hidden="true">{{ activeIndex === index ? '−' : '+' }}</span>
        </button>
        <p
          v-show="activeIndex === index"
          class="faq__answer"
          :id="getAnswerId(index)"
          role="region"
          :aria-labelledby="getQuestionId(index)"
        >
          {{ item.a }}
        </p>
      </article>
    </div>

    <div class="faq__cta">
      <p>{{ faqContent.cta.text }}</p>
      <a class="btn btn--ghost" href="#pricing">{{ faqContent.cta.supportAction }}</a>
      <a class="btn btn--primary" href="#pricing">{{ faqContent.cta.buyAction }}</a>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.FaqSection = FaqSection;
})();
