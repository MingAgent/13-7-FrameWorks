import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, FileText, Download, Send, Loader2, HardHat, Check, Wrench } from 'lucide-react';
import { ContractProgress } from './ContractProgress';
import {
  TermsAndConditionsSection,
  ResponsibilitiesAndLegalSection,
  ReviewAndSignSection
} from './sections';
import { CONTRACT_SECTIONS } from '../../constants/contractTerms';
import { useEstimatorStore } from '../../store/estimatorStore';
import { downloadContractPdf } from '../../utils/pdf/contractPdf';
import { downloadConstructionPlan } from '../../utils/pdf/constructionPlan';
import { createConstructionPlanRecord, isAirtableConfigured } from '../../utils/airtable';
import { generatePlans, isPlanServerAvailable, type PlanGenerationResult } from '../../utils/planService';
import Button from '../common/Button/Button';
import { containerVariants } from '../../animations/variants';
import type { ContractConfig, PaymentMethod } from '../../types/estimator';

// Types for section state
interface SectionState {
  checked: boolean;
  initialed: boolean;
  initialsData: string | null;
}

interface SignatureState {
  ownerSignature: string | null;
  ownerTypedName: string;
  contractorSignature: string | null;
  contractorTypedName: string;
}

export function ContractWizard() {
  const { customer, building, accessories, colors, concrete, pricing, calculatePricing } = useEstimatorStore();

  // Recalculate pricing on mount to ensure correct values
  useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);

  // Go back to estimate view
  const handleBackToEstimate = () => {
    window.dispatchEvent(new Event('hideContract'));
  };

  // Local state for contract sections
  const [currentSection, setCurrentSection] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingToTeam, setIsSendingToTeam] = useState(false);
  const [sentToTeam, setSentToTeam] = useState(false);

  // Plan generation state
  const [isGeneratingPlans, setIsGeneratingPlans] = useState(false);
  const [planResult, setPlanResult] = useState<PlanGenerationResult | null>(null);
  const [planServerOnline, setPlanServerOnline] = useState<boolean | null>(null);

  // Check if local plan server is running when contract opens
  useEffect(() => {
    isPlanServerAvailable().then(setPlanServerOnline);
  }, []);

  // Section acknowledgment states for the 2 acknowledgment sections
  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>({
    termsAndConditions: { checked: false, initialed: false, initialsData: null },
    responsibilitiesAndLegal: { checked: false, initialed: false, initialsData: null }
  });

  // Signature states
  const [signatures, setSignatures] = useState<SignatureState>({
    ownerSignature: null,
    ownerTypedName: '',
    contractorSignature: null,
    contractorTypedName: ''
  });

  // Check if a section is complete
  const isSectionComplete = useCallback((sectionId: string): boolean => {
    const section = CONTRACT_SECTIONS.find(s => s.id === sectionId);
    if (!section) return false;

    // Review & Sign section (doesn't require checkbox/initials - needs signatures)
    if (sectionId === 'reviewAndSign') {
      return (
        signatures.ownerSignature !== null &&
        signatures.ownerTypedName.trim().length > 0 &&
        signatures.contractorSignature !== null &&
        signatures.contractorTypedName.trim().length > 0 &&
        paymentMethod !== null
      );
    }

    // Sections that require acknowledgment (checkbox + initials)
    if (section.requiresAck) {
      const state = sectionStates[sectionId];
      return state?.checked && state?.initialed;
    }

    return true;
  }, [signatures, paymentMethod, sectionStates]);

  // Get completed sections
  const completedSections = useMemo(() => {
    const completed = new Set<string>();
    CONTRACT_SECTIONS.forEach(section => {
      if (isSectionComplete(section.id)) {
        completed.add(section.id);
      }
    });
    return completed;
  }, [isSectionComplete]);

  // Check if all acknowledgment sections are complete
  const allAckSectionsComplete = useMemo(() => {
    return CONTRACT_SECTIONS
      .filter(s => s.requiresAck)
      .every(s => isSectionComplete(s.id));
  }, [isSectionComplete]);

  // Check if entire contract is complete
  const isContractComplete = useMemo(() => {
    return completedSections.size === CONTRACT_SECTIONS.length;
  }, [completedSections]);

  // Check if current section allows navigation
  const canProceed = useMemo(() => {
    const current = CONTRACT_SECTIONS[currentSection];
    if (!current) return false;

    // Review & Sign section - check all fields
    if (current.id === 'reviewAndSign') {
      return isSectionComplete('reviewAndSign');
    }

    // Acknowledgment sections need checkbox + initials
    if (current.requiresAck) {
      return isSectionComplete(current.id);
    }

    return true;
  }, [currentSection, isSectionComplete]);

  // Handle section state updates
  const handleCheckChange = (sectionId: string, checked: boolean) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], checked }
    }));
  };

  const handleInitialsChange = (sectionId: string, hasInitials: boolean, dataUrl: string | null) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        initialed: hasInitials,
        initialsData: dataUrl
      }
    }));
  };

  // Handle signature updates
  const handleOwnerSignature = (signature: string | null, typedName: string) => {
    setSignatures(prev => ({
      ...prev,
      ownerSignature: signature,
      ownerTypedName: typedName
    }));
  };

  const handleContractorSignature = (signature: string | null, typedName: string) => {
    setSignatures(prev => ({
      ...prev,
      contractorSignature: signature,
      contractorTypedName: typedName
    }));
  };

  // Navigation
  const goToNextSection = () => {
    if (currentSection < CONTRACT_SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const goToPrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const goToSection = (index: number) => {
    setCurrentSection(index);
  };

  // Build contract config from local state for PDF
  const buildContractConfig = (): ContractConfig => {
    return {
      currentSection,
      sections: {
        // Map the condensed sections to the expected structure for PDF
        projectOverview: {
          checked: sectionStates.termsAndConditions.checked,
          initialed: sectionStates.termsAndConditions.initialed,
          initialsData: sectionStates.termsAndConditions.initialsData,
          timestamp: sectionStates.termsAndConditions.checked ? new Date().toISOString() : null
        },
        paymentTerms: {
          checked: sectionStates.termsAndConditions.checked,
          initialed: sectionStates.termsAndConditions.initialed,
          initialsData: sectionStates.termsAndConditions.initialsData,
          timestamp: sectionStates.termsAndConditions.checked ? new Date().toISOString() : null
        },
        timeline: {
          checked: sectionStates.termsAndConditions.checked,
          initialed: sectionStates.termsAndConditions.initialed,
          initialsData: sectionStates.termsAndConditions.initialsData,
          timestamp: sectionStates.termsAndConditions.checked ? new Date().toISOString() : null
        },
        responsibilities: {
          checked: sectionStates.responsibilitiesAndLegal.checked,
          initialed: sectionStates.responsibilitiesAndLegal.initialed,
          initialsData: sectionStates.responsibilitiesAndLegal.initialsData,
          timestamp: sectionStates.responsibilitiesAndLegal.checked ? new Date().toISOString() : null
        },
        warranties: {
          checked: sectionStates.responsibilitiesAndLegal.checked,
          initialed: sectionStates.responsibilitiesAndLegal.initialed,
          initialsData: sectionStates.responsibilitiesAndLegal.initialsData,
          timestamp: sectionStates.responsibilitiesAndLegal.checked ? new Date().toISOString() : null
        },
        legalProvisions: {
          checked: sectionStates.responsibilitiesAndLegal.checked,
          initialed: sectionStates.responsibilitiesAndLegal.initialed,
          initialsData: sectionStates.responsibilitiesAndLegal.initialsData,
          timestamp: sectionStates.responsibilitiesAndLegal.checked ? new Date().toISOString() : null
        }
      },
      signatures: {
        ownerSignature: signatures.ownerSignature,
        ownerTypedName: signatures.ownerTypedName,
        ownerSignedAt: signatures.ownerSignature ? new Date().toISOString() : null,
        contractorSignature: signatures.contractorSignature,
        contractorTypedName: signatures.contractorTypedName,
        contractorSignedAt: signatures.contractorSignature ? new Date().toISOString() : null
      },
      paymentMethod: paymentMethod as PaymentMethod,
      agreedToTerms: isContractComplete,
      depositPaid: false,
      contractSent: false,
      contractSentAt: null
    };
  };

  // Generate professional construction plans via local Python server
  const handleGeneratePlans = async () => {
    setIsGeneratingPlans(true);
    try {
      const result = await generatePlans(
        {
          buildingType: building.buildingType,
          width: building.width,
          length: building.length,
          height: building.height,
        },
        {
          name: customer.name,
          constructionAddress: customer.constructionAddress || undefined,
        }
      );
      if (result && result.success) {
        setPlanResult(result);
        alert(`✅ ${result.passed} construction plan sheets generated successfully!`);
      } else {
        alert('Plan generation failed. Make sure the plan server is running:\n\npython plan_server.py');
      }
    } catch (error) {
      console.error('Plan generation error:', error);
      alert('Could not connect to the plan server.\n\nStart it with: python plan_server.py');
    } finally {
      setIsGeneratingPlans(false);
    }
  };

  // Download PDF handler
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadContractPdf({
        customer,
        building,
        accessories,
        colors,
        concrete,
        pricing,
        contract: buildContractConfig(),
        planResult: planResult || undefined,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error generating PDF:', error);
      alert(`PDF error: ${msg}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Submit contract handler
  const handleSubmitContract = async () => {
    setIsSubmitting(true);
    try {
      // Download the PDF first
      await downloadContractPdf({
        customer,
        building,
        accessories,
        colors,
        concrete,
        pricing,
        contract: buildContractConfig(),
        planResult: planResult || undefined,
      });

      // Here you would also send to a backend, email, etc.
      alert('Contract submitted successfully! A copy has been downloaded to your device.');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error submitting contract:', error);
      alert(`Contract error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send construction plan to team (download + create Airtable record)
  const handleSendToConstructionTeam = async () => {
    setIsSendingToTeam(true);
    try {
      // 1. Download the standalone construction plan PDF
      downloadConstructionPlan({
        customer,
        building,
        accessories,
        concrete,
        colors,
      });

      // 2. Create record in Airtable (if configured)
      if (isAirtableConfigured()) {
        const recordId = await createConstructionPlanRecord({
          customer,
          building,
          pricing,
        });
        if (recordId) {
          console.log('[Airtable] Construction plan record created:', recordId);
        }
      }

      setSentToTeam(true);
      setTimeout(() => setSentToTeam(false), 4000); // Reset after 4s
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error sending to construction team:', error);
      alert(`Construction plan error: ${msg}`);
    } finally {
      setIsSendingToTeam(false);
    }
  };

  // Render current section content
  const renderSection = () => {
    const sectionId = CONTRACT_SECTIONS[currentSection]?.id;

    switch (sectionId) {
      case 'termsAndConditions':
        return (
          <TermsAndConditionsSection
            isChecked={sectionStates.termsAndConditions.checked}
            isInitialed={sectionStates.termsAndConditions.initialed}
            initialsData={sectionStates.termsAndConditions.initialsData}
            onCheckChange={(checked) => handleCheckChange('termsAndConditions', checked)}
            onInitialsChange={(hasInitials, dataUrl) => handleInitialsChange('termsAndConditions', hasInitials, dataUrl)}
          />
        );

      case 'responsibilitiesAndLegal':
        return (
          <ResponsibilitiesAndLegalSection
            isChecked={sectionStates.responsibilitiesAndLegal.checked}
            isInitialed={sectionStates.responsibilitiesAndLegal.initialed}
            initialsData={sectionStates.responsibilitiesAndLegal.initialsData}
            onCheckChange={(checked) => handleCheckChange('responsibilitiesAndLegal', checked)}
            onInitialsChange={(hasInitials, dataUrl) => handleInitialsChange('responsibilitiesAndLegal', hasInitials, dataUrl)}
          />
        );

      case 'reviewAndSign':
        return (
          <ReviewAndSignSection
            ownerSignature={signatures.ownerSignature}
            ownerTypedName={signatures.ownerTypedName}
            contractorSignature={signatures.contractorSignature}
            contractorTypedName={signatures.contractorTypedName}
            paymentMethod={paymentMethod}
            onOwnerSignatureChange={handleOwnerSignature}
            onContractorSignatureChange={handleContractorSignature}
            onPaymentMethodChange={setPaymentMethod}
            allSectionsComplete={allAckSectionsComplete}
          />
        );

      default:
        return null;
    }
  };

  const isLastSection = currentSection === CONTRACT_SECTIONS.length - 1;

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-[#141d31]"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#14B8A6]" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Contract Agreement</h1>
              <p className="text-xs text-gray-500">
                {building.width}' × {building.length}' Metal Building • ${pricing.grandTotal.toLocaleString()}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToEstimate}
            className="text-gray-500 hover:text-gray-900"
          >
            Back to Estimate
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Progress */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ContractProgress
              currentSection={currentSection}
              completedSections={completedSections}
              onSectionClick={goToSection}
            />
          </div>

          {/* Main Section Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={goToPrevSection}
                disabled={currentSection === 0}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Previous
              </Button>

              <div className="flex items-center gap-3">
                {isLastSection && isContractComplete ? (
                  <>
                    {/* Generate Plans Button — calls local Python server */}
                    <Button
                      variant="outline"
                      onClick={handleGeneratePlans}
                      disabled={isGeneratingPlans || planServerOnline === false}
                      leftIcon={
                        planResult ? <Check className="w-4 h-4" /> :
                        isGeneratingPlans ? <Loader2 className="w-4 h-4 animate-spin" /> :
                        <Wrench className="w-4 h-4" />
                      }
                      className={planResult
                        ? "border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/10"
                        : planServerOnline === false
                          ? "border-gray-300 text-gray-400 cursor-not-allowed"
                          : "border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                      }
                      title={planServerOnline === false
                        ? 'Plan server not running. Start with: python plan_server.py'
                        : planResult
                          ? `${planResult.passed} sheets generated`
                          : 'Generate professional construction plans'
                      }
                    >
                      {planResult
                        ? `Plans Ready (${planResult.passed})`
                        : isGeneratingPlans
                          ? 'Generating...'
                          : 'Generate Plans'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSendToConstructionTeam}
                      disabled={isSendingToTeam}
                      leftIcon={
                        sentToTeam ? <Check className="w-4 h-4" /> :
                        isSendingToTeam ? <Loader2 className="w-4 h-4 animate-spin" /> :
                        <HardHat className="w-4 h-4" />
                      }
                      className={sentToTeam
                        ? "border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E]/10"
                        : "border-[#FF6A00] text-[#FF6A00] hover:bg-[#FF6A00]/10"
                      }
                    >
                      {sentToTeam ? 'Sent!' : isSendingToTeam ? 'Sending...' : 'Send to Crew'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      leftIcon={isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      className="border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6]/10"
                    >
                      {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmitContract}
                      disabled={isSubmitting}
                      leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      className="bg-[#14B8A6] hover:bg-[#14B8A6]/90"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Contract'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    onClick={goToNextSection}
                    disabled={!canProceed || isLastSection}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    className="bg-[#14B8A6] hover:bg-[#14B8A6]/90"
                  >
                    {canProceed ? 'Continue' : 'Complete Section to Continue'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ContractWizard;
