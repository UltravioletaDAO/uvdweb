import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const AdminLoginModal = ({ isOpen, onClose, onLogin, loading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ username, password });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Centered Wrapper */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm bg-background-lighter rounded-xl shadow-2xl p-8 border border-ultraviolet/20 pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <LockClosedIcon className="w-6 h-6 text-ultraviolet" />
                  <h2 className="text-xl font-bold text-text-primary">Acceso administrador</h2>
                </div>
                <button onClick={onClose} className="text-text-secondary hover:text-ultraviolet transition-colors">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Usuario</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Contraseña</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 rounded-lg border border-ultraviolet/20 bg-background focus:border-ultraviolet focus:ring-2 focus:ring-ultraviolet outline-none text-text-primary"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="text-error text-sm bg-error/10 p-2 rounded">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-2 bg-ultraviolet text-white rounded-lg font-semibold hover:bg-ultraviolet-dark transition-colors disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Accediendo...' : 'Acceder'}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminLoginModal; 