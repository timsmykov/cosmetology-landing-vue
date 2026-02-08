(function mountApp() {
  const vueApi = window.Vue;
  const landing = window.Landing || {};
  const app = landing.components && landing.components.App;
  const initMotion = landing.initMotion;

  if (!vueApi || typeof vueApi.createApp !== 'function') {
    console.error('Vue runtime is not loaded.');
    return;
  }

  if (!app) {
    console.error('App component is not registered.');
    return;
  }

  const vm = vueApi.createApp(app).mount('#app');

  if (typeof initMotion === 'function') {
    window.requestAnimationFrame(() => {
      initMotion();
    });
  }

  return vm;
})();
