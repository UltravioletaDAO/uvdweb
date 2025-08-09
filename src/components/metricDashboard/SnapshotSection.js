import { useState, useEffect } from "react";
import { MetricCard } from "../MetricCard";
import { Button } from "../Button";
import { Progress } from "../Progress";
import { ExternalLink, Vote, FileText, Users, ChevronLeft, ChevronRight } from "lucide-react";
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
    proposals,
    leaderboard,
    handleSpaceChange,
    loadSpaceData,
  } = useSnapshotData();

  const [currentProposalIndex, setCurrentProposalIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [votersOffset, setVotersOffset] = useState(0);
  const [autoScrollVoters, setAutoScrollVoters] = useState(true);

  // Auto-rotate proposals carousel
  useEffect(() => {
    if (!autoRotate || proposals.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentProposalIndex((prev) => (prev + 1) % proposals.length);
    }, 5000); // Change proposal every 5 seconds

    return () => clearInterval(interval);
  }, [autoRotate, proposals.length]);

  // Auto-scroll voters
  useEffect(() => {
    if (!autoScrollVoters || leaderboard.length <= 5) return;

    const interval = setInterval(() => {
      setVotersOffset((prev) => {
        const maxOffset = Math.max(0, leaderboard.length - 5);
        return prev >= maxOffset ? 0 : prev + 1;
      });
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(interval);
  }, [autoScrollVoters, leaderboard.length]);

  const currentProposal = proposals[currentProposalIndex] || null;
  const hasMultipleProposals = proposals.length > 1;

  const goToPreviousProposal = () => {
    setAutoRotate(false);
    setCurrentProposalIndex((prev) => 
      prev === 0 ? proposals.length - 1 : prev - 1
    );
  };

  const goToNextProposal = () => {
    setAutoRotate(false);
    setCurrentProposalIndex((prev) => 
      (prev + 1) % proposals.length
    );
  };

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
            <span className="text-snapshot">{t('home.metrics.snapshot.title')}</span>
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
              title={t('home.metrics.snapshot.proposals')}
              value={metrics.proposals}
              change={t('metricsDashboard.snapshot.total_historic')}
              changeType="neutral"
              variant="snapshot"
              icon={<FileText className="h-4 w-4" />}
            />
            <MetricCard
              title={t('home.metrics.snapshot.votes')}
              value={metrics.votes.toLocaleString()}
              change={t('home.metrics.snapshot.proposals', { count: metrics.proposals })}
              changeType="neutral"
              variant="snapshot"
              icon={<Vote className="h-4 w-4" />}
            />
            <MetricCard
              title={t('home.metrics.snapshot.followers')}
              value={metrics.followers.toLocaleString()}
              change={t('home.metrics.snapshot.members_participating', { count: metrics.followers })}
              changeType="neutral"
              variant="snapshot"
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard
              title={t('metricsDashboard.snapshot.latest_proposal')}
              value={currentProposal && currentProposal.quorum ? currentProposal.quorum.toLocaleString() : "N/A"}
              change={t('metricsDashboard.snapshot.latest_proposal')}
              changeType="positive"
              variant="snapshot"
              icon={<Users className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mt-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
                  {currentProposal ? t('metricsDashboard.snapshot.last_proposal') : t('metricsDashboard.snapshot.no_active_proposals')}
                </h3>
                {hasMultipleProposals && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToPreviousProposal}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground px-2">
                      {currentProposalIndex + 1} / {proposals.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToNextProposal}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {currentProposal ? (
                <div className="p-5 rounded-xl border border-snapshot/15 bg-gradient-to-br from-snapshot/5 to-transparent transition-all duration-500">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">
                      {currentProposal.title}
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-snapshot/30"
                      asChild
                    >
                   <a
                        href={`https://snapshot.org/#/${currentSpace}/proposal/${currentProposal.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('home.metrics.see_more')}
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {currentProposal.body?.substring(0, 200)}...
                  </p>
                  <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t('metricsDashboard.snapshot.state')}</span>
                      <span className="font-medium capitalize">{currentProposal.state}</span>
                    </div>
                    {currentProposal.quorum && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>{t('metricsDashboard.snapshot.quorum')}</span>
                          <span className="font-medium">
                            {currentProposal.scores_total && currentProposal.quorum 
                              ? `${Math.min(Math.round((currentProposal.scores_total / currentProposal.quorum) * 100), 100)}% / 100%`
                              : '0% / 100%'
                            }
                          </span>
                        </div>
                        <Progress 
                          value={currentProposal.scores_total && currentProposal.quorum 
                            ? Math.min((currentProposal.scores_total / currentProposal.quorum) * 100, 100) 
                            : 0
                          } 
                          className="h-2" 
                        />
                      </>
                    )}
                  </div>
                  {hasMultipleProposals && (
                    <div className="flex items-center justify-center mt-4 gap-1">
                      {proposals.map((_, index) => (
                        <button
                          key={index}
                          className={`h-1.5 transition-all duration-300 rounded-full ${
                            index === currentProposalIndex 
                              ? 'w-6 bg-snapshot' 
                              : 'w-1.5 bg-snapshot/30 hover:bg-snapshot/50'
                          }`}
                          onClick={() => {
                            setAutoRotate(false);
                            setCurrentProposalIndex(index);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-snapshot/20 bg-gradient-to-br from-snapshot/5 to-transparent text-center">
                  <p className="text-muted-foreground">{t('metricsDashboard.snapshot.no_active_proposals')}</p>
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
              <div 
                className="space-y-3 overflow-hidden relative"
                onMouseEnter={() => setAutoScrollVoters(false)}
                onMouseLeave={() => setAutoScrollVoters(true)}
              >
                  {leaderboard.length === 0 && (
                  <div className="text-muted-foreground text-sm">{t('metricsDashboard.snapshot.leaderboard_no_data')}</div>
                )}
                <div className="transition-transform duration-500 ease-in-out" style={{ transform: `translateY(-${votersOffset * 60}px)` }}>
                  {leaderboard.map((user, idx) => (
                    <div
                      key={user.user}
                      className="p-3 rounded-lg border border-snapshot/10 bg-gradient-to-br from-snapshot/3 to-transparent flex items-center justify-between hover:border-snapshot/20 transition-colors h-[52px]"
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
                {leaderboard.length > 5 && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SnapshotSection;