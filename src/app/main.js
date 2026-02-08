(function mountApp() {
  const vueApi = window.Vue;
  const landing = window.Landing || {};
  const app = landing.components && landing.components.App;

  if (!vueApi || typeof vueApi.createApp !== 'function') {
    console.error('Vue runtime is not loaded.');
    return;
  }

  if (!app) {
    console.error('App component is not registered.');
    return;
  }

  vueApi.createApp(app).mount('#app');
})();
