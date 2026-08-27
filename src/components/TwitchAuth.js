import React from 'react';
import { useTranslation } from 'react-i18next';
import { debugLog } from '../lib/utils';

const TWITCH_CLIENT_ID = process.env.REACT_APP_TWITCH_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/twitch-callback`;
// Solo los scopes necesarios y validados
const TWITCH_SCOPES = [
  'channel:read:redemptions',
  'channel:manage:redemptions',
  'user:write:chat',
  'channel:bot'
].join(' ');

// Clave de sessionStorage donde queda el `state` anti-CSRF que verifica TwitchCallback (W-16)
export const TWITCH_OAUTH_STATE_KEY = 'twitchOAuthState';

const generateState = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const TwitchAuth = () => {
  const { t } = useTranslation();

  const handleAuth = () => {
    // state anti-CSRF: se guarda en sessionStorage y el callback lo compara (W-16)
    const state = generateState();
    try {
      sessionStorage.setItem(TWITCH_OAUTH_STATE_KEY, state);
    } catch (e) {
      /* sessionStorage no disponible: el callback rechazará la respuesta sin state válido */
    }

    // Construir la URL de autorización
    const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');
    authUrl.searchParams.append('client_id', TWITCH_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('scope', TWITCH_SCOPES);
    authUrl.searchParams.append('force_verify', 'true');
    authUrl.searchParams.append('state', state);

    // Para debug: mostrar la URL generada
    debugLog('Auth URL:', authUrl.toString());

    // Redirigir a Twitch para autenticación
    window.location.href = authUrl.toString();
  };

  return (
    <button
      type="button"
      onClick={handleAuth}
      className="flex items-center gap-2 bg-twitch hover:bg-twitch-dark text-white font-bold py-2 px-4 rounded transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
      </svg>
      {t('wheel.twitch.auth_button')}
    </button>
  );
};

export default TwitchAuth;
