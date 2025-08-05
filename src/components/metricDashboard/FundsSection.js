import { MetricCard } from "../MetricCard";
import { Button } from "../Button";
import { useSafeAvalanche } from "../../hooks/useSafeAvalanche";

import {
  Wallet,
  ExternalLink,
  Shield,
  Users,
} from "lucide-react";

export function FundsSection() {
  const { owners, threshold, fiatTotal, tokens, error } = useSafeAvalanche();

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-funds/20">
              <Wallet className="h-6 w-6 text-funds" />
            </div>
            Fondos y Finanzas
          </h2>
          <p className="text-muted-foreground mt-1">
            Actividad de la gestión del tesoro comunitario
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Multisig Avalanche"
          value={`$${fiatTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          variant="funds"
          icon={<Shield className="h-4 w-4" />}
        />
        <MetricCard
          title="Multifirmantes (Avalanche)"
          value={owners.length}
          change={`${threshold} firmas requeridas`}
          changeType="positive"
          variant="funds"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Multisig Solana"
          value="0 SOL"
          variant="funds"
          icon={<Shield className="h-4 w-4" />}
        />
        <MetricCard
          title="Multifirmantes (Solana)"
          value="10"
          change="6 firmas requeridas"
          changeType="positive"
          variant="funds"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Multisig Avalanche</h3>
          <div className="p-6 rounded-lg border border-funds/20 bg-gradient-to-br from-funds/5 to-transparent">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Saldo Principal</span>
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
              {tokens.slice(0, 5).map((token, idx) => (
                <li
                  key={token.tokenInfo.address + idx}
                  className="flex items-center justify-between p-3 rounded bg-background/50 hover:bg-funds/10 transition"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={token.tokenInfo.logoUri}
                      alt={token.tokenInfo.symbol}
                      className="w-6 h-6 rounded-full border"
                      onError={e => {
                        e.target.onerror = null; 
                        e.target.src = "/tokenPlaceholder.svg";
                      }}
                    />
                    <span className="font-medium">{token.tokenInfo.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      {token.tokenInfo.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
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
          <h3 className="text-lg font-semibold">Multisig Solana</h3>
          <div className="p-6 rounded-lg border border-funds/20 bg-gradient-to-br from-funds/5 to-transparent">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Saldo Principal</span>
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
                <div className="flex justify-between items-center p-3 rounded bg-background/50">
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
