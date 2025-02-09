import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, children }) => {
  // Cuando el modal está abierto, ocultamos el menú hamburguesa
  React.useEffect(() => {
    const hamburgerButton = document.querySelector('#hamburger-button');
    if (hamburgerButton) {
      hamburgerButton.style.visibility = isOpen ? 'hidden' : 'visible';
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          
          {/* Contenedor del modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto
                scrollbar-thin scrollbar-track-background scrollbar-thumb-ultraviolet-darker/50
                rounded-xl relative"
            >
              {/* Botón de cerrar */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full 
                  bg-background/20 hover:bg-background/40
                  transition-colors duration-200 z-[120]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <XMarkIcon className="w-6 h-6 text-text-primary" />
              </motion.button>

              {/* Scroll container */}
              <div className="overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal; 