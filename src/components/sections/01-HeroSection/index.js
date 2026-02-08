(function registerHeroSection() {
  const HeroSection = {
    name: 'HeroSection',
    data() {
      const sourceHero = (window.Landing && window.Landing.content && window.Landing.content.hero) || {};
      const hero = {
        kicker: '',
        titleHighlight: '',
        titleText: '',
        description: '',
        highlights: [],
        actions: {
          primary: '',
          secondary: ''
        },
        meta: '',
        ...sourceHero,
        actions: {
          primary: '',
          secondary: '',
          ...(sourceHero.actions || {})
        }
      };
      const defaultHighlights = ['6 вебинаров', 'Пошаговое внедрение', 'Фокус на косметологии'];
      const highlights = Array.isArray(hero.highlights) && hero.highlights.length ? hero.highlights : defaultHighlights;

      return {
        hero,
        highlights
      };
    },
    template: `
<section class="hero section" id="hero" aria-labelledby="hero-title">
  <div class="container">
    <div class="hero__surface">
      <div class="hero__layout">
        <div class="hero__content">
          <p class="hero__kicker">{{ hero.kicker }}</p>

          <h1 class="hero__title" id="hero-title">
            <span>{{ hero.titleHighlight }}</span>
            {{ hero.titleText }}
          </h1>

          <p class="hero__text">{{ hero.description }}</p>

          <ul class="hero__highlights" aria-label="Преимущества интенсива">
            <li
              v-for="(highlight, index) in highlights"
              :key="highlight + index"
              class="hero__highlight"
            >
              {{ highlight }}
            </li>
          </ul>

          <div class="hero__actions">
            <a class="btn btn--primary hero__btn" href="#pricing">{{ hero.actions.primary }}</a>
            <a class="btn btn--ghost hero__btn" href="#program">{{ hero.actions.secondary }}</a>
          </div>

          <p class="hero__meta">{{ hero.meta }}</p>
        </div>

        <aside class="hero__visual" aria-hidden="true">
          <div class="hero__orb hero__orb--top"></div>
          <div class="hero__orb hero__orb--bottom"></div>
          <div class="hero__glass">
            <p class="hero__glass-label">AI + Instagram</p>
            <p class="hero__glass-title">Система для косметолога</p>
            <p class="hero__glass-text">Контент, прогрев и заявки по понятному алгоритму.</p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.HeroSection = HeroSection;
})();
