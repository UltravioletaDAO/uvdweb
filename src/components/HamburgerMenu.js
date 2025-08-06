import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  LinkIcon,
  AcademicCapIcon,
  RectangleStackIcon,
  UserMinusIcon,
  ShieldCheckIcon,
  ArrowTopRightOnSquareIcon,
  GiftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  
  // Cerrar el menú cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Reorganizar los elementos del menú en categorías
  const mainMenuItems = [
    {
      name: t('navigation.home'),
      icon: HomeIcon,
      path: "/",
      isExternal: false,
      description: t('navigation.descriptions.home'),
    },
    {
      name: t('navigation.links'),
      icon: LinkIcon,
      path: "/links",
      isExternal: false,
      description: t('navigation.descriptions.links'),
    },
    {
      name: t('navigation.courses'),
      icon: AcademicCapIcon,
      path: "/courses",
      isExternal: false,
      description: t('navigation.descriptions.courses'),
    },
    {
      name: t('navigation.blog'),
      icon: RectangleStackIcon,
      path: "/blog",
      isExternal: false,
      description: t('navigation.descriptions.blog'),
    },
    {
      name: t('navigation.metrics'),
      icon: ArrowTrendingUpIcon,
      path: "/metrics",
      isExternal: false,
      description: t('navigation.descriptions.metrics'),
    }
    /* Delegations disabled for now (Beam validator was shut down)
    ,
    {
      name: t('navigation.delegations'),
      icon: CubeTransparentIcon,
      path: "/delegations",
      isExternal: false,
      description: t('navigation.descriptions.delegations'),
    }*/
  ];

  const governanceItems = [
    {
      name: t('navigation.snapshot'),
      icon: () => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 105 126"
          className="fill-current text-ultraviolet group-hover:text-ultraviolet-light"
        >
          <path d="M104.781694,54.7785 C104.270697,53.41 102.961707,52.5 101.498717,52.5 L59.2365129,52.5 L83.6138421,5.103 C84.3803368,3.612 83.9848395,1.7885 82.6653488,0.7525 C82.0283532,0.2485 81.2618586,0 80.498864,0 C79.6833697,0 78.8678754,0.287 78.21338,0.8505 L52.4990602,23.058 L1.21391953,67.3505 C0.107927276,68.306 -0.291069928,69.8495 0.219926491,71.218 C0.730922911,72.5865 2.03641376,73.5 3.49940351,73.5 L45.7616074,73.5 L21.3842782,120.897 C20.6177836,122.388 21.0132808,124.2115 22.3327715,125.2475 C22.9697671,125.7515 23.7362617,126 24.4992564,126 C25.3147506,126 26.1302449,125.713 26.7847403,125.1495 L52.4990602,102.942 L103.784201,58.6495 C104.893693,57.694 105.28919,56.1505 104.781694,54.7785 L104.781694,54.7785 Z" />
        </svg>
      ),
      path: "/snapshot",
      isExternal: false,
      customStyle: "text-[#FFAC33] group-hover:text-[#FFB74D]",
      description: t('navigation.descriptions.snapshot'),
    },
    {
      name: t('navigation.multisig'),
      icon: ShieldCheckIcon,
      path: "https://app.safe.global/home?safe=avax:0x52110a2Cc8B6bBf846101265edAAe34E753f3389",
      isExternal: true,
      customStyle: "text-emerald-400 group-hover:text-emerald-300",
      description: t('navigation.descriptions.multisig'),
    }
  ];

  const adminItems = [
    {
      name: t('navigation.purge'),
      icon: UserMinusIcon,
      path: "/purge",
      isExternal: false,
      description: t('navigation.descriptions.purge'),
    },
    {
      name: t('navigation.safestats'),
      icon: ChartBarIcon,
      path: "/safestats",
      isExternal: false,
      customStyle: "text-blue-400 group-hover:text-blue-300",
      description: t('navigation.descriptions.safestats'),
    },
    {
      name: t('navigation.wheel'),
      icon: GiftIcon,
      path: "/wheel",
      isExternal: false,
      description: t('navigation.descriptions.wheel'),
    },
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const itemVariants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  // Función para renderizar un grupo de elementos del menú
  const renderMenuGroup = (items, title, delay = 0) => (
    <div className="mb-8">
      {title && (
        <motion.div
          variants={itemVariants}
          initial="closed"
          animate="open"
          exit="closed"
          transition={{ delay }}
          className="mb-3"
        >
          <h3 className="text-xs uppercase text-text-secondary font-semibold tracking-wider px-4 mb-2">
            {title}
          </h3>
          <div className="h-px bg-gradient-to-r from-ultraviolet-darker/5 via-ultraviolet-darker/20 to-ultraviolet-darker/5 mb-3"></div>
        </motion.div>
      )}
      <div className="space-y-1">
        {items.map((item, index) => (
          <motion.div
            key={item.name}
            variants={itemVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ delay: delay + index * 0.1 }}
            className="relative"
          >
            {item.isExternal ? (
              <a
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center px-4 py-3 rounded-lg
                  group hover:bg-background/40 transition-all duration-200
                  ${location.pathname === item.path ? 'bg-background/30' : ''}
                  ${item.customStyle || ""}`}
                onClick={() => setIsOpen(false)}
                aria-label={item.name}
                title={item.description}
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center 
                  bg-background/30 rounded-lg mr-3 group-hover:bg-background/50
                  transition-all duration-200">
                  <item.icon
                    className={`w-5 h-5 transition-colors duration-200
                    ${item.customStyle || "text-ultraviolet group-hover:text-ultraviolet-light"}`}
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center">
                    <span className="font-medium text-text-primary">{item.name}</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 ml-1.5 text-text-secondary" />
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>
              </a>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg
                  group hover:bg-background/40 transition-all duration-200
                  ${location.pathname === item.path ? 'bg-background/30' : ''}`}
                onClick={() => setIsOpen(false)}
                aria-label={item.name}
                title={item.description}
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center 
                  bg-background/30 rounded-lg mr-3 group-hover:bg-background/50
                  transition-all duration-200">
                  <item.icon
                    className="w-5 h-5 text-ultraviolet group-hover:text-ultraviolet-light
                    transition-colors duration-200"
                  />
                </div>
                <div className="flex-grow">
                  <span className="font-medium text-text-primary">{item.name}</span>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>
              </Link>
            )}
            
            {/* Indicador de elemento activo */}
            {location.pathname === item.path && !item.isExternal && (
              <motion.div 
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-ultraviolet rounded-r-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Efecto para bloquear el scroll cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Botón del menú con efecto de hover mejorado */}
      <motion.button
        id="hamburger-button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-3 rounded-full
          bg-background-lighter hover:bg-ultraviolet-darker/20
          transition-colors duration-200 shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? t('navigation.aria.close_menu') : t('navigation.aria.open_menu')}
        aria-expanded={isOpen}
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
      </motion.button>

      {/* Overlay con efecto de blur mejorado */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Menú con diseño mejorado */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed right-0 top-0 h-full w-80 bg-background-lighter
              shadow-2xl z-[90] overflow-y-auto
              border-l border-ultraviolet-darker/20"
            role="navigation"
            aria-label={t('navigation.aria.main_menu')}
          >
            {/* Encabezado del menú */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="pt-16 pb-4 px-4"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-1">
                Ultravioleta DAO
              </h2>
              <p className="text-sm text-text-secondary">
                {t('home.subtitle')}
              </p>
              
              {/* Separador con gradiente */}
              <div className="h-px bg-gradient-to-r from-ultraviolet-darker/10 via-ultraviolet-darker/30 to-ultraviolet-darker/10 my-4"></div>
            </motion.div>
            
            {/* Contenido del menú */}
            <div className="px-2 pb-8">
              {renderMenuGroup(mainMenuItems, t('navigation.categories.main'), 0.3)}
              {renderMenuGroup(governanceItems, t('navigation.categories.governance'), 0.5)}
              {renderMenuGroup(adminItems, t('navigation.categories.admin'), 0.7)}
              
              {/* Footer del menú */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-12 px-4 py-4 bg-background/30 rounded-lg border border-ultraviolet-darker/10"
              >
                <p className="text-xs text-text-secondary text-center">
                  © {new Date().getFullYear()} Ultravioleta DAO
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HamburgerMenu;
