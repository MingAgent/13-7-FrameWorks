import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, Eye } from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import {
  DOOR_PRICE_MATRIX,
  WALK_DOOR_PRICES,
  WINDOW_PRICES,
  lookupPrice,
  getEaveHeights,
  CARPORT_PARTITION_WALL_RATE_PER_LF,
  getCarportWallLength,
  calculateAttachedCarportPrice
} from '../../../constants/pricing';
import { BuildingProfile } from '../building-profile/BuildingProfile';
import { CarportFloorPlan } from '../building-profile/CarportFloorPlan';
import type { DoorConfig, WindowConfig, WallPosition, CarportPartitionWall } from '../../../types/estimator';

const generateId = () => Math.random().toString(36).substring(2, 11);

type WallView = 'front' | 'back' | 'left' | 'right';
type WindowSize = '3x3' | '4x4';

const WINDOW_SIZE_OPTIONS: { size: WindowSize; label: string; width: number; height: number; price: number }[] = [
  { size: '3x3', label: "3' × 3' Fixed Window", width: 3, height: 3, price: WINDOW_PRICES['3x3'] },
  { size: '4x4', label: "4' × 4' Slider Window", width: 4, height: 4, price: WINDOW_PRICES['4x4'] }
];

const wallOptions = [
  { value: 'front', label: 'Front Wall' },
  { value: 'back', label: 'Back Wall' },
  { value: 'left', label: 'Left Wall' },
  { value: 'right', label: 'Right Wall' }
];

