// ==================== BUILDING TYPE CONFIGURATION ====================
// All prices include: Materials + Concrete Labor + Erection Labor + 17% GC Fee + 25% Profit Margin
// Source: 137_Master_Pricing_All_Buildings.xlsx (Feb 2026, SE Texas Market)

import type { BuildingType, BuildingConfig } from '../types/estimator';

// ==================== BUILDING SIZE DEFINITIONS ====================

// Shared type for a building size entry
export interface BuildingSizeEntry {
  id: string;
  label: string;
  width: number;
  length: number;
  sqft: number;
  startingPrice: number;  // Price at base eave height
}

// Shared type for an eave height entry
export interface EaveHeightEntry {
  id: string;
  label: string;
  height: number;
}

// ==================== CARPORT SIZES (10 sizes, heights: 8', 10', 12', 14') ====================
export const CARPORT_SIZES: readonly BuildingSizeEntry[] = [
  { id: 'cp-12x20', label: "12' × 20'", width: 12, length: 20, sqft: 240, startingPrice: 13700 },
  { id: 'cp-16x20', label: "16' × 20'", width: 16, length: 20, sqft: 320, startingPrice: 15300 },
  { id: 'cp-18x20', label: "18' × 20'", width: 18, length: 20, sqft: 360, startingPrice: 15900 },
  { id: 'cp-20x20', label: "20' × 20'", width: 20, length: 20, sqft: 400, startingPrice: 16500 },
  { id: 'cp-20x24', label: "20' × 24'", width: 20, length: 24, sqft: 480, startingPrice: 17900 },
  { id: 'cp-20x30', label: "20' × 30'", width: 20, length: 30, sqft: 600, startingPrice: 22300 },
  { id: 'cp-22x20', label: "22' × 20'", width: 22, length: 20, sqft: 440, startingPrice: 17100 },
  { id: 'cp-24x24', label: "24' × 24'", width: 24, length: 24, sqft: 576, startingPrice: 19800 },
  { id: 'cp-24x30', label: "24' × 30'", width: 24, length: 30, sqft: 720, startingPrice: 24200 },
  { id: 'cp-24x40', label: "24' × 40'", width: 24, length: 40, sqft: 960, startingPrice: 30700 },
] as const;

// Carport eave heights
export const CARPORT_HEIGHTS: readonly EaveHeightEntry[] = [
  { id: '8', label: "8 ft", height: 8 },
  { id: '10', label: "10 ft", height: 10 },
  { id: '12', label: "12 ft", height: 12 },
  { id: '14', label: "14 ft", height: 14 },
] as const;

// Carport full price lookup: CARPORT_PRICE_TABLE[sizeId][heightId] = customer price
export const CARPORT_PRICE_TABLE: Record<string, Record<string, number>> = {
  'cp-12x20': { '8': 13700, '10': 14300, '12': 15000, '14': 16100 },
  'cp-16x20': { '8': 15300, '10': 16000, '12': 16700, '14': 17900 },
  'cp-18x20': { '8': 15900, '10': 16600, '12': 17400, '14': 18600 },
  'cp-20x20': { '8': 16500, '10': 17300, '12': 18100, '14': 19300 },
  'cp-20x24': { '8': 17900, '10': 18700, '12': 19600, '14': 20900 },
  'cp-20x30': { '8': 22300, '10': 23400, '12': 24600, '14': 26300 },
  'cp-22x20': { '8': 17100, '10': 17900, '12': 18800, '14': 20000 },
  'cp-24x24': { '8': 19800, '10': 20700, '12': 21700, '14': 23000 },
  'cp-24x30': { '8': 24200, '10': 25300, '12': 26600, '14': 28400 },
  'cp-24x40': { '8': 30700, '10': 32200, '12': 33800, '14': 36100 },
};

