import { motion } from 'framer-motion';
import { Layers, Info, ToggleLeft, ToggleRight } from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import Card from '../../common/Card/Card';
import type { ConcreteType } from '../../../types/estimator';

const concreteOptions = [
  {
    value: 'none' as ConcreteType,
    label: 'No Concrete',
    description: 'Building will be anchored to existing surface or ground',
    icon: '🚫'
  },
  {
    value: 'piers' as ConcreteType,
    label: 'Concrete Piers',
    description: 'Individual concrete footings at each post location',
    icon: '🔩'
  },
  {
    value: 'slab' as ConcreteType,
    label: 'Concrete Slab',
    description: '4" concrete slab with #3 rebar, vapor barrier & control joints',
    icon: '⬛'
  },
  {
    value: 'turnkey' as ConcreteType,
    label: 'Turnkey Package',
    description: 'Complete concrete work with reinforced slab and perimeter',
    icon: '🔑'
  },
  {
    value: 'limestone' as ConcreteType,
    label: 'Limestone Pad',
    description: 'Crushed limestone pad — great for carports and open areas',
    icon: '🪨'
  },
  {
    value: 'caliche' as ConcreteType,
    label: 'Caliche Base',
    description: 'Compacted caliche base — economical surface for equipment areas',
    icon: '🏜️'
  }
];

// All slabs are 4" with #3 rebar — no thickness selection needed

