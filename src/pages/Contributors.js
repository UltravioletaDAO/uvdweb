import React from 'react';
import { ContributorSection } from '../components/metricDashboard/ContributorSection';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Contributors = () => {
  const { t } = useTranslation();
  
  return (
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
  );
};

export default Contributors;