import { MetricCard } from "../MetricCard";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <div className="space-y-6 mb-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rewards/20">
              <Gift className="h-6 w-6 text-rewards" />
            </div>
            {t('metricsDashboard.rewards.title')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('metricsDashboard.rewards.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('metricsDashboard.rewards.cards.active_users')}
          value="####"
          change="+###"
          changeType="positive"
          variant="rewards"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.rewards.cards.total_claimed')}
          value="####"
          description={t('metricsDashboard.rewards.cards.uvd_distributed')}
          variant="rewards"
          icon={<RotateCcw className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.rewards.cards.airdrops_delivered')}
          value="####"
          change="+#"
          changeType="positive"
          variant="rewards"
          icon={<Gift className="h-4 w-4" />}
        />
        <MetricCard
          title={t('metricsDashboard.rewards.cards.total_emitted')}
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
              {t('metricsDashboard.rewards.info.title')}
            </h3>
            <div className="p-6 rounded-lg border border-rewards/20 bg-gradient-to-br from-rewards/5 to-transparent">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {t('metricsDashboard.rewards.info.daily_limit')}
                </span>
                <span className="text-sm font-bold">#### UVD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('metricsDashboard.rewards.info.cooldown')}</span>
                <span className="text-sm font-bold">{t('metricsDashboard.rewards.info.cooldown_value')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('metricsDashboard.rewards.info.min_max_reward')}</span>
                <span className="text-sm font-bold">##-## UVD</span>
              </div>
            </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('metricsDashboard.rewards.types.title')}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg border border-rewards/20 bg-gradient-to-br from-rewards/5 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-rewards/20">
                    <Gamepad2 className="h-4 w-4 text-rewards" />
                  </div>
                  <h4 className="font-medium">{t('metricsDashboard.rewards.types.roulette_x')}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('metricsDashboard.rewards.types.last_participants')}</span>
                    <span className="font-medium">####</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('metricsDashboard.rewards.types.avg_reward')}</span>
                    <span className="font-medium">### UVD</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-rewards/20 bg-gradient-to-br from-rewards/5 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-rewards/20">
                    <Gamepad2 className="h-4 w-4 text-rewards" />
                  </div>
                  <h4 className="font-medium">{t('metricsDashboard.rewards.types.roulette_y')}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('metricsDashboard.rewards.types.last_participants')}</span>
                    <span className="font-medium">####</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('metricsDashboard.rewards.types.avg_reward')}</span>
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
              {t('metricsDashboard.rewards.distribution.title')}
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
                    <span className="flex-1">{index === 0 ? t('metricsDashboard.rewards.distribution.ruletas') : t('metricsDashboard.rewards.distribution.airdrops')}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('metricsDashboard.rewards.recent_activity.title')}</h3>
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
              {t('metricsDashboard.rewards.recent_activity.view_history')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
