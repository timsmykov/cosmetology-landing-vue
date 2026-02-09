(function registerProgramCtaSection() {
  const ProgramCtaSection = {
    name: 'ProgramCtaSection',
    data() {
      const program = (window.Landing && window.Landing.content && window.Landing.content.program) || {};
      const sourceActions = (program && program.actions) || {};
      const actions = {
        primary: sourceActions.primary || 'Занять место',
        primaryUrl: sourceActions.primaryUrl || '#pricing',
        secondary: sourceActions.secondary || 'Выбрать вебинар',
        secondaryUrl: '#pricing'
      };

      return {
        actions
      };
    },
    template: `
<section class="program-cta section" id="program-cta" aria-label="Действия после программы">
  <div class="container">
    <div class="program-cta__surface" data-reveal="zoom">
      <div class="program-cta__actions" data-reveal data-reveal-delay="70">
        <a
          class="btn btn--primary program-cta__btn"
          :href="actions.primaryUrl"
          :target="actions.primaryUrl && actions.primaryUrl.indexOf('http') === 0 ? '_blank' : null"
          :rel="actions.primaryUrl && actions.primaryUrl.indexOf('http') === 0 ? 'noopener noreferrer' : null"
        >
          {{ actions.primary }}
        </a>
        <a class="btn btn--ghost program-cta__btn" :href="actions.secondaryUrl">{{ actions.secondary }}</a>
      </div>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.ProgramCtaSection = ProgramCtaSection;
})();
