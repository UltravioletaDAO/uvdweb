import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, GiftIcon, UsersIcon, BoltIcon, UserCircleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BountyForm from '../components/BountyForm';
import SubmissionList from '../components/SubmissionList';
import WalletConnect from '../components/WalletConnect';
import { ethers } from 'ethers';
import { bountiesAPI } from '../services/api';
import { useBounties, useWhitelist, useAdmin } from '../hooks';
import { LinkifyText } from '../utils/linkify';
import { TrashIcon, PencilIcon, ShieldCheckIcon, UsersIcon as UserGroupIcon } from '@heroicons/react/24/outline';
import AdminWalletsModal from '../components/AdminWalletsModal';

// Helper para mostrar notificaciones toast
const showToast = {
  success: (message) => {
    toast.success(message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
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
      theme: "dark",
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
      theme: "dark",
    });
  },
};

// Column keys for Kanban board (titles and descriptions come from i18n)
const COLUMN_KEYS = ['todo', 'in_voting', 'finished'];
const COLUMN_ICONS = {
  todo: UsersIcon,
  in_voting: BoltIcon,
  finished: GiftIcon,
};

const Bounties = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Custom hooks
  const {
    loadingBounties,
    fetchBountiesError,
    selectedBounty,
    setSelectedBounty,
    closeBountyDetails,
    fetchBounties,
    getTasksByStatus,
    isVotingExpired,
  } = useBounties();

  const {
    isWhitelisted,
    whitelistDetails,
    checkingWhitelist,
    tokenBalance,
    checkWhitelistStatus,
    resetWhitelist,
  } = useWhitelist();

  // Estados para Web3 y votación (declarados antes de useAdmin)
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isWalletHover, setIsWalletHover] = useState(false);
  const [ensName, setEnsName] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);

  // Admin hook - se inicializa con null y se actualiza cuando se conecta la wallet
  const [adminProvider, setAdminProvider] = useState(null);
  const {
    isAdmin,
    isAuthenticated: isAdminAuthenticated,
    authLoading: adminAuthLoading,
    error: adminError,
    authenticate: authenticateAdmin,
    logout: logoutAdmin,
    updateBounty: adminUpdateBounty,
    deleteBounty: adminDeleteBounty,
    updateBountyStatus: adminUpdateStatus,
    hasPermission,
    getAdminWallets,
    addAdminWallet,
    deleteAdminWallet,
  } = useAdmin(walletAddress, adminProvider);

  // Local states
  const [bountyFormLoading, setBountyFormLoading] = useState(false);
  const [bountyFormError, setBountyFormError] = useState('');

  // Estados para el formulario de entrega de tarea
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // Estados para submissions
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Estado para mostrar/ocultar panel de creación
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  // Memoized columns with i18n
  const columns = useMemo(() => COLUMN_KEYS.map(key => ({
    key,
    title: t(`bountyColumns.titles.${key}`),
    description: t(`navigation.descriptions.${key}`),
    Icon: COLUMN_ICONS[key],
  })), [t]);

  // Al montar, intenta restaurar la wallet usando EIP-6963 para encontrar el provider correcto
  useEffect(() => {
    const restoreWalletAndCheckWhitelist = async () => {
      const savedWallet = localStorage.getItem('walletAddress');
      const savedWalletId = localStorage.getItem('walletProviderId');

      if (!savedWallet) return;

      // Usar EIP-6963 para encontrar el provider correcto
      const eip6963Providers = new Map();

      const handleAnnounceProvider = (event) => {
        const { info, provider } = event.detail;
        eip6963Providers.set(info.uuid, { info, provider });
      };

      window.addEventListener('eip6963:announceProvider', handleAnnounceProvider);
      window.dispatchEvent(new Event('eip6963:requestProvider'));

      // Esperar un poco para que las wallets respondan
      await new Promise(resolve => setTimeout(resolve, 300));
      window.removeEventListener('eip6963:announceProvider', handleAnnounceProvider);

      // Buscar el provider guardado o uno que tenga la cuenta
      let selectedProvider = null;

      // Primero buscar por ID guardado
      if (savedWalletId) {
        for (const [uuid, { info, provider }] of eip6963Providers) {
          if (uuid === savedWalletId || info.name.toLowerCase().includes(savedWalletId.toLowerCase())) {
            selectedProvider = provider;
            break;
          }
        }
      }

      // Si no encontramos por ID, buscar el que tenga la cuenta conectada
      if (!selectedProvider) {
        for (const [, { provider }] of eip6963Providers) {
          try {
            const accounts = await provider.request({ method: 'eth_accounts' });
            if (accounts && accounts.some(acc => acc.toLowerCase() === savedWallet.toLowerCase())) {
              selectedProvider = provider;
              break;
            }
          } catch {
            // Provider no tiene acceso, continuar
          }
        }
      }

      if (selectedProvider) {
        try {
          const ethersProvider = new ethers.providers.Web3Provider(selectedProvider, 'any');
          setWalletConnected(true);
          setWalletAddress(savedWallet);
          setWeb3Provider(ethersProvider);
          setAdminProvider(ethersProvider);
          await checkWhitelistStatus(savedWallet, ethersProvider);
        } catch {
          // Si falla, limpiar y el usuario deberá reconectar
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('walletProviderId');
        }
      } else {
        // No encontramos el provider correcto, mostrar solo la dirección pero sin provider
        // El usuario deberá reconectar para acciones que requieran firma
        setWalletConnected(true);
        setWalletAddress(savedWallet);
        // No establecemos adminProvider, así el admin auth fallará y pedirá reconectar
      }
    };

    restoreWalletAndCheckWhitelist();
  }, [checkWhitelistStatus]);

  // Buscar ENS asociado a la wallet conectada
  useEffect(() => {
    const fetchENSName = async (wallet) => {
      try {
        if (!wallet) return;
        const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
        const ens = await provider.lookupAddress(wallet);
        setEnsName(ens);
      } catch {
        setEnsName(null);
      }
    };
    if (walletAddress) {
      fetchENSName(walletAddress);
    } else {
      setEnsName(null);
    }
  }, [walletAddress]);

  const handleReturn = () => {
    navigate('/', { replace: true });
  };

  // Función para cerrar la vista detallada del bounty
  const handleCloseBountyDetails = () => {
    closeBountyDetails();
    setSubmissionContent('');
    setSubmissionError('');
  };

  // URL de Snapshot para votaciones
  const SNAPSHOT_VOTING_URL = 'https://snapshot.box/#/s:bounties.ultravioletadao.eth';

  const handleCreateBounty = async (bountyData) => {
    setBountyFormLoading(true);
    setBountyFormError('');
    try {
      if (!walletConnected || !walletAddress) {
        throw new Error(t('bountyCreation.error_wallet_required'));
      }

      if (!isWhitelisted) {
        throw new Error(t('bountyCreation.error_insufficient_tokens'));
      }

      // Agregar la wallet del creador a los datos de la bounty
      const bountyDataWithWallet = {
        ...bountyData,
        createdBy: walletAddress,
        creatorWallet: walletAddress
      };

      await bountiesAPI.create(bountyDataWithWallet);

      showToast.success(t('bountyForm.success_message', { title: bountyData.title }));
      fetchBounties();
      // Success - form will reset automatically
    } catch (err) {
      setBountyFormError(err.message);
      throw err; // Re-throw so form knows submission failed
    } finally {
      setBountyFormLoading(false);
    }
  };

  // Manejar el envío de una tarea (submission)
  const handleSubmitSubmission = async (e) => {
    e.preventDefault();
    setSubmissionLoading(true);
    setSubmissionError('');
    try {
      if (!selectedBounty) {
        throw new Error(t('bountyDetails.error_bounty_not_selected'));
      }
      if (!walletConnected || !walletAddress) {
        throw new Error(t('bountyDetails.connect_wallet_to_submit') || 'Debes conectar tu wallet para entregar una tarea.');
      }
      
      const submissionData = {
        submissionContent,
        submissionType: 'url',
        submitterName: walletAddress
      };

      const data = await bountiesAPI.createSubmission(selectedBounty._id, submissionData);

      showToast.success(t('bountyDetails.submission_success_message'));
      setSubmissionContent('');
      fetchBounties();
    } catch (err) {
      // Detectar error de submission duplicada (409)
      if (err.message.includes('Ya has enviado') || err.message.includes('already submitted')) {
        showToast.error(t('bountyDetails.error_duplicate_submission'));
        setSubmissionError(t('bountyDetails.error_duplicate_submission'));
      } else {
        setSubmissionError(err.message);
      }
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Funciones para Web3 y votación
  const handleWalletConnected = async (address, chainId, provider) => {
    setWalletConnected(true);
    setWalletAddress(address);
    setWeb3Provider(provider);
    setAdminProvider(provider); // Para el hook de admin
    setIsWalletModalOpen(false);
    localStorage.setItem('walletAddress', address);

    // Validar whitelist usando el hook
    await checkWhitelistStatus(address, provider);
  };

  const handleWalletDisconnect = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    setWeb3Provider(null);
    setAdminProvider(null);
    resetWhitelist();
    logoutAdmin(); // Cerrar sesión de admin
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletProviderId');
  };

  // Utilidad para abreviar la dirección
  const formatAddress = (addr) => {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  const handleVoteSubmitted = async () => {
    // Recargar las submissions para mostrar los resultados actualizados
    if (selectedBounty) {
      await fetchSubmissions(selectedBounty._id);
    }
  };

  const fetchSubmissions = async (bountyId) => {
    setLoadingSubmissions(true);
    try {
      const data = await bountiesAPI.getSubmissions(bountyId);
      setSubmissions(data.data || data);
    } catch {
      // Error handled silently - submissions will remain empty
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Cargar submissions cuando se selecciona una bounty en votación
  useEffect(() => {
    if (selectedBounty && selectedBounty.status === 'voting') {
      fetchSubmissions(selectedBounty._id);
    }
  }, [selectedBounty]);

  // ==================== FUNCIONES DE ADMIN ====================

  // Estado para editar bounty
  const [editingBounty, setEditingBounty] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [showAdminWalletsModal, setShowAdminWalletsModal] = useState(false);

  // Autenticar como admin
  const handleAdminAuth = async () => {
    if (!walletConnected) {
      showToast.error(t('admin.connect_wallet_first') || 'Conecta tu wallet primero');
      return;
    }
    // Si no hay provider (wallet restaurada sin conexión activa), pedir reconectar
    if (!adminProvider) {
      showToast.error(t('admin.reconnect_wallet') || 'Por favor, reconecta tu wallet para firmar');
      setIsWalletModalOpen(true);
      return;
    }
    const success = await authenticateAdmin();
    if (success) {
      showToast.success(t('admin.auth_success') || 'Autenticado como admin');
    } else {
      showToast.error(adminError || t('admin.auth_failed') || 'Error de autenticación');
    }
  };

  // Cambiar estado de bounty
  const handleStatusChange = async (bountyId, newStatus, e) => {
    if (e) e.stopPropagation();
    if (!isAdminAuthenticated) {
      showToast.error(t('admin.auth_required') || 'Debes autenticarte como admin');
      return;
    }

    setAdminActionLoading(true);
    try {
      await adminUpdateStatus(bountyId, newStatus);
      showToast.success(t('admin.status_updated') || 'Estado actualizado');
      fetchBounties(); // Recargar bounties
      if (selectedBounty?._id === bountyId) {
        closeBountyDetails();
      }
    } catch (err) {
      showToast.error(err.message || t('admin.status_error') || 'Error al cambiar estado');
    } finally {
      setAdminActionLoading(false);
    }
  };

  // Eliminar bounty
  const handleDeleteBounty = async (bountyId, e) => {
    if (e) e.stopPropagation();
    if (!isAdminAuthenticated) {
      showToast.error(t('admin.auth_required') || 'Debes autenticarte como admin');
      return;
    }

    if (!window.confirm(t('admin.confirm_delete') || '¿Estás seguro de eliminar este bounty?')) {
      return;
    }

    setAdminActionLoading(true);
    try {
      await adminDeleteBounty(bountyId);
      showToast.success(t('admin.bounty_deleted') || 'Bounty eliminado');
      fetchBounties();
      if (selectedBounty?._id === bountyId) {
        closeBountyDetails();
      }
    } catch (err) {
      showToast.error(err.message || t('admin.delete_error') || 'Error al eliminar');
    } finally {
      setAdminActionLoading(false);
    }
  };

  // Abrir modal de edición
  const handleEditBounty = (bounty, e) => {
    if (e) e.stopPropagation();
    if (!isAdminAuthenticated) {
      showToast.error(t('admin.auth_required') || 'Debes autenticarte como admin');
      return;
    }
    setEditingBounty(bounty);
    setEditFormData({
      title: bounty.title,
      description: bounty.description,
      reward: bounty.reward,
      endDate: bounty.endDate ? new Date(bounty.endDate).toISOString().split('T')[0] : '',
    });
  };

  // Guardar edición
  const handleSaveEdit = async () => {
    if (!editingBounty) return;

    setAdminActionLoading(true);
    try {
      await adminUpdateBounty(editingBounty._id, editFormData);
      showToast.success(t('admin.bounty_updated') || 'Bounty actualizado');
      setEditingBounty(null);
      fetchBounties();
    } catch (err) {
      showToast.error(err.message || t('admin.update_error') || 'Error al actualizar');
    } finally {
      setAdminActionLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      {/* Hero Section con gradiente */}
      <section className="relative overflow-hidden py-16 px-4">
        {/* Overlay gradiente ultravioleta */}
        <div className="absolute inset-0 bg-gradient-to-b from-ultraviolet-darker/20 via-background to-background" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="container mx-auto relative z-10">
          {/* Header con navegación y wallet */}
          <div className="flex justify-between items-center mb-12">
            <motion.button
              onClick={handleReturn}
              className="inline-flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-all duration-200 hover:translate-x-[-5px]"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>{t('success.back_home')}</span>
            </motion.button>

            {/* Botón de Wallet y Admin */}
            <div className="flex items-center gap-3">
              {/* Botón de Admin (solo si es admin) */}
              {walletConnected && isAdmin && (
                <div className="flex items-center gap-2">
                  {/* Botón de gestionar wallets (solo si autenticado y superadmin) */}
                  {isAdminAuthenticated && hasPermission('manage_admins') && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAdminWalletsModal(true)}
                      className="p-2 rounded-lg bg-amber-900/30 text-amber-400 border border-amber-500/30 hover:bg-amber-900/50 transition-all duration-200"
                      title={t('admin.manage_wallets') || 'Manage Admin Wallets'}
                    >
                      <UserGroupIcon className="w-5 h-5" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={isAdminAuthenticated ? logoutAdmin : handleAdminAuth}
                    disabled={adminAuthLoading}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200
                      ${isAdminAuthenticated
                        ? 'bg-amber-900/30 text-amber-400 border border-amber-500/30 hover:bg-amber-900/50'
                        : 'bg-purple-900/30 text-purple-400 border border-purple-500/30 hover:bg-purple-900/50'}`}
                  >
                    <ShieldCheckIcon className="w-5 h-5" />
                    {adminAuthLoading
                      ? '...'
                      : isAdminAuthenticated
                        ? t('admin.logout') || 'Admin ✓'
                        : t('admin.login') || 'Admin'}
                  </motion.button>
                </div>
              )}
              {!walletConnected ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWalletModalOpen(true)}
                className="px-6 py-3 bg-ultraviolet-darker text-text-primary rounded-lg font-semibold
                  hover:bg-ultraviolet-dark transition-colors duration-200
                  shadow-lg shadow-ultraviolet-darker/20"
              >
                {t('wallet.connect_button')}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200
                  ${isWalletHover
                    ? 'bg-red-600/80 text-white border border-red-500/50'
                    : 'bg-green-900/30 text-green-400 border border-green-500/30'}`}
                onMouseEnter={() => setIsWalletHover(true)}
                onMouseLeave={() => setIsWalletHover(false)}
                onClick={() => { if (isWalletHover) handleWalletDisconnect(); }}
              >
                {isWalletHover ? t('common.disconnect') : formatAddress(walletAddress)}
              </motion.button>
            )}
            </div>
          </div>

          {/* Título principal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto"
          >
            <GiftIcon className="w-16 h-16 text-white mx-auto mb-4 drop-shadow-[0_0_12px_rgba(106,0,255,0.6)]" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4
              [text-shadow:_2px_2px_12px_rgba(106,0,255,0.4)]">
              {t('navigation.bounties')}
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mb-6">
              {t('navigation.descriptions.bounties')}
            </p>

            {/* Aviso de responsabilidad del Bounty */}
            <div className="max-w-2xl mx-auto p-4 bg-amber-900/20 border border-amber-500/40 rounded-xl backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-amber-200 text-sm leading-relaxed">
                    {t('bountyCreation.responsibility_notice')}
                  </p>
                  <a
                    href="https://linktr.ee/UltravioletaDAO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {t('bountyCreation.contact_us')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal de WalletConnect */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background-lighter rounded-xl shadow-2xl p-8 border border-ultraviolet-darker/30 max-w-md w-full mx-4 relative"
          >
            <button
              onClick={() => setIsWalletModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-ultraviolet transition-colors"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
            <WalletConnect onWalletConnected={handleWalletConnected} />
          </motion.div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Botón para mostrar/ocultar panel de creación */}
          {(
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <button
                onClick={() => setShowCreatePanel(!showCreatePanel)}
                className="w-full p-4 rounded-xl bg-background-lighter border border-ultraviolet-darker/20
                  hover:border-ultraviolet-darker transition-all duration-300
                  hover:shadow-[0_0_15px_rgba(106,0,255,0.15)] group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <GiftIcon className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(106,0,255,0.5)]
                    group-hover:drop-shadow-[0_0_12px_rgba(106,0,255,0.8)] transition-all duration-300" />
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-text-primary">
                      {t('bountyForm.create_button') || 'Crear Bounty'}
                    </h2>
                    <p className="text-sm text-text-secondary">
                      {walletConnected && isWhitelisted
                        ? t('bountyCreation.access_granted')
                        : t('bountyCreation.connect_wallet_message')}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: showCreatePanel ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowLeftIcon className="w-5 h-5 text-text-secondary rotate-[-90deg]" />
                </motion.div>
              </button>

              {/* Panel expandible de creación */}
              {showCreatePanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-6 rounded-xl bg-background-lighter border border-ultraviolet-darker/20"
                >
                  {/* Estado: Wallet no conectada */}
                  {!walletConnected && (
                    <div className="text-center py-8">
                      <UserCircleIcon className="w-16 h-16 mx-auto text-text-secondary opacity-40 mb-4" />
                      <h3 className="text-xl font-semibold text-text-primary mb-2">
                        {t('voting.connect_wallet_to_vote')}
                      </h3>
                      <p className="text-text-secondary mb-6 max-w-md mx-auto">
                        {t('bountyCreation.connect_wallet_message')}
                      </p>
                      <div className="bg-ultraviolet-darker/10 rounded-lg p-4 mb-6 max-w-sm mx-auto border border-ultraviolet-darker/20">
                        <p className="text-sm text-text-secondary">
                          <span className="text-ultraviolet font-semibold">{t('bountyCreation.requirement_label')}:</span> 1,000,000 UVD
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsWalletModalOpen(true)}
                        className="px-8 py-3 bg-ultraviolet-darker text-text-primary rounded-lg font-semibold
                          hover:bg-ultraviolet-dark transition-colors duration-200
                          shadow-lg shadow-ultraviolet-darker/20"
                      >
                        {t('wallet.connect_button')}
                      </motion.button>
                    </div>
                  )}

                  {/* Estado: Verificando whitelist */}
                  {walletConnected && checkingWhitelist && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-2 border-ultraviolet-darker border-t-ultraviolet mx-auto mb-4"></div>
                      <p className="text-text-secondary">
                        {t('bountyCreation.checking_access')}
                      </p>
                    </div>
                  )}

                  {/* Estado: Wallet conectada pero NO en whitelist */}
                  {walletConnected && !checkingWhitelist && !isWhitelisted && (
                    <div className="text-center py-6">
                      <XCircleIcon className="w-14 h-14 mx-auto text-red-500/80 mb-4" />
                      <h3 className="text-xl font-semibold text-text-primary mb-2">
                        {whitelistDetails?.wrongNetwork
                          ? t('bountyCreation.wrong_network_title')
                          : t('bountyCreation.no_access_title')}
                      </h3>

                      {whitelistDetails?.wrongNetwork ? (
                        <div className="max-w-md mx-auto">
                          <p className="text-text-secondary mb-4">
                            {t('bountyCreation.wrong_network_message')}
                          </p>
                          <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-4 mb-4">
                            <p className="text-sm text-text-secondary mb-1">
                              <span className="text-red-400">{t('bountyCreation.current_network')}:</span> Chain ID {whitelistDetails.currentChainId}
                            </p>
                            <p className="text-sm text-text-secondary">
                              <span className="text-green-400">{t('bountyCreation.required_network')}:</span> Avalanche C-Chain (43114)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-text-secondary mb-4">
                            {t('bountyCreation.no_access_message')}
                          </p>
                          {whitelistDetails?.type === 'token' && (
                            <div className="bg-background rounded-lg p-4 max-w-sm mx-auto border border-ultraviolet-darker/10">
                              <p className="text-sm text-text-secondary mb-1">
                                <span className="font-medium">{t('bountyCreation.requirement_label')}:</span>{' '}
                                <span className="text-ultraviolet">{whitelistDetails.minRequired?.toLocaleString()} {whitelistDetails.tokenName || 'UVD'}</span>
                              </p>
                              <p className="text-sm text-text-secondary">
                                <span className="font-medium">{t('bountyCreation.your_balance')}:</span>{' '}
                                <span className="text-text-primary">{parseFloat(whitelistDetails.balance || 0).toLocaleString()} {whitelistDetails.tokenName || 'UVD'}</span>
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Estado: Wallet conectada Y en whitelist */}
                  {walletConnected && !checkingWhitelist && isWhitelisted && (
                    <>
                      <div className="mb-6 p-4 bg-green-900/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="text-green-400 font-medium text-sm">
                            {t('bountyCreation.access_granted')}
                          </p>
                          {whitelistDetails?.type === 'token' && (
                            <p className="text-xs text-text-secondary">
                              Balance: {parseFloat(whitelistDetails.balance).toLocaleString()} {whitelistDetails.tokenName}
                            </p>
                          )}
                        </div>
                      </div>

                      <BountyForm
                        onSubmit={handleCreateBounty}
                        loading={bountyFormLoading}
                        error={bountyFormError}
                      />
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Columnas de Bounties */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {columns.map((col, colIndex) => (
              <motion.div
                key={col.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * colIndex }}
                className="rounded-xl bg-background-lighter border border-ultraviolet-darker/20
                  hover:border-ultraviolet-darker/40 transition-all duration-300 overflow-hidden"
              >
                {/* Header de columna */}
                <div className="p-5 border-b border-ultraviolet-darker/10 bg-gradient-to-r from-ultraviolet-darker/5 to-transparent">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-ultraviolet-darker/20">
                      <col.Icon className="w-6 h-6 text-ultraviolet-light" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-text-primary">{col.title}</h2>
                        <span className="text-xs font-medium text-ultraviolet bg-ultraviolet-darker/30 px-2 py-0.5 rounded-full">
                          {getTasksByStatus(col.key).length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary">{col.description}</p>
                </div>

                {/* Lista de bounties */}
                <div className="p-4 space-y-3 max-h-[450px] overflow-y-auto">
                  {loadingBounties ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-ultraviolet-darker border-t-ultraviolet mx-auto mb-3"></div>
                      <p className="text-sm text-text-secondary">{t('bountyColumns.loading')}</p>
                    </div>
                  ) : fetchBountiesError ? (
                    <div className="text-center py-8 px-4">
                      <XCircleIcon className="w-10 h-10 text-red-500/60 mx-auto mb-2" />
                      <p className="text-sm text-red-400">{fetchBountiesError}</p>
                    </div>
                  ) : getTasksByStatus(col.key).length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-full bg-ultraviolet-darker/10 flex items-center justify-center mx-auto mb-3">
                        <col.Icon className="w-6 h-6 text-text-secondary/40" />
                      </div>
                      <p className="text-sm text-text-secondary/60">{t('bountyColumns.empty_message')}</p>
                    </div>
                  ) : (
                    getTasksByStatus(col.key).map((task, taskIndex) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 * taskIndex }}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-lg bg-background border border-ultraviolet-darker/10
                          hover:border-ultraviolet-darker/30 hover:shadow-[0_0_15px_rgba(106,0,255,0.08)]
                          transition-all duration-200 cursor-pointer group"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const data = await bountiesAPI.getById(task._id);
                            setSelectedBounty(data.data || data);
                          } catch {
                            // Error handled silently
                          }
                        }}
                      >
                        <h3 className="font-semibold text-text-primary text-sm mb-2 group-hover:text-ultraviolet-light transition-colors line-clamp-1">
                          {task.title}
                        </h3>
                        <p className="text-xs text-text-secondary mb-3 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-ultraviolet bg-ultraviolet-darker/20 px-2.5 py-1 rounded-md">
                            {task.reward}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-text-secondary/70">
                            {task.submissionsCount > 0 && (
                              <span className="flex items-center gap-1">
                                <UsersIcon className="w-3.5 h-3.5" />
                                {task.submissionsCount}
                              </span>
                            )}
                            {task.endDate && (
                              <span>{new Date(task.endDate).toLocaleDateString(i18n.language, { day: '2-digit', month: 'short' })}</span>
                            )}
                          </div>
                        </div>
                        {/* Link a Snapshot - diferente según el estado real */}
                        {task.status === 'voting' && !isVotingExpired(task) && (
                          <a
                            href={SNAPSHOT_VOTING_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium rounded-lg transition-all duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            {t('bountyDetails.vote_on_snapshot') || 'Votar en Snapshot'}
                          </a>
                        )}

                        {/* Controles de Admin */}
                        {isAdmin && isAdminAuthenticated && (
                          <div className="mt-3 pt-3 border-t border-ultraviolet-darker/20">
                            <div className="flex items-center gap-2">
                              {/* Selector de estado */}
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task._id, e.target.value, e)}
                                onClick={(e) => e.stopPropagation()}
                                disabled={adminActionLoading}
                                className="flex-1 text-xs bg-background border border-ultraviolet-darker/30 rounded px-2 py-1.5 text-text-primary focus:border-ultraviolet outline-none"
                              >
                                <option value="todo">📋 Todo</option>
                                <option value="voting">🗳️ Voting</option>
                                <option value="done">✅ Done</option>
                                <option value="cancelled">❌ Cancelled</option>
                              </select>
                              {/* Botón editar */}
                              <button
                                onClick={(e) => handleEditBounty(task, e)}
                                disabled={adminActionLoading}
                                className="p-1.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                                title={t('admin.edit') || 'Editar'}
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              {/* Botón eliminar */}
                              <button
                                onClick={(e) => handleDeleteBounty(task._id, e)}
                                disabled={adminActionLoading}
                                className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                                title={t('admin.delete') || 'Eliminar'}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Overlay y vista detallada del Bounty */}
          {selectedBounty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={handleCloseBountyDetails}
            >
              <motion.div
                initial={{ y: 30, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 30, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-background-lighter rounded-xl shadow-2xl border border-ultraviolet-darker/30 max-w-2xl w-full max-h-[90vh] overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del modal */}
                <div className="p-6 border-b border-ultraviolet-darker/10 bg-gradient-to-r from-ultraviolet-darker/10 to-transparent">
                  <button
                    onClick={handleCloseBountyDetails}
                    className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-ultraviolet-darker/20 transition-all"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                  <h2 className="text-2xl font-bold text-text-primary pr-10">{selectedBounty.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="text-sm font-medium text-ultraviolet bg-ultraviolet-darker/20 px-3 py-1 rounded-md">
                      {selectedBounty.reward}
                    </span>
                    {selectedBounty.endDate && (
                      <span className="text-xs text-text-secondary bg-background/50 px-3 py-1 rounded-md">
                        {t('bountyDetails.expires_label')}: {new Date(selectedBounty.endDate).toLocaleDateString(i18n.language, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {selectedBounty.status && (
                      <span className={`text-xs px-3 py-1 rounded-md capitalize ${
                        selectedBounty.status === 'voting' && isVotingExpired(selectedBounty)
                          ? 'text-green-400 bg-green-900/30 border border-green-500/20'
                          : selectedBounty.status === 'voting'
                            ? 'text-purple-400 bg-purple-900/30 border border-purple-500/20'
                            : selectedBounty.status === 'done'
                              ? 'text-green-400 bg-green-900/30 border border-green-500/20'
                              : 'text-text-secondary bg-background/50'
                      }`}>
                        {selectedBounty.status === 'voting' && isVotingExpired(selectedBounty)
                          ? t('bountyDetails.status_values.done')
                          : t(`bountyDetails.status_values.${selectedBounty.status}`)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenido scrolleable */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                  <LinkifyText
                    as="p"
                    className="text-text-secondary leading-relaxed whitespace-pre-wrap mb-6"
                  >
                    {selectedBounty.description}
                  </LinkifyText>

                  <SubmissionList bountyId={selectedBounty._id} />

                  {/* Mensaje cuando está en votación activa - submissions cerradas */}
                  {selectedBounty.status === 'voting' && !isVotingExpired(selectedBounty) && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-purple-300">
                            {t('bountyDetails.voting_in_progress')}
                          </h3>
                          <p className="text-sm text-purple-200/70">
                            {t('bountyDetails.submissions_closed')}
                          </p>
                        </div>
                      </div>
                      <a
                        href={SNAPSHOT_VOTING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all duration-200"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        {t('bountyDetails.vote_on_snapshot')}
                      </a>
                    </div>
                  )}

                  {/* Mensaje cuando la bounty está terminada (status done O votación expirada) */}
                  {(selectedBounty.status === 'finished' || selectedBounty.status === 'done' || (selectedBounty.status === 'voting' && isVotingExpired(selectedBounty))) && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-300">
                            {t('bountyDetails.bounty_finished')}
                          </h3>
                          <p className="text-sm text-green-200/70">
                            {t('bountyDetails.bounty_completed_message')}
                          </p>
                        </div>
                      </div>
                      <a
                        href={SNAPSHOT_VOTING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-lg transition-all duration-200"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        {t('bountyDetails.view_results_on_snapshot')}
                      </a>
                    </div>
                  )}

                  {/* Formulario de entrega */}
                  {selectedBounty.status === 'todo' && (
                    <div className="mt-6 p-5 bg-background rounded-xl border border-ultraviolet-darker/10">
                      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <GiftIcon className="w-5 h-5 text-ultraviolet" />
                        {t('bountyDetails.submit_task_title')}
                      </h3>
                      {!walletConnected ? (
                        <div className="text-center py-6">
                          <p className="text-sm text-text-secondary mb-4">
                            {t('bountyDetails.connect_wallet_to_submit') || 'Conecta tu wallet para entregar una tarea.'}
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsWalletModalOpen(true)}
                            className="px-6 py-2.5 bg-ultraviolet-darker text-text-primary rounded-lg font-medium
                              hover:bg-ultraviolet-dark transition-colors duration-200"
                          >
                            {t('wallet.connect_button')}
                          </motion.button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitSubmission} className="space-y-4">
                          <div>
                            <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                              {t('bountyDetails.submitter_name_label') || 'Entregado por'}
                            </label>
                            <div className="px-3 py-2 rounded-lg border border-ultraviolet-darker/10 bg-background-lighter text-sm text-text-primary font-mono truncate">
                              {ensName || formatAddress(walletAddress)}
                            </div>
                          </div>
                          <div>
                            <label htmlFor="submissionContent" className="block text-xs text-text-secondary mb-1.5 font-medium">
                              {t('bountyDetails.submission_content_label')}
                            </label>
                            <textarea
                              id="submissionContent"
                              className="w-full px-3 py-2.5 rounded-lg border border-ultraviolet-darker/20 bg-background
                                focus:border-ultraviolet-dark focus:ring-1 focus:ring-ultraviolet-darker outline-none
                                text-sm text-text-primary min-h-[100px] transition-colors resize-none"
                              value={submissionContent}
                              onChange={(e) => setSubmissionContent(e.target.value)}
                              placeholder={t('bountyDetails.submission_placeholder')}
                              required
                            />
                          </div>
                          {submissionError && (
                            <div className="text-red-400 text-sm bg-red-900/10 border border-red-500/20 p-3 rounded-lg">
                              {submissionError}
                            </div>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            className="w-full py-2.5 bg-ultraviolet-darker text-text-primary rounded-lg font-medium
                              hover:bg-ultraviolet-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submissionLoading}
                          >
                            {submissionLoading ? t('bountyDetails.submitting_button') : t('bountyDetails.submit_button')}
                          </motion.button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal de Edición de Bounty (Admin) */}
      {editingBounty && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setEditingBounty(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-background-lighter rounded-xl border border-ultraviolet-darker/30 w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-ultraviolet-darker/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <PencilIcon className="w-5 h-5 text-ultraviolet" />
                  {t('admin.edit_bounty') || 'Editar Bounty'}
                </h2>
                <button
                  onClick={() => setEditingBounty(null)}
                  className="p-2 rounded-lg hover:bg-background transition-colors"
                >
                  <XCircleIcon className="w-6 h-6 text-text-secondary" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  {t('bountyForm.title_label')}
                </label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  {t('bountyForm.description_label')}
                </label>
                <textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  {t('bountyForm.reward_label')}
                </label>
                <input
                  type="text"
                  value={editFormData.reward || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, reward: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  {t('bountyForm.endDate_label')}
                </label>
                <input
                  type="date"
                  value={editFormData.endDate || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary"
                />
              </div>
            </div>

            <div className="p-6 border-t border-ultraviolet-darker/20 flex justify-end gap-3">
              <button
                onClick={() => setEditingBounty(null)}
                className="px-4 py-2 rounded-lg border border-ultraviolet-darker/30 text-text-secondary hover:bg-background transition-colors"
              >
                {t('common.cancel') || 'Cancelar'}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={adminActionLoading}
                className="px-4 py-2 rounded-lg bg-ultraviolet text-white font-medium hover:bg-ultraviolet-dark transition-colors disabled:opacity-50"
              >
                {adminActionLoading ? '...' : t('common.save') || 'Guardar'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de Gestión de Wallets Admin */}
      <AdminWalletsModal
        isOpen={showAdminWalletsModal}
        onClose={() => setShowAdminWalletsModal(false)}
        getAdminWallets={getAdminWallets}
        addAdminWallet={addAdminWallet}
        deleteAdminWallet={deleteAdminWallet}
        hasPermission={hasPermission}
        showToast={showToast}
      />

      {/* Toast Container para notificaciones */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </motion.div>
  );
};

export default Bounties;