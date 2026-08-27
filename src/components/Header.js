import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
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
  GiftIcon,
  CalendarIcon,
  AcademicCapIcon,
  LinkIcon,
  CpuChipIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import HamburgerMenu from "./HamburgerMenu";

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Close "More" dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close "More" dropdown on route change
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  // Curated top bar: only the 7 core destinations. Everything else lives in "More".
  const mainMenuItems = [
    {
      name: t('navigation.about'),
      icon: InformationCircleIcon,
      path: "/about",
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
      // C-4 snapshot icon token
      customStyle: "text-snapshotIcon hover:text-snapshotIcon",
    },
    {
      name: t('navigation.services'),
      icon: PlayCircleIcon,
      path: "/services",
      isExternal: false,
      customStyle: "text-purple-400 hover:text-purple-300",
    },
    {
      name: t('navigation.events'),
      icon: CalendarIcon,
      path: "/events",
      isExternal: false,
    },
    {
      name: t('navigation.watchToEarn'),
      icon: PlayCircleIcon,
      path: "/wheel",
      isExternal: false,
    },
  ];

  // C-5: Secondary items grouped under "More" dropdown to avoid desktop nav saturation.
  // BLOG removed from nav (posts.js is empty). Bounties only appears when its flag is on.
  const moreMenuItems = [
    {
      // C-6: Internal Facilitator landing page
      name: t('navigation.facilitator'),
      icon: BeakerIcon,
      path: "/facilitator",
      isExternal: false,
      customStyle: "text-emerald-400 hover:text-emerald-300",
    },
    {
      // C-6: External "Abrir app" secondary link for Facilitator
      name: t('navigation.facilitatorApp'),
      icon: BeakerIcon,
      path: "https://facilitator.ultravioletadao.xyz/",
      isExternal: true,
      customStyle: "text-emerald-400 hover:text-emerald-300",
    },
    {
      name: t('navigation.streamSummaries'),
      icon: DocumentTextIcon,
      path: "/stream-summaries",
      isExternal: false,
      customStyle: "text-violet-400 hover:text-violet-300",
    },
    {
      name: t('navigation.nft'),
      icon: PhotoIcon,
      path: "/nfts",
      isExternal: false,
      customStyle: "text-pink-400 hover:text-pink-300",
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
      name: t('navigation.courses'),
      icon: AcademicCapIcon,
      path: "/courses",
      isExternal: false,
    },
    {
      name: t('navigation.agents'),
      icon: CpuChipIcon,
      path: "/agents",
      isExternal: false,
    },
    {
      name: t('navigation.links'),
      icon: LinkIcon,
      path: "/links",
      isExternal: false,
    },
    // Bounties backend is offline; only appears when REACT_APP_BOUNTIES_ENABLED=true
    ...(process.env.REACT_APP_BOUNTIES_ENABLED === 'true' ? [{
      name: t('navigation.bounties'),
      icon: GiftIcon,
      path: "/bounties",
      isExternal: false,
      customStyle: "text-amber-400 hover:text-amber-300",
    }] : []),
  ];

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-background-lighter/95 backdrop-blur-md border-b border-ultraviolet-darker/20">
        <div className="w-full px-6">
          <div className="flex items-center justify-center h-14 gap-6">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center group">
                <img
                  src="/uvd-128.png"
                  alt={t('common.logo_alt')}
                  width={36}
                  height={36}
                  className="h-9 w-9 transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center flex-wrap justify-center gap-x-1 gap-y-0.5">
              {mainMenuItems.map((item) => (
                <div key={item.name}>
                  {item.isExternal ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center px-1.5 py-1 rounded text-xs leading-none font-medium tracking-wide
                        transition-all duration-200 hover:bg-white/10 hover:text-white
                        ${location.pathname === item.path ? 'bg-white/15 text-white' : ''}
                        ${item.customStyle || 'text-text-primary'}`}
                      aria-label={item.name}
                    >
                      <span className="uppercase whitespace-nowrap">{item.name}</span>
                      <ArrowTopRightOnSquareIcon className="w-2 h-2 ml-0.5 opacity-50" />
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-1.5 py-1 rounded text-xs leading-none font-medium tracking-wide
                        transition-all duration-200 hover:bg-white/10 hover:text-white
                        ${location.pathname === item.path ? 'bg-white/15 text-white' : 'text-text-primary'}
                        ${item.customStyle || ''}`}
                      aria-label={item.name}
                    >
                      <span className="uppercase whitespace-nowrap">{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}

              {/* C-5: "More" dropdown for secondary nav items */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((o) => !o)}
                  className={`flex items-center gap-0.5 px-1.5 py-1 rounded text-xs leading-none font-medium tracking-wide
                    transition-all duration-200 hover:bg-white/10 hover:text-white
                    ${moreMenuItems.some((i) => location.pathname === i.path) ? 'bg-white/15 text-white' : 'text-text-primary'}`}
                  aria-haspopup="true"
                  aria-expanded={moreOpen}
                >
                  <span className="uppercase whitespace-nowrap">{t('navigation.more')}</span>
                  <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-background-lighter border border-ultraviolet-darker/20 rounded-lg shadow-xl z-50 py-1">
                    {moreMenuItems.map((item) => (
                      item.isExternal ? (
                        <a
                          key={item.name}
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium
                            hover:bg-white/10 hover:text-white transition-all duration-200
                            ${item.customStyle || 'text-text-primary'}`}
                          onClick={() => setMoreOpen(false)}
                        >
                          <span className="uppercase whitespace-nowrap">{item.name}</span>
                          <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-50 ml-auto flex-shrink-0" />
                        </a>
                      ) : (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center px-3 py-2 text-xs font-medium
                            hover:bg-white/10 hover:text-white transition-all duration-200
                            ${location.pathname === item.path ? 'bg-white/15 text-white' : ''}
                            ${item.customStyle || 'text-text-primary'}`}
                          onClick={() => setMoreOpen(false)}
                        >
                          <span className="uppercase whitespace-nowrap">{item.name}</span>
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Language Switcher */}
              <div className="ml-2 pl-2 border-l border-ultraviolet-darker/20">
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
      <div className="hidden lg:block h-14"></div>
    </>
  );
};

export default Header;