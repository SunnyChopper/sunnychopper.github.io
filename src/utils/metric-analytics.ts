import type { Metric, MetricLog, MetricDirection } from '../types/growth-system';

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  velocity: number; // Rate of change per day
  acceleration: number; // Change in velocity
  isImproving: boolean;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  period: string; // Formatted date label
}

export interface ProgressData {
  current: number;
  target: number | null;
  percentage: number;
  remaining: number | null;
  isOnTrack: boolean;
  daysToTarget: number | null;
}

export interface Anomaly {
  logId: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  date: string;
}

export interface CorrelationResult {
  metricId1: string;
  metricId2: string;
  correlation: number; // -1 to 1
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative';
  sampleSize: number;
}

export interface PredictionResult {
  futureValue: number;
  confidence: number; // 0-1
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  daysAhead: number;
  method: 'linear' | 'exponential' | 'moving_average';
}

export interface HeatmapDay {
  date: string;
  value: number | null;
  intensity: number; // 0-4 for color intensity
  hasLog: boolean;
}

export interface StreakData {
  current: number;
  longest: number;
  allStreaks: Array<{
    startDate: string;
    endDate: string | null;
    length: number;
    isActive: boolean;
  }>;
}

export interface PeriodComparison {
  current: {
    period: string;
    average: number;
    total: number;
    count: number;
  };
  previous: {
    period: string;
    average: number;
    total: number;
    count: number;
  };
  change: number;
  changePercent: number;
  isImproving: boolean;
}

/**
 * Calculate trend data with velocity and acceleration
 */
export function getTrendData(
  logs: MetricLog[],
  metric: Metric
): TrendData | null {
  if (logs.length < 2) return null;

  // Sort by date (oldest first)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
  );

  const current = sortedLogs[sortedLogs.length - 1].value;
  const previous = sortedLogs[sortedLogs.length - 2].value;

  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

  // Calculate velocity (change per day)
  const currentDate = new Date(sortedLogs[sortedLogs.length - 1].loggedAt);
  const previousDate = new Date(sortedLogs[sortedLogs.length - 2].loggedAt);
  const daysDiff = Math.max(
    1,
    (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const velocity = change / daysDiff;

  // Calculate acceleration (change in velocity)
  let acceleration = 0;
  if (sortedLogs.length >= 3) {
    const prevPrev = sortedLogs[sortedLogs.length - 3].value;
    const prevPrevDate = new Date(sortedLogs[sortedLogs.length - 3].loggedAt);
    const prevDaysDiff = Math.max(
      1,
      (previousDate.getTime() - prevPrevDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const prevVelocity = (previous - prevPrev) / prevDaysDiff;
    acceleration = velocity - prevVelocity;
  }

  const isImproving =
    metric.direction === 'Higher'
      ? change >= 0
      : metric.direction === 'Lower'
      ? change <= 0
      : true;

  return {
    current,
    previous,
    change,
    changePercent,
    velocity,
    acceleration,
    isImproving,
  };
}

/**
 * Get time series data aggregated by period
 */
export function getTimeSeriesData(
  logs: MetricLog[],
  period: 'day' | 'week' | 'month',
  days: number = 30
): TimeSeriesDataPoint[] {
  if (logs.length === 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const data: TimeSeriesDataPoint[] = [];

  // Sort logs by date
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
  );

  if (period === 'day') {
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dayLogs = sortedLogs.filter((log) => {
        const logDate = new Date(log.loggedAt);
        return logDate >= date && logDate < nextDate;
      });

      // Use average if multiple logs per day, or latest value
      const value =
        dayLogs.length > 0
          ? dayLogs.reduce((sum, log) => sum + log.value, 0) / dayLogs.length
          : null;

      if (value !== null) {
        data.push({
          date: date.toISOString().split('T')[0],
          value,
          period: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        });
      }
    }
  } else if (period === 'week') {
    const weeks = Math.ceil(days / 7);
    for (let i = weeks - 1; i >= 0; i--) {
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - i * 7);
      const dayOfWeek = weekEnd.getDay();
      const sunday = new Date(weekEnd);
      sunday.setDate(weekEnd.getDate() - (dayOfWeek === 0 ? 0 : dayOfWeek));
      sunday.setHours(23, 59, 59, 999);

      const monday = new Date(sunday);
      monday.setDate(sunday.getDate() - 6);
      monday.setHours(0, 0, 0, 0);

      const weekLogs = sortedLogs.filter((log) => {
        const logDate = new Date(log.loggedAt);
        return logDate >= monday && logDate <= sunday;
      });

      const value =
        weekLogs.length > 0
          ? weekLogs.reduce((sum, log) => sum + log.value, 0) / weekLogs.length
          : null;

      if (value !== null) {
        data.push({
          date: monday.toISOString().split('T')[0],
          value,
          period: `Week of ${monday.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}`,
        });
      }
    }
  } else {
    // month
    const months = Math.ceil(days / 30);
    for (let i = months - 1; i >= 0; i--) {
      const monthEnd = new Date(
        today.getFullYear(),
        today.getMonth() - i + 1,
        0
      );
      monthEnd.setHours(23, 59, 59, 999);

      const monthStart = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1
      );
      monthStart.setHours(0, 0, 0, 0);

      const monthLogs = sortedLogs.filter((log) => {
        const logDate = new Date(log.loggedAt);
        return logDate >= monthStart && logDate <= monthEnd;
      });

      const value =
        monthLogs.length > 0
          ? monthLogs.reduce((sum, log) => sum + log.value, 0) /
            monthLogs.length
          : null;

      if (value !== null) {
        data.push({
          date: monthStart.toISOString().split('T')[0],
          value,
          period: monthStart.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          }),
        });
      }
    }
  }

  return data;
}

