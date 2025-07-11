import React, { useState, useEffect, useRef } from 'react';
import UvdWheel from '../components/UvdWheel';
import PageTransition from '../components/PageTransition';
import { useTranslation } from 'react-i18next';
import { isAddress } from '@ethersproject/address';
import TwitchAuth from '../components/TwitchAuth';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ABI mínimo para interactuar con tokens ERC20
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// ABI para el contrato de Airdrop
const AIRDROP_ABI = [
  "function erc20Airdrop(address token, address[] calldata recipients, uint256[] calldata amounts) external"
];

// Dirección del contrato de Airdrop en Avalanche C-Chain
const AIRDROP_CONTRACT_ADDRESS = "0x23E5c4Dee08e1Ff9b3338e3729E83b8aA6d30342";

// Configuración de la red Avalanche C-Chain
const AVALANCHE_NETWORK = {
  chainId: "0xA86A",  // Hex de 43114
  chainName: "Avalanche C-Chain",
  nativeCurrency: {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18
  },
  rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://snowtrace.io/"]
};

// Componente para mostrar notificaciones toast
const showToast = {
  success: (message) => {
    toast.success(message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  },
  error: (message) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  },
  info: (message) => {
    toast.info(message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  },
  warning: (message) => {
    toast.warning(message, {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  }
};

const UvdWheelPage = () => {
  const { t } = useTranslation();
  
  const defaultSegments = ['1', '17711', '121393', '196418', '317811', '514229', '832040', '1346269'];
  const defaultToken = '0x4ffe7e01832243e03668e090706f17726c26d6b2'; // Default token
  
  // Inicializar las probabilidades iguales para todos los segmentos
  const initProbabilities = () => {
    const equalProbability = 100 / defaultSegments.length;
    return defaultSegments.map(() => equalProbability.toFixed(1));
  };
  
  const [segments, setSegments] = useState(defaultSegments);
  const [probabilities, setProbabilities] = useState(initProbabilities);
  const [newSegment, setNewSegment] = useState('');
  const [newProbability, setNewProbability] = useState('');
  const [spinResult, setSpinResult] = useState(null);
  const [showCustomizePanel, setShowCustomizePanel] = useState(false);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [token, setToken] = useState(defaultToken);
  const [participants, setParticipants] = useState([]);
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [participantResults, setParticipantResults] = useState([]);
  const [newParticipant, setNewParticipant] = useState({ wallet: '', username: '' });
  const [isLoadingTwitch, setIsLoadingTwitch] = useState(false);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [autoUpdateTwitch, setAutoUpdateTwitch] = useState(false);
  const [completedParticipants, setCompletedParticipants] = useState([]);
  const [twitchAccessToken, setTwitchAccessToken] = useState(() => {
    return localStorage.getItem('twitchAccessToken');
  });
  const [isProcessingResult, setIsProcessingResult] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastTxHash, setLastTxHash] = useState(null);
  const [tokenDecimals, setTokenDecimals] = useState(18); // Por defecto 18 decimales
  const [hasTokenApproval, setHasTokenApproval] = useState(false);

  // Referencia para mantener el intervalo de verificación
  const checkIntervalRef = useRef(null);

  // Validar dirección Ethereum
  const isValidEthereumAddress = (address) => {
    try {
      return isAddress(address);
    } catch (error) {
      return false;
    }
  };

  // Cargar recompensas de Twitch
  const loadTwitchRewards = async (preserveResults = true) => {
    setIsLoadingTwitch(true);
    try {
      // Guardar los participantes completados si preserveResults es true
      if (preserveResults && participantResults.length > 0) {
        // Filtrar solo los resultados que aún no están en completedParticipants
        const existingWallets = new Set(completedParticipants.map(p => p.wallet + '-' + p.result));
        const newCompleted = participantResults.filter(result => 
          !existingWallets.has(result.wallet + '-' + result.result)
        ).map(result => ({
          ...result,
          isCompleted: true
        }));
        
        if (newCompleted.length > 0) {
          setCompletedParticipants(prevCompleted => [...prevCompleted, ...newCompleted]);
        }
      } else if (!preserveResults) {
        // Si no preservamos resultados, limpiar todo
        setCompletedParticipants([]);
      }
      
      // Limpiar la lista actual de participantes pendientes
      setParticipants([]);
      setParticipantResults([]);
      setCurrentParticipantIndex(0);

      // Primero obtener el ID del broadcaster
      const userResponse = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${twitchAccessToken}`,
          'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID
        }
      });

      const userData = await userResponse.json();
      if (!userData.data || !userData.data[0]) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      const broadcasterId = userData.data[0].id;

      // Obtener la lista de recompensas personalizadas
      const rewardsResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`, {
        headers: {
          'Authorization': `Bearer ${twitchAccessToken}`,
          'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID
        }
      });

      if (!rewardsResponse.ok) {
        throw new Error('error_fetching_rewards');
      }

      const rewardsData = await rewardsResponse.json();
      //console.log('Twitch Rewards:', rewardsData);

      // Buscar la recompensa "ruleta de $UVD"
      let wheelReward = rewardsData.data?.find(reward => 
        reward.title.toLowerCase() === "ruleta de $UVD"
      );

      // Si no encontramos la recompensa, intentamos crearla
      if (!wheelReward) {
        try {
          //console.log('Creando nueva recompensa...');
          const createResponse = await fetch(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${twitchAccessToken}`,
              'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: "ruleta de $UVD",
              cost: 17711,
              prompt: "Ingresa la direccion de tu wallet EVM",
              is_user_input_required: true,
              should_redemptions_skip_request_queue: false,
              is_enabled: true,
              background_color: "#9146FF",
              is_max_per_user_per_stream_enabled: true,
              max_per_user_per_stream: 1
            })
          });

          if (!createResponse.ok) {
            const errorData = await createResponse.json();
            console.error('Error creating reward:', errorData);
            throw new Error('affiliate_required');
          }

          const newReward = await createResponse.json();
          wheelReward = newReward.data[0];
          //console.log('Nueva recompensa creada:', wheelReward);
        } catch (error) {
          if (error.message === 'affiliate_required') {
            alert(t('wheel.twitch.create_reward_error'));
            setIsLoadingTwitch(false);
            return;
          }
          throw error;
        }
      }

      // Intentar obtener las recompensas canjeadas
      try {
        const response = await fetch(
          `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${broadcasterId}&reward_id=${wheelReward.id}&status=UNFULFILLED`, 
          {
            headers: {
              'Authorization': `Bearer ${twitchAccessToken}`,
              'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID
            }
          }
        );

        if (!response.ok) {
          if (response.status === 403) {
            // Si obtenemos un 403, significa que la recompensa fue creada con otro Client ID
            alert(t('wheel.twitch.client_id_mismatch'));
            setIsLoadingTwitch(false);
            return;
          }
          throw new Error('error_fetching_redemptions');
        }

        const data = await response.json();
        //console.log('Twitch Redemptions:', data);

        if (!data.data) {
          throw new Error('No se recibieron datos de recompensas');
        }

        // Procesar cada redención
        const validParticipants = [];
        const invalidRedemptions = [];

        for (const redemption of data.data) {
          const wallet = redemption.user_input.trim();
          if (isValidEthereumAddress(wallet)) {
            try {
              // Validar wallet con la API
              const apiResponse = await fetch(`${process.env.REACT_APP_API_URL}/wallets`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  username: redemption.user_name,
                  wallet: wallet
                })
              });

              const apiData = await apiResponse.json();

              if (apiResponse.status === 200 || apiResponse.status === 201) {
                // Casos exitosos: agregar a participantes válidos
                validParticipants.push({
                  wallet: wallet,
                  username: redemption.user_name,
                  redemptionId: redemption.id,
                  rewardId: wheelReward.id
                });
              } else if (apiResponse.status === 400) {
                // Casos de error: cancelar la recompensa y enviar mensaje al chat
                invalidRedemptions.push({
                  ...redemption,
                  reward_id: wheelReward.id
                });

                // Enviar mensaje al chat con el error
                try {
                  await fetch(`https://api.twitch.tv/helix/chat/messages?broadcaster_id=${broadcasterId}&sender_id=${broadcasterId}`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${twitchAccessToken}`,
                      'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      message: `@${redemption.user_name} ${apiData.error}: ${apiData.details}`,
                      reply_to_message_id: null
                    })
                  });
                } catch (error) {
                  console.error('Error sending chat message:', error);
                }
              }
            } catch (error) {
              console.error('Error validating wallet:', error);
              // En caso de error en la API, tratar como inválido
              invalidRedemptions.push({
                ...redemption,
                reward_id: wheelReward.id
              });
            }
          } else {
            invalidRedemptions.push({
              ...redemption,
              reward_id: wheelReward.id
            });

            // Enviar mensaje al chat para wallet inválida
            try {
              await fetch(`https://api.twitch.tv/helix/chat/messages?broadcaster_id=${broadcasterId}&sender_id=${broadcasterId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${twitchAccessToken}`,
                  'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  message: `@${redemption.user_name} REKT tu wallet no es válida. La recompensa ha sido cancelada.`,
                  reply_to_message_id: null
                })
              });
            } catch (error) {
              console.error('Error sending chat message:', error);
            }
          }
        }

        // Cancelar redenciones inválidas
        for (const redemption of invalidRedemptions) {
          await fetch(
            `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?id=${redemption.id}&broadcaster_id=${broadcasterId}&reward_id=${redemption.reward_id}`, 
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${twitchAccessToken}`,
                'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: 'CANCELED'
              })
            }
          );
        }

        // Agregar participantes válidos
        if (validParticipants.length > 0) {
          setParticipants(validParticipants);
          setIsAutoSpinning(true);
        } else if (!autoUpdateTwitch) {
          // Solo mostrar la alerta si no está en modo auto-update
          alert(t('wheel.twitch.no_rewards'));
        }

      } catch (error) {
        if (error.message === 'error_fetching_redemptions') {
          alert(t('wheel.twitch.redemption_error'));
        } else {
          throw error;
        }
      }

    } catch (error) {
      console.error('Error loading Twitch rewards:', error);
      if (error.message === 'No se pudo obtener la información del usuario') {
        alert(t('wheel.twitch.auth_error'));
        disconnectTwitch();
      } else if (error.message === 'error_fetching_rewards') {
        alert(t('wheel.twitch.load_error'));
      } else {
        alert(t('wheel.twitch.load_error'));
      }
    } finally {
      setIsLoadingTwitch(false);
    }
  };

  // Configurar el intervalo de actualización cuando se activa el switch
  useEffect(() => {
    // Limpiar cualquier intervalo existente
    const clearCheckInterval = () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };

    if (autoUpdateTwitch && twitchAccessToken) {
      // Carga inicial de participantes
      loadTwitchRewards(true);
      
      return () => {
        clearCheckInterval();
      };
    } else {
      clearCheckInterval();
    }
  }, [autoUpdateTwitch, twitchAccessToken]);

  // Efecto separado para manejar la verificación periódica cuando la lista está vacía
  useEffect(() => {
    // Solo configurar el intervalo si está activada la actualización automática
    // y la lista de participantes está vacía
    if (autoUpdateTwitch && twitchAccessToken && participants.length === 0) {
      // Limpiar el intervalo anterior si existe
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }

      // Crear nuevo intervalo
      checkIntervalRef.current = setInterval(() => {
        loadTwitchRewards(true);
      }, 10000); // Verificar cada 10 segundos
      
      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      };
    } else if (participants.length > 0 && checkIntervalRef.current) {
      // Si hay participantes, limpiar el intervalo
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, [autoUpdateTwitch, twitchAccessToken, participants.length]);

  // Manejar el auto-spin
  useEffect(() => {
    let timeoutId;
    if (isAutoSpinning && currentParticipantIndex < participants.length) {
      timeoutId = setTimeout(() => {
        const wheelElement = document.querySelector('.wheel-button'); // Asumiendo que agregaremos esta clase al botón de giro
        if (wheelElement) {
          wheelElement.click();
        }
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [isAutoSpinning, currentParticipantIndex, participants.length, participantResults]);

  // Permitir girar la ruleta solo cuando no se están cargando participantes o procesando un resultado
  const canSpin = !isLoadingTwitch && !isProcessingResult;

  // Completar recompensa de Twitch después del giro
  const handleSpinEnd = async (result) => {
    setSpinResult(result);
    setIsProcessingResult(true); // Bloquear el botón mientras se procesa el resultado
    
    try {
      if (participants.length > 0) {
        const currentParticipant = participants[currentParticipantIndex];
        
        // Guardar el resultado actual
        const newResult = {
          wallet: currentParticipant.wallet,
          username: currentParticipant.username,
          result: result
        };
        
        // También agregarlo a los completados para el CSV final
        setCompletedParticipants([
          ...completedParticipants,
          newResult
        ]);

        // Eliminar el participante actual de la lista principal
        const updatedParticipants = participants.filter((_, index) => index !== currentParticipantIndex);
        setParticipants(updatedParticipants);
        
        // Limpiar los resultados intermedios para que no aparezca el resultado
        // del participante anterior en el próximo participante
        setParticipantResults([]);
        
        // Si es una recompensa de Twitch, marcarla como completada
        if (currentParticipant.redemptionId && currentParticipant.rewardId && twitchAccessToken) {
          try {
            const userResponse = await fetch('https://api.twitch.tv/helix/users', {
              headers: {
                'Authorization': `Bearer ${twitchAccessToken}`,
                'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID
              }
            });

            const userData = await userResponse.json();
            if (!userData.data || !userData.data[0]) {
              throw new Error('No se pudo obtener la información del usuario');
            }

            const broadcasterId = userData.data[0].id;

            // Marcar la recompensa como completada
            await fetch(
              `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?id=${currentParticipant.redemptionId}&broadcaster_id=${broadcasterId}&reward_id=${currentParticipant.rewardId}`,
              {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${twitchAccessToken}`,
                  'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  status: 'FULFILLED'
                })
              }
            );

            // Enviar mensaje al chat con el resultado
            try {
              await fetch(`https://api.twitch.tv/helix/chat/messages?broadcaster_id=${broadcasterId}&sender_id=${broadcasterId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${twitchAccessToken}`,
                  'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  message: `@${currentParticipant.username} ¡Felicidades! Has ganado ${result} $UVD en la ruleta. Los tokens serán enviados pronto.`,
                  reply_to_message_id: null
                })
              });
            } catch (error) {
              console.error('Error sending winner message to chat:', error);
            }
          } catch (error) {
            console.error('Error completing Twitch reward:', error);
            alert(t('wheel.twitch.complete_error'));
          }
        }
        
        // Si está habilitada la actualización automática de Twitch, cargar nuevos participantes
        if (autoUpdateTwitch && twitchAccessToken) {
          loadTwitchRewards(true);
        }
      }
    } finally {
      // Esperar un momento antes de desbloquear el botón para evitar clics accidentales
      setTimeout(() => {
        setIsProcessingResult(false);
      }, 1500); // 1.5 segundos de seguridad
    }
  };

  // Limpiar participantes y resultados
  const clearParticipants = async () => {
    // Si hay participantes de Twitch, obtener el broadcaster ID una sola vez
    const hasTwitchParticipants = participants.some(p => p.redemptionId && p.rewardId);
    let broadcasterId = null;

    if (hasTwitchParticipants && twitchAccessToken) {
      try {
        const userResponse = await fetch('https://api.twitch.tv/helix/users', {
          headers: {
            'Authorization': `Bearer ${twitchAccessToken}`,
            'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID
          }
        });

        const userData = await userResponse.json();
        if (userData.data && userData.data[0]) {
          broadcasterId = userData.data[0].id;
        }
      } catch (error) {
        console.error('Error getting broadcaster ID:', error);
      }
    }

    // Verificar participantes pendientes (los que están después del índice actual)
    const pendingParticipants = participants.filter((_, index) => index >= currentParticipantIndex);
    const hasPendingTwitchParticipants = pendingParticipants.some(p => p.redemptionId && p.rewardId);

    // Cancelar todas las recompensas de Twitch pendientes
    if (broadcasterId) {
      for (const participant of pendingParticipants) {
        if (participant.redemptionId && participant.rewardId) {
          try {
            //console.log('Cancelando recompensa para:', participant.username);
            await fetch(
              `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?id=${participant.redemptionId}&broadcaster_id=${broadcasterId}&reward_id=${participant.rewardId}`,
              {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${twitchAccessToken}`,
                  'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  status: 'CANCELED'
                })
              }
            );
          } catch (error) {
            console.error('Error canceling Twitch reward:', error);
          }
        }
      }

      // Enviar mensaje al chat solo si hay participantes de Twitch pendientes
      if (hasPendingTwitchParticipants) {
        try {
          await fetch(`https://api.twitch.tv/helix/chat/messages?broadcaster_id=${broadcasterId}&sender_id=${broadcasterId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${twitchAccessToken}`,
              'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: 'Ruleta cancelada, se devolvieron los puntos a los participantes',
              reply_to_message_id: null
            })
          });
        } catch (error) {
          console.error('Error sending chat message:', error);
        }
      }
    }

    // Limpiar la lista de participantes
    setParticipants([]);
    setParticipantResults([]);
    setCurrentParticipantIndex(0);
  };

  // Función para generar el contenido del CSV
  const generateCSVContent = () => {
    const header = 'token_type,token_address,receiver,amount,id';
    // Usar completedParticipants para incluir todos los resultados históricos
    const content = completedParticipants.map(result => 
      `erc20,${token},${result.wallet},${result.result}`
    ).join(',\n');
    return `${header}\n${content},`;
  };

  // Exportar resultados a CSV
  const exportToCSV = () => {
    if (completedParticipants.length === 0) {
      alert(t('wheel.results.export.no_results'));
      return;
    }

    const fullCsvContent = generateCSVContent();
    const blob = new Blob([fullCsvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    // Obtener la fecha actual en formato YYMMDD
    const today = new Date();
    const yy = String(today.getFullYear());
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yy}${mm}${dd}`;
    
    link.download = `ruleta_${dateStr}.csv`;
    link.click();
  };

  // Copiar resultados al portapapeles
  const copyToClipboard = async () => {
    if (completedParticipants.length === 0) {
      alert(t('wheel.results.export.no_results'));
      return;
    }

    try {
      const content = generateCSVContent();
      await navigator.clipboard.writeText(content);
    } catch (err) {
      alert(t('wheel.results.copy.error'));
    }
  };

  // Agregar un nuevo participante
  const addParticipant = () => {
    if (!newParticipant.wallet) {
      alert(t('wheel.participants.add.wallet_required'));
      return;
    }
    
    setParticipants([...participants, { ...newParticipant }]);
    setNewParticipant({ wallet: '', username: '' });
  };

  // Eliminar un participante
  const removeParticipant = async (index) => {
    const participant = participants[index];
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);

    // Si el participante viene de Twitch, cancelar la recompensa
    if (participant.redemptionId && participant.rewardId && twitchAccessToken) {
      try {
        const userResponse = await fetch('https://api.twitch.tv/helix/users', {
          headers: {
            'Authorization': `Bearer ${twitchAccessToken}`,
            'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID
          }
        });

        const userData = await userResponse.json();
        if (!userData.data || !userData.data[0]) {
          throw new Error('No se pudo obtener la información del usuario');
        }

        const broadcasterId = userData.data[0].id;

        // Cancelar la recompensa
        await fetch(
          `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?id=${participant.redemptionId}&broadcaster_id=${broadcasterId}&reward_id=${participant.rewardId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${twitchAccessToken}`,
              'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'CANCELED'
            })
          }
        );

        // Enviar mensaje al chat
        await fetch(`https://api.twitch.tv/helix/chat/messages?broadcaster_id=${broadcasterId}&sender_id=${broadcasterId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${twitchAccessToken}`,
            'Client-Id': process.env.REACT_APP_TWITCH_CLIENT_ID,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `@${participant.username} Tu ruleta fue cancelada, se te devolvieron tus puntos`,
            reply_to_message_id: null
          })
        });

      } catch (error) {
        console.error('Error canceling Twitch reward:', error);
      }
    }
  };

  // Manejar tecla Enter en los inputs
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addParticipant();
    }
  };

  // Agregar un nuevo segmento a la ruleta
  const addSegment = () => {
    if (newSegment.trim() === '') return;
    
    // Valor de probabilidad por defecto si no se especifica
    let probability = newProbability.trim() === '' ? 
      (100 / (segments.length + 1)).toFixed(1) : 
      parseFloat(newProbability).toFixed(1);
    
    // Validar que la probabilidad sea un número
    if (isNaN(probability)) {
      probability = (100 / (segments.length + 1)).toFixed(1);
    }
    
    setSegments([...segments, newSegment.trim()]);
    setProbabilities([...probabilities, probability]);
    
    // Ya no ajustamos automáticamente las probabilidades
    
    setNewSegment('');
    setNewProbability('');
  };

  // Eliminar un segmento de la ruleta
  const removeSegment = (index) => {
    if (segments.length <= 2) {
      alert(t('wheel.segments.current.min_segments_error'));
      return;
    }
    
    const newSegments = [...segments];
    const newProbabilities = [...probabilities];
    
    newSegments.splice(index, 1);
    newProbabilities.splice(index, 1);
    
    setSegments(newSegments);
    setProbabilities(newProbabilities);
    
    // Ya no ajustamos automáticamente las probabilidades
  };

  // Actualizar la probabilidad de un segmento sin ajustar automáticamente
  const updateProbability = (index, value) => {
    if (value === '') {
      const newProbabilities = [...probabilities];
      newProbabilities[index] = value;
      setProbabilities(newProbabilities);
      return;
    }
    
    const newValue = parseFloat(value);
    
    if (isNaN(newValue)) return;
    
    const newProbabilities = [...probabilities];
    newProbabilities[index] = newValue.toFixed(1);
    
    setProbabilities(newProbabilities);
    // Ya no ajustamos automáticamente - el usuario puede editarlas libremente
  };

  // Restablecer a los segmentos por defecto
  const resetToDefault = () => {
    setSegments(defaultSegments);
    setProbabilities(initProbabilities());
  };

  // Función para equilibrar todos los porcentajes a partes iguales
  const equalizeAllProbabilities = () => {
    const equalProbability = (100 / segments.length).toFixed(1);
    setProbabilities(segments.map(() => equalProbability));
  };

  // Función para desconectar wallet
  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletBalance(null);
    setHasTokenApproval(false);
  };

  // Función para desconectar Twitch
  const disconnectTwitch = () => {
    localStorage.removeItem('twitchAccessToken');
    setTwitchAccessToken(null);
  };

  // Conectar wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      showToast.error(t('wheel.wallet.no_provider'));
      return;
    }

    try {
      // Primero verificar si ya estamos en la red correcta antes de pedir cuentas
      await switchToAvalancheNetwork();
      
      // Solicitar cuentas al usuario
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        showToast.success(t('wheel.wallet.connected_success'));
        
        // Obtener balance si hay un token seleccionado
        if (isAddress(token)) {
          await getTokenBalance(accounts[0], token);
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        showToast.info(t('wheel.wallet.user_rejected'));
      } else {
        showToast.error(t('wheel.wallet.connection_error'));
      }
    }
  };

  // Cambiar a la red de Avalanche C-Chain
  const switchToAvalancheNetwork = async () => {
    if (!window.ethereum) return;

    try {
      // Intentar cambiar a la red de Avalanche
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AVALANCHE_NETWORK.chainId }]
      });
      return true;
    } catch (switchError) {
      // Si la red no está agregada, agregarla
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AVALANCHE_NETWORK]
          });
          return true;
        } catch (addError) {
          console.error('Error adding Avalanche network:', addError);
          showToast.error(t('wheel.wallet.network_add_error'));
          return false;
        }
      } else {
        console.error('Error switching network:', switchError);
        showToast.error(t('wheel.wallet.network_switch_error'));
        return false;
      }
    }
  };

  // Obtener el balance de tokens
  const getTokenBalance = async (address, tokenAddress) => {
    if (!window.ethereum || !isAddress(tokenAddress)) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      // Obtener decimales del token
      try {
        const decimals = await tokenContract.decimals();
        setTokenDecimals(decimals);
      } catch (error) {
        console.warn('Error getting token decimals, using default (18):', error);
        setTokenDecimals(18);
      }
      
      // Obtener balance
      const balance = await tokenContract.balanceOf(address);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      setWalletBalance(null);
    }
  };

  // Verificar aprobación existente cada vez que se conecta la wallet o cambia el token
  const checkTokenApproval = async () => {
    if (!window.ethereum || !walletAddress || !isAddress(token)) return;
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenContract = new ethers.Contract(token, ERC20_ABI, provider);
      
      const currentAllowance = await tokenContract.allowance(walletAddress, AIRDROP_CONTRACT_ADDRESS);
      
      // Si la aprobación es mayor que la mitad del valor máximo, considerarla ilimitada
      setHasTokenApproval(
        currentAllowance.gt(ethers.constants.Zero) && 
        currentAllowance.gte(ethers.constants.MaxUint256.div(2))
      );
    } catch (error) {
      console.error('Error checking token approval:', error);
      setHasTokenApproval(false);
    }
  };

  // Aprobar tokens para el contrato de airdrop
  const approveTokens = async () => {
    if (!window.ethereum || !walletAddress || !isAddress(token) || completedParticipants.length === 0) {
      showToast.error(t('wheel.wallet.invalid_state'));
      return;
    }

    try {
      setIsApproving(true);
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(token, ERC20_ABI, signer);
      
      // Aprobar el contrato para gastar tokens (aprobar solo lo necesario)
      const amounts = ethers.utils.parseUnits(completedParticipants.reduce((sum, p) => sum + Number(p.result), 0).toString(), tokenDecimals);
      const tx = await tokenContract.approve(
        AIRDROP_CONTRACT_ADDRESS, 
        amounts
      );
      
      // Mostrar notificación de transacción pendiente
      showToast.info(t('wheel.wallet.approving_transaction'));
      
      await tx.wait();
      
      setHasTokenApproval(true);
      showToast.success(t('wheel.wallet.approval_success'));
    } catch (error) {
      console.error('Error approving tokens:', error);
      if (error.code === 4001) {
        showToast.info(t('wheel.wallet.user_rejected'));
      } else {
        showToast.error(t('wheel.wallet.approval_error'));
      }
    } finally {
      setIsApproving(false);
    }
  };

  // Enviar los premios
  const sendRewards = async () => {
    if (!window.ethereum || !walletAddress || !isAddress(token) || completedParticipants.length === 0) {
      showToast.error(t('wheel.wallet.invalid_state'));
      return;
    }

    try {
      setIsSending(true);
      
      // Verificar que estamos en la red correcta
      await switchToAvalancheNetwork();
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const airdropContract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, AIRDROP_ABI, signer);
      
      // Preparar los arrays para el airdrop
      const recipients = completedParticipants.map(p => p.wallet);
      const amounts = completedParticipants.map(p => 
        ethers.utils.parseUnits(p.result, tokenDecimals)
      );
      
      // Mostrar notificación de transacción pendiente
      showToast.info(t('wheel.wallet.sending_transaction'));
      
      // Enviar el airdrop
      const tx = await airdropContract.erc20Airdrop(token, recipients, amounts);
      const receipt = await tx.wait();
      
      setLastTxHash(receipt.transactionHash);
      showToast.success(t('wheel.wallet.send_success'));
      
      // Ya no limpiamos la lista de completados para mantener el historial visible
      // setCompletedParticipants([]);
    } catch (error) {
      console.error('Error sending rewards:', error);
      if (error.code === 4001) {
        showToast.info(t('wheel.wallet.user_rejected'));
      } else {
        showToast.error(t('wheel.wallet.send_error'));
      }
    } finally {
      setIsSending(false);
    }
  };

  // Formatear el balance para mostrarlo
  const formatBalance = (balance) => {
    if (!balance) return "0";
    return ethers.utils.formatUnits(balance, tokenDecimals);
  };

  // Abrir la transacción en el explorador de bloques
  const openTxInExplorer = () => {
    if (!lastTxHash) return;
    window.open(`${AVALANCHE_NETWORK.blockExplorerUrls[0]}tx/${lastTxHash}`, '_blank');
  };

  // Actualizar el balance cuando cambia la dirección o el token
  useEffect(() => {
    if (walletAddress && isAddress(token)) {
      getTokenBalance(walletAddress, token);
      checkTokenApproval();
    }
  }, [walletAddress, token]);

  // Escuchar cambios de cuenta
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          // Intentar cambiar a Avalanche C-Chain antes de establecer la cuenta
          await switchToAvalancheNetwork();
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
          setHasTokenApproval(false);
          setWalletBalance(null);
        }
      };

      const handleChainChanged = async () => {
        if (walletAddress) {
          // Intentar cambiar a Avalanche C-Chain
          await switchToAvalancheNetwork();
          // Comprobar si estamos en la red correcta y establecer el balance
          getTokenBalance(walletAddress, token);
          checkTokenApproval();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Auto-detectar y conectar si la wallet ya está conectada
      if (window.ethereum.selectedAddress) {
        // Intentar cambiar a Avalanche C-Chain antes de establecer la cuenta
        switchToAvalancheNetwork().then(() => {
          setWalletAddress(window.ethereum.selectedAddress);
          getTokenBalance(window.ethereum.selectedAddress, token);
          checkTokenApproval();
        });
      }

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Contenedor para las notificaciones */}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={3}
        />
        
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 text-white-600 hover:text-purple-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('success.back_home')}
            </button>
          </div>
          
          {/* Botón de conectar wallet siempre visible en la parte superior */}
          <div>
            {!walletAddress ? (
              <button
                onClick={connectWallet}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8h8V6z" clipRule="evenodd" />
                </svg>
                {t('wheel.wallet.connect_button')}
              </button>
            ) : (
              <div 
                onClick={disconnectWallet}
                className="flex items-center gap-2 bg-purple-600 py-1 px-3 rounded cursor-pointer hover:bg-purple-700 transition-colors group relative"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-white">{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
                
                {/* Icono y tooltip para desconectar */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white opacity-70 group-hover:opacity-100" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="lg:w-1/2 flex flex-col items-center justify-center">
            <div className="mb-8">
              <UvdWheel 
                segments={segments} 
                probabilities={probabilities} 
                onSpinEnd={handleSpinEnd}
                disabled={!canSpin}
              />
            </div>
            
            {spinResult && (
              <div className="mt-6 p-6 bg-purple-100 rounded-lg shadow-md text-center w-full">
                <h3 className="text-2xl font-semibold text-purple-800 mb-2">{t('wheel.results.title')}:</h3>
                <p className="text-5xl font-bold text-purple-900">{spinResult}</p>
                {participants.length > 0 && currentParticipantIndex >= participants.length && (
                  <p className="mt-2 text-yellow-600 font-semibold">
                    {t('wheel.results.no_more_participants')}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="lg:w-1/2 space-y-4">
            {/* Panel de Personalización */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <button
                onClick={() => setShowCustomizePanel(!showCustomizePanel)}
                className="w-full mb-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded transition-colors"
              >
                {showCustomizePanel ? t('wheel.customize_button.hide') : t('wheel.customize_button.show')}
              </button>
              
              {showCustomizePanel && (
                <>
                  {/* Token Field */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-purple-800">{t('wheel.token.title')}</h3>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={t('wheel.token.placeholder')}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-purple-800">{t('wheel.segments.add.title')}</h3>
                    <div className="mb-2">
                      <input
                        type="text"
                        value={newSegment}
                        onChange={(e) => setNewSegment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                        placeholder={t('wheel.segments.add.value_placeholder')}
                      />
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newProbability}
                          onChange={(e) => setNewProbability(e.target.value)}
                          className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder={t('wheel.segments.add.probability_placeholder')}
                        />
                        <button
                          onClick={addSegment}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-r"
                        >
                          {t('wheel.segments.add.button')}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-purple-800">{t('wheel.segments.current.title')}</h3>
                    <div className="max-h-60 overflow-y-auto">
                      {segments.map((segment, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div className="flex-grow">
                            <span className="font-medium text-lg">{segment}</span>
                            <div className="flex items-center mt-1">
                              <input
                                type="text"
                                value={probabilities[index]}
                                onChange={(e) => updateProbability(index, e.target.value)}
                                className="w-16 p-1 text-sm border border-gray-300 rounded mr-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                              <span className="text-xs text-gray-500">{t('wheel.segments.current.probability_suffix')}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeSegment(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col space-y-2">
                    <button
                      onClick={equalizeAllProbabilities}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                      {t('wheel.buttons.equalize')}
                    </button>
                    
                    <button
                      onClick={resetToDefault}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                      {t('wheel.buttons.reset')}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Panel de Participantes */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowParticipantsPanel(!showParticipantsPanel)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                  {showParticipantsPanel ? t('wheel.participants.panel.hide') : t('wheel.participants.panel.show')}
                </button>
                {participants.length > 0 && (
                  <button
                    onClick={clearParticipants}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors"
                  >
                    {t('wheel.participants.panel.clear')}
                  </button>
                )}
              </div>
              
              {showParticipantsPanel && (
                <div>
                  {/* Panel de inputs para nuevo participante */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-purple-800">{t('wheel.participants.add.title')}</h3>
                    <input
                      type="text"
                      value={newParticipant.wallet}
                      onChange={(e) => setNewParticipant({...newParticipant, wallet: e.target.value})}
                      onKeyPress={handleKeyPress}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                      placeholder={t('wheel.participants.add.wallet_placeholder')}
                    />
                    <input
                      type="text"
                      value={newParticipant.username}
                      onChange={(e) => setNewParticipant({...newParticipant, username: e.target.value})}
                      onKeyPress={handleKeyPress}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                      placeholder={t('wheel.participants.add.username_placeholder')}
                    />
                    <button
                      onClick={addParticipant}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-4"
                    >
                      {t('wheel.participants.add.button')}
                    </button>

                    {/* Botones de Twitch */}
                    <div className="mb-4">
                      {!twitchAccessToken ? (
                        <TwitchAuth />
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => loadTwitchRewards(true)}
                              disabled={isLoadingTwitch}
                              className="flex-1 flex items-center justify-center gap-2 bg-[#9146FF] hover:bg-[#7C2BFF] text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                              </svg>
                              {isLoadingTwitch ? t('wheel.twitch.loading') : t('wheel.twitch.load')}
                            </button>
                            <button
                              onClick={disconnectTwitch}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title={t('common.disconnect')}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                            <span className="text-sm font-medium text-gray-700">
                              {t('wheel.twitch.auto_update')}
                            </span>
                            <div 
                              onClick={() => setAutoUpdateTwitch(!autoUpdateTwitch)}
                              className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${autoUpdateTwitch ? 'bg-[#9146FF]' : 'bg-gray-300'}`}
                            >
                              <span
                                className={`absolute left-1 top-1 w-4 h-4 transition duration-100 ease-in-out transform bg-white rounded-full ${autoUpdateTwitch ? 'translate-x-6' : 'translate-x-0'}`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lista de participantes */}
                    {(participants.length > 0 || completedParticipants.length > 0) && (
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2 text-purple-800">{t('wheel.participants.list.title')}</h3>
                        
                        {/* Indicadores de cantidad de participantes */}
                        <div className="flex justify-between text-m mb-2 px-2">
                          <span className="text-purple-700">
                            <strong>{t('wheel.participants.list.pending')}:</strong> {participants.length}
                          </span>
                          <span className="text-purple-700">
                            <strong>{t('wheel.participants.list.total')}:</strong> {participants.length + completedParticipants.length}
                          </span>
                        </div>
                        
                        <div className="max-h-[400px] overflow-y-auto">
                          <table className="min-w-full">
                            <thead className="bg-purple-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-purple-800">{t('wheel.participants.list.headers.user')}</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-purple-800">{t('wheel.participants.list.headers.wallet')}</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-purple-800">{t('wheel.participants.list.headers.result')}</th>
                                <th className="px-4 py-2 w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Mostrar primero los participantes pendientes */}
                              {participants.map((participant, index) => {
                                const result = participantResults.find(
                                  (r, rIndex) => r.wallet === participant.wallet && rIndex === index
                                );
                                
                                return (
                                  <tr key={`${participant.wallet}-${index}`} className="border-b border-gray-200">
                                    <td className="px-4 py-3">
                                      <span className="font-medium opacity-85 text-purple-800">
                                        {participant.username || t('wheel.participants.list.anonymous')}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="text-sm text-gray-600 font-mono">
                                        {`${participant.wallet.slice(0, 6)}...${participant.wallet.slice(-4)}`}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      {result ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                          {result.result}
                                        </span>
                                      ) : index === currentParticipantIndex ? (
                                        <span className="text-sm text-purple-800 animate-pulse">
                                          {t('wheel.participants.list.current_turn')}
                                        </span>
                                      ) : index > currentParticipantIndex ? (
                                        <span className="text-sm text-gray-400">
                                          {t('wheel.participants.list.pending')}
                                        </span>
                                      ) : (
                                        <span className="text-sm text-gray-400">
                                          -
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      <button
                                        onClick={() => removeParticipant(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title={t('wheel.participants.list.remove')}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                              
                              {/* Mostrar los resultados históricos */}
                              {completedParticipants.length > 0 && (
                                <>
                                  <tr>
                                    <td colSpan="4" className="px-4 py-2 bg-gray-100">
                                      <h4 className="text-sm font-semibold text-green-800">
                                        {t('wheel.participants.list.completed')}
                                      </h4>
                                    </td>
                                  </tr>
                                  {completedParticipants.map((completed, index) => (
                                    <tr key={`completed-${index}`} className="border-b border-gray-200 bg-gray-50">
                                      <td className="px-4 py-3">
                                        <span className="font-medium opacity-85 text-green-800">
                                          {completed.username || t('wheel.participants.list.anonymous')}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600 font-mono">
                                          {`${completed.wallet.slice(0, 6)}...${completed.wallet.slice(-4)}`}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          {completed.result}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        {/* No hay botón de eliminar para completados */}
                                      </td>
                                    </tr>
                                  ))}
                                </>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Botones de exportar y copiar */}
                    {(participantResults.length > 0 || completedParticipants.length > 0) && (
                      <div className="flex flex-col gap-2 mt-4">
                        <div className="flex gap-2">
                          <button
                            onClick={copyToClipboard}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                          >
                            {t('wheel.results.copy.button')}
                          </button>
                          <button
                            onClick={exportToCSV}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                          >
                            {t('wheel.results.export.button')}
                          </button>
                        </div>
                        
                        {/* Sección para enviar premios directamente */}
                        <div className="mt-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h4 className="text-lg font-semibold text-purple-800 mb-2">
                            {t('wheel.wallet.send_rewards')}
                          </h4>
                          
                          {/* Mostrar información de la wallet si está conectada */}
                          {walletAddress ? (
                            <div className="mb-3">
                              <p className="text-sm text-gray-700 mb-1">
                                <span className="font-semibold">{t('wheel.wallet.connected')}:</span> {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                              </p>
                              {walletBalance && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold">{t('wheel.wallet.balance')}:</span> {formatBalance(walletBalance)} {token === defaultToken ? 'UVD' : ''}
                                </p>
                              )}
                              <p className="text-sm text-gray-700">
                                  <span className="font-semibold">{t('wheel.wallet.total_rewards')}:</span> {completedParticipants.reduce((sum, p) => sum + Number(p.result), 0)} {token === defaultToken ? 'UVD' : ''}
                                </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700 mb-3">
                              {t('wheel.wallet.connect_required')}
                            </p>
                          )}
                          
                          {/* Botones de acción */}
                          <div className="flex flex-col gap-2">
                            {!walletAddress && (
                              <button
                                onClick={connectWallet}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
                              >
                                {t('wheel.wallet.connect_button')}
                              </button>
                            )}
                            
                            {walletAddress && (
                              <>
                                {/* Solo mostrar el botón de aprobar si no hay aprobación */}
                                {!hasTokenApproval && (
                                  <button
                                    onClick={approveTokens}
                                    disabled={isApproving || isSending || completedParticipants.length === 0}
                                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors
                                      ${(isApproving || isSending || completedParticipants.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    {isApproving 
                                      ? `${t('wheel.wallet.approving')} ${completedParticipants.reduce((sum, p) => sum + Number(p.result), 0)} ${token === defaultToken ? 'UVD' : ''} ...` 
                                      : `${t('wheel.wallet.approve_button')} ${completedParticipants.reduce((sum, p) => sum + Number(p.result), 0)} ${token === defaultToken ? 'UVD' : ''}`}
                                  </button>
                                )}
                                
                                <button
                                  onClick={sendRewards}
                                  disabled={isSending || completedParticipants.length === 0 || !hasTokenApproval}
                                  className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors
                                    ${(isSending || completedParticipants.length === 0 || !hasTokenApproval) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {isSending 
                                    ? t('wheel.wallet.sending') 
                                    : t('wheel.wallet.send_button')}
                                </button>
                              </>
                            )}
                            
                            {/* Mostrar enlace a la transacción si existe */}
                            {lastTxHash && (
                              <button
                                onClick={openTxInExplorer}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                              >
                                {t('wheel.wallet.view_transaction')}
                              </button>
                            )}
                          </div>
                          
                          {/* Mensaje informativo */}
                          <p className="text-xs text-gray-500 mt-2">
                            {t('wheel.wallet.info')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default UvdWheelPage; 