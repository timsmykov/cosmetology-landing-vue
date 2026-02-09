(function registerSelfCheckSection() {
  const SelfCheckSection = {
    name: 'SelfCheckSection',
    data() {
      const source = (window.Landing && window.Landing.content && window.Landing.content.selfCheck) || {};

      const selfCheck = {
        title: '',
        subtitle: '',
        question: '',
        items: [],
        action: '',
        actionUrl: '#program',
        ...source
      };

      return {
        selfCheck,
        items: Array.isArray(selfCheck.items) ? selfCheck.items : []
      };
    },
    template: `
<section class="self-check section" id="self-check" aria-labelledby="self-check-title">
  <div class="container">
    <div class="self-check__surface" data-reveal="zoom">
      <header class="self-check__header" data-reveal data-reveal-delay="40">
        <h2 class="section-title self-check__title" id="self-check-title" data-reveal data-reveal-delay="90">Узнаете себя?</h2>
      </header>

      <ul class="self-check__list" data-reveal data-reveal-delay="170">
        <li
          v-for="(item, index) in items"
          :key="item + index"
          data-reveal="up"
          :data-reveal-delay="210 + (index * 60)"
        >
          {{ item }}
        </li>
      </ul>

      <div class="self-check__actions" data-reveal data-reveal-delay="560">
        <a class="btn btn--ghost self-check__action" :href="selfCheck.actionUrl || '#program'">
          {{ selfCheck.action || 'Изучить подробности' }}
        </a>
      </div>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.SelfCheckSection = SelfCheckSection;
})();
