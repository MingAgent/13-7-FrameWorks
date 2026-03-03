import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import { getBuildingSizes } from '../../../constants/pricing';
import type { BuildingType } from '../../../types/estimator';

// ==================== MAIN BUILDING TYPE OPTIONS ====================

interface BuildingTypeOption {
  type: BuildingType;
  label: string;
  description: string;
}

const MAIN_BUILDING_TYPES: BuildingTypeOption[] = [
  {
    type: 'carport',
    label: 'Carport',
    description: 'Open-sided covered structure for vehicles and equipment',
  },
  {
    type: 'pole-barn',
    label: 'Pole Barn',
    description: 'Post-frame structure ideal for workshops, barns, and storage',
  },
  {
    type: 'i-beam',
    label: 'I-Beam',
    description: 'Heavy-duty steel I-beam frames for commercial and industrial use',
  },
  {
    type: 'carport-garage',
    label: 'CG / Apartment',
    description: 'Combo: open carport, enclosed garage, and finished apartment',
  },
];

// ==================== BOLT-UP CUSTOM QUOTE FORM ====================

interface FormSection {
  title: string;
  fields: FormField[];
}

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  options?: string[];
  fullWidth?: boolean;
}

const BOLT_UP_FORM_SECTIONS: FormSection[] = [
  {
    title: 'Building Use & Purpose',
    fields: [
      { key: 'buildingUse', label: 'Primary Use', type: 'select', options: [
        '', 'Commercial', 'Industrial', 'Agricultural', 'Warehouse', 'Workshop', 'Retail', 'Office', 'Church', 'Recreational', 'Other'
      ]},
      { key: 'useDetails', label: 'Describe your planned use', type: 'textarea', placeholder: 'Tell us more about how you plan to use this building...', fullWidth: true },
    ],
  },
  {
    title: 'Building Dimensions',
    fields: [
      { key: 'width', label: 'Width (ft)', type: 'text', placeholder: 'e.g. 60' },
      { key: 'length', label: 'Length (ft)', type: 'text', placeholder: 'e.g. 100' },
      { key: 'eaveHeight', label: 'Eave Height (ft)', type: 'text', placeholder: 'e.g. 16' },
      { key: 'roofPitch', label: 'Roof Pitch', type: 'select', options: ['', '1:12', '2:12', '3:12', '4:12', '5:12', '6:12'] },
      { key: 'framingType', label: 'Framing Type', type: 'select', options: ['', 'Clear Span', 'Multi-Span', 'Single Slope', 'Not Sure'] },
      { key: 'roofType', label: 'Roof Type', type: 'select', options: ['', 'Gable', 'Single Slope', 'Not Sure'] },
    ],
  },
  {
    title: 'Location & Engineering',
    fields: [
      { key: 'siteCity', label: 'Site City', type: 'text', placeholder: 'City name' },
      { key: 'siteZip', label: 'Site Zip Code', type: 'text', placeholder: '77001' },
      { key: 'windSpeed', label: 'Wind Speed (mph)', type: 'select', options: ['', '90', '100', '110', '120', '130', '140', '150', 'Not Sure'] },
      { key: 'snowLoad', label: 'Snow Load (psf)', type: 'text', placeholder: 'e.g. 20 or N/A' },
      { key: 'collateralLoad', label: 'Collateral Load (psf)', type: 'text', placeholder: 'e.g. 5 or N/A' },
    ],
  },
  {
    title: 'Door & Window Openings',
    fields: [
      { key: 'overheadDoors', label: 'Overhead Doors', type: 'textarea', placeholder: 'Size and qty (e.g. 2x 12\'x14\', 1x 10\'x10\')', fullWidth: true },
      { key: 'walkDoors', label: 'Walk Doors', type: 'text', placeholder: 'e.g. 2x 3070 walk doors' },
      { key: 'windows', label: 'Windows', type: 'text', placeholder: 'e.g. 4x 4\'x4\' windows' },
      { key: 'loadingDocks', label: 'Loading Docks', type: 'text', placeholder: 'e.g. 1x dock leveler' },
    ],
  },
  {
    title: 'Wall & Roof Systems',
    fields: [
      { key: 'wallPanelType', label: 'Wall Panel Type', type: 'select', options: ['', 'PBR (Standard)', 'Standing Seam', 'Insulated Panel (IMP)', 'Not Sure'] },
      { key: 'wallInsulation', label: 'Wall Insulation', type: 'select', options: ['', 'None', 'R-13 Vinyl Backed', 'R-19 Vinyl Backed', 'R-25 Vinyl Backed', 'Spray Foam', 'Not Sure'] },
      { key: 'roofInsulation', label: 'Roof Insulation', type: 'select', options: ['', 'None', 'R-13 Vinyl Backed', 'R-19 Vinyl Backed', 'R-25 Vinyl Backed', 'Spray Foam', 'Not Sure'] },
    ],
  },
  {
    title: 'Special Features & Add-Ons',
    fields: [
      { key: 'hasMezzanine', label: 'Mezzanine', type: 'checkbox' },
      { key: 'hasCrane', label: 'Overhead Crane', type: 'checkbox' },
      { key: 'hasSkylights', label: 'Skylights', type: 'checkbox' },
      { key: 'hasCanopies', label: 'Canopies / Awnings', type: 'checkbox' },
      { key: 'hasGutters', label: 'Gutters & Downspouts', type: 'checkbox' },
      { key: 'hasSprinklers', label: 'Fire Sprinkler Prep', type: 'checkbox' },
    ],
  },
  {
    title: 'Timeline & Budget',
    fields: [
      { key: 'timeline', label: 'Desired Timeline', type: 'select', options: ['', 'ASAP', '1-3 Months', '3-6 Months', '6-12 Months', 'Just Getting Pricing'] },
      { key: 'budget', label: 'Approximate Budget', type: 'select', options: ['', 'Under $100K', '$100K - $250K', '$250K - $500K', '$500K - $1M', 'Over $1M', 'Need Quote First'] },
    ],
  },
  {
    title: 'Additional Notes',
    fields: [
      { key: 'additionalNotes', label: 'Anything else we should know?', type: 'textarea', placeholder: 'Special requirements, site conditions, existing structures, permits, etc.', fullWidth: true },
    ],
  },
];