export function Step4Doors() {
  const {
    building, accessories,
    addDoor, removeDoor, updateDoor,
    addWindow, removeWindow, updateWindow,
    setBuildingConfig
  } = useEstimatorStore();

  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  // Initialize with one walk door if none exists (included free)
  useEffect(() => {
    if (accessories.walkDoors.length === 0) {
      const initialDoor: DoorConfig = {
        id: generateId(),
        type: 'walk',
        size: '3x7',
        width: 3,
        height: 7,
        wall: 'front',
        position: 5,
        quantity: 1
      };
      addDoor(initialDoor);
    }
  }, [accessories.walkDoors.length, addDoor]);

  // Handler to change building view
  const handleViewChange = (view: WallView) => {
    setBuildingConfig({ buildingView: view });
    setSelectedDoorId(null);
    setSelectedWindowId(null);
  };

  // Get wall length
  const getWallLength = (wall: string) => {
    return (wall === 'front' || wall === 'back') ? building.width : building.length;
  };

  // Walk door count (1 included free)
  const walkDoorCount = accessories.walkDoors.length;
  const extraWalkDoors = Math.max(0, walkDoorCount - 1);

  // Get available door heights (must be 2' less than building height)
  const getAvailableHeights = () => {
    const maxHeight = building.height - 2;
    const heights = [];
    for (let h = 8; h <= maxHeight && h <= 14; h += 2) {
      heights.push(h);
    }
    return heights;
  };

  const availableHeights = getAvailableHeights();
  const doorWidths = [8, 10, 12, 14];

  // Calculate preset positions for Left / Center / Right
  const getPresetPosition = (wall: string, doorWidth: number, preset: 'left' | 'center' | 'right') => {
    const wallLength = getWallLength(wall);
    const minPos = 3;
    const maxPos = wallLength - doorWidth - 3;
    switch (preset) {
      case 'left':
        return Math.max(minPos, 2.5); // 2'-6" from left
      case 'center':
        return Math.round((wallLength - doorWidth) / 2);
      case 'right':
        return Math.min(maxPos, wallLength - doorWidth - 2.5); // 2'-6" from right
    }
  };

  // Determine which preset is active for a door
  const getActivePreset = (wall: string, doorWidth: number, position: number): 'left' | 'center' | 'right' | null => {
    const leftPos = getPresetPosition(wall, doorWidth, 'left');
    const centerPos = getPresetPosition(wall, doorWidth, 'center');
    const rightPos = getPresetPosition(wall, doorWidth, 'right');
    if (Math.abs(position - leftPos) < 0.5) return 'left';
    if (Math.abs(position - centerPos) < 0.5) return 'center';
    if (Math.abs(position - rightPos) < 0.5) return 'right';
    return null;
  };

  // Handle walk door quantity change
  const handleWalkDoorChange = (delta: number) => {
    if (delta > 0) {
      const newDoor: DoorConfig = {
        id: generateId(),
        type: 'walk',
        size: '3x7',
        width: 3,
        height: 7,
        wall: building.buildingView as WallPosition,
        position: 5,
        quantity: 1
      };
      addDoor(newDoor);
    } else if (delta < 0 && walkDoorCount > 1) {
      const lastDoor = accessories.walkDoors[accessories.walkDoors.length - 1];
      if (lastDoor) removeDoor(lastDoor.id);
    }
  };

  // Add overhead door
  const handleAddOverheadDoor = () => {
    const defaultHeight = availableHeights.length > 0 ? availableHeights[0] : 8;
    const newDoor: DoorConfig = {
      id: generateId(),
      type: 'rollUp',
      size: `10x${defaultHeight}` as any,
      width: 10,
      height: defaultHeight,
      wall: building.buildingView as WallPosition,
      position: 5,
      quantity: 1
    };
    addDoor(newDoor);
  };

  // Add a window
  const handleAddWindow = (size: WindowSize) => {
    const sizeOption = WINDOW_SIZE_OPTIONS.find(o => o.size === size)!;
    const wallLength = getWallLength(building.buildingView);
    const defaultPosition = Math.min(wallLength - sizeOption.width - 1, Math.max(1, wallLength / 2 - sizeOption.width / 2));

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

  // Calculate costs
  const walkDoorCost = extraWalkDoors * WALK_DOOR_PRICES.extra_walkthrough;
  const overheadDoorCost = accessories.rollUpDoors.reduce((total, door) => {
    const key = `${door.height}x${door.width}`;
    return total + (DOOR_PRICE_MATRIX[key] || 0);
  }, 0);
  const windowCost = accessories.windows.reduce((total, w) => {
    return total + (WINDOW_PRICES[w.size] || 0);
  }, 0);

  // Running total from prior steps
  const heights = getEaveHeights(building.buildingType);
  const baseHeightId = heights[0]?.id ?? '10';
  const basePrice = lookupPrice(building.buildingType, building.buildingSizeId, baseHeightId);
  const currentPrice = lookupPrice(building.buildingType, building.buildingSizeId, building.eaveHeightId);
  const heightModifier = currentPrice - basePrice;

  // Handle click on door/window in profile
  const handleDoorClick = (doorId: string) => {
    setSelectedWindowId(null);
    setSelectedDoorId(doorId === selectedDoorId ? null : doorId);
  };

  const handleWindowClick = (windowId: string) => {
    setSelectedDoorId(null);
    setSelectedWindowId(windowId === selectedWindowId ? null : windowId);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      <motion.p variants={itemVariants} className="text-[#A3A3A3]">
        Add doors and windows to your building, then position them on the wall preview below.
      </motion.p>

      {/* ────────────────── CARPORT PARTITION WALLS (if carport enabled) ────────────────── */}
      {building.attachedCarport.enabled && (
        <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-6 border border-orange-400/30">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-6 bg-orange-500 rounded-full" />
            <h3 className="text-lg font-semibold text-white">Carport Partition Walls</h3>
          </div>
          <p className="text-sm text-[#A3A3A3] mb-4">
            Your {building.attachedCarport.mode === 'interior' ? 'interior carport is partitioned from' : 'carport is attached to'} the <span className="text-orange-400 font-medium capitalize">{building.attachedCarport.attachWall}</span> wall.
            Toggle which sides get a full panel wall — ${CARPORT_PARTITION_WALL_RATE_PER_LF}/linear foot.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(() => {
              // Determine which partition walls are available based on attach wall
              const attachWall = building.attachedCarport.attachWall;
              const wallLength = getCarportWallLength(building);
              const depth = building.attachedCarport.depth;

              // The two side walls of the carport + the front (opposite the attach wall)
              const partitionOptions: { id: CarportPartitionWall; label: string; lengthFt: number }[] = [
                { id: 'left', label: 'Left Side', lengthFt: (attachWall === 'front' || attachWall === 'back') ? depth : depth },
                { id: 'right', label: 'Right Side', lengthFt: (attachWall === 'front' || attachWall === 'back') ? depth : depth },
                { id: 'front', label: building.attachedCarport.mode === 'interior' ? 'Partition Wall' : 'Front (Open Side)', lengthFt: wallLength }
              ];

              return partitionOptions.map((opt) => {
                const isActive = building.attachedCarport.partitionWalls.includes(opt.id);
                const wallCost = opt.lengthFt * CARPORT_PARTITION_WALL_RATE_PER_LF;

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      const current = building.attachedCarport.partitionWalls;
                      const updated = isActive
                        ? current.filter(w => w !== opt.id)
                        : [...current, opt.id];
                      setBuildingConfig({
                        attachedCarport: {
                          ...building.attachedCarport,
                          partitionWalls: updated
                        }
                      });
                    }}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 text-left
                      ${isActive
                        ? 'border-orange-400 bg-orange-500/20'
                        : 'border-white/10 bg-[#243352] hover:border-white/20'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                        ${isActive ? 'bg-orange-500 border-orange-500' : 'border-[#A3A3A3]'}
                      `}>
                        {isActive && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-white font-medium">{opt.label}</span>
                    </div>
                    <p className="text-xs text-[#A3A3A3]">
                      {opt.lengthFt}' long — {isActive ? (
                        <span className="text-orange-400">+${wallCost.toLocaleString()}</span>
                      ) : (
                        <span>${wallCost.toLocaleString()}</span>
                      )}
                    </p>
                  </button>
                );
              });
            })()}
          </div>

          {/* Carport cost summary */}
          <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-400/20">
            <div className="flex justify-between text-sm">
              <span className="text-[#A3A3A3]">
                Carport Total ({getCarportWallLength(building)}' × {building.attachedCarport.depth}' + {building.attachedCarport.partitionWalls.length} wall{building.attachedCarport.partitionWalls.length !== 1 ? 's' : ''})
              </span>
              <span className="font-semibold text-orange-400">
                ${calculateAttachedCarportPrice(building).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ────────────────── SECTION 1: DOORS ────────────────── */}

      {/* Walk-Through Doors */}
      <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-1">3070 Walk-Through Door</h3>
        <p className="text-sm text-[#A3A3A3] mb-4">1 door included standard. Additional doors: $1,045 each</p>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-[#A3A3A3]">Quantity:</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleWalkDoorChange(-1)}
              disabled={walkDoorCount <= 1}
              className="w-10 h-10 rounded-lg bg-[#243352] hover:bg-[#2d3f63] border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-white"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-8 text-center text-xl font-bold text-white">{walkDoorCount}</span>
            <button
              onClick={() => handleWalkDoorChange(1)}
              className="w-10 h-10 rounded-lg bg-[#243352] hover:bg-[#2d3f63] border border-white/10 flex items-center justify-center transition-colors text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <span className="text-[#A3A3A3] ml-4">
            {walkDoorCount === 1 ? '(Included)' : `(+$${(extraWalkDoors * WALK_DOOR_PRICES.extra_walkthrough).toLocaleString()})`}
          </span>
        </div>

        {/* Walk door list with wall dropdown + placement */}
        {accessories.walkDoors.length > 0 && (
          <div className="space-y-3">
            {accessories.walkDoors.map((door, index) => {
              const activePreset = getActivePreset(door.wall, door.width, door.position || 5);
              return (
                <div key={door.id} className="p-3 bg-[#243352] rounded-lg border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-white font-medium text-sm">#{index + 1}</span>
                      <span className="text-white text-sm">3' × 7' Walk Door</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={door.wall}
                        onChange={(e) => {
                          const newWall = e.target.value as WallPosition;
                          const newPos = getPresetPosition(newWall, door.width, 'center');
                          updateDoor(door.id, { wall: newWall, position: newPos });
                        }}
                        className="px-2 py-1.5 bg-[#1e2a45] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30"
                      >
                        {wallOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-[#1e2a45] text-white">{opt.label}</option>
                        ))}
                      </select>
                      <span className="text-sm text-[#A3A3A3]">
                        {index === 0 ? 'Included' : `$${WALK_DOOR_PRICES.extra_walkthrough.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                  {/* Left / Center / Right placement */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#A3A3A3] mr-1">Placement:</span>
                    {(['left', 'center', 'right'] as const).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          const pos = getPresetPosition(door.wall, door.width, preset);
                          updateDoor(door.id, { position: pos });
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                          activePreset === preset
                            ? 'bg-[#14B8A6] text-white'
                            : 'bg-[#1e2a45] text-[#A3A3A3] hover:bg-[#2d3f63] border border-white/10'
                        }`}
                      >
                        {preset.charAt(0).toUpperCase() + preset.slice(1)}
                      </button>
                    ))}
                    <span className="text-xs text-[#666666] ml-2">
                      {door.position != null ? `${door.position}' from left` : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Overhead Doors */}
      <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Overhead Doors</h3>
            <p className="text-sm text-[#A3A3A3]">Roll-up garage doors for vehicle or equipment access</p>
          </div>
          <button
            onClick={handleAddOverheadDoor}
            className="flex items-center gap-2 px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Door
          </button>
        </div>

        {accessories.rollUpDoors.length === 0 ? (
          <p className="text-[#666666] italic py-2">No overhead doors added</p>
        ) : (
          <div className="space-y-4">
            {accessories.rollUpDoors.map((door, index) => {
              const priceKey = `${door.height}x${door.width}`;
              const doorPrice = DOOR_PRICE_MATRIX[priceKey] || 0;

              return (
                <div key={door.id} className="p-4 bg-[#243352] rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-white">Overhead Door #{index + 1}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[#14B8A6] font-semibold">${doorPrice.toLocaleString()}</span>
                      <button
                        onClick={() => removeDoor(door.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-[#A3A3A3] mb-1">Width</label>
                      <select
                        value={door.width}
                        onChange={(e) => {
                          const newWidth = Number(e.target.value);
                          updateDoor(door.id, { width: newWidth, size: `${newWidth}x${door.height}` as any });
                        }}
                        className="w-full px-3 py-2 bg-[#1e2a45] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30"
                      >
                        {doorWidths.map(w => (
                          <option key={w} value={w} className="bg-[#1e2a45] text-white">{w}'</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#A3A3A3] mb-1">Height</label>
                      <select
                        value={door.height}
                        onChange={(e) => {
                          const newHeight = Number(e.target.value);
                          updateDoor(door.id, { height: newHeight, size: `${door.width}x${newHeight}` as any });
                        }}
                        className="w-full px-3 py-2 bg-[#1e2a45] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30"
                      >
                        {availableHeights.map(h => (
                          <option key={h} value={h} className="bg-[#1e2a45] text-white">{h}'</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#A3A3A3] mb-1">Wall</label>
                      <select
                        value={door.wall}
                        onChange={(e) => {
                          const newWall = e.target.value as WallPosition;
                          const newPos = getPresetPosition(newWall, door.width, 'center');
                          updateDoor(door.id, { wall: newWall, position: newPos });
                        }}
                        className="w-full px-3 py-2 bg-[#1e2a45] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30"
                      >
                        {wallOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-[#1e2a45] text-white">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Left / Center / Right placement */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-[#A3A3A3] mr-1">Placement:</span>
                    {(['left', 'center', 'right'] as const).map((preset) => {
                      const activePreset = getActivePreset(door.wall, door.width, door.position || 5);
                      return (
                        <button
                          key={preset}
                          onClick={() => {
                            const pos = getPresetPosition(door.wall, door.width, preset);
                            updateDoor(door.id, { position: pos });
                          }}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            activePreset === preset
                              ? 'bg-[#14B8A6] text-white'
                              : 'bg-[#1e2a45] text-[#A3A3A3] hover:bg-[#2d3f63] border border-white/10'
                          }`}
                        >
                          {preset.charAt(0).toUpperCase() + preset.slice(1)}
                        </button>
                      );
                    })}
                    <span className="text-xs text-[#666666] ml-2">
                      {door.position != null ? `${door.position}' from left` : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ────────────────── SECTION 2: WINDOWS ────────────────── */}

      <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-1">Windows</h3>
        <p className="text-sm text-[#A3A3A3] mb-4">Add windows to your building — select a size to add one.</p>

        {/* Add window buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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

        {/* Window list with wall dropdown and remove */}
        {accessories.windows.length > 0 && (
          <div className="space-y-3">
            {accessories.windows.map((win, index) => {
              const sizeOpt = WINDOW_SIZE_OPTIONS.find(o => o.size === win.size);
              return (
                <div key={win.id} className="flex items-center justify-between p-3 bg-[#243352] rounded-lg border border-white/5">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium text-sm">#{index + 1}</span>
                    <span className="text-white text-sm">{sizeOpt?.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={win.wall}
                      onChange={(e) => updateWindow(win.id, { wall: e.target.value as WallPosition })}
                      className="px-2 py-1.5 bg-[#1e2a45] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    >
                      {wallOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-[#1e2a45] text-white">{opt.label}</option>
                      ))}
                    </select>
                    <span className="text-sky-400 font-semibold text-sm">${(WINDOW_PRICES[win.size] || 0).toLocaleString()}</span>
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
        )}

        {accessories.windows.length === 0 && (
          <p className="text-[#666666] italic">No windows added</p>
        )}
      </motion.div>

      {/* ────────────────── CARPORT LAYOUT (read-only confirmation) ────────────────── */}
      {building.attachedCarport.enabled && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-4 bg-orange-500 rounded-full" />
            <p className="text-sm font-semibold text-white">Carport Layout</p>
            <span className="text-xs text-[#A3A3A3] ml-auto">Configured in previous step</span>
          </div>
          <CarportFloorPlan
            building={building}
            interactive={false}
          />
        </motion.div>
      )}

      {/* ────────────────── SECTION 3: BUILDING PREVIEW ────────────────── */}

      <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#14B8A6]" />
            <h3 className="text-lg font-semibold text-white">Placement Preview</h3>
          </div>
          <p className="text-sm text-[#A3A3A3]">Click an item to adjust position</p>
        </div>

        {/* Wall View Tabs */}
        <div className="flex gap-2 mb-4">
          {(['front', 'back', 'left', 'right'] as WallView[]).map((wall) => {
            const isActive = building.buildingView === wall;
            const doorCount = [...accessories.walkDoors, ...accessories.rollUpDoors].filter(d => d.wall === wall).length;
            const windowCount = accessories.windows.filter(w => w.wall === wall).length;
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
                {(doorCount > 0 || windowCount > 0) && (
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${isActive ? 'bg-white/20' : 'bg-[#14B8A6]/20 text-[#14B8A6]'}`}>
                    {doorCount > 0 ? `${doorCount}D` : ''}{doorCount > 0 && windowCount > 0 ? ' ' : ''}{windowCount > 0 ? `${windowCount}W` : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Building Profile Visualization */}
        <div className="rounded-lg overflow-hidden border border-white/10">
          <BuildingProfile
            showDoors={true}
            showWindows={true}
            showClearanceZones={true}
            selectedDoorId={selectedDoorId}
            selectedWindowId={selectedWindowId}
            onDoorClick={handleDoorClick}
            onWindowClick={handleWindowClick}
          />
        </div>

        {/* Selected Door Position Slider */}
        {selectedDoorId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-[#243352] rounded-lg border border-[#14B8A6]/30"
          >
            {(() => {
              const door = [...accessories.walkDoors, ...accessories.rollUpDoors].find(d => d.id === selectedDoorId);
              if (!door) return null;
              const wallLength = getWallLength(door.wall);
              const maxPosition = wallLength - door.width - 3;

              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      {door.type === 'walk' ? `Walk Door #${accessories.walkDoors.findIndex(d => d.id === door.id) + 1}` : `Overhead Door #${accessories.rollUpDoors.findIndex(d => d.id === door.id) + 1}`}
                    </span>
                    <span className="text-[#14B8A6]">{door.position}' from left edge</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#A3A3A3]">3'</span>
                    <input
                      type="range"
                      min={3}
                      max={maxPosition}
                      value={door.position || 5}
                      onChange={(e) => updateDoor(door.id, { position: Number(e.target.value) })}
                      className="flex-1 h-2 bg-[#1e2a45] rounded-lg appearance-none cursor-pointer accent-[#14B8A6]"
                    />
                    <span className="text-xs text-[#A3A3A3]">{maxPosition}'</span>
                  </div>
                  <p className="text-xs text-[#666666] mt-2">
                    Wall length: {wallLength}' | Door: {door.width}'×{door.height}'
                  </p>
                </div>
              );
            })()}
          </motion.div>
        )}

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
              const maxPosition = wallLength - win.width - 1;

              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      {win.size === '3x3' ? "3'×3' Fixed" : "4'×4' Slider"} Window #{accessories.windows.filter(w => w.size === win.size).findIndex(w => w.id === win.id) + 1}
                    </span>
                    <span className="text-sky-400">{win.position}' from left edge</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#A3A3A3]">1'</span>
                    <input
                      type="range"
                      min={1}
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
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-[#A3A3A3]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#4a3728] rounded border border-white/20"></div>
            <span>Walk Door</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#5a4535] rounded border border-white/20"></div>
            <span>Overhead Door</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-sky-400/40 rounded border border-sky-400/60"></div>
            <span>Window</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/20 rounded border border-red-500/30"></div>
            <span>Post Clearance</span>
          </div>
        </div>
      </motion.div>

      {/* ────────────────── SECTION 4: RUNNING TOTAL ────────────────── */}

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
          {building.attachedCarport.enabled && (
            <div className="flex justify-between text-sm">
              <span className="text-[#A3A3A3]">Attached Carport</span>
              <span className="text-orange-400">+${calculateAttachedCarportPrice(building).toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-white">Subtotal</span>
            <span className="text-2xl font-bold text-[#14B8A6]">
              ${(basePrice + heightModifier + walkDoorCost + overheadDoorCost + windowCost + calculateAttachedCarportPrice(building)).toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Step4Doors;
