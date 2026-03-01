// Cookie-cutter Building Sizes (from Burnett spec - 10 sizes total)
export const BUILDING_SIZES = [
  { id: '30x40', label: "30' × 40'", width: 30, length: 40, sqft: 1200, startingPrice: 30500 },
  { id: '30x50', label: "30' × 50'", width: 30, length: 50, sqft: 1500, startingPrice: 36000 },
  { id: '40x40', label: "40' × 40'", width: 40, length: 40, sqft: 1600, startingPrice: 35000 },
  { id: '40x50', label: "40' × 50'", width: 40, length: 50, sqft: 2000, startingPrice: 41500 },
  { id: '40x60', label: "40' × 60'", width: 40, length: 60, sqft: 2400, startingPrice: 47500 },
  { id: '50x50', label: "50' × 50'", width: 50, length: 50, sqft: 2500, startingPrice: 50000 },
  { id: '50x60', label: "50' × 60'", width: 50, length: 60, sqft: 3000, startingPrice: 58500 },
  { id: '50x80', label: "50' × 80'", width: 50, length: 80, sqft: 4000, startingPrice: 76500 },
  { id: '60x60', label: "60' × 60'", width: 60, length: 60, sqft: 3600, startingPrice: 65000 },
  { id: '60x100', label: "60' × 100'", width: 60, length: 100, sqft: 6000, startingPrice: 102000 },
] as const;

// Eave Heights with price modifiers
export const EAVE_HEIGHTS = [
  { id: '10', label: "10 ft", height: 10, modifier: 0 },
  { id: '12', label: "12 ft", height: 12, modifier: 1500 },
  { id: '14', label: "14 ft", height: 14, modifier: 3500 },
  { id: '16', label: "16 ft", height: 16, modifier: 6000 },
  { id: '20', label: "20 ft", height: 20, modifier: 12000 },
] as const;

// Type exports
export type BuildingSizeId = typeof BUILDING_SIZES[number]['id'];
export type EaveHeightId = typeof EAVE_HEIGHTS[number]['id'];

// Leg type multipliers
export const LEG_TYPE_MULTIPLIERS = {
  standard: 1.0,
  certified: 1.15
} as const;

// ==================== OVERHEAD DOOR PRICING (from original HTML) ====================
// Door Pricing Matrix (height x width = price)
export const DOOR_PRICE_MATRIX: Record<string, number> = {
  '8x8': 1890, '8x10': 2090, '8x12': 2290, '8x14': 2490,
  '10x8': 2090, '10x10': 2290, '10x12': 2590, '10x14': 2890,
  '12x8': 2290, '12x10': 2490, '12x12': 2890, '12x14': 3190,
  '14x8': 2490, '14x10': 2790, '14x12': 3190, '14x14': 3490
};

// Door Size Options (per Bobby: 8, 10, 12, 14 - max 14x14)
export const DOOR_SIZES = [
  { id: '8x8', width: 8, height: 8, label: "8' × 8'", price: 1890 },
  { id: '10x10', width: 10, height: 10, label: "10' × 10'", price: 2290 },
  { id: '12x12', width: 12, height: 12, label: "12' × 12'", price: 2890 },
  { id: '14x14', width: 14, height: 14, label: "14' × 14'", price: 3490 },
  { id: '10x8', width: 10, height: 8, label: "10' × 8'", price: 2090 },
  { id: '12x10', width: 12, height: 10, label: "12' × 10'", price: 2490 },
  { id: '14x12', width: 14, height: 12, label: "14' × 12'", price: 3190 }
] as const;

// Door Height Options
export const DOOR_HEIGHTS = [
  { id: '8', value: 8, label: "8 ft" },
  { id: '10', value: 10, label: "10 ft" },
  { id: '12', value: 12, label: "12 ft" },
  { id: '14', value: 14, label: "14 ft" }
] as const;

// Door Width Options
export const DOOR_WIDTHS = [
  { id: '8', value: 8, label: "8 ft" },
  { id: '10', value: 10, label: "10 ft" },
  { id: '12', value: 12, label: "12 ft" },
  { id: '14', value: 14, label: "14 ft" }
] as const;

