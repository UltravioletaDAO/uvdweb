import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { TWITCH_OAUTH_STATE_KEY } from '../components/TwitchAuth';

// El token vive en sessionStorage (se pierde al cerrar la pestaña, no queda legible
// para siempre por cualquier XSS). UvdWheelPage lo lee con la misma clave (W-16).
export const TWITCH_TOKEN_STORAGE_KEY = 'twitchAccessToken';

const TwitchCallback = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Twitch devuelve el token en el hash (#access_token=...&state=...) y los errores en el query (?error=...)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = hashParams.get('access_token');
    const returnedState = hashParams.get('state') || queryParams.get('state');
    const oauthError = queryParams.get('error') || hashParams.get('error');

    let expectedState = null;
    try {
      expectedState = sessionStorage.getItem(TWITCH_OAUTH_STATE_KEY);
      sessionStorage.removeItem(TWITCH_OAUTH_STATE_KEY);
    } catch (e) {
      expectedState = null;
    }

    // Siempre replace: el hash con el token no debe quedar en el historial.
    // El motivo del fallo viaja en location.state y la ruleta lo muestra como toast.
    const goBack = (twitchAuthError) =>
      navigate('/wheel', { replace: true, state: twitchAuthError ? { twitchAuthError } : undefined });

    if (oauthError) {
      console.error('Twitch OAuth error:', oauthError);
      goBack(oauthError === 'access_denied' ? 'access_denied' : 'oauth_error');
      return;
    }

    if (!accessToken) {
      console.error('No se recibió token de acceso');
      goBack('missing_token');
      return;
    }

    if (!expectedState || returnedState !== expectedState) {
      console.error('OAuth state inválido: la respuesta no corresponde a esta sesión');
      goBack('invalid_state');
      return;
    }

    // Validar el token con Twitch antes de guardarlo
    fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        'Authorization': `OAuth ${accessToken}`
      }
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`validate_${response.status}`))))
      .then((data) => {
        if (data.client_id && data.client_id === process.env.REACT_APP_TWITCH_CLIENT_ID) {
          // Si el token es válido, guardarlo y redirigir
          sessionStorage.setItem(TWITCH_TOKEN_STORAGE_KEY, accessToken);
          try {
            localStorage.removeItem(TWITCH_TOKEN_STORAGE_KEY); // limpiar tokens viejos persistidos
          } catch (e) {
            /* noop */
          }
          goBack(null);
        } else {
          console.error('Token inválido');
          goBack('invalid_token');
        }
      })
      .catch((error) => {
        console.error('Error validando token:', error);
        goBack('validation_failed');
      });
  }, [navigate]);

  return (
    <>
      <SEO
        title={t('wheel.twitch.callback_title', 'Conectando con Twitch...')}
        description={t('wheel.twitch.callback_description', 'Conectando tu cuenta de Twitch con la ruleta de Ultravioleta DAO')}
      />
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-twitch mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-lg">{t('wheel.twitch.redirecting')}</p>
        </div>
      </div>
    </>
  );
};

export default TwitchCallback;
