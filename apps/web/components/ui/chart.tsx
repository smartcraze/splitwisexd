"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = {
  [key: string]: {
    theme?: Record<string, string>;
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

const ChartContext = React.createContext<{
  config: ChartConfig;
} | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, config, children, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-grid-horizontal_line]:stroke-border/40 [&_.recharts-cartesian-grid-vertical_line]:stroke-border/40 [&_.recharts-curve.recharts-area]:fill-opacity-40 [&_.recharts-grid-background]:fill-none [&_.recharts-indicator]:stroke-transparent [&_.recharts-sector]:stroke-transparent [&_.recharts-active-dot]:stroke-background [&_.recharts-active-dot]:stroke-2 [&_.recharts-dot]:stroke-background [&_.recharts-dot]:stroke-2 [&_.recharts-legend-item]:inline-flex [&_.recharts-legend-item]:items-center [&_.recharts-legend-item]:gap-1 [&_.recharts-legend-item_svg]:size-2.5 [&_.recharts-legend-item_svg]:text-muted-foreground [&_.recharts-legend-item_svg]:shrink-0 [&_.recharts-label]:fill-muted-foreground [&_.recharts-polar-grid-concentric]:stroke-border [&_.recharts-polar-grid-radial]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle]:stroke-transparent [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector]:stroke-transparent [&_.recharts-tooltip-cursor]:stroke-border",
          className,
        )}
        {...props}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: Object.entries(config)
              .map(([key, value]) => {
                const color = value.color;
                if (!color) return "";
                return `
                :root {
                  --color-${key}: ${color};
                }
              `;
              })
              .join("\n"),
          }}
        />
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

export const ChartTooltip = RechartsPrimitive.Tooltip;

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean;
    payload?: any[];
    label?: string;
    hideLabel?: boolean;
    indicator?: "line" | "dot" | "dashed";
  }
>(({ active, payload, label, className, hideLabel = false }, ref) => {
  const { config } = useChart();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-xl border border-border/80 bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-xl",
        className,
      )}
    >
      {!hideLabel && (
        <div className="font-bold text-muted-foreground mb-0.5">{label}</div>
      )}
      <div className="grid gap-1">
        {payload.map((item) => {
          const key = item.dataKey || item.name;
          const itemConfig = config[key];
          const color = item.payload.fill || item.color || itemConfig?.color;

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-4 font-bold text-card-foreground"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>{itemConfig?.label || key}</span>
              </div>
              <span className="font-mono text-foreground">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";
