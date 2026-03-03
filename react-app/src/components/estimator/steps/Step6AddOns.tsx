import { motion } from 'framer-motion';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import {
  WINDOW_PRICES,
  INSULATION_PRICES,
  OPTION_PRICES,
  DOOR_PRICE_MATRIX,
  WALK_DOOR_PRICES,
  lookupPrice,
  getEaveHeights,
  getConcreteRate
} from '../../../constants/pricing';
import type { ConcreteType } from '../../../types/estimator';

// Foundation option metadata (rates are injected dynamically based on building type)
const FOUNDATION_OPTION_META: { type: ConcreteType; label: string; description: string }[] = [
  { type: 'none',      label: 'No Foundation',          description: "I'll handle separately" },
  { type: 'slab',      label: '4" Concrete Slab',       description: '#3 rebar, vapor barrier, control joints' },
  { type: 'turnkey',   label: '4" Turnkey Slab',        description: 'Forms, perimeter thickening, turnkey' },
  { type: 'limestone', label: 'Crushed Limestone Pad',  description: 'Compacted crushed limestone, 4" depth installed' },
  { type: 'caliche',   label: 'Caliche Base',           description: 'Caliche base material — $28/CY + labor' },
];

// Utility cost estimate ranges (Houston metro, informational only)
const UTILITY_ESTIMATE_RANGES = [
  { label: 'Electric service (200A)', low: 3000, high: 8000 },
  { label: 'Water tap + line',        low: 2000, high: 5000 },
  { label: 'Sewer connection',        low: 3000, high: 10000 },
  { label: 'Gas line (if applicable)', low: 1500, high: 4000 },
];

