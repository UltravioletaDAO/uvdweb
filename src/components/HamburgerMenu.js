import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: 'Inicio',
      icon: HomeIcon,
      path: '/',
      isExternal: false
    },
    {
      name: 'Snapshot',
      icon: () => (
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 105 126" 
          className="fill-current"
        >
          <path d="M104.781694,54.7785 C104.270697,53.41 102.961707,52.5 101.498717,52.5 L59.2365129,52.5 L83.6138421,5.103 C84.3803368,3.612 83.9848395,1.7885 82.6653488,0.7525 C82.0283532,0.2485 81.2618586,0 80.498864,0 C79.6833697,0 78.8678754,0.287 78.21338,0.8505 L52.4990602,23.058 L1.21391953,67.3505 C0.107927276,68.306 -0.291069928,69.8495 0.219926491,71.218 C0.730922911,72.5865 2.03641376,73.5 3.49940351,73.5 L45.7616074,73.5 L21.3842782,120.897 C20.6177836,122.388 21.0132808,124.2115 22.3327715,125.2475 C22.9697671,125.7515 23.7362617,126 24.4992564,126 C25.3147506,126 26.1302449,125.713 26.7847403,125.1495 L52.4990602,102.942 L103.784201,58.6495 C104.893693,57.694 105.28919,56.1505 104.781694,54.7785 L104.781694,54.7785 Z" />
        </svg>
      ),
      path: 'https://snapshot.org/#/s:ultravioletadao.eth',
      isExternal: true,
      customStyle: 'text-[#FFAC33] group-hover:text-[#FFB74D]'
    }
    // Comentamos temporalmente el enlace a links
    /*,
    {
      name: 'Links',
      icon: LinkIcon,
      path: '/links',
      isExternal: false
    }*/
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const itemVariants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  return (
    <>
      {/* Botón del menú */}
      <button
        id="hamburger-button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full
          bg-background-lighter hover:bg-background
          transition-colors duration-200"
      >
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6 text-text-primary" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-text-primary" />
          )}
        </motion.div>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menú */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed right-0 top-0 h-full w-64 bg-background-lighter
              shadow-lg z-[90] p-8"
          >
            <div className="space-y-6 mt-16">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ delay: index * 0.1 }}
                >
                  {item.isExternal ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-3 text-text-primary
                        hover:text-ultraviolet transition-colors duration-200
                        group ${item.customStyle || ''}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className={`w-5 h-5 transition-colors duration-200
                        ${item.customStyle || 'group-hover:text-ultraviolet'}`} />
                      <span>{item.name}</span>
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className="flex items-center space-x-3 text-text-primary
                        hover:text-ultraviolet transition-colors duration-200
                        group"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5 group-hover:text-ultraviolet
                        transition-colors duration-200" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HamburgerMenu; 