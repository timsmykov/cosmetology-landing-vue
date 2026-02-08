(function registerPricingSection() {
  const PricingSection = {
    name: 'PricingSection',
    data() {
      const pricing =
        (window.Landing && window.Landing.content && window.Landing.content.pricing) || {};

      return {
        pricing
      };
    },
    template: `
<section class="pricing section" id="pricing">
  <div class="container">
    <h2 class="section-title">{{ pricing.title }}</h2>
    <p class="section-text">{{ pricing.text }}</p>

    <div class="pricing__grid">
      <article class="pricing__card" :class="{ 'pricing__card--recommended': plan.recommended }" v-for="plan in pricing.plans" :key="plan.name">
        <p v-if="plan.recommended" class="pricing__badge">Рекомендуем</p>
        <h3>{{ plan.name }}</h3>
        <p>{{ plan.include }}</p>
        <p>{{ plan.audience }}</p>
        <p class="pricing__prices">
          <span class="pricing__old">{{ plan.oldPrice }}</span>
          <strong class="pricing__new">{{ plan.newPrice }}</strong>
        </p>
        <a class="btn btn--primary" href="#final">{{ plan.action }}</a>
      </article>
    </div>

    <div class="pricing__note">
      <p><strong>{{ pricing.note[0] }}</strong></p>
      <p>{{ pricing.note[1] }}</p>
      <p><em>{{ pricing.note[2] }}</em></p>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.PricingSection = PricingSection;
})();
