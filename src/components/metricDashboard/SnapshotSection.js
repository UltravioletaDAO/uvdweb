import { useState, useEffect } from "react";
import { MetricCard } from "../MetricCard";
import { Button } from "../Button";
import { Progress } from "../Progress";
import { ExternalLink, Vote, FileText, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { SNAPSHOT_SPACES } from "../../lib/snapshotSpaces";
import { useSnapshotData } from "../../hooks/useSnapshotData";
import { useCombinedSnapshotData } from "../../hooks/useCombinedSnapshotData";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";

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

  const { metrics: combinedMetrics } = useCombinedSnapshotData();

  const [currentProposalIndex, setCurrentProposalIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [votersOffset, setVotersOffset] = useState(0);
  const [autoScrollVoters, setAutoScrollVoters] = useState(true);

  // Auto-rotate proposals carousel
  useEffect(() => {
    if (!autoRotate || proposals.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentProposalIndex((prev) => (prev + 1) % proposals.length);
    }, 5000);

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
    }, 3000);

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
      <div className="glass-panel p-8 border-red-500/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
              <div className="p-2 rounded-lg bg-snapshot/20">
                <Vote className="h-6 w-6 text-snapshot" />
              </div>
              Snapshot Governance
            </h2>
            <p className="text-gray-400 mt-2">
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
      {/* Header & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-snapshot/20 to-snapshot/5 border border-snapshot/20 shadow-lg shadow-snapshot/10">
              <Vote className="h-6 w-6 text-snapshot" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{t('home.metrics.snapshot.title')}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 ml-14 text-sm">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
              <FileText className="h-3.5 w-3.5 text-snapshot" />
              <span className="text-gray-400">{t('home.metrics.snapshot.proposals')}:</span>
              <span className="font-bold text-white">{combinedMetrics.proposals}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
              <Vote className="h-3.5 w-3.5 text-snapshot" />
              <span className="text-gray-400">{t('home.metrics.snapshot.votes')}:</span>
              <span className="font-bold text-white">{combinedMetrics.votes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
              <Users className="h-3.5 w-3.5 text-snapshot" />
              <span className="text-gray-400">{t('home.metrics.snapshot.followers')}:</span>
              <span className="font-bold text-white">{combinedMetrics.followers.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Space Selector Tabs */}
        <div className="glass-panel p-1 rounded-lg flex flex-wrap gap-1">
          {Object.values(SNAPSHOT_SPACES).map((space) => (
            <button
              key={space.id}
              onClick={() => handleSpaceChange(space.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${currentSpace === space.id
                ? "bg-snapshot text-white shadow-lg shadow-snapshot/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {space.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5"></div>
          ))}
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
              icon={<FileText className="h-5 w-5" />}
            />
            <MetricCard
              title={t('home.metrics.snapshot.votes')}
              value={metrics.votes.toLocaleString()}
              change={t('home.metrics.snapshot.proposals', { count: metrics.proposals })}
              changeType="neutral"
              variant="snapshot"
              icon={<Vote className="h-5 w-5" />}
            />
            <MetricCard
              title={t('home.metrics.snapshot.followers')}
              value={metrics.followers.toLocaleString()}
              change={t('home.metrics.snapshot.members_participating', { count: metrics.followers })}
              changeType="neutral"
              variant="snapshot"
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              title={t('metricsDashboard.snapshot.latest_proposal')}
              value={currentProposal && currentProposal.quorum ? currentProposal.quorum.toLocaleString() : "N/A"}
              change="Quorum"
              changeType="positive"
              variant="snapshot"
              icon={<Users className="h-5 w-5" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mt-8">

            {/* Active Proposal Card */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-snapshot"></span>
                  {currentProposal ? t('metricsDashboard.snapshot.last_proposal') : t('metricsDashboard.snapshot.no_active_proposals')}
                </h3>
                {hasMultipleProposals && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={goToPreviousProposal} className="h-8 w-8 p-0 rounded-full border border-white/10 hover:border-snapshot/50"><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={goToNextProposal} className="h-8 w-8 p-0 rounded-full border border-white/10 hover:border-snapshot/50"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>

              <div className="glass-card p-6 h-full min-h-[300px] flex flex-col justify-between relative group hover:border-snapshot/30 transition-all">
                {currentProposal ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-snapshot transition-colors">
                          {currentProposal.title}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${currentProposal.state === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-700/30 text-gray-400 border-gray-600/30'}`}>
                          {currentProposal.state}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-3 mb-4 leading-relaxed">
                        {currentProposal.body?.substring(0, 180)}...
                      </p>
                    </div>

                    <div className="bg-black/20 rounded-lg p-4 backdrop-blur-sm border border-white/5">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">{t('metricsDashboard.snapshot.quorum')}</span>
                        <span className="text-white font-bold">
                          {currentProposal.scores_total && currentProposal.quorum
                            ? `${Math.min(Math.round((currentProposal.scores_total / currentProposal.quorum) * 100), 100)}%`
                            : '0%'
                          }
                        </span>
                      </div>
                      <Progress
                        value={currentProposal.scores_total && currentProposal.quorum
                          ? Math.min((currentProposal.scores_total / currentProposal.quorum) * 100, 100)
                          : 0
                        }
                        className="h-2 bg-gray-700"
                        indicatorClassName="bg-snapshot"
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>{Math.floor(currentProposal.scores_total || 0).toLocaleString()} Votes</span>
                        <span>Target: {(currentProposal.quorum || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex space-x-1 overflow-hidden max-w-[60%]">
                        {proposals.slice(0, 15).map((_, idx) => (
                          <div
                            key={idx}
                            onClick={() => { setAutoRotate(false); setCurrentProposalIndex(idx); }}
                            className={`h-1.5 rounded-full cursor-pointer transition-all flex-shrink-0 ${idx === currentProposalIndex ? 'w-6 bg-snapshot' : 'w-1.5 bg-gray-700 hover:bg-gray-500'}`}
                          />
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 border-snapshot/30 text-snapshot hover:bg-snapshot/10 hover:text-white" asChild>
                        <a href={`https://snapshot.org/#/${currentSpace}/proposal/${currentProposal.id}`} target="_blank" rel="noreferrer">
                          {t('home.metrics.see_more')} <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="p-4 rounded-full bg-white/5 mb-4"><FileText className="h-8 w-8 text-gray-600" /></div>
                    <p className="text-gray-500 font-medium">{t('metricsDashboard.snapshot.no_proposals_message')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Voters */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">{t('metricsDashboard.snapshot.top_voters')}</h3>
                <a href={`https://snapshot.org/#/${currentSpace}/leaderboard`} target="_blank" rel="noreferrer" className="text-xs text-snapshot hover:text-white transition-colors flex items-center gap-1">
                  {t('metricsDashboard.snapshot.see_all')} <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="glass-card p-0 overflow-hidden h-[300px] relative" onMouseEnter={() => setAutoScrollVoters(false)} onMouseLeave={() => setAutoScrollVoters(true)}>
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background/80 to-transparent z-10 pointer-events-none"></div>

                {leaderboard.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">{t('metricsDashboard.snapshot.leaderboard_no_data')}</div>
                ) : (
                  <div className="p-4 space-y-2 transition-transform duration-700 ease-linear" style={{ transform: `translateY(-${votersOffset * 64}px)` }}>
                    {leaderboard.map((user, idx) => (
                      <div key={user.user} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-snapshot/30 hover:bg-snapshot/5 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-xs font-bold text-snapshot border border-white/10 shadow-inner">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-mono text-sm text-gray-300 group-hover:text-white transition-colors">{user.user.slice(0, 6)}...{user.user.slice(-4)}</div>
                            <div className="text-xs text-gray-500">{t('home.metrics.snapshot.votes')}: <span className="text-gray-300">{user.votesCount}</span></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-white group-hover:text-snapshot transition-colors">{user.proposalsCount}</div>
                          <div className="text-[10px] uppercase text-gray-500">Proposals</div>
                        </div>
                      </div>
                    ))}
                    {/* Duplicate for smooth infinite scroll if needed, but handled by offset logic for now */}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#030014] to-transparent z-10 pointer-events-none"></div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default SnapshotSection;