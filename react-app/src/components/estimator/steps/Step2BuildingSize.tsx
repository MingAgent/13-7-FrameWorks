import { motion } from 'framer-motion';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import { getBuildingSizes } from '../../../constants/pricing';

export function Step2BuildingSize() {
  const { building, setBuildingConfig } = useEstimatorStore();

  // Get the correct sizes for the selected building type
  const sizes = getBuildingSizes(building.buildingType);

  const handleSizeSelect = (sizeId: string) => {
    const selectedSize = sizes.find(s => s.id === sizeId);
    if (selectedSize) {
      setBuildingConfig({
        buildingSizeId: sizeId,
        width: selectedSize.width,
        length: selectedSize.length
      });
    }
  };

  // Building type display name
  const typeLabel = {
    'carport': 'Carport',
    'pole-barn': 'Pole Barn',
    'i-beam': 'I-Beam',
    'bolt-up': 'Bolt Up'
  }[building.buildingType] || 'Building';

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.p variants={itemVariants} className="text-gray-600">
        Select your {typeLabel.toLowerCase()} size to get started.
      </motion.p>

      {/* Building Size Grid */}
      <motion.div variants={itemVariants}>
        <div className={`grid gap-3 ${
          sizes.length > 12
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
            : sizes.length > 6
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        }`}>
          {sizes.map((size) => (
            <button
              key={size.id}
              onClick={() => handleSizeSelect(size.id)}
              className={`
                relative px-2 py-3 rounded-lg border-2 transition-all duration-200 text-center min-w-0
                ${building.buildingSizeId === size.id
                  ? 'border-cyan-400 bg-emerald-500 text-white'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800'
                }
              `}
            >
              <div className="space-y-1">
                <p className={`font-bold whitespace-nowrap ${sizes.length > 12 ? 'text-sm' : 'text-base'}`}>
                  {size.label}
                </p>
                <p className={`text-xs ${building.buildingSizeId === size.id ? 'text-white/80' : 'text-gray-500'}`}>
                  {size.sqft.toLocaleString()} sq ft
                </p>
                <p className={`font-bold ${sizes.length > 12 ? 'text-base' : 'text-lg'} ${building.buildingSizeId === size.id ? 'text-white' : 'text-emerald-600'}`}>
                  ${size.startingPrice.toLocaleString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Selected Size Summary */}
      {building.buildingSizeId && (
        <motion.div
          variants={itemVariants}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Selected {typeLabel} Size</p>
              <p className="text-lg font-semibold text-gray-800">
                {building.width}' x {building.length}' ({(building.width * building.length).toLocaleString()} sq ft)
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Starting Price</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${sizes.find(s => s.id === building.buildingSizeId)?.startingPrice.toLocaleString() ?? '—'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Step2BuildingSize;