// Walk-through door pricing (1 x 3070 included standard in base price)
export const WALK_DOOR_PRICES = {
  extra_walkthrough: 1045  // Additional 3070 Walk-through Door
} as const;

// Legacy door prices (kept for backward compatibility)
export const DOOR_PRICES = {
  walk: {
    '3x7': 1045,
    '4x7': 1045,
    '6x7': 1045,
    '8x8': 0,
    '10x10': 0,
    '12x12': 0
  },
  rollUp: {
    '3x7': 0,
    '4x7': 0,
    '6x7': 0,
    '8x8': 1890,
    '10x10': 2290,
    '12x12': 2890
  }
} as const;

// ==================== WINDOW PRICING (from original HTML) ====================
export const WINDOW_PRICES = {
  '3x3': 525,   // 3'×3' Fixed Window
  '4x4': 695,   // 4'×4' Slider Window
  // Legacy keys for backward compatibility
  '30x36': 525,
  '36x48': 695
} as const;

export const WINDOW_OPTIONS = [
  { id: 'win_3x3', name: "3'×3' Fixed Window", price: 525, maxQty: 10 },
  { id: 'win_4x4', name: "4'×4' Slider Window", price: 695, maxQty: 10 }
] as const;

// ==================== INSULATION PRICING (from original HTML) ====================
// Flat rate pricing (not per sqft)
export const INSULATION_PRICES = {
  none: 0,
  wall: 2500,     // Wall Insulation - flat rate
  roof: 2000,     // Roof Insulation - flat rate
  // Legacy keys
  ceiling: 2000,
  full: 4500      // Wall + Roof combined
} as const;

// ==================== GUTTER PRICING ====================
export const GUTTER_PRICE = 1897; // Flat rate for gutters & downspouts

export const OPTION_PRICES = {
  ventilation: 150,
  gutters: 1897,            // Flat rate for gutters & downspouts
  wainscot: 1200            // per wall (3' tall wainscot siding)
} as const;

// ==================== CONCRETE PRICING (from original HTML) ====================
export const CONCRETE_PRICES = {
  none: 0,
  piers: 125,       // per pier
  slab: 8,          // per sqft (4" slab w/ #3 rebar, vapor barrier, control joints)
  turnkey: 10       // per sqft (4" turnkey w/ #3 rebar, forms, perimeter thickening)
} as const;

// All slabs are 4" — no thickness multiplier needed
export const CONCRETE_THICKNESS_MULTIPLIERS = {
  4: 1.0,
} as const;

// ==================== ADMIN CONFIGURABLE (from original HTML) ====================
export const ADMIN_CONFIG = {
  // Door constraints
  doorHeightClearance: 2,   // Door height must be this many feet less than eave
  maxDoorWidth: 14,
  maxDoorHeight: 14,
  // Gutter settings
  gutterPricePerLF: 10,
  downspoutSpacingFt: 25,
  defaultGutterMode: 'both_eaves'
} as const;

// ==================== OTHER PRICING ====================
// Labor and delivery
export const LABOR_RATE_PER_SQFT = 3.50;
export const DELIVERY_BASE = 1800;  // Delivery + Haul Off flat rate
export const DELIVERY_RATE_PER_MILE = 3.50;

// Deposit percentage
export const DEPOSIT_PERCENTAGE = 0.35;

// Post clearance (in feet) - minimum distance from posts for doors
export const DOOR_POST_CLEARANCE_FT = 2.5;

// Building size constraints (legacy)
export const BUILDING_CONSTRAINTS = {
  width: {
    min: 12,
    max: 60,
    step: 10
  },
  length: {
    min: 40,
    max: 100,
    step: 10
  },
  height: {
    min: 10,
    max: 20,
    step: 2
  }
} as const;

// Standard dimension options (legacy - kept for backward compatibility)
export const WIDTH_OPTIONS = [30, 40, 50, 60];
export const LENGTH_OPTIONS = [40, 50, 60, 80, 100];
export const HEIGHT_OPTIONS = [10, 12, 14, 16, 20];

// Legacy base price (not used in cookie-cutter model)
export const BASE_PRICE_PER_SQFT = 8.50;
