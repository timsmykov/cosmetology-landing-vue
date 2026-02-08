(function registerApp() {
  const components = (window.Landing && window.Landing.components) || {};

  const App = {
    name: 'App',
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
</div>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.App = App;
})();
