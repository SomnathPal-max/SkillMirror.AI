import React from 'react';

export default function RadarChart({ signals = {}, size = 300 }) {
  const axes = [
    { key: 'debuggingSpeed', label: 'Debugging Speed' },
    { key: 'edgeCaseAwareness', label: 'Edge-Case Awareness' },
    { key: 'iterationDiscipline', label: 'Iteration Discipline' },
    { key: 'pivotQuality', label: 'Pivot Quality' },
    { key: 'learningVelocity', label: 'Learning Velocity' },
    { key: 'aiCollaboration', label: 'AI Collaboration' }
  ];

  const center = size / 2;
  const radius = (size / 2) - 45;
  const totalAxes = axes.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  function getCoordinates(value, index, maxVal = 100) {
    const r = (value / maxVal) * radius;
    const angle = index * angleSlice - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  }

  // Candidate polygon
  const candidatePoints = axes.map((axis, i) => {
    const val = signals[axis.key] || 70;
    const { x, y } = getCoordinates(val, i);
    return `${x},${y}`;
  }).join(' ');

  // Calibrated benchmark ring (70)
  const benchmarkPoints = axes.map((axis, i) => {
    const { x, y } = getCoordinates(70, i);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center select-none">
      <svg width={size} height={size} className="overflow-visible">
        {/* Concentric grid webs */}
        {levels.map((lvl, idx) => {
          const webPoints = axes.map((_, i) => {
            const { x, y } = getCoordinates(lvl * 100, i);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={idx}
              points={webPoints}
              fill="none"
              stroke="#27272a"
              strokeWidth="1"
            />
          );
        })}

        {/* Spokes */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#27272a"
              strokeWidth="1"
            />
          );
        })}

        {/* Benchmark Ring */}
        <polygon
          points={benchmarkPoints}
          fill="none"
          stroke="#52525b"
          strokeWidth="1.25"
          strokeDasharray="3,3"
        />

        {/* Candidate Skill Polygon */}
        <polygon
          points={candidatePoints}
          fill="rgba(16, 185, 129, 0.15)"
          stroke="#10b981"
          strokeWidth="2"
        />

        {/* Vertices & Labels */}
        {axes.map((axis, i) => {
          const val = signals[axis.key] || 70;
          const { x, y } = getCoordinates(val, i);
          const labelCoord = getCoordinates(118, i);

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="3.5"
                fill="#09090b"
                stroke="#10b981"
                strokeWidth="2"
              />
              <text
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-mono fill-zinc-400"
              >
                {axis.label}
              </text>
              <text
                x={x}
                y={y - 7}
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-white"
              >
                {val}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500"></span>
          <span className="text-zinc-300">Candidate Vector</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0 border-b border-dashed border-zinc-500"></span>
          <span className="text-zinc-500">Median Benchmark (70)</span>
        </div>
      </div>
    </div>
  );
}
