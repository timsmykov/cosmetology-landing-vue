(function registerTypingSystem() {
  const states = new WeakMap();
  const runners = new WeakMap();

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function normalizeProgressWindow(value, window) {
    if (!Array.isArray(window) || window.length !== 2) {
      return clamp(value, 0, 1);
    }

    const start = clamp(Number(window[0]), 0, 1);
    const end = clamp(Number(window[1]), 0, 1);
    const span = Math.max(0.001, end - start);
    return clamp((value - start) / span, 0, 1);
  }

  function easeInOutCubic(value) {
    if (value < 0.5) {
      return 4 * value * value * value;
    }

    return 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function getState(container) {
    if (!states.has(container)) {
      states.set(container, {
        nodes: [],
        targets: [],
        total: 1,
        progress: 1
      });
    }

    return states.get(container);
  }

  function collectTargets(container, state) {
    const nodes = Array.from(container.querySelectorAll('[data-type-text]'));

    if (
      state.nodes.length === nodes.length &&
      state.nodes.every((node, index) => node === nodes[index])
    ) {
      return state.targets;
    }

    const GAP_WEIGHT = 9;
    let cursor = 0;

    state.nodes = nodes;
    state.targets = nodes.map((node) => {
      const source = node.getAttribute('data-type-source') || node.textContent || '';
      const chars = Array.from(source);
      const length = chars.length;

      node.setAttribute('data-type-source', source);

      const target = {
        node,
        source,
        chars,
        length,
        start: cursor,
        end: cursor + Math.max(length, 1)
      };

      cursor = target.end + GAP_WEIGHT;
      return target;
    });

    state.total = Math.max(cursor - GAP_WEIGHT, 1);

    return state.targets;
  }

  function setTargetText(target, visibleCount) {
    if (visibleCount <= 0) {
      target.node.textContent = '';
      return;
    }

    if (visibleCount >= target.length) {
      target.node.textContent = target.source;
      return;
    }

    target.node.textContent = target.chars.slice(0, visibleCount).join('');
  }

  function applyProgress(container, progress) {
    const state = getState(container);
    const targets = collectTargets(container, state);

    if (!targets.length) {
      state.progress = clamp(progress, 0, 1);
      return;
    }

    const normalized = clamp(progress, 0, 1);
    const timeline = normalized * state.total;

    targets.forEach((target) => {
      const segmentLength = Math.max(target.length, 1);
      const local = clamp((timeline - target.start) / segmentLength, 0, 1);
      const visibleCount = Math.round(target.length * local);
      setTargetText(target, visibleCount);
      target.node.style.removeProperty('opacity');
      target.node.classList.toggle('is-type-empty', visibleCount <= 0);
    });

    state.progress = normalized;
  }

  function stopAnimation(container) {
    const activeRunner = runners.get(container);

    if (!activeRunner) {
      return;
    }

    activeRunner.cancelled = true;

    if (activeRunner.frameId) {
      window.cancelAnimationFrame(activeRunner.frameId);
    }

    runners.delete(container);
  }

  function animate(container, direction = 'forward', options = {}) {
    if (!container) {
      return Promise.resolve();
    }

    const state = getState(container);
    collectTargets(container, state);

    const to = direction === 'reverse' ? 0 : 1;
    const from = typeof options.from === 'number' ? clamp(options.from, 0, 1) : state.progress;
    const progressMap = typeof options.progressMap === 'function'
      ? options.progressMap
      : (value) => normalizeProgressWindow(value, options.progressWindow);

    if (typeof options.from === 'number') {
      const mappedFrom = progressMap(from);
      applyProgress(container, mappedFrom);
    }

    stopAnimation(container);

    const distance = Math.abs(to - from);

    if (distance < 0.001) {
      applyProgress(container, to);
      return Promise.resolve();
    }

    const baseDuration = Number.isFinite(options.duration) ? options.duration : 360;
    const duration = Math.max(140, Math.round(baseDuration * distance));

    return new Promise((resolve) => {
      const runner = {
        cancelled: false,
        frameId: 0
      };

      runners.set(container, runner);

      const start = performance.now();

      const tick = (now) => {
        if (runner.cancelled) {
          resolve();
          return;
        }

        const elapsed = now - start;
        const rawProgress = clamp(elapsed / duration, 0, 1);
        const eased = easeInOutCubic(rawProgress);
        const current = from + (to - from) * eased;
        const mapped = progressMap(current);

        applyProgress(container, mapped);
        if (typeof options.onUpdate === 'function') {
          options.onUpdate(current, mapped);
        }

        if (rawProgress < 1) {
          runner.frameId = window.requestAnimationFrame(tick);
          return;
        }

        const mappedTo = progressMap(to);
        applyProgress(container, mappedTo);
        if (typeof options.onUpdate === 'function') {
          options.onUpdate(to, mappedTo);
        }
        runners.delete(container);
        resolve();
      };

      runner.frameId = window.requestAnimationFrame(tick);
    });
  }

  function setProgress(container, progress) {
    if (!container) {
      return;
    }

    stopAnimation(container);
    applyProgress(container, progress);
  }

  function measureHeight(container, callback) {
    if (!container || typeof callback !== 'function') {
      return 0;
    }

    const state = getState(container);
    collectTargets(container, state);

    if (!state.targets.length) {
      return callback();
    }

    const previous = state.progress;
    applyProgress(container, 1);
    const value = callback();
    applyProgress(container, previous);
    return value;
  }

  window.Landing = window.Landing || {};
  window.Landing.typing = {
    animate,
    setProgress,
    measureHeight
  };
})();