// ==================== POLE BARN SIZES (10 sizes, heights: 10', 12', 14', 16', 20') ====================
export const POLE_BARN_SIZES: readonly BuildingSizeEntry[] = [
  { id: 'pb-30x40', label: "30' × 40'", width: 30, length: 40, sqft: 1200, startingPrice: 61200 },
  { id: 'pb-30x50', label: "30' × 50'", width: 30, length: 50, sqft: 1500, startingPrice: 73000 },
  { id: 'pb-40x40', label: "40' × 40'", width: 40, length: 40, sqft: 1600, startingPrice: 74000 },
  { id: 'pb-40x50', label: "40' × 50'", width: 40, length: 50, sqft: 2000, startingPrice: 88300 },
  { id: 'pb-40x60', label: "40' × 60'", width: 40, length: 60, sqft: 2400, startingPrice: 102700 },
  { id: 'pb-50x50', label: "50' × 50'", width: 50, length: 50, sqft: 2500, startingPrice: 106100 },
  { id: 'pb-50x60', label: "50' × 60'", width: 50, length: 60, sqft: 3000, startingPrice: 123600 },
  { id: 'pb-50x80', label: "50' × 80'", width: 50, length: 80, sqft: 4000, startingPrice: 159500 },
  { id: 'pb-60x60', label: "60' × 60'", width: 60, length: 60, sqft: 3600, startingPrice: 141800 },
  { id: 'pb-60x100', label: "60' × 100'", width: 60, length: 100, sqft: 6000, startingPrice: 223100 },
] as const;

// Pole Barn eave heights
export const POLE_BARN_HEIGHTS: readonly EaveHeightEntry[] = [
  { id: '10', label: "10 ft", height: 10 },
  { id: '12', label: "12 ft", height: 12 },
  { id: '14', label: "14 ft", height: 14 },
  { id: '16', label: "16 ft", height: 16 },
  { id: '20', label: "20 ft", height: 20 },
] as const;

// Pole Barn full price lookup: POLE_BARN_PRICE_TABLE[sizeId][heightId] = customer price
export const POLE_BARN_PRICE_TABLE: Record<string, Record<string, number>> = {
  'pb-30x40':  { '10': 61200,  '12': 64500,  '14': 68400,  '16': 72000,  '20': 78800 },
  'pb-30x50':  { '10': 73000,  '12': 76900,  '14': 81500,  '16': 85900,  '20': 94000 },
  'pb-40x40':  { '10': 74000,  '12': 77800,  '14': 82200,  '16': 86300,  '20': 94100 },
  'pb-40x50':  { '10': 88300,  '12': 92800,  '14': 98000,  '16': 102900, '20': 112100 },
  'pb-40x60':  { '10': 102700, '12': 107800, '14': 113800, '16': 119600, '20': 130200 },
  'pb-50x50':  { '10': 106100, '12': 111700, '14': 118400, '16': 124700, '20': 136600 },
  'pb-50x60':  { '10': 123600, '12': 130000, '14': 137800, '16': 145000, '20': 158800 },
  'pb-50x80':  { '10': 159500, '12': 167500, '14': 177400, '16': 186600, '20': 204200 },
  'pb-60x60':  { '10': 141800, '12': 148900, '14': 157400, '16': 165300, '20': 180300 },
  'pb-60x100': { '10': 223100, '12': 233900, '14': 246800, '16': 258900, '20': 282100 },
};

// ==================== I-BEAM SIZES (18 sizes, heights: 14', 16', 18', 20', 24') ====================
export const IBEAM_SIZES: readonly BuildingSizeEntry[] = [
  { id: 'ib-30x40',   label: "30' × 40'",   width: 30,  length: 40,  sqft: 1200,  startingPrice: 76000 },
  { id: 'ib-30x50',   label: "30' × 50'",   width: 30,  length: 50,  sqft: 1500,  startingPrice: 87600 },
  { id: 'ib-40x40',   label: "40' × 40'",   width: 40,  length: 40,  sqft: 1600,  startingPrice: 94500 },
  { id: 'ib-40x50',   label: "40' × 50'",   width: 40,  length: 50,  sqft: 2000,  startingPrice: 109400 },
  { id: 'ib-40x60',   label: "40' × 60'",   width: 40,  length: 60,  sqft: 2400,  startingPrice: 124200 },
  { id: 'ib-50x50',   label: "50' × 50'",   width: 50,  length: 50,  sqft: 2500,  startingPrice: 132000 },
  { id: 'ib-50x60',   label: "50' × 60'",   width: 50,  length: 60,  sqft: 3000,  startingPrice: 150400 },
  { id: 'ib-50x80',   label: "50' × 80'",   width: 50,  length: 80,  sqft: 4000,  startingPrice: 195200 },
  { id: 'ib-50x100',  label: "50' × 100'",  width: 50,  length: 100, sqft: 5000,  startingPrice: 238800 },
  { id: 'ib-60x60',   label: "60' × 60'",   width: 60,  length: 60,  sqft: 3600,  startingPrice: 183600 },
  { id: 'ib-60x80',   label: "60' × 80'",   width: 60,  length: 80,  sqft: 4800,  startingPrice: 237300 },
  { id: 'ib-60x100',  label: "60' × 100'",  width: 60,  length: 100, sqft: 6000,  startingPrice: 291100 },
  { id: 'ib-60x120',  label: "60' × 120'",  width: 60,  length: 120, sqft: 7200,  startingPrice: 346200 },
  { id: 'ib-75x100',  label: "75' × 100'",  width: 75,  length: 100, sqft: 7500,  startingPrice: 369300 },
  { id: 'ib-80x120',  label: "80' × 120'",  width: 80,  length: 120, sqft: 9600,  startingPrice: 469100 },
  { id: 'ib-100x100', label: "100' × 100'", width: 100, length: 100, sqft: 10000, startingPrice: 519900 },
  { id: 'ib-100x150', label: "100' × 150'", width: 100, length: 150, sqft: 15000, startingPrice: 757800 },
  { id: 'ib-100x200', label: "100' × 200'", width: 100, length: 200, sqft: 20000, startingPrice: 993700 },
] as const;

