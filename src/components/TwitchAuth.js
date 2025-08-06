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

const TwitchAuth = () => {
  const { t } = useTranslation();

  const handleAuth = () => {
    // Construir la URL de autorización
    const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');
    authUrl.searchParams.append('client_id', TWITCH_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('scope', TWITCH_SCOPES);
    authUrl.searchParams.append('force_verify', 'true');

    // Para debug: mostrar la URL generada
    debugLog('Auth URL:', authUrl.toString());

    // Redirigir a Twitch para autenticación
    window.location.href = authUrl.toString();
  };

  return (
    <button
      onClick={handleAuth}
      className="flex items-center gap-2 bg-[#9146FF] hover:bg-[#7C2BFF] text-white font-bold py-2 px-4 rounded transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
      </svg>
      {t('wheel.twitch.auth_button')}
    </button>
  );
};

export default TwitchAuth; 