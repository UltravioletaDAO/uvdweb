// Anillo CSS-3D de 6 escritorios (cubo hexagonal "Compiz"): cara i = rotateY(60°·i) translateZ(r),
// r = (w/2)/tan(30°). Solo la cara frontal monta ventanas reales; las demás muestran un placeholder
// de un nodo con el título y la lista de ventanas. Con prefers-reduced-motion no hay anillo:
// crossfade de 150 ms entre escritorios (sin [data-ring]).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const FACES = 6;
const STEP = 360 / FACES;
const ROTATE = { type: 'spring', duration: 0.42, bounce: 0.12 };

function useWidth(ref) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setW(el.clientWidth);
    if (typeof ResizeObserver === 'undefined') {
      const onResize = () => setW(el.clientWidth);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** Ángulo acumulado por el camino más corto (5 → 0 gira +60°, no −300°). */
function useAngle(active) {
  const prevRef = useRef(active);
  const angleRef = useRef(-STEP * active);
  if (prevRef.current !== active) {
    const delta = ((active - prevRef.current + FACES + FACES / 2) % FACES) - FACES / 2;
    angleRef.current -= STEP * delta;
    prevRef.current = active;
  }
  return angleRef.current;
}

export default function Ring({ active, faces, renderFace, reducedMotion = false, onRotateStart, onRotateEnd }) {
  const stageRef = useRef(null);
  const width = useWidth(stageRef);
  const angle = useAngle(active);
  const radius = useMemo(() => (width > 0 ? (width / 2) / Math.tan(Math.PI / FACES) : 0), [width]);

  if (reducedMotion) {
    // Sin anillo ni AnimatePresence: la cara nueva entra con un fade CSS de 150 ms (key=active la
    // remonta); la anterior se retira en el acto. Determinista y sin estados de salida colgados.
    return (
      <div className="uvd-ring-stage uvd-ring-stage--flat" ref={stageRef} data-ring-reduced="">
        <div
          key={active}
          className="uvd-ring__face is-active uvd-fade-in"
          data-face={faces[active] ? faces[active].id : active}
          data-active="true"
        >
          {renderFace(active)}
        </div>
      </div>
    );
  }

  return (
    <div className="uvd-ring-stage" ref={stageRef} style={{ perspective: 1400 }}>
      <motion.div
        className="uvd-ring"
        data-ring=""
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: angle, z: -radius }}
        transition={ROTATE}
        onAnimationStart={onRotateStart}
        onAnimationComplete={onRotateEnd}
      >
        {faces.map((face, i) => {
          const isActive = i === active;
          return (
            <div
              key={face.id}
              className={`uvd-ring__face ${isActive ? 'is-active' : 'is-placeholder'}`}
              data-face={face.id}
              data-active={isActive ? 'true' : 'false'}
              aria-hidden={isActive ? undefined : 'true'}
              style={{ transform: `rotateY(${STEP * i}deg) translateZ(${radius}px)`, backfaceVisibility: 'hidden' }}
            >
              {isActive ? (
                renderFace(i)
              ) : (
                <div className="uvd-ring__placeholder">
                  <p className="uvd-ring__placeholder-title">{face.title}</p>
                  <p className="uvd-ring__placeholder-list">{face.summary}</p>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