// I-Beam eave heights
export const IBEAM_HEIGHTS: readonly EaveHeightEntry[] = [
  { id: '14', label: "14 ft", height: 14 },
  { id: '16', label: "16 ft", height: 16 },
  { id: '18', label: "18 ft", height: 18 },
  { id: '20', label: "20 ft", height: 20 },
  { id: '24', label: "24 ft", height: 24 },
] as const;

// I-Beam full price lookup: IBEAM_PRICE_TABLE[sizeId][heightId] = customer price
export const IBEAM_PRICE_TABLE: Record<string, Record<string, number>> = {
  'ib-30x40':   { '14': 76000,  '16': 79000,  '18': 81400,  '20': 84500,  '24': 89700 },
  'ib-30x50':   { '14': 87600,  '16': 91000,  '18': 93800,  '20': 97400,  '24': 103200 },
  'ib-40x40':   { '14': 94500,  '16': 98200,  '18': 101200, '20': 105300, '24': 111800 },
  'ib-40x50':   { '14': 109400, '16': 113600, '18': 117100, '20': 121600, '24': 129000 },
  'ib-40x60':   { '14': 124200, '16': 129000, '18': 132800, '20': 137900, '24': 146100 },
  'ib-50x50':   { '14': 132000, '16': 136800, '18': 141000, '20': 146400, '24': 155400 },
  'ib-50x60':   { '14': 150400, '16': 155800, '18': 160500, '20': 166500, '24': 176500 },
  'ib-50x80':   { '14': 195200, '16': 202200, '18': 208600, '20': 216500, '24': 230000 },
  'ib-50x100':  { '14': 238800, '16': 247500, '18': 255400, '20': 265300, '24': 282400 },
  'ib-60x60':   { '14': 183600, '16': 190000, '18': 195500, '20': 202500, '24': 214500 },
  'ib-60x80':   { '14': 237300, '16': 245700, '18': 253100, '20': 262400, '24': 278700 },
  'ib-60x100':  { '14': 291100, '16': 301400, '18': 310800, '20': 322200, '24': 342800 },
  'ib-60x120':  { '14': 346200, '16': 358500, '18': 369800, '20': 383500, '24': 408400 },
  'ib-75x100':  { '14': 369300, '16': 382800, '18': 394100, '20': 408800, '24': 433800 },
  'ib-80x120':  { '14': 469100, '16': 486400, '18': 501300, '20': 520300, '24': 552300 },
  'ib-100x100': { '14': 519900, '16': 536500, '18': 551200, '20': 570800, '24': 604500 },
  'ib-100x150': { '14': 757800, '16': 781500, '18': 803200, '20': 831500, '24': 881200 },
  'ib-100x200': { '14': 993700, '16': 1024600, '18': 1053100, '20': 1090300, '24': 1156000 },
};

// ==================== HELPER: GET SIZES/HEIGHTS/PRICES BY BUILDING TYPE ====================

/**
 * Get the available building sizes for a given building type
 */
