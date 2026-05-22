import React, { useEffect, useRef } from 'react';
import { RegionGlowSets } from '../../types/app';
import { useSvgMap } from '../../hooks/useSvgMap';
import { applyHighlights, applyRegionGlows, clearHighlights, parseElementId } from '../../utils/svgHighlight';
import './SvgMapRenderer.css';

interface SvgMapRendererProps {
  svgPath: string;
  highlightIds: ReadonlySet<number>;
  onElementClick: (id: number) => void;
  glowSets?: RegionGlowSets;
  flashSystemId?: number | null;
  onFlashComplete?: () => void;
}

export function SvgMapRenderer({ svgPath, highlightIds, onElementClick, glowSets, flashSystemId, onFlashComplete }: SvgMapRendererProps): React.ReactElement {
  const { svgText, isLoading, error } = useSvgMap(svgPath);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgText) return;
    clearHighlights(container, 'raidable-highlight');
    applyHighlights(container, highlightIds, 'raidable-highlight');
  }, [svgText, highlightIds]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgText || !glowSets) return;
    applyRegionGlows(container, glowSets);
  }, [svgText, glowSets]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgText || !flashSystemId) return;
    const el = container.querySelector(`#sys${flashSystemId}`) as SVGElement | null;
    if (!el) return;
    el.classList.remove('system-flash');
    // Force reflow so re-adding the class restarts the animation
    void el.getBoundingClientRect();
    el.classList.add('system-flash');
    const onEnd = (): void => {
      el.classList.remove('system-flash');
      onFlashComplete?.();
    };
    el.addEventListener('animationend', onEnd, { once: true });
    return () => el.removeEventListener('animationend', onEnd);
  }, [svgText, flashSystemId]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>): void {
    let target: Element | null = e.target as Element;
    while (target && target !== e.currentTarget) {
      const id = parseElementId(target);
      if (id !== null) {
        onElementClick(id);
        return;
      }
      target = target.parentElement;
    }
  }

  if (isLoading) return <div className="svg-map-loading">Loading map...</div>;
  if (error) return <div className="svg-map-error">Failed to load map: {error.message}</div>;
  if (!svgText) return <div className="svg-map-loading">Loading map...</div>;

  return (
    <div
      ref={containerRef}
      className="svg-map-container"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: svgText }}
    />
  );
}
