import { MetricCard } from "../MetricCard";
import { Button } from "../Button";
import { useSafeAvalanche } from "../../hooks/useSafeAvalanche";
import { useTranslation } from 'react-i18next';

import {
  Wallet,
  ExternalLink,
  Shield,
  Users,
} from "lucide-react";

export function FundsSection() {
  const { t } = useTranslation();
  const { owners, threshold, fiatTotal, tokens, error } = useSafeAvalanche();

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-funds/15">
              <Wallet className="h-5 w-5 text-funds" />
            </div>
            <span className="text-funds">{t('home.metrics.funds.title') || 'FUNDS & FINANCE'}</span>
          </h2>
          <p className="text-sm text-muted-foreground ml-11">
            {t('metricsDashboard.funds.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('home.metrics.funds.multisig')}
          value={`$${fiatTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          change={`${owners.length} ${t('home.metrics.funds.signers') || 'multisigners'}`}
          changeType="positive"
          variant="funds"
          icon={<Shield className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.funds.required_signatures_avax')}
          value={`${threshold}/${owners.length}`}
          change={t('metricsDashboard.funds.to_execute_transactions')}
          changeType="neutral"
          variant="funds"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.funds.multisig_solana')}
          value="$0"
          change={`10 ${t('home.metrics.funds.signers') || 'multisigners'}`}
          changeType="neutral"
          variant="funds"
          icon={<Shield className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.funds.required_signatures_sol')}
          value="6/10"
          change={t('metricsDashboard.funds.to_execute_transactions')}
          changeType="neutral"
          variant="funds"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        <div className="space-y-4">
          <h3 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">{t('metricsDashboard.funds.multisig_avalanche')}</h3>
          <div className="p-5 rounded-xl border border-funds/15 bg-gradient-to-br from-funds/5 to-transparent">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <span className="font-medium">{t('home.metrics.funds.community_vault')}</span>
                <Button variant="ghost" size="sm" className="h-6 p-1" asChild>
                  <a
                    href="https://app.safe.global/balances?safe=avax:0x52110a2Cc8B6bBf846101265edAAe34E753f3389"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>

              <div className="space-y-3">
              <ul className="space-y-2">
              {tokens
                .filter(token => Number(token.fiatBalance) >= 1)
                .slice(0, 5)
                .map((token, idx) => (
                <li
                  key={token.tokenInfo.address + idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-background/50 hover:bg-funds/10 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <img
                      src={token.tokenInfo.logoUri}
                      alt={token.tokenInfo.symbol}
                      className="w-6 h-6 rounded-full border flex-shrink-0"
                      onError={e => {
                        e.target.onerror = null; 
                        e.target.src = "/tokenPlaceholder.svg";
                      }}
                    />
                    <span className="font-medium flex-shrink-0">{token.tokenInfo.symbol}</span>
                    <span className="text-xs text-muted-foreground truncate hidden sm:block">
                      {token.tokenInfo.name}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-sm sm:text-base">
                      {(Number(token.balance) / 10 ** token.tokenInfo.decimals).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${Number(token.fiatBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">{t('metricsDashboard.funds.multisig_solana') || 'Multisig Solana'}</h3>
          <div className="p-5 rounded-xl border border-funds/15 bg-gradient-to-br from-funds/5 to-transparent">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('home.metrics.funds.community_vault')}</span>
                <Button variant="ghost" size="sm" className="h-6 p-1" asChild>
                  <a
                    href="https://app.squads.so/squads/6ye76CffLefSQa9zbfGRDReQekm2deFTYNYh5953B6yi/treasury/6ye76CffLefSQa9zbfGRDReQekm2deFTYNYh5953B6yi"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-background/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">
                      S
                    </div>
                    <span className="font-medium">SOL</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">0</div>
                    <div className="text-xs text-muted-foreground">
                      ~$0
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
