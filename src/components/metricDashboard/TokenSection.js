import { MetricCard } from "../MetricCard";
import { Button } from "../Button";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Coins, TrendingUp, Users, Activity, ExternalLink } from "lucide-react";
import { useTokenMetrics } from "../../hooks/useTokenMetrics";
import { usePriceHistory } from "../../hooks/usePriceEvolution";

const TokenSection = () => {
  const data = useTokenMetrics();
  const { history: priceHistory, priceChange30d } = usePriceHistory();

  if (data.error) return <div>Error: {data.error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-token/20">
              <Coins className="h-6 w-6 text-token" />
            </div>
            Token UVD
          </h2>
          <p className="text-muted-foreground mt-1">
            Actividad y métricas del UVD token
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="1 AVAX ="
          value={`${data.priceNative ? Math.floor(1 / parseFloat(data.priceNative)).toLocaleString() : '0'} UVD`}
          change={`${data.priceChange24h > 0 ? "+" : ""}${
            data.priceChange24h
          }% 24h`}
          changeType={
            parseFloat(data.priceChange24h) > 0
              ? "positive"
              : parseFloat(data.priceChange24h) < 0
              ? "negative"
              : "neutral"
          }
          variant="token"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="1 USD ="
          value={`${data.priceUsd ? Math.floor(1 / parseFloat(data.priceUsd)).toLocaleString() : '0'} UVD`}
          change={`${data.priceChange24h > 0 ? "+" : ""}${
            data.priceChange24h
          }% 24h`}
          changeType={
            parseFloat(data.priceChange24h) > 0
              ? "positive"
              : parseFloat(data.priceChange24h) < 0
              ? "negative"
              : "neutral"
          }
          variant="token"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Holders"
          value={data.holderCount.toLocaleString()}
          variant="token"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Total de Transacciones"
          value={
            typeof data.totalTransactions === "number"
              ? data.totalTransactions.toLocaleString()
              : "N/A"
          }
          variant="token"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Evolución del Precio</h3>
          <div className="p-6 rounded-lg border border-token/20 bg-gradient-to-br from-token/5 to-transparent">
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
              <span className="text-muted-foreground">30 días atrás</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {priceChange30d.toFixed(2)}%
                </span>
              </div>
              <span className="text-muted-foreground">Hoy</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Información del Token</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-token/20 bg-gradient-to-br from-token/5 to-transparent">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Contract Avalanche</span>
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

            <div className="p-4 rounded-lg border border-token/20 bg-gradient-to-br from-token/5 to-transparent">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Supply</span>
                  <span className="text-sm font-medium">
                    {data.totalSupply.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Supply Circulando</span>
                  <span className="text-sm font-medium">
                    {data.circulatingSupply.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Market Cap</span>
                  <span className="text-sm font-medium">
                    ${data.marketCap.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Liquidez LP Total</span>
                  <span className="text-sm font-medium">
                    ${data.liquidity.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-token/20 bg-gradient-to-br from-token/5 to-transparent">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Ver en DEX</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-6 p-1" asChild>
                    <a
                      href="https://lfj.gg/avalanche/swap?outputCurrency=AVAX&inputCurrency=0x4Ffe7e01832243e03668E090706F17726c26d6B2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LFJ
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 p-1" asChild>
                    <a
                      href="https://arena.trade/token/0x4ffe7e01832243e03668e090706f17726c26d6b2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ArenaTrade
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
