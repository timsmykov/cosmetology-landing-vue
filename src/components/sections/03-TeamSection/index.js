(function registerTeamSection() {
  const TeamSection = {
    name: 'TeamSection',
    data() {
      const team = (window.Landing && window.Landing.content && window.Landing.content.team) || {};

      return {
        team
      };
    },
    template: `
<section class="team section" id="team">
  <div class="container">
    <h2 class="section-title">{{ team.title }}</h2>

    <div class="team__leads">
      <article class="team__lead" v-for="lead in team.leads" :key="lead.name">
        <img class="team__photo" :src="lead.photo" :alt="lead.name" loading="lazy" />
        <h3>{{ lead.name }}</h3>
        <p class="team__role">{{ lead.role }}</p>
        <ul>
          <li v-for="point in lead.points" :key="point">{{ point }}</li>
        </ul>
      </article>
    </div>

    <h3 class="team__subtitle">{{ team.expertsTitle }}</h3>
    <div class="team__experts">
      <article class="team__expert" v-for="expert in team.experts" :key="expert.name">
        <h4>{{ expert.name }}</h4>
        <p class="team__role">{{ expert.role }}</p>
        <p>{{ expert.text }}</p>
      </article>
    </div>
  </div>
</section>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.TeamSection = TeamSection;
})();
