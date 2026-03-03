import { motion } from 'framer-motion';
import { FileText, DollarSign, Clock } from 'lucide-react';
import { ContractSection, TermSection } from '../ContractSection';
import { CONTRACT_TERMS } from '../../../constants/contractTerms';
import { DRAW_SCHEDULE } from '../../../constants/pricing';
import { useEstimatorStore } from '../../../store/estimatorStore';

interface TermsAndConditionsSectionProps {
  isChecked: boolean;
  isInitialed: boolean;
  initialsData: string | null;
  onCheckChange: (checked: boolean) => void;
  onInitialsChange: (hasInitials: boolean, dataUrl: string | null) => void;
}

export function TermsAndConditionsSection({
  isChecked,
  isInitialed,
  initialsData,
  onCheckChange,
  onInitialsChange
}: TermsAndConditionsSectionProps) {
  const { customer, building, pricing } = useEstimatorStore();
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
        <h2 className="text-2xl font-bold text-gray-900">1. Terms & Conditions</h2>
        <p className="text-gray-500 mt-1">
          Please read and acknowledge the project overview, payment terms, and timeline
        </p>
      </div>

      {/* Contract Summary Card */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Customer</p>
            <p className="text-gray-900 font-medium">{customer.name || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-gray-400">Building Size</p>
            <p className="text-gray-900 font-medium">{building.width}' × {building.length}' ({sqft.toLocaleString()} sq ft)</p>
          </div>
          <div>
            <p className="text-gray-400">Eave Height</p>
            <p className="text-gray-900 font-medium">{building.height} ft</p>
          </div>
          <div>
            <p className="text-gray-400">Contract Sum</p>
            <p className="text-[#14B8A6] font-bold text-lg">${pricing.grandTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Combined Contract Terms */}
      <ContractSection
        requiresAck={true}
        isChecked={isChecked}
        isInitialed={isInitialed}
        initialsData={initialsData}
        onCheckChange={onCheckChange}
        onInitialsChange={onInitialsChange}
      >
        <div className="space-y-8">
          {/* Project Overview */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <FileText className="w-5 h-5 text-[#14B8A6]" />
              <h3 className="text-lg font-semibold text-gray-900">Project Overview</h3>
            </div>
            <div className="space-y-6">
              {CONTRACT_TERMS.projectOverview.sections.map((section, idx) => (
                <TermSection
                  key={`overview-${idx}`}
                  heading={section.heading}
                  content={section.content}
                />
              ))}
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <DollarSign className="w-5 h-5 text-[#14B8A6]" />
              <h3 className="text-lg font-semibold text-gray-900">Payment Terms</h3>
            </div>
            <div className="space-y-6">
              {CONTRACT_TERMS.paymentTerms.sections.map((section, idx) => (
                <TermSection
                  key={`payment-${idx}`}
                  heading={section.heading}
                  content={section.content}
                />
              ))}
            </div>

            {/* Draw Schedule Breakdown */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Your Draw Schedule</h4>
              <div className="space-y-2 text-sm">
                {DRAW_SCHEDULE.map((draw, idx) => (
                  <div
                    key={draw.label}
                    className={`flex justify-between ${idx === DRAW_SCHEDULE.length - 1 ? 'border-t border-gray-200 pt-2' : ''}`}
                  >
                    <span className="text-gray-500">{draw.label} ({Math.round(draw.percent * 100)}%) - {draw.description}</span>
                    <span className="text-gray-900 font-medium">${(pricing.grandTotal * draw.percent).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline & Changes */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <Clock className="w-5 h-5 text-[#14B8A6]" />
              <h3 className="text-lg font-semibold text-gray-900">Timeline & Changes</h3>
            </div>
            <div className="space-y-6">
              {CONTRACT_TERMS.timeline.sections.map((section, idx) => (
                <TermSection
                  key={`timeline-${idx}`}
                  heading={section.heading}
                  content={section.content}
                />
              ))}
            </div>
          </div>
        </div>
      </ContractSection>
    </motion.div>
  );
}

export default TermsAndConditionsSection;
