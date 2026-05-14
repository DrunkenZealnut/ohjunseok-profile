"use client";

interface LinePoint {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

interface ConnectionLinesProps {
  lines: LinePoint[];
  activeId: string | null;
  isVisible: boolean;
  width: number;
  height: number;
  isPaused: boolean;
}

function calcCurvePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  position: string,
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  let cx1: number, cy1: number, cx2: number, cy2: number;

  if (position === "top" || position === "bottom") {
    // Vertical curves
    cx1 = from.x;
    cy1 = from.y + dy * 0.4;
    cx2 = to.x;
    cy2 = to.y - dy * 0.4;
  } else {
    // Horizontal curves
    cx1 = from.x + dx * 0.4;
    cy1 = from.y;
    cx2 = to.x - dx * 0.4;
    cy2 = to.y;
  }

  return `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
}

const POSITION_MAP: Record<string, string> = {
  head: "top",
  eyes: "left",
  ears: "right",
  mouth: "bottom",
};

export default function ConnectionLines({
  lines,
  activeId,
  isVisible,
  width,
  height,
  isPaused,
}: ConnectionLinesProps) {
  if (!isVisible || width === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 hidden md:block"
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    >
      <defs>
        {lines.map((line) => (
          <linearGradient
            key={`grad-${line.id}`}
            id={`grad-${line.id}`}
            x1={line.from.x}
            y1={line.from.y}
            x2={line.to.x}
            y2={line.to.y}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        ))}
      </defs>

      {lines.map((line, i) => {
        const isActive = activeId === line.id;
        const position = POSITION_MAP[line.id] ?? "left";
        const d = calcCurvePath(line.from, line.to, position);

        return (
          <path
            key={line.id}
            d={d}
            fill="none"
            stroke={`url(#grad-${line.id})`}
            strokeWidth={isActive ? 3 : 2}
            strokeDasharray="8 4"
            opacity={isActive ? 1 : 0.6}
            filter={isActive ? "drop-shadow(0 0 6px rgba(56,189,248,0.5))" : undefined}
            style={{
              animationName: isPaused ? "none" : "line-flow",
              animationDuration: "2s",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationDelay: `${i * 0.15}s`,
              transition: "stroke-width 0.3s, opacity 0.3s",
            }}
          />
        );
      })}
    </svg>
  );
}
