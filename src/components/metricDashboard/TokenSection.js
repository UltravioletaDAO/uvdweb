import { MetricCard } from "../MetricCard";
import { Button } from "../Button";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Coins, TrendingUp, Users, Activity, ExternalLink } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useTokenMetrics } from "../../hooks/useTokenMetrics";
import { usePriceHistory } from "../../hooks/usePriceEvolution";

const TokenSection = () => {
  const { t } = useTranslation();
  const data = useTokenMetrics();
  const { uvdPerAvax, uvdPerUsdc } = useTokenMetrics();
  const { history: priceHistory, priceChange30d } = usePriceHistory();

  if (data.error) return <div>Error: {data.error}</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-token/15">
              <Coins className="h-5 w-5 text-token" />
            </div>
            <span className="text-token">{t('home.metrics.token.title_full')}</span>
          </h2>
          <p className="text-sm text-muted-foreground ml-11">
            {t('metricsDashboard.tokenSection.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('metricsDashboard.tokenSection.price_usd')}
          value={`${parseFloat(uvdPerUsdc).toLocaleString()} UVD`}
          change="= $1 USD"
          changeType="neutral"
          variant="token"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.tokenSection.price_avax')}
          value={`${parseFloat(uvdPerAvax).toLocaleString()} UVD`}
          change="= 1 AVAX"
          changeType="neutral"
          variant="token"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.tokenSection.holders')}
          value={data.holderCount.toLocaleString()}
          change={`${data.totalTransactions.toLocaleString()} transacciones`}
          changeType="neutral"
          variant="token"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.tokenSection.liquidity_total')}
          value={`$${parseFloat(data.liquidity).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          change={`${data.liquidity && data.priceNative && data.priceUsd ? Math.floor(parseFloat(data.liquidity) / (parseFloat(data.priceUsd) / parseFloat(data.priceNative))).toLocaleString() : '0'} AVAX`}
          changeType="positive"
          variant="token"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        <div className="space-y-4">
          <h3 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">{t('metricsDashboard.tokenSection.price_evolution')}</h3>
          <div className="p-5 rounded-xl border border-token/15 bg-gradient-to-br from-token/5 to-transparent">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistory}>
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--token))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm">
              <span className="text-muted-foreground">{t('metricsDashboard.tokenSection.days_ago_30')}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {priceChange30d.toFixed(2)}%
                </span>
              </div>
              <span className="text-muted-foreground">{t('metricsDashboard.tokenSection.today')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">{t('metricsDashboard.tokenSection.info_title')}</h3>
          <div className="space-y-2">
            <div className="p-3 rounded-lg border border-token/10 bg-gradient-to-br from-token/3 to-transparent">
              <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium uppercase text-muted-foreground">{t('metricsDashboard.tokenSection.contract_avalanche')}</span>
                <Button variant="ghost" size="sm" className="h-6 p-1" asChild>
                  <a
                    href="https://snowscan.xyz/token/0x4Ffe7e01832243e03668E090706F17726c26d6B2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
              <code className="text-xs text-muted-foreground break-all">
                0x4Ffe...d6B2
              </code>
            </div>

            <div className="p-4 rounded-lg border border-token/10 bg-gradient-to-br from-token/3 to-transparent">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('metricsDashboard.tokenSection.total_supply')}</span>
                  <span className="text-sm font-semibold">
                    {data.totalSupply.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('metricsDashboard.tokenSection.circulating_supply')}</span>
                  <span className="text-sm font-semibold">
                    {data.circulatingSupply.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('metricsDashboard.tokenSection.burned_supply')}</span>
                  <span className="text-sm font-semibold">
                    {data.burnedSupply.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('metricsDashboard.tokenSection.market_cap')}</span>
                  <span className="text-sm font-semibold">
                    ${data.marketCap.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-token/10 bg-gradient-to-br from-token/3 to-transparent">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium uppercase text-muted-foreground">{t('metricsDashboard.tokenSection.view_on_dex')}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-6 p-1" asChild>
                    <a
                      href="https://lfj.gg/avalanche/swap?outputCurrency=AVAX&inputCurrency=0x4Ffe7e01832243e03668E090706F17726c26d6B2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('metricsDashboard.tokenSection.lfj')}
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 p-1" asChild>
                    <a
                      href="https://arena.trade/token/0x4ffe7e01832243e03668e090706f17726c26d6b2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('metricsDashboard.tokenSection.arena_trade')}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSection;