export function getBuildingSizes(buildingType: BuildingType): readonly BuildingSizeEntry[] {
  switch (buildingType) {
    case 'carport': return CARPORT_SIZES;
    case 'pole-barn': return POLE_BARN_SIZES;
    case 'i-beam': return IBEAM_SIZES;
    default: return POLE_BARN_SIZES; // bolt-up falls back to PB for now
  }
}

/**
 * Get the available eave heights for a given building type
 */
export function getEaveHeights(buildingType: BuildingType): readonly EaveHeightEntry[] {
  switch (buildingType) {
    case 'carport': return CARPORT_HEIGHTS;
    case 'pole-barn': return POLE_BARN_HEIGHTS;
    case 'i-beam': return IBEAM_HEIGHTS;
    default: return POLE_BARN_HEIGHTS;
  }
}

/**
 * Get the price table for a given building type
 */
export function getPriceTable(buildingType: BuildingType): Record<string, Record<string, number>> {
  switch (buildingType) {
    case 'carport': return CARPORT_PRICE_TABLE;
    case 'pole-barn': return POLE_BARN_PRICE_TABLE;
    case 'i-beam': return IBEAM_PRICE_TABLE;
    default: return POLE_BARN_PRICE_TABLE;
  }
}

/**
 * Look up exact price for a size + height combo
 * Returns the customer price from the price table, or the starting price as fallback
 */
export function lookupPrice(buildingType: BuildingType, sizeId: string, heightId: string): number {
  const table = getPriceTable(buildingType);
  const sizeRow = table[sizeId];
  if (sizeRow && sizeRow[heightId] !== undefined) {
    return sizeRow[heightId];
  }
  // Fallback: return the starting price from the size array
  const sizes = getBuildingSizes(buildingType);
  const size = sizes.find(s => s.id === sizeId);
  return size?.startingPrice ?? 0;
}

/**
 * Get the default eave height ID for a building type (the base/lowest height)
 */
export function getDefaultHeightId(buildingType: BuildingType): string {
  const heights = getEaveHeights(buildingType);
  return heights[0]?.id ?? '10';
}

/**
 * Get the default size ID for a building type
 */
export function getDefaultSizeId(buildingType: BuildingType): string {
  const sizes = getBuildingSizes(buildingType);
  return sizes[0]?.id ?? 'pb-30x40';
}

// ==================== BACKWARD COMPATIBILITY ====================
// Keep BUILDING_SIZES and EAVE_HEIGHTS as aliases for pole barn (used by existing components)
export const BUILDING_SIZES = POLE_BARN_SIZES;
export const EAVE_HEIGHTS = POLE_BARN_HEIGHTS.map((h, i) => ({
  ...h,
  // Compute flat modifier for backward compat (uses 30x40 as reference)
  modifier: i === 0 ? 0 : (POLE_BARN_PRICE_TABLE['pb-30x40'][h.id] ?? 0) - 61200
}));

// Type exports (backward compatible)
export type BuildingSizeId = string;
export type EaveHeightId = string;

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

// ==================== CONCRETE / FOUNDATION PRICING ====================
export const CONCRETE_PRICES = {
  none: 0,
  piers: 125,       // per pier
  slab: 8,          // per sqft (4" slab w/ #3 rebar, vapor barrier, control joints)
  turnkey: 10,      // per sqft (4" turnkey w/ #3 rebar, forms, perimeter thickening)
  limestone: 20,    // per sqft (Crushed Limestone Pad — $1,200/TON, ~60 sqft/ton at 4" depth)
  caliche: 3.50     // per sqft (Caliche Base Material — $28/CY, ~8 sqft/CY at 4" depth + labor)
} as const;

// I-Beam buildings use a higher concrete cost basis
export const IBEAM_CONCRETE_PRICES = {
  ...CONCRETE_PRICES,
  slab: 9.50,       // per sqft — I-Beam slab cost is $9.50/sqft
  turnkey: 11.50    // per sqft — proportionally higher turnkey for I-Beam
} as const;

/**
 * Get the effective concrete price per sqft for a given foundation type + building type.
 * I-Beam structures use $9.50/sqft for slab instead of $8.00.
 */
export function getConcreteRate(foundationType: string, buildingType: string): number {
  if (buildingType === 'i-beam') {
    return (IBEAM_CONCRETE_PRICES as Record<string, number>)[foundationType] ?? 0;
  }
  return (CONCRETE_PRICES as Record<string, number>)[foundationType] ?? 0;
}

