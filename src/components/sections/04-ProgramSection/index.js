(function registerProgramSection() {
  const ProgramSection = {
    name: 'ProgramSection',
    data() {
      const program =
        (window.Landing && window.Landing.content && window.Landing.content.program) || {};

      return {
        program
      };
    },
    template: `
<section class="program section" id="program">
  <div class="container">
    <h2 class="section-title">{{ program.title }}</h2>
    <p class="section-text">{{ program.text }}</p>

    <div class="program__actions">
      <a class="btn btn--primary" href="#pricing">{{ program.actions.primary }}</a>
      <a class="btn btn--ghost" href="#pricing">{{ program.actions.secondary }}</a>
    </div>

    <ol class="program__steps">
      <li v-for="step in program.steps" :key="step">{{ step }}</li>
    </ol>

    <p class="program__mobile-note">{{ program.mobileNote }}</p>

    <article class="webinar" v-for="webinar in program.webinars" :key="webinar.title">
      <div class="webinar__content">
        <p class="webinar__step">{{ webinar.step }}</p>
        <h3>{{ webinar.title }}</h3>
        <p class="webinar__date">{{ webinar.date }} — {{ webinar.subtitle }}</p>
        <p>{{ webinar.text }}</p>
        <h4>Чему вы научитесь:</h4>
        <ul>
          <li v-for="item in webinar.learn" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div class="webinar__images" :class="{ 'webinar__images--single': webinar.images.length === 1 }">
        <img
          v-for="img in webinar.images"
          :key="img"
          :src="img"
          :alt="webinar.title"
          loading="lazy"
        />
      </div>
    </article>

    <div class="program__cta">
      <h3>{{ program.ctaTitle }}</h3>
      <a class="btn btn--primary" href="#pricing">{{ program.ctaAction }}</a>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.ProgramSection = ProgramSection;
})();
