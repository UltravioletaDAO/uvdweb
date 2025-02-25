import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const SuccessMessage = ({ onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleReturn = () => {
    // Primero cerramos el modal
    onClose();
    // Luego navegamos a la página principal
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-background-lighter rounded-2xl shadow-2xl 
          shadow-black/50 border border-ultraviolet-darker/20 overflow-hidden"
      >
        {/* Encabezado con gradiente */}
        <div className="bg-gradient-to-r from-ultraviolet-darker to-ultraviolet-dark 
          p-8 flex justify-center items-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.2, 
              type: "spring", 
              stiffness: 200 
            }}
          >
            <CheckCircleIcon className="h-20 w-20 text-text-primary" />
          </motion.div>
        </div>

        {/* Contenido */}
        <div className="p-8 space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-text-primary text-center
              [text-shadow:_0_0_10px_rgba(106,0,255,0.2)]"
          >
            {t('success.title')}
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 text-center"
          >
            <p className="text-text-primary text-lg">
              {t('success.message')}
            </p>
            <p className="text-text-secondary">
              {t('success.waitlist')}
            </p>
            <p className="text-ultraviolet font-medium">
              {t('success.thanks')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4 pt-4"
          >
            <Link
              to="/"
              className="px-8 py-3 bg-ultraviolet-darker text-text-primary rounded-lg
                hover:bg-ultraviolet-dark transition-all duration-200
                shadow-lg shadow-ultraviolet-darker/20"
            >
              {t('success.back_home')}
            </Link>
            <Link
              to="/status"
              className="text-ultraviolet hover:text-ultraviolet-light transition-colors duration-200"
            >
              {t('success.check_status')}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessMessage; 