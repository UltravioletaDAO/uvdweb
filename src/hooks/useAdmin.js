import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';

const ADMIN_TOKEN_KEY = 'uvd_admin_token';
const ADMIN_DATA_KEY = 'uvd_admin_data';

/**
 * Hook para manejar la autenticación y funcionalidad de admin
 */
const useAdmin = (walletAddress, provider) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar si la wallet es admin
  const checkIsAdmin = useCallback(async (wallet) => {
    if (!wallet) {
      setIsAdmin(false);
      setLoading(false);
      return false;
    }

    try {
      const response = await adminAPI.isAdmin(wallet);
      setIsAdmin(response.isAdmin);
      return response.isAdmin;
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar si hay un token válido guardado
  const checkStoredAuth = useCallback(async () => {
    const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    const storedData = localStorage.getItem(ADMIN_DATA_KEY);

    if (!storedToken || !storedData) {
      setIsAuthenticated(false);
      return false;
    }

    try {
      const data = JSON.parse(storedData);

      // Verificar que la wallet del token coincida con la conectada
      if (walletAddress && data.wallet !== walletAddress.toLowerCase()) {
        // Wallet diferente, limpiar auth
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_DATA_KEY);
        setIsAuthenticated(false);
        setAdminData(null);
        return false;
      }

      // Verificar token con el backend
      await adminAPI.checkAuth(storedToken);
      setIsAuthenticated(true);
      setAdminData(data);
      return true;
    } catch (err) {
      // Token inválido o expirado
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_DATA_KEY);
      setIsAuthenticated(false);
      setAdminData(null);
      return false;
    }
  }, [walletAddress]);

  // Autenticarse como admin (firma de mensaje)
  const authenticate = useCallback(async () => {
    console.log('[useAdmin] authenticate called', { walletAddress, hasProvider: !!provider });

    if (!walletAddress || !provider) {
      console.error('[useAdmin] Missing wallet or provider', { walletAddress, provider });
      setError('Wallet no conectada');
      return false;
    }

    setAuthLoading(true);
    setError(null);

    try {
      // 1. Obtener nonce para firmar
      console.log('[useAdmin] Getting nonce...');
      const nonceResponse = await adminAPI.getNonce(walletAddress);
      const { message } = nonceResponse;
      console.log('[useAdmin] Got nonce, message length:', message?.length);

      // 2. Solicitar firma al usuario
      console.log('[useAdmin] Getting signer...');
      // Usar el provider que ya está conectado (no window.ethereum que puede ser otra wallet)
      const signer = await provider.getSigner(walletAddress);
      console.log('[useAdmin] Requesting signature...');
      const signature = await signer.signMessage(message);
      console.log('[useAdmin] Got signature');

      // 3. Verificar firma y obtener JWT
      console.log('[useAdmin] Verifying signature...');
      const verifyResponse = await adminAPI.verifySignature(walletAddress, signature, message);
      const { token, admin } = verifyResponse;
      console.log('[useAdmin] Verified, got token');

      // 4. Guardar token y datos
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(admin));

      setIsAuthenticated(true);
      setAdminData(admin);
      return true;
    } catch (err) {
      console.error('[useAdmin] Authentication error:', err);
      setError(err.message || 'Error de autenticación');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, [walletAddress, provider]);

  // Cerrar sesión de admin
  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_DATA_KEY);
    setIsAuthenticated(false);
    setAdminData(null);
  }, []);

  // Obtener token actual
  const getToken = useCallback(() => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }, []);

  // ==================== OPERACIONES DE ADMIN ====================

  // Actualizar bounty
  const updateBounty = useCallback(async (bountyId, data) => {
    const token = getToken();
    if (!token) {
      throw new Error('No autenticado como admin');
    }
    return adminAPI.updateBounty(bountyId, data, token);
  }, [getToken]);

  // Eliminar bounty
  const deleteBounty = useCallback(async (bountyId) => {
    const token = getToken();
    if (!token) {
      throw new Error('No autenticado como admin');
    }
    return adminAPI.deleteBounty(bountyId, token);
  }, [getToken]);

  // Cambiar estado de bounty
  const updateBountyStatus = useCallback(async (bountyId, status) => {
    const token = getToken();
    if (!token) {
      throw new Error('No autenticado como admin');
    }
    return adminAPI.updateBountyStatus(bountyId, status, token);
  }, [getToken]);

  // ==================== GESTIÓN DE WALLETS ADMIN ====================

  // Obtener lista de wallets admin
  const getAdminWallets = useCallback(async () => {
    const token = getToken();
    if (!token) {
      throw new Error('No autenticado como admin');
    }
    return adminAPI.getAdminWallets(token);
  }, [getToken]);

  // Agregar wallet admin
  const addAdminWallet = useCallback(async (walletData) => {
    const token = getToken();
    if (!token) {
      throw new Error('No autenticado como admin');
    }
    return adminAPI.addAdminWallet(walletData, token);
  }, [getToken]);

  // Actualizar wallet admin
  const updateAdminWallet = useCallback(async (walletId, data) => {
    const token = getToken();
    if (!token) {
      throw new Error('No autenticado como admin');
    }
    return adminAPI.updateAdminWallet(walletId, data, token);
  }, [getToken]);

  // Eliminar wallet admin
  const deleteAdminWallet = useCallback(async (walletId) => {
    const token = getToken();
    if (!token) {
      throw new Error('No autenticado como admin');
    }
    return adminAPI.deleteAdminWallet(walletId, token);
  }, [getToken]);

  // Verificar permisos
  const hasPermission = useCallback((permission) => {
    if (!adminData) return false;
    if (adminData.role === 'superadmin') return true;
    return adminData.permissions?.includes(permission) || false;
  }, [adminData]);

  // Efectos
  useEffect(() => {
    if (walletAddress) {
      checkIsAdmin(walletAddress);
      checkStoredAuth();
    } else {
      setIsAdmin(false);
      setIsAuthenticated(false);
      setAdminData(null);
      setLoading(false);
    }
  }, [walletAddress, checkIsAdmin, checkStoredAuth]);

  // Limpiar auth si cambia la wallet
  useEffect(() => {
    const storedData = localStorage.getItem(ADMIN_DATA_KEY);
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (walletAddress && data.wallet !== walletAddress.toLowerCase()) {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, [walletAddress, logout]);

  return {
    // Estado
    isAdmin,
    isAuthenticated,
    adminData,
    loading,
    authLoading,
    error,

    // Autenticación
    authenticate,
    logout,
    getToken,

    // Operaciones de bounties
    updateBounty,
    deleteBounty,
    updateBountyStatus,

    // Gestión de wallets admin
    getAdminWallets,
    addAdminWallet,
    updateAdminWallet,
    deleteAdminWallet,

    // Utilidades
    hasPermission,
    checkIsAdmin,
  };
};

export default useAdmin;
