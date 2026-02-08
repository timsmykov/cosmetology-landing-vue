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
        tags: [],
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
        final,
        tags: Array.isArray(final.tags) ? final.tags : []
      };
    },
    template: `
<section class="final section" id="final" aria-labelledby="final-title">
  <div class="container">
    <div class="final__surface">
      <div class="final__alert" role="status" aria-live="polite">
        <h3>{{ final.alert.title }}</h3>
        <p class="final__alert-strong">{{ final.alert.countdown }}</p>
        <p class="final__alert-strong">{{ final.alert.deadline }}</p>
        <p class="final__alert-text">{{ final.alert.text }}</p>
      </div>

      <header class="final__header">
        <p class="final__kicker">Финальный шаг</p>
        <h2 class="section-title final__title" id="final-title">{{ final.title }}</h2>
        <p class="section-text final__text">{{ final.text }}</p>
      </header>

      <ul class="final__tags" aria-label="Что получите на интенсиве">
        <li v-for="(tag, index) in tags" :key="tag + index">{{ tag }}</li>
      </ul>

      <div class="final__actions">
        <a class="btn btn--primary final__btn" href="#pricing">{{ final.actions.primary }}</a>
        <a class="btn btn--ghost final__btn" href="#program">{{ final.actions.secondary }}</a>
      </div>

      <p class="final__meta">{{ final.meta }}</p>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.FinalSection = FinalSection;
})();
