import { MetricCard } from "../MetricCard";
import { Button } from "../Button";
import { useSafeAvalanche } from "../../hooks/useSafeAvalanche";
import { useTranslation } from 'react-i18next';

import {
  Wallet,
  ExternalLink,
  Shield,
  Users,
  CreditCard,
  ArrowRight
} from "lucide-react";

export function FundsSection() {
  const { t } = useTranslation();
  const { owners, threshold, fiatTotal, tokens, error } = useSafeAvalanche();

  if (error) return <div className="p-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">Error loading Funds data: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-funds/20 to-funds/5 border border-funds/20 shadow-lg shadow-funds/10">
              <Wallet className="h-6 w-6 text-funds" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{t('home.metrics.funds.title') || 'FUNDS & FINANCE'}</h2>
          </div>
          <p className="text-sm text-gray-400 ml-14 max-w-2xl">
            {t('metricsDashboard.funds.subtitle')}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('home.metrics.funds.multisig')}
          value={`$${fiatTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          change={`${owners.length} Signers`}
          changeType="positive"
          variant="funds"
          icon={<Shield className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.funds.required_signatures_avax')}
          value={`${threshold}/${owners.length}`}
          change="Consensus"
          changeType="neutral"
          variant="funds"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.funds.multisig_solana')}
          value="$0"
          description="Pending Funding"
          changeType="neutral"
          variant="funds"
          icon={<Shield className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.funds.required_signatures_sol')}
          value="6/10"
          change="Consensus"
          changeType="neutral"
          variant="funds"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mt-8">

        {/* Avalanche Treasury */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">{t('metricsDashboard.funds.multisig_avalanche')}</h3>
            <a href="https://app.safe.global/balances?safe=avax:0x52110a2Cc8B6bBf846101265edAAe34E753f3389" target="_blank" rel="noreferrer" className="text-xs text-funds hover:text-white transition-colors flex items-center gap-1">
              View Safe <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="glass-panel p-0 overflow-hidden">
            <div className="bg-funds/10 p-4 border-b border-funds/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-funds/20 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-funds" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Community Vault</div>
                  <div className="text-xs text-gray-400">Avalanche Chain</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">${fiatTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {tokens
                .filter(token => Number(token.fiatBalance) >= 1)
                .slice(0, 5)
                .map((token, idx) => (
                  <div
                    key={token.tokenInfo.address + idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-funds/30 hover:bg-funds/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={token.tokenInfo.logoUri}
                          alt={token.tokenInfo.symbol}
                          className="w-8 h-8 rounded-full bg-gray-800 object-cover"
                          onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/32x32?text=?"; }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0B0F19]"></div>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-200 group-hover:text-white">{token.tokenInfo.symbol}</div>
                        <div className="text-xs text-gray-500">{token.tokenInfo.name}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-sm text-white">
                        {(Number(token.balance) / 10 ** token.tokenInfo.decimals).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-funds">
                        ${Number(token.fiatBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}

              {tokens.length > 5 && (
                <div className="text-center pt-2">
                  <span className="text-xs text-gray-500">+{tokens.length - 5} more assets</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Solana Treasury */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">{t('metricsDashboard.funds.multisig_solana') || 'Multisig Solana'}</h3>
            <a href="https://app.squads.so/squads/6ye76CffLefSQa9zbfGRDReQekm2deFTYNYh5953B6yi/treasury/6ye76CffLefSQa9zbfGRDReQekm2deFTYNYh5953B6yi" target="_blank" rel="noreferrer" className="text-xs text-funds hover:text-white transition-colors flex items-center gap-1">
              View Squads <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="glass-panel p-0 overflow-hidden h-full">
            <div className="bg-purple-500/10 p-4 border-b border-purple-500/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Solana Treasury</div>
                  <div className="text-xs text-gray-400">Solana Chain</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">$0</div>
              </div>
            </div>

            <div className="p-4 flex flex-col items-center justify-center h-[200px] text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <Wallet className="h-6 w-6 text-gray-600" />
              </div>
              <p className="text-gray-400 text-sm mb-4">No assets detected yet</p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://app.squads.so/squads/6ye76CffLefSQa9zbfGRDReQekm2deFTYNYh5953B6yi/treasury/6ye76CffLefSQa9zbfGRDReQekm2deFTYNYh5953B6yi" target="_blank" rel="noreferrer">
                  Manage on Squads
                </a>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
