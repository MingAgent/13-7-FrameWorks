import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import {
  getEaveHeights,
  lookupPrice,
  CARPORT_DEPTH_OPTIONS,
  calculateAttachedCarportPrice,
  getCarportWallLength,
  ATTACHED_CARPORT_RATE,
  IBEAM_ATTACHED_CARPORT_RATE
} from '../../../constants/pricing';
import type { WallPosition, CarportPartitionWall, CarportMode } from '../../../types/estimator';
import { CarportFloorPlan } from '../building-profile/CarportFloorPlan';

const WALL_OPTIONS: { id: WallPosition; label: string }[] = [
  { id: 'front', label: 'Front Wall' },
  { id: 'back', label: 'Back Wall' },
  { id: 'left', label: 'Left Wall' },
  { id: 'right', label: 'Right Wall' },
];

export function Step3EaveHeight() {
  const { building, setBuildingConfig } = useEstimatorStore();
  const [customDepthInput, setCustomDepthInput] = useState('');
  const [customWidthInput, setCustomWidthInput] = useState('');

  // Get the correct heights for the selected building type
  const heights = getEaveHeights(building.buildingType);

  // Carport is only available for pole-barn and i-beam
  const supportsCarport = building.buildingType === 'pole-barn' || building.buildingType === 'i-beam';
  const carport = building.attachedCarport;

  const handleHeightSelect = (heightId: string) => {
    const selectedHeight = heights.find(h => h.id === heightId);
    if (selectedHeight) {
      setBuildingConfig({
        eaveHeightId: heightId,
        height: selectedHeight.height
      });
    }
  };

  const handleCarportToggle = () => {
    setBuildingConfig({
      attachedCarport: {
        ...carport,
        enabled: !carport.enabled
      }
    });
  };

  const handleAttachWall = (wall: WallPosition) => {
    setBuildingConfig({
      attachedCarport: {
        ...carport,
        attachWall: wall
      }
    });
  };

  const handleDepthSelect = (depth: number) => {
    setCustomDepthInput('');
    setBuildingConfig({
      attachedCarport: {
        ...carport,
        depth
      }
    });
  };

  const handleCustomDepth = () => {
    const val = parseFloat(customDepthInput);
    if (!val || val <= 0) return;
    // For interior mode, depth can't exceed building dimension on the attached axis
    const maxDepth = getMaxDepthForMode();
    const clamped = Math.min(val, maxDepth);
    setBuildingConfig({
      attachedCarport: {
        ...carport,
        depth: clamped
      }
    });
  };

  const handleCustomWidth = () => {
    const val = parseFloat(customWidthInput);
    if (!val || val <= 0) {
      // Clear custom width — use full wall length
      setBuildingConfig({
        attachedCarport: {
          ...carport,
          customWidth: null
        }
      });
      return;
    }
    const wall = carport.attachWall;
    const maxWidth = (wall === 'front' || wall === 'back') ? building.width : building.length;
    const clamped = Math.min(val, maxWidth);
    setBuildingConfig({
      attachedCarport: {
        ...carport,
        customWidth: clamped
      }
    });
  };

  const handleModeChange = (mode: CarportMode) => {
    setBuildingConfig({
      attachedCarport: {
        ...carport,
        mode
      }
    });
  };

  const handlePartitionToggle = (wall: CarportPartitionWall) => {
    const current = carport.partitionWalls;
    const updated = current.includes(wall)
      ? current.filter(w => w !== wall)
      : [...current, wall];
    setBuildingConfig({
      attachedCarport: {
        ...carport,
        partitionWalls: updated
      }
    });
  };

  // Max depth for interior mode = dimension along the attach axis
  const getMaxDepthForMode = () => {
    if (carport.mode !== 'interior') return 100; // no practical limit for attached
    const wall = carport.attachWall;
    // If attached to front/back, depth goes into building length
    // If attached to left/right, depth goes into building width
    return (wall === 'front' || wall === 'back') ? building.length : building.width;
  };

  // Get the base price (at lowest height) and current price using price table lookup
  const baseHeightId = heights[0]?.id ?? '10';
  const basePrice = lookupPrice(building.buildingType, building.buildingSizeId, baseHeightId);
  const currentPrice = lookupPrice(building.buildingType, building.buildingSizeId, building.eaveHeightId);
  const heightAdder = currentPrice - basePrice;

  // Carport pricing
  const carportTotal = calculateAttachedCarportPrice(building);
  const carportRate = building.buildingType === 'i-beam' ? IBEAM_ATTACHED_CARPORT_RATE : ATTACHED_CARPORT_RATE;
  const wallLength = supportsCarport && carport.enabled ? getCarportWallLength(building) : 0;
  const carportSqft = wallLength * carport.depth;

  // Quick-pick depths match any current selection?
  const isQuickPickDepth = CARPORT_DEPTH_OPTIONS.some(opt => opt.depth === carport.depth);

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.p variants={itemVariants} className="text-gray-600">
        Select your eave height. Taller buildings have additional costs.
      </motion.p>

      {/* Eave Height Options */}
      <motion.div variants={itemVariants}>
        <div className={`grid gap-4 ${
          heights.length <= 4
            ? 'grid-cols-2 sm:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
        }`}>
          {heights.map((height) => {
            const priceAtHeight = lookupPrice(building.buildingType, building.buildingSizeId, height.id);
            const modifier = priceAtHeight - basePrice;

            return (
              <button
                key={height.id}
                onClick={() => handleHeightSelect(height.id)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200 text-center
                  ${building.eaveHeightId === height.id
                    ? 'border-cyan-400 bg-emerald-500 text-white'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800'
                  }
                `}
              >
                <div className="space-y-2">
                  <p className="text-2xl font-bold">
                    {height.label}
                  </p>
                  <p className={`text-sm font-medium ${building.eaveHeightId === height.id ? 'text-white/80' : 'text-gray-500'}`}>
                    {modifier === 0 ? 'Base Price' : `+$${modifier.toLocaleString()}`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Attached Carport Section (Pole Barn & I-Beam only) ─── */}
      {supportsCarport && (
        <motion.div variants={itemVariants}>
          {/* Toggle */}
          <div
            onClick={handleCarportToggle}
            className={`
              flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${carport.enabled
                ? 'border-orange-400 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                ${carport.enabled ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}
              `}>
                {carport.enabled && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">Add Carport</p>
                <p className="text-sm text-gray-500">
                  Open-air cover — attached lean-to or interior partition
                </p>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-400">
              {carport.enabled ? 'Enabled' : 'Optional'}
            </span>
          </div>

          {/* Carport Config (revealed when enabled) */}
          <AnimatePresence>
            {carport.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-5 bg-white rounded-lg border border-gray-200 space-y-5">

                  {/* ─── Mode Toggle (Attached vs Interior) ─── */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Carport Mode
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleModeChange('attached')}
                        className={`
                          p-3 rounded-lg border-2 text-left transition-all duration-200
                          ${carport.mode === 'attached'
                            ? 'border-orange-400 bg-orange-500 text-white'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 text-gray-700'
                          }
                        `}
                      >
                        <p className="font-semibold text-sm">Attached (Lean-To)</p>
                        <p className={`text-xs mt-1 ${carport.mode === 'attached' ? 'text-white/80' : 'text-gray-500'}`}>
                          Extends outside the building — ${carportRate}/sqft
                        </p>
                      </button>
                      <button
                        onClick={() => handleModeChange('interior')}
                        className={`
                          p-3 rounded-lg border-2 text-left transition-all duration-200
                          ${carport.mode === 'interior'
                            ? 'border-orange-400 bg-orange-500 text-white'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 text-gray-700'
                          }
                        `}
                      >
                        <p className="font-semibold text-sm">Interior Partition</p>
                        <p className={`text-xs mt-1 ${carport.mode === 'interior' ? 'text-white/80' : 'text-gray-500'}`}>
                          Inside the building footprint — partition walls only
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Attach Wall Picker */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {carport.mode === 'interior' ? 'Partition Along Wall' : 'Attach to Wall'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {WALL_OPTIONS.map((wall) => (
                        <button
                          key={wall.id}
                          onClick={() => handleAttachWall(wall.id)}
                          className={`
                            px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200
                            ${carport.attachWall === wall.id
                              ? 'border-orange-400 bg-orange-500 text-white'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300 text-gray-700'
                            }
                          `}
                        >
                          {wall.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Depth Picker */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Carport Depth
                      {carport.mode === 'interior' && (
                        <span className="text-xs font-normal text-gray-500 ml-2">
                          (max {getMaxDepthForMode()}' for interior)
                        </span>
                      )}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {CARPORT_DEPTH_OPTIONS.map((opt) => {
                        const maxD = getMaxDepthForMode();
                        const disabled = opt.depth > maxD;
                        return (
                          <button
                            key={opt.depth}
                            onClick={() => !disabled && handleDepthSelect(opt.depth)}
                            disabled={disabled}
                            className={`
                              px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200
                              ${disabled
                                ? 'border-gray-100 bg-gray-100 text-gray-300 cursor-not-allowed'
                                : carport.depth === opt.depth
                                  ? 'border-orange-400 bg-orange-500 text-white'
                                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 text-gray-700'
                              }
                            `}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Depth Input */}
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={getMaxDepthForMode()}
                        placeholder="Custom depth (ft)"
                        value={customDepthInput || (!isQuickPickDepth ? carport.depth : '')}
                        onChange={(e) => setCustomDepthInput(e.target.value)}
                        onBlur={handleCustomDepth}
                        onKeyDown={(e) => e.key === 'Enter' && handleCustomDepth()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                      />
                      <span className="text-sm text-gray-500">ft</span>
                    </div>
                  </div>

                  {/* Custom Width Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Carport Width
                      <span className="text-xs font-normal text-gray-500 ml-2">
                        (default: full wall length = {wallLength}')
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={wallLength}
                        placeholder={`${wallLength}' (full wall)`}
                        value={customWidthInput || (carport.customWidth ?? '')}
                        onChange={(e) => setCustomWidthInput(e.target.value)}
                        onBlur={handleCustomWidth}
                        onKeyDown={(e) => e.key === 'Enter' && handleCustomWidth()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                      />
                      <span className="text-sm text-gray-500">ft</span>
                      {carport.customWidth !== null && (
                        <button
                          onClick={() => {
                            setCustomWidthInput('');
                            setBuildingConfig({
                              attachedCarport: { ...carport, customWidth: null }
                            });
                          }}
                          className="px-3 py-2 text-xs text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Carport Cost Preview */}
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {carport.mode === 'interior' ? 'Interior' : 'Attached'} Carport: {wallLength}' × {carport.depth}' = {carportSqft.toLocaleString()} sqft
                        {carport.mode === 'attached' && <> @ ${carportRate}/sqft</>}
                      </span>
                      <span className="font-semibold text-orange-600">
                        {carport.mode === 'interior'
                          ? (carportTotal > 0 ? `+$${carportTotal.toLocaleString()} (walls)` : 'No extra cost')
                          : `+$${carportTotal.toLocaleString()}`
                        }
                      </span>
                    </div>
                    {carport.mode === 'interior' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Interior carport is under the main roof — no structural cost, only partition walls apply
                      </p>
                    )}
                    {carport.mode === 'attached' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Partition walls can be configured in the next step
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── Carport Floor Plan Preview ─── */}
      {supportsCarport && carport.enabled && (
        <motion.div variants={itemVariants}>
          <p className="text-sm font-semibold text-gray-700 mb-2">Layout Preview</p>
          <CarportFloorPlan
            building={building}
            onWallClick={handleAttachWall}
            onPartitionToggle={handlePartitionToggle}
            interactive={true}
          />
        </motion.div>
      )}

      {/* Running Total */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Building Size ({building.width}' × {building.length}')</span>
            <span className="text-gray-800">${basePrice.toLocaleString()}</span>
          </div>
          {heightAdder > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Height Upgrade ({building.height} ft)</span>
              <span className="text-gray-800">+${heightAdder.toLocaleString()}</span>
            </div>
          )}
          {carport.enabled && carportTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {carport.mode === 'interior' ? 'Interior Carport' : 'Attached Carport'} ({wallLength}' × {carport.depth}')
              </span>
              <span className="text-orange-600">+${carportTotal.toLocaleString()}</span>
            </div>
          )}
          {carport.enabled && carport.mode === 'interior' && carportTotal === 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Interior Carport ({wallLength}' × {carport.depth}')</span>
              <span className="text-gray-400">$0 (under main roof)</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-gray-800">Subtotal</span>
            <span className="text-2xl font-bold text-emerald-600">
              ${(currentPrice + carportTotal).toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Step3EaveHeight;
