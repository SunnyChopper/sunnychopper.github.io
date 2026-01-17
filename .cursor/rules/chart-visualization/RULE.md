---
description: 'USE WHEN creating charts, graphs, and data visualizations.'
globs: ''
alwaysApply: false
---

# Chart & Visualization Patterns

Standards for data visualization components.

## Simple Progress Bar

```tsx
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

function ProgressBar({ value, max = 100, label, color = 'blue' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-500',
    red: 'bg-red-600',
  };

  return (
    <div>
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
          <span className="font-medium">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

## Stat Cards

```tsx
interface StatCardProps {
  label: string;
  value: number | string;
  change?: number;
  icon?: React.ReactNode;
}

function StatCard({ label, value, change, icon }: StatCardProps) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>

        {change !== undefined && (
          <span
            className={cn('text-sm font-medium', change >= 0 ? 'text-green-600' : 'text-red-600')}
          >
            {change >= 0 ? '+' : ''}
            {change}%
          </span>
        )}
      </div>
    </div>
  );
}
```

## Simple Bar Chart

```tsx
interface BarChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
}

function SimpleBarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Donut/Ring Chart

```tsx
interface DonutChartProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function DonutChart({ value, max, size = 120, strokeWidth = 12, label }: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / max) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-blue-600 transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold">{percentage.toFixed(0)}%</span>
        {label && <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>}
      </div>
    </div>
  );
}
```

## Sparkline

```tsx
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

function Sparkline({ data, width = 100, height = 30, color = '#3b82f6' }: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

## Heat Map Grid

```tsx
interface HeatMapProps {
  data: { day: number; hour: number; value: number }[];
}

function HeatMap({ data }: HeatMapProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  const getIntensity = (value: number) => {
    const intensity = value / maxValue;
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity < 0.25) return 'bg-blue-200 dark:bg-blue-900';
    if (intensity < 0.5) return 'bg-blue-400 dark:bg-blue-700';
    if (intensity < 0.75) return 'bg-blue-600 dark:bg-blue-500';
    return 'bg-blue-800 dark:bg-blue-400';
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {data.map((cell, index) => (
        <div
          key={index}
          className={cn('w-4 h-4 rounded-sm', getIntensity(cell.value))}
          title={`${cell.value} activities`}
        />
      ))}
    </div>
  );
}
```

## Legend Component

```tsx
function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
```
