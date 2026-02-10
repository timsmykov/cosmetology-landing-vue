(function registerApp() {
  const components = (window.Landing && window.Landing.components) || {};

  const App = {
    name: 'App',
    data() {
      return {
        showScrollTop: false,
        scrollFrameId: 0
      };
    },
    components: {
      HeroSection: components.HeroSection,
      SelfCheckSection: components.SelfCheckSection,
      PositioningSection: components.PositioningSection,
      ProgramSection: components.ProgramSection,
      ProgramCtaSection: components.ProgramCtaSection,
      TeamSection: components.TeamSection,
      PricingSection: components.PricingSection,
      FormatSection: components.FormatSection,
      FaqSection: components.FaqSection,
      FooterSection: components.FooterSection
    },
    mounted() {
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      this.updateScrollTopState();
    },
    beforeUnmount() {
      window.removeEventListener('scroll', this.handleScroll);
      if (this.scrollFrameId) {
        window.cancelAnimationFrame(this.scrollFrameId);
        this.scrollFrameId = 0;
      }
    },
    methods: {
      updateScrollTopState() {
        const threshold = (window.innerHeight || document.documentElement.clientHeight || 1) * 0.6;
        const shouldShow = window.scrollY > threshold;

        if (shouldShow !== this.showScrollTop) {
          this.showScrollTop = shouldShow;
        }
      },
      handleScroll() {
        if (this.scrollFrameId) {
          return;
        }

        this.scrollFrameId = window.requestAnimationFrame(() => {
          this.scrollFrameId = 0;
          this.updateScrollTopState();
        });
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
  <SelfCheckSection />
  <PositioningSection />
  <ProgramSection />
  <ProgramCtaSection />
  <TeamSection />
  <PricingSection />
  <FormatSection />
  <FaqSection />
  <FooterSection />

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
