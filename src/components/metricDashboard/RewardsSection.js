import { MetricCard } from "../MetricCard";
import { Button } from "../Button";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Gift,
  RotateCcw,
  Users,
  DollarSign,
  Gamepad2,
} from "lucide-react";

const rewardDistributionData = [
  { name: "Ruletas", value: 65, color: "hsl(var(--token))" },
  { name: "Airdrops", value: 25, color: "hsl(var(--rewards))" },
];

const recentRewards = [
  {
    type: "Ruleta X",
    status: "Envio Exitoso",
    amount: "### UVD",
    timestamp: "Hace 5 min",
  },
  {
    type: "Airdrop Karma Hello",
    status: "Envio Exitoso",
    amount: "### UVD",
    timestamp: "Hace 3 dias",
  },
  {
    type: "Airdrop Karma Hello",
    status: "Envio Exitoso",
    amount: "### UVD",
    timestamp: "Hace 5 dias",
  },
  {
    type: "Ruleta X",
    status: "Envio Exitoso",
    amount: "### UVD",
    timestamp: "Hace 1 semana",
  },
];

export function RewardsSection() {
  return (
    <div className="space-y-6 mb-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rewards/20">
              <Gift className="h-6 w-6 text-rewards" />
            </div>
            Watch to Earn
          </h2>
          <p className="text-muted-foreground mt-1">
            Recompensas por participación y ruletas
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Usuarios Activos (Ruletas)"
          value="####"
          change="+### esta semana"
          changeType="positive"
          variant="rewards"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Reclamado (Ruletas)"
          value="####"
          description="UVD distribuidos"
          variant="rewards"
          icon={<RotateCcw className="h-4 w-4" />}
        />
        <MetricCard
          title="Airdrops Entregados"
          value="####"
          change="+# este mes"
          changeType="positive"
          variant="rewards"
          icon={<Gift className="h-4 w-4" />}
        />
        <MetricCard
          title="Monto Total Emitido"
          value="#### UVD"
          description="~$####"
          variant="rewards"
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Información de Ruletas
            </h3>
            <div className="p-6 rounded-lg border border-rewards/20 bg-gradient-to-br from-rewards/5 to-transparent">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Límite Diario de Ruletas
                </span>
                <span className="text-sm font-bold">#### UVD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cooldown Ruleta</span>
                <span className="text-sm font-bold">1 semana (todos los viernes)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Min/Max Recompensa</span>
                <span className="text-sm font-bold">##-## UVD</span>
              </div>
            </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tipos de Ruletas Activas</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg border border-rewards/20 bg-gradient-to-br from-rewards/5 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-rewards/20">
                    <Gamepad2 className="h-4 w-4 text-rewards" />
                  </div>
                  <h4 className="font-medium">Ruleta X</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ultimos Participantes</span>
                    <span className="font-medium">####</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Recompensa Promedio</span>
                    <span className="font-medium">### UVD</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-rewards/20 bg-gradient-to-br from-rewards/5 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-rewards/20">
                    <Gamepad2 className="h-4 w-4 text-rewards" />
                  </div>
                  <h4 className="font-medium">Ruleta Y</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ultimos Participantes</span>
                    <span className="font-medium">####</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Recompensa Promedio</span>
                    <span className="font-medium">### UVD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Distribución de Recompensas
            </h3>
            <div className="p-6 rounded-lg border border-rewards/20 bg-gradient-to-br from-rewards/5 to-transparent">
              <div className="h-32 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rewardDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {rewardDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {rewardDistributionData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="flex-1">{item.name}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Actividad Reciente</h3>
            <div className="space-y-3">
              {recentRewards.map((reward, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-rewards/20 bg-gradient-to-br from-rewards/5 to-transparent"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{reward.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {reward.status}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-rewards">
                        {reward.amount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {reward.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full border-rewards/30 text-rewards"
            >
              Ver Histórico Completo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