function FoundationPicker({
  label,
  selectedType,
  existingPad,
  onTypeChange,
  onExistingPadChange,
  sqft,
}: {
  label: string;
  selectedType: ConcreteType;
  existingPad: boolean;
  onTypeChange: (type: ConcreteType) => void;
  onExistingPadChange: (checked: boolean) => void;
  sqft: number;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Layers className="w-5 h-5 text-orange-600" />
        {label}
      </h3>

      <div className="space-y-2">
        {concreteOptions.map((option) => (
          <Card
            key={option.value}
            interactive
            variant={selectedType === option.value ? 'elevated' : 'bordered'}
            padding="sm"
            onClick={() => onTypeChange(option.value)}
            className={`
              cursor-pointer
              ${selectedType === option.value
                ? 'ring-2 ring-orange-500 bg-orange-50'
                : 'hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{option.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800 text-sm">{option.label}</h4>
                  {selectedType === option.value && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full"
                    >
                      Selected
                    </motion.span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{option.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Existing Pad Checkbox */}
      {selectedType !== 'none' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-yellow-50 rounded-lg p-4 border border-yellow-200"
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={existingPad}
              onChange={(e) => onExistingPadChange(e.target.checked)}
              className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
            <div>
              <span className="font-medium text-gray-800">I have an existing pad</span>
              <p className="text-sm text-gray-600 mt-1">
                Check this if you already have a suitable surface and don't need new concrete/base work.
              </p>
            </div>
          </label>
        </motion.div>
      )}

      {/* Slab Spec Note */}
      {(selectedType === 'slab' || selectedType === 'turnkey') && !existingPad && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-blue-50 rounded-lg p-4 border border-blue-200"
        >
          <p className="text-sm font-medium text-gray-800">4" concrete slab with #3 rebar</p>
          <p className="text-xs text-gray-500 mt-1">
            All slabs include vapor barrier and control joints. Covers {sqft.toLocaleString()} sq ft.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export function Step5Concrete() {
  const { concrete, building, setConcreteConfig } = useEstimatorStore();
  const sqft = building.width * building.length;
  const carportEnabled = building.attachedCarport.enabled;

  // Calculate carport sqft for display
  const wall = building.attachedCarport.attachWall;
  const wallLength = (wall === 'front' || wall === 'back') ? building.width : building.length;
  const carportWidth = building.attachedCarport.customWidth ?? wallLength;
  const carportSqft = carportWidth * building.attachedCarport.depth;

  const selectedOption = concreteOptions.find((opt) => opt.value === concrete.type);

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      <motion.p variants={itemVariants} className="text-gray-600">
        Select your foundation and concrete options for your building.
      </motion.p>

      {/* Combined Foundation Toggle — only when carport is enabled */}
      {carportEnabled && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Foundation Mode</h3>
              <p className="text-sm text-gray-600 mt-1">
                {concrete.combinedFoundation
                  ? 'One foundation covers the entire building + carport footprint'
                  : 'Building and carport have separate foundation types'
                }
              </p>
            </div>
            <button
              onClick={() => setConcreteConfig({ combinedFoundation: !concrete.combinedFoundation })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-300 bg-white hover:bg-orange-50 transition-colors"
            >
              {concrete.combinedFoundation ? (
                <ToggleRight className="w-6 h-6 text-orange-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {concrete.combinedFoundation ? 'Combined' : 'Separate'}
              </span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Foundation Pickers */}
      {carportEnabled && !concrete.combinedFoundation ? (
        /* ─── Split Mode: Two pickers side-by-side ─── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={itemVariants}>
            <FoundationPicker
              label={`Building Foundation (${sqft.toLocaleString()} sqft)`}
              selectedType={concrete.type}
              existingPad={concrete.existingPad}
              onTypeChange={(type) => setConcreteConfig({ type })}
              onExistingPadChange={(checked) => setConcreteConfig({ existingPad: checked })}
              sqft={sqft}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FoundationPicker
              label={`Carport Foundation (${carportSqft.toLocaleString()} sqft)`}
              selectedType={concrete.carportFoundationType}
              existingPad={concrete.carportExistingPad}
              onTypeChange={(type) => setConcreteConfig({ carportFoundationType: type })}
              onExistingPadChange={(checked) => setConcreteConfig({ carportExistingPad: checked })}
              sqft={carportSqft}
            />
          </motion.div>
        </div>
      ) : (
        /* ─── Combined / No Carport: Single picker + info panel ─── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Foundation Options */}
          <motion.div variants={itemVariants}>
            <FoundationPicker
              label={carportEnabled ? `Combined Foundation (${(sqft + (building.attachedCarport.mode === 'interior' ? 0 : carportSqft)).toLocaleString()} sqft)` : 'Foundation Type'}
              selectedType={concrete.type}
              existingPad={concrete.existingPad}
              onTypeChange={(type) => setConcreteConfig({ type })}
              onExistingPadChange={(checked) => setConcreteConfig({ existingPad: checked })}
              sqft={carportEnabled ? sqft + (building.attachedCarport.mode === 'interior' ? 0 : carportSqft) : sqft}
            />
          </motion.div>

          {/* Information Panel */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Selected Option Details */}
            {selectedOption && (
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {selectedOption.label}
                </h3>

                <div className="space-y-4">
                  {concrete.type === 'none' && (
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        Your building will be securely anchored using ground anchors suitable for your soil type.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Most economical option</li>
                        <li>Suitable for temporary or semi-permanent structures</li>
                        <li>Can be installed on grass or gravel</li>
                      </ul>
                    </div>
                  )}

                  {concrete.type === 'piers' && (
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        Individual concrete footings will be poured at each post location.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Excellent stability on uneven ground</li>
                        <li>Good drainage underneath building</li>
                        <li>More cost-effective than full slab</li>
                      </ul>
                    </div>
                  )}

                  {concrete.type === 'slab' && (
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        A complete concrete floor slab providing a durable, level surface.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Clean, finished floor</li>
                        <li>Ideal for workshops and storage</li>
                        <li>Easy to clean and maintain</li>
                        <li>Covers {sqft.toLocaleString()} sq ft</li>
                      </ul>
                    </div>
                  )}

                  {concrete.type === 'turnkey' && (
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        Premium concrete package with reinforced slab, finished edges, and proper drainage.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Fiber mesh reinforcement</li>
                        <li>Perimeter thickening for added strength</li>
                        <li>Professional finish</li>
                        <li>Covers {sqft.toLocaleString()} sq ft</li>
                      </ul>
                    </div>
                  )}

                  {concrete.type === 'limestone' && (
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        Crushed limestone pad compacted to provide a stable, well-draining surface.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Great for open carports and storage areas</li>
                        <li>Excellent drainage</li>
                        <li>Natural, durable surface</li>
                        <li>Covers {sqft.toLocaleString()} sq ft</li>
                      </ul>
                    </div>
                  )}

                  {concrete.type === 'caliche' && (
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        Compacted caliche base material — economical and strong enough for vehicle traffic.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Most affordable base option</li>
                        <li>Handles heavy equipment well</li>
                        <li>Compacts to a solid surface</li>
                        <li>Covers {sqft.toLocaleString()} sq ft</li>
                      </ul>
                    </div>
                  )}

                  {concrete.existingPad && concrete.type !== 'none' && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-orange-300">
                      <div className="flex items-center gap-2 text-orange-700">
                        <Info className="w-4 h-4" />
                        <span className="text-sm font-medium">Using Existing Pad</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        No new concrete will be poured. Building will be anchored to your existing concrete surface.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Tips */}
            <Card variant="bordered">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Foundation Tips
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Consider local building codes and permit requirements</li>
                <li>• Proper drainage around the foundation is essential</li>
                <li>• All slabs are 4" with #3 rebar for reliable strength</li>
                <li>• Limestone pads are great for carports and open areas</li>
              </ul>
            </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default Step5Concrete;
