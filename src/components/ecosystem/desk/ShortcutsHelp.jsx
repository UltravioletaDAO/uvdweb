// Diálogo `?` con los atajos del escritorio. Accesible: role=dialog, aria-modal, foco al abrir,
// Esc y botón para cerrar, foco devuelto al elemento anterior al desmontar.
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function ShortcutsHelp({ onClose }) {
  const { t } = useTranslation();
  const closeRef = useRef(null);
  const titleId = 'uvd-shortcuts-title';

  useEffect(() => {
    const prev = typeof document !== 'undefined' ? document.activeElement : null;
    if (closeRef.current) closeRef.current.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      if (prev && typeof prev.focus === 'function') prev.focus({ preventScroll: true });
    };
  }, [onClose]);

  const rows = [
    ['cycle', 'Ctrl+` — foco entre ventanas'],
    ['ring', 'Ctrl+Alt+←/→ — girar escritorios'],
    ['expose', 'F3 — exposé'],
    ['escape', 'Esc — salir'],
    ['graph_keys', 'en el mapa: m vista · ↑↓ nodo · Enter aristas · e evidencia · l lista'],
    ['help', '? — esta ayuda'],
  ];

  return (
    <div className="uvd-help__backdrop" onClick={onClose} role="presentation" data-shortcuts="">
      <div className="uvd-term uvd-term--solid uvd-help" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <div className="uvd-term__bar">
          <span className="uvd-term__dots" aria-hidden="true"><i /><i /><i /></span>
          <span id={titleId} className="uvd-term__title">{t('ecosystem.shortcuts.title', 'Atajos')}</span>
          <span className="uvd-term__actions">
            <button ref={closeRef} type="button" className="uvd-wbtn uvd-wbtn--close" aria-label={t('ecosystem.shortcuts.close', 'Cerrar')} onClick={onClose}>×</button>
          </span>
        </div>
        <div className="uvd-term__body">
          <ul className="uvd-help__list">
            {rows.map(([key, fallback]) => (
              <li key={key}>{t(`ecosystem.shortcuts.${key}`, fallback)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