/**
 * Calculate progress toward target
 */
export function calculateProgress(
  current: number,
  target: number | null,
  direction: MetricDirection
): ProgressData {
  if (!target) {
    return {
      current,
      target: null,
      percentage: 0,
      remaining: null,
      isOnTrack: true,
      daysToTarget: null,
    };
  }

  let percentage: number;
  let remaining: number | null = null;
  let isOnTrack: boolean;

  if (direction === 'Higher') {
    percentage = Math.min(100, (current / target) * 100);
    remaining = Math.max(0, target - current);
    isOnTrack = current >= target * 0.8; // 80% threshold
  } else if (direction === 'Lower') {
    percentage = Math.min(100, (target / current) * 100);
    remaining = Math.max(0, current - target);
    isOnTrack = current <= target * 1.2; // 20% above target threshold
  } else {
    // Target (specific value)
    const threshold = target * 0.1; // 10% tolerance
    const diff = Math.abs(current - target);
    percentage = Math.max(0, 100 - (diff / threshold) * 100);
    remaining = diff;
    isOnTrack = diff <= threshold;
  }

  // Estimate days to target (simplified - would need trend data for accuracy)
  const daysToTarget = null; // Would require velocity calculation

  return {
    current,
    target,
    percentage: Math.max(0, Math.min(100, percentage)),
    remaining,
    isOnTrack,
    daysToTarget,
  };
}

/**
 * Detect statistical anomalies in metric logs
 */
export function detectAnomalies(
  logs: MetricLog[],
  threshold: number = 2.0 // Standard deviations
): Anomaly[] {
  if (logs.length < 3) return [];

  const values = logs.map((log) => log.value);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);

  const anomalies: Anomaly[] = [];

  logs.forEach((log) => {
    const deviation = Math.abs(log.value - mean) / stdDev;
    if (deviation >= threshold) {
      let severity: 'low' | 'medium' | 'high';
      if (deviation >= 3) {
        severity = 'high';
      } else if (deviation >= 2.5) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      anomalies.push({
        logId: log.id,
        value: log.value,
        expectedValue: mean,
        deviation,
        severity,
        date: log.loggedAt,
      });
    }
  });

  return anomalies.sort((a, b) => b.deviation - a.deviation);
}

/**
 * Calculate correlation between two metrics
 */
export function calculateCorrelations(
  metric1Logs: MetricLog[],
  metric2Logs: MetricLog[]
): CorrelationResult | null {
  if (metric1Logs.length < 3 || metric2Logs.length < 3) return null;

  // Align logs by date (use closest match within 1 day)
  const aligned: Array<{ value1: number; value2: number }> = [];

  metric1Logs.forEach((log1) => {
    const date1 = new Date(log1.loggedAt);
    const closest = metric2Logs.reduce(
      (closest, log2) => {
        const date2 = new Date(log2.loggedAt);
        const diff = Math.abs(date1.getTime() - date2.getTime());
        const daysDiff = diff / (1000 * 60 * 60 * 24);
        if (daysDiff < closest.diff && daysDiff <= 1) {
          return { log: log2, diff: daysDiff };
        }
        return closest;
      },
      { log: null as MetricLog | null, diff: Infinity }
    );

    if (closest.log) {
      aligned.push({ value1: log1.value, value2: closest.log.value });
    }
  });

  if (aligned.length < 3) return null;

  // Calculate Pearson correlation
  const n = aligned.length;
  const sum1 = aligned.reduce((sum, p) => sum + p.value1, 0);
  const sum2 = aligned.reduce((sum, p) => sum + p.value2, 0);
  const mean1 = sum1 / n;
  const mean2 = sum2 / n;

  let numerator = 0;
  let denom1 = 0;
  let denom2 = 0;

  aligned.forEach((p) => {
    const diff1 = p.value1 - mean1;
    const diff2 = p.value2 - mean2;
    numerator += diff1 * diff2;
    denom1 += diff1 * diff1;
    denom2 += diff2 * diff2;
  });

  const denominator = Math.sqrt(denom1 * denom2);
  const correlation = denominator !== 0 ? numerator / denominator : 0;

  const absCorr = Math.abs(correlation);
  let strength: 'weak' | 'moderate' | 'strong';
  if (absCorr >= 0.7) {
    strength = 'strong';
  } else if (absCorr >= 0.4) {
    strength = 'moderate';
  } else {
    strength = 'weak';
  }

  return {
    metricId1: metric1Logs[0].metricId,
    metricId2: metric2Logs[0].metricId,
    correlation,
    strength,
    direction: correlation >= 0 ? 'positive' : 'negative',
    sampleSize: n,
  };
}

