(function registerApp() {
  const components = (window.Landing && window.Landing.components) || {};

  const App = {
    name: 'App',
    data() {
      return {
        showScrollTop: false
      };
    },
    components: {
      HeroSection: components.HeroSection,
      PositioningSection: components.PositioningSection,
      TeamSection: components.TeamSection,
      ProgramSection: components.ProgramSection,
      PricingSection: components.PricingSection,
      FormatSection: components.FormatSection,
      FaqSection: components.FaqSection,
      FinalSection: components.FinalSection
    },
    mounted() {
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      document.addEventListener('click', this.handleAnchorNavigation);
      this.handleScroll();
    },
    beforeUnmount() {
      window.removeEventListener('scroll', this.handleScroll);
      document.removeEventListener('click', this.handleAnchorNavigation);
    },
    methods: {
      handleScroll() {
        const threshold = (window.innerHeight || document.documentElement.clientHeight || 1) * 0.6;
        this.showScrollTop = window.scrollY > threshold;
      },
      scrollToTop() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      },
      handleAnchorNavigation(event) {
        const link = event.target && event.target.closest && event.target.closest('a[href^="#"]');

        if (!link) {
          return;
        }

        const href = link.getAttribute('href') || '';

        if (!href || href === '#') {
          return;
        }

        const target = document.querySelector(href);

        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        window.history.replaceState(null, '', href);
      }
    },
    template: `
<div class="landing-page">
  <HeroSection />
  <PositioningSection />
  <TeamSection />
  <ProgramSection />
  <PricingSection />
  <FormatSection />
  <FaqSection />
  <FinalSection />

  <button
    class="scroll-top"
    :class="{ 'scroll-top--visible': showScrollTop }"
    type="button"
    aria-label="Наверх"
    @click="scrollToTop"
  >
    <span aria-hidden="true">↑</span>
  </button>
</div>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.App = App;
})();
