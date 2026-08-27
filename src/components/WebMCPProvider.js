import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../i18n/config';
import { buildTools } from '../agent/tools';

/**
 * WebMCP Provider — expone las acciones del sitio a agentes IA via browser API.
 * Spec: https://webmachinelearning.github.io/webmcp/
 * Las definiciones viven en src/agent/tools.js (fuente única). Se monta una sola vez,
 * adentro del <Router> (navigate_to usa useNavigate). No renderiza nada en UI.
 */
const WebMCPProvider = () => {
  const navigate = useNavigate();
  // navigate cambia de identidad en cada navegación (RR6): se lee via ref para no
  // re-registrar los tools en cada cambio de ruta.
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    // Spec actual: document.modelContext.registerTool (navigator.modelContext es un alias deprecado).
    // Feature-detect por método, no por objeto: provideContext ya no existe en Chrome/Edge 151.
    const mc = document.modelContext ?? navigator.modelContext;
    if (typeof mc?.registerTool !== 'function') {
      return;
    }

    const tools = buildTools({ navigate: (path) => navigateRef.current(path), i18n });

    const warn = (err) => {
      // WebMCP no disponible o error — no bloquear la app (AbortError = cleanup esperado)
      if (err?.name !== 'AbortError' && process.env.REACT_APP_DEBUG_ENABLED === 'true') {
        console.warn('[WebMCP] registerTool failed:', err);
      }
    };

    // El AbortSignal des-registra los tools en el cleanup (sin él, el doble efecto de
    // StrictMode lanza InvalidStateError: Duplicate tool name).
    const controller = new AbortController();
    tools.forEach((tool) => {
      try {
        Promise.resolve(mc.registerTool(tool, { signal: controller.signal })).catch(warn);
      } catch (err) {
        warn(err);
      }
    });

    return () => controller.abort();
  }, []);

  return null; // No renderiza nada
};

export default WebMCPProvider;
