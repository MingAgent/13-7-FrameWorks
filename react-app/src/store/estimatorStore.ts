import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  EstimatorStore,
  CustomerInfo,
  BuildingConfig,
  AccessoriesConfig,
  ColorConfig,
  ConcreteConfig,
  ContractConfig,
  ContractSectionState,
  DoorConfig,
  WindowConfig,
  PaymentMethod,
  BoltUpQuote,
  BuildingEntry,
  PricingBreakdown
} from '../types/estimator';
import { calculateTotalPrice } from '../utils/calculations/pricing';
import { DEFAULT_COLORS } from '../constants/colors';
import { getBuildingSizes, getEaveHeights, getDefaultSizeId, getDefaultHeightId } from '../constants/pricing';
import type { BuildingType } from '../types/estimator';

// Initial address structure
const emptyAddress = {
  street: '',
  city: '',
  state: '',
  zip: ''
};

// Initial state values
const initialCustomer: CustomerInfo = {
  name: '',
  email: '',
  phone: '',
  // Legacy fields
  address: '',
  city: '',
  state: '',
  zip: '',
  // New address structure
  billingAddress: { ...emptyAddress },
  constructionAddress: { ...emptyAddress },
  sameAsMailingAddress: false
};

const initialBuilding: BuildingConfig = {
  buildingType: 'pole-barn',
  buildingSizeId: 'pb-30x40',
  eaveHeightId: '10',
  width: 30,
  length: 40,
  height: 10,
  legType: 'standard',
  buildingView: 'front',
  breezeway: {
    frontBack: false,
    sideSide: false
  },
  attachedCarport: {
    enabled: false,
    mode: 'attached',
    attachWall: 'left',
    depth: 12,
    customWidth: null,
    partitionWalls: []
  }
};

const initialAccessories: AccessoriesConfig = {
  walkDoors: [],
  rollUpDoors: [],
  windows: [],
  insulation: 'none',
  ventilation: false,
  gutters: false
};

const initialColors: ColorConfig = {
  roof: DEFAULT_COLORS.roof,
  walls: DEFAULT_COLORS.walls,
  trim: DEFAULT_COLORS.trim,
  doors: DEFAULT_COLORS.doors
};

const initialConcrete: ConcreteConfig = {
  type: 'none',
  existingPad: false,
  thickness: 4,
  carportFoundationType: 'limestone',
  carportExistingPad: false,
  combinedFoundation: true
};

const initialPricing: PricingBreakdown = {
  basePrice: 0,
  accessoriesTotal: 0,
  concreteTotal: 0,
  carportConcreteTotal: 0,
  carportTotal: 0,
  laborTotal: 0,
  deliveryTotal: 0,
  grandTotal: 0,
  depositAmount: 0
};

// Initial section state
const initialSectionState: ContractSectionState = {
  checked: false,
  initialed: false,
  initialsData: null,
  timestamp: null
};

const initialContract: ContractConfig = {
  currentSection: 0,
  sections: {
    projectOverview: { ...initialSectionState },
    paymentTerms: { ...initialSectionState },
    timeline: { ...initialSectionState },
    responsibilities: { ...initialSectionState },
    warranties: { ...initialSectionState },
    legalProvisions: { ...initialSectionState }
  },
  signatures: {
    ownerSignature: null,
    ownerTypedName: '',
    ownerSignedAt: null,
    contractorSignature: null,
    contractorTypedName: '',
    contractorSignedAt: null
  },
  paymentMethod: null,
  agreedToTerms: false,
  depositPaid: false,
  contractSent: false,
  contractSentAt: null
};

