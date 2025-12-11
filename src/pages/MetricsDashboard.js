import SnapshotSection from "../components/metricDashboard/SnapshotSection";
import TokenSection from "../components/metricDashboard/TokenSection";
import { FundsSection } from "../components/metricDashboard/FundsSection";
// import {CommunitySection} from "../components/metricDashboard/CommunitySection";
// import {RewardsSection} from "../components/metricDashboard/RewardsSection";
import { Activity } from "lucide-react";
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { motion } from "framer-motion";

const MetricsDashboard = () => {
  const { t } = useTranslation();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <>
      <SEO
        title={t('metricsDashboard.seoTitle')}
        description={t('metricsDashboard.seoDescription')}
        keywords="DAO Metrics, UltraVioleta Analytics, Treasury Dashboard, Governance Metrics, Token Analytics, Community Growth, DAO Performance, Blockchain Analytics, LATAM Web3 Metrics"
      />
      <div className="min-h-screen bg-background overflow-x-hidden pt-24 pb-12">

        {/* Decorative Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-ultraviolet/10 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center lg:text-left"
          >
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 flex items-center justify-center lg:justify-start gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-ultraviolet to-ultraviolet-dark shadow-lg shadow-ultraviolet/25">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {t('metricsDashboard.title')}
                  </span>
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  {t('metricsDashboard.subtitle')}
                </p>
              </div>

              {/* Optional: Add a refreshed timestamp or global status indicator here */}
              <div className="hidden lg:block px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-gray-400">
                Live Data
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 ml-2 animate-pulse"></span>
              </div>
            </div>
          </motion.header>

          <main className="space-y-24">
            <motion.section
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <SnapshotSection />
            </motion.section>

            <motion.section
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="relative">
                <div className="absolute inset-x-0 -top-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <TokenSection />
              </div>
            </motion.section>

            <motion.section
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="relative">
                <div className="absolute inset-x-0 -top-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <FundsSection />
              </div>
            </motion.section>

            {/* Placeholder for future sections */}
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