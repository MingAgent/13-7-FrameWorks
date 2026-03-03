// Address Type
export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

// Customer Information Types
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  // Legacy fields (keeping for backward compatibility)
  address: string;
  city: string;
  state: string;
  zip: string;
  // New address structure
  billingAddress: Address;
  constructionAddress: Address;
  sameAsMailingAddress: boolean;
}

// Building Configuration Types
export type LegType = 'standard' | 'certified';
export type BuildingView = 'front' | 'back' | 'left' | 'right';
export type BuildingType = 'pole-barn' | 'carport' | 'i-beam' | 'bolt-up' | 'carport-garage';

export interface Breezeway {
  frontBack: boolean;
  sideSide: boolean;
}

// Attached Carport Types (for Pole Barn & I-Beam only)
export type CarportDepth = 10 | 12 | 16 | 20;
export type CarportPartitionWall = 'left' | 'right' | 'front';
export type CarportMode = 'attached' | 'interior';

export interface AttachedCarportConfig {
  enabled: boolean;                          // Whether a carport is attached
  mode: CarportMode;                         // attached = lean-to outside, interior = inside footprint
  attachWall: WallPosition;                  // Which wall of the main building it attaches to
  depth: number;                             // How far it projects (custom value allowed)
  customWidth: number | null;                // Custom width (null = auto = full wall length)
  partitionWalls: CarportPartitionWall[];     // Which sides get panel walls (empty = fully open)
}

export interface BuildingConfig {
  // Building type selection
  buildingType: BuildingType;
  // Cookie-cutter selection IDs
  buildingSizeId: string;
  eaveHeightId: string;
  // Computed dimensions (from selected size/height)
  width: number;
  length: number;
  height: number;
  legType: LegType;
  buildingView: BuildingView;
  breezeway: Breezeway;
  attachedCarport: AttachedCarportConfig;
}

// Door and Window Types
export type DoorType = 'walk' | 'rollUp';
export type DoorSize = '3x7' | '4x7' | '6x7' | '8x8' | '10x10' | '12x12';
export type WallPosition = 'front' | 'back' | 'left' | 'right';

export interface DoorConfig {
  id: string;
  type: DoorType;
  size: DoorSize;
  width: number;  // Width in feet
  height: number; // Height in feet
  wall: WallPosition;
  position: number; // Position in feet from left edge of wall
  quantity: number;
}

export type WindowSize = '3x3' | '4x4';

export interface WindowConfig {
  id: string;
  size: WindowSize;
  width: number;   // Width in feet (3 or 4)
  height: number;  // Height in feet (3 or 4)
  wall: WallPosition;
  position: number; // Position in feet from left edge of wall
  quantity: number;
}

// Accessories Types
export type InsulationType = 'none' | 'wall' | 'ceiling' | 'full';

export interface AccessoriesConfig {
  walkDoors: DoorConfig[];
  rollUpDoors: DoorConfig[];
  windows: WindowConfig[];
  insulation: InsulationType;
  ventilation: boolean;
  gutters: boolean;
}

// Color Types
export interface ColorConfig {
  roof: string;
  walls: string;
  trim: string;
  doors: string;
}

// Concrete / Foundation Types
export type ConcreteType = 'none' | 'piers' | 'slab' | 'turnkey' | 'limestone' | 'caliche';

export interface ConcreteConfig {
  type: ConcreteType;
  existingPad: boolean;
  thickness: number;
  carportFoundationType: ConcreteType;   // Carport-specific foundation
  carportExistingPad: boolean;           // Carport has existing pad
  combinedFoundation: boolean;           // When true, carport uses same foundation as building
}

// Pricing Types
export interface PricingBreakdown {
  basePrice: number;
  accessoriesTotal: number;
  concreteTotal: number;
  carportConcreteTotal: number;  // Carport foundation cost (when split)
  carportTotal: number;
  laborTotal: number;
  deliveryTotal: number;
  grandTotal: number;
  depositAmount: number;
}

// Contract Section Types
export type ContractSectionId =
  | 'customerInfo'
  | 'projectOverview'
  | 'paymentTerms'
  | 'timeline'
  | 'responsibilities'
  | 'warranties'
  | 'legalProvisions'
  | 'signatures';

export interface ContractSectionState {
  checked: boolean;      // Checkbox acknowledgment
  initialed: boolean;    // Has initials been provided
  initialsData: string | null;  // Base64 PNG of initials
  timestamp: string | null;     // When acknowledged
}

// Signature Data (for final signatures)
export interface SignatureData {
  ownerSignature: string | null;      // Base64 PNG
  ownerTypedName: string;
  ownerSignedAt: string | null;
  contractorSignature: string | null; // Base64 PNG
  contractorTypedName: string;
  contractorSignedAt: string | null;
}

// Payment method for first draw
export type PaymentMethod = 'cash' | 'check' | 'card' | 'financing' | 'ach' | null;

// Full Contract Configuration
export interface ContractConfig {
  // Current section being viewed (0-7)
  currentSection: number;

  // Section acknowledgments (sections 1-6 require checkbox + initials)
  sections: {
    projectOverview: ContractSectionState;
    paymentTerms: ContractSectionState;
    timeline: ContractSectionState;
    responsibilities: ContractSectionState;
    warranties: ContractSectionState;
    legalProvisions: ContractSectionState;
  };

  // Final signatures
  signatures: SignatureData;

  // Payment
  paymentMethod: PaymentMethod;

  // Status flags
  agreedToTerms: boolean;
  depositPaid: boolean;
  contractSent: boolean;
  contractSentAt: string | null;
}

