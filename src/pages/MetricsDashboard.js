import SnapshotSection  from "../components/metricDashboard/SnapshotSection";
import TokenSection from "../components/metricDashboard/TokenSection";
import {FundsSection} from "../components/metricDashboard/FundsSection";
// import {CommunitySection} from "../components/metricDashboard/CommunitySection";
// import {RewardsSection} from "../components/metricDashboard/RewardsSection";
import { Activity } from "lucide-react";
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

const MetricsDashboard = () =>{ 
  const { t } = useTranslation();
  
  return (
    <>
      <SEO 
        title={t('metricsDashboard.seoTitle', 'Metrics Dashboard - Real-time DAO Analytics')}
        description={t('metricsDashboard.seoDescription', 'Track UltraVioleta DAO performance with real-time metrics. View governance participation, treasury balance, token analytics, community growth, and member rewards.')}
        keywords="DAO Metrics, UltraVioleta Analytics, Treasury Dashboard, Governance Metrics, Token Analytics, Community Growth, DAO Performance, Blockchain Analytics, LATAM Web3 Metrics"
      />
      <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight flex flex-wrap items-center gap-3 mb-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-primary/15">
                  <Activity className="h-6 sm:h-7 w-6 sm:w-7 text-primary" />
                </div>
                <span className="break-words">{t('metricsDashboard.title')}</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground sm:ml-14">
                {t('metricsDashboard.subtitle')}
              </p>
            </div>
          </div>
        </header>

        <main className="space-y-20">
          <section>
            <SnapshotSection />
          </section>


          <section>
            <TokenSection />
          </section>


          <section>
            <FundsSection />
          </section>

          {/* <section>
            <CommunitySection />
          </section> 


          <section>
            <RewardsSection />
          </section>*/}
        </main>
      </div>
    </div>
    </>
  );
}

export default MetricsDashboard;