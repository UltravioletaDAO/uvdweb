import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TwitchCallback = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      // Validar el token con Twitch antes de guardarlo
      fetch('https://id.twitch.tv/oauth2/validate', {
        headers: {
          'Authorization': `OAuth ${accessToken}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.client_id) {
          // Si el token es válido, guardarlo y redirigir
          localStorage.setItem('twitchAccessToken', accessToken);
          navigate('/wheel', { replace: true });
        } else {
          console.error('Token inválido');
          navigate('/wheel');
        }
      })
      .catch(error => {
        console.error('Error validando token:', error);
        navigate('/wheel');
      });
    } else {
      console.error('No se recibió token de acceso');
      navigate('/wheel');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9146FF] mx-auto mb-4"></div>
        <p className="text-lg">{t('wheel.twitch.redirecting')}</p>
      </div>
    </div>
  );
};

export default TwitchCallback; 