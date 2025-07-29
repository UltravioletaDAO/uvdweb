import SnapshotSection  from "../components/metricDashboard/SnapshotSection";
import TokenSection from "../components/metricDashboard/TokenSection";
import {FundsSection} from "../components/metricDashboard/FundsSection";
import {CommunitySection} from "../components/metricDashboard/CommunitySection";
import {RewardsSection} from "../components/metricDashboard/RewardsSection";
import { Activity } from "lucide-react";

const MetricsDashboard = () =>{ 
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                Dashboard de Métricas	
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Panel de métricas con la actividad, recompensas y crecimiento de la UltravioletaDAO 
              </p>
            </div>
          </div>

          <div className="mb-8"></div>
        </header>

        <main className="space-y-16">
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
  );
}

export default MetricsDashboard;