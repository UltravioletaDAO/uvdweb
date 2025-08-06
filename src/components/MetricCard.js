import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { cn } from "../lib/utils";

const variantStyles = {
  snapshot: "border-snapshot/15 bg-gradient-to-br from-snapshot/5 via-snapshot/3 to-transparent",
  token: "border-token/15 bg-gradient-to-br from-token/5 via-token/3 to-transparent",
  funds: "border-funds/15 bg-gradient-to-br from-funds/5 via-funds/3 to-transparent",
  community: "border-community/15 bg-gradient-to-br from-community/5 via-community/3 to-transparent",
  rewards: "border-rewards/15 bg-gradient-to-br from-rewards/5 via-rewards/3 to-transparent",
  default: "border-border",
};

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  description,
  className,
  variant = "default",
}) {
  const changeColors = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-muted-foreground",
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        variantStyles[variant],
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground opacity-60">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value}</div>
        {change && (
          <p className={cn("text-xs mt-1", changeColors[changeType])}>{change}</p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
