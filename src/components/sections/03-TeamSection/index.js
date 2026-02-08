(function registerTeamSection() {
  const TeamSection = {
    name: 'TeamSection',
    data() {
      const source = (window.Landing && window.Landing.content && window.Landing.content.team) || {};
      const team = {
        title: '',
        expertsTitle: '',
        leads: [],
        experts: [],
        ...source
      };

      return {
        team,
        leads: Array.isArray(team.leads) ? team.leads : [],
        experts: Array.isArray(team.experts) ? team.experts : []
      };
    },
    template: `
<section class="team section" id="team" aria-labelledby="team-title">
  <div class="container">
    <div class="team__surface">
      <header class="team__header">
        <p class="team__kicker">Экспертная команда</p>
        <h2 class="section-title team__title" id="team-title">{{ team.title }}</h2>
      </header>

      <div class="team__leads">
        <article class="team__lead" v-for="(lead, leadIndex) in leads" :key="lead.name + leadIndex">
          <div class="team__photo-frame">
            <img class="team__photo" :src="lead.photo" :alt="lead.name" loading="lazy" />
          </div>
          <h3>{{ lead.name }}</h3>
          <p class="team__role">{{ lead.role }}</p>
          <ul>
            <li
              v-for="(point, pointIndex) in (Array.isArray(lead.points) ? lead.points : [])"
              :key="lead.name + point + pointIndex"
            >
              {{ point }}
            </li>
          </ul>
        </article>
      </div>

      <div class="team__experts-wrap">
        <h3 class="team__subtitle">{{ team.expertsTitle }}</h3>

        <div class="team__experts">
          <article class="team__expert" v-for="(expert, index) in experts" :key="expert.name + index">
            <h4>{{ expert.name }}</h4>
            <p class="team__role">{{ expert.role }}</p>
            <p>{{ expert.text }}</p>
          </article>
        </div>
      </div>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.TeamSection = TeamSection;
})();