// Door Position Map (for drag-drop)
export type DoorPositionMap = Record<string, number>; // key: `${doorId}-${view}`

// Bolt-Up Custom Quote (for pre-engineered steel buildings)
export interface BoltUpQuote {
  // Building Use
  buildingUse: string;
  useDetails: string;

  // Dimensions
  width: string;
  length: string;
  eaveHeight: string;
  roofPitch: string;
  framingType: string;
  roofType: string;

  // Location & Engineering
  siteCity: string;
  siteZip: string;
  windSpeed: string;
  snowLoad: string;
  collateralLoad: string;

  // Openings
  overheadDoors: string;
  walkDoors: string;
  windows: string;
  loadingDocks: string;

  // Wall & Roof Systems
  wallPanelType: string;
  wallInsulation: string;
  roofInsulation: string;

  // Special Features
  hasMezzanine: boolean;
  hasCrane: boolean;
  hasSkylights: boolean;
  hasCanopies: boolean;
  hasGutters: boolean;
  hasSprinklers: boolean;

  // Crane Details (if applicable)
  craneCapacity: string;
  craneHookHeight: string;
  craneSpan: string;

  // Mezzanine Details (if applicable)
  mezzanineSize: string;
  mezzanineLoad: string;

  // Timeline & Budget
  timeline: string;
  budget: string;

  // Additional Notes
  additionalNotes: string;
}

// ==================== MULTI-BUILDING TYPES ====================

// Lean-to configuration
export type LeanToWall = 'front' | 'back' | 'left' | 'right';

export interface LeanToConfig {
  isLeanTo: boolean;
  parentBuildingIndex: number;  // Index of the building this lean-to attaches to
  attachWall: LeanToWall;       // Which wall of the parent building it attaches to
}

// A single building entry in the multi-building array
export interface BuildingEntry {
  id: string;                    // Unique ID for this building
  label: string;                 // User-friendly label ("Building 1", "Carport A", etc.)
  building: BuildingConfig;
  accessories: AccessoriesConfig;
  doorPositions: DoorPositionMap;
  colors: ColorConfig;
  concrete: ConcreteConfig;
  pricing: PricingBreakdown;
  leanTo: LeanToConfig;
}

// Utility Exclusion Config (applies to ALL building types)
export interface UtilityConfig {
  utilitiesExcluded: boolean;          // Default: true — utilities NOT included
  includeUtilityEstimate: boolean;     // Optional: show estimated utility ranges
}

// Complete Estimator State
export interface EstimatorState {
  // Navigation
  currentStep: number;
  currentContractSection: number;

  // Multi-building
  buildings: BuildingEntry[];          // Array of completed/saved buildings
  currentBuildingIndex: number;        // Index in buildings[] being edited (-1 = new unsaved)

  // Active editing fields (the building currently being configured)
  customer: CustomerInfo;
  building: BuildingConfig;
  accessories: AccessoriesConfig;
  doorPositions: DoorPositionMap;
  colors: ColorConfig;
  concrete: ConcreteConfig;
  utilities: UtilityConfig;
  pricing: PricingBreakdown;
  contract: ContractConfig;
  boltUpQuote: BoltUpQuote;
}

// Actions Interface
export interface EstimatorActions {
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  nextContractSection: () => void;
  prevContractSection: () => void;
  goToContractSection: (section: number) => void;

  // Setters
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setBuildingConfig: (config: Partial<BuildingConfig>) => void;
  setAccessories: (accessories: Partial<AccessoriesConfig>) => void;
  setDoorPosition: (doorId: string, view: string, position: number) => void;
  setColors: (colors: Partial<ColorConfig>) => void;
  setConcreteConfig: (config: Partial<ConcreteConfig>) => void;
  setUtilityConfig: (config: Partial<UtilityConfig>) => void;
  setContractData: (data: Partial<ContractConfig>) => void;

  // Contract Section Actions
  acknowledgeSection: (sectionId: keyof ContractConfig['sections'], checked: boolean) => void;
  setInitials: (sectionId: keyof ContractConfig['sections'], initialsData: string) => void;
  clearInitials: (sectionId: keyof ContractConfig['sections']) => void;
  setOwnerSignature: (signatureData: string, typedName: string) => void;
  clearOwnerSignature: () => void;
  setContractorSignature: (signatureData: string, typedName: string) => void;
  clearContractorSignature: () => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  markContractSent: () => void;

  // Door/Window Management
  addDoor: (door: DoorConfig) => void;
  removeDoor: (doorId: string) => void;
  updateDoor: (doorId: string, updates: Partial<DoorConfig>) => void;
  addWindow: (window: WindowConfig) => void;
  removeWindow: (windowId: string) => void;
  updateWindow: (windowId: string, updates: Partial<WindowConfig>) => void;

  // Bolt-Up Quote
  setBoltUpQuote: (quote: Partial<BoltUpQuote>) => void;

  // Multi-Building Actions
  saveCurrentBuilding: () => void;                    // Save active editing fields into buildings[]
  addBuilding: () => void;                            // Save current → reset to defaults → go to step 2
  duplicateBuilding: () => void;                      // Save current → copy it → go to step 2
  editBuilding: (index: number) => void;              // Save current → load building[index] → go to step 2
  removeBuilding: (index: number) => void;            // Remove building from array
  getBuildingLabel: (entry: BuildingEntry) => string;  // Get display label for a building
  getEstimateGrandTotal: () => number;                // Sum of all buildings' grandTotals

  // Calculations
  calculatePricing: () => void;

  // Persistence
  resetEstimate: () => void;
  saveEstimate: () => void;
  loadEstimate: () => void;
}

export type EstimatorStore = EstimatorState & EstimatorActions;
