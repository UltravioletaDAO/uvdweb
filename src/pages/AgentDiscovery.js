import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Users, Zap, Link, ExternalLink, Github, Globe, Code, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';

const IntegrationCard = ({ title, description, features, icon: Icon, color, link }) => {
  const colorClasses = {
    'yellow-500': {
      border: 'hover:border-yellow-500/40',
      shadow: 'hover:shadow-yellow-500/10',
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-500'
    },
    'green-500': {
      border: 'hover:border-green-500/40',
      shadow: 'hover:shadow-green-500/10', 
      bg: 'bg-green-500/20',
      text: 'text-green-500'
    },
    'purple-500': {
      border: 'hover:border-purple-500/40',
      shadow: 'hover:shadow-purple-500/10',
      bg: 'bg-purple-500/20', 
      text: 'text-purple-500'
    },
    'blue-500': {
      border: 'hover:border-blue-500/40',
      shadow: 'hover:shadow-blue-500/10',
      bg: 'bg-blue-500/20',
      text: 'text-blue-500'
    }
  };
  
  const colors = colorClasses[color] || colorClasses['purple-500'];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-background-lighter to-background rounded-xl p-6 
        border border-ultraviolet-darker/20 ${colors.border} transition-all duration-300
        ${colors.shadow} group`}
    >
      <div className={`p-3 rounded-xl ${colors.bg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`h-6 w-6 ${colors.text}`} />
      </div>
    
    <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
    <p className="text-text-secondary mb-4">{description}</p>
    
    <ul className="space-y-2 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2 text-sm text-text-secondary">
          <div className={`w-1.5 h-1.5 rounded-full bg-${color}`} />
          {feature}
        </li>
      ))}
    </ul>
    
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 ${colors.text} hover:text-ultraviolet-light 
            font-medium transition-colors`}
        >
          Explore <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );
};

const AgentCard = ({ name, role, description, avatar, links, badge }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-gradient-to-br from-background-lighter to-background rounded-xl p-6 
      border border-ultraviolet-darker/20 hover:border-ultraviolet/40 transition-all duration-300
      hover:shadow-lg hover:shadow-ultraviolet/10 group relative"
  >
    {badge && (
      <div className="absolute top-4 right-4 text-2xl animate-bounce">
        {badge}
      </div>
    )}
    
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ultraviolet to-purple-500 
        p-0.5 group-hover:scale-110 transition-transform">
        <div className="w-full h-full rounded-full bg-background-lighter flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
          ) : (
            <Bot className="w-6 h-6 text-ultraviolet" />
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-text-primary">{name}</h3>
        <p className="text-sm text-ultraviolet font-medium">{role}</p>
      </div>
    </div>
    
    <p className="text-text-secondary mb-4">{description}</p>
    
    {links && Object.keys(links).length > 0 && (
      <div className="flex gap-2">
        {Object.entries(links).map(([platform, url]) => {
          const Icon = platform === 'moltx' ? Bot : 
                     platform === 'github' ? Github : 
                     platform === 'website' ? Globe : ExternalLink;
          
          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-ultraviolet/10 hover:bg-ultraviolet/20 
                text-ultraviolet hover:text-ultraviolet-light transition-all duration-200"
              title={`${name} on ${platform}`}
            >
              <Icon className="w-4 h-4" />
            </a>
          );
        })}
      </div>
    )}
  </motion.div>
);

const StepCard = ({ step, index, title, description, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex gap-4 p-4 bg-background-lighter rounded-lg border border-ultraviolet-darker/20
      hover:border-ultraviolet/30 transition-colors"
  >
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-ultraviolet/20 flex items-center justify-center
        text-ultraviolet font-bold text-lg">
        {step}
      </div>
    </div>
    
    <div>
      <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  </motion.div>
);

const AgentDiscovery = () => {
  const { t } = useTranslation();
  
  // JSON-LD structured data for agents
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "UltraVioleta DAO",
    "description": "Web3-native community building the future of decentralized technology in Latin America",
    "url": "https://ultravioletadao.io",
    "sameAs": [
      "https://x.com/UltravioletaDAO",
      "https://github.com/ultravioletadao",
      "https://discord.gg/ultravioleta"
    ],
    "additionalType": "AutonomousOrganization",
    "specialty": [
      "Decentralized Autonomous Organization",
      "AI Agent Integration",
      "Web3 Development",
      "Cross-chain Infrastructure"
    ],
    "offers": [
      {
        "@type": "Service",
        "name": "Execution Market",
        "description": "Bidirectional marketplace for human-AI task collaboration",
        "url": "https://execution.market"
      },
      {
        "@type": "Service", 
        "name": "x402 Facilitator",
        "description": "Gasless payment infrastructure for autonomous agents",
        "serviceType": "Payment Infrastructure"
      }
    ],
    "memberOf": {
      "@type": "Consortium",
      "name": "Agent Economy",
      "description": "Ecosystem of AI agents and human collaborators"
    }
  };
  
  const agents = [
    {
      name: "Clawd",
      role: "Development Agent",
      description: "AI agent specializing in Web3 development, automation, and community assistance.",
      badge: "🤖",
      links: {
        moltx: "https://moltx.io/UltraClawd",
        github: "https://github.com/ultravioletadao"
      }
    }
  ];
  
  const integrations = [
    {
      title: t('agentDiscovery.integrationPoints.executionMarket.title'),
      description: t('agentDiscovery.integrationPoints.executionMarket.description'),
      features: t('agentDiscovery.integrationPoints.executionMarket.features'),
      icon: Zap,
      color: 'yellow-500',
      link: 'https://execution.market'
    },
    {
      title: t('agentDiscovery.integrationPoints.karmaCadabra.title'),
      description: t('agentDiscovery.integrationPoints.karmaCadabra.description'),
      features: t('agentDiscovery.integrationPoints.karmaCadabra.features'),
      icon: Users,
      color: 'green-500',
      link: 'https://karmacadabra.com'
    },
    {
      title: t('agentDiscovery.integrationPoints.moltX.title'),
      description: t('agentDiscovery.integrationPoints.moltX.description'),
      features: t('agentDiscovery.integrationPoints.moltX.features'),
      icon: Bot,
      color: 'purple-500',
      link: 'https://moltx.io'
    },
    {
      title: t('agentDiscovery.integrationPoints.facilitator.title'),
      description: t('agentDiscovery.integrationPoints.facilitator.description'),
      features: t('agentDiscovery.integrationPoints.facilitator.features'),
      icon: Link,
      color: 'blue-500',
      link: '/facilitator'
    }
  ];
  
  return (
    <>
      <SEO
        title="Agent Discovery Hub | AI Agents & Web3 Integration"
        description="Discover how AI agents can integrate with UltraVioleta DAO's ecosystem. Learn about agent-friendly infrastructure, APIs, and collaboration opportunities in Web3."
        keywords="AI agents, agent discovery, Web3 agents, autonomous agents, AI integration, agent APIs, ERC-8004, agent identity, agent reputation, blockchain agents, AI DAO participation"
      />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-ultraviolet/20 to-purple-500/20">
                <Bot className="h-12 w-12 text-ultraviolet" />
              </div>
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4
              bg-gradient-to-r from-ultraviolet to-purple-400 bg-clip-text text-transparent">
              {t('agentDiscovery.title')}
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              {t('agentDiscovery.subtitle')}
            </p>
          </motion.header>
          
          {/* Who We Are Section */}
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-r from-ultraviolet/10 to-purple-500/10 rounded-2xl p-8 
              border border-ultraviolet-darker/20">
              <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <Users className="h-8 w-8 text-ultraviolet" />
                {t('agentDiscovery.whoWeAre.title')}
              </h2>
              
              <p className="text-lg text-text-secondary mb-6">
                {t('agentDiscovery.whoWeAre.description')}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {t('agentDiscovery.whoWeAre.highlights').map((highlight, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-ultraviolet animate-pulse" />
                    <span className="text-text-primary">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
          
          {/* Our Agents Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <Bot className="h-8 w-8 text-ultraviolet" />
              {t('agentDiscovery.ourAgents.title')}
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              {t('agentDiscovery.ourAgents.description')}
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <AgentCard key={index} {...agent} />
              ))}
            </div>
          </motion.section>
          
          {/* Integration Points Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
              <Code className="h-8 w-8 text-ultraviolet" />
              {t('agentDiscovery.integrationPoints.title')}
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              {t('agentDiscovery.integrationPoints.description')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {integrations.map((integration, index) => (
                <IntegrationCard key={index} {...integration} />
              ))}
            </div>
          </motion.section>
          
          {/* Get Started Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-ultraviolet/10 to-purple-500/10 rounded-2xl p-8 
              border border-ultraviolet-darker/20"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                {t('agentDiscovery.getStarted.title')}
              </h2>
              <p className="text-lg text-text-secondary">
                {t('agentDiscovery.getStarted.description')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {t('agentDiscovery.getStarted.steps').map((step, index) => (
                <StepCard
                  key={index}
                  step={index + 1}
                  title={step}
                  description=""
                />
              ))}
            </div>
            
            <div className="text-center">
              <a
                href="https://execution.market"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-ultraviolet hover:bg-ultraviolet-light 
                  text-white rounded-xl font-semibold text-lg transition-colors duration-200
                  hover:shadow-lg hover:shadow-ultraviolet/20"
              >
                {t('agentDiscovery.getStarted.button')}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default AgentDiscovery;