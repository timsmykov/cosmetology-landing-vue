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
      this.handleScroll();
    },
    beforeUnmount() {
      window.removeEventListener('scroll', this.handleScroll);
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
