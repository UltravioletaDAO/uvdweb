import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, GiftIcon, UsersIcon, BoltIcon, UserCircleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import BountyForm from '../components/BountyForm';
import SubmissionList from '../components/SubmissionList';
import WalletConnect from '../components/WalletConnect';
import { parseISO } from 'date-fns';
import { ethers } from 'ethers';
import { validateWhitelist, WHITELIST_CONFIG } from '../utils/tokenValidation';
import { bountiesAPI, legacyAPI } from '../services/api';

const initialTasks = [];

const columns = [
  {
    key: 'todo',
    title: 'Por hacer',
    icon: <UsersIcon className="w-10 h-10 mx-auto text-ultraviolet mb-2" />,
    description: 'Bounties listas para ser tomadas por los colaboradores',
  },
  {
    key: 'in_voting',
    title: 'En votación',
    icon: <BoltIcon className="w-10 h-10 mx-auto text-ultraviolet mb-2" />,
    description: 'Bounties que están en progreso o bajo revisión',
  },
  {
    key: 'finished',
    title: 'Terminadas',
    icon: <GiftIcon className="w-10 h-10 mx-auto text-ultraviolet mb-2" />,
    description: 'Bounties completadas con recompensas distribuidas',
  },
];

const Bounties = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false); // Solo para admins reales con acceso especial
  const [bountyFormLoading, setBountyFormLoading] = useState(false);
  const [bountyFormError, setBountyFormError] = useState('');
  const [loadingBounties, setLoadingBounties] = useState(true);
  const [fetchBountiesError, setFetchBountiesError] = useState(null);
  const [selectedBounty, setSelectedBounty] = useState(null);

  // Estados para el formulario de entrega de tarea
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submitterName, setSubmitterName] = useState(''); // Nuevo estado para el nombre del remitente

  // Estados para Web3 y votación
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isWalletHover, setIsWalletHover] = useState(false);
  const [ensName, setEnsName] = useState(null);
  
  // Estados para whitelist de tokens
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [whitelistDetails, setWhitelistDetails] = useState(null);
  const [checkingWhitelist, setCheckingWhitelist] = useState(false);
  const [web3Provider, setWeb3Provider] = useState(null);

  // Al montar, intenta restaurar la wallet desde localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('walletAddress');
    if (savedWallet) {
      setWalletConnected(true);
      setWalletAddress(savedWallet);
    }
  }, []);

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

  // Verificar si hay admin token guardado (solo para admins especiales)
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      // Verificar si el token es válido y es admin
      legacyAPI.auth.verify(adminToken)
        .then(data => {
          if (data.user && data.user.role === 'admin') {
            setIsCurrentUserAdmin(true);
          }
        })
        .catch(() => {
          localStorage.removeItem('adminToken');
        });
    }
  }, []);

  const handleReturn = () => {
    navigate('/', { replace: true });
  };

  // Función para cerrar la vista detallada del bounty
  const handleCloseBountyDetails = () => {
    setSelectedBounty(null);
    setSubmissionContent(''); // Limpia el formulario al cerrar
    setSubmissionError(''); // Limpia errores
    setSubmitterName(''); // Limpia el nombre del remitente
  };

  // Agrupar tareas por columna
  const getTasksByStatus = (status) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Para comparar solo fechas

    if (status === 'todo') {
      // Una bounty está 'Por hacer' si su estado es 'todo' y su fecha de expiración es en el futuro
      // (Ahora no importa si tiene entregas, solo su estado de backend y fecha)
      return tasks.filter((task) => 
        task.status === 'todo' &&
        (task.endDate ? parseISO(task.endDate) >= now : true) 
      );
    } else if (status === 'in_voting') {
      // Una bounty está 'En votación' si tiene entregas Y NO está en estado 'done'
      return tasks.filter((task) => 
        task.submissionsCount > 0 && 
        task.status !== 'done'
      );
    } else if (status === 'finished') {
      // Una bounty está 'Terminada' si su estado es 'done'
      return tasks.filter((task) => task.status === 'done');
    }
    return [];
  };

  // Función para cargar bounties desde el backend AWS Lambda
  const fetchBounties = async () => {
    setLoadingBounties(true);
    setFetchBountiesError(null);
    try {
      const data = await bountiesAPI.getAll();
      setTasks(data.data || data); // Compatible con diferentes estructuras de respuesta
    } catch (err) {
      console.error('Error fetching bounties:', err);
      setFetchBountiesError(err.message);
    } finally {
      setLoadingBounties(false);
    }
  };

  // Cargar bounties al montar el componente
  useEffect(() => {
    fetchBounties();
  }, []); // Se ejecuta solo una vez al montar

  // Nuevo useEffect para asegurar que selectedBounty se actualice cuando cambian las tasks
  useEffect(() => {
    if (selectedBounty) {
      const updatedBounty = tasks.find(task => task._id === selectedBounty._id);
      if (updatedBounty) {
        setSelectedBounty(updatedBounty);
      } else {
        // Si la bounty seleccionada ya no existe en la lista (ej. fue eliminada), cierra la vista detallada
        setSelectedBounty(null);
      }
    }
  }, [tasks, selectedBounty]); // Depende de tasks y selectedBounty para re-sincronizar


  const handleCreateBounty = async (bountyData) => {
    setBountyFormLoading(true);
    setBountyFormError('');
    try {
      if (!walletConnected || !walletAddress) {
        throw new Error('Debes conectar tu wallet para crear una bounty');
      }
      
      if (!isWhitelisted) {
        throw new Error('No tienes suficientes tokens UVD para crear bounties');
      }

      // Agregar la wallet del creador a los datos de la bounty
      const bountyDataWithWallet = {
        ...bountyData,
        createdBy: walletAddress,
        creatorWallet: walletAddress
      };

      const data = await bountiesAPI.create(bountyDataWithWallet);
      
      alert(t('bountyForm.success_message', { title: bountyData.title }));
      fetchBounties();

    } catch (err) {
      setBountyFormError(err.message);
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
      
      alert(t('bountyDetails.submission_success_message'));
      setSubmissionContent('');
      fetchBounties();
    } catch (err) {
      setSubmissionError(err.message);
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Funciones para Web3 y votación
  const handleWalletConnected = async (address, chainId, provider) => {
    setWalletConnected(true);
    setWalletAddress(address);
    setWeb3Provider(provider);
    setIsWalletModalOpen(false); // Cierra el modal al conectar
    localStorage.setItem('walletAddress', address); // Guarda en localStorage
    
    // Validar whitelist basada en token
    await checkWhitelistStatus(address, provider);
  };
  
  // Función para verificar si el usuario está en la whitelist
  const checkWhitelistStatus = async (address, provider) => {
    setCheckingWhitelist(true);
    try {
      const result = await validateWhitelist(address, provider);
      setIsWhitelisted(result.isWhitelisted);
      setWhitelistDetails(result.details);
      
      if (result.details.balance) {
        setTokenBalance(parseFloat(result.details.balance));
      }
    } catch (error) {
      console.error('Error checking whitelist:', error);
      setIsWhitelisted(false);
      setWhitelistDetails({ error: error.message });
    } finally {
      setCheckingWhitelist(false);
    }
  };

  const handleWalletDisconnect = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    setTokenBalance(0);
    setWeb3Provider(null);
    setIsWhitelisted(false);
    setWhitelistDetails(null);
    localStorage.removeItem('walletAddress');
  };

  // Utilidad para abreviar la dirección
  const formatAddress = (addr) => {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  const handleVoteSubmitted = async (voteData) => {
    try {
      // Aquí iría la lógica para guardar el voto en el backend
      console.log('Voto enviado:', voteData);
      
      // Recargar las submissions para mostrar los resultados actualizados
      if (selectedBounty) {
        await fetchSubmissions(selectedBounty._id);
      }
    } catch (error) {
      console.error('Error al procesar el voto:', error);
    }
  };

  const fetchSubmissions = async (bountyId) => {
    setLoadingSubmissions(true);
    try {
      const data = await bountiesAPI.getSubmissions(bountyId);
      setSubmissions(data.data || data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Cargar submissions cuando se selecciona una bounty en votación
  useEffect(() => {
    if (selectedBounty && selectedBounty.status === 'in_review') {
      fetchSubmissions(selectedBounty._id);
    }
  }, [selectedBounty]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background py-16 px-4"
    >
      <div className="container mx-auto relative">
        {/* Botón de Wallet - Único método de acceso */}
        <div className="absolute top-0 right-0 mt-4 mr-4 z-20 flex flex-col items-end gap-4">
          <div className="flex flex-row items-center gap-3">
            {/* Botón de Wallet - Acceso principal */}
            {!walletConnected ? (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="px-6 py-3 bg-ultraviolet text-white rounded-lg font-semibold shadow-lg hover:bg-ultraviolet-dark transition-all hover:scale-105"
              >
                🔐 Conectar Wallet
              </button>
            ) : (
              <button
                className={`px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2 transition-colors
                  ${isWalletHover ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
                onMouseEnter={() => setIsWalletHover(true)}
                onMouseLeave={() => setIsWalletHover(false)}
                onClick={() => { if (isWalletHover) handleWalletDisconnect(); }}
              >
                {isWalletHover ? '❌ Desconectar' : `✅ ${formatAddress(walletAddress)}`}
              </button>
            )}
          </div>
        </div>

        {/* Modal de WalletConnect */}
        {isWalletModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-background-lighter rounded-xl shadow-2xl p-8 border border-ultraviolet/20 max-w-md w-full relative">
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-ultraviolet transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <WalletConnect onWalletConnected={handleWalletConnected} />
            </div>
          </div>
        )}

        <motion.button
          onClick={handleReturn}
          className="inline-flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-all duration-200 mb-8 hover:translate-x-[-5px]"
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>{t('success.back_home')}</span>
        </motion.button>

        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-4">
            <GiftIcon className="w-12 h-12 text-ultraviolet" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-2 text-center">
            {t('navigation.bounties')}
          </h1>
          <p className="text-text-secondary text-lg mb-8 text-center">
            {t('navigation.descriptions.bounties')}
          </p>

          {/* Panel de administración solo para admins */}
          {isCurrentUserAdmin && (
            <div className="mb-8 p-6 bg-background-lighter border border-ultraviolet/10 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-ultraviolet mb-4">{t('adminPanel.title')}</h2>
              <p className="text-text-secondary mb-6">{t('adminPanel.description')}</p>
              <BountyForm 
                onSubmit={handleCreateBounty}
                loading={bountyFormLoading}
                error={bountyFormError}
              />
            </div>
          )}

          {/* Panel de creación de bounties - Acceso solo con wallet y UVD */}
          {!isCurrentUserAdmin && (
            <div className="mb-8 p-6 bg-background-lighter border border-ultraviolet/10 rounded-xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <GiftIcon className="w-8 h-8 text-ultraviolet" />
                <h2 className="text-2xl font-bold text-ultraviolet">
                  Crear Ultra Bountie
                </h2>
              </div>
              
              {/* Estado: Wallet no conectada */}
              {!walletConnected && (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <UserCircleIcon className="w-16 h-16 mx-auto text-text-secondary opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    Conecta tu Wallet para Crear Bounties
                  </h3>
                  <p className="text-text-secondary mb-4">
                    {t('bountyCreation.connect_wallet_message') || 'Necesitas conectar tu wallet y tener al menos 1,000,000 UVD para crear bounties'}
                  </p>
                  <div className="bg-ultraviolet/10 rounded-lg p-4 mb-6 max-w-md mx-auto">
                    <p className="text-sm text-text-secondary">
                      <strong className="text-ultraviolet">Requisito:</strong> 1,000,000 UVD
                    </p>
                    <p className="text-xs text-text-secondary mt-2">
                      Token: UltraVioleta DAO (UVD)
                    </p>
                  </div>
                  <button
                    onClick={() => setIsWalletModalOpen(true)}
                    className="px-8 py-4 bg-ultraviolet text-white rounded-lg font-bold shadow-lg hover:bg-ultraviolet-dark transition-all hover:scale-105"
                  >
                    🔐 Conectar Wallet
                  </button>
                </div>
              )}

              {/* Estado: Verificando whitelist */}
              {walletConnected && checkingWhitelist && (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ultraviolet mx-auto"></div>
                  </div>
                  <p className="text-text-secondary">
                    {t('bountyCreation.checking_access') || 'Verificando permisos de acceso...'}
                  </p>
                </div>
              )}

              {/* Estado: Wallet conectada pero NO en whitelist */}
              {walletConnected && !checkingWhitelist && !isWhitelisted && (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <XCircleIcon className="w-16 h-16 mx-auto text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    {whitelistDetails?.wrongNetwork ? 
                      '❌ Red Incorrecta' : 
                      (t('bountyCreation.no_access_title') || 'Acceso Restringido')
                    }
                  </h3>
                  
                  {whitelistDetails?.wrongNetwork ? (
                    <div className="max-w-md mx-auto">
                      <p className="text-text-secondary mb-4">
                        Tu wallet está conectada a una red incorrecta.
                      </p>
                      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                        <p className="text-sm text-text-secondary mb-2">
                          <strong className="text-red-400">Red Actual:</strong> Chain ID {whitelistDetails.currentChainId}
                        </p>
                        <p className="text-sm text-text-secondary">
                          <strong className="text-green-400">Red Requerida:</strong> Avalanche C-Chain (Chain ID 43114)
                        </p>
                      </div>
                      <div className="bg-background rounded-lg p-4">
                        <p className="text-sm text-text-secondary mb-3">
                          <strong>¿Cómo cambiar a Avalanche?</strong>
                        </p>
                        <ol className="text-left text-sm text-text-secondary space-y-2 list-decimal list-inside">
                          <li>Abre tu wallet (MetaMask, Rabby, etc.)</li>
                          <li>Haz clic en el selector de red</li>
                          <li>Selecciona "Avalanche C-Chain"</li>
                          <li>Si no aparece, agrégala manualmente con Chain ID: 43114</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-text-secondary mb-4">
                        {t('bountyCreation.no_access_message') || 'Tu wallet no cumple con los requisitos para crear bounties.'}
                      </p>
                      
                      {whitelistDetails && whitelistDetails.type === 'token' && (
                        <div className="bg-background rounded-lg p-4 max-w-md mx-auto">
                          <p className="text-sm text-text-secondary mb-2">
                            <strong>Requisito:</strong> Poseer al menos{' '}
                            <span className="text-ultraviolet font-bold">
                              {whitelistDetails.minRequired?.toLocaleString()} {whitelistDetails.tokenName || WHITELIST_CONFIG.GOVERNANCE_TOKEN.symbol}
                            </span>
                          </p>
                          <p className="text-sm text-text-secondary">
                            <strong>Tu balance:</strong>{' '}
                            <span className="text-text-primary">
                              {parseFloat(whitelistDetails.balance || 0).toLocaleString()} {whitelistDetails.tokenName || WHITELIST_CONFIG.GOVERNANCE_TOKEN.symbol}
                            </span>
                          </p>
                          {whitelistDetails.chainId && (
                            <p className="text-xs text-text-secondary mt-2">
                              Red: {whitelistDetails.networkName || 'Avalanche'} (Chain ID: {whitelistDetails.chainId})
                            </p>
                          )}
                        </div>
                      )}

                      {whitelistDetails && whitelistDetails.type === 'nft' && (
                        <div className="bg-background rounded-lg p-4 max-w-md mx-auto">
                          <p className="text-sm text-text-secondary mb-2">
                            <strong>Requisito:</strong> Poseer al menos 1{' '}
                            <span className="text-ultraviolet font-bold">
                              {whitelistDetails.nftName || WHITELIST_CONFIG.MEMBERSHIP_NFT.name}
                            </span>
                          </p>
                          <p className="text-sm text-text-secondary">
                            <strong>Tu balance:</strong>{' '}
                            <span className="text-text-primary">{whitelistDetails.balance} NFTs</span>
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {whitelistDetails?.error && !whitelistDetails?.wrongNetwork && (
                    <p className="text-xs text-red-400 mt-4">
                      Error: {whitelistDetails.error}
                    </p>
                  )}
                </div>
              )}

              {/* Estado: Wallet conectada Y en whitelist - Mostrar formulario */}
              {walletConnected && !checkingWhitelist && isWhitelisted && (
                <>
                  <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-center gap-3">
                    <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-green-400 font-semibold">
                        {t('bountyCreation.access_granted') || '¡Acceso Verificado!'}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {whitelistDetails?.type === 'token' && (
                          <>Balance: {whitelistDetails.balance} {whitelistDetails.tokenName}</>
                        )}
                        {whitelistDetails?.type === 'nft' && (
                          <>Posees {whitelistDetails.balance} NFTs de {whitelistDetails.nftName}</>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <BountyForm 
                    onSubmit={handleCreateBounty}
                    loading={bountyFormLoading}
                    error={bountyFormError}
                  />
                </>
              )}
            </div>
          )}

          <div className="overflow-x-auto pb-6">
            <div className="flex flex-row gap-8 min-w-[900px] mx-auto">
              {columns.map((col) => (
                <div key={col.key} className="bg-background-lighter rounded-xl p-4 shadow-lg border border-ultraviolet-darker/10 flex flex-col min-w-[320px] max-w-[340px] w-full h-[500px] mx-2">
                  <div className="mb-4 text-center">
                    {col.icon}
                    <h2 className="text-xl font-semibold text-text-primary mb-1">{col.title} <span className="text-xs text-text-secondary">{getTasksByStatus(col.key).length}</span></h2>
                    <p className="text-sm text-text-secondary">{col.description}</p>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {loadingBounties ? (
                      <div className="text-center text-text-secondary opacity-60 py-8">
                        Cargando bounties...
                      </div>
                    ) : fetchBountiesError ? (
                      <div className="text-center text-error text-sm bg-error/10 p-2 rounded">
                        {fetchBountiesError}
                      </div>
                    ) : getTasksByStatus(col.key).length === 0 ? (
                      <div className="text-center text-text-secondary opacity-60 py-8">
                        {t('bountyColumns.empty_message')}
                      </div>
                    ) : (
                      getTasksByStatus(col.key).map((task) => (
                        <motion.div
                          key={task._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-background rounded-lg p-4 border border-ultraviolet/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const data = await bountiesAPI.getById(task._id);
                              setSelectedBounty(data.data || data);
                            } catch (err) {
                              alert('Error al cargar la bounty: ' + err.message);
                            }
                          }}
                        >
                          <h3 className="font-bold text-text-primary text-base mb-1">{task.title}</h3>
                          <p className="text-sm text-text-secondary mb-2 line-clamp-3">{task.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-ultraviolet font-semibold bg-ultraviolet/10 px-2 py-1 rounded">
                              {task.reward}
                            </span>
                            {task.endDate && (
                              <span className="text-xs text-text-secondary/80">
                                Exp: {new Date(task.endDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {/* Mostrar número de entregas si las hay */}
                          {task.submissionsCount > 0 && (
                            <div className="mt-2 text-xs text-text-secondary">
                              {task.submissionsCount} {t('bountyDetails.submissions_count')}
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overlay y vista detallada del Bounty */}
          {selectedBounty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={handleCloseBountyDetails}
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-background-lighter rounded-xl shadow-2xl p-8 border border-ultraviolet/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleCloseBountyDetails}
                  className="absolute top-4 right-4 text-text-secondary hover:text-ultraviolet transition-colors"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold text-text-primary mb-4">{selectedBounty.title}</h2>
                <p className="text-text-secondary text-lg mb-6 leading-relaxed whitespace-pre-wrap">{selectedBounty.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <span className="text-sm text-ultraviolet font-semibold bg-ultraviolet/10 px-3 py-1.5 rounded-full">
                    {t('bountyDetails.reward_label')}: {selectedBounty.reward}
                  </span>
                  {selectedBounty.endDate && (
                    <span className="text-sm text-text-secondary/80 font-medium bg-background/50 px-3 py-1.5 rounded-full">
                      {t('bountyDetails.expires_label')}: {new Date(selectedBounty.endDate).toLocaleDateString()}
                    </span>
                  )}
                  {selectedBounty.status && (
                    <span className="text-sm text-text-secondary/80 font-medium bg-background/50 px-3 py-1.5 rounded-full capitalize">
                      {t('bountyDetails.status_label')}: {t(`bountyDetails.status_values.${selectedBounty.status}`)}
                    </span>
                  )}
                  {selectedBounty.priority && (
                    <span className="text-sm text-text-secondary/80 font-medium bg-background/50 px-3 py-1.5 rounded-full capitalize">
                      {t('bountyDetails.priority_label')}: {t(`bountyDetails.priority_values.${selectedBounty.priority}`)}
                    </span>
                  )}
                </div>
                <SubmissionList bountyId={selectedBounty._id} />
                {selectedBounty && selectedBounty.status === 'todo' && (
                  <div className="mt-8 p-6 bg-background-lighter border border-ultraviolet/10 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-ultraviolet mb-4">{t('bountyDetails.submit_task_title')}</h3>
                    {!walletConnected ? (
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-text-secondary mb-2 text-center">{t('bountyDetails.connect_wallet_to_submit') || 'Conecta tu wallet para poder entregar una tarea.'}</p>
                        <button
                          onClick={() => setIsWalletModalOpen(true)}
                          className="px-4 py-2 bg-ultraviolet text-white rounded-lg font-semibold shadow hover:bg-ultraviolet-dark transition-colors"
                        >
                          Conectar Wallet
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitSubmission} className="space-y-4">
                        <div>
                          <label className="block text-sm text-text-secondary mb-1">{t('bountyDetails.submitter_name_label') || 'Entregado por'}</label>
                          <div className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background text-text-primary select-all break-all">
                            {ensName || walletAddress}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="submissionContent" className="block text-sm text-text-secondary mb-1">{t('bountyDetails.submission_content_label')}</label>
                          <textarea
                            id="submissionContent"
                            className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary min-h-[80px]"
                            value={submissionContent}
                            onChange={(e) => setSubmissionContent(e.target.value)}
                            placeholder={t('bountyDetails.submission_placeholder')}
                            required
                          />
                        </div>
                        {submissionError && <div className="text-error text-sm bg-error/10 p-2 rounded">{submissionError}</div>}
                        <button
                          type="submit"
                          className="w-full py-2 bg-ultraviolet text-white rounded-lg font-semibold hover:bg-ultraviolet-dark transition-colors disabled:opacity-60"
                          disabled={submissionLoading}
                        >
                          {submissionLoading ? t('bountyDetails.submitting_button') : t('bountyDetails.submit_button')}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Bounties;