const initialBoltUpQuote: BoltUpQuote = {
  // Building Use
  buildingUse: '',
  useDetails: '',
  // Dimensions
  width: '',
  length: '',
  eaveHeight: '',
  roofPitch: '',
  framingType: '',
  roofType: '',
  // Location & Engineering
  siteCity: '',
  siteZip: '',
  windSpeed: '',
  snowLoad: '',
  collateralLoad: '',
  // Openings
  overheadDoors: '',
  walkDoors: '',
  windows: '',
  loadingDocks: '',
  // Wall & Roof Systems
  wallPanelType: '',
  wallInsulation: '',
  roofInsulation: '',
  // Special Features
  hasMezzanine: false,
  hasCrane: false,
  hasSkylights: false,
  hasCanopies: false,
  hasGutters: false,
  hasSprinklers: false,
  // Crane Details
  craneCapacity: '',
  craneHookHeight: '',
  craneSpan: '',
  // Mezzanine Details
  mezzanineSize: '',
  mezzanineLoad: '',
  // Timeline & Budget
  timeline: '',
  budget: '',
  additionalNotes: ''
};

// Helper: generate unique building ID
let buildingIdCounter = 0;
function generateBuildingId(): string {
  buildingIdCounter++;
  return `bldg-${Date.now()}-${buildingIdCounter}`;
}

// Helper: get building type display label
function getBuildingTypeLabel(buildingType: string): string {
  switch (buildingType) {
    case 'pole-barn': return 'Pole Barn';
    case 'carport': return 'Carport';
    case 'i-beam': return 'I-Beam';
    case 'bolt-up': return 'Bolt-Up';
    case 'carport-garage': return 'Carport/Garage/Apt';
    default: return 'Building';
  }
}

