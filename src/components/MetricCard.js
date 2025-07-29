import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { cn } from "../lib/utils";

const variantStyles = {
  snapshot: "border-snapshot/20 bg-gradient-to-br from-snapshot/10 to-transparent",
  token: "border-token/20 bg-gradient-to-br from-token/10 to-transparent",
  funds: "border-funds/20 bg-gradient-to-br from-funds/10 to-transparent",
  community: "border-community/20 bg-gradient-to-br from-community/10 to-transparent",
  rewards: "border-rewards/20 bg-gradient-to-br from-rewards/10 to-transparent",
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn("text-xs", changeColors[changeType])}>{change}</p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
