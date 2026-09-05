// Fuente única de configuración del frontend.
//
// Regla de la casa: un parámetro se define UNA vez y todo lo demás lo lee.
// El flag de debug estaba escrito con DOS nombres distintos: `REACT_APP_DEBUG`
// en los helpers de src/lib/utils.js y `REACT_APP_DEBUG_ENABLED` en el resto
// del código (18 sitios), en .env.example, en CLAUDE.md y en frontend-ci.yml.
// Ningún entorno prende el primero, así que los helpers quedaban apagados
// incluso con el flag documentado en 'true'.
//
// Precedencia: manda el canónico `REACT_APP_DEBUG_ENABLED` cuando está
// definido; `REACT_APP_DEBUG` se sigue aceptando como alias heredado para no
// romper a quien ya lo tenga seteado. Qué nombre queda en Amplify sigue siendo
// decisión del fundador (D-07): este módulo hace que el código funcione con
// cualquiera de los dos, no la toma por él.

const DEBUG_CANONICAL = 'REACT_APP_DEBUG_ENABLED';
const DEBUG_LEGACY = 'REACT_APP_DEBUG';

/**
 * ¿Está habilitado el logging de debug?
 * @param {object} [env] - Fuente de variables; inyectable para tests.
 * @returns {boolean}
 */
export function isDebugEnabled(env = process.env) {
  const canonical = env?.[DEBUG_CANONICAL];
  if (typeof canonical === 'string' && canonical !== '') {
    return canonical === 'true';
  }
  return env?.[DEBUG_LEGACY] === 'true';
}
