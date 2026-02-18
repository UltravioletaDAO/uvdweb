import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Filter, X, ExternalLink, Github, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import contributorsData from '../data/topContributors.json';

const SocialIcon = ({ platform, className }) => {
  const iconMap = {
    twitter: X,
    github: Github,
    moltx: MessageCircle,
    telegram: MessageCircle
  };
  
  const IconComponent = iconMap[platform] || ExternalLink;
  return <IconComponent className={className} />;
};

const getSocialUrl = (platform, handle) => {
  const urlMap = {
    twitter: `https://x.com/${handle.replace('@', '')}`,
    github: `https://github.com/${handle.replace('@', '')}`,
    moltx: `https://moltx.io/${handle.replace('@', '')}`,
    telegram: `https://t.me/${handle.replace('@', '')}`
  };
  
  return urlMap[platform] || `#`;
};

const ContributorCard = ({ contributor, index }) => {
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }}
      className={`relative bg-gradient-to-br from-background-lighter to-background 
        rounded-xl p-6 border border-ultraviolet-darker/20 hover:border-ultraviolet/40 
        transition-all duration-300 group hover:shadow-lg hover:shadow-ultraviolet/10
        ${contributor.featured ? 'ring-1 ring-ultraviolet/30' : ''}
        ${contributor.placeholder ? 'opacity-60' : ''}`}
    >
      {/* Badge Corner */}
      <div className={`absolute top-3 right-3 p-2 rounded-lg bg-gradient-to-r ${contributor.badge.color} 
        text-white shadow-lg animate-pulse group-hover:animate-none`}>
        <span className="text-lg">{contributor.badge.emoji}</span>
      </div>
      
      {/* Featured Glow */}
      {contributor.featured && (
        <div className="absolute inset-0 bg-gradient-to-r from-ultraviolet/5 to-purple-500/5 
          rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      <div className="relative z-10">
        {/* Avatar */}
        <div className="mb-4">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${contributor.badge.color} 
            p-0.5 group-hover:scale-110 transition-transform duration-300`}>
            <div className="w-full h-full rounded-full bg-background-lighter flex items-center justify-center">
              {contributor.avatar && !contributor.placeholder ? (
                <img 
                  src={contributor.avatar} 
                  alt={contributor.name}
                  className="w-14 h-14 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-14 h-14 rounded-full bg-ultraviolet/20 flex items-center justify-center text-ultraviolet text-xl font-bold
                ${contributor.avatar && !contributor.placeholder ? 'hidden' : 'flex'}`}>
                {contributor.placeholder ? '?' : contributor.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Name */}
        <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-ultraviolet transition-colors">
          {contributor.name}
        </h3>
        
        {/* Roles */}
        <div className="flex flex-wrap gap-2 mb-3">
          {contributor.roles.map((role) => {
            const roleData = contributorsData.roles.find(r => 
              r.name.toLowerCase() === role.toLowerCase() || 
              r.id === role.toLowerCase().replace(' ', '-')
            );
            
            return (
              <span 
                key={role}
                className={`px-2 py-1 text-xs rounded-full border font-medium
                  ${roleData ? roleData.color : 'bg-gray-500/20 text-gray-300 border-gray-500/40'}`}
              >
                {roleData?.icon} {role}
              </span>
            );
          })}
        </div>
        
        {/* Contributions */}
        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {contributor.contributions}
        </p>
        
        {/* Social Links */}
        {Object.keys(contributor.links).length > 0 && (
          <div className="flex gap-2">
            {Object.entries(contributor.links).map(([platform, handle]) => (
              <a
                key={platform}
                href={getSocialUrl(platform, handle)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-ultraviolet/10 hover:bg-ultraviolet/20 
                  text-ultraviolet hover:text-ultraviolet-light transition-all duration-200 
                  hover:scale-110"
                title={`${contributor.name} on ${platform}`}
              >
                <SocialIcon platform={platform} className="w-4 h-4" />
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const TopContributors = () => {
  const { t } = useTranslation();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredContributors, setFilteredContributors] = useState(contributorsData.topContributors);
  
  useEffect(() => {
    if (selectedRoles.length === 0) {
      setFilteredContributors(contributorsData.topContributors);
    } else {
      const filtered = contributorsData.topContributors.filter(contributor =>
        contributor.roles.some(role => 
          selectedRoles.includes(role.toLowerCase()) ||
          selectedRoles.includes(role.toLowerCase().replace(' ', '-'))
        )
      );
      setFilteredContributors(filtered);
    }
  }, [selectedRoles]);
  
  const toggleRole = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(r => r !== roleId)
        : [...prev, roleId]
    );
  };
  
  const clearFilters = () => {
    setSelectedRoles([]);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-400/20 to-orange-500/20">
            <Crown className="h-8 w-8 text-yellow-400" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary">
            {t('topContributors.title')}
          </h2>
        </motion.div>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          {t('topContributors.subtitle')}
        </p>
      </div>
      
      {/* Filter Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-background-lighter rounded-lg 
            border border-ultraviolet-darker/20 hover:border-ultraviolet/40 text-text-primary 
            transition-all duration-200"
        >
          <Filter className="w-4 h-4" />
          {t('topContributors.filterBy')}
          {selectedRoles.length > 0 && (
            <span className="bg-ultraviolet/20 text-ultraviolet px-2 py-1 rounded-full text-xs font-medium">
              {selectedRoles.length}
            </span>
          )}
        </button>
        
        {selectedRoles.length > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary 
              hover:text-ultraviolet transition-colors"
          >
            <X className="w-4 h-4" />
            {t('topContributors.clearFilters')}
          </button>
        )}
      </div>
      
      {/* Filter Pills */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 p-4 bg-background-lighter rounded-lg 
              border border-ultraviolet-darker/20 mb-6"
          >
            {contributorsData.roles.map((role) => (
              <button
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`px-3 py-2 text-sm rounded-full border font-medium transition-all duration-200
                  ${selectedRoles.includes(role.id)
                    ? role.color + ' ring-2 ring-offset-2 ring-offset-background ring-current'
                    : 'bg-background text-text-secondary border-ultraviolet-darker/40 hover:' + role.color
                  }`}
              >
                {role.icon} {role.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Contributors Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredContributors.map((contributor, index) => (
            <ContributorCard 
              key={contributor.id} 
              contributor={contributor} 
              index={index}
            />
          ))}
        </AnimatePresence>
      </motion.div>
      
      {/* Empty State */}
      {filteredContributors.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-text-secondary">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">{t('topContributors.noResults')}</p>
            <p className="text-sm">{t('topContributors.tryDifferentFilters')}</p>
          </div>
        </motion.div>
      )}
      
      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-ultraviolet/10 to-purple-500/10 rounded-xl p-6 
          border border-ultraviolet-darker/20 text-center"
      >
        <h3 className="text-xl font-bold text-text-primary mb-2">
          {t('topContributors.becomeContributor.title')}
        </h3>
        <p className="text-text-secondary mb-4">
          {t('topContributors.becomeContributor.description')}
        </p>
        <a
          href="/aplicar"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ultraviolet hover:bg-ultraviolet-light 
            text-white rounded-lg font-medium transition-colors duration-200"
        >
          {t('topContributors.becomeContributor.button')}
          <ExternalLink className="w-4 h-4" />
        </a>
      </motion.div>
    </div>
  );
};

export default TopContributors;