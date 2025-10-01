import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, GiftIcon, UsersIcon, BoltIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import AdminLoginModal from '../components/AdminLoginModal';
import BountyForm from '../components/BountyForm';
import SubmissionList from '../components/SubmissionList';
import WalletConnect from '../components/WalletConnect';
import { parseISO } from 'date-fns';
import { ethers } from 'ethers';

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
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
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

  // Al cargar la app, recuperar el token de localStorage:
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setAuthToken(savedToken);
      setIsLoggedIn(true);
      // Opcional: podrías verificar el rol con una petición al backend
      setIsCurrentUserAdmin(true); // O verifica con /auth/verify si quieres más seguridad
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

  // Función para cargar bounties desde el backend
  const fetchBounties = async () => {
    setLoadingBounties(true);
    setFetchBountiesError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/bounties`);
      if (!response.ok) {
        throw new Error('Error al cargar las bounties');
      }
      const data = await response.json();
      setTasks(data.data); // Asume que la respuesta tiene un campo data.data
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

  const handleAdminLogin = async ({ username, password }) => {
    setAdminLoading(true);
    setAdminError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error de autenticación');

      // No verificar rol aquí, cualquier login válido es suficiente para isLoggedIn
      setIsLoggedIn(true);
      setAuthToken(data.token);
      localStorage.setItem('authToken', data.token);
      setIsCurrentUserAdmin(data.user.role === 'admin'); // Establece si el usuario actual es admin
      setIsAdminModalOpen(false);
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthToken(null);
    setIsCurrentUserAdmin(false);
    localStorage.removeItem('authToken');
  };

  const handleCreateBounty = async (bountyData) => {
    setBountyFormLoading(true);
    setBountyFormError('');
    try {
      if (!authToken) { // Asegúrate de que hay un token de autenticación
        throw new Error(t('adminPanel.error_not_logged_in'));
      }
      const response = await fetch(`${process.env.REACT_APP_API_URL}/bounties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` // Envía el token de cualquier usuario logueado
        },
        body: JSON.stringify(bountyData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('bountyForm.error_creating_bounty')); // Nueva clave de traducción
      }

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
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bounties/${selectedBounty._id}/submissions`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ submissionContent, submissionType: 'url', submitterName: walletAddress })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('bountyDetails.error_submitting_task'));
      }
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
  const handleWalletConnected = (address, chainId) => {
    setWalletConnected(true);
    setWalletAddress(address);
    setTokenBalance(100); // Valor de ejemplo
    setIsWalletModalOpen(false); // Cierra el modal al conectar
    localStorage.setItem('walletAddress', address); // Guarda en localStorage
  };

  const handleWalletDisconnect = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    setTokenBalance(0);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bounties/${bountyId}/submissions`);
      if (!response.ok) {
        throw new Error('Error al cargar las entregas');
      }
      const data = await response.json();
      setSubmissions(data.data);
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
        {/* Botón de acceso admin / Login / Logout */}
        <div className="absolute top-0 right-0 mt-4 mr-4 z-20 flex flex-col items-end gap-4">
          <div className="flex flex-row items-center gap-3">
            {/* Botón de acceso admin / Login / Logout */}
            {!isLoggedIn ? (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="px-4 py-2 bg-ultraviolet text-white rounded-lg font-semibold shadow hover:bg-ultraviolet-dark transition-colors"
              >
                {t('auth.access_button')}
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" /> {t('auth.logout_button')}
              </button>
            )}
            <AdminLoginModal
              isOpen={isAdminModalOpen}
              onClose={() => setIsAdminModalOpen(false)}
              onLogin={handleAdminLogin}
              loading={adminLoading}
              error={adminError}
            />
            {/* Botón de Wallet compacto con hover para desconectar */}
            {!walletConnected ? (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="px-4 py-2 bg-ultraviolet text-white rounded-lg font-semibold shadow hover:bg-ultraviolet-dark transition-colors"
              >
                Conectar Wallet
              </button>
            ) : (
              <button
                className={`px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2 transition-colors
                  ${isWalletHover ? 'bg-red-600 text-white' : 'bg-ultraviolet text-white'}`}
                onMouseEnter={() => setIsWalletHover(true)}
                onMouseLeave={() => setIsWalletHover(false)}
                onClick={() => { if (isWalletHover) handleWalletDisconnect(); }}
              >
                {isWalletHover ? 'Desconectar' : formatAddress(walletAddress || 'F3l1p2')}
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
                              const response = await fetch(`${process.env.REACT_APP_API_URL}/bounties/${task._id}`);
                              if (!response.ok) throw new Error('Error al cargar la bounty');
                              const data = await response.json();
                              setSelectedBounty(data.data);
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