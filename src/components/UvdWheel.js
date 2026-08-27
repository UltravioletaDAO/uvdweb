import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useMotionValue, animate, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Geometría fija del SVG: todo escala con el viewBox (W-03: el wrapper es responsive).
const RADIUS = 300;
const SIZE = RADIUS * 2;
const CENTER = RADIUS;
const SPIN_DURATION = 5; // segundos
const REDUCED_SPIN_DURATION = 0.6; // prefers-reduced-motion (W-19)
const FULL_SPINS = 5;
const REDUCED_SPINS = 1;

// Colores para los segmentos de la ruleta (como en la imagen de referencia)
const COLORS = [
  '#4B0082', // Índigo
  '#800080', // Púrpura
  '#9932CC', // Púrpura oscuro orquídea
  '#9400D3', // Violeta oscuro
  '#8A2BE2', // Azul violeta
  '#663399', // Rebeccapurple
];

const polarToCartesian = (cx, cy, r, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
};

const describeArc = (x, y, r, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, r, endAngle);
  const end = polarToCartesian(x, y, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y, 'L', x, y, 'Z'].join(' ');
};

/**
 * Ruleta de premios.
 * - onSpinStart(): se dispara al iniciar el giro (la página bloquea acciones mientras gira).
 * - onSpinEnd(value): se dispara al terminar; siempre se llama la versión más reciente (W-05).
 * - onError(message): reemplaza a alert() (W-13).
 * - disabled / disabledReason: bloquea el giro y muestra el motivo en el centro.
 * - muted: silencia los sonidos (W-23). onAudioError(): los mp3 no cargaron (W-01/W-21).
 */
