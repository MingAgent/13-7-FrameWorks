import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye } from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import {
  WINDOW_PRICES,
  WALK_DOOR_PRICES,
  DOOR_PRICE_MATRIX,
  lookupPrice,
  getEaveHeights
} from '../../../constants/pricing';
import { BuildingProfile } from '../building-profile/BuildingProfile';
import type { WindowConfig, WallPosition } from '../../../types/estimator';

const generateId = () => Math.random().toString(36).substring(2, 11);

type WallView = 'front' | 'back' | 'left' | 'right';
type WindowSize = '3x3' | '4x4';

const WINDOW_SIZE_OPTIONS: { size: WindowSize; label: string; width: number; height: number; price: number }[] = [
  { size: '3x3', label: "3' × 3' Fixed Window", width: 3, height: 3, price: WINDOW_PRICES['3x3'] },
  { size: '4x4', label: "4' × 4' Slider Window", width: 4, height: 4, price: WINDOW_PRICES['4x4'] }
];

export function Step5Windows() {
  const { building, accessories, addWindow, removeWindow, updateWindow, setBuildingConfig } = useEstimatorStore();
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  // Handler to change building view
  const handleViewChange = (view: WallView) => {
    setBuildingConfig({ buildingView: view });
    setSelectedWindowId(null);
  };

  // Get wall length
  const getWallLength = (wall: string) => {
    return (wall === 'front' || wall === 'back') ? building.width : building.length;
  };

  // Add a window
  const handleAddWindow = (size: WindowSize) => {
    const sizeOption = WINDOW_SIZE_OPTIONS.find(o => o.size === size)!;
    const wallLength = getWallLength(building.buildingView);
    const defaultPosition = Math.min(wallLength - sizeOption.width - 3, Math.max(3, wallLength / 2 - sizeOption.width / 2));

    const newWindow: WindowConfig = {
      id: generateId(),
      size,
      width: sizeOption.width,
      height: sizeOption.height,
      wall: building.buildingView as WallPosition,
      position: Math.round(defaultPosition),
      quantity: 1
    };
    addWindow(newWindow);
  };

  const wallOptions = [
    { value: 'front', label: 'Front Wall' },
    { value: 'back', label: 'Back Wall' },
    { value: 'left', label: 'Left Wall' },
    { value: 'right', label: 'Right Wall' }
  ];

  // Window costs
  const windowCost = accessories.windows.reduce((total, w) => {
    return total + (WINDOW_PRICES[w.size] || 0);
  }, 0);

  // Running total from prior steps
  const heights = getEaveHeights(building.buildingType);
  const baseHeightId = heights[0]?.id ?? '10';
  const basePrice = lookupPrice(building.buildingType, building.buildingSizeId, baseHeightId);
  const currentPrice = lookupPrice(building.buildingType, building.buildingSizeId, building.eaveHeightId);
  const heightModifier = currentPrice - basePrice;
  const extraWalkDoors = Math.max(0, accessories.walkDoors.length - 1);
  const walkDoorCost = extraWalkDoors * WALK_DOOR_PRICES.extra_walkthrough;
  const overheadDoorCost = accessories.rollUpDoors.reduce((total, door) => {
    const key = `${door.height}x${door.width}`;
    return total + (DOOR_PRICE_MATRIX[key] || 0);
  }, 0);

  // Windows on current wall
  const windowsOnCurrentWall = accessories.windows.filter(w => w.wall === building.buildingView);

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      <motion.p variants={itemVariants} className="text-[#A3A3A3]">
        Place windows on your building walls. Choose a wall view, then add windows and adjust their position.
      </motion.p>

      {/* Add Window Buttons */}
      <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Add Windows</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WINDOW_SIZE_OPTIONS.map((opt) => {
            const countOfType = accessories.windows.filter(w => w.size === opt.size).length;
            return (
              <button
                key={opt.size}
                onClick={() => handleAddWindow(opt.size)}
                className="flex items-center justify-between p-4 bg-[#243352] rounded-lg border border-white/10 hover:border-[#14B8A6]/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-500/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-sky-400 group-hover:text-[#14B8A6] transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">{opt.label}</p>
                    <p className="text-sm text-[#A3A3A3]">${opt.price.toLocaleString()} each</p>
                  </div>
                </div>
                {countOfType > 0 && (
                  <span className="px-2 py-1 bg-[#14B8A6]/20 text-[#14B8A6] text-sm font-semibold rounded-full">
                    {countOfType}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Building Visualization with Windows */}
      <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#14B8A6]" />
            <h3 className="text-lg font-semibold text-white">Window Placement Preview</h3>
          </div>
          <p className="text-sm text-[#A3A3A3]">Click a window to adjust position</p>
        </div>

        {/* Wall View Tabs */}
        <div className="flex gap-2 mb-4">
          {(['front', 'back', 'left', 'right'] as WallView[]).map((wall) => {
            const isActive = building.buildingView === wall;
            const windowCount = accessories.windows.filter(w => w.wall === wall).length;
            const doorCount = [...accessories.walkDoors, ...accessories.rollUpDoors].filter(d => d.wall === wall).length;
            return (
              <button
                key={wall}
                onClick={() => handleViewChange(wall)}
                className={`
                  flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                  ${isActive
                    ? 'bg-[#14B8A6] text-white shadow-lg'
                    : 'bg-[#243352] text-[#A3A3A3] hover:bg-[#2d3f63] border border-white/10'
                  }
                `}
              >
                <span className="capitalize">{wall}</span>
                {(windowCount > 0 || doorCount > 0) && (
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${isActive ? 'bg-white/20' : 'bg-sky-500/20 text-sky-400'}`}>
                    {windowCount > 0 ? `${windowCount}W` : ''}{windowCount > 0 && doorCount > 0 ? ' ' : ''}{doorCount > 0 ? `${doorCount}D` : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Building Profile */}
        <div className="rounded-lg overflow-hidden border border-white/10">
          <BuildingProfile
            showDoors={true}
            showWindows={true}
            showClearanceZones={false}
            selectedWindowId={selectedWindowId}
            onWindowClick={(windowId) => setSelectedWindowId(windowId === selectedWindowId ? null : windowId)}
          />
        </div>

        {/* Selected Window Position Slider */}
        {selectedWindowId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-[#243352] rounded-lg border border-sky-500/30"
          >
            {(() => {
              const win = accessories.windows.find(w => w.id === selectedWindowId);
              if (!win) return null;
              const wallLength = getWallLength(win.wall);
              const maxPosition = wallLength - win.width - 3;

              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      {win.size === '3x3' ? "3'×3' Fixed" : "4'×4' Slider"} Window #{accessories.windows.filter(w => w.size === win.size).findIndex(w => w.id === win.id) + 1}
                    </span>
                    <span className="text-sky-400">{win.position}' from left edge</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#A3A3A3]">3'</span>
                    <input
                      type="range"
                      min={3}
                      max={maxPosition}
                      value={win.position || 5}
                      onChange={(e) => updateWindow(win.id, { position: Number(e.target.value) })}
                      className="flex-1 h-2 bg-[#1e2a45] rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <span className="text-xs text-[#A3A3A3]">{maxPosition}'</span>
                  </div>
                  <p className="text-xs text-[#666666] mt-2">
                    Wall length: {wallLength}' | Window: {win.width}'×{win.height}'
                  </p>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs text-[#A3A3A3]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-sky-400/40 rounded border border-sky-400/60"></div>
            <span>Window</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#4a3728] rounded border border-white/20"></div>
            <span>Walk Door</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#5a4535] rounded border border-white/20"></div>
            <span>Overhead Door</span>
          </div>
        </div>
      </motion.div>

      {/* Windows on Current Wall List */}
      {windowsOnCurrentWall.length > 0 && (
        <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">
            Windows on {building.buildingView.charAt(0).toUpperCase() + building.buildingView.slice(1)} Wall
          </h3>
          <div className="space-y-3">
            {windowsOnCurrentWall.map((win, index) => {
              const sizeOpt = WINDOW_SIZE_OPTIONS.find(o => o.size === win.size);
              return (
                <div key={win.id} className="flex items-center justify-between p-3 bg-[#243352] rounded-lg border border-white/5">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">#{index + 1}</span>
                    <div>
                      <p className="text-white text-sm">{sizeOpt?.label}</p>
                      <p className="text-xs text-[#A3A3A3]">Position: {win.position}' from left</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sky-400 font-semibold">${(WINDOW_PRICES[win.size] || 0).toLocaleString()}</span>
                    <select
                      value={win.wall}
                      onChange={(e) => updateWindow(win.id, { wall: e.target.value as WallPosition })}
                      className="px-2 py-1 bg-[#1e2a45] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    >
                      {wallOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-[#1e2a45] text-white">{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (selectedWindowId === win.id) setSelectedWindowId(null);
                        removeWindow(win.id);
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Running Total */}
      <motion.div
        variants={itemVariants}
        className="bg-[#1e2a45] rounded-xl p-4 border border-white/10"
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#A3A3A3]">Building ({building.width}' × {building.length}' × {building.height}')</span>
            <span className="text-white">${(basePrice + heightModifier).toLocaleString()}</span>
          </div>
          {(walkDoorCost + overheadDoorCost) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#A3A3A3]">Doors</span>
              <span className="text-white">+${(walkDoorCost + overheadDoorCost).toLocaleString()}</span>
            </div>
          )}
          {windowCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#A3A3A3]">Windows ({accessories.windows.length})</span>
              <span className="text-white">+${windowCost.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-white">Subtotal</span>
            <span className="text-2xl font-bold text-[#14B8A6]">
              ${(basePrice + heightModifier + walkDoorCost + overheadDoorCost + windowCost).toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Step5Windows;
