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
    <div class="positioning__surface" data-reveal="zoom">
      <header class="positioning__header" data-reveal data-reveal-delay="40">
        <p class="positioning__kicker">Практический подход</p>
        <h2 class="section-title positioning__title" id="positioning-title" data-reveal data-reveal-delay="100">{{ positioning.title }}</h2>
      </header>

      <div class="positioning__grid">
        <article
          class="positioning__card"
          v-for="(item, index) in pillars"
          :key="item.title + index"
          data-reveal
          :data-reveal-delay="140 + (index * 80)"
        >
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>

      <div class="positioning__footer" data-reveal data-reveal-delay="300">
        <a class="btn btn--primary positioning__action" href="#pricing">{{ positioning.action }}</a>
      </div>

      <blockquote class="positioning__quote" data-reveal data-reveal-delay="380">
        <p>{{ positioning.quote }}</p>
      </blockquote>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.PositioningSection = PositioningSection;
})();
