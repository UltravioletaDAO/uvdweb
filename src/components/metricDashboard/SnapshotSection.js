import { MetricCard } from "../MetricCard";
import { Button } from "../Button";
import { Progress } from "../Progress";
import { ExternalLink, Vote, FileText, Users } from "lucide-react";
import { SNAPSHOT_SPACES } from "../../lib/snapshotSpaces";
import { useSnapshotData } from "../../hooks/useSnapshotData";
import { useTranslation } from 'react-i18next';

const SnapshotSection = () => {
  const { t } = useTranslation();
  const {
    currentSpace,
    error,
    loading,
    metrics,
    latestProposal,
    leaderboard,
    handleSpaceChange,
    loadSpaceData,
  } = useSnapshotData();

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg bg-snapshot/20">
                <Vote className="h-6 w-6 text-snapshot" />
              </div>
              Snapshot Governance
            </h2>
            <p className="text-muted-foreground mt-1">
              {t('metricsDashboard.snapshot.error_loading')}: {error}
            </p>
          </div>
        </div>
        <Button onClick={() => loadSpaceData(currentSpace)} variant="outline">
          {t('metricsDashboard.snapshot.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-snapshot/15">
              <Vote className="h-5 w-5 text-snapshot" />
            </div>
            <span className="text-snapshot">SNAPSHOT GOVERNANCE</span>
          </h2>
          <p className="text-sm text-muted-foreground ml-11">
            {t('metricsDashboard.snapshot.subtitle')}
          </p>
        </div>
        
        {/* Tabs para cambiar entre spaces */}
        <div className="flex gap-2">
          {Object.values(SNAPSHOT_SPACES).map((space) => (
            <Button
              key={space.id}
              variant={currentSpace === space.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleSpaceChange(space.id)}
              className={currentSpace === space.id ? "bg-snapshot/20 text-white" : "border-snapshot/30"}
            >
              {space.name}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Propuestas"
              value={metrics.proposals}
              change={t('metricsDashboard.snapshot.total_historic')}
              changeType="positive"
              variant="snapshot"
              icon={<FileText className="h-4 w-4" />}
            />
            <MetricCard
              title="Votos"
              value={metrics.votes.toLocaleString()}
              variant="snapshot"
              icon={<Vote className="h-4 w-4" />}
            />
            <MetricCard
              title="Followers"
              value={metrics.followers.toLocaleString()}
              changeType="positive"
              variant="snapshot"
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard
              title="Quórum requerido"
              value={latestProposal && latestProposal.quorum ? latestProposal.quorum.toLocaleString() : "N/A"}
              change={t('metricsDashboard.snapshot.latest_proposal')}
              changeType="positive"
              variant="snapshot"
              icon={<Users className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mt-8">
            <div className="space-y-4">
              <h3 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
                {latestProposal ? t('metricsDashboard.snapshot.last_proposal') : t('metricsDashboard.snapshot.no_active_proposals')}
              </h3>
              {latestProposal ? (
                <div className="p-5 rounded-xl border border-snapshot/15 bg-gradient-to-br from-snapshot/5 to-transparent">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">
                      {latestProposal.title}
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-snapshot/30"
                      asChild
                    >
                      <a
                        href={`https://snapshot.org/#/${currentSpace}/proposal/${latestProposal.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver en Snapshot
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {latestProposal.body?.substring(0, 200)}...
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Estado</span>
                      <span className="font-medium capitalize">{latestProposal.state}</span>
                    </div>
                    {latestProposal.quorum && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Quórum</span>
                          <span className="font-medium">
                            {latestProposal.scores_total && latestProposal.quorum 
                              ? `${Math.min(Math.round((latestProposal.scores_total / latestProposal.quorum) * 100), 100)}% / 100%`
                              : '0% / 100%'
                            }
                          </span>
                        </div>
                        <Progress 
                          value={latestProposal.scores_total && latestProposal.quorum 
                            ? Math.min((latestProposal.scores_total / latestProposal.quorum) * 100, 100) 
                            : 0
                          } 
                          className="h-2" 
                        />
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-snapshot/20 bg-gradient-to-br from-snapshot/5 to-transparent text-center">
                  <p className="text-muted-foreground">No hay propuestas activas en este momento</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">{t('metricsDashboard.snapshot.top_voters')}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-snapshot/30"
                  asChild
                >
                  <a
                    href={`https://snapshot.org/#/${currentSpace}/leaderboard`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('metricsDashboard.snapshot.see_all')}
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>
              <div className="space-y-3">
                {leaderboard.length === 0 && (
                  <div className="text-muted-foreground text-sm">No hay datos de leaderboard.</div>
                )}
                {leaderboard.slice(0, 5).map((user, idx) => (
                  <div
                    key={user.user}
                    className="p-3 rounded-lg border border-snapshot/10 bg-gradient-to-br from-snapshot/3 to-transparent flex items-center justify-between hover:border-snapshot/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-snapshot">{idx + 1}.</span>
                      <span className="font-mono text-xs">{user.user.slice(0, 6)}...{user.user.slice(-4)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium">{user.votesCount} votos</span>
                      <span className="text-xs text-muted-foreground">{user.proposalsCount} propuestas</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SnapshotSection;