export function Step6AddOns() {
  const {
    building,
    accessories,
    concrete,
    utilities,
    setAccessories,
    setConcreteConfig,
    setUtilityConfig
  } = useEstimatorStore();

  // Window cost (windows are managed in Doors & Windows step, but costs still roll up here)
  const windowCost = accessories.windows.reduce((total, w) => total + (WINDOW_PRICES[w.size] || 0), 0);

  // Insulation - separate wall and roof
  const hasWallInsulation = accessories.insulation === 'wall' || accessories.insulation === 'full';
  const hasRoofInsulation = accessories.insulation === 'ceiling' || accessories.insulation === 'full';

  const handleInsulationToggle = (type: 'wall' | 'roof') => {
    const currentHasWall = accessories.insulation === 'wall' || accessories.insulation === 'full';
    const currentHasRoof = accessories.insulation === 'ceiling' || accessories.insulation === 'full';

    let newInsulation: 'none' | 'wall' | 'ceiling' | 'full' = 'none';

    if (type === 'wall') {
      const newHasWall = !currentHasWall;
      if (newHasWall && currentHasRoof) newInsulation = 'full';
      else if (newHasWall) newInsulation = 'wall';
      else if (currentHasRoof) newInsulation = 'ceiling';
    } else {
      const newHasRoof = !currentHasRoof;
      if (currentHasWall && newHasRoof) newInsulation = 'full';
      else if (newHasRoof) newInsulation = 'ceiling';
      else if (currentHasWall) newInsulation = 'wall';
    }

    setAccessories({ insulation: newInsulation });
  };

  const insulationCost = INSULATION_PRICES[accessories.insulation] || 0;
  const gutterCost = accessories.gutters ? OPTION_PRICES.gutters : 0;

  // Foundation cost — uses building-type-aware rate (I-Beam slab = $9.50/sqft vs $8.00)
  const sqft = building.width * building.length;
  const foundationRate = getConcreteRate(concrete.type, building.buildingType);
  const foundationCost = concrete.type === 'none' ? 0 : sqft * foundationRate;

  // Foundation label for running total
  const getFoundationLabel = (): string => {
    switch (concrete.type) {
      case 'slab': return 'Concrete Slab (4")';
      case 'turnkey': return 'Turnkey Slab (4")';
      case 'limestone': return 'Limestone Pad';
      case 'caliche': return 'Caliche Base';
      default: return 'Foundation';
    }
  };

  // Get running total from previous steps using price table lookup
  const heights = getEaveHeights(building.buildingType);
  const baseHeightId = heights[0]?.id ?? '10';
  const basePriceAtLowestHeight = lookupPrice(building.buildingType, building.buildingSizeId, baseHeightId);
  const currentBuildingPrice = lookupPrice(building.buildingType, building.buildingSizeId, building.eaveHeightId);
  const basePrice = basePriceAtLowestHeight;
  const heightModifier = currentBuildingPrice - basePriceAtLowestHeight;
  const walkDoorCount = accessories.walkDoors.length;
  const extraWalkDoors = Math.max(0, walkDoorCount - 1);
  const walkDoorCost = extraWalkDoors * WALK_DOOR_PRICES.extra_walkthrough;
  const overheadDoorCost = accessories.rollUpDoors.reduce((total, door) => {
    const key = `${door.height}x${door.width}`;
    return total + (DOOR_PRICE_MATRIX[key] || 0);
  }, 0);

  const addOnsCost = windowCost + insulationCost + gutterCost + foundationCost;
  const totalSoFar = basePrice + heightModifier + walkDoorCost + overheadDoorCost + addOnsCost;

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.p variants={itemVariants} className="text-gray-600">
        Add optional features and upgrades to your building.
      </motion.p>

      {/* Windows Summary (managed in Doors & Windows step) */}
      {accessories.windows.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Windows</h3>
          <p className="text-sm text-gray-500">
            {accessories.windows.length} window{accessories.windows.length !== 1 ? 's' : ''} configured — ${windowCost.toLocaleString()} total
          </p>
          <p className="text-xs text-gray-400 mt-1">Go back to Doors & Windows to modify placement</p>
        </motion.div>
      )}

      {/* Insulation */}
      <motion.div variants={itemVariants} className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Insulation</h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-800">Wall Insulation</p>
              <p className="text-sm text-gray-500">${INSULATION_PRICES.wall.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hasWallInsulation}
                onChange={() => handleInsulationToggle('wall')}
                className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-800">Roof Insulation</p>
              <p className="text-sm text-gray-500">${INSULATION_PRICES.roof.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hasRoofInsulation}
                onChange={() => handleInsulationToggle('roof')}
                className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </label>
        </div>
      </motion.div>

      {/* Options */}
      <motion.div variants={itemVariants} className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Options</h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-800">Gutters & Downspouts</p>
              <p className="text-sm text-gray-500">${OPTION_PRICES.gutters.toLocaleString()}</p>
            </div>
            <input
              type="checkbox"
              checked={accessories.gutters}
              onChange={(e) => setAccessories({ gutters: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Foundation / Concrete / Limestone */}
      {building.buildingType === 'carport-garage' ? (
        <motion.div variants={itemVariants} className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Foundation</h3>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
            <p className="text-emerald-800 font-medium text-sm">Foundation Included in CG Base Price</p>
            <p className="text-emerald-600 text-xs mt-1">
              Limestone pad for carport zone, concrete slab for enclosed zone (garage + apartment)
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 font-medium text-sm">Septic & Water Connections</p>
            <p className="text-amber-600 text-xs mt-1">
              Septic hookup and water connections are quoted separately. Contact us for site-specific pricing.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Foundation</h3>
          <p className="text-sm text-gray-500 mb-4">
            Building footprint: {sqft.toLocaleString()} sq ft ({building.width}' × {building.length}')
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FOUNDATION_OPTION_META.map((option) => {
              const isSelected = concrete.type === option.type;
              const rate = getConcreteRate(option.type, building.buildingType);
              const optionCost = option.type === 'none' ? 0 : sqft * rate;
              const rateDisplay = option.type === 'none' ? '$0' : `$${rate % 1 === 0 ? rate : rate.toFixed(2)}/sq ft`;

              return (
                <button
                  key={option.type}
                  onClick={() => setConcreteConfig({ type: option.type })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-cyan-400 bg-emerald-500 text-white'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    {option.description}
                  </p>
                  {option.type !== 'none' ? (
                    <>
                      <p className={`text-xs mt-1 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                        {rateDisplay}
                      </p>
                      <p className={`text-sm font-semibold mt-1 ${isSelected ? 'text-white' : 'text-emerald-600'}`}>
                        +${optionCost.toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <p className={`text-sm mt-2 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {rateDisplay}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Utility Exclusion Notice (ALL building types) */}
      <motion.div variants={itemVariants} className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Utilities</h3>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-amber-800 font-medium text-sm">
            Utilities NOT Included
          </p>
          <p className="text-amber-600 text-xs mt-1">
            Electric, water, sewer, and gas connections are NOT included in this estimate.
            This package includes hookup points at the building only.
            Utility runs from city mains are quoted separately.
          </p>
        </div>

        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
          <div>
            <p className="font-medium text-gray-800">Include utility installation estimate</p>
            <p className="text-sm text-gray-500">Show estimated ranges for reference (not included in total)</p>
          </div>
          <input
            type="checkbox"
            checked={utilities.includeUtilityEstimate}
            onChange={(e) => setUtilityConfig({ includeUtilityEstimate: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
          />
        </label>

        {utilities.includeUtilityEstimate && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-400 font-medium uppercase">Estimated Ranges (Houston Metro)</p>
            {UTILITY_ESTIMATE_RANGES.map((item) => (
              <div key={item.label} className="flex justify-between text-sm px-2">
                <span className="text-gray-600">{item.label}</span>
                <span className="text-gray-500">${item.low.toLocaleString()} – ${item.high.toLocaleString()}</span>
              </div>
            ))}
            <p className="text-xs text-amber-500 mt-2 px-2">
              These are estimates only. Actual costs vary by site conditions, distance to city mains, and local provider requirements.
            </p>
          </div>
        )}
      </motion.div>

      {/* Running Total */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Building + Height</span>
            <span className="text-gray-800">${(basePrice + heightModifier).toLocaleString()}</span>
          </div>
          {(walkDoorCost + overheadDoorCost) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Doors</span>
              <span className="text-gray-800">${(walkDoorCost + overheadDoorCost).toLocaleString()}</span>
            </div>
          )}
          {windowCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Windows</span>
              <span className="text-gray-800">+${windowCost.toLocaleString()}</span>
            </div>
          )}
          {insulationCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Insulation</span>
              <span className="text-gray-800">+${insulationCost.toLocaleString()}</span>
            </div>
          )}
          {gutterCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Gutters & Downspouts</span>
              <span className="text-gray-800">+${gutterCost.toLocaleString()}</span>
            </div>
          )}
          {foundationCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{getFoundationLabel()}</span>
              <span className="text-gray-800">+${foundationCost.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-emerald-600">
              ${totalSoFar.toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Step6AddOns;