/**
 * Predict future trajectory using linear regression
 */
export function predictTrajectory(
  logs: MetricLog[],
  days: number = 30
): PredictionResult | null {
  if (logs.length < 3) return null;

  // Sort by date
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
  );

  // Convert dates to numeric (days since first log)
  const firstDate = new Date(sortedLogs[0].loggedAt);
  const dataPoints = sortedLogs.map((log, index) => {
    const date = new Date(log.loggedAt);
    const daysSinceStart =
      (date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    return { x: daysSinceStart, y: log.value };
  });

  // Linear regression
  const n = dataPoints.length;
  const sumX = dataPoints.reduce((sum, p) => sum + p.x, 0);
  const sumY = dataPoints.reduce((sum, p) => sum + p.y, 0);
  const sumXY = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict future value
  const lastDate = new Date(sortedLogs[sortedLogs.length - 1].loggedAt);
  const lastDaysSinceStart =
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
  const futureX = lastDaysSinceStart + days;
  const futureValue = slope * futureX + intercept;

  // Calculate confidence (based on R-squared)
  const meanY = sumY / n;
  const ssRes = dataPoints.reduce(
    (sum, p) => sum + Math.pow(p.y - (slope * p.x + intercept), 2),
    0
  );
  const ssTot = dataPoints.reduce(
    (sum, p) => sum + Math.pow(p.y - meanY, 2),
    0
  );
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  const confidence = Math.max(0, Math.min(1, rSquared));

  // Calculate confidence interval (simplified)
  const stdError = Math.sqrt(ssRes / (n - 2));
  const margin = stdError * 1.96; // 95% confidence

  return {
    futureValue,
    confidence,
    confidenceInterval: {
      lower: futureValue - margin,
      upper: futureValue + margin,
    },
    daysAhead: days,
    method: 'linear',
  };
}

/**
 * Generate heatmap data for calendar visualization
 */
