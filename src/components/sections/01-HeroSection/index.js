(function registerHeroSection() {
  const HeroSection = {
    name: 'HeroSection',
    data() {
      const hero = (window.Landing && window.Landing.content && window.Landing.content.hero) || {};

      return {
        hero
      };
    },
    template: `
<section class="hero section" id="hero">
  <div class="container hero__container">
    <p class="hero__kicker">{{ hero.kicker }}</p>
    <h1 class="hero__title">
      <span>{{ hero.titleHighlight }}</span>
      {{ hero.titleText }}
    </h1>
    <p class="hero__text">
      {{ hero.description }}
    </p>
    <div class="hero__actions">
      <a class="btn btn--primary" href="#pricing">{{ hero.actions.primary }}</a>
      <a class="btn btn--ghost" href="#program">{{ hero.actions.secondary }}</a>
    </div>
    <p class="hero__meta">{{ hero.meta }}</p>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.HeroSection = HeroSection;
})();
