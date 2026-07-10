import { useEffect, useRef } from 'preact/hooks';
import type { TimelineDataset, TimelineLaneMode } from '../../lib/timeline/types';

type TimelineIslandOptions = {
  defaultCalendar?: string;
  laneMode?: TimelineLaneMode;
  showFilters?: boolean;
  showMinimap?: boolean;
  showLegend?: boolean;
  compact?: boolean;
};

type FallbackEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  href: string;
};

type TimelineIslandProps = {
  dataset: TimelineDataset;
  options: TimelineIslandOptions;
  fallbackEvents: FallbackEvent[];
};

export default function TimelineIsland({ dataset, options, fallbackEvents }: TimelineIslandProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function mount() {
      const root = mountRef.current;
      if (!root) return;

      try {
        const { mountTimeline } = await import('../../lib/timeline/renderer.mjs');
        if (cancelled || !mountRef.current) return;

        cleanup = mountTimeline(root, dataset, options);
        root.setAttribute('data-vc-island-mounted', 'true');
        if (fallbackRef.current) fallbackRef.current.hidden = true;
      } catch (error) {
        root.replaceChildren();
        root.removeAttribute('data-vc-island-mounted');
        if (fallbackRef.current) fallbackRef.current.hidden = false;
        console.error('VISCERIUM Chronos timeline failed to mount.', error);
      }
    }

    void mount();

    return () => {
      cancelled = true;
      cleanup?.();
      cleanup = undefined;
    };
  }, [dataset, options]);

  return (
    <div class="vc-timeline-shell" data-vc-timeline-island>
      <div ref={mountRef} data-vc-timeline-mount aria-live="polite" />
      <section
        ref={fallbackRef}
        class="vc-timeline-fallback"
        data-vc-fallback
        aria-label="Chronological list"
      >
        <h2>Chronological list</h2>
        <p>This list remains available when the interactive timeline cannot run.</p>
        <ol>
          {fallbackEvents.map((event) => (
            <li key={event.id}>
              <p class="timeline-date">{event.date}</p>
              <h3><a href={event.href}>{event.title}</a></h3>
              <p>{event.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
