import { motion } from 'framer-motion';
import { ContractSection, TermSection } from '../ContractSection';
import { CONTRACT_TERMS } from '../../../constants/contractTerms';
import { DRAW_SCHEDULE } from '../../../constants/pricing';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { itemVariants } from '../../../animations/variants';

interface PaymentTermsSectionProps {
  isChecked: boolean;
  isInitialed: boolean;
  initialsData: string | null;
  onCheckChange: (checked: boolean) => void;
  onInitialsChange: (hasInitials: boolean, dataUrl: string | null) => void;
}

export function PaymentTermsSection({
  isChecked,
  isInitialed,
  initialsData,
  onCheckChange,
  onInitialsChange
}: PaymentTermsSectionProps) {
  const { pricing } = useEstimatorStore();
  const terms = CONTRACT_TERMS.paymentTerms;

  // Calculate draw amounts from centralized schedule
  const drawAmounts = DRAW_SCHEDULE.map(d => ({
    ...d,
    amount: pricing.grandTotal * d.percent
  }));

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      {/* Section Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">2. {terms.title}</h2>
        <p className="text-[#A3A3A3] mt-1">
          Review the payment schedule and terms for your project
        </p>
      </div>

      {/* Payment Summary Card */}
      <div className="bg-gradient-to-br from-[#14B8A6]/20 to-[#14B8A6]/5 rounded-xl border border-[#14B8A6]/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Payment Schedule</h3>

        <div className="space-y-3">
          {drawAmounts.map((draw, idx) => (
            <div
              key={draw.label}
              className={`flex justify-between items-center py-2 ${idx < drawAmounts.length - 1 ? 'border-b border-white/10' : ''}`}
            >
              <div>
                <span className="text-white font-medium">{draw.label} ({Math.round(draw.percent * 100)}%)</span>
                <p className="text-xs text-[#A3A3A3]">Due {draw.description.toLowerCase()}</p>
              </div>
              <span className={`font-bold text-lg ${idx === 0 ? 'text-[#14B8A6]' : 'text-white'}`}>
                ${draw.amount.toLocaleString()}
              </span>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4 border-t border-[#14B8A6]/30">
            <span className="text-white font-bold">Total Contract Sum</span>
            <span className="text-[#14B8A6] font-bold text-2xl">${pricing.grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Contract Terms */}
      <ContractSection
        title={terms.title}
        requiresAck={true}
        isChecked={isChecked}
        isInitialed={isInitialed}
        initialsData={initialsData}
        onCheckChange={onCheckChange}
        onInitialsChange={onInitialsChange}
      >
        <div className="space-y-6">
          {terms.sections.map((section, idx) => (
            <TermSection
              key={idx}
              heading={section.heading}
              content={section.content}
            />
          ))}
        </div>
      </ContractSection>
    </motion.div>
  );
}

export default PaymentTermsSection;
