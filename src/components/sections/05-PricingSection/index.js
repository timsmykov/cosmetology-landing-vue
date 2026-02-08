(function registerPricingSection() {
  const PricingSection = {
    name: 'PricingSection',
    data() {
      const source =
        (window.Landing && window.Landing.content && window.Landing.content.pricing) || {};

      const pricing = {
        title: '',
        text: '',
        plans: [],
        note: [],
        ...source
      };

      const plans = Array.isArray(pricing.plans)
        ? pricing.plans.map((plan) => ({
            name: plan && plan.name ? plan.name : '',
            include: plan && plan.include ? plan.include : '',
            audience: plan && plan.audience ? plan.audience : '',
            oldPrice: plan && plan.oldPrice ? plan.oldPrice : '',
            newPrice: plan && plan.newPrice ? plan.newPrice : '',
            action: plan && plan.action ? plan.action : '',
            recommended: Boolean(plan && plan.recommended)
          }))
        : [];

      return {
        pricing,
        plans,
        note: Array.isArray(pricing.note) ? pricing.note : []
      };
    },
    template: `
<section class="pricing section" id="pricing" aria-labelledby="pricing-title">
  <div class="container">
    <div class="pricing__surface">
      <header class="pricing__header">
        <p class="pricing__kicker">Форматы участия</p>
        <h2 class="section-title pricing__title" id="pricing-title">{{ pricing.title }}</h2>
        <p class="section-text pricing__text">{{ pricing.text }}</p>
      </header>

      <div class="pricing__grid">
        <article
          class="pricing__card"
          :class="{ 'pricing__card--recommended': plan.recommended }"
          v-for="(plan, index) in plans"
          :key="plan.name + index"
        >
          <div class="pricing__card-head">
            <p v-if="plan.recommended" class="pricing__badge">Рекомендуем</p>
            <h3>{{ plan.name }}</h3>
          </div>

          <div class="pricing__details">
            <p class="pricing__line pricing__line--include">{{ plan.include }}</p>
            <p class="pricing__line pricing__line--audience">{{ plan.audience }}</p>
          </div>

          <p class="pricing__prices" aria-label="Стоимость тарифа">
            <span class="pricing__old">{{ plan.oldPrice }}</span>
            <strong class="pricing__new">{{ plan.newPrice }}</strong>
          </p>

          <a class="btn btn--primary pricing__action" href="#final">{{ plan.action }}</a>
        </article>
      </div>

      <div class="pricing__note" v-if="note.length">
        <p v-for="(line, index) in note" :key="line + index">
          <strong v-if="index === 0">{{ line }}</strong>
          <em v-else-if="index === note.length - 1">{{ line }}</em>
          <template v-else>{{ line }}</template>
        </p>
      </div>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.PricingSection = PricingSection;
})();
