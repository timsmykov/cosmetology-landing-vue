(function registerPositioningSection() {
  const PositioningSection = {
    name: 'PositioningSection',
    data() {
      const source =
        (window.Landing && window.Landing.content && window.Landing.content.positioning) || {};

      const positioning = {
        title: '',
        pillars: [],
        quote: '',
        action: '',
        ...source
      };

      const pillars = Array.isArray(positioning.pillars) ? positioning.pillars : [];

      return {
        positioning,
        pillars
      };
    },
    template: `
<section class="positioning section" id="about" aria-labelledby="positioning-title">
  <div class="container">
    <div class="positioning__surface">
      <header class="positioning__header">
        <p class="positioning__kicker">Практический подход</p>
        <h2 class="section-title positioning__title" id="positioning-title">{{ positioning.title }}</h2>
      </header>

      <div class="positioning__grid">
        <article
          class="positioning__card"
          v-for="(item, index) in pillars"
          :key="item.title + index"
        >
          <p class="positioning__index">{{ String(index + 1).padStart(2, '0') }}</p>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>

      <blockquote class="positioning__quote">
        <p>{{ positioning.quote }}</p>
      </blockquote>

      <div class="positioning__footer">
        <a class="btn btn--primary positioning__action" href="#pricing">{{ positioning.action }}</a>
        <p class="positioning__footnote">Формат выстроен так, чтобы внедрять инструменты прямо с телефона.</p>
      </div>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.PositioningSection = PositioningSection;
})();
