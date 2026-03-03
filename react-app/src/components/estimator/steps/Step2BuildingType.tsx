import { motion } from 'framer-motion';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import { getBuildingSizes } from '../../../constants/pricing';
import type { BuildingType } from '../../../types/estimator';

interface BuildingTypeOption {
  type: BuildingType;
  label: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
}

const BUILDING_TYPE_OPTIONS: BuildingTypeOption[] = [
  {
    type: 'pole-barn',
    label: 'Pole Barn',
    description: 'Post-frame structure ideal for workshops, barns, and storage buildings',
    icon: '🏗️',
  },
  {
    type: 'carport',
    label: 'Carport',
    description: 'Open-sided covered structure for vehicles and equipment',
    icon: '🚗',
  },
  {
    type: 'i-beam',
    label: 'I-Beam / Bolt-Up',
    description: 'Heavy-duty steel I-beam frames for commercial and industrial use',
    icon: '🏭',
  },
  {
    type: 'carport-garage',
    label: 'Carport / Garage / Apartment',
    description: 'Combo building with open carport, enclosed garage, and finished apartment',
    icon: '🏠',
  },
  {
    type: 'bolt-up',
    label: 'Bolt-Up',
    description: 'Pre-engineered bolt-together metal building kits',
    icon: '🔩',
    comingSoon: true,
  },
];

export function Step2BuildingType() {
  const { building, setBuildingConfig } = useEstimatorStore();

  const handleSelectType = (type: BuildingType) => {
    setBuildingConfig({ buildingType: type });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.p variants={itemVariants} className="text-gray-600">
        Choose the type of metal building for your project.
      </motion.p>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUILDING_TYPE_OPTIONS.map((option) => {
            const isSelected = building.buildingType === option.type;
            const sizes = getBuildingSizes(option.type);
            const lowestPrice = sizes[0]?.startingPrice ?? 0;

            return (
              <button
                key={option.type}
                onClick={() => !option.comingSoon && handleSelectType(option.type)}
                disabled={option.comingSoon}
                className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                  option.comingSoon
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/10'
                    : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md cursor-pointer'
                }`}
              >
                {option.comingSoon && (
                  <span className="absolute top-3 right-3 bg-gray-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    COMING SOON
                  </span>
                )}

                {isSelected && !option.comingSoon && (
                  <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    SELECTED
                  </span>
                )}

                <div className="text-3xl mb-3">{option.icon}</div>
                <h3 className={`text-lg font-bold mb-1 ${
                  isSelected ? 'text-orange-700' : 'text-gray-800'
                }`}>
                  {option.label}
                </h3>
                <p className={`text-sm mb-3 ${
                  isSelected ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {option.description}
                </p>
                <p className={`text-xs font-medium ${
                  isSelected ? 'text-orange-500' : 'text-gray-400'
                }`}>
                  Starting at ${lowestPrice.toLocaleString()}
                </p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* CG Info Banner */}
      {building.buildingType === 'carport-garage' && (
        <motion.div
          variants={itemVariants}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <p className="text-blue-800 font-medium text-sm mb-1">CG Building Includes:</p>
          <ul className="text-blue-600 text-xs space-y-1 ml-4 list-disc">
            <li>Open carport zone (half of building width) with limestone pad</li>
            <li>Enclosed garage zone with concrete slab</li>
            <li>Finished apartment with bathroom (sink, toilet, shower, closet)</li>
            <li>Foundation included in base price</li>
          </ul>
          <p className="text-amber-600 text-xs mt-2 font-medium">
            Note: Septic hookup and water connections are quoted separately.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Step2BuildingType;
