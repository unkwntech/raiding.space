import { useEffect, useState } from 'react';

interface SvgMapResult {
  svgText: string | null;
  isLoading: boolean;
  error: Error | null;
}

const cache = new Map<string, string>();

export function useSvgMap(svgPath: string): SvgMapResult {
  const [svgText, setSvgText] = useState<string | null>(cache.get(svgPath) ?? null);
  const [isLoading, setIsLoading] = useState(!cache.has(svgPath));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cache.has(svgPath)) {
      setSvgText(cache.get(svgPath) ?? null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(svgPath)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load SVG: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        cache.set(svgPath, text);
        setSvgText(text);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [svgPath]);

  return { svgText, isLoading, error };
}