export const useEstimatorStore = create<EstimatorStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentStep: 1,
      currentContractSection: 1,
      buildings: [],
      currentBuildingIndex: -1,
      customer: initialCustomer,
      building: initialBuilding,
      accessories: initialAccessories,
      doorPositions: {},
      colors: initialColors,
      concrete: initialConcrete,
      utilities: { utilitiesExcluded: true, includeUtilityEstimate: false },
      pricing: { ...initialPricing },
      contract: initialContract,
      boltUpQuote: initialBoltUpQuote,

      // Navigation Actions — always scroll to top on step change
      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 8) {
          set({ currentStep: currentStep + 1 });
          get().calculatePricing();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },

      goToStep: (step: number) => {
        if (step >= 1 && step <= 8) {
          set({ currentStep: step });
          get().calculatePricing();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },

      nextContractSection: () => {
        const { currentContractSection } = get();
        if (currentContractSection < 7) {
          set({ currentContractSection: currentContractSection + 1 });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },

      prevContractSection: () => {
        const { currentContractSection } = get();
        if (currentContractSection > 1) {
          set({ currentContractSection: currentContractSection - 1 });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },

      goToContractSection: (section: number) => {
        if (section >= 0 && section <= 7) {
          set((state) => ({
            contract: { ...state.contract, currentSection: section }
          }));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },

      // Contract Section Actions
      acknowledgeSection: (sectionId, checked) => {
        set((state) => ({
          contract: {
            ...state.contract,
            sections: {
              ...state.contract.sections,
              [sectionId]: {
                ...state.contract.sections[sectionId],
                checked,
                timestamp: checked ? new Date().toISOString() : null
              }
            }
          }
        }));
      },

      setInitials: (sectionId, initialsData) => {
        set((state) => ({
          contract: {
            ...state.contract,
            sections: {
              ...state.contract.sections,
              [sectionId]: {
                ...state.contract.sections[sectionId],
                initialed: true,
                initialsData,
                timestamp: new Date().toISOString()
              }
            }
          }
        }));
      },

      clearInitials: (sectionId) => {
        set((state) => ({
          contract: {
            ...state.contract,
            sections: {
              ...state.contract.sections,
              [sectionId]: {
                ...state.contract.sections[sectionId],
                initialed: false,
                initialsData: null
              }
            }
          }
        }));
      },

      setOwnerSignature: (signatureData, typedName) => {
        set((state) => ({
          contract: {
            ...state.contract,
            signatures: {
              ...state.contract.signatures,
              ownerSignature: signatureData,
              ownerTypedName: typedName,
              ownerSignedAt: new Date().toISOString()
            }
          }
        }));
      },

      clearOwnerSignature: () => {
        set((state) => ({
          contract: {
            ...state.contract,
            signatures: {
              ...state.contract.signatures,
              ownerSignature: null,
              ownerTypedName: '',
              ownerSignedAt: null
            }
          }
        }));
      },

      setContractorSignature: (signatureData, typedName) => {
        set((state) => ({
          contract: {
            ...state.contract,
            signatures: {
              ...state.contract.signatures,
              contractorSignature: signatureData,
              contractorTypedName: typedName,
              contractorSignedAt: new Date().toISOString()
            }
          }
        }));
      },

      clearContractorSignature: () => {
        set((state) => ({
          contract: {
            ...state.contract,
            signatures: {
              ...state.contract.signatures,
              contractorSignature: null,
              contractorTypedName: '',
              contractorSignedAt: null
            }
          }
        }));
      },

      setPaymentMethod: (method: PaymentMethod) => {
        set((state) => ({
          contract: {
            ...state.contract,
            paymentMethod: method
          }
        }));
      },

      markContractSent: () => {
        set((state) => ({
          contract: {
            ...state.contract,
            contractSent: true,
            contractSentAt: new Date().toISOString()
          }
        }));
      },

      // Setters
      setCustomerInfo: (info) => {
        set((state) => ({
          customer: { ...state.customer, ...info }
        }));
      },

      setBuildingConfig: (config) => {
        set((state) => {
          const newBuilding = { ...state.building, ...config };

          // If building type changed, reset size and height to defaults for new type
          if (config.buildingType && config.buildingType !== state.building.buildingType) {
            const newType = config.buildingType as BuildingType;
            const defaultSizeId = getDefaultSizeId(newType);
            const defaultHeightId = getDefaultHeightId(newType);
            const sizes = getBuildingSizes(newType);
            const heights = getEaveHeights(newType);
            const defaultSize = sizes[0];
            const defaultHeight = heights[0];

            newBuilding.buildingSizeId = defaultSizeId;
            newBuilding.eaveHeightId = defaultHeightId;
            newBuilding.width = defaultSize?.width ?? 30;
            newBuilding.length = defaultSize?.length ?? 40;
            newBuilding.height = defaultHeight?.height ?? 10;

            // Disable attached carport for types that don't support it
            if (newType === 'carport' || newType === 'bolt-up') {
              newBuilding.attachedCarport = {
                ...initialBuilding.attachedCarport,
                enabled: false,
                partitionWalls: []
              };
            }
          }

          return { building: newBuilding };
        });
        get().calculatePricing();
      },

      setAccessories: (accessories) => {
        set((state) => ({
          accessories: { ...state.accessories, ...accessories }
        }));
        get().calculatePricing();
      },

      setDoorPosition: (doorId, view, position) => {
        set((state) => ({
          doorPositions: {
            ...state.doorPositions,
            [`${doorId}-${view}`]: position
          }
        }));
      },

      setColors: (colors) => {
        set((state) => ({
          colors: { ...state.colors, ...colors }
        }));
      },

      setConcreteConfig: (config) => {
        set((state) => ({
          concrete: { ...state.concrete, ...config }
        }));
        get().calculatePricing();
      },

      setUtilityConfig: (config) => {
        set((state) => ({
          utilities: { ...state.utilities, ...config }
        }));
      },

      setContractData: (data) => {
        set((state) => ({
          contract: { ...state.contract, ...data }
        }));
      },

      // Bolt-Up Quote
      setBoltUpQuote: (quote) => {
        set((state) => ({
          boltUpQuote: { ...state.boltUpQuote, ...quote }
        }));
      },

      // Door Management
      addDoor: (door: DoorConfig) => {
        set((state) => {
          const key = door.type === 'walk' ? 'walkDoors' : 'rollUpDoors';
          return {
            accessories: {
              ...state.accessories,
              [key]: [...state.accessories[key], door]
            }
          };
        });
        get().calculatePricing();
      },

      removeDoor: (doorId: string) => {
        set((state) => ({
          accessories: {
            ...state.accessories,
            walkDoors: state.accessories.walkDoors.filter(d => d.id !== doorId),
            rollUpDoors: state.accessories.rollUpDoors.filter(d => d.id !== doorId)
          }
        }));
        get().calculatePricing();
      },

      updateDoor: (doorId: string, updates: Partial<DoorConfig>) => {
        set((state) => ({
          accessories: {
            ...state.accessories,
            walkDoors: state.accessories.walkDoors.map(d =>
              d.id === doorId ? { ...d, ...updates } : d
            ),
            rollUpDoors: state.accessories.rollUpDoors.map(d =>
              d.id === doorId ? { ...d, ...updates } : d
            )
          }
        }));
        get().calculatePricing();
      },

      // Window Management
      addWindow: (window: WindowConfig) => {
        set((state) => ({
          accessories: {
            ...state.accessories,
            windows: [...state.accessories.windows, window]
          }
        }));
        get().calculatePricing();
      },

      removeWindow: (windowId: string) => {
        set((state) => ({
          accessories: {
            ...state.accessories,
            windows: state.accessories.windows.filter(w => w.id !== windowId)
          }
        }));
        get().calculatePricing();
      },

      updateWindow: (windowId: string, updates: Partial<WindowConfig>) => {
        set((state) => ({
          accessories: {
            ...state.accessories,
            windows: state.accessories.windows.map(w =>
              w.id === windowId ? { ...w, ...updates } : w
            )
          }
        }));
        get().calculatePricing();
      },

      // ==================== MULTI-BUILDING ACTIONS ====================

      /**
       * Save the current editing fields into the buildings[] array.
       * If currentBuildingIndex >= 0, updates that entry. Otherwise appends a new one.
       */
      saveCurrentBuilding: () => {
        const state = get();
        // Recalculate pricing before saving
        const pricing = calculateTotalPrice(state.building, state.accessories, state.concrete);

        const buildingNumber = state.currentBuildingIndex >= 0
          ? state.currentBuildingIndex + 1
          : state.buildings.length + 1;

        const entry: BuildingEntry = {
          id: state.currentBuildingIndex >= 0
            ? state.buildings[state.currentBuildingIndex].id
            : generateBuildingId(),
          label: state.currentBuildingIndex >= 0
            ? state.buildings[state.currentBuildingIndex].label
            : `Building ${buildingNumber}`,
          building: { ...state.building },
          accessories: {
            ...state.accessories,
            walkDoors: state.accessories.walkDoors.map(d => ({ ...d })),
            rollUpDoors: state.accessories.rollUpDoors.map(d => ({ ...d })),
            windows: state.accessories.windows.map(w => ({ ...w }))
          },
          doorPositions: { ...state.doorPositions },
          colors: { ...state.colors },
          concrete: { ...state.concrete },
          pricing,
          leanTo: state.currentBuildingIndex >= 0
            ? state.buildings[state.currentBuildingIndex].leanTo
            : { isLeanTo: false, parentBuildingIndex: -1, attachWall: 'left' }
        };

        set((s) => {
          const newBuildings = [...s.buildings];
          if (s.currentBuildingIndex >= 0) {
            newBuildings[s.currentBuildingIndex] = entry;
          } else {
            newBuildings.push(entry);
          }
          return {
            buildings: newBuildings,
            currentBuildingIndex: s.currentBuildingIndex >= 0
              ? s.currentBuildingIndex
              : newBuildings.length - 1,
            pricing
          };
        });
      },

      /**
       * Add a new building: saves current → resets to defaults (keeps colors) → goes to step 2
       */
      addBuilding: () => {
        const state = get();
        // Save current building first
        state.saveCurrentBuilding();

        // Reset editing fields to defaults, but carry over colors
        const currentColors = { ...state.colors };
        set({
          building: { ...initialBuilding },
          accessories: { ...initialAccessories },
          doorPositions: {},
          colors: currentColors,  // Colors carry over
          concrete: { ...initialConcrete },
          pricing: { ...initialPricing },
          currentBuildingIndex: -1,  // -1 = new unsaved building
          currentStep: 2
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },

      /**
       * Duplicate the current building: saves current → copies it → goes to step 2
       */
      duplicateBuilding: () => {
        const state = get();
        // Save current building first
        state.saveCurrentBuilding();

        // Create a duplicate with new ID
        const newLabel = `Building ${state.buildings.length + 1}`;

        // The editing fields already have the current building's data,
        // so we just set the index to -1 (new) and it'll be saved as new on next save
        set({
          currentBuildingIndex: -1,
          currentStep: 2
        });

        // Immediately save the duplicate into the array
        const pricing = calculateTotalPrice(state.building, state.accessories, state.concrete);
        const duplicateEntry: BuildingEntry = {
          id: generateBuildingId(),
          label: newLabel,
          building: { ...state.building },
          accessories: {
            ...state.accessories,
            walkDoors: state.accessories.walkDoors.map(d => ({ ...d, id: `walk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` })),
            rollUpDoors: state.accessories.rollUpDoors.map(d => ({ ...d, id: `oh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` })),
            windows: state.accessories.windows.map(w => ({ ...w, id: `win-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }))
          },
          doorPositions: { ...state.doorPositions },
          colors: { ...state.colors },
          concrete: { ...state.concrete },
          pricing,
          leanTo: { isLeanTo: false, parentBuildingIndex: -1, attachWall: 'left' }
        };

        set((s) => ({
          buildings: [...s.buildings, duplicateEntry],
          currentBuildingIndex: s.buildings.length  // Point to the newly added duplicate
        }));

        window.scrollTo({ top: 0, behavior: 'smooth' });
      },

      /**
       * Edit a specific building: saves current → loads building[index] into editing fields → goes to step 2
       */
      editBuilding: (index: number) => {
        const state = get();

        // Save current building first (if we're editing one)
        if (state.currentBuildingIndex >= 0 || state.buildings.length > 0) {
          state.saveCurrentBuilding();
        }

        const refreshedState = get();
        const entry = refreshedState.buildings[index];
        if (!entry) return;

        // Load the selected building into editing fields
        set({
          building: { ...entry.building },
          accessories: {
            ...entry.accessories,
            walkDoors: entry.accessories.walkDoors.map(d => ({ ...d })),
            rollUpDoors: entry.accessories.rollUpDoors.map(d => ({ ...d })),
            windows: entry.accessories.windows.map(w => ({ ...w }))
          },
          doorPositions: { ...entry.doorPositions },
          colors: { ...entry.colors },
          concrete: { ...entry.concrete },
          pricing: { ...entry.pricing },
          currentBuildingIndex: index,
          currentStep: 2
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },

      /**
       * Remove a building from the array
       */
      removeBuilding: (index: number) => {
        set((state) => {
          const newBuildings = state.buildings.filter((_, i) => i !== index);
          // If we're currently editing the removed building, reset to new
          let newIndex = state.currentBuildingIndex;
          if (state.currentBuildingIndex === index) {
            newIndex = -1;
          } else if (state.currentBuildingIndex > index) {
            newIndex = state.currentBuildingIndex - 1;
          }
          // Re-label buildings sequentially
          const relabeled = newBuildings.map((b, i) => ({
            ...b,
            label: `Building ${i + 1}`
          }));
          return {
            buildings: relabeled,
            currentBuildingIndex: newIndex
          };
        });
      },

      /**
       * Get display label for a building entry
       */
      getBuildingLabel: (entry: BuildingEntry) => {
        const typeLabel = getBuildingTypeLabel(entry.building.buildingType);
        const size = `${entry.building.width}'×${entry.building.length}'`;
        const leanToSuffix = entry.leanTo.isLeanTo ? ' (Lean-To)' : '';
        return `${entry.label}: ${size} ${typeLabel}${leanToSuffix}`;
      },

      /**
       * Get the combined grand total across all buildings
       */
      getEstimateGrandTotal: () => {
        const state = get();
        return state.buildings.reduce((sum, b) => sum + b.pricing.grandTotal, 0);
      },

      // Calculate Pricing
      calculatePricing: () => {
        const state = get();
        const pricing = calculateTotalPrice(
          state.building,
          state.accessories,
          state.concrete
        );
        set({ pricing });
      },

      // Reset
      resetEstimate: () => {
        set({
          currentStep: 1,
          currentContractSection: 0,
          buildings: [],
          currentBuildingIndex: -1,
          customer: { ...initialCustomer },
          building: { ...initialBuilding },
          accessories: { ...initialAccessories },
          doorPositions: {},
          colors: { ...initialColors },
          concrete: { ...initialConcrete },
          utilities: { utilitiesExcluded: true, includeUtilityEstimate: false },
          pricing: { ...initialPricing },
          contract: {
            currentSection: 0,
            sections: {
              projectOverview: { ...initialSectionState },
              paymentTerms: { ...initialSectionState },
              timeline: { ...initialSectionState },
              responsibilities: { ...initialSectionState },
              warranties: { ...initialSectionState },
              legalProvisions: { ...initialSectionState }
            },
            signatures: {
              ownerSignature: null,
              ownerTypedName: '',
              ownerSignedAt: null,
              contractorSignature: null,
              contractorTypedName: '',
              contractorSignedAt: null
            },
            paymentMethod: null,
            agreedToTerms: false,
            depositPaid: false,
            contractSent: false,
            contractSentAt: null
          },
          boltUpQuote: { ...initialBoltUpQuote }
        });
      },

      // Persistence
      saveEstimate: () => {
        // Zustand persist middleware handles this automatically
        console.log('Estimate saved to localStorage');
      },

      loadEstimate: () => {
        // Zustand persist middleware handles this automatically
        console.log('Estimate loaded from localStorage');
        get().calculatePricing();
      }
    }),
    {
      name: '137-estimator-storage',
      partialize: (state) => ({
        customer: state.customer,
        building: state.building,
        accessories: state.accessories,
        doorPositions: state.doorPositions,
        colors: state.colors,
        concrete: state.concrete,
        contract: state.contract,
        boltUpQuote: state.boltUpQuote,
        buildings: state.buildings,
        currentBuildingIndex: state.currentBuildingIndex
      }),
      // Merge persisted state with initial state to handle schema migrations
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<EstimatorStore>;
        return {
          ...currentState,
          ...persisted,
          // Deep merge customer to ensure new address fields have defaults
          customer: {
            ...initialCustomer,
            ...(persisted.customer || {}),
            billingAddress: {
              ...emptyAddress,
              ...(persisted.customer?.billingAddress || {})
            },
            constructionAddress: {
              ...emptyAddress,
              ...(persisted.customer?.constructionAddress || {})
            }
          },
          // Deep merge building to ensure new fields have defaults
          building: {
            ...initialBuilding,
            ...(persisted.building || {}),
            breezeway: {
              ...initialBuilding.breezeway,
              ...(persisted.building?.breezeway || {})
            },
            attachedCarport: {
              ...initialBuilding.attachedCarport,
              ...(persisted.building?.attachedCarport || {})
            }
          },
          // Deep merge accessories
          accessories: {
            ...initialAccessories,
            ...(persisted.accessories || {})
          },
          // Deep merge colors
          colors: {
            ...initialColors,
            ...(persisted.colors || {})
          },
          // Deep merge concrete
          concrete: {
            ...initialConcrete,
            ...(persisted.concrete || {})
          },
          // Deep merge contract
          contract: {
            ...initialContract,
            ...(persisted.contract || {}),
            sections: {
              ...initialContract.sections,
              ...(persisted.contract?.sections || {})
            },
            signatures: {
              ...initialContract.signatures,
              ...(persisted.contract?.signatures || {})
            }
          },
          // Deep merge boltUpQuote
          boltUpQuote: {
            ...initialBoltUpQuote,
            ...(persisted.boltUpQuote || {})
          },
          // Multi-building arrays
          buildings: persisted.buildings || [],
          currentBuildingIndex: persisted.currentBuildingIndex ?? -1
        };
      }
    }
  )
);
