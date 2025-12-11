import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { cn } from "../lib/utils";

const variantStyles = {
  snapshot: "border-snapshot/30 bg-snapshot/5 hover:border-snapshot/50 shadow-[0_0_15px_rgba(242,153,74,0.1)] hover:shadow-[0_0_20px_rgba(242,153,74,0.2)]",
  token: "border-token/30 bg-token/5 hover:border-token/50 shadow-[0_0_15px_rgba(156,39,176,0.1)] hover:shadow-[0_0_20px_rgba(156,39,176,0.2)]",
  funds: "border-funds/30 bg-funds/5 hover:border-funds/50 shadow-[0_0_15px_rgba(39,174,96,0.1)] hover:shadow-[0_0_20px_rgba(39,174,96,0.2)]",
  community: "border-community/30 bg-community/5 hover:border-community/50 shadow-[0_0_15px_rgba(45,156,219,0.1)] hover:shadow-[0_0_20px_rgba(45,156,219,0.2)]",
  rewards: "border-rewards/30 bg-rewards/5 hover:border-rewards/50 shadow-[0_0_15px_rgba(235,87,87,0.1)] hover:shadow-[0_0_20px_rgba(235,87,87,0.2)]",
  default: "border-border/50 bg-background/50 hover:border-ultraviolet/50",
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
    positive: "text-green-400 font-medium",
    negative: "text-red-400 font-medium",
    neutral: "text-gray-400",
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden backdrop-blur-md transition-all duration-300 group",
        variantStyles[variant],
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-white transition-colors">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {(change || description) && (
          <div className={cn(
            "text-xs pt-3 mt-3 border-t",
            "border-white/5 group-hover:border-white/10 transition-colors"
          )}>
            {change && (
              <div className={cn("flex items-center gap-1", changeColors[changeType])}>
                {change}
              </div>
            )}
            {description && (
              <div className="text-gray-400 mt-1">{description}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
