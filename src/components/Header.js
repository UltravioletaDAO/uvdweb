import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HomeIcon,
  LinkIcon,
  AcademicCapIcon,
  UsersIcon,
  ShieldCheckIcon,
  ArrowTopRightOnSquareIcon,
  GiftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import HamburgerMenu from "./HamburgerMenu";

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const mainMenuItems = [
    {
      name: t('navigation.home'),
      icon: HomeIcon,
      path: "/",
      isExternal: false,
    },
    {
      name: t('navigation.about'),
      icon: InformationCircleIcon,
      path: "/about",
      isExternal: false,
    },
    {
      name: t('navigation.links'),
      icon: LinkIcon,
      path: "/links",
      isExternal: false,
    },
    {
      name: t('navigation.courses'),
      icon: AcademicCapIcon,
      path: "/courses",
      isExternal: false,
    },
    {
      name: t('navigation.token'),
      icon: CurrencyDollarIcon,
      path: "/token",
      isExternal: false,
    },
    {
      name: t('navigation.metrics'),
      icon: ArrowTrendingUpIcon,
      path: "/metrics",
      isExternal: false,
    },
    {
      name: t('navigation.snapshot'),
      icon: () => (
        <svg
          width="16"
          height="16"
          viewBox="0 0 105 126"
          className="fill-current"
        >
          <path d="M104.781694,54.7785 C104.270697,53.41 102.961707,52.5 101.498717,52.5 L59.2365129,52.5 L83.6138421,5.103 C84.3803368,3.612 83.9848395,1.7885 82.6653488,0.7525 C82.0283532,0.2485 81.2618586,0 80.498864,0 C79.6833697,0 78.8678754,0.287 78.21338,0.8505 L52.4990602,23.058 L1.21391953,67.3505 C0.107927276,68.306 -0.291069928,69.8495 0.219926491,71.218 C0.730922911,72.5865 2.03641376,73.5 3.49940351,73.5 L45.7616074,73.5 L21.3842782,120.897 C20.6177836,122.388 21.0132808,124.2115 22.3327715,125.2475 C22.9697671,125.7515 23.7362617,126 24.4992564,126 C25.3147506,126 26.1302449,125.713 26.7847403,125.1495 L52.4990602,102.942 L103.784201,58.6495 C104.893693,57.694 105.28919,56.1505 104.781694,54.7785 L104.781694,54.7785 Z" />
        </svg>
      ),
      path: "/snapshot",
      isExternal: false,
      customStyle: "text-[#FFAC33] hover:text-[#FFB74D]",
    },
    {
      name: t('navigation.multisig'),
      icon: ShieldCheckIcon,
      path: "https://app.safe.global/home?safe=avax:0x52110a2Cc8B6bBf846101265edAAe34E753f3389",
      isExternal: true,
      customStyle: "text-emerald-400 hover:text-emerald-300",
    },
    {
      name: t('navigation.contributors'),
      icon: UsersIcon,
      path: "/contributors",
      isExternal: false,
    },
    {
      name: t('navigation.safestats'),
      icon: ChartBarIcon,
      path: "/safestats",
      isExternal: false,
      customStyle: "text-blue-400 hover:text-blue-300",
    },
    {
      name: t('navigation.wheel'),
      icon: GiftIcon,
      path: "/wheel",
      isExternal: false,
    },
  ];

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-background-lighter/95 backdrop-blur-md border-b border-ultraviolet-darker/20">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section - Standalone */}
            <div className="flex-shrink-0 mr-12">
              <Link to="/" className="flex items-center group">
                <img 
                  src="/uvd.png" 
                  alt="Ultravioleta DAO"
                  className="h-12 w-12 max-w-[89%] transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-2">
              {mainMenuItems.map((item) => (
                <div key={item.name}>
                  {item.isExternal ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center px-2.5 py-1.5 rounded-md text-xs font-normal tracking-wide
                        transition-all duration-200 hover:bg-white/10 hover:text-white
                        ${location.pathname === item.path ? 'bg-white/15 text-white' : ''}
                        ${item.customStyle || 'text-text-primary'}`}
                      aria-label={item.name}
                    >
                      <item.icon className="w-3.5 h-3.5 mr-1" />
                      <span className="uppercase text-xs font-medium">{item.name}</span>
                      <ArrowTopRightOnSquareIcon className="w-2.5 h-2.5 ml-1 opacity-50" />
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-2.5 py-1.5 rounded-md text-xs font-normal tracking-wide
                        transition-all duration-200 hover:bg-white/10 hover:text-white
                        ${location.pathname === item.path ? 'bg-white/15 text-white' : 'text-text-primary'}`}
                      aria-label={item.name}
                    >
                      <item.icon className="w-3.5 h-3.5 mr-1" />
                      <span className="uppercase text-xs font-medium">{item.name}</span>
                    </Link>
                  )}
                  {location.pathname === item.path && !item.isExternal && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="h-0.5 bg-white rounded-full mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
              ))}
              
              {/* Language Switcher */}
              <div className="ml-6 pl-4 border-l border-ultraviolet-darker/20">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Only visible on mobile */}
      <div className="lg:hidden">
        <HamburgerMenu />
      </div>

      {/* Spacer for fixed navigation on desktop */}
      <div className="hidden lg:block h-16"></div>
    </>
  );
};

export default Header;