export function generateHeatmapData(
  logs: MetricLog[],
  months: number = 6
): HeatmapDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setHours(0, 0, 0, 0);

  // Group logs by date
  const logsByDate = new Map<string, number[]>();
  logs.forEach((log) => {
    const logDate = new Date(log.loggedAt);
    logDate.setHours(0, 0, 0, 0);
    if (logDate >= startDate) {
      const dateKey = logDate.toISOString().split('T')[0];
      if (!logsByDate.has(dateKey)) {
        logsByDate.set(dateKey, []);
      }
      logsByDate.get(dateKey)!.push(log.value);
    }
  });

  // Generate all days in range
  const heatmapDays: HeatmapDay[] = [];
  const currentDate = new Date(startDate);
  const allValues = Array.from(logsByDate.values()).flat();
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(...allValues, 0);

  while (currentDate <= today) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayValues = logsByDate.get(dateKey) || [];
    const hasLog = dayValues.length > 0;
    const avgValue = hasLog
      ? dayValues.reduce((sum, val) => sum + val, 0) / dayValues.length
      : null;

    // Calculate intensity (0-4)
    let intensity = 0;
    if (hasLog && avgValue !== null) {
      const range = maxValue - minValue;
      if (range > 0) {
        const normalized = (avgValue - minValue) / range;
        intensity = Math.min(4, Math.ceil(normalized * 4));
      } else {
        intensity = 2; // Default if all values are same
      }
    }

    heatmapDays.push({
      date: dateKey,
      value: avgValue,
      intensity,
      hasLog,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return heatmapDays;
}

/**
 * Calculate logging consistency streaks
 */
export function calculateStreaks(logs: MetricLog[]): StreakData {
  if (logs.length === 0) {
    return { current: 0, longest: 0, allStreaks: [] };
  }

  // Group logs by date
  const logsByDate = new Map<string, MetricLog[]>();
  logs.forEach((log) => {
    const date = new Date(log.loggedAt);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    if (!logsByDate.has(dateKey)) {
      logsByDate.set(dateKey, []);
    }
    logsByDate.get(dateKey)!.push(log);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().split('T')[0];

  const allStreaks: StreakData['allStreaks'] = [];
  let currentStreak = 0;
  let longestStreak = 0;

  // Calculate streaks by iterating through dates backwards from today
  const checkDate = new Date(today);
  checkDate.setHours(0, 0, 0, 0);

  let currentStreakStart: string | null = null;
  let currentStreakEnd: string | null = null;
  let isInStreak = false;
  const maxDaysToCheck = 365;

  const dateIterator = new Date(checkDate);
  for (let i = 0; i < maxDaysToCheck; i++) {
    const dateKey = dateIterator.toISOString().split('T')[0];
    const hasLog = logsByDate.has(dateKey);

    if (hasLog) {
      if (!isInStreak) {
        isInStreak = true;
        currentStreakStart = dateKey;
        currentStreak = 0;
      }
      currentStreak++;
      currentStreakEnd = dateKey;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      if (isInStreak && currentStreakStart) {
        allStreaks.push({
          startDate: currentStreakStart,
          endDate: currentStreakEnd,
          length: currentStreak,
          isActive: currentStreakEnd === todayKey,
        });
        isInStreak = false;
        currentStreak = 0;
        currentStreakStart = null;
        currentStreakEnd = null;
      }
    }

    dateIterator.setDate(dateIterator.getDate() - 1);
    dateIterator.setHours(0, 0, 0, 0);
  }

  // Add current streak if still active
  if (isInStreak && currentStreakStart) {
    allStreaks.push({
      startDate: currentStreakStart,
      endDate: currentStreakEnd,
      length: currentStreak,
      isActive: true,
    });
  }

  const longestFromAll = allStreaks.reduce(
    (max, streak) => Math.max(max, streak.length),
    0
  );
  longestStreak = Math.max(longestStreak, longestFromAll);

  const activeStreak = allStreaks.find((s) => s.isActive);
  currentStreak = activeStreak ? activeStreak.length : 0;

  return {
    current: currentStreak,
    longest: longestStreak,
    allStreaks: allStreaks.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    ),
  };
}

/**
 * Compare two periods (e.g., this week vs last week)
 */
export function getPeriodComparison(
  logs: MetricLog[],
  period: 'week' | 'month'
): PeriodComparison | null {
  if (logs.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStart: Date;
  let currentEnd: Date;
  let previousStart: Date;
  let previousEnd: Date;

  if (period === 'week') {
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - (dayOfWeek === 0 ? 0 : dayOfWeek));
    sunday.setHours(23, 59, 59, 999);

    const monday = new Date(sunday);
    monday.setDate(sunday.getDate() - 6);
    monday.setHours(0, 0, 0, 0);

    currentStart = monday;
    currentEnd = sunday;

    previousEnd = new Date(monday);
    previousEnd.setDate(previousEnd.getDate() - 1);
    previousEnd.setHours(23, 59, 59, 999);

    previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - 6);
    previousStart.setHours(0, 0, 0, 0);
  } else {
    // month
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    currentStart = monthStart;
    currentEnd = monthEnd;

    previousEnd = new Date(monthStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
    previousEnd.setHours(23, 59, 59, 999);

    previousStart = new Date(
      previousEnd.getFullYear(),
      previousEnd.getMonth(),
      1
    );
    previousStart.setHours(0, 0, 0, 0);
  }

  const currentLogs = logs.filter((log) => {
    const logDate = new Date(log.loggedAt);
    return logDate >= currentStart && logDate <= currentEnd;
  });

  const previousLogs = logs.filter((log) => {
    const logDate = new Date(log.loggedAt);
    return logDate >= previousStart && logDate <= previousEnd;
  });

  const currentTotal =
    currentLogs.length > 0
      ? currentLogs.reduce((sum, log) => sum + log.value, 0)
      : 0;
  const currentAvg = currentLogs.length > 0 ? currentTotal / currentLogs.length : 0;

  const previousTotal =
    previousLogs.length > 0
      ? previousLogs.reduce((sum, log) => sum + log.value, 0)
      : 0;
  const previousAvg =
    previousLogs.length > 0 ? previousTotal / previousLogs.length : 0;

  const change = currentAvg - previousAvg;
  const changePercent =
    previousAvg !== 0 ? (change / previousAvg) * 100 : 0;

  return {
    current: {
      period: period === 'week' ? 'This Week' : 'This Month',
      average: currentAvg,
      total: currentTotal,
      count: currentLogs.length,
    },
    previous: {
      period: period === 'week' ? 'Last Week' : 'Last Month',
      average: previousAvg,
      total: previousTotal,
      count: previousLogs.length,
    },
    change,
    changePercent,
    isImproving: changePercent >= 0,
  };
}
