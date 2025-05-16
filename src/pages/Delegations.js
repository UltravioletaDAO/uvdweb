import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const Delegations = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleReturn = () => {
    navigate('/', { replace: true });
  };

  const handleCopyNodeId = async () => {
    const nodeId = "NodeID-83Dx5mVdBzehEn8xomdeMQPLBM9xY2XkZ";
    try {
      await navigator.clipboard.writeText(nodeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background py-16 px-4"
    >
      <div className="container mx-auto">
        <motion.button
          onClick={handleReturn}
          className="inline-flex items-center space-x-2 text-text-secondary
            hover:text-text-primary transition-all duration-200 mb-8
            hover:translate-x-[-5px]"
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>{t('success.back_home')}</span>
        </motion.button>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Main Title Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              {t('delegations.title')}
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          {/* Beam Validator Section */}
          <div className="bg-card rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-text-primary mb-6 pb-4 border-b border-border">
              {t('delegations.beam_validator.title')}
            </h2>
            
            <div className="space-y-6 text-text-secondary">
              <div className="space-y-2">
                <p className="text-lg">
                  {t('delegations.beam_validator.join_message').split('@UltravioletaDAO')[0]}
                  <a 
                    href="https://x.com/UltravioletaDAO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ultraviolet-dark hover:text-ultraviolet-light transition-colors duration-200"
                  >
                    @UltravioletaDAO
                  </a>
                </p>
                <p className="pl-8">{t('delegations.beam_validator.launch_message')}</p>
                </div>
                <div className="space-y-6">
                <p className="font-semibold">{t('delegations.beam_validator.infrastructure')}</p>
                </div>
                <div className="space-y-2">
                <p className="pl-8">
                  {t('delegations.beam_validator.deployment').split('@0xultravioleta')[0]}
                  <a 
                    href="https://x.com/0xultravioleta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ultraviolet-dark hover:text-ultraviolet-light transition-colors duration-200"
                  >
                    @0xultravioleta
                  </a>
                  {t('delegations.beam_validator.deployment').split('@0xultravioleta')[1]}
                </p>
                <p className="pl-8">{t('delegations.beam_validator.reliability')}</p>
                <p className="pl-8">{t('delegations.beam_validator.backed')}</p>
                <p className="pl-8">{t('delegations.beam_validator.commitment')}</p>
                <p className="pl-8">{t('delegations.beam_validator.infrastructure_code')}</p>
                </div>
            </div>
          </div>

          {/* Join Movement Section */}
          <div className="bg-card rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-text-primary mb-6 pb-4 border-b border-border">
              {t('delegations.beam_validator.join_movement')}
            </h2>
            <div className="space-y-4 text-text-secondary">
              <p>{t('delegations.beam_validator.delegate')}</p>
              <a 
                href="https://nodes.onbeam.com/delegations"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-ultraviolet-dark hover:text-ultraviolet-light transition-colors duration-200"
              >
                https://nodes.onbeam.com/delegations
              </a>
              <div className="flex items-center space-x-2 mt-2">
                <p className="font-mono text-ultraviolet-dark select-all">
                  {t('delegations.beam_validator.node_id')}
                </p>
                <button
                  onClick={handleCopyNodeId}
                  className="p-1.5 rounded-lg hover:bg-gray-700/20 transition-colors duration-200"
                  title={copied ? "¡Copied!" : "Copy"}
                >
                  {copied ? (
                    <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ClipboardIcon className="w-5 h-5 text-ultraviolet-dark hover:text-ultraviolet-light" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tutorial Section */}
          <div className="bg-card rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-text-primary mb-6 pb-4 border-b border-border">
              {t('delegations.tutorial.title')}
            </h2>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <iframe 
                src={`https://player.twitch.tv/?video=2421038824&parent=${window.location.hostname}`}
                frameBorder="0" 
                allowFullScreen="true" 
                scrolling="no" 
                height="378" 
                width="620"
                className="w-full rounded-lg"
                title={t('delegations.tutorial.video_title')}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Delegations;
