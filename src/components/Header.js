import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  UsersIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  PlayCircleIcon,
  PhotoIcon,
  DocumentTextIcon,
  BeakerIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mainMenuItems = [
    { name: t('navigation.home'), icon: HomeIcon, path: "/", isExternal: false },
    { name: t('navigation.about'), icon: InformationCircleIcon, path: "/about", isExternal: false },
    { name: t('navigation.token'), icon: CurrencyDollarIcon, path: "/token", isExternal: false },
    { name: t('navigation.metrics'), icon: ArrowTrendingUpIcon, path: "/metrics", isExternal: false },
    {
      name: t('navigation.services'),
      icon: PlayCircleIcon,
      path: "/services",
      isExternal: false,
      highlight: "text-cyan-glow hover:text-cyan-400",
    },
    {
      name: t('navigation.facilitator'),
      icon: BeakerIcon,
      path: "https://facilitator.ultravioletadao.xyz/",
      isExternal: true,
      highlight: "text-ultraviolet-light hover:text-ultraviolet-glow",
    },
    {
      name: t('navigation.nft'),
      icon: PhotoIcon,
      path: "/nfts",
      isExternal: false,
      highlight: "text-pink-400 hover:text-pink-300",
    },
    {
      name: t('navigation.snapshot'),
      icon: null, // Custom icon handled inline
      customIcon: (
        <svg width="16" height="16" viewBox="0 0 105 126" className="fill-current w-4 h-4 mr-1.5">
          <path d="M104.781694,54.7785 C104.270697,53.41 102.961707,52.5 101.498717,52.5 L59.2365129,52.5 L83.6138421,5.103 C84.3803368,3.612 83.9848395,1.7885 82.6653488,0.7525 C82.0283532,0.2485 81.2618586,0 80.498864,0 C79.6833697,0 78.8678754,0.287 78.21338,0.8505 L52.4990602,23.058 L1.21391953,67.3505 C0.107927276,68.306 -0.291069928,69.8495 0.219926491,71.218 C0.730922911,72.5865 2.03641376,73.5 3.49940351,73.5 L45.7616074,73.5 L21.3842782,120.897 C20.6177836,122.388 21.0132808,124.2115 22.3327715,125.2475 C22.9697671,125.713 23.7362617,126 24.4992564,126 C25.3147506,126 26.1302449,125.713 26.7847403,125.1495 L52.4990602,102.942 L103.784201,58.6495 C104.893693,57.694 105.28919,56.1505 104.781694,54.7785 L104.781694,54.7785 Z" />
        </svg>
      ),
      path: "/snapshot",
      isExternal: false,
      highlight: "text-yellow-400 hover:text-yellow-300",
    },
    {
      name: t('navigation.contributors'),
      icon: UsersIcon,
      path: "/contributors",
      isExternal: false,
    },
    {
      name: "Firmantes",
      icon: ChartBarIcon,
      path: "/safestats",
      isExternal: false,
    },
    {
      name: "Roulette",
      icon: ArrowTrendingUpIcon,
      path: "/wheel",
      isExternal: false,
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${scrolled ? "bg-background/80 backdrop-blur-md border-b border-white/5 py-2 shadow-lg" : "bg-transparent py-4"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center group relative z-50">
              <div className="relative">
                <div className="absolute inset-0 bg-ultraviolet-light blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300 rounded-full"></div>
                <img
                  src="/uvd.png"
                  alt="UVD Logo"
                  className="h-10 w-10 relative z-10 transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {mainMenuItems.map((item) => (
                <div key={item.name} className="relative group">
                  {item.isExternal ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200
                        ${item.highlight ? item.highlight : 'text-text-secondary hover:text-white hover:bg-white/5'}
                      `}
                    >
                      {item.icon ? <item.icon className="w-4 h-4 mr-1.5" /> : item.customIcon}
                      {item.name}
                      <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1 opacity-50" />
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200
                        ${location.pathname === item.path
                          ? 'text-white bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                          : item.highlight || 'text-text-secondary hover:text-white hover:bg-white/5'}
                      `}
                    >
                      {item.icon ? <item.icon className="w-4 h-4 mr-1.5" /> : item.customIcon}
                      {item.name}
                    </Link>
                  )}
                  {location.pathname === item.path && !item.isExternal && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ultraviolet-light to-cyan-glow rounded-full mx-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4 relative z-50">
              <div className="hidden sm:block pl-4 border-l border-white/10">
                <LanguageSwitcher />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl lg:hidden pt-24 px-6 pb-6 overflow-y-auto"
          >
            <div className="flex flex-col space-y-2">
              {mainMenuItems.map((item) => (
                <div key={item.name}>
                  {item.isExternal ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 rounded-xl text-lg font-medium text-text-primary hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon ? <item.icon className="w-6 h-6 mr-3 text-ultraviolet-light" /> : <div className="mr-3">{item.customIcon}</div>}
                      {item.name}
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-auto opacity-50" />
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center p-4 rounded-xl text-lg font-medium border transition-all
                        ${location.pathname === item.path
                          ? 'bg-white/10 text-white border-white/10 shadow-lg'
                          : 'text-text-primary hover:bg-white/5 hover:text-white border-transparent hover:border-white/10'}
                      `}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon ? <item.icon className="w-6 h-6 mr-3 text-ultraviolet-light" /> : <div className="mr-3">{item.customIcon}</div>}
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="pt-6 mt-6 border-t border-white/10">
                <div className="flex justify-center">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;