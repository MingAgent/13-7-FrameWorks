import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { DOOR_POST_CLEARANCE_FT } from '../../../constants/pricing';
import type { DoorConfig } from '../../../types/estimator';

interface BuildingProfileProps {
  showDoors?: boolean;
  showWindows?: boolean;
  showClearanceZones?: boolean;
  className?: string;
  selectedDoorId?: string | null;
  selectedWindowId?: string | null;
  onDoorClick?: (doorId: string) => void;
  onWindowClick?: (windowId: string) => void;
}

export function BuildingProfile({
  showDoors = true,
  showWindows = false,
  showClearanceZones = false,
  className = '',
  selectedDoorId = null,
  selectedWindowId = null,
  onDoorClick,
  onWindowClick
}: BuildingProfileProps) {
  const { building, colors, accessories } = useEstimatorStore();
  const { width, length, height, buildingView } = building;

  // Calculate display dimensions based on view
  const displayWidth = buildingView === 'left' || buildingView === 'right' ? length : width;
  const displayHeight = height;

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 400;
  const padding = 60;
  const groundY = svgHeight - padding;

  // Scale factor to fit building in SVG
  const maxBuildingWidth = svgWidth - padding * 2;
  const maxBuildingHeight = svgHeight - padding * 2 - 50; // Leave room for roof
  const scale = Math.min(
    maxBuildingWidth / displayWidth,
    maxBuildingHeight / displayHeight
  );

  const scaledWidth = displayWidth * scale;
  const scaledHeight = displayHeight * scale;
  const buildingX = (svgWidth - scaledWidth) / 2;
  const roofPeakHeight = 30;

  // Post positions
  const leftPostX = buildingX;
  const centerPostX = buildingX + scaledWidth / 2;
  const rightPostX = buildingX + scaledWidth;

  // Clearance zone calculations
  const clearancePixels = DOOR_POST_CLEARANCE_FT * scale;

  // Determine if gabled (front/back) or eave (left/right) view
  const isGabledView = buildingView === 'front' || buildingView === 'back';

  // Building colors
  const roofColor = colors.roof;
  const wallColor = colors.walls;
  const trimColor = colors.trim;
  const doorColor = colors.doors;

  // Get doors for the current view
  const allDoors = [...accessories.walkDoors, ...accessories.rollUpDoors];
  const doorsOnCurrentWall = allDoors.filter(door => door.wall === buildingView);

  // Calculate door position in pixels
  const getDoorPixelPosition = (door: DoorConfig) => {
    const position = door.position || 5;
    const doorWidth = door.width || 3;
    const doorHeight = door.height || 7;

    // Convert feet to pixels
    const xPos = buildingX + (position * scale);
    const doorWidthPx = doorWidth * scale;
    const doorHeightPx = doorHeight * scale;

    return {
      x: xPos,
      y: groundY - doorHeightPx,
      width: doorWidthPx,
      height: doorHeightPx
    };
  };

  // Generate roof path
  const roofPath = useMemo(() => {
    if (isGabledView) {
      // Peaked roof for front/back
      const peakX = buildingX + scaledWidth / 2;
      const peakY = groundY - scaledHeight - roofPeakHeight;
      const leftEave = groundY - scaledHeight;
      const rightEave = groundY - scaledHeight;
      return `M ${buildingX - 10} ${leftEave} L ${peakX} ${peakY} L ${rightPostX + 10} ${rightEave}`;
    } else {
      // Flat eave for side views
      const roofY = groundY - scaledHeight;
      return `M ${buildingX - 10} ${roofY} L ${rightPostX + 10} ${roofY}`;
    }
  }, [isGabledView, buildingX, scaledWidth, scaledHeight, groundY, rightPostX, roofPeakHeight]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-b from-sky-100 to-sky-200 rounded-xl p-4 overflow-hidden ${className}`}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto"
        style={{ maxHeight: '350px' }}
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
          <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#65a30d" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width={svgWidth} height={groundY} fill="url(#skyGradient)" />

        {/* Ground */}
        <rect x="0" y={groundY} width={svgWidth} height={svgHeight - groundY} fill="url(#groundGradient)" />

        {/* Clearance Zones */}
        {showClearanceZones && (
          <>
            {/* Left post clearance zone */}
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              x={leftPostX}
              y={groundY - scaledHeight * 0.9}
              width={clearancePixels}
              height={scaledHeight * 0.9}
              fill="#ef4444"
            />
            {/* Center post clearance zone */}
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              x={centerPostX - clearancePixels / 2}
              y={groundY - scaledHeight * 0.9}
              width={clearancePixels}
              height={scaledHeight * 0.9}
              fill="#ef4444"
            />
            {/* Right post clearance zone */}
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              x={rightPostX - clearancePixels}
              y={groundY - scaledHeight * 0.9}
              width={clearancePixels}
              height={scaledHeight * 0.9}
              fill="#ef4444"
            />
          </>
        )}

        {/* Building walls */}
        <motion.rect
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ transformOrigin: `${buildingX + scaledWidth / 2}px ${groundY}px` }}
          x={buildingX}
          y={groundY - scaledHeight}
          width={scaledWidth}
          height={scaledHeight}
          fill={wallColor}
          stroke={trimColor}
          strokeWidth="3"
        />

        {/* Roof */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          d={roofPath}
          fill="none"
          stroke={roofColor}
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* ─── Attached Carport (lean-to) ─── */}
        {(() => {
          const carport = building.attachedCarport;
          if (!carport.enabled) return null;

          const aw = carport.attachWall;
          const cd = carport.depth;
          const carportDepthPx = cd * scale;

          // Determine carport visibility based on current view
          // Perpendicular views show the lean-to extending to one side
          // Face-on attach wall: carport extends toward viewer (show as depth extension)
          // Opposite wall: carport is behind building, hidden

          type Side = 'left' | 'right' | 'hidden' | 'face-on';
          let carportSide: Side = 'hidden';

          if (buildingView === 'front') {
            if (aw === 'left') carportSide = 'left';
            else if (aw === 'right') carportSide = 'right';
            else if (aw === 'front') carportSide = 'face-on';
            // back = hidden
          } else if (buildingView === 'back') {
            // Back view is mirrored: looking from behind
            if (aw === 'left') carportSide = 'right';
            else if (aw === 'right') carportSide = 'left';
            else if (aw === 'back') carportSide = 'face-on';
            // front = hidden
          } else if (buildingView === 'left') {
            if (aw === 'front') carportSide = 'right';
            else if (aw === 'back') carportSide = 'left';
            else if (aw === 'left') carportSide = 'face-on';
            // right = hidden
          } else if (buildingView === 'right') {
            if (aw === 'front') carportSide = 'left';
            else if (aw === 'back') carportSide = 'right';
            else if (aw === 'right') carportSide = 'face-on';
            // left = hidden
          }

          if (carportSide === 'hidden') return null;

          const roofTopY = groundY - scaledHeight;
          const leanToLowY = roofTopY + scaledHeight * 0.25; // lean-to roof drops ~25% of wall height
          const hasLeftPartition = carport.partitionWalls.includes('left');
          const hasRightPartition = carport.partitionWalls.includes('right');
          const hasFrontPartition = carport.partitionWalls.includes('front');

          if (carportSide === 'face-on') {
            // Viewing the attach wall face-on: show a subtle roof overhang extending toward viewer
            return (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 0.4, delay: 0.4 }}>
                {/* Roof overhang bar */}
                <rect
                  x={buildingX - 8}
                  y={roofTopY - 6}
                  width={scaledWidth + 16}
                  height={6}
                  fill="#fb923c"
                  opacity={0.5}
                  rx="1"
                />
                <text
                  x={buildingX + scaledWidth / 2}
                  y={roofTopY - 12}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#fb923c"
                >
                  Carport ({cd}' deep)
                </text>
              </motion.g>
            );
          }

          // Lean-to: extends left or right from building
          const isLeft = carportSide === 'left';
          const cpX = isLeft ? buildingX - carportDepthPx : buildingX + scaledWidth;
          const attachX = isLeft ? buildingX : buildingX + scaledWidth;

          // Determine which partition walls are visible from this view
          // The "front" partition is the outer vertical edge of the carport
          // The "left"/"right" partitions appear as side walls depending on orientation
          // From this perpendicular view, the "front" (open side) is the outer vertical edge
          const showFrontWall = hasFrontPartition;
          // From a side view, one of left/right partitions would be visible as the near-side wall
          // but since it's a see-through view, both can be hinted at

          return (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.35 }}>
              {/* Carport ground/slab area */}
              <rect
                x={cpX}
                y={groundY}
                width={carportDepthPx}
                height={4}
                fill="#fb923c"
                opacity={0.3}
              />

              {/* Support post at outer edge */}
              <line
                x1={isLeft ? cpX : cpX + carportDepthPx}
                y1={groundY}
                x2={isLeft ? cpX : cpX + carportDepthPx}
                y2={leanToLowY}
                stroke="#8B4513"
                strokeWidth="3"
                opacity={0.7}
              />

              {/* Lean-to roof line */}
              <line
                x1={attachX}
                y1={roofTopY}
                x2={isLeft ? cpX : cpX + carportDepthPx}
                y2={leanToLowY}
                stroke="#fb923c"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Front partition wall (outer edge) */}
              {showFrontWall && (
                <line
                  x1={isLeft ? cpX : cpX + carportDepthPx}
                  y1={groundY}
                  x2={isLeft ? cpX : cpX + carportDepthPx}
                  y2={leanToLowY}
                  stroke="#fb923c"
                  strokeWidth="2.5"
                  opacity={0.8}
                />
              )}

              {/* Side partition walls (shown as horizontal lines at lean-to edges) */}
              {(hasLeftPartition || hasRightPartition) && (
                <line
                  x1={attachX}
                  y1={groundY}
                  x2={isLeft ? cpX : cpX + carportDepthPx}
                  y2={groundY}
                  stroke="#fb923c"
                  strokeWidth="2"
                  opacity={0.5}
                  strokeDasharray="4,2"
                />
              )}

              {/* Carport area fill (semi-transparent) */}
              <path
                d={`M ${attachX} ${roofTopY} L ${isLeft ? cpX : cpX + carportDepthPx} ${leanToLowY} L ${isLeft ? cpX : cpX + carportDepthPx} ${groundY} L ${attachX} ${groundY} Z`}
                fill="rgba(251,146,60,0.08)"
              />

              {/* Carport depth dimension */}
              <line
                x1={cpX}
                y1={groundY + 20}
                x2={isLeft ? buildingX : cpX + carportDepthPx}
                y2={groundY + 20}
                stroke="#fb923c"
                strokeWidth="1"
                opacity={0.6}
              />
              <text
                x={cpX + (isLeft ? carportDepthPx / 2 : carportDepthPx / 2)}
                y={groundY + 35}
                textAnchor="middle"
                className="text-xs font-medium"
                fill="#fb923c"
              >
                {cd}'
              </text>
            </motion.g>
          );
        })()}

        {/* Posts */}
        {[leftPostX, centerPostX, rightPostX].map((x, i) => (
          <motion.line
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
            style={{ transformOrigin: `${x}px ${groundY}px` }}
            x1={x}
            y1={groundY}
            x2={x}
            y2={groundY - scaledHeight}
            stroke="#8B4513"
            strokeWidth="4"
            strokeDasharray="8,4"
            opacity="0.6"
          />
        ))}

        {/* Doors on current wall */}
        {showDoors && doorsOnCurrentWall.map((door, index) => {
          const doorPos = getDoorPixelPosition(door);
          const isSelected = selectedDoorId === door.id;
          const isWalkDoor = door.type === 'walk';

          return (
            <motion.g
              key={door.id}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              style={{ transformOrigin: `${doorPos.x + doorPos.width / 2}px ${groundY}px` }}
              onClick={() => onDoorClick?.(door.id)}
              className={onDoorClick ? 'cursor-pointer' : ''}
            >
              {/* Door frame */}
              <rect
                x={doorPos.x}
                y={doorPos.y}
                width={doorPos.width}
                height={doorPos.height}
                fill={doorColor}
                stroke={isSelected ? '#14B8A6' : trimColor}
                strokeWidth={isSelected ? 3 : 2}
              />

              {/* Door details based on type */}
              {isWalkDoor ? (
                <>
                  {/* Walk door panel */}
                  <rect
                    x={doorPos.x + 4}
                    y={doorPos.y + 4}
                    width={doorPos.width - 8}
                    height={doorPos.height - 8}
                    fill={doorColor}
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth="1"
                  />
                  {/* Door handle */}
                  <circle
                    cx={doorPos.x + doorPos.width - 8}
                    cy={doorPos.y + doorPos.height / 2}
                    r={3}
                    fill="#888"
                  />
                </>
              ) : (
                <>
                  {/* Roll-up door horizontal lines */}
                  {Array.from({ length: Math.floor(doorPos.height / 15) }).map((_, i) => (
                    <line
                      key={i}
                      x1={doorPos.x + 2}
                      y1={doorPos.y + 10 + i * 15}
                      x2={doorPos.x + doorPos.width - 2}
                      y2={doorPos.y + 10 + i * 15}
                      stroke="rgba(0,0,0,0.15)"
                      strokeWidth="1"
                    />
                  ))}
                </>
              )}

              {/* Door label */}
              <text
                x={doorPos.x + doorPos.width / 2}
                y={doorPos.y - 8}
                textAnchor="middle"
                className="text-xs font-medium"
                fill={isSelected ? '#14B8A6' : '#666'}
              >
                {isWalkDoor ? `W${accessories.walkDoors.findIndex(d => d.id === door.id) + 1}` : `O${accessories.rollUpDoors.findIndex(d => d.id === door.id) + 1}`}
              </text>

              {/* Position indicator */}
              <text
                x={doorPos.x + doorPos.width / 2}
                y={groundY + 15}
                textAnchor="middle"
                className="text-xs"
                fill="#888"
              >
                {door.position}'
              </text>
            </motion.g>
          );
        })}

        {/* Windows on current wall */}
        {showWindows && accessories.windows
          .filter(win => win.wall === buildingView)
          .map((win, index) => {
            const winPosition = win.position || 5;
            const winWidth = win.width || 3;
            const winHeight = win.height || 3;
            const xPos = buildingX + (winPosition * scale);
            const winWidthPx = winWidth * scale;
            const winHeightPx = winHeight * scale;
            // Windows sit 3ft from ground by default
            const windowBottomOffset = 3;
            const yPos = groundY - (windowBottomOffset * scale) - winHeightPx;
            const isSelected = selectedWindowId === win.id;

            return (
              <motion.g
                key={win.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.08 }}
                onClick={() => onWindowClick?.(win.id)}
                className={onWindowClick ? 'cursor-pointer' : ''}
              >
                {/* Window frame */}
                <rect
                  x={xPos}
                  y={yPos}
                  width={winWidthPx}
                  height={winHeightPx}
                  fill="rgba(56, 189, 248, 0.3)"
                  stroke={isSelected ? '#38bdf8' : '#0ea5e9'}
                  strokeWidth={isSelected ? 3 : 1.5}
                />
                {/* Window cross */}
                <line
                  x1={xPos}
                  y1={yPos + winHeightPx / 2}
                  x2={xPos + winWidthPx}
                  y2={yPos + winHeightPx / 2}
                  stroke={isSelected ? '#38bdf8' : '#0ea5e9'}
                  strokeWidth="1"
                  opacity="0.6"
                />
                <line
                  x1={xPos + winWidthPx / 2}
                  y1={yPos}
                  x2={xPos + winWidthPx / 2}
                  y2={yPos + winHeightPx}
                  stroke={isSelected ? '#38bdf8' : '#0ea5e9'}
                  strokeWidth="1"
                  opacity="0.6"
                />
                {/* Window label */}
                <text
                  x={xPos + winWidthPx / 2}
                  y={yPos - 6}
                  textAnchor="middle"
                  className="text-xs font-medium"
                  fill={isSelected ? '#38bdf8' : '#0ea5e9'}
                >
                  {win.size}
                </text>
              </motion.g>
            );
          })
        }

        {/* Dimension labels */}
        {/* Width */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <line
            x1={buildingX}
            y1={groundY + 20}
            x2={buildingX + scaledWidth}
            y2={groundY + 20}
            stroke="#374151"
            strokeWidth="1"
            markerStart="url(#arrowStart)"
            markerEnd="url(#arrowEnd)"
          />
          <text
            x={buildingX + scaledWidth / 2}
            y={groundY + 40}
            textAnchor="middle"
            className="text-sm font-semibold fill-gray-700"
          >
            {displayWidth}'
          </text>
        </motion.g>

        {/* Height */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <line
            x1={buildingX - 20}
            y1={groundY}
            x2={buildingX - 20}
            y2={groundY - scaledHeight}
            stroke="#374151"
            strokeWidth="1"
          />
          <text
            x={buildingX - 30}
            y={groundY - scaledHeight / 2}
            textAnchor="middle"
            className="text-sm font-semibold fill-gray-700"
            transform={`rotate(-90, ${buildingX - 30}, ${groundY - scaledHeight / 2})`}
          >
            {displayHeight}'
          </text>
        </motion.g>

        {/* View label */}
        <motion.text
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          x={svgWidth / 2}
          y={30}
          textAnchor="middle"
          className="text-lg font-bold fill-gray-800"
        >
          {buildingView.charAt(0).toUpperCase() + buildingView.slice(1)} View
        </motion.text>

        {/* Clearance labels */}
        {showClearanceZones && (
          <>
            <text x={leftPostX + 5} y={groundY - 10} className="text-xs fill-red-600">
              2'6"
            </text>
            <text x={centerPostX + 5} y={groundY - 10} className="text-xs fill-red-600">
              2'6"
            </text>
            <text x={rightPostX - clearancePixels + 5} y={groundY - 10} className="text-xs fill-red-600">
              2'6"
            </text>
          </>
        )}
      </svg>
    </motion.div>
  );
}

export default BuildingProfile;
