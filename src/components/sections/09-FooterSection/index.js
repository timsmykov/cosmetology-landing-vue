(function registerFooterSection() {
  const FooterSection = {
    name: 'FooterSection',
    data() {
      const source = (window.Landing && window.Landing.content && window.Landing.content.footer) || {};
      const footer = {
        contactLabel: '',
        contactUrl: '',
        legalLinks: [],
        copyright: '',
        ...source
      };

      const legalLinks = Array.isArray(footer.legalLinks)
        ? footer.legalLinks.map((link) => ({
            label: link && link.label ? link.label : '',
            url: link && typeof link.url === 'string' ? link.url.trim() : ''
          }))
        : [];

      return {
        footer,
        legalLinks
      };
    },
    methods: {
      isExternal(url) {
        return typeof url === 'string' && url.indexOf('http') === 0;
      },
      hasLink(url) {
        return typeof url === 'string' && Boolean(url.trim()) && url.trim() !== '#';
      }
    },
    template: `
<footer class="site-footer section" id="footer" role="contentinfo" aria-label="Контакты и документы">
  <div class="container">
    <div class="site-footer__surface" data-reveal="zoom">
      <div class="site-footer__top">
        <p class="site-footer__title">Контакты и документы</p>
        <a
          v-if="hasLink(footer.contactUrl)"
          class="site-footer__contact"
          :href="footer.contactUrl"
          :target="isExternal(footer.contactUrl) ? '_blank' : null"
          :rel="isExternal(footer.contactUrl) ? 'noopener noreferrer' : null"
        >
          {{ footer.contactLabel }}
        </a>
        <span v-else class="site-footer__contact site-footer__contact--disabled">{{ footer.contactLabel }}</span>
      </div>

      <nav class="site-footer__legal" aria-label="Юридическая информация">
        <a
          v-for="(link, index) in legalLinks"
          :key="link.label + index"
          class="site-footer__legal-link"
          :href="link.url || '#'"
          :aria-disabled="hasLink(link.url) ? null : 'true'"
        >
          {{ link.label }}
        </a>
      </nav>

      <p v-if="footer.copyright" class="site-footer__copyright">{{ footer.copyright }}</p>
    </div>
  </div>
</footer>
`
  };

  window.Landing = window.Landing || {};
  window.Landing.components = window.Landing.components || {};
  window.Landing.components.FooterSection = FooterSection;
})();
