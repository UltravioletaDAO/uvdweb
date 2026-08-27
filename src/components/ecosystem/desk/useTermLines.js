// Buffer de líneas de una terminal (contrato C10). Líneas: { id, kind, text|segments, at }.
// kind: 'prompt' | 'out' | 'err' | 'note' | 'segments'. Conserva como máximo `max` líneas.
import { useCallback, useMemo, useRef, useState } from 'react';

let seq = 0;

export default function useTermLines({ max = 200, initial = [] } = {}) {
  const [lines, setLines] = useState(() => initial.slice(-max));
  const maxRef = useRef(max);
  maxRef.current = max;

  const normalize = (line) => {
    if (typeof line === 'string') line = { kind: 'out', text: line };
    seq += 1;
    return { id: line.id || `l${seq}`, at: line.at || new Date().toISOString(), ...line };
  };

  const push = useCallback((line) => {
    const items = (Array.isArray(line) ? line : [line]).map(normalize);
    setLines((prev) => {
      const next = prev.concat(items);
      return next.length > maxRef.current ? next.slice(next.length - maxRef.current) : next;
    });
    return items[items.length - 1] ? items[items.length - 1].id : null;
  }, []);

  const replaceLast = useCallback((line) => {
    const item = normalize(line);
    setLines((prev) => (prev.length ? prev.slice(0, -1).concat(item) : [item]));
    return item.id;
  }, []);

  const clear = useCallback(() => setLines([]), []);

  return useMemo(() => ({ lines, push, replaceLast, clear }), [lines, push, replaceLast, clear]);
}
