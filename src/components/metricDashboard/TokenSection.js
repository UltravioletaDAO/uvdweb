import { MetricCard } from "../MetricCard";
import { Button } from "../Button";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Coins, TrendingUp, Users, Activity, ExternalLink, Flame, ArrowUpRight } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useTokenMetrics } from "../../hooks/useTokenMetrics";
import { usePriceHistory } from "../../hooks/usePriceEvolution";

const TokenSection = () => {
  const { t } = useTranslation();
  const data = useTokenMetrics();
  const { uvdPerAvax, uvdPerUsdc } = useTokenMetrics();
  const { history: priceHistory, priceChange30d } = usePriceHistory();

  if (data.error) return <div className="p-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">Error loading Token data: {data.error}</div>;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 border border-white/10 p-3 rounded-lg backdrop-blur-md shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          <p className="text-token font-bold text-sm">
            ${payload[0].value.toFixed(4)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-token/20 to-token/5 border border-token/20 shadow-lg shadow-token/10">
              <Coins className="h-6 w-6 text-token" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{t('home.metrics.token.title_full')}</h2>
          </div>
          <p className="text-sm text-gray-400 ml-14 max-w-2xl">
            {t('metricsDashboard.tokenSection.subtitle')}
          </p>
        </div>
        <Button variant="glow" size="sm" className="hidden sm:inline-flex" asChild>
          <a href="https://lfj.gg/avalanche/swap?outputCurrency=AVAX&inputCurrency=0x4Ffe7e01832243e03668E090706F17726c26d6B2" target="_blank" rel="noreferrer">
            Buy UVD <ArrowUpRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
          change={`${data.totalTransactions.toLocaleString()} txs`}
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
        <MetricCard
          title={t('metricsDashboard.tokenSection.burned_total')}
          value={data.totalBurnedTokens ? `${data.totalBurnedTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '0'}
          change={t('metricsDashboard.tokenSection.burned_forever')}
          changeType="negative"
          variant="token"
          icon={<Flame className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3 mt-8">

        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">{t('metricsDashboard.tokenSection.price_evolution')}</h3>
            <div className="flex items-center gap-2 text-sm bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <span className="text-gray-400">30 Days</span>
              <span className={`font-bold ${priceChange30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange30d > 0 ? '+' : ''}{priceChange30d.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="glass-panel p-6 h-[350px] relative w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--token))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--token))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#fff", stroke: "#8B5CF6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info & Stats Column */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-1">{t('metricsDashboard.tokenSection.info_title')}</h3>

          {/* Contract Address */}
          <div className="glass-card p-4 hover:border-token/30 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-token uppercase">Contract</span>
              <a href="https://snowscan.xyz/token/0x4Ffe7e01832243e03668E090706F17726c26d6B2" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <code className="text-xs text-gray-300 font-mono break-all block bg-black/30 p-2 rounded border border-white/5 select-all">
              0x4Ffe7e01832243e03668E090706F17726c26d6B2
            </code>
          </div>

          {/* Supply Stats */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-gray-400">{t('metricsDashboard.tokenSection.total_supply')}</span>
              <span className="text-sm font-bold text-white tracking-wide">{data.totalSupply.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-gray-400">{t('metricsDashboard.tokenSection.circulating_supply')}</span>
              <span className="text-sm font-bold text-white tracking-wide">{data.circulatingSupply.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-gray-400">{t('metricsDashboard.tokenSection.market_cap')}</span>
              <span className="text-sm font-bold text-white tracking-wide">${data.marketCap.toLocaleString()}</span>
            </div>
          </div>

          {/* DEX Links */}
          <div className="glass-card p-4">
            <span className="text-xs font-bold uppercase text-gray-500 mb-3 block">{t('metricsDashboard.tokenSection.view_on_dex')}</span>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" className="w-full justify-between group hover:border-token/50" asChild>
                <a href="https://lfj.gg/avalanche/swap?outputCurrency=AVAX&inputCurrency=0x4Ffe7e01832243e03668E090706F17726c26d6B2" target="_blank" rel="noreferrer">
                  LFJ <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                </a>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-between group hover:border-token/50" asChild>
                <a href="https://arena.trade/token/0x4ffe7e01832243e03668e090706f17726c26d6b2" target="_blank" rel="noreferrer">
                  Arena <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                </a>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TokenSection;
