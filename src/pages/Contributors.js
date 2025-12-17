import React from 'react';
import { ContributorSection } from '../components/metricDashboard/ContributorSection';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const Contributors = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <SEO
        title="DAO Contributors & Builders | Open Source Web3 Development"
        description="Meet the builders of UltraVioleta DAO. Join our community of Web3 developers, designers, and contributors building the future of decentralized technology in Latin America."
        keywords="DAO contributors, Web3 builders, open source contributors, blockchain developers, Latin America developers, GitHub contributors, Web3 community, DAO members, decentralized development, crypto contributors, blockchain builders, community developers"
      />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-4 mb-3">
                <div className="p-2.5 rounded-xl bg-primary/15">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                {t('metricsDashboard.contributorSection.title')}
              </h1>
              <p className="text-lg text-muted-foreground ml-14">
                {t('metricsDashboard.contributorSection.subtitle')}
              </p>
            </div>
          </div>
        </header>

        <main>
          <ContributorSection />
        </main>
      </div>
    </div>
    </>
  );
};

export default Contributors;