// Underlying unit rates for display reference
export const LIMESTONE_RATE_PER_TON = 1200;  // $1,200/TON (Fox Rd rate, SE Texas)
export const CALICHE_RATE_PER_CY = 28;       // $28/CY raw material

// All slabs are 4" — no thickness multiplier needed
export const CONCRETE_THICKNESS_MULTIPLIERS = {
  4: 1.0,
} as const;

// ==================== ATTACHED CARPORT PRICING (Pole Barn & I-Beam only) ====================

// Per-sqft rate for attached carport structure (lower than standalone — shares wall & foundation)
export const ATTACHED_CARPORT_RATE = 22;          // Pole Barn — $22/sqft
export const IBEAM_ATTACHED_CARPORT_RATE = 26;    // I-Beam — $26/sqft (structural steel premium)

// Partition wall rate (26ga metal panel + framing, installed)
export const CARPORT_PARTITION_WALL_RATE_PER_LF = 12;  // $12/linear foot

// Quick-pick depth options (users can also enter custom values)
export const CARPORT_DEPTH_OPTIONS: { depth: number; label: string }[] = [
  { depth: 10, label: "10 ft" },
  { depth: 12, label: "12 ft" },
  { depth: 16, label: "16 ft" },
  { depth: 20, label: "20 ft" },
];

/**
 * Get the wall length the carport spans (based on which wall it attaches to)
 * Uses customWidth if set, otherwise defaults to the full wall dimension.
 */
export function getCarportWallLength(building: BuildingConfig): number {
  const carport = building.attachedCarport;
  if (carport.customWidth !== null && carport.customWidth > 0) {
    return carport.customWidth;
  }
  const wall = carport.attachWall;
  return (wall === 'front' || wall === 'back') ? building.width : building.length;
}

/**
 * Calculate the total price for an attached carport (structure + partition walls)
 * Interior mode: no structural cost (under main roof), only partition walls.
 * Attached mode: sqft × rate + partition walls.
 */
export function calculateAttachedCarportPrice(building: BuildingConfig): number {
  const carport = building.attachedCarport;
  if (!carport.enabled) return 0;

  const wallLength = getCarportWallLength(building);

  let total = 0;

  // Structural cost — only for attached (lean-to) mode
  if (carport.mode === 'attached') {
    const sqft = wallLength * carport.depth;
    const rate = building.buildingType === 'i-beam'
      ? IBEAM_ATTACHED_CARPORT_RATE
      : ATTACHED_CARPORT_RATE;
    total += sqft * rate;
  }
  // Interior mode: no structural cost (carport is under the main building roof)

  // Add partition wall costs (applies to both modes)
  for (const wall of carport.partitionWalls) {
    const wallLF = (wall === 'front')
      ? wallLength           // Front wall spans the full width along the building
      : carport.depth;       // Side walls span the depth of the carport
    total += wallLF * CARPORT_PARTITION_WALL_RATE_PER_LF;
  }

  return total;
}

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

// Deposit percentage (Draw 1 = 30%)
export const DEPOSIT_PERCENTAGE = 0.30;

// Draw schedule (30/30/30/10)
export const DRAW_SCHEDULE = [
  { label: 'Draw 1', percent: 0.30, description: 'Upon Signing' },
  { label: 'Draw 2', percent: 0.30, description: 'Material Delivery' },
  { label: 'Draw 3', percent: 0.30, description: 'Framing Complete' },
  { label: 'Final Draw', percent: 0.10, description: 'Substantial Completion' },
] as const;

// Post clearance (in feet) - minimum distance from posts for doors
export const DOOR_POST_CLEARANCE_FT = 2.5;

// Building size constraints (legacy)
export const BUILDING_CONSTRAINTS = {
  width: {
    min: 12,
    max: 100,
    step: 10
  },
  length: {
    min: 20,
    max: 200,
    step: 10
  },
  height: {
    min: 8,
    max: 24,
    step: 2
  }
} as const;

// Standard dimension options (legacy - kept for backward compatibility)
export const WIDTH_OPTIONS = [30, 40, 50, 60];
export const LENGTH_OPTIONS = [40, 50, 60, 80, 100];
export const HEIGHT_OPTIONS = [10, 12, 14, 16, 20];

// Legacy base price (not used in cookie-cutter model)
export const BASE_PRICE_PER_SQFT = 8.50;
