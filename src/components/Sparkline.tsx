import React, { useMemo } from 'react';

interface SparklineProps {
  data?: number[];
  width?: number;
  height?: number;
  isPositive?: boolean;
  className?: string;
  showDot?: boolean;
  strokeWidth?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data = [],
  width = 84,
  height = 26,
  isPositive,
  className = '',
  showDot = true,
  strokeWidth = 1.8,
}) => {
  const points = useMemo(() => {
    if (!data || data.length < 2) return [];
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    return data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 6) + 3;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
  }, [data, width, height]);

  const positive = useMemo(() => {
    if (typeof isPositive === 'boolean') return isPositive;
    if (!data || data.length < 2) return true;
    return data[data.length - 1] >= data[0];
  }, [isPositive, data]);

  if (!data || data.length < 2 || points.length < 2) {
    return (
      <div
        className={`flex items-center justify-center font-mono text-[11px] text-[#8c8273] select-none ${className}`}
        style={{ width, height }}
        title="Histórico de preços insuficiente"
      >
        —
      </div>
    );
  }

  const gradId = `spark-grad-${Math.random().toString(36).substring(2, 9)}`;
  const strokeColor = positive ? '#34d399' : '#f87171'; // emerald-400 vs red-400
  const polylineStr = points.join(' ');
  const areaPoints = `0,${height} ${polylineStr} ${width},${height}`;
  const lastPoint = points[points.length - 1].split(',');

  return (
    <svg
      width={width}
      height={height}
      className={`overflow-visible inline-block shrink-0 ${className}`}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.22} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>

      <polygon points={areaPoints} fill={`url(#${gradId})`} />

      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylineStr}
      />

      {showDot && (
        <circle
          cx={lastPoint[0]}
          cy={lastPoint[1]}
          r={2.2}
          fill={strokeColor}
        />
      )}
    </svg>
  );
};