const UvdWheel = ({
  segments,
  probabilities = [],
  onSpinEnd,
  onSpinStart,
  onError,
  disabled = false,
  disabledReason = '',
  muted = false,
  onAudioError,
}) => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const rotate = useMotionValue(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalWinnerIndex, setFinalWinnerIndex] = useState(null);

  const spinningSound = useRef(null);
  const winSound = useRef(null);
  const audioBroken = useRef(false);
  const animationRef = useRef(null);
  const labelRefs = useRef([]);

  // Callbacks siempre frescos: el giro dura 5 s y el closure del render inicial queda viejo (W-05).
  const onSpinEndRef = useRef(onSpinEnd);
  const onAudioErrorRef = useRef(onAudioError);
  const mutedRef = useRef(muted);
  useEffect(() => {
    onSpinEndRef.current = onSpinEnd;
    onAudioErrorRef.current = onAudioError;
    mutedRef.current = muted;
  });

  const segmentAngle = 360 / segments.length;

  // Posiciones de las etiquetas (70% del radio), en coordenadas del viewBox
  const labelPositions = useMemo(() => {
    const count = segments.length;
    const angle = 360 / count;
    return Array.from({ length: count }, (_, i) => {
      const textAngle = i * angle + angle / 2;
      const distance = RADIUS * 0.7;
      return {
        x: CENTER + distance * Math.cos(((textAngle - 90) * Math.PI) / 180),
        y: CENTER + distance * Math.sin(((textAngle - 90) * Math.PI) / 180),
      };
    });
  }, [segments.length]);

  // Contrarrotar las etiquetas con el valor REAL de la animación (W-18), sin re-render por frame
  const applyLabelRotation = useCallback(
    (value) => {
      labelRefs.current.forEach((el, i) => {
        const pos = labelPositions[i];
        if (el && pos) {
          el.setAttribute('transform', `translate(${pos.x}, ${pos.y}) rotate(${-value})`);
        }
      });
    },
    [labelPositions]
  );

  // Validar que los porcentajes sumen 100%
  const validateProbabilities = () => {
    if (!probabilities.length || probabilities.length !== segments.length) {
      return true; // Si no hay probabilidades, se usan valores iguales
    }
    const probs = probabilities.map((p) => parseFloat(p));
    if (probs.some(Number.isNaN)) return false;
    const total = probs.reduce((sum, prob) => sum + prob, 0);
    return Math.abs(total - 100) < 0.5;
  };

  // Usar probabilidades para determinar el segmento ganador
  const getWeightedRandomSegment = () => {
    if (!probabilities.length || probabilities.length !== segments.length) {
      return Math.floor(Math.random() * segments.length);
    }
    const probs = probabilities.map((p) => parseFloat(p));
    const cumulative = [];
    let sum = 0;
    for (const prob of probs) {
      sum += prob;
      cumulative.push(sum);
    }
    const random = Math.random() * sum;
    for (let i = 0; i < cumulative.length; i++) {
      if (random < cumulative[i]) return i;
    }
    return Math.floor(Math.random() * segments.length);
  };

  // Reset del ganador resaltado cuando cambian los segmentos
  useEffect(() => {
    setFinalWinnerIndex(null);
  }, [segments]);

  // Sonidos: se crean UNA vez (W-21). Si el servidor no entrega audio válido (W-01) se desactivan en silencio.
  useEffect(() => {
    if (typeof Audio === 'undefined') return undefined;

    const spinning = new Audio('/sounds/wheel-spinning.mp3');
    const win = new Audio('/sounds/wheel-win.mp3');
    spinning.loop = true;
    spinning.preload = 'auto';
    win.preload = 'auto';

    const handleError = () => {
      if (audioBroken.current) return;
      audioBroken.current = true;
      spinning.pause();
      if (onAudioErrorRef.current) onAudioErrorRef.current();
    };
    spinning.addEventListener('error', handleError);
    win.addEventListener('error', handleError);

    spinningSound.current = spinning;
    winSound.current = win;

    return () => {
      spinning.removeEventListener('error', handleError);
      win.removeEventListener('error', handleError);
      spinning.pause();
      win.pause();
      spinningSound.current = null;
      winSound.current = null;
      if (animationRef.current) animationRef.current.stop();
    };
  }, []);

  const playSound = (ref, { loop = false } = {}) => {
    const audio = ref.current;
    if (!audio || audioBroken.current || mutedRef.current) return;
    try {
      audio.currentTime = 0;
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          /* autoplay bloqueado o fuente inválida: la ruleta sigue funcionando en silencio */
        });
      }
    } catch (e) {
      /* noop */
    }
    if (loop) audio.loop = true;
  };

  const stopSpinningSound = () => {
    const audio = spinningSound.current;
    if (!audio) return;
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch (e) {
      /* noop */
    }
  };

  // Mute en vivo: pausar/reanudar el loop de giro
  useEffect(() => {
    const audio = spinningSound.current;
    if (!audio || audioBroken.current) return;
    if (muted) {
      audio.pause();
    } else if (isSpinning) {
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    }
  }, [muted, isSpinning]);

  const spinWheel = () => {
    if (isSpinning || disabled) return;

    // Validar que los porcentajes sumen 100% antes de girar
    if (!validateProbabilities()) {
      if (onError) onError(t('wheel.segments.probability_validation_error'));
      return;
    }

    setIsSpinning(true);
    if (onSpinStart) onSpinStart();

    // Iniciar sonido de giro (sin loop si el usuario prefiere menos movimiento, W-19)
    if (!reduceMotion) playSound(spinningSound, { loop: true });

    // PASO 1: Determinar el ganador
    const winnerIndex = getWeightedRandomSegment();
    const winnerValue = segments[winnerIndex];
    setFinalWinnerIndex(winnerIndex);

    // PASO 2: Calcular la rotación
    const current = rotate.get();
    const baseRotation = Math.floor(current / 360) * 360;
    const extraSpins = (reduceMotion ? REDUCED_SPINS : FULL_SPINS) * 360;
    const segmentCenterAngle = winnerIndex * segmentAngle + segmentAngle / 2;
    const finalAdjustment = 360 - segmentCenterAngle;
    const totalRotation = baseRotation + extraSpins + finalAdjustment;

    // PASO 3: Animar con motion value; onComplete reemplaza al setTimeout fijo (W-05/W-18/W-19)
    if (animationRef.current) animationRef.current.stop();
    animationRef.current = animate(rotate, totalRotation, {
      duration: reduceMotion ? REDUCED_SPIN_DURATION : SPIN_DURATION,
      ease: 'easeOut',
      onUpdate: applyLabelRotation,
      onComplete: () => {
        stopSpinningSound();
        playSound(winSound);
        setIsSpinning(false);
        if (onSpinEndRef.current) onSpinEndRef.current(winnerValue);
      },
    });
  };

  // Generar los puntos blancos en los bordes de los segmentos
  const renderDots = () => {
    const dots = [];
    const dotRadius = 3;
    for (let i = 0; i < segments.length; i++) {
      const angle = i * segmentAngle;
      const dotX = CENTER + (RADIUS - 8) * Math.cos(((angle - 90) * Math.PI) / 180);
      const dotY = CENTER + (RADIUS - 8) * Math.sin(((angle - 90) * Math.PI) / 180);
      dots.push(<circle key={`dot-${i}`} cx={dotX} cy={dotY} r={dotRadius} fill="white" />);
    }
    return dots;
  };

  const showProbability = probabilities.length === segments.length;
  const isBlocked = isSpinning || disabled;
  const centerLabel = isSpinning
    ? t('wheel.spin_button.spinning')
    : disabled
      ? disabledReason || t('wheel.spin_button.loading')
      : t('wheel.spin_button.ready');
  const currentRotation = rotate.get();

  return (
    <div className="relative flex flex-col items-center w-full">
      <div
        className="relative mx-auto"
        style={{ width: `min(${SIZE}px, calc(100vw - 2rem))`, aspectRatio: '1 / 1' }}
      >
        {/* Indicador triangular apuntando hacia abajo */}
        <div className="absolute -top-[1px] left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <svg width="30" height="40" viewBox="0 0 30 40" aria-hidden="true">
            <filter id="triangleShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.5)" />
            </filter>
            <polygon points="15,40 0,0 30,0" fill="white" style={{ filter: 'url(#triangleShadow)' }} />
            <polygon points="15,35 5,5 25,5" fill="#800080" />
          </svg>
        </div>

        {/* Contenedor de la ruleta (rota) */}
        <motion.div className="absolute inset-0" style={{ rotate, transformOrigin: 'center' }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label={t('wheel.aria.wheel', 'Ruleta de premios')}
          >
            <title>{t('wheel.aria.wheel', 'Ruleta de premios')}</title>
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#000" floodOpacity="0.7" />
              </filter>
              <filter id="winnerGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feFlood floodColor="white" floodOpacity="0.7" result="glow" />
                <feComposite in="glow" in2="blur" operator="in" result="softGlow" />
                <feComposite in="softGlow" in2="SourceGraphic" operator="over" />
              </filter>
            </defs>

            {/* Círculo base */}
            <circle cx={CENTER} cy={CENTER} r={RADIUS} stroke="white" strokeWidth="4" fill="none" />

            {/* Sectores de la ruleta */}
            {segments.map((segment, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = (index + 1) * segmentAngle;
              const pathD = describeArc(CENTER, CENTER, RADIUS, startAngle, endAngle);
              const isWinner = !isSpinning && finalWinnerIndex === index;
              return (
                <path
                  key={`segment-${index}`}
                  d={pathD}
                  fill={COLORS[index % COLORS.length]}
                  stroke={isWinner ? 'white' : 'none'}
                  strokeWidth={isWinner ? 3 : 0}
                  filter={isWinner ? 'url(#winnerGlow)' : ''}
                />
              );
            })}

            {/* Puntos blancos en los bordes */}
            {renderDots()}

            {/* Etiquetas: se contrarrotan en cada frame para quedar horizontales */}
            <g className="non-rotating-text">
              {segments.map((segment, index) => {
                const isWinner = !isSpinning && finalWinnerIndex === index;
                const pos = labelPositions[index];
                return (
                  <g
                    key={`text-${index}`}
                    ref={(el) => {
                      labelRefs.current[index] = el;
                    }}
                    transform={`translate(${pos.x}, ${pos.y}) rotate(${-currentRotation})`}
                  >
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize={isWinner ? '40px' : '32px'}
                      fontWeight="bold"
                      filter="url(#shadow)"
                      style={{ fontFamily: 'Arial, sans-serif' }}
                    >
                      {segment}
                    </text>
                    {showProbability && (
                      <text
                        x="0"
                        y="25"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="14px"
                        opacity="0.9"
                        filter="url(#shadow)"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        {probabilities[index]}%
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </motion.div>

        {/* Centro de la ruleta: botón HTML real, no rota, operable por teclado (W-15) */}
        <button
          type="button"
          onClick={spinWheel}
          disabled={isBlocked}
          aria-label={centerLabel}
          aria-busy={isSpinning}
          className={`absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#800080] border-[5px] border-white text-white flex flex-col items-center justify-center select-none shadow-lg transition-opacity focus:outline-none focus-visible:ring-4 focus-visible:ring-white/80 ${
            isBlocked ? 'opacity-60 cursor-default' : 'hover:opacity-90 active:opacity-100 cursor-pointer'
          }`}
          style={{ width: '23.4%', height: '23.4%' }}
        >
          <svg viewBox="0 0 50 44" className="w-[36%] h-auto" aria-hidden="true">
            <path
              d="M25 2L2 12L25 22L48 12L25 2zM2 32L25 42L48 32M2 22L25 32L48 22"
              stroke="white"
              strokeWidth="3"
              fill="none"
            />
          </svg>
          <span className="mt-1 px-1 text-center text-[10px] sm:text-xs leading-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
            {centerLabel}
          </span>
        </button>
      </div>
    </div>
  );
};

export default UvdWheel;
