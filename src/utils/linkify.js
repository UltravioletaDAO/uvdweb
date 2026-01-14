import React from 'react';

/**
 * Regex para detectar URLs en texto
 * Detecta: http://, https://, y URLs sin protocolo (www.)
 */
const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s]|www\.[^\s<]+[^<.,:;"')\]\s])/gi;

/**
 * Convierte texto plano con URLs en elementos React con links clickeables
 * @param {string} text - Texto a procesar
 * @param {object} options - Opciones de configuración
 * @param {string} options.className - Clase CSS para los links
 * @param {string} options.target - Target del link (_blank por defecto)
 * @returns {React.ReactNode[]} Array de elementos React
 */
export const linkifyText = (text, options = {}) => {
  if (!text || typeof text !== 'string') return text;

  const {
    className = 'text-ultraviolet hover:text-ultraviolet-light underline break-all',
    target = '_blank'
  } = options;

  const parts = [];
  let lastIndex = 0;
  let match;

  // Reset regex lastIndex
  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    // Agregar texto antes del link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Agregar el link
    let url = match[0];
    // Agregar https:// si empieza con www.
    let href = url.startsWith('www.') ? `https://${url}` : url;

    // Validación de seguridad: solo permitir http:// y https://
    // Previene XSS con javascript:, data:, vbscript:, etc.
    if (!href.startsWith('http://') && !href.startsWith('https://')) {
      // No es un protocolo seguro, mostrar como texto plano
      parts.push(url);
      lastIndex = match.index + match[0].length;
      continue;
    }

    parts.push(
      <a
        key={`link-${match.index}`}
        href={href}
        target={target}
        rel="noopener noreferrer"
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Agregar texto restante después del último link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

/**
 * Componente que renderiza texto con links detectados automáticamente
 */
export const LinkifyText = ({ children, className, linkClassName, as: Component = 'span' }) => {
  if (!children || typeof children !== 'string') {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component className={className}>
      {linkifyText(children, { className: linkClassName })}
    </Component>
  );
};

export default LinkifyText;
