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
            anchorId: plan && plan.anchorId ? plan.anchorId : '',
            name: plan && plan.name ? plan.name : '',
            include: plan && plan.include ? plan.include : '',
            audience: plan && plan.audience ? plan.audience : '',
            oldPrice: plan && plan.oldPrice ? plan.oldPrice : '',
            newPrice: plan && plan.newPrice ? plan.newPrice : '',
            action: plan && plan.action ? plan.action : '',
            paymentUrl: plan && typeof plan.paymentUrl === 'string' ? plan.paymentUrl.trim() : ''
          }))
        : [];

      return {
        pricing,
        plans
      };
    },
    template: `
<section class="pricing section" id="pricing" aria-labelledby="pricing-title">
  <div class="container">
    <div class="pricing__surface" data-reveal="zoom">
      <header class="pricing__header" data-reveal data-reveal-delay="40">
        <p class="pricing__kicker">Форматы участия</p>
        <h2 class="section-title pricing__title" id="pricing-title" data-reveal data-reveal-delay="100">{{ pricing.title }}</h2>
        <p class="section-text pricing__text" data-reveal data-reveal-delay="160">{{ pricing.text }}</p>
      </header>

      <div class="pricing__grid">
        <article
          class="pricing__card"
          :id="plan.anchorId || null"
          v-for="(plan, index) in plans"
          :key="plan.name + index"
          data-reveal
          :data-reveal-delay="220 + (index * 90)"
        >
          <div class="pricing__card-head">
            <h3>{{ plan.name }}</h3>
          </div>

          <div class="pricing__details">
            <p class="pricing__line pricing__line--include">{{ plan.include }}</p>
            <p class="pricing__line pricing__line--audience">{{ plan.audience }}</p>
          </div>

          <p class="pricing__prices" aria-label="Стоимость тарифа">
            <span v-if="plan.oldPrice" class="pricing__old">{{ plan.oldPrice }}</span>
            <strong class="pricing__new">{{ plan.newPrice }}</strong>
          </p>

          <a
            v-if="plan.paymentUrl"
            class="btn btn--primary pricing__action"
            :href="plan.paymentUrl"
            :target="plan.paymentUrl.indexOf('http') === 0 ? '_blank' : null"
            :rel="plan.paymentUrl.indexOf('http') === 0 ? 'noopener noreferrer' : null"
          >
            {{ plan.action }}
          </a>
          <button v-else class="btn btn--primary pricing__action" type="button" disabled>
            {{ plan.action }}
          </button>
        </article>
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
