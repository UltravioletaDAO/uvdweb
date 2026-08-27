import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import UvdWheel from '../components/UvdWheel';
import PageTransition from '../components/PageTransition';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { isAddress } from '@ethersproject/address';
import TwitchAuth from '../components/TwitchAuth';
import { TWITCH_TOKEN_STORAGE_KEY } from './TwitchCallback';
import { ethers } from 'ethers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from '../lib/toast';
import {
  PlayCircleIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

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

// Recompensa de puntos de canal que crea/lee la ruleta (se muestra al viewer, W-23)
const REWARD_TITLE = 'ruleta de $UVD';
const REWARD_COST = 10946;
const REWARD_MAX_PER_USER_PER_STREAM = 1;
const STREAM_URL = 'https://twitch.tv/0xultravioleta';

const TWITCH_CLIENT_ID = process.env.REACT_APP_TWITCH_CLIENT_ID;
const API_URL = process.env.REACT_APP_API_URL || 'https://api.ultravioletadao.xyz';

// Persistencia local de la sesión del stream (W-17) y del mute (W-23)
const SESSION_STORAGE_KEY = 'uvd-wheel-session';
const MUTED_STORAGE_KEY = 'uvd-wheel-muted';

const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const shortAddress = (address) => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '');

// Lee el token de Twitch: sessionStorage (W-16) con migración desde el localStorage viejo
const readStoredTwitchToken = () => {
  try {
    const current = sessionStorage.getItem(TWITCH_TOKEN_STORAGE_KEY);
    if (current) return current;
    const legacy = localStorage.getItem(TWITCH_TOKEN_STORAGE_KEY);
    if (legacy) {
      sessionStorage.setItem(TWITCH_TOKEN_STORAGE_KEY, legacy);
      localStorage.removeItem(TWITCH_TOKEN_STORAGE_KEY);
      return legacy;
    }
  } catch (e) {
    /* storage no disponible */
  }
  return null;
};

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch (e) {
    return null;
  }
};

const readStoredMuted = () => {
  try {
    return localStorage.getItem(MUTED_STORAGE_KEY) === '1';
  } catch (e) {
    return false;
  }
};

// Reparte porcentajes para que sumen exactamente 100.0 (W-12)
const normalizeProbabilities = (values) => {
  const nums = values.map((v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  });
  const total = nums.reduce((sum, n) => sum + n, 0);
  const count = nums.length;
  if (count === 0) return [];
  const scaled = total > 0 ? nums.map((n) => (n / total) * 100) : nums.map(() => 100 / count);
  const rounded = scaled.map((n) => Math.round(n * 10) / 10);
  const drift = Math.round((100 - rounded.reduce((sum, n) => sum + n, 0)) * 10) / 10;
  // El resto de redondeo va al segmento más grande
  const maxIndex = rounded.reduce((best, n, i) => (n > rounded[best] ? i : best), 0);
  rounded[maxIndex] = Math.round((rounded[maxIndex] + drift) * 10) / 10;
  return rounded.map((n) => n.toFixed(1));
};

class TwitchAuthError extends Error {
  constructor() {
    super('twitch_auth');
    this.name = 'TwitchAuthError';
  }
}

// Confeti ligero en CSS (W-23); no se renderiza con prefers-reduced-motion
const CONFETTI_COLORS = ['#6a00ff', '#9146FF', '#ffffff', '#FFAC33', '#7c1fff'];
const Confetti = ({ burstKey }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: `${(i * 53) % 100}%`,
        delay: `${(i % 6) * 0.08}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: `${(i * 37) % 360}deg`,
      })),
    []
  );
  return (
    <div key={burstKey} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <style>{`@keyframes uvd-confetti-fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(220px) rotate(540deg);opacity:0}}`}</style>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block w-2 h-3 rounded-sm"
          style={{
            left: p.left,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate})`,
            animation: `uvd-confetti-fall 1.4s ease-out ${p.delay} forwards`,
          }}
        />
      ))}
    </div>
  );
};

