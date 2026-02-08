(function registerFinalSection() {
  const FinalSection = {
    name: 'FinalSection',
    data() {
      const final = (window.Landing && window.Landing.content && window.Landing.content.final) || {};

      return {
        final
      };
    },
    template: `
<section class="final section" id="final">
  <div class="container">
    <div class="final__alert">
      <h3>{{ final.alert.title }}</h3>
      <p><strong>{{ final.alert.countdown }}</strong></p>
      <p><strong>{{ final.alert.deadline }}</strong></p>
      <p>{{ final.alert.text }}</p>
    </div>

    <h2 class="section-title">{{ final.title }}</h2>
    <p class="section-text">{{ final.text }}</p>

    <ul class="final__tags">
      <li v-for="tag in final.tags" :key="tag">{{ tag }}</li>
    </ul>

    <div class="final__actions">
      <a class="btn btn--primary" href="#pricing">{{ final.actions.primary }}</a>
      <a class="btn btn--ghost" href="#program">{{ final.actions.secondary }}</a>
    </div>

    <p class="final__meta">{{ final.meta }}</p>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.FinalSection = FinalSection;
})();
