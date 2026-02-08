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
        ...source,
        actions: {
          primary: '',
          secondary: '',
          ...(source.actions || {})
        }
      };

      const webinars = Array.isArray(program.webinars)
        ? program.webinars.map((webinar, index, list) => {
            const rawImages = Array.isArray(webinar && webinar.images) ? webinar.images.filter(Boolean) : [];
            const normalizedImages = rawImages.length >= 2
              ? rawImages.slice(0, 2)
              : rawImages.length === 1
              ? [rawImages[0], rawImages[0]]
              : ['', ''];
            const learn = Array.isArray(webinar && webinar.learn) ? webinar.learn : [];
            const previewInfoParts = [];

            if (learn.length) {
              previewInfoParts.push(`${learn.length} ключевых навыка`);
            }

            previewInfoParts.push('2 визуальных примера');

            return {
              stepLabel: `Шаг ${index + 1} из ${list.length}`,
              title: webinar && webinar.title ? webinar.title : '',
              date: webinar && webinar.date ? webinar.date : '',
              subtitle: webinar && webinar.subtitle ? webinar.subtitle : '',
              text: webinar && webinar.text ? webinar.text : '',
              learn,
              previewInfo: previewInfoParts.join(' • '),
              previewImage: normalizedImages[0],
              images: normalizedImages
            };
          })
        : [];

      return {
        activeWebinarIndex: -1,
        program,
        webinars
      };
    },
    methods: {
      toggleWebinar(index) {
        this.activeWebinarIndex = this.activeWebinarIndex === index ? -1 : index;
      },
      isWebinarOpen(index) {
        return this.activeWebinarIndex === index;
      },
      getWebinarButtonId(index) {
        return `program-webinar-button-${index}`;
      },
      getWebinarPanelId(index) {
        return `program-webinar-panel-${index}`;
      }
    },
    template: `
<section class="program section" id="program" aria-labelledby="program-title">
  <div class="container">
    <div class="program__surface" data-reveal="zoom">
      <header class="program__header" data-reveal data-reveal-delay="40">
        <h2 class="section-title program__title" id="program-title" data-reveal data-reveal-delay="100">{{ program.title }}</h2>
        <p class="section-text program__text" data-reveal data-reveal-delay="160">{{ program.text }}</p>
      </header>

      <div class="program__actions" data-reveal data-reveal-delay="220">
        <a class="btn btn--primary program__btn" href="#pricing">{{ program.actions.primary }}</a>
        <a class="btn btn--ghost program__btn" href="#pricing">{{ program.actions.secondary }}</a>
      </div>

      <p class="program__mobile-note" data-reveal data-reveal-delay="360">{{ program.mobileNote }}</p>

      <div class="program__list">
        <article
          class="program-card"
          :class="{ 'program-card--open': isWebinarOpen(webinarIndex) }"
          v-for="(webinar, webinarIndex) in webinars"
          :key="webinar.title + webinarIndex"
          data-reveal
          :data-reveal-delay="80 + (webinarIndex * 40)"
        >
          <button
            class="program-card__toggle"
            type="button"
            :id="getWebinarButtonId(webinarIndex)"
            :aria-expanded="isWebinarOpen(webinarIndex) ? 'true' : 'false'"
            :aria-controls="getWebinarPanelId(webinarIndex)"
            @click="toggleWebinar(webinarIndex)"
          >
            <span class="program-card__step">{{ webinar.stepLabel }}</span>
            <span class="program-card__date">{{ webinar.date }}</span>
            <span class="program-card__title">{{ webinar.title }}</span>
            <span class="program-card__subtitle">{{ webinar.subtitle }}</span>
            <span class="program-card__meta-row">
              <span class="program-card__teaser">{{ webinar.previewInfo }}</span>
              <span class="program-card__open-hint">{{ isWebinarOpen(webinarIndex) ? 'Свернуть' : 'Раскрыть программу' }}</span>
            </span>

            <figure class="program-card__thumb" aria-hidden="true">
              <img :src="webinar.previewImage" :alt="webinar.title" loading="lazy" data-fade-image />
            </figure>

            <span class="program-card__icon" aria-hidden="true"></span>
          </button>

          <div
            class="program-card__panel-wrap"
            :class="{ 'program-card__panel-wrap--open': isWebinarOpen(webinarIndex) }"
            :id="getWebinarPanelId(webinarIndex)"
            role="region"
            :aria-labelledby="getWebinarButtonId(webinarIndex)"
            :aria-hidden="isWebinarOpen(webinarIndex) ? 'false' : 'true'"
          >
            <div class="program-card__panel">
              <p class="program-card__text">{{ webinar.text }}</p>
              <h4>Чему вы научитесь:</h4>
              <ul>
                <li v-for="(item, itemIndex) in webinar.learn" :key="webinar.title + item + itemIndex">{{ item }}</li>
              </ul>

              <div class="program-card__gallery">
                <figure class="program-card__figure" v-for="(img, imageIndex) in webinar.images" :key="webinar.title + img + imageIndex">
                  <img :src="img" :alt="webinar.title" loading="lazy" data-fade-image />
                </figure>
              </div>
            </div>
          </div>
        </article>
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
