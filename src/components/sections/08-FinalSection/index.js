(function registerFinalSection() {
  const FinalSection = {
    name: 'FinalSection',
    data() {
      const source = (window.Landing && window.Landing.content && window.Landing.content.final) || {};

      const final = {
        alert: {
          title: '',
          countdown: '',
          deadline: '',
          text: ''
        },
        title: '',
        text: '',
        actions: {
          primary: '',
          secondary: ''
        },
        meta: '',
        ...source,
        alert: {
          title: '',
          countdown: '',
          deadline: '',
          text: '',
          ...((source && source.alert) || {})
        },
        actions: {
          primary: '',
          secondary: '',
          ...((source && source.actions) || {})
        }
      };

      return {
        final
      };
    },
    template: `
<section class="final section" id="final" aria-labelledby="final-title">
  <div class="container">
    <div class="final__surface" data-reveal="zoom">
      <div class="final__alert" role="status" aria-live="polite" data-reveal data-reveal-delay="40">
        <span class="final__alert-smoke" aria-hidden="true"></span>
        <h3>{{ final.alert.title }}</h3>
        <p class="final__alert-strong">{{ final.alert.countdown }}</p>
        <p class="final__alert-strong">{{ final.alert.deadline }}</p>
        <p class="final__alert-text">{{ final.alert.text }}</p>
      </div>

      <header class="final__header" data-reveal data-reveal-delay="110">
        <p class="final__kicker">Финальный шаг</p>
        <h2 class="section-title final__title" id="final-title" data-reveal data-reveal-delay="170">{{ final.title }}</h2>
        <p class="section-text final__text" data-reveal data-reveal-delay="220">{{ final.text }}</p>
      </header>

      <div class="final__actions" data-reveal data-reveal-delay="300">
        <a class="btn btn--primary final__btn" href="#pricing">{{ final.actions.primary }}</a>
        <a class="btn btn--ghost final__btn" href="#program">{{ final.actions.secondary }}</a>
      </div>

      <p v-if="final.meta" class="final__meta" data-reveal data-reveal-delay="500">{{ final.meta }}</p>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.FinalSection = FinalSection;
})();
