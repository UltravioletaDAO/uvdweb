import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const AdminWalletsModal = ({
  isOpen,
  onClose,
  getAdminWallets,
  addAdminWallet,
  deleteAdminWallet,
  hasPermission,
  showToast,
}) => {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state for adding new wallet
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWallet, setNewWallet] = useState({
    wallet: '',
    name: '',
    role: 'admin',
  });

  // Load wallets on mount
  useEffect(() => {
    if (isOpen) {
      loadWallets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadWallets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminWallets();
      setWallets(response.data || response || []);
    } catch (err) {
      setError(err.message || t('admin.error_loading_wallets') || 'Error loading wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async (e) => {
    e.preventDefault();
    if (!newWallet.wallet.trim()) return;

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(newWallet.wallet.trim())) {
      showToast.error(t('admin.invalid_wallet_format') || 'Invalid wallet address format');
      return;
    }

    setActionLoading(true);
    try {
      await addAdminWallet({
        wallet: newWallet.wallet.trim().toLowerCase(),
        name: newWallet.name.trim() || undefined,
        role: newWallet.role,
      });
      showToast.success(t('admin.wallet_added') || 'Wallet added successfully');
      setNewWallet({ wallet: '', name: '', role: 'admin' });
      setShowAddForm(false);
      await loadWallets();
    } catch (err) {
      showToast.error(err.message || t('admin.error_adding_wallet') || 'Error adding wallet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWallet = async (walletId, walletAddress) => {
    if (!window.confirm(
      t('admin.confirm_delete_wallet', { wallet: walletAddress }) ||
      `Are you sure you want to remove ${walletAddress} as admin?`
    )) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteAdminWallet(walletId);
      showToast.success(t('admin.wallet_deleted') || 'Wallet removed successfully');
      await loadWallets();
    } catch (err) {
      showToast.error(err.message || t('admin.error_deleting_wallet') || 'Error removing wallet');
    } finally {
      setActionLoading(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background-lighter rounded-xl border border-ultraviolet-darker/30 w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-ultraviolet-darker/20 bg-gradient-to-r from-amber-900/10 to-transparent">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-amber-400" />
              {t('admin.manage_wallets') || 'Manage Admin Wallets'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-background transition-colors"
            >
              <XCircleIcon className="w-6 h-6 text-text-secondary" />
            </button>
          </div>
          <p className="text-sm text-text-secondary mt-2">
            {t('admin.manage_wallets_desc') || 'Add or remove wallets that can manage bounties'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-ultraviolet-darker border-t-ultraviolet mx-auto mb-3"></div>
              <p className="text-sm text-text-secondary">{t('common.loading') || 'Loading...'}</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircleIcon className="w-12 h-12 text-red-500/60 mx-auto mb-3" />
              <p className="text-red-400">{error}</p>
              <button
                onClick={loadWallets}
                className="mt-4 px-4 py-2 bg-ultraviolet-darker/30 hover:bg-ultraviolet-darker/50 rounded-lg text-text-primary transition-colors"
              >
                {t('common.retry') || 'Retry'}
              </button>
            </div>
          ) : (
            <>
              {/* Wallets List */}
              <div className="space-y-3 mb-6">
                {wallets.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary">
                    <UserCircleIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>{t('admin.no_wallets') || 'No admin wallets configured'}</p>
                  </div>
                ) : (
                  wallets.map((wallet) => (
                    <div
                      key={wallet._id || wallet.wallet}
                      className="flex items-center justify-between p-4 bg-background rounded-lg border border-ultraviolet-darker/10 hover:border-ultraviolet-darker/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          wallet.role === 'superadmin'
                            ? 'bg-amber-500/20'
                            : 'bg-purple-500/20'
                        }`}>
                          <ShieldCheckIcon className={`w-5 h-5 ${
                            wallet.role === 'superadmin'
                              ? 'text-amber-400'
                              : 'text-purple-400'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-text-primary">
                              {formatAddress(wallet.wallet)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              wallet.role === 'superadmin'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {wallet.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                            </span>
                            {wallet.isInitial && (
                              <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                                {t('admin.protected') || 'Protected'}
                              </span>
                            )}
                          </div>
                          {wallet.name && (
                            <p className="text-xs text-text-secondary mt-0.5">{wallet.name}</p>
                          )}
                        </div>
                      </div>

                      {/* Delete button - only if not initial/protected */}
                      {!wallet.isInitial && hasPermission('manage_admins') && (
                        <button
                          onClick={() => handleDeleteWallet(wallet._id, wallet.wallet)}
                          disabled={actionLoading}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
                          title={t('admin.remove_wallet') || 'Remove wallet'}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Wallet Form */}
              {hasPermission('manage_admins') && (
                <>
                  {!showAddForm ? (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="w-full p-4 rounded-lg border-2 border-dashed border-ultraviolet-darker/30 hover:border-ultraviolet-darker/60 text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      {t('admin.add_wallet') || 'Add Admin Wallet'}
                    </button>
                  ) : (
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleAddWallet}
                      className="p-4 bg-background rounded-lg border border-ultraviolet-darker/20 space-y-4"
                    >
                      <div>
                        <label className="block text-sm text-text-secondary mb-1">
                          {t('admin.wallet_address') || 'Wallet Address'} *
                        </label>
                        <input
                          type="text"
                          value={newWallet.wallet}
                          onChange={(e) => setNewWallet({ ...newWallet, wallet: e.target.value })}
                          placeholder="0x..."
                          className="w-full px-4 py-2 rounded-lg border border-ultraviolet-darker/20 bg-background-lighter focus:border-ultraviolet focus:ring-1 focus:ring-ultraviolet outline-none text-text-primary font-mono text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-text-secondary mb-1">
                          {t('admin.wallet_name') || 'Name (optional)'}
                        </label>
                        <input
                          type="text"
                          value={newWallet.name}
                          onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                          placeholder="e.g., John Doe"
                          className="w-full px-4 py-2 rounded-lg border border-ultraviolet-darker/20 bg-background-lighter focus:border-ultraviolet focus:ring-1 focus:ring-ultraviolet outline-none text-text-primary text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-text-secondary mb-1">
                          {t('admin.wallet_role') || 'Role'}
                        </label>
                        <select
                          value={newWallet.role}
                          onChange={(e) => setNewWallet({ ...newWallet, role: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-ultraviolet-darker/20 bg-background-lighter focus:border-ultraviolet outline-none text-text-primary text-sm"
                        >
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddForm(false);
                            setNewWallet({ wallet: '', name: '', role: 'admin' });
                          }}
                          className="flex-1 px-4 py-2 rounded-lg border border-ultraviolet-darker/30 text-text-secondary hover:bg-background-lighter transition-colors"
                        >
                          {t('common.cancel') || 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="flex-1 px-4 py-2 rounded-lg bg-ultraviolet text-white font-medium hover:bg-ultraviolet-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {actionLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                          ) : (
                            <>
                              <PlusIcon className="w-4 h-4" />
                              {t('admin.add') || 'Add'}
                            </>
                          )}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminWalletsModal;
