import { useEffect, useRef } from 'preact/hooks';

const SESSION_KEY = 'viscerium-home-reveal-played';
const DURATION_MS = 2600;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeInOutCubic = (value: number) => (
  value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
);

export default function HomeReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let hasPlayed = false;

    try {
      hasPlayed = window.sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      // Storage can be unavailable in hardened browsing modes. The reveal still works.
    }

    if (reduceMotion || hasPlayed) {
      canvas.remove();
      return undefined;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      canvas.remove();
      return undefined;
    }

    const palette = getComputedStyle(document.documentElement);
    const cover = palette.getPropertyValue('--codex-fixed-dark').trim();
    const vignetteSoft = palette.getPropertyValue('--home-reveal-vignette-soft').trim();
    const vignetteClear = palette.getPropertyValue('--home-reveal-vignette-clear').trim();

    let animationFrame = 0;
    let startTime = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let disposed = false;

    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.ceil(width * pixelRatio);
      canvas.height = Math.ceil(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const finish = () => {
      try {
        window.sessionStorage.setItem(SESSION_KEY, 'true');
      } catch {
        // The animation does not depend on storage being writable.
      }

      canvas.classList.add('home-reveal--complete');
      window.setTimeout(() => canvas.remove(), 450);
    };

    const draw = (time: number) => {
      if (disposed) return;
      if (!startTime) startTime = time;

      const linearProgress = clamp((time - startTime) / DURATION_MS);
      const progress = easeInOutCubic(linearProgress);
      const centreX = width / 2;
      const centreY = height / 2;
      const maximumRadius = Math.hypot(width, height) * 0.62;
      const revealRadius = maximumRadius * clamp(progress * 1.12);

      context.globalCompositeOperation = 'source-over';
      context.globalAlpha = 1;
      context.clearRect(0, 0, width, height);
      context.fillStyle = cover;
      context.fillRect(0, 0, width, height);

      if (revealRadius > 0) {
        const feather = Math.max(80, Math.min(width, height) * 0.14);
        const innerRadius = Math.max(0, revealRadius - feather);
        const vignette = context.createRadialGradient(
          centreX,
          centreY,
          innerRadius,
          centreX,
          centreY,
          revealRadius,
        );
        vignette.addColorStop(0, cover);
        vignette.addColorStop(0.72, vignetteSoft);
        vignette.addColorStop(1, vignetteClear);

        context.globalCompositeOperation = 'destination-out';
        context.fillStyle = vignette;
        context.fillRect(0, 0, width, height);
      }

      if (linearProgress < 1) {
        animationFrame = window.requestAnimationFrame(draw);
      } else {
        finish();
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      class="home-reveal"
      aria-hidden="true"
    />
  );
}