const UvdWheelPage = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const defaultSegments = useMemo(() => ['1', '17711', '28657', '46368', '75025', '121393', '196418', '317811', '514229'], []);
  const defaultToken = '0x4Ffe7e01832243e03668E090706F17726c26d6B2'; // Default UVD token

  // Inicializar las probabilidades iguales para todos los segmentos
  const initProbabilities = useCallback(() => normalizeProbabilities(defaultSegments.map(() => 1)), [defaultSegments]);

  const [segments, setSegments] = useState(defaultSegments);
  const [probabilities, setProbabilities] = useState(initProbabilities);
  const [newSegment, setNewSegment] = useState('');
  const [newProbability, setNewProbability] = useState('');
  const [spinResult, setSpinResult] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [showCustomizePanel, setShowCustomizePanel] = useState(false);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [token, setToken] = useState(defaultToken);
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState({ wallet: '', username: '' });
  const [isLoadingTwitch, setIsLoadingTwitch] = useState(false);
  const [autoUpdateTwitch, setAutoUpdateTwitch] = useState(false);
  const [restoredSession] = useState(readStoredSession);
  const [completedParticipants, setCompletedParticipants] = useState(() => restoredSession?.items || []);
  const [twitchAccessToken, setTwitchAccessToken] = useState(readStoredTwitchToken);
  const [twitchLogin, setTwitchLogin] = useState('');
  const [twitchExpiresIn, setTwitchExpiresIn] = useState(null);
  const [isProcessingResult, setIsProcessingResult] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastTxHash, setLastTxHash] = useState(null);
  const [tokenDecimals, setTokenDecimals] = useState(18); // Por defecto 18 decimales
  const [allowance, setAllowance] = useState(null);
  const [fiboHolders, setFiboHolders] = useState({});
  const [doublePaymentMultiplier, setDoublePaymentMultiplier] = useState(2);
  const [spinWasDoubled, setSpinWasDoubled] = useState(false);
  const [lastWinnerUsername, setLastWinnerUsername] = useState('');
  const [lastWinnerWallet, setLastWinnerWallet] = useState('');
  const [muted, setMuted] = useState(readStoredMuted);
  const [audioBroken, setAudioBroken] = useState(false);
  const [includePaidInExport, setIncludePaidInExport] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(null); // 'send' | 'new-session' | null

  // Referencias: intervalo de Twitch, guard de carga en vuelo (W-07), listas frescas para callbacks (W-05)
  const checkIntervalRef = useRef(null);
  const loadingRef = useRef(false);
  const abortRef = useRef(null);
  const participantsRef = useRef(participants);
  const twitchTokenRef = useRef(twitchAccessToken);
  const broadcasterIdRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    twitchTokenRef.current = twitchAccessToken;
    broadcasterIdRef.current = null;
  }, [twitchAccessToken]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Validar dirección Ethereum
  const isValidEthereumAddress = (address) => {
    try {
      return isAddress(address);
    } catch (error) {
      return false;
    }
  };

  const isDefaultToken = token.trim().toLowerCase() === defaultToken.toLowerCase();
  const tokenSymbol = isDefaultToken ? 'UVD' : '';
  const busy = isSpinning || isProcessingResult;

  // ─── Premios pendientes vs pagados (W-02) ───
  const pendingRewards = useMemo(() => completedParticipants.filter((p) => !p.paid), [completedParticipants]);
  const paidRewards = useMemo(() => completedParticipants.filter((p) => p.paid), [completedParticipants]);
  const pendingTotal = useMemo(() => {
    const total = pendingRewards.reduce((sum, p) => sum + Number(p.result), 0);
    return Number.isFinite(total) ? Number(total.toFixed(6)) : 0;
  }, [pendingRewards]);
  const pendingTotalUnits = useMemo(() => {
    try {
      return ethers.utils.parseUnits(pendingTotal.toString(), tokenDecimals);
    } catch (e) {
      return null;
    }
  }, [pendingTotal, tokenDecimals]);
  const hasTokenApproval = !!(allowance && pendingTotalUnits && pendingTotal > 0 && allowance.gte(pendingTotalUnits));

  // ─── Probabilidades (W-11/W-12) ───
  const probabilitySum = useMemo(() => {
    const total = probabilities.reduce((sum, p) => sum + (parseFloat(p) || 0), 0);
    return Math.round(total * 10) / 10;
  }, [probabilities]);
  const probabilitiesValid =
    probabilities.length === segments.length &&
    probabilities.every((p) => Number.isFinite(parseFloat(p)) && parseFloat(p) >= 0) &&
    Math.abs(probabilitySum - 100) < 0.05;

  // ─── Persistencia de la sesión (W-17) ───
  useEffect(() => {
    try {
      if (completedParticipants.length === 0) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ savedAt: new Date().toISOString(), items: completedParticipants })
        );
      }
    } catch (e) {
      /* storage lleno o no disponible */
    }
  }, [completedParticipants]);

  useEffect(() => {
    if (restoredSession && restoredSession.items.length > 0) {
      const date = restoredSession.savedAt ? new Date(restoredSession.savedAt).toLocaleString(i18n.language) : '';
      showToast.info(
        t('wheel.session.restored', 'Sesión restaurada: {{count}} resultados guardados ({{date}})', {
          count: restoredSession.items.length,
          date,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MUTED_STORAGE_KEY, muted ? '1' : '0');
    } catch (e) {
      /* noop */
    }
  }, [muted]);

  // ─── Resultado del callback de OAuth (W-16) ───
  useEffect(() => {
    const authError = location.state?.twitchAuthError;
    if (!authError) return;
    if (authError === 'access_denied') {
      showToast.warning(t('wheel.twitch.access_denied', 'Cancelaste la autorización en Twitch'));
    } else {
      showToast.error(t('wheel.twitch.auth_error'));
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate, t]);

  // Al volver del callback el token ya está en sessionStorage: sincronizar el estado
  useEffect(() => {
    if (!twitchAccessToken) {
      const stored = readStoredTwitchToken();
      if (stored) setTwitchAccessToken(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // ─── Twitch: helpers ───
  const disconnectTwitch = useCallback(() => {
    try {
      sessionStorage.removeItem(TWITCH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(TWITCH_TOKEN_STORAGE_KEY);
    } catch (e) {
      /* noop */
    }
    setTwitchAccessToken(null);
    setTwitchLogin('');
    setTwitchExpiresIn(null);
    setAutoUpdateTwitch(false);
  }, []);

  const handleTwitchAuthError = useCallback(() => {
    showToast.error(t('wheel.twitch.auth_error'));
    disconnectTwitch();
  }, [disconnectTwitch, t]);

  // Validar el token al montar / cambiar: muestra el login y expira la sesión si ya no sirve (W-16)
  useEffect(() => {
    if (!twitchAccessToken) return undefined;
    const controller = new AbortController();
    fetch('https://id.twitch.tv/oauth2/validate', {
      headers: { Authorization: `OAuth ${twitchAccessToken}` },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new TwitchAuthError())))
      .then((data) => {
        if (!mountedRef.current) return;
        if (TWITCH_CLIENT_ID && data.client_id !== TWITCH_CLIENT_ID) throw new TwitchAuthError();
        setTwitchLogin(data.login || '');
        setTwitchExpiresIn(typeof data.expires_in === 'number' ? data.expires_in : null);
      })
      .catch((error) => {
        if (!mountedRef.current || error.name === 'AbortError') return;
        handleTwitchAuthError();
      });
    return () => controller.abort();
  }, [twitchAccessToken, handleTwitchAuthError]);

  const twitchFetch = async (url, { method = 'GET', body, signal } = {}) => {
    const headers = {
      Authorization: `Bearer ${twitchTokenRef.current}`,
      'Client-Id': TWITCH_CLIENT_ID,
    };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
    if (response.status === 401) throw new TwitchAuthError();
    return response;
  };

  const getBroadcasterId = async (signal) => {
    if (broadcasterIdRef.current) return broadcasterIdRef.current;
    const userResponse = await twitchFetch('https://api.twitch.tv/helix/users', { signal });
    const userData = await userResponse.json();
    if (!userData.data || !userData.data[0]) {
      throw new TwitchAuthError();
    }
    broadcasterIdRef.current = userData.data[0].id;
    return broadcasterIdRef.current;
  };

  const sendChatMessage = async (broadcasterId, message, signal) => {
    try {
      await twitchFetch(`https://api.twitch.tv/helix/chat/messages?broadcaster_id=${broadcasterId}&sender_id=${broadcasterId}`, {
        method: 'POST',
        body: { message, reply_to_message_id: null },
        signal,
      });
    } catch (error) {
      if (error instanceof TwitchAuthError) throw error;
      console.error('Error sending chat message:', error);
    }
  };

  const updateRedemptionStatus = async (broadcasterId, redemptionId, rewardId, status, signal) =>
    twitchFetch(
      `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?id=${redemptionId}&broadcaster_id=${broadcasterId}&reward_id=${rewardId}`,
      { method: 'PATCH', body: { status }, signal }
    );

  // Cargar recompensas de Twitch (con guard in-flight, W-07)
  const loadTwitchRewards = async () => {
    if (loadingRef.current || !twitchTokenRef.current) return;
    loadingRef.current = true;
    setIsLoadingTwitch(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    try {
      const broadcasterId = await getBroadcasterId(signal);

      // Obtener la lista de recompensas personalizadas
      const rewardsResponse = await twitchFetch(
        `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`,
        { signal }
      );
      if (!rewardsResponse.ok) {
        throw new Error('error_fetching_rewards');
      }
      const rewardsData = await rewardsResponse.json();

      // Buscar la recompensa "ruleta de $UVD"
      let wheelReward = rewardsData.data?.find((reward) => reward.title.toLowerCase() === REWARD_TITLE.toLowerCase());

      // Si no encontramos la recompensa, intentamos crearla
      if (!wheelReward) {
        const createResponse = await twitchFetch(
          `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`,
          {
            method: 'POST',
            body: {
              title: REWARD_TITLE,
              cost: REWARD_COST,
              prompt: 'Ingresa la direccion de tu wallet EVM',
              is_user_input_required: true,
              should_redemptions_skip_request_queue: false,
              is_enabled: true,
              background_color: '#9146FF',
              is_max_per_user_per_stream_enabled: true,
              max_per_user_per_stream: REWARD_MAX_PER_USER_PER_STREAM,
            },
            signal,
          }
        );
        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          console.error('Error creating reward:', errorData);
          showToast.error(t('wheel.twitch.create_reward_error'));
          return;
        }
        const newReward = await createResponse.json();
        wheelReward = newReward.data[0];
      }

      // Obtener las redenciones pendientes
      const response = await twitchFetch(
        `https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${broadcasterId}&reward_id=${wheelReward.id}&status=UNFULFILLED`,
        { signal }
      );
      if (!response.ok) {
        if (response.status === 403) {
          // La recompensa fue creada con otro Client ID
          showToast.error(t('wheel.twitch.client_id_mismatch'));
          return;
        }
        throw new Error('error_fetching_redemptions');
      }
      const data = await response.json();
      if (!data.data) {
        throw new Error('error_fetching_redemptions');
      }

      // No reprocesar canjes que ya están en la lista
      const knownRedemptions = new Set(participantsRef.current.map((p) => p.redemptionId).filter(Boolean));
      const shouldVerifyWallet = process.env.REACT_APP_WHEEL_VERIFY_WALLET === 'true';
      const validParticipants = [];
      const invalidRedemptions = [];
      let unverifiedCount = 0;
      let apiAuthFailed = false;

      for (const redemption of data.data) {
        if (knownRedemptions.has(redemption.id)) continue;
        const wallet = (redemption.user_input || '').trim();

        if (!isValidEthereumAddress(wallet)) {
          invalidRedemptions.push(redemption);
          await sendChatMessage(
            broadcasterId,
            `@${redemption.user_name} REKT tu wallet no es válida. La recompensa ha sido cancelada.`,
            signal
          );
          continue;
        }

        const participant = {
          key: makeId(),
          wallet,
          username: redemption.user_name,
          userLogin: redemption.user_login,
          userId: redemption.user_id,
          redemptionId: redemption.id,
          rewardId: wheelReward.id,
        };

        if (!shouldVerifyWallet) {
          validParticipants.push(participant);
          continue;
        }

        // Verificación de wallet contra la API (W-08/W-09): el token del streamer autoriza la llamada
        try {
          const apiResponse = await fetch(`${API_URL}/wallets`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${twitchTokenRef.current}`,
            },
            body: JSON.stringify({
              username: redemption.user_login || redemption.user_name,
              display_name: redemption.user_name,
              twitch_id: redemption.user_id,
              wallet: wallet.toLowerCase(),
            }),
            signal,
          });

          if (apiResponse.status === 200 || apiResponse.status === 201) {
            validParticipants.push(participant);
          } else if (apiResponse.status === 400) {
            const apiData = await apiResponse.json().catch(() => ({}));
            invalidRedemptions.push(redemption);
            await sendChatMessage(
              broadcasterId,
              `@${redemption.user_name} ${apiData.error || 'Wallet rechazada'}${apiData.details ? `: ${apiData.details}` : ''}`,
              signal
            );
          } else if (apiResponse.status === 401 || apiResponse.status === 403) {
            // Problema del streamer con la API, no del viewer: no cancelar el canje
            apiAuthFailed = true;
            unverifiedCount += 1;
          } else {
            unverifiedCount += 1;
          }
        } catch (error) {
          if (error.name === 'AbortError') throw error;
          // Error de red: dejar el canje UNFULFILLED y avisar al streamer, no cancelar (W-08)
          console.error('Error validating wallet:', error);
          unverifiedCount += 1;
        }
      }

      // Cancelar redenciones inválidas
      for (const redemption of invalidRedemptions) {
        await updateRedemptionStatus(broadcasterId, redemption.id, wheelReward.id, 'CANCELED', signal);
      }

      if (!mountedRef.current) return;

      if (apiAuthFailed) {
        showToast.error(
          t('wheel.twitch.verify_auth_error', 'La API rechazó el token de Twitch del streamer; no se cancelaron canjes')
        );
      } else if (unverifiedCount > 0) {
        showToast.warning(
          t('wheel.twitch.verify_network_error', 'No se pudo verificar {{count}} wallet(s) con la API; siguen pendientes en Twitch', {
            count: unverifiedCount,
          })
        );
      }

      // Agregar participantes válidos (merge, sin borrar los manuales ni los ya cargados)
      if (validParticipants.length > 0) {
        setParticipants((prev) => [...prev, ...validParticipants]);
      } else if (!autoUpdateTwitch) {
        // Solo avisar si no está en modo auto-update
        showToast.info(t('wheel.twitch.no_rewards'));
      }
    } catch (error) {
      if (error.name === 'AbortError' || !mountedRef.current) return;
      console.error('Error loading Twitch rewards:', error);
      if (error instanceof TwitchAuthError) {
        handleTwitchAuthError();
      } else if (error.message === 'error_fetching_redemptions') {
        showToast.error(t('wheel.twitch.redemption_error'));
      } else {
        showToast.error(t('wheel.twitch.load_error'));
      }
    } finally {
      loadingRef.current = false;
      if (abortRef.current === controller) abortRef.current = null;
      if (mountedRef.current) setIsLoadingTwitch(false);
    }
  };

  // Cargar holders de Echoes FIBO (para pago doble)
  useEffect(() => {
    const loadFiboHolders = async () => {
      try {
        const res = await fetch('/db/echoes-fibo-holders.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        const rawHolders = data?.holders || {};
        const normalized = {};
        Object.keys(rawHolders).forEach((addr) => {
          if (typeof addr === 'string') {
            normalized[addr.toLowerCase()] = rawHolders[addr];
          }
        });
        setFiboHolders(normalized);
        if (data?.double_payment_multiplier) {
          const mult = Number(data.double_payment_multiplier);
          if (!Number.isNaN(mult) && mult > 0) {
            setDoublePaymentMultiplier(mult);
          }
        }
      } catch (e) {
        console.warn('Error loading echoes-fibo-holders.json', e);
      }
    };
    loadFiboHolders();
  }, []);

  const getRewardAmountWithMultiplier = (wallet, baseAmount) => {
    const base = Number(baseAmount);
    if (!wallet || Number.isNaN(base)) return baseAmount?.toString?.() ?? String(baseAmount);
    const isHolder = !!fiboHolders[wallet.toLowerCase?.()];
    const multiplier = isHolder ? doublePaymentMultiplier : 1;
    return (base * multiplier).toString();
  };

  const isEchoesHolder = (wallet) => {
    if (!wallet) return false;
    try {
      return !!fiboHolders[wallet.toLowerCase?.()];
    } catch {
      return false;
    }
  };

  const getFiboLabel = (wallet) => {
    if (!wallet) return '';
    try {
      const entry = fiboHolders[wallet.toLowerCase?.()];
      if (!entry) return '';
      if (typeof entry.comment === 'string' && entry.comment.trim()) {
        return entry.comment.trim();
      }
      const fibo = entry.fibo;
      if (Array.isArray(fibo)) {
        return `FIBO #${fibo.join('/#')}`;
      }
      if (typeof fibo === 'number' || typeof fibo === 'string') {
        return `FIBO #${fibo}`;
      }
      return '';
    } catch {
      return '';
    }
  };

  const getEchoesBadgeText = (wallet) => {
    if (!isEchoesHolder(wallet)) return '';
    const label = getFiboLabel(wallet);
    return label
      ? t('wheel.echoes.badge_with_label', 'x2 por Echoes {{label}}', { label })
      : t('wheel.echoes.badge', 'x2 por Echoes');
  };

  // Carga inicial cuando se activa el switch de actualización automática
  useEffect(() => {
    if (autoUpdateTwitch && twitchAccessToken) {
      loadTwitchRewards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUpdateTwitch, twitchAccessToken]);

  // Verificación periódica cuando la lista está vacía (cubre también el final de la cola, W-07)
  useEffect(() => {
    const clearCheckInterval = () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };

    if (autoUpdateTwitch && twitchAccessToken && participants.length === 0) {
      clearCheckInterval();
      checkIntervalRef.current = setInterval(() => {
        loadTwitchRewards();
      }, 10000); // Verificar cada 10 segundos
      return clearCheckInterval;
    }

    clearCheckInterval();
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUpdateTwitch, twitchAccessToken, participants.length]);

  // Motivo por el que no se puede girar (se muestra en el centro de la ruleta)
  const disabledReason = !probabilitiesValid
    ? t('wheel.segments.sum_hint', 'Los porcentajes suman {{sum}}% — deben sumar 100%', { sum: probabilitySum })
    : isLoadingTwitch
      ? t('wheel.spin_button.loading')
      : isProcessingResult
        ? t('wheel.spin_button.processing', 'Procesando resultado...')
        : '';
  const canSpin = !isLoadingTwitch && !isProcessingResult && probabilitiesValid;

  const handleSpinStart = () => {
    setIsSpinning(true);
    setPendingConfirm(null);
  };

  // Completar recompensa de Twitch después del giro (siempre con la lista fresca, W-05)
  const handleSpinEnd = async (result) => {
    const current = participantsRef.current[0] || null;
    setIsSpinning(false);
    setIsProcessingResult(true);
    setSpinCount((n) => n + 1);

    try {
      if (!current) {
        // Giro de prueba: sin participantes no hay ganador
        setSpinResult(result);
        setSpinWasDoubled(false);
        setLastWinnerUsername('');
        setLastWinnerWallet('');
        return;
      }

      const isHolder = isEchoesHolder(current.wallet);
      const rewardAmount = getRewardAmountWithMultiplier(current.wallet, result);
      setSpinResult(rewardAmount);
      setSpinWasDoubled(!!isHolder);
      setLastWinnerUsername(current.username || '');
      setLastWinnerWallet(current.wallet || '');

      const newResult = {
        id: makeId(),
        wallet: current.wallet,
        username: current.username,
        result: rewardAmount,
        wasDoubled: !!isHolder,
        paid: false,
        txHash: null,
        redemptionId: current.redemptionId || null,
        at: new Date().toISOString(),
      };

      setCompletedParticipants((prev) => [...prev, newResult]);
      setParticipants((prev) => prev.filter((p) => p.key !== current.key));

      // Si es una recompensa de Twitch, marcarla como completada
      if (current.redemptionId && current.rewardId && twitchTokenRef.current) {
        try {
          const broadcasterId = await getBroadcasterId();
          await updateRedemptionStatus(broadcasterId, current.redemptionId, current.rewardId, 'FULFILLED');
          const winnerDisplay = current.username || shortAddress(current.wallet);
          const echoesSuffix = isHolder ? ` (${getEchoesBadgeText(current.wallet)})` : '';
          await sendChatMessage(
            broadcasterId,
            `@${winnerDisplay} Ganaste ${rewardAmount} $UVD en la ruleta${echoesSuffix}. Los tokens serán enviados pronto.`
          );
        } catch (error) {
          console.error('Error completing Twitch reward:', error);
          if (error instanceof TwitchAuthError) {
            handleTwitchAuthError();
          } else {
            showToast.error(t('wheel.twitch.complete_error'));
          }
        }
      }
    } finally {
      // Esperar un momento antes de desbloquear el botón para evitar clics accidentales
      setTimeout(() => {
        if (mountedRef.current) setIsProcessingResult(false);
      }, 1500);
    }
  };

  const handleAudioError = useCallback(() => {
    setAudioBroken(true);
  }, []);

  // Limpiar participantes pendientes (devuelve los puntos en Twitch)
  const clearParticipants = async () => {
    if (busy) return;
    const pending = participantsRef.current;
    const twitchPending = pending.filter((p) => p.redemptionId && p.rewardId);
    setParticipants([]);

    if (twitchPending.length > 0 && twitchTokenRef.current) {
      try {
        const broadcasterId = await getBroadcasterId();
        for (const participant of twitchPending) {
          try {
            await updateRedemptionStatus(broadcasterId, participant.redemptionId, participant.rewardId, 'CANCELED');
          } catch (error) {
            if (error instanceof TwitchAuthError) throw error;
            console.error('Error canceling Twitch reward:', error);
          }
        }
        await sendChatMessage(broadcasterId, 'Ruleta cancelada, se devolvieron los puntos a los participantes');
      } catch (error) {
        console.error('Error canceling Twitch rewards:', error);
        if (error instanceof TwitchAuthError) handleTwitchAuthError();
      }
    }
  };

  // ─── Exportar / copiar (W-02: por defecto solo pendientes de pago) ───
  const rowsForExport = includePaidInExport ? completedParticipants : pendingRewards;

  const generateCSVContent = (rows) => {
    const header = 'token_type,token_address,receiver,amount,id';
    const content = rows.map((result) => `erc20,${token},${result.wallet},${result.result}`).join(',\n');
    return `${header}\n${content},`;
  };

  const ensureExportRows = () => {
    if (rowsForExport.length > 0) return true;
    if (completedParticipants.length === 0) {
      showToast.warning(t('wheel.results.export.no_results'));
    } else {
      showToast.info(t('wheel.results.export.no_pending', 'No hay premios pendientes de pago; activa "Incluir ya pagados"'));
    }
    return false;
  };

  const exportToCSV = () => {
    if (!ensureExportRows()) return;

    const blob = new Blob([generateCSVContent(rowsForExport)], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    // Fecha actual en formato YYYYMMDD
    const today = new Date();
    const yyyy = String(today.getFullYear());
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    link.download = `ruleta_${yyyy}${mm}${dd}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast.success(t('wheel.results.export.success', '{{count}} filas exportadas', { count: rowsForExport.length }));
  };

  const copyToClipboard = async () => {
    if (!ensureExportRows()) return;
    try {
      await navigator.clipboard.writeText(generateCSVContent(rowsForExport));
      showToast.success(t('wheel.results.copy.success', 'Resultados copiados'));
    } catch (err) {
      showToast.error(t('wheel.results.copy.error'));
    }
  };

  // Compartir el último resultado (W-23)
  const shareResult = async () => {
    if (!spinResult) return;
    const user = lastWinnerUsername || shortAddress(lastWinnerWallet) || t('wheel.results.test_spin', 'Giro de prueba');
    const text = t('wheel.results.share.text', '{{user}} ganó {{amount}} $UVD en la ruleta de Ultravioleta DAO — {{url}}', {
      user,
      amount: spinResult,
      url: STREAM_URL,
    });
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      showToast.success(t('wheel.results.share.copied', 'Texto copiado para compartir'));
    } catch (err) {
      if (err?.name !== 'AbortError') showToast.error(t('wheel.results.copy.error'));
    }
  };

  // ─── Participantes (W-10) ───
  const addParticipant = () => {
    if (busy) return;
    const wallet = newParticipant.wallet.trim();
    if (!wallet) {
      showToast.warning(t('wheel.participants.add.wallet_required'));
      return;
    }
    if (!isValidEthereumAddress(wallet)) {
      showToast.error(t('wheel.twitch.invalid_wallet'));
      return;
    }
    const duplicate = participantsRef.current.some((p) => p.wallet.toLowerCase() === wallet.toLowerCase());
    if (duplicate) {
      showToast.warning(t('wheel.participants.add.duplicate', 'Esa wallet ya está en la lista'));
      return;
    }

    setParticipants((prev) => [...prev, { key: makeId(), wallet, username: newParticipant.username.trim() }]);
    setNewParticipant({ wallet: '', username: '' });
  };

  // Eliminar un participante (cancela el canje en Twitch si aplica)
  const removeParticipant = async (key) => {
    if (busy) return;
    const participant = participantsRef.current.find((p) => p.key === key);
    if (!participant) return;
    setParticipants((prev) => prev.filter((p) => p.key !== key));

    if (participant.redemptionId && participant.rewardId && twitchTokenRef.current) {
      try {
        const broadcasterId = await getBroadcasterId();
        await updateRedemptionStatus(broadcasterId, participant.redemptionId, participant.rewardId, 'CANCELED');
        await sendChatMessage(
          broadcasterId,
          `@${participant.username} Tu ruleta fue cancelada, se te devolvieron tus puntos`
        );
      } catch (error) {
        console.error('Error canceling Twitch reward:', error);
        if (error instanceof TwitchAuthError) handleTwitchAuthError();
      }
    }
  };

  // Enter en los inputs de participante
  const handleParticipantKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addParticipant();
    }
  };

  // ─── Segmentos (W-10/W-12) ───
  const addSegment = () => {
    const value = newSegment.trim();
    if (value === '') return;
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      showToast.error(t('wheel.segments.add.invalid_value', 'El valor debe ser un número mayor que 0'));
      return;
    }

    const requested = parseFloat(newProbability);
    const current = probabilities.map((p) => parseFloat(p) || 0);
    let next;
    if (Number.isFinite(requested) && requested > 0 && requested < 100) {
      // El nuevo valor toma lo pedido y el resto se reparte proporcionalmente
      const remaining = 100 - requested;
      const currentTotal = current.reduce((sum, n) => sum + n, 0) || 1;
      next = [...current.map((n) => (n / currentTotal) * remaining), requested];
    } else {
      // Sin probabilidad: parte igual y se re-escalan las demás
      const share = 100 / (current.length + 1);
      const currentTotal = current.reduce((sum, n) => sum + n, 0) || 1;
      next = [...current.map((n) => (n / currentTotal) * (100 - share)), share];
    }

    setSegments([...segments, value]);
    setProbabilities(normalizeProbabilities(next));
    setNewSegment('');
    setNewProbability('');
  };

  const removeSegment = (index) => {
    if (segments.length <= 2) {
      showToast.warning(t('wheel.segments.current.min_segments_error'));
      return;
    }
    const newSegments = segments.filter((_, i) => i !== index);
    const remaining = probabilities.filter((_, i) => i !== index);
    setSegments(newSegments);
    setProbabilities(normalizeProbabilities(remaining));
  };

  // Guardar el texto crudo mientras se escribe (W-11) y normalizar al salir del campo
  const updateProbability = (index, value) => {
    const newProbabilities = [...probabilities];
    newProbabilities[index] = value;
    setProbabilities(newProbabilities);
  };

  const normalizeProbabilityField = (index) => {
    const parsed = parseFloat(probabilities[index]);
    const clamped = Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0;
    const newProbabilities = [...probabilities];
    newProbabilities[index] = clamped.toFixed(1);
    setProbabilities(newProbabilities);
  };

  const resetToDefault = () => {
    setSegments(defaultSegments);
    setProbabilities(initProbabilities());
  };

  const equalizeAllProbabilities = () => {
    setProbabilities(normalizeProbabilities(segments.map(() => 1)));
  };

  // ─── Wallet (W-14: sin popups automáticos) ───
  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletBalance(null);
    setAllowance(null);
    setWrongNetwork(false);
    setPendingConfirm(null);
  };

  const refreshNetworkStatus = async () => {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const ok = String(chainId).toLowerCase() === AVALANCHE_NETWORK.chainId.toLowerCase();
      setWrongNetwork(!ok);
      return ok;
    } catch (error) {
      return false;
    }
  };

  // Cambiar a la red de Avalanche C-Chain (solo por acción del usuario)
  const switchToAvalancheNetwork = async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AVALANCHE_NETWORK.chainId }]
      });
      setWrongNetwork(false);
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AVALANCHE_NETWORK]
          });
          setWrongNetwork(false);
          return true;
        } catch (addError) {
          console.error('Error adding Avalanche network:', addError);
          showToast.error(t('wheel.wallet.network_add_error'));
          return false;
        }
      }
      if (switchError.code === 4001) {
        showToast.info(t('wheel.wallet.user_rejected'));
        return false;
      }
      console.error('Error switching network:', switchError);
      showToast.error(t('wheel.wallet.network_switch_error'));
      return false;
    }
  };

  const ensureAvalanche = async () => {
    if (await refreshNetworkStatus()) return true;
    return switchToAvalancheNetwork();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      showToast.error(t('wheel.wallet.no_provider'));
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        showToast.success(t('wheel.wallet.connected_success'));
        await ensureAvalanche();
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

  // Obtener el balance de tokens
  const getTokenBalance = async (address, tokenAddress) => {
    if (!window.ethereum || !isAddress(tokenAddress)) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

      try {
        const decimals = await tokenContract.decimals();
        setTokenDecimals(decimals);
      } catch (error) {
        console.warn('Error getting token decimals, using default (18):', error);
        setTokenDecimals(18);
      }

      const balance = await tokenContract.balanceOf(address);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      setWalletBalance(null);
    }
  };

  // Leer la allowance real; la comparación con el total pendiente es derivada (W-04)
  const checkTokenApproval = async () => {
    if (!window.ethereum || !walletAddress || !isAddress(token)) return null;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenContract = new ethers.Contract(token, ERC20_ABI, provider);
      const currentAllowance = await tokenContract.allowance(walletAddress, AIRDROP_CONTRACT_ADDRESS);
      setAllowance(currentAllowance);
      return currentAllowance;
    } catch (error) {
      console.error('Error checking token approval:', error);
      setAllowance(null);
      return null;
    }
  };

  // Aprobar exactamente el total pendiente de pago
  const approveTokens = async () => {
    if (!window.ethereum || !walletAddress || !isAddress(token) || pendingRewards.length === 0 || !pendingTotalUnits) {
      showToast.error(t('wheel.wallet.invalid_state'));
      return;
    }

    try {
      setIsApproving(true);
      if (!(await ensureAvalanche())) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(token, ERC20_ABI, signer);

      const tx = await tokenContract.approve(AIRDROP_CONTRACT_ADDRESS, pendingTotalUnits);
      showToast.info(t('wheel.wallet.approving_transaction'));
      await tx.wait();

      await checkTokenApproval();
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

  // Enviar los premios pendientes (W-02: nunca reenviar lo ya pagado; W-04: verificar antes de firmar)
  const sendRewards = async () => {
    if (!window.ethereum || !walletAddress || !isAddress(token)) {
      showToast.error(t('wheel.wallet.invalid_state'));
      return;
    }
    const batch = pendingRewards;
    if (batch.length === 0) {
      showToast.info(t('wheel.wallet.nothing_pending', 'Todos los premios ya fueron pagados'));
      return;
    }

    let recipients;
    let amounts;
    try {
      recipients = batch.map((p) => p.wallet);
      amounts = batch.map((p) => ethers.utils.parseUnits(String(p.result), tokenDecimals));
    } catch (error) {
      console.error('Invalid reward amounts:', error);
      showToast.error(t('wheel.wallet.invalid_state'));
      return;
    }
    const total = amounts.reduce((sum, a) => sum.add(a), ethers.constants.Zero);

    try {
      setIsSending(true);
      setPendingConfirm(null);
      if (!(await ensureAvalanche())) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(token, ERC20_ABI, provider);

      // Verificar allowance y balance ANTES de pedir la firma
      const [currentAllowance, balance] = await Promise.all([
        tokenContract.allowance(walletAddress, AIRDROP_CONTRACT_ADDRESS),
        tokenContract.balanceOf(walletAddress),
      ]);
      setAllowance(currentAllowance);
      setWalletBalance(balance);
      if (currentAllowance.lt(total)) {
        showToast.error(t('wheel.wallet.insufficient_allowance'));
        return;
      }
      if (balance.lt(total)) {
        showToast.error(
          t('wheel.wallet.insufficient_balance', 'Balance insuficiente: necesitas {{total}} {{symbol}}', {
            total: ethers.utils.formatUnits(total, tokenDecimals),
            symbol: tokenSymbol,
          })
        );
        return;
      }

      const airdropContract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, AIRDROP_ABI, signer);
      showToast.info(t('wheel.wallet.sending_transaction'));
      const tx = await airdropContract.erc20Airdrop(token, recipients, amounts);
      const receipt = await tx.wait();

      const paidIds = new Set(batch.map((p) => p.id));
      const txHash = receipt.transactionHash;
      setCompletedParticipants((prev) => prev.map((p) => (paidIds.has(p.id) ? { ...p, paid: true, txHash } : p)));
      setLastTxHash(txHash);
      showToast.success(t('wheel.wallet.send_success'));
      getTokenBalance(walletAddress, token);
      checkTokenApproval();
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

  // Reiniciar la sesión (W-17): borra el historial local; lo pagado ya quedó on-chain
  const startNewSession = () => {
    setCompletedParticipants([]);
    setSpinResult(null);
    setLastTxHash(null);
    setLastWinnerUsername('');
    setLastWinnerWallet('');
    setSpinWasDoubled(false);
    setPendingConfirm(null);
    showToast.success(t('wheel.session.cleared', 'Sesión reiniciada'));
  };

  const formatBalance = (balance) => {
    if (!balance) return "0";
    return ethers.utils.formatUnits(balance, tokenDecimals);
  };

  const txUrl = (hash) => `${AVALANCHE_NETWORK.blockExplorerUrls[0]}tx/${hash}`;

  // Actualizar balance y allowance cuando cambia la dirección, el token o los premios pendientes
  const pendingKey = pendingRewards.map((p) => p.id).join('|');
  useEffect(() => {
    if (walletAddress && isAddress(token)) {
      getTokenBalance(walletAddress, token);
      checkTokenApproval();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, token, pendingKey]);

  // Escuchar cambios de cuenta/red; al montar solo se LEE la cuenta (eth_accounts), sin popups (W-14)
  useEffect(() => {
    if (!window.ethereum) return undefined;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        refreshNetworkStatus();
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = () => {
      refreshNetworkStatus();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (!mountedRef.current) return;
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          refreshNetworkStatus();
        }
      })
      .catch(() => {});

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Estilos compartidos (tema oscuro del sitio, W-23) ───
  const panelClass = 'bg-background-lighter border border-ultraviolet-darker/40 p-6 rounded-lg shadow-md';
  const inputClass =
    'w-full p-2 bg-background-input text-text-primary placeholder-gray-400 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-ultraviolet disabled:opacity-50';
  const primaryButtonClass =
    'bg-ultraviolet hover:bg-ultraviolet-light text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const headingClass = 'text-lg font-semibold mb-2 text-text-primary';

  const winnerLabel = lastWinnerUsername || (lastWinnerWallet ? shortAddress(lastWinnerWallet) : t('wheel.results.test_spin', 'Giro de prueba'));
  const twitchHours = twitchExpiresIn ? Math.max(1, Math.round(twitchExpiresIn / 3600)) : null;

  return (
    <>
      <SEO
        title={t('wheel.seoTitle')}
        description={t('wheel.seoDescription')}
        keywords="UVD rewards wheel, crypto rewards, spin to win tokens, DAO rewards, Avalanche tokens, Web3 gamification, crypto giveaway"
      />
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
          theme="dark"
          limit={3}
        />

        <div className="flex justify-end items-center gap-2 mb-6">
          {/* Mute (W-23) */}
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            disabled={audioBroken}
            aria-pressed={muted}
            aria-label={
              audioBroken
                ? t('wheel.sound.unavailable', 'Sonido no disponible')
                : muted
                  ? t('wheel.sound.unmute', 'Activar sonido')
                  : t('wheel.sound.mute', 'Silenciar')
            }
            title={
              audioBroken
                ? t('wheel.sound.unavailable', 'Sonido no disponible')
                : muted
                  ? t('wheel.sound.unmute', 'Activar sonido')
                  : t('wheel.sound.mute', 'Silenciar')
            }
            className="p-2 rounded bg-background-lighter border border-ultraviolet-darker/40 text-text-primary hover:bg-ultraviolet-darker/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ultraviolet"
          >
            {muted || audioBroken ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
          </button>

          {/* Botón de conectar wallet siempre visible en la parte superior */}
          {!walletAddress ? (
            <button
              type="button"
              onClick={connectWallet}
              className={`${primaryButtonClass} flex items-center gap-2`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8h8V6z" clipRule="evenodd" />
              </svg>
              {t('wheel.wallet.connect_button')}
            </button>
          ) : (
            <button
              type="button"
              onClick={disconnectWallet}
              aria-label={t('wheel.wallet.disconnect', 'Desconectar wallet')}
              title={t('wheel.wallet.disconnect', 'Desconectar wallet')}
              className="flex items-center gap-2 bg-ultraviolet py-1 px-3 rounded cursor-pointer hover:bg-ultraviolet-light transition-colors group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span className={`w-2 h-2 rounded-full ${wrongNetwork ? 'bg-yellow-400' : 'bg-green-500'}`} aria-hidden="true"></span>
              <span className="text-sm font-medium text-white font-mono">{shortAddress(walletAddress)}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white opacity-70 group-hover:opacity-100" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Banner de red incorrecta (W-14): no se fuerza el cambio, se ofrece */}
        {walletAddress && wrongNetwork && (
          <div role="alert" className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-yellow-500/50 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            <span>{t('wheel.wallet.wrong_network', 'Tu wallet está en otra red. La ruleta paga en Avalanche C-Chain.')}</span>
            <button type="button" onClick={switchToAvalancheNetwork} className={`${primaryButtonClass} py-1`}>
              {t('wheel.wallet.switch_network', 'Cambiar a Avalanche')}
            </button>
          </div>
        )}

        {/* Header Watch to Earn */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <PlayCircleIcon className="w-8 h-8 text-ultraviolet" aria-hidden="true" />
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t('wheel.title')}</h1>
          </div>
          <p className="text-text-secondary max-w-3xl">
            {t('wheel.description')}
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 bg-background-lighter/60 rounded-md px-3 py-2 border border-ultraviolet-darker/15">
              <SparklesIcon className="w-5 h-5 text-ultraviolet" aria-hidden="true" />
              <span className="text-sm text-text-primary">{t('wheel.highlights.redeem')}</span>
            </div>
            <div className="flex items-center gap-2 bg-background-lighter/60 rounded-md px-3 py-2 border border-ultraviolet-darker/15">
              <CurrencyDollarIcon className="w-5 h-5 text-ultraviolet" aria-hidden="true" />
              <span className="text-sm text-text-primary">{t('wheel.highlights.paid')}</span>
            </div>
            <div className="flex items-center gap-2 bg-background-lighter/60 rounded-md px-3 py-2 border border-ultraviolet-darker/15">
              <PlayCircleIcon className="w-5 h-5 text-ultraviolet" aria-hidden="true" />
              <span className="text-sm text-text-primary">{t('wheel.highlights.watch')}</span>
            </div>
            <div className="flex items-center gap-2 bg-background-lighter/60 rounded-md px-3 py-2 border border-ultraviolet-darker/15">
              <svg className="w-5 h-5 text-twitch" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
              </svg>
              <span className="text-sm text-text-primary">
                {t('wheel.highlights.limit', '{{max}} giro por stream · {{cost}} puntos de canal', {
                  max: REWARD_MAX_PER_USER_PER_STREAM,
                  cost: REWARD_COST.toLocaleString(i18n.language),
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="lg:w-1/2 w-full flex flex-col items-center justify-center">
            <div className="mb-8 w-full">
              <UvdWheel
                segments={segments}
                probabilities={probabilities}
                onSpinStart={handleSpinStart}
                onSpinEnd={handleSpinEnd}
                onError={(message) => showToast.error(message)}
                disabled={!canSpin}
                disabledReason={disabledReason}
                muted={muted}
                onAudioError={handleAudioError}
              />
            </div>

            {/* Resultado (aria-live para lectores de pantalla, W-15) */}
            <div aria-live="polite" aria-atomic="true" className="w-full">
              {spinResult && (
                <div className="relative mt-2 p-6 bg-ultraviolet-darker/40 border border-ultraviolet/40 rounded-lg shadow-md text-center w-full overflow-hidden">
                  {!reduceMotion && <Confetti burstKey={spinCount} />}
                  <h3 className="text-2xl font-semibold text-text-primary mb-2">{t('wheel.results.title')}:</h3>
                  <p className="text-5xl font-bold text-white">{spinResult}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-text-primary">
                    <span className="text-base font-semibold">{winnerLabel}</span>
                    {spinWasDoubled && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-200 text-yellow-900 border border-yellow-300">
                        {getEchoesBadgeText(lastWinnerWallet)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={shareResult}
                    className="mt-4 inline-flex items-center gap-2 text-sm text-text-primary border border-ultraviolet/50 rounded px-3 py-1 hover:bg-ultraviolet/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ultraviolet"
                  >
                    <ShareIcon className="w-4 h-4" aria-hidden="true" />
                    {t('wheel.results.share.button', 'Compartir')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-1/2 w-full space-y-4">
            {/* Panel de Personalización */}
            <div className={panelClass}>
              <button
                type="button"
                onClick={() => setShowCustomizePanel(!showCustomizePanel)}
                aria-expanded={showCustomizePanel}
                className={`w-full mb-4 ${primaryButtonClass} py-3`}
              >
                {showCustomizePanel ? t('wheel.customize_button.hide') : t('wheel.customize_button.show')}
              </button>

              {showCustomizePanel && (
                <>
                  {/* Token Field */}
                  <div className="mb-4">
                    <label htmlFor="wheel-token" className={`block ${headingClass}`}>{t('wheel.token.title')}</label>
                    <input
                      id="wheel-token"
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className={`${inputClass} font-mono text-sm`}
                      placeholder={t('wheel.token.placeholder')}
                      spellCheck={false}
                    />
                  </div>

                  <div className="mb-4">
                    <h3 className={headingClass}>{t('wheel.segments.add.title')}</h3>
                    <div className="mb-2">
                      <label htmlFor="wheel-new-segment" className="sr-only">{t('wheel.segments.add.value_placeholder')}</label>
                      <input
                        id="wheel-new-segment"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        value={newSegment}
                        onChange={(e) => setNewSegment(e.target.value)}
                        className={`${inputClass} mb-2`}
                        placeholder={t('wheel.segments.add.value_placeholder')}
                      />
                      <div className="flex items-center">
                        <label htmlFor="wheel-new-probability" className="sr-only">{t('wheel.segments.add.probability_placeholder')}</label>
                        <input
                          id="wheel-new-probability"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="100"
                          step="0.1"
                          value={newProbability}
                          onChange={(e) => setNewProbability(e.target.value)}
                          className={`${inputClass} rounded-r-none`}
                          placeholder={t('wheel.segments.add.probability_placeholder')}
                        />
                        <button
                          type="button"
                          onClick={addSegment}
                          className={`${primaryButtonClass} rounded-l-none`}
                        >
                          {t('wheel.segments.add.button')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`${headingClass} mb-0`}>{t('wheel.segments.current.title')}</h3>
                      {/* Suma en vivo (W-12) */}
                      <span
                        className={`text-sm font-mono ${probabilitiesValid ? 'text-green-400' : 'text-yellow-300'}`}
                        aria-live="polite"
                      >
                        {t('wheel.segments.sum_label', 'Suma')}: {probabilitySum.toFixed(1)}%
                      </span>
                    </div>
                    {!probabilitiesValid && (
                      <p className="text-xs text-yellow-300 mb-2">
                        {t('wheel.segments.sum_hint', 'Los porcentajes suman {{sum}}% — deben sumar 100%', { sum: probabilitySum.toFixed(1) })}
                      </p>
                    )}
                    <div className="max-h-60 overflow-y-auto">
                      {segments.map((segment, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                          <div className="flex-grow">
                            <span className="font-medium text-lg text-text-primary">{segment}</span>
                            <div className="flex items-center mt-1">
                              <label htmlFor={`wheel-prob-${index}`} className="sr-only">
                                {t('wheel.segments.add.probability_placeholder')} {segment}
                              </label>
                              <input
                                id={`wheel-prob-${index}`}
                                type="number"
                                inputMode="decimal"
                                min="0"
                                max="100"
                                step="0.1"
                                value={probabilities[index] ?? ''}
                                onChange={(e) => updateProbability(index, e.target.value)}
                                onBlur={() => normalizeProbabilityField(index)}
                                className="w-20 p-1 text-sm bg-background-input text-text-primary border border-gray-600 rounded mr-1 focus:outline-none focus:ring-1 focus:ring-ultraviolet"
                              />
                              <span className="text-xs text-text-secondary">{t('wheel.segments.current.probability_suffix')}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSegment(index)}
                            aria-label={`${t('wheel.participants.list.remove')} ${segment}`}
                            className="text-red-400 hover:text-red-300 ml-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col space-y-2">
                    <button
                      type="button"
                      onClick={equalizeAllProbabilities}
                      className={`w-full ${primaryButtonClass}`}
                    >
                      {t('wheel.buttons.equalize')}
                    </button>

                    <button
                      type="button"
                      onClick={resetToDefault}
                      className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                      {t('wheel.buttons.reset')}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Panel de Participantes */}
            <div className={panelClass}>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setShowParticipantsPanel(!showParticipantsPanel)}
                  aria-expanded={showParticipantsPanel}
                  className={`flex-1 ${primaryButtonClass} py-3`}
                >
                  {showParticipantsPanel ? t('wheel.participants.panel.hide') : t('wheel.participants.panel.show')}
                </button>
                {participants.length > 0 && (
                  <button
                    type="button"
                    onClick={clearParticipants}
                    disabled={busy}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('wheel.participants.panel.clear')}
                  </button>
                )}
              </div>

              {showParticipantsPanel && (
                <div>
                  {/* Panel de inputs para nuevo participante */}
                  <div className="mb-4">
                    <h3 className={headingClass}>{t('wheel.participants.add.title')}</h3>
                    <label htmlFor="wheel-new-wallet" className="sr-only">{t('wheel.participants.add.wallet_placeholder')}</label>
                    <input
                      id="wheel-new-wallet"
                      type="text"
                      value={newParticipant.wallet}
                      onChange={(e) => setNewParticipant({ ...newParticipant, wallet: e.target.value })}
                      onKeyDown={handleParticipantKeyDown}
                      className={`${inputClass} mb-2 font-mono text-sm`}
                      placeholder={t('wheel.participants.add.wallet_placeholder')}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <label htmlFor="wheel-new-username" className="sr-only">{t('wheel.participants.add.username_placeholder')}</label>
                    <input
                      id="wheel-new-username"
                      type="text"
                      value={newParticipant.username}
                      onChange={(e) => setNewParticipant({ ...newParticipant, username: e.target.value })}
                      onKeyDown={handleParticipantKeyDown}
                      className={`${inputClass} mb-2`}
                      placeholder={t('wheel.participants.add.username_placeholder')}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={addParticipant}
                      disabled={busy}
                      className={`w-full ${primaryButtonClass} mb-4`}
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
                              type="button"
                              onClick={() => loadTwitchRewards()}
                              disabled={isLoadingTwitch || busy}
                              className="flex-1 flex items-center justify-center gap-2 bg-twitch hover:bg-twitch-dark text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                              </svg>
                              {isLoadingTwitch ? t('wheel.twitch.loading') : t('wheel.twitch.load')}
                            </button>
                            <button
                              type="button"
                              onClick={disconnectTwitch}
                              className="text-red-400 hover:text-red-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded p-1"
                              title={t('common.disconnect')}
                              aria-label={t('common.disconnect')}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          {twitchLogin && (
                            <p className="text-xs text-text-secondary">
                              {t('wheel.twitch.connected_as', 'Conectado como {{login}}', { login: twitchLogin })}
                              {twitchHours ? ` · ${t('wheel.twitch.expires_in', 'sesión válida ~{{hours}} h', { hours: twitchHours })}` : ''}
                            </p>
                          )}
                          <div className="flex items-center justify-between bg-background-input p-2 rounded">
                            <span id="wheel-auto-update-label" className="text-sm font-medium text-text-primary">
                              {t('wheel.twitch.auto_update')}
                            </span>
                            {/* Toggle accesible (W-15) */}
                            <button
                              type="button"
                              role="switch"
                              aria-checked={autoUpdateTwitch}
                              aria-labelledby="wheel-auto-update-label"
                              onClick={() => setAutoUpdateTwitch(!autoUpdateTwitch)}
                              className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${autoUpdateTwitch ? 'bg-twitch' : 'bg-gray-500'}`}
                            >
                              <span
                                className={`absolute left-1 top-1 w-4 h-4 transition duration-100 ease-in-out transform bg-white rounded-full ${autoUpdateTwitch ? 'translate-x-6' : 'translate-x-0'}`}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lista de participantes */}
                    {(participants.length > 0 || completedParticipants.length > 0) && (
                      <div className="mt-4">
                        <h3 className={headingClass}>{t('wheel.participants.list.title')}</h3>

                        <div className="flex justify-between text-sm mb-2 px-2 text-text-secondary">
                          <span>
                            <strong className="text-text-primary">{t('wheel.participants.list.pending')}:</strong> {participants.length}
                          </span>
                          <span>
                            <strong className="text-text-primary">{t('wheel.participants.list.total')}:</strong> {participants.length + completedParticipants.length}
                          </span>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-background">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-text-primary">{t('wheel.participants.list.headers.user')}</th>
                                <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-text-primary">{t('wheel.participants.list.headers.wallet')}</th>
                                <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-text-primary">{t('wheel.participants.list.headers.result')}</th>
                                <th scope="col" className="px-4 py-2 w-10"><span className="sr-only">{t('wheel.participants.list.remove')}</span></th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Pendientes: el primero es el turno actual */}
                              {participants.map((participant, index) => (
                                <tr key={participant.key} className="border-b border-gray-700">
                                  <td className="px-4 py-3">
                                    <span className="font-medium text-text-primary">
                                      {participant.username || t('wheel.participants.list.anonymous')}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-sm text-text-secondary font-mono">{shortAddress(participant.wallet)}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {index === 0 ? (
                                      <span className="text-sm text-ultraviolet-light animate-pulse inline-flex items-center gap-2">
                                        {t('wheel.participants.list.current_turn')}
                                        {isEchoesHolder(participant.wallet) && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-200 text-yellow-900 border border-yellow-300">
                                            {getEchoesBadgeText(participant.wallet)}
                                          </span>
                                        )}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-text-secondary">{t('wheel.participants.list.pending')}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <button
                                      type="button"
                                      onClick={() => removeParticipant(participant.key)}
                                      disabled={busy}
                                      className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                                      title={t('wheel.participants.list.remove')}
                                      aria-label={`${t('wheel.participants.list.remove')}: ${participant.username || shortAddress(participant.wallet)}`}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}

                              {/* Resultados históricos */}
                              {completedParticipants.length > 0 && (
                                <>
                                  <tr>
                                    <td colSpan="4" className="px-4 py-2 bg-background">
                                      <h4 className="text-sm font-semibold text-green-400">
                                        {t('wheel.participants.list.completed')}
                                      </h4>
                                    </td>
                                  </tr>
                                  {completedParticipants.map((completed) => (
                                    <tr key={completed.id} className="border-b border-gray-700">
                                      <td className="px-4 py-3">
                                        <span className="font-medium text-text-primary">
                                          {completed.username || t('wheel.participants.list.anonymous')}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="text-sm text-text-secondary font-mono">{shortAddress(completed.wallet)}</span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/60 text-green-200 border border-green-700">
                                            {completed.result}
                                          </span>
                                          {completed.wasDoubled && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-200 text-yellow-900 border border-yellow-300">
                                              {getEchoesBadgeText(completed.wallet) || 'x2'}
                                            </span>
                                          )}
                                          {completed.paid ? (
                                            <a
                                              href={completed.txHash ? txUrl(completed.txHash) : undefined}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ultraviolet/30 text-ultraviolet-light border border-ultraviolet/50 hover:bg-ultraviolet/50"
                                            >
                                              {t('wheel.participants.list.paid', 'Pagado')} ✓
                                            </a>
                                          ) : (
                                            <span className="text-[10px] text-text-secondary">
                                              {t('wheel.wallet.pending_rewards', 'Pendiente de pago')}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3"></td>
                                    </tr>
                                  ))}
                                </>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Exportar, copiar, enviar */}
                    {completedParticipants.length > 0 && (
                      <div className="flex flex-col gap-2 mt-4">
                        <label className="flex items-center gap-2 text-sm text-text-secondary">
                          <input
                            type="checkbox"
                            checked={includePaidInExport}
                            onChange={(e) => setIncludePaidInExport(e.target.checked)}
                            className="accent-ultraviolet"
                          />
                          {t('wheel.results.export.include_paid', 'Incluir ya pagados')} ({paidRewards.length})
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={copyToClipboard}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                          >
                            {t('wheel.results.copy.button')}
                          </button>
                          <button
                            type="button"
                            onClick={exportToCSV}
                            className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
                          >
                            {t('wheel.results.export.button')}
                          </button>
                        </div>

                        {/* Sección para enviar premios directamente */}
                        <div className="mt-2 p-4 bg-background border border-ultraviolet-darker/40 rounded-lg">
                          <h4 className="text-lg font-semibold text-text-primary mb-2">
                            {t('wheel.wallet.send_rewards')}
                          </h4>

                          {walletAddress ? (
                            <div className="mb-3 text-sm text-text-secondary space-y-1">
                              <p>
                                <span className="font-semibold text-text-primary">{t('wheel.wallet.connected')}:</span>{' '}
                                <span className="font-mono">{shortAddress(walletAddress)}</span>
                              </p>
                              {walletBalance && (
                                <p>
                                  <span className="font-semibold text-text-primary">{t('wheel.wallet.balance')}:</span> {formatBalance(walletBalance)} {tokenSymbol}
                                </p>
                              )}
                              <p>
                                <span className="font-semibold text-text-primary">{t('wheel.wallet.pending_rewards', 'Pendiente de pago')}:</span> {pendingTotal} {tokenSymbol} · {pendingRewards.length}
                              </p>
                              {paidRewards.length > 0 && (
                                <p>
                                  <span className="font-semibold text-text-primary">{t('wheel.wallet.paid_rewards', 'Ya pagado')}:</span> {paidRewards.length}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-text-secondary mb-3">
                              {t('wheel.wallet.connect_required')}
                            </p>
                          )}

                          <div className="flex flex-col gap-2">
                            {!walletAddress && (
                              <button type="button" onClick={connectWallet} className={`w-full ${primaryButtonClass}`}>
                                {t('wheel.wallet.connect_button')}
                              </button>
                            )}

                            {walletAddress && (
                              <>
                                {!hasTokenApproval && pendingRewards.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={approveTokens}
                                    disabled={isApproving || isSending}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isApproving
                                      ? `${t('wheel.wallet.approving')} ${pendingTotal} ${tokenSymbol} ...`
                                      : `${t('wheel.wallet.approve_button')} ${pendingTotal} ${tokenSymbol}`}
                                  </button>
                                )}

                                {pendingConfirm === 'send' ? (
                                  <div className="rounded border border-ultraviolet/60 bg-ultraviolet-darker/30 p-3 text-sm text-text-primary">
                                    <p className="mb-2">
                                      {t('wheel.wallet.confirm_send', 'Enviar {{total}} {{symbol}} a {{count}} destinatarios', {
                                        total: pendingTotal,
                                        symbol: tokenSymbol,
                                        count: pendingRewards.length,
                                      })}
                                    </p>
                                    <div className="flex gap-2">
                                      <button type="button" onClick={sendRewards} className={`flex-1 ${primaryButtonClass}`}>
                                        {t('wheel.wallet.confirm_button', 'Confirmar envío')}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setPendingConfirm(null)}
                                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
                                      >
                                        {t('common.cancel')}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setPendingConfirm('send')}
                                    disabled={isSending || isApproving || pendingRewards.length === 0 || !hasTokenApproval}
                                    className={`w-full ${primaryButtonClass}`}
                                  >
                                    {isSending
                                      ? t('wheel.wallet.sending')
                                      : pendingRewards.length === 0
                                        ? t('wheel.wallet.nothing_pending', 'Todos los premios ya fueron pagados')
                                        : `${t('wheel.wallet.send_button')} (${pendingRewards.length})`}
                                  </button>
                                )}
                              </>
                            )}

                            {lastTxHash && (
                              <a
                                href={txUrl(lastTxHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
                              >
                                {t('wheel.wallet.view_transaction')}
                              </a>
                            )}
                          </div>

                          <p className="text-xs text-text-secondary mt-2">
                            {t('wheel.wallet.info')}
                          </p>
                        </div>

                        {/* Nueva sesión (W-17) */}
                        {pendingConfirm === 'new-session' ? (
                          <div className="rounded border border-red-500/60 bg-red-900/20 p-3 text-sm text-text-primary">
                            <p className="mb-2">
                              {t('wheel.session.confirm', 'Se borrarán {{count}} resultados de esta sesión (los ya pagados quedan en la blockchain). ¿Continuar?', {
                                count: completedParticipants.length,
                              })}
                            </p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={startNewSession}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                              >
                                {t('wheel.session.new', 'Nueva sesión')}
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingConfirm(null)}
                                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
                              >
                                {t('common.cancel')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingConfirm('new-session')}
                            disabled={busy || isSending}
                            className="w-full text-sm text-text-secondary hover:text-red-300 underline underline-offset-2 disabled:opacity-50"
                          >
                            {t('wheel.session.new', 'Nueva sesión')}
                          </button>
                        )}
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
    </>
  );
};

export default UvdWheelPage;
