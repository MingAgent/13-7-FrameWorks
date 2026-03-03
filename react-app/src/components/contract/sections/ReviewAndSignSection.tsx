import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, CreditCard, Building2, User, FileCheck } from 'lucide-react';
import { SignaturePad } from '../SignaturePad';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { PAYMENT_METHODS, COMPANY_INFO } from '../../../constants/contractTerms';
import { DRAW_SCHEDULE } from '../../../constants/pricing';
import { ROOF_COLORS, WALL_COLORS, TRIM_COLORS, DOOR_COLORS } from '../../../constants/colors';

interface ReviewAndSignSectionProps {
  ownerSignature: string | null;
  ownerTypedName: string;
  contractorSignature: string | null;
  contractorTypedName: string;
  paymentMethod: string | null;
  onOwnerSignatureChange: (signature: string | null, typedName: string) => void;
  onContractorSignatureChange: (signature: string | null, typedName: string) => void;
  onPaymentMethodChange: (method: string) => void;
  allSectionsComplete: boolean;
}

export function ReviewAndSignSection({
  ownerSignature,
  ownerTypedName,
  contractorSignature,
  contractorTypedName,
  paymentMethod,
  onOwnerSignatureChange,
  onContractorSignatureChange,
  onPaymentMethodChange,
  allSectionsComplete
}: ReviewAndSignSectionProps) {
  const { customer, building, pricing, colors, accessories, concrete } = useEstimatorStore();
  const [localOwnerName, setLocalOwnerName] = useState(ownerTypedName || customer.name || '');
  const [localContractorName, setLocalContractorName] = useState(contractorTypedName || '');

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleOwnerSignatureChange = (_hasSignature: boolean, dataUrl: string | null) => {
    onOwnerSignatureChange(dataUrl, localOwnerName);
  };

  const handleContractorSignatureChange = (_hasSignature: boolean, dataUrl: string | null) => {
    onContractorSignatureChange(dataUrl, localContractorName);
  };

  const isOwnerComplete = ownerSignature && localOwnerName.trim().length > 0;
  const isContractorComplete = contractorSignature && localContractorName.trim().length > 0;
  const isPaymentSelected = paymentMethod !== null;

  // Get color names
  const getColorName = (hex: string, colorList: { hex: string; name: string }[]) =>
    colorList.find(c => c.hex === hex)?.name || 'Custom';

  // Calculate draw amounts from centralized schedule
  const drawAmounts = DRAW_SCHEDULE.map(d => ({
    ...d,
    amount: pricing.grandTotal * d.percent
  }));

  const sqft = building.width * building.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">3. Review & Sign</h2>
        <p className="text-gray-500 mt-1">
          Review your building configuration and sign to finalize the contract
        </p>
      </div>

      {/* Completion Check */}
      {!allSectionsComplete && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Incomplete Sections</p>
            <p className="text-sm text-red-300 mt-1">
              Please complete all previous sections (checkbox and initials) before signing the contract.
            </p>
          </div>
        </div>
      )}

      {/* Customer Information Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-[#14B8A6]" />
          <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-gray-900 font-medium">{customer.name || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-400">Phone</p>
            <p className="text-gray-900 font-medium">{customer.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-400">Email</p>
            <p className="text-gray-900 font-medium">{customer.email || 'Not provided'}</p>
          </div>
          {customer.address && (
            <div className="md:col-span-3">
              <p className="text-gray-400">Property Address</p>
              <p className="text-gray-900 font-medium">{customer.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Building Configuration Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-[#14B8A6]" />
          <h3 className="text-lg font-semibold text-gray-900">Building Configuration</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Dimensions</p>
            <p className="text-gray-900 font-medium">{building.width}' × {building.length}'</p>
          </div>
          <div>
            <p className="text-gray-400">Eave Height</p>
            <p className="text-gray-900 font-medium">{building.height} ft</p>
          </div>
          <div>
            <p className="text-gray-400">Total Area</p>
            <p className="text-gray-900 font-medium">{sqft.toLocaleString()} sq ft</p>
          </div>
          <div>
            <p className="text-gray-400">Building Type</p>
            <p className="text-gray-900 font-medium capitalize">
              {building.buildingType === 'pole-barn' ? 'Pole Barn' :
               building.buildingType === 'carport' ? 'Carport' :
               building.buildingType === 'i-beam' ? 'I-Beam Construction' : 'Bolt Up'}
            </p>
          </div>
        </div>

        {/* Colors */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Colors</p>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Walls', color: colors.walls, colorList: WALL_COLORS },
              { label: 'Roof', color: colors.roof, colorList: ROOF_COLORS },
              { label: 'Trim', color: colors.trim, colorList: TRIM_COLORS },
              { label: 'Doors', color: colors.doors, colorList: DOOR_COLORS }
            ].map(({ label, color, colorList }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm text-gray-900">{getColorName(color, colorList)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Features & Accessories</p>
          <ul className="text-sm space-y-1 text-gray-500">
            <li>• {accessories.walkDoors.length} Walk-through Door{accessories.walkDoors.length !== 1 ? 's' : ''}</li>
            <li>• {accessories.rollUpDoors.length} Overhead Door{accessories.rollUpDoors.length !== 1 ? 's' : ''}</li>
            {accessories.windows.length > 0 && (
              <li>• {accessories.windows.length} Window{accessories.windows.length !== 1 ? 's' : ''}</li>
            )}
            {accessories.insulation !== 'none' && (
              <li>• {accessories.insulation === 'full' ? 'Wall & Roof' :
                accessories.insulation === 'wall' ? 'Wall' : 'Roof'} Insulation</li>
            )}
            {accessories.gutters && <li>• Gutters & Downspouts</li>}
            {concrete.type === 'slab' && <li>• Concrete Slab</li>}
          </ul>
        </div>
      </div>

      {/* Contract Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="w-5 h-5 text-[#14B8A6]" />
          <h3 className="text-lg font-semibold text-gray-900">Contract Summary</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Contract Date:</span>
            <p className="text-gray-900 font-medium">{currentDate}</p>
          </div>
          <div>
            <span className="text-gray-500">Contract Sum:</span>
            <p className="text-[#14B8A6] font-bold text-xl">${pricing.grandTotal.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-500">Contractor:</span>
            <p className="text-gray-900 font-medium">{COMPANY_INFO.legalName}</p>
          </div>
          <div>
            <span className="text-gray-500">Owner:</span>
            <p className="text-gray-900 font-medium">{customer.name || 'Not provided'}</p>
          </div>
        </div>

        {/* Draw Schedule Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Payment Schedule</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {drawAmounts.map((draw) => (
              <div key={draw.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">{draw.label} ({Math.round(draw.percent * 100)}%)</p>
                <p className="text-gray-900 font-medium">${draw.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{draw.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            By signing below, both parties agree to be bound by all terms and conditions
            set forth in this Contract Agreement.
          </p>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#14B8A6]" />
          Payment Method for First Draw
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          Select how you would like to pay the first draw (${drawAmounts[0].amount.toLocaleString()}) upon contract signing:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => onPaymentMethodChange(method.id)}
              disabled={!allSectionsComplete}
              className={`
                p-3 rounded-lg border-2 text-sm font-medium transition-all
                ${!allSectionsComplete ? 'opacity-50 cursor-not-allowed' : ''}
                ${paymentMethod === method.id
                  ? 'border-[#14B8A6] bg-[#14B8A6]/10 text-[#14B8A6]'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900'
                }
              `}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>

      {/* Owner Signature */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Owner Signature</h3>
          {isOwnerComplete && (
            <span className="flex items-center gap-1 text-[#14B8A6] text-sm">
              <Check className="w-4 h-4" />
              Complete
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Print Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={localOwnerName}
              onChange={(e) => {
                setLocalOwnerName(e.target.value);
                if (ownerSignature) {
                  onOwnerSignatureChange(ownerSignature, e.target.value);
                }
              }}
              placeholder="Enter your full legal name"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#14B8A6] focus:outline-none transition-colors"
              disabled={!allSectionsComplete}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2">Date</label>
            <input
              type="text"
              value={currentDate}
              readOnly
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-400"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-500 mb-2">
            Signature <span className="text-red-400">*</span>
          </label>
          <SignaturePad
            label="Owner Signature"
            required
            initialValue={ownerSignature}
            onSignatureChange={handleOwnerSignatureChange}
            disabled={!allSectionsComplete}
          />
        </div>
      </div>

      {/* Contractor Signature */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Contractor Signature</h3>
          {isContractorComplete && (
            <span className="flex items-center gap-1 text-[#14B8A6] text-sm">
              <Check className="w-4 h-4" />
              Complete
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Print Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={localContractorName}
              onChange={(e) => {
                setLocalContractorName(e.target.value);
                if (contractorSignature) {
                  onContractorSignatureChange(contractorSignature, e.target.value);
                }
              }}
              placeholder="Contractor representative name"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#14B8A6] focus:outline-none transition-colors"
              disabled={!allSectionsComplete}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2">Date</label>
            <input
              type="text"
              value={currentDate}
              readOnly
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-400"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-500 mb-2">
            Signature <span className="text-red-400">*</span>
          </label>
          <SignaturePad
            label="Contractor Signature"
            required
            initialValue={contractorSignature}
            onSignatureChange={handleContractorSignatureChange}
            disabled={!allSectionsComplete}
          />
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Signing on behalf of {COMPANY_INFO.legalName}
        </p>
      </div>

      {/* Final Notice */}
      {isOwnerComplete && isContractorComplete && isPaymentSelected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded-xl p-6 text-center"
        >
          <Check className="w-12 h-12 text-[#14B8A6] mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Contract Ready for Submission</h3>
          <p className="text-gray-500">
            All signatures have been collected. Click "Submit Contract" to finalize and
            download your signed contract.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default ReviewAndSignSection;
