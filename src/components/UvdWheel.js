import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const UvdWheel = ({ segments, probabilities = [], onSpinEnd, disabled = false }) => {
  const { t } = useTranslation();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef(null);
  const [finalWinnerIndex, setFinalWinnerIndex] = useState(null);
  const spinningSound = useRef(new Audio('/sounds/wheel-spinning.mp3'));
  const winSound = useRef(new Audio('/sounds/wheel-win.mp3'));
  
  // Colores para los segmentos de la ruleta (como en la imagen de referencia)
  const colors = [
    '#4B0082', // Índigo
    '#800080', // Púrpura
    '#9932CC', // Púrpura oscuro orquídea
    '#9400D3', // Violeta oscuro
    '#8A2BE2', // Azul violeta
    '#663399', // Rebeccapurple
  ];

  // Calcular el ángulo para cada segmento
  const segmentAngle = 360 / segments.length;
  
  // Validar que los porcentajes sumen 100%
  const validateProbabilities = () => {
    if (!probabilities.length || probabilities.length !== segments.length) {
      return true; // Si no hay probabilidades, se usan valores iguales
    }
    
    // Convertir las probabilidades a números
    const probs = probabilities.map(p => parseFloat(p));
    
    // Comprobar que sean números válidos
    if (probs.some(isNaN)) {
      return false;
    }
    
    // Sumar los porcentajes
    const total = probs.reduce((sum, prob) => sum + prob, 0);
    
    // Comprobar si la suma está cerca de 100%
    return Math.abs(total - 100) < 0.5;
  };
  
  // Usar probabilidades para determinar el segmento ganador
  const getWeightedRandomSegment = () => {
    // Si no hay probabilidades definidas, cada segmento tiene la misma probabilidad
    if (!probabilities.length || probabilities.length !== segments.length) {
      return Math.floor(Math.random() * segments.length);
    }
    
    // Convertir las probabilidades a números
    const probs = probabilities.map(p => parseFloat(p));
    
    // Crear un array acumulativo de probabilidades
    const cumulative = [];
    let sum = 0;
    
    for (const prob of probs) {
      sum += prob;
      cumulative.push(sum);
    }
    
    // Obtener un número aleatorio entre 0 y la suma total
    const random = Math.random() * sum;
    
    // Encontrar en qué segmento cae el número aleatorio
    for (let i = 0; i < cumulative.length; i++) {
      if (random < cumulative[i]) {
        return i;
      }
    }
    
    // En caso de error, devolver un índice aleatorio
    return Math.floor(Math.random() * segments.length);
  };
  
  // Reset de la ruleta
  useEffect(() => {
    setFinalWinnerIndex(null);
  }, [segments]);
  
  // Configurar los sonidos
  useEffect(() => {
    const spinning = spinningSound.current;
    const win = winSound.current;
    
    spinning.loop = true;
    
    return () => {
      spinning.pause();
      win.pause();
    };
  }, []);

  const spinWheel = () => {
    if (isSpinning || disabled) return;
    
    // Validar que los porcentajes sumen 100% antes de girar
    if (!validateProbabilities()) {
      alert('Los porcentajes deben sumar 100%. Por favor, revisa los valores.');
      return;
    }
    
    setIsSpinning(true);
    
    // Iniciar sonido de giro
    spinningSound.current.currentTime = 0;
    spinningSound.current.play().catch(console.warn);
    
    // PASO 1: Determinar el ganador
    const winnerIndex = getWeightedRandomSegment();
    const winnerValue = segments[winnerIndex];
    setFinalWinnerIndex(winnerIndex);
    
    // PASO 2: Calcular la rotación
    const baseRotation = Math.floor(rotation / 360) * 360;
    const extraSpins = 5 * 360;
    const segmentCenterAngle = winnerIndex * segmentAngle + segmentAngle / 2;
    const finalAdjustment = 360 - segmentCenterAngle;
    const totalRotation = baseRotation + extraSpins + finalAdjustment;
    
    setRotation(totalRotation);
    
    // PASO 3: Finalizar la animación
    setTimeout(() => {
      // Detener sonido de giro y reproducir sonido de victoria
      spinningSound.current.pause();
      spinningSound.current.currentTime = 0;
      winSound.current.currentTime = 0;
      winSound.current.play().catch(console.warn);
      
      setIsSpinning(false);
      
      if (onSpinEnd) {
        onSpinEnd(winnerValue);
      }
    }, 5000);
  };

  // Crear un SVG para la ruleta
  const radius = 300; // Radio de la ruleta
  const centerX = radius;
  const centerY = radius;
  
  // Función para calcular las coordenadas de un punto en un círculo
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };
  
  // Función para crear un arco de sector
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", x, y,
      "Z"
    ].join(" ");
  };

  // Generar los puntos blancos en los bordes de los segmentos
  const renderDots = () => {
    const dots = [];
    const dotRadius = 3;
    
    for (let i = 0; i < segments.length; i++) {
      const angle = i * segmentAngle;
      const dotX = centerX + (radius - 8) * Math.cos((angle - 90) * Math.PI / 180);
      const dotY = centerY + (radius - 8) * Math.sin((angle - 90) * Math.PI / 180);
      
      dots.push(
        <circle 
          key={`dot-${i}`} 
          cx={dotX} 
          cy={dotY} 
          r={dotRadius} 
          fill="white" 
        />
      );
    }
    
    return dots;
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}>
        {/* Indicador triangular apuntando hacia abajo */}
        <div className="absolute -top-[1px] left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <svg width="30" height="40" viewBox="0 0 30 40">
            <filter id="triangleShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.5)" />
            </filter>
            <polygon 
              points="15,40 0,0 30,0" 
              fill="white" 
              style={{ filter: 'url(#triangleShadow)' }}
            />
            <polygon 
              points="15,35 5,5 25,5" 
              fill="#800080" 
            />
          </svg>
        </div>
        
        {/* Contenedor de la ruleta */}
        <motion.div 
          ref={wheelRef}
          className="absolute w-full h-full"
          style={{
            transformOrigin: 'center',
          }}
          animate={{ rotate: rotation }}
          transition={{ duration: 5, ease: "easeOut" }}
        >
          <svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
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
            <circle 
              cx={centerX} 
              cy={centerY} 
              r={radius} 
              stroke="white" 
              strokeWidth="4" 
              fill="none" 
            />
            
            {/* Sectores de la ruleta */}
            {segments.map((segment, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = (index + 1) * segmentAngle;
              const pathD = describeArc(centerX, centerY, radius, startAngle, endAngle);
              
              // Resaltar el segmento ganador si ya se ha establecido
              const isWinner = !isSpinning && finalWinnerIndex === index;
              
              return (
                <path 
                  key={`segment-${index}`}
                  d={pathD} 
                  fill={colors[index % colors.length]}
                  stroke={isWinner ? "white" : "none"} 
                  strokeWidth={isWinner ? 3 : 0}
                  filter={isWinner ? "url(#winnerGlow)" : ""}
                />
              );
            })}
            
            {/* Puntos blancos en los bordes */}
            {renderDots()}
            
            {/* Texto en los segmentos - con posición fija (no rota con la ruleta) */}
            {/* Estos textos aparecerán siempre en horizontal */}
            <g className="non-rotating-text">
              {segments.map((segment, index) => {
                // Resaltar el segmento ganador si ya se ha establecido
                const isWinner = !isSpinning && finalWinnerIndex === index;
                
                // Posición para el texto
                const textAngle = index * segmentAngle + segmentAngle / 2;
                const textDistance = radius * 0.7; // 70% del radio
                const textX = centerX + textDistance * Math.cos((textAngle - 90) * Math.PI / 180);
                const textY = centerY + textDistance * Math.sin((textAngle - 90) * Math.PI / 180);
                
                // Mostrar la probabilidad si está disponible
                const showProbability = probabilities.length === segments.length;
                const probability = showProbability ? probabilities[index] : '';
                
                // Posicionamiento visual para ajustar según el sector
                const rotateValue = rotation * -1; // Contrarrotar para mantener horizontal
                
                return (
                  <g key={`text-${index}`} style={{ transformOrigin: 'center' }}>
                    <g transform={`translate(${textX}, ${textY}) rotate(${rotateValue})`}>
                      {/* Número */}
                      <text 
                        x="0" 
                        y="0" 
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize={isWinner ? "40px" : "32px"}
                        fontWeight="bold"
                        filter="url(#shadow)"
                        style={{ fontFamily: 'Arial, sans-serif' }}
                      >
                        {segment}
                      </text>
                      
                      {/* Probabilidad */}
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
                          {probability}%
                        </text>
                      )}
                    </g>
                  </g>
                );
              })}
            </g>
            
            {/* Centro de la ruleta - Botón de girar */}
            <g 
              onClick={spinWheel} 
              style={{ cursor: (isSpinning || disabled) ? 'default' : 'pointer' }}
              className={`${isSpinning || disabled ? 'opacity-50' : 'hover:opacity-90 active:opacity-100'}`}
            >
              {/* Círculo externo (blanco) */}
              <circle 
                cx={centerX} 
                cy={centerY} 
                r="70" 
                fill="white" 
                stroke="white"
                strokeWidth="2"
              />
              
              {/* Círculo interno (púrpura) */}
              <circle 
                cx={centerX} 
                cy={centerY} 
                r="65" 
                fill="#800080" 
              />
              
              {/* Logo en el centro */}
              <g transform={`translate(${centerX - 25}, ${centerY - 25})`}>
                <path 
                  d="M25 2L2 12L25 22L48 12L25 2zM2 32L25 42L48 32M2 22L25 32L48 22" 
                  stroke="white" 
                  strokeWidth="3" 
                  fill="none"
                />
              </g>
              
              {/* Texto para indicar que se puede hacer clic */}
              <text 
                x={centerX} 
                y={centerY + 45} 
                textAnchor="middle"
                fill="white"
                fontSize="12px"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                {isSpinning ? t('wheel.spin_button.spinning') : 
                 disabled ? t('wheel.spin_button.loading') : 
                 t('wheel.spin_button.ready')}
              </text>
            </g>
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default UvdWheel; 