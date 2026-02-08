(function registerProgramSection() {
  const ProgramSection = {
    name: 'ProgramSection',
    data() {
      const source =
        (window.Landing && window.Landing.content && window.Landing.content.program) || {};

      const program = {
        title: '',
        text: '',
        actions: {
          primary: '',
          secondary: ''
        },
        steps: [],
        mobileNote: '',
        webinars: [],
        ctaTitle: '',
        ctaAction: '',
        ...source,
        actions: {
          primary: '',
          secondary: '',
          ...(source.actions || {})
        }
      };

      const webinars = Array.isArray(program.webinars)
        ? program.webinars.map((webinar) => ({
            step: webinar && webinar.step ? webinar.step : '',
            title: webinar && webinar.title ? webinar.title : '',
            date: webinar && webinar.date ? webinar.date : '',
            subtitle: webinar && webinar.subtitle ? webinar.subtitle : '',
            text: webinar && webinar.text ? webinar.text : '',
            learn: Array.isArray(webinar && webinar.learn) ? webinar.learn : [],
            images: Array.isArray(webinar && webinar.images) ? webinar.images : []
          }))
        : [];

      return {
        program,
        steps: Array.isArray(program.steps) ? program.steps : [],
        webinars
      };
    },
    template: `
<section class="program section" id="program" aria-labelledby="program-title">
  <div class="container">
    <div class="program__surface">
      <header class="program__header">
        <p class="program__kicker">Путь внедрения</p>
        <h2 class="section-title program__title" id="program-title">{{ program.title }}</h2>
        <p class="section-text program__text">{{ program.text }}</p>
      </header>

      <div class="program__actions">
        <a class="btn btn--primary program__btn" href="#pricing">{{ program.actions.primary }}</a>
        <a class="btn btn--ghost program__btn" href="#pricing">{{ program.actions.secondary }}</a>
      </div>

      <ol class="program__steps" aria-label="Этапы программы">
        <li v-for="(step, index) in steps" :key="step + index">{{ step }}</li>
      </ol>

      <p class="program__mobile-note">{{ program.mobileNote }}</p>

      <div class="program__list">
        <article class="webinar" v-for="(webinar, webinarIndex) in webinars" :key="webinar.title + webinarIndex">
          <div class="webinar__content">
            <p class="webinar__step">{{ webinar.step }}</p>
            <h3>{{ webinar.title }}</h3>
            <p class="webinar__date">{{ webinar.date }} — {{ webinar.subtitle }}</p>
            <p>{{ webinar.text }}</p>
            <h4>Чему вы научитесь:</h4>
            <ul>
              <li v-for="(item, itemIndex) in webinar.learn" :key="webinar.title + item + itemIndex">{{ item }}</li>
            </ul>
          </div>

          <div
            class="webinar__images"
            :class="{
              'webinar__images--single': webinar.images.length === 1,
              'webinar__images--triple': webinar.images.length >= 3
            }"
          >
            <figure class="webinar__figure" v-for="(img, imageIndex) in webinar.images" :key="webinar.title + img + imageIndex">
              <img :src="img" :alt="webinar.title" loading="lazy" class="webinar__image" />
            </figure>
          </div>
        </article>
      </div>

      <div class="program__cta">
        <h3>{{ program.ctaTitle }}</h3>
        <a class="btn btn--primary program__cta-btn" href="#pricing">{{ program.ctaAction }}</a>
      </div>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.ProgramSection = ProgramSection;
})();
