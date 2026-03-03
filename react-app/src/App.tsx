import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepWizard } from './components/layout/StepWizard';
import Header from './components/layout/Header/Header';
import { useEstimatorStore } from './store/estimatorStore';
import { ContractWizard } from './components/contract';

// Import step components
import Step1CustomerInfo from './components/estimator/steps/Step1CustomerInfo';
import Step2BuildingType from './components/estimator/steps/Step2BuildingType';
import Step3BuildingSize from './components/estimator/steps/Step2BuildingSize';
import Step4EaveHeight from './components/estimator/steps/Step3EaveHeight';
import Step5DoorsWindows from './components/estimator/steps/Step4Doors';
import Step6Colors from './components/estimator/steps/Step5Colors';
import Step7AddOns from './components/estimator/steps/Step6AddOns';
import Step8Summary from './components/estimator/steps/Step7Summary';

const steps = [
  { id: 1, title: 'Customer Info', component: <Step1CustomerInfo /> },
  { id: 2, title: 'Building Type', component: <Step2BuildingType /> },
  { id: 3, title: 'Building Size', component: <Step3BuildingSize /> },
  { id: 4, title: 'Eave Height & Carport', component: <Step4EaveHeight /> },
  { id: 5, title: 'Doors & Windows', component: <Step5DoorsWindows /> },
  { id: 6, title: 'Colors', component: <Step6Colors /> },
  { id: 7, title: 'Add-Ons', component: <Step7AddOns /> },
  { id: 8, title: 'Summary', component: <Step8Summary /> }
];

function App() {
  const { currentStep, nextStep, prevStep, goToStep, calculatePricing } = useEstimatorStore();
  const [showContract, setShowContract] = useState(false);

  // Calculate pricing on initial load
  useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);

  // Listen for contract view triggers
  useEffect(() => {
    const handleShowContract = () => setShowContract(true);
    const handleHideContract = () => setShowContract(false);

    window.addEventListener('showContract', handleShowContract);
    window.addEventListener('hideContract', handleHideContract);

    return () => {
      window.removeEventListener('showContract', handleShowContract);
      window.removeEventListener('hideContract', handleHideContract);
    };
  }, []);

  // Render contract wizard if in contract mode
  if (showContract) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="contract"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ContractWizard />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: '#141d31',
        backgroundImage: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            #1e2a45 35px,
            #1e2a45 36px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 35px,
            #1e2a45 35px,
            #1e2a45 36px
          )
        `,
      }}
    >
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Metal Building Estimator</h1>
          <p className="text-orange-100 text-lg">
            Get an instant quote for your custom metal building
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepWizard
          steps={steps}
          currentStep={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
          onStepClick={goToStep}
        />
      </main>

      {/* Footer */}
      <footer className="bg-[#141d31] border-t border-white/10 text-[#A3A3A3] py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-baseline gap-2 mb-4" style={{ transform: 'skewX(-12deg)' }}>
                <span className="text-2xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>13</span>
                <div className="w-0.5 h-6 bg-[#FF6A00]" />
                <span className="text-2xl font-black text-[#FF6A00]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>7</span>
                <span className="text-lg font-bold text-white uppercase tracking-wider ml-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>FrameWorks</span>
              </div>
              <p className="text-sm">
                Quality metal buildings designed and installed with precision.
                Serving residential and commercial customers since 2010.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Contact</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2"><span className="text-[#FF6A00]">•</span> (123) 456-7890</li>
                <li className="flex items-center gap-2"><span className="text-[#FF6A00]">•</span> info@137frameworks.com</li>
                <li className="flex items-center gap-2"><span className="text-[#FF6A00]">•</span> Mon-Fri 8am-6pm</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Service Area</h3>
              <p className="text-sm">
                We proudly serve Texas and surrounding states.
                Contact us for availability in your area.
              </p>
            </div>
          </div>
          <div className="border-t border-white/8 mt-8 pt-8 text-center text-sm text-[#666666]">
            <p>&copy; {new Date().getFullYear()} 13|7 FrameWorks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