// ==================== COMPONENT ====================

export function Step2BuildingType() {
  const { building, setBuildingConfig, boltUpQuote, setBoltUpQuote } = useEstimatorStore();
  const [boltUpExpanded, setBoltUpExpanded] = useState(false);

  const handleSelectType = (type: BuildingType) => {
    setBuildingConfig({ buildingType: type });
  };

  const handleBoltUpFieldChange = (key: string, value: string | boolean) => {
    setBoltUpQuote({ [key]: value });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* ===== BOLT-UP CUSTOM QUOTE BANNER (TOP) ===== */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => setBoltUpExpanded(!boltUpExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span className="text-lg font-bold tracking-wide">Custom: Bolt Up Options</span>
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${boltUpExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Bolt-Up Dropdown Form */}
        <AnimatePresence>
          {boltUpExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border border-gray-200 border-t-0 rounded-b-lg bg-white p-6 space-y-6">
                <p className="text-sm text-gray-500">
                  Pre-engineered bolt-together steel buildings are custom quoted. Fill out the details below and we will prepare a detailed proposal.
                </p>

                {BOLT_UP_FORM_SECTIONS.map((section) => (
                  <div key={section.title}>
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                      {section.title}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.fields.map((field) => {
                        const colSpan = field.fullWidth ? 'sm:col-span-2' : '';

                        if (field.type === 'checkbox') {
                          return (
                            <label key={field.key} className={`flex items-center gap-2 cursor-pointer ${colSpan}`}>
                              <input
                                type="checkbox"
                                checked={!!(boltUpQuote as any)?.[field.key]}
                                onChange={(e) => handleBoltUpFieldChange(field.key, e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                              />
                              <span className="text-sm text-gray-700">{field.label}</span>
                            </label>
                          );
                        }

                        if (field.type === 'select') {
                          return (
                            <div key={field.key} className={colSpan}>
                              <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                              <select
                                value={(boltUpQuote as any)?.[field.key] || ''}
                                onChange={(e) => handleBoltUpFieldChange(field.key, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              >
                                {field.options?.map((opt) => (
                                  <option key={opt} value={opt}>{opt || '-- Select --'}</option>
                                ))}
                              </select>
                            </div>
                          );
                        }

                        if (field.type === 'textarea') {
                          return (
                            <div key={field.key} className={colSpan}>
                              <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                              <textarea
                                value={(boltUpQuote as any)?.[field.key] || ''}
                                onChange={(e) => handleBoltUpFieldChange(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                          );
                        }

                        // text input
                        return (
                          <div key={field.key} className={colSpan}>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                            <input
                              type="text"
                              value={(boltUpQuote as any)?.[field.key] || ''}
                              onChange={(e) => handleBoltUpFieldChange(field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Submit / Request Quote Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // Mark the building type as bolt-up so the summary knows
                      handleSelectType('bolt-up');
                      setBoltUpExpanded(false);
                    }}
                    className="w-full sm:w-auto px-8 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Submit Custom Quote Request
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ===== PROMPT TEXT ===== */}
      <motion.p variants={itemVariants} className="text-gray-600">
        Or choose a standard building type for instant pricing:
      </motion.p>

      {/* ===== 4 MAIN BUILDING TYPES — SIDE BY SIDE ===== */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {MAIN_BUILDING_TYPES.map((option) => {
            const isSelected = building.buildingType === option.type;
            const sizes = getBuildingSizes(option.type);
            const lowestPrice = sizes[0]?.startingPrice ?? 0;

            return (
              <button
                key={option.type}
                onClick={() => handleSelectType(option.type)}
                className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/10'
                    : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md cursor-pointer'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    SELECTED
                  </span>
                )}

                <h3 className={`text-base font-bold mb-1 ${
                  isSelected ? 'text-orange-700' : 'text-gray-800'
                }`}>
                  {option.label}
                </h3>
                <p className={`text-xs mb-3 leading-snug ${
                  isSelected ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {option.description}
                </p>
                <p className={`text-sm font-bold ${
                  isSelected ? 'text-orange-500' : 'text-gray-700'
                }`}>
                  From ${lowestPrice.toLocaleString()}
                </p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ===== CG INFO BANNER ===== */}
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
