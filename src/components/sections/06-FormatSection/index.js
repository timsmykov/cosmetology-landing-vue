(function registerFormatSection() {
  const FormatSection = {
    name: 'FormatSection',
    data() {
      const format = (window.Landing && window.Landing.content && window.Landing.content.format) || {};

      return {
        format
      };
    },
    template: `
<section class="format section" id="format">
  <div class="container">
    <h2 class="section-title">{{ format.title }}</h2>
    <p class="section-text">{{ format.text }}</p>

    <div class="format__grid">
      <article class="format__item" v-for="feature in format.features" :key="feature.title">
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.text }}</p>
      </article>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.FormatSection = FormatSection;
})();
