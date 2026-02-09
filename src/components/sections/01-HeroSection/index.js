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
      const sourceHighlights =
        Array.isArray(hero.highlights) && hero.highlights.length ? hero.highlights : defaultHighlights;
      const highlights = sourceHighlights.slice();
      const hasPhoneMention = highlights.some((item) => /телефон|с телефона/i.test(item));
      const focusIndex = highlights.findIndex((item) => /фокус на косметологии/i.test(item));

      if (!hasPhoneMention) {
        if (focusIndex >= 0) {
          highlights.splice(focusIndex + 1, 0, 'Работа с телефона');
        } else {
          highlights.push('Работа с телефона');
        }
      }

      return {
        hero,
        highlights
      };
    },
    template: `
<section class="hero section" id="hero" aria-labelledby="hero-title">
  <div class="container">
    <div class="hero__surface" data-reveal="zoom">
      <div class="hero__layout">
        <div class="hero__content">
          <p class="hero__kicker" data-reveal data-reveal-delay="40">{{ hero.kicker }}</p>

          <h1 class="hero__title" id="hero-title" data-reveal data-reveal-delay="110">
            <span>{{ hero.titleHighlight }}</span>
            {{ hero.titleText }}
          </h1>

          <p class="hero__text" data-reveal data-reveal-delay="180">{{ hero.description }}</p>

          <ul class="hero__highlights" aria-label="Преимущества интенсива" data-reveal data-reveal-delay="230">
            <li
              v-for="(highlight, index) in highlights"
              :key="highlight + index"
              class="hero__highlight"
              data-reveal="up"
              :data-reveal-delay="260 + (index * 65)"
            >
              {{ highlight }}
            </li>
          </ul>

          <div class="hero__actions" data-reveal data-reveal-delay="320">
            <a class="btn btn--primary hero__btn" href="#pricing">{{ hero.actions.primary }}</a>
            <a class="btn btn--ghost hero__btn" href="#program">{{ hero.actions.secondary }}</a>
          </div>

          <p v-if="hero.meta" class="hero__meta" data-reveal data-reveal-delay="390">{{ hero.meta }}</p>
        </div>
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
