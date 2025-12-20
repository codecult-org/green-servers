"use client";

interface PerformanceChartProps {
  data: number[];
  color?: string;
}

export function PerformanceChart({
  data,
  color = "rgb(6, 182, 212)",
}: PerformanceChartProps) {
  const width = 1000;
  const height = 300;
  const padding = 10;

  const maxValue = Math.max(...data, 100);

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - (value / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `${padding},${height - padding} ${points} ${
    width - padding
  },${height - padding}`;

  return (
    <div className="w-full h-64 relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        <g opacity="0.1">
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`h-${i}`}
              x1={padding}
              y1={padding + (i * (height - padding * 2)) / 4}
              x2={width - padding}
              y2={padding + (i * (height - padding * 2)) / 4}
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <line
              key={`v-${i}`}
              x1={padding + (i * (width - padding * 2)) / 8}
              y1={padding}
              x2={padding + (i * (width - padding * 2)) / 8}
              y2={height - padding}
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Area fill */}
        <polygon points={fillPoints} fill={color} fillOpacity="0.3" />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
