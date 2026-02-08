(function registerPositioningSection() {
  const PositioningSection = {
    name: 'PositioningSection',
    data() {
      const positioning =
        (window.Landing && window.Landing.content && window.Landing.content.positioning) || {};

      return {
        positioning
      };
    },
    template: `
<section class="positioning section" id="about">
  <div class="container">
    <h2 class="section-title">{{ positioning.title }}</h2>

    <div class="positioning__grid">
      <article class="positioning__card" v-for="item in positioning.pillars" :key="item.title">
        <h3>{{ item.title }}</h3>
        <p>{{ item.text }}</p>
      </article>
    </div>

    <div class="positioning__quote">{{ positioning.quote }}</div>

    <a class="btn btn--primary" href="#pricing">{{ positioning.action }}</a>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.PositioningSection = PositioningSection;
})();
