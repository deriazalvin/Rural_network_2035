/**
 * Hook pour animer les compteurs de nombre
 * Utilisé par les stat cards et autres composants
 */
export function useCounterAnimation() {
  const animateCounter = (element, targetValue, duration = 1500, suffix = '') => {
    if (!element) return;

    const start = performance.now();
    let isRunning = true;

    const tick = (now) => {
      if (!isRunning) return;

      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: cubic out
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(targetValue * eased);

      element.textContent = currentValue.toLocaleString('fr-FR') + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        isRunning = false;
      }
    };

    requestAnimationFrame(tick);
  };

  const animateProgressBar = (element, targetPercentage, duration = 1200) => {
    if (!element) return;

    const start = performance.now();
    let isRunning = true;

    const tick = (now) => {
      if (!isRunning) return;

      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: cubic out
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentWidth = targetPercentage * eased;

      element.style.width = currentWidth + '%';

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        isRunning = false;
      }
    };

    requestAnimationFrame(tick);
  };

  return {
    animateCounter,
    animateProgressBar
  };
}
