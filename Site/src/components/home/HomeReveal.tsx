import { useEffect, useRef, useState } from 'preact/hooks';
import '../../styles/homepage-reveal.css';

type HomeRevealProps = {
  durationMs?: number;
  maskSrc?: string;
  spiralStrength?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const easeInOutCubic = (value: number) => (
  value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
);

function smoothstep(start: number, end: number, value: number) {
  const amount = clamp((value - start) / (end - start), 0, 1);
  return amount * amount * (3 - 2 * amount);
}

function traceFallbackSpiral(
  context: CanvasRenderingContext2D,
  centreX: number,
  centreY: number,
  innerRadius: number,
  outerRadius: number,
  rotation: number,
  arm: number,
  armCount: number,
) {
  const baseAngle = (arm / armCount) * Math.PI * 2 + rotation;
  const steps = 48;

  context.beginPath();
  for (let index = 0; index <= steps; index += 1) {
    const amount = index / steps;
    const radius = innerRadius + (outerRadius - innerRadius) * amount;
    const curl = 1.65 * (0.12 * amount + 0.88 * Math.pow(amount, 1.38));
    const irregularity = Math.sin(amount * Math.PI * 3 + arm * 1.71) * 0.018;
    const angle = baseAngle + curl + irregularity;
    const x = centreX + Math.cos(angle) * radius;
    const y = centreY + Math.sin(angle) * radius;

    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
}

function drawReveal(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  spiralStrength: number,
  elapsedMs: number,
  maskImage?: HTMLImageElement,
) {
  const centreX = width / 2;
  const centreY = height / 2;
  const maximumRadius = Math.hypot(width, height) * 0.535;
  const easedProgress = easeInOutCubic(clamp(progress, 0, 1));
  const revealRadius = maximumRadius * (0.018 + easedProgress * 1.055);
  const feather = maximumRadius * (0.115 - easedProgress * 0.018);
  const rotation = -0.72 + easedProgress * 1.08 + elapsedMs * 0.000055;

  context.globalAlpha = 1;
  context.globalCompositeOperation = 'source-over';
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);

  if (progress <= 0) return;

  context.globalCompositeOperation = 'destination-out';
  const vignette = context.createRadialGradient(
    centreX,
    centreY,
    Math.max(0, revealRadius - feather),
    centreX,
    centreY,
    revealRadius + feather,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,1)');
  vignette.addColorStop(0.5, 'rgba(0,0,0,.98)');
  vignette.addColorStop(0.78, 'rgba(0,0,0,.40)');
  vignette.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);

  const spiralIn = smoothstep(0.035, 0.18, progress);
  const spiralOut = 1 - smoothstep(0.72, 0.97, progress);
  const spiralEnvelope = spiralIn * spiralOut;
  const spiralOpacity = (0.76 + spiralStrength * 0.24) * spiralEnvelope;
  const spiralSize = Math.max(
    maximumRadius * 0.42,
    revealRadius * 2.32 + maximumRadius * (0.18 + spiralStrength * 0.08),
  );

  context.save();
  context.translate(centreX, centreY);
  context.rotate(rotation);
  context.globalAlpha = spiralOpacity;

  if (maskImage) {
    context.drawImage(maskImage, -spiralSize / 2, -spiralSize / 2, spiralSize, spiralSize);
  } else {
    context.translate(-centreX, -centreY);
    const armCount = 7;
    const innerRadius = Math.max(maximumRadius * 0.018, revealRadius - maximumRadius * 0.31);
    const outerRadius = Math.min(maximumRadius * 1.06, revealRadius + maximumRadius * 0.31);
    context.strokeStyle = '#000';
    context.lineWidth = maximumRadius * (0.052 + spiralStrength * 0.042);
    context.lineCap = 'round';
    context.lineJoin = 'round';

    for (let arm = 0; arm < armCount; arm += 1) {
      traceFallbackSpiral(
        context,
        centreX,
        centreY,
        innerRadius,
        outerRadius,
        0,
        arm,
        armCount,
      );
      context.stroke();
    }
  }

  context.restore();
  context.globalAlpha = 1;
  context.globalCompositeOperation = 'source-over';
}

export default function HomeReveal({
  durationMs = 2600,
  maskSrc = '/images/home/reveal-spiral-mask.svg',
  spiralStrength = 0.82,
}: HomeRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches) {
      setActive(false);
      return undefined;
    }

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
      setActive(false);
      return undefined;
    }

    let animationFrame = 0;
    let completionTimer = 0;
    let cancelled = false;
    let cssWidth = 1;
    let cssHeight = 1;
    let maskImage: HTMLImageElement | undefined;
    const startedAt = performance.now() + 90;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);

    const resize = () => {
      cssWidth = Math.max(1, window.innerWidth);
      cssHeight = Math.max(1, window.innerHeight);
      canvas.width = Math.round(cssWidth * pixelRatio);
      canvas.height = Math.round(cssHeight * pixelRatio);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawReveal(context, cssWidth, cssHeight, 0, spiralStrength, 0, maskImage);
    };

    const finish = () => {
      canvas.classList.add('is-complete');
      completionTimer = window.setTimeout(() => {
        if (!cancelled) setActive(false);
      }, 180);
    };

    const tick = (timestamp: number) => {
      if (cancelled) return;

      const elapsed = Math.max(0, timestamp - startedAt);
      const progress = clamp(elapsed / durationMs, 0, 1);
      drawReveal(
        context,
        cssWidth,
        cssHeight,
        progress,
        clamp(spiralStrength, 0, 1),
        elapsed,
        maskImage,
      );

      if (progress < 1) animationFrame = window.requestAnimationFrame(tick);
      else finish();
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(completionTimer);
      setActive(false);
    };

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      maskImage = image;
    };
    image.onerror = () => {
      console.warn(`Homepage reveal mask could not load: ${maskSrc}. Using the procedural fallback.`);
    };
    image.src = maskSrc;

    resize();
    window.addEventListener('resize', resize, { passive: true });
    motionPreference.addEventListener('change', handleMotionChange);
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(completionTimer);
      window.removeEventListener('resize', resize);
      motionPreference.removeEventListener('change', handleMotionChange);
    };
  }, [durationMs, maskSrc, spiralStrength]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      class="home-reveal-canvas"
      data-home-reveal
      aria-hidden="true"
    />
  );
}
