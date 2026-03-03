import { motion } from 'framer-motion';
import type { BuildingConfig, WallPosition, CarportPartitionWall } from '../../../types/estimator';

interface CarportFloorPlanProps {
  building: BuildingConfig;
  onWallClick?: (wall: WallPosition) => void;
  onPartitionToggle?: (wall: CarportPartitionWall) => void;
  interactive?: boolean;
}

/**
 * Top-down floor plan view showing the building rectangle
 * with the carport rectangle attached to the selected wall.
 * Walls are clickable to change the attach wall.
 * Partition walls are shown as solid/dashed lines.
 */
export function CarportFloorPlan({
  building,
  onWallClick,
  onPartitionToggle,
  interactive = true
}: CarportFloorPlanProps) {
  const { width, length, attachedCarport } = building;
  const { enabled, attachWall, depth, partitionWalls } = attachedCarport;

  if (!enabled) return null;

  // SVG canvas
  const svgW = 500;
  const svgH = 400;
  const pad = 60;

  // Compute scale so building + deepest possible carport fits
  const maxCarportDepth = 20; // max possible depth
  const totalW = width + (attachWall === 'left' || attachWall === 'right' ? maxCarportDepth : 0);
  const totalH = length + (attachWall === 'front' || attachWall === 'back' ? maxCarportDepth : 0);
  const availW = svgW - pad * 2;
  const availH = svgH - pad * 2;
  const scale = Math.min(availW / Math.max(totalW, width + maxCarportDepth), availH / Math.max(totalH, length + maxCarportDepth));

  const bldgW = width * scale;
  const bldgH = length * scale;

  // Center the combined footprint
  const carportW = (attachWall === 'left' || attachWall === 'right') ? depth * scale : bldgW;
  const carportH = (attachWall === 'front' || attachWall === 'back') ? depth * scale : bldgH;

  let combinedW = bldgW;
  let combinedH = bldgH;
  if (attachWall === 'left' || attachWall === 'right') combinedW += carportW;
  if (attachWall === 'front' || attachWall === 'back') combinedH += carportH;

  const originX = (svgW - combinedW) / 2;
  const originY = (svgH - combinedH) / 2;

  // Building rectangle position
  let bx = originX;
  let by = originY;
  if (attachWall === 'left') bx = originX + carportW;
  if (attachWall === 'front') by = originY + carportH;

  // Carport rectangle position
  let cx = bx;
  let cy = by;
  if (attachWall === 'left') cx = bx - carportW;
  if (attachWall === 'right') cx = bx + bldgW;
  if (attachWall === 'front') { cx = bx; cy = by - carportH; }
  if (attachWall === 'back') { cx = bx; cy = by + bldgH; }

  // Wall hit zones for clicking (building walls)
  const wallZoneThickness = 18;
  const wallZones: { id: WallPosition; x: number; y: number; w: number; h: number }[] = [
    { id: 'front', x: bx, y: by - wallZoneThickness / 2, w: bldgW, h: wallZoneThickness },
    { id: 'back', x: bx, y: by + bldgH - wallZoneThickness / 2, w: bldgW, h: wallZoneThickness },
    { id: 'left', x: bx - wallZoneThickness / 2, y: by, w: wallZoneThickness, h: bldgH },
    { id: 'right', x: bx + bldgW - wallZoneThickness / 2, y: by, w: wallZoneThickness, h: bldgH },
  ];

  // Partition wall lines on the carport
  // Left/right sides of carport + front (the open end)
  const getPartitionLine = (pw: CarportPartitionWall): { x1: number; y1: number; x2: number; y2: number } => {
    if (attachWall === 'left' || attachWall === 'right') {
      // Carport extends horizontally; left/right partitions are top/bottom of carport; front is the far vertical edge
      if (pw === 'left') return { x1: cx, y1: cy, x2: cx + carportW, y2: cy }; // top edge
      if (pw === 'right') return { x1: cx, y1: cy + carportH, x2: cx + carportW, y2: cy + carportH }; // bottom edge
      // front = the far edge away from building
      if (attachWall === 'left') return { x1: cx, y1: cy, x2: cx, y2: cy + carportH };
      return { x1: cx + carportW, y1: cy, x2: cx + carportW, y2: cy + carportH };
    } else {
      // Carport extends vertically; left/right partitions are left/right edges; front is far horizontal edge
      if (pw === 'left') return { x1: cx, y1: cy, x2: cx, y2: cy + carportH }; // left edge
      if (pw === 'right') return { x1: cx + carportW, y1: cy, x2: cx + carportW, y2: cy + carportH }; // right edge
      // front = far edge away from building
      if (attachWall === 'front') return { x1: cx, y1: cy, x2: cx + carportW, y2: cy };
      return { x1: cx, y1: cy + carportH, x2: cx + carportW, y2: cy + carportH };
    }
  };

  // Partition wall click zones
  const getPartitionClickZone = (pw: CarportPartitionWall) => {
    const line = getPartitionLine(pw);
    const t = 12; // thickness of clickable zone
    const isHorizontal = line.y1 === line.y2;
    if (isHorizontal) {
      return { x: Math.min(line.x1, line.x2), y: line.y1 - t / 2, w: Math.abs(line.x2 - line.x1), h: t };
    }
    return { x: line.x1 - t / 2, y: Math.min(line.y1, line.y2), w: t, h: Math.abs(line.y2 - line.y1) };
  };

  const allPartitions: CarportPartitionWall[] = ['left', 'right', 'front'];

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-4 overflow-hidden">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" style={{ maxHeight: '320px' }}>
        <defs>
          <pattern id="carportHatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(251,146,60,0.3)" strokeWidth="1.5" />
          </pattern>
        </defs>

        {/* Grid dots for reference */}
        {Array.from({ length: 20 }).map((_, xi) =>
          Array.from({ length: 16 }).map((_, yi) => (
            <circle
              key={`${xi}-${yi}`}
              cx={25 + xi * 25}
              cy={25 + yi * 25}
              r={0.5}
              fill="rgba(255,255,255,0.08)"
            />
          ))
        )}

        {/* Building rectangle */}
        <motion.rect
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          x={bx}
          y={by}
          width={bldgW}
          height={bldgH}
          fill="rgba(20,184,166,0.15)"
          stroke="#14B8A6"
          strokeWidth="2.5"
          rx="2"
        />

        {/* Building label */}
        <text
          x={bx + bldgW / 2}
          y={by + bldgH / 2 - 8}
          textAnchor="middle"
          className="text-sm font-bold"
          fill="#14B8A6"
        >
          BUILDING
        </text>
        <text
          x={bx + bldgW / 2}
          y={by + bldgH / 2 + 12}
          textAnchor="middle"
          className="text-xs"
          fill="rgba(20,184,166,0.7)"
        >
          {width}' × {length}'
        </text>

        {/* Carport rectangle */}
        <motion.rect
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          x={cx}
          y={cy}
          width={carportW}
          height={carportH}
          fill="url(#carportHatch)"
          stroke="#fb923c"
          strokeWidth="2"
          strokeDasharray="6,3"
          rx="2"
        />

        {/* Carport fill overlay */}
        <rect
          x={cx}
          y={cy}
          width={carportW}
          height={carportH}
          fill="rgba(251,146,60,0.08)"
        />

        {/* Carport label */}
        <text
          x={cx + carportW / 2}
          y={cy + carportH / 2 - 6}
          textAnchor="middle"
          className="text-xs font-bold"
          fill="#fb923c"
        >
          CARPORT
        </text>
        <text
          x={cx + carportW / 2}
          y={cy + carportH / 2 + 10}
          textAnchor="middle"
          className="text-xs"
          fill="rgba(251,146,60,0.7)"
        >
          {depth}' deep
        </text>

        {/* Partition walls on carport */}
        {allPartitions.map((pw) => {
          const line = getPartitionLine(pw);
          const isActive = partitionWalls.includes(pw);
          const zone = getPartitionClickZone(pw);

          return (
            <g key={pw}>
              {/* The wall line */}
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={isActive ? '#fb923c' : 'rgba(251,146,60,0.25)'}
                strokeWidth={isActive ? 3 : 1.5}
                strokeDasharray={isActive ? 'none' : '4,4'}
              />
              {/* Click zone */}
              {interactive && onPartitionToggle && (
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => onPartitionToggle(pw)}
                >
                  <title>{isActive ? `Remove ${pw} wall` : `Add ${pw} wall`}</title>
                </rect>
              )}
              {/* Wall label */}
              {isActive && (
                <text
                  x={(line.x1 + line.x2) / 2}
                  y={(line.y1 + line.y2) / 2 - 6}
                  textAnchor="middle"
                  className="text-xs font-medium"
                  fill="#fb923c"
                  style={{ pointerEvents: 'none' }}
                >
                  {pw === 'front' ? 'FRONT' : pw === 'left' ? 'LEFT' : 'RIGHT'}
                </text>
              )}
            </g>
          );
        })}

        {/* Building wall click zones (to change attach wall) */}
        {interactive && onWallClick && wallZones.map((zone) => {
          const isAttachWall = zone.id === attachWall;
          return (
            <g key={zone.id}>
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                fill={isAttachWall ? 'rgba(251,146,60,0.3)' : 'transparent'}
                className="cursor-pointer"
                onClick={() => onWallClick(zone.id)}
                rx="2"
              >
                <title>Attach carport to {zone.id} wall</title>
              </rect>
              {/* Glow on attach wall */}
              {isAttachWall && (
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="2"
                  rx="2"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          );
        })}

        {/* Wall labels on building */}
        {/* Front */}
        <text x={bx + bldgW / 2} y={by - 10} textAnchor="middle" className="text-xs" fill={attachWall === 'front' ? '#fb923c' : 'rgba(255,255,255,0.4)'}>
          {interactive ? '▲ Front' : 'Front'}
        </text>
        {/* Back */}
        <text x={bx + bldgW / 2} y={by + bldgH + 18} textAnchor="middle" className="text-xs" fill={attachWall === 'back' ? '#fb923c' : 'rgba(255,255,255,0.4)'}>
          {interactive ? '▼ Back' : 'Back'}
        </text>
        {/* Left */}
        <text x={bx - 10} y={by + bldgH / 2 + 4} textAnchor="end" className="text-xs" fill={attachWall === 'left' ? '#fb923c' : 'rgba(255,255,255,0.4)'}>
          {interactive ? '◀ Left' : 'Left'}
        </text>
        {/* Right */}
        <text x={bx + bldgW + 10} y={by + bldgH / 2 + 4} textAnchor="start" className="text-xs" fill={attachWall === 'right' ? '#fb923c' : 'rgba(255,255,255,0.4)'}>
          {interactive ? 'Right ▶' : 'Right'}
        </text>

        {/* Dimension lines */}
        {/* Building width (top) */}
        <line x1={bx} y1={by - 24} x2={bx + bldgW} y2={by - 24} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <text x={bx + bldgW / 2} y={by - 28} textAnchor="middle" className="text-xs" fill="rgba(255,255,255,0.5)">
          {width}'
        </text>
        {/* Building length (right side if no carport on right) */}
        <line x1={bx + bldgW + 24} y1={by} x2={bx + bldgW + 24} y2={by + bldgH} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <text
          x={bx + bldgW + 28}
          y={by + bldgH / 2 + 4}
          textAnchor="start"
          className="text-xs"
          fill="rgba(255,255,255,0.5)"
        >
          {length}'
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-2 px-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm border border-[#14B8A6] bg-[#14B8A6]/20" />
          <span>Building</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm border border-orange-400 bg-orange-400/10" style={{ borderStyle: 'dashed' }} />
          <span>Carport</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-orange-400" />
          <span>Partition Wall</span>
        </div>
        {interactive && (
          <span className="ml-auto text-gray-500">Click a building wall to move carport</span>
        )}
      </div>
    </div>
  );
}

export default CarportFloorPlan;
