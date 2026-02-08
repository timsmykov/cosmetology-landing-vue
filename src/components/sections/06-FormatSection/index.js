(function registerFormatSection() {
  const FormatSection = {
    name: 'FormatSection',
    data() {
      const source = (window.Landing && window.Landing.content && window.Landing.content.format) || {};

      const format = {
        title: '',
        text: '',
        features: [],
        ...source
      };

      const features = Array.isArray(format.features)
        ? format.features.map((feature) => ({
            title: feature && feature.title ? feature.title : '',
            text: feature && feature.text ? feature.text : ''
          }))
        : [];

      return {
        format,
        features
      };
    },
    template: `
<section class="format section" id="format" aria-labelledby="format-title">
  <div class="container">
    <div class="format__surface">
      <header class="format__header">
        <p class="format__kicker">Удобная модель обучения</p>
        <h2 class="section-title format__title" id="format-title">{{ format.title }}</h2>
        <p class="section-text format__text">{{ format.text }}</p>
      </header>

      <div class="format__grid">
        <article
          class="format__item"
          v-for="(feature, index) in features"
          :key="feature.title + index"
        >
          <p class="format__index">{{ String(index + 1).padStart(2, '0') }}</p>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.text }}</p>
        </article>
      </div>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.FormatSection = FormatSection;
})();
