import type {
  BuildingConfig,
  AccessoriesConfig,
  ConcreteConfig,
  PricingBreakdown
} from '../../types/estimator';
import {
  lookupPrice,
  LEG_TYPE_MULTIPLIERS,
  DOOR_PRICE_MATRIX,
  WALK_DOOR_PRICES,
  WINDOW_PRICES,
  INSULATION_PRICES,
  OPTION_PRICES,
  CONCRETE_PRICES,
  DELIVERY_BASE,
  DEPOSIT_PERCENTAGE,
  getConcreteRate,
  calculateAttachedCarportPrice
} from '../../constants/pricing';

/**
 * Calculate the base price of the building structure using price table lookup
 * Prices are looked up from the master price table based on building type + size + height
 */
export function calculateBasePrice(building: BuildingConfig): number {
  // Look up exact price from the price table (includes materials + labor + GC + margin)
  let basePrice = lookupPrice(building.buildingType, building.buildingSizeId, building.eaveHeightId);

  // Apply leg type multiplier for certified frames
  const legMultiplier = LEG_TYPE_MULTIPLIERS[building.legType];
  if (legMultiplier > 1) {
    // Add 15% for certified frames
    basePrice = basePrice * legMultiplier;
  }

  return basePrice;
}

/**
 * Calculate the total cost of accessories (doors, windows, insulation, etc.)
 * Uses flat-rate pricing to match the estimate summary display.
 */
export function calculateAccessoriesTotal(
  _building: BuildingConfig,
  accessories: AccessoriesConfig
): number {
  let total = 0;

  // Walk doors - first walk door included in base price, extras cost $1,045 each
  const extraWalkDoors = Math.max(0, accessories.walkDoors.length - 1);
  total += extraWalkDoors * WALK_DOOR_PRICES.extra_walkthrough;

  // Roll-up/overhead doors - use the height×width price matrix
  accessories.rollUpDoors.forEach(door => {
    // door.size is stored as "WxH" or similar, door has height/width props
    // Use DOOR_PRICE_MATRIX with key format "heightxwidth"
    const key = `${door.height}x${door.width}`;
    const price = DOOR_PRICE_MATRIX[key] || 0;
    total += price;
  });

  // Windows
  accessories.windows.forEach(win => {
    const price = WINDOW_PRICES[win.size] || 0;
    total += price;
  });

  // Insulation - FLAT RATE (not per sqft)
  total += INSULATION_PRICES[accessories.insulation] || 0;

  // Ventilation - flat rate
  if (accessories.ventilation) {
    total += OPTION_PRICES.ventilation;
  }

  // Gutters - FLAT RATE (not per linear foot)
  if (accessories.gutters) {
    total += OPTION_PRICES.gutters;
  }

  return total;
}

/**
 * Calculate concrete cost for a given area, foundation type, and building type
 */
function calculateFoundationCost(
  sqft: number,
  perimeter: number,
  foundationType: string,
  existingPad: boolean,
  buildingType: string
): number {
  if (foundationType === 'none' || existingPad) return 0;

  if (foundationType === 'piers') {
    const numPiers = Math.ceil(perimeter / 10);
    return numPiers * CONCRETE_PRICES.piers;
  }

  if (['slab', 'turnkey', 'limestone', 'caliche'].includes(foundationType)) {
    const rate = getConcreteRate(foundationType, buildingType);
    return sqft * rate;
  }

  return 0;
}

/**
 * Calculate concrete costs for the building (excludes carport foundation)
 */
export function calculateConcreteTotal(
  building: BuildingConfig,
  concrete: ConcreteConfig
): number {
  const sqft = building.width * building.length;
  const perimeter = 2 * (building.width + building.length);
  return calculateFoundationCost(sqft, perimeter, concrete.type, concrete.existingPad, building.buildingType);
}

/**
 * Calculate carport foundation cost (separate from building)
 */
export function calculateCarportConcreteTotal(
  building: BuildingConfig,
  concrete: ConcreteConfig
): number {
  const carport = building.attachedCarport;
  if (!carport.enabled) return 0;

  // If combined foundation, carport cost is included in the building foundation calc
  if (concrete.combinedFoundation) return 0;

  // Calculate carport footprint
  const wall = carport.attachWall;
  const wallLength = (wall === 'front' || wall === 'back') ? building.width : building.length;
  const carportWidth = carport.customWidth ?? wallLength;
  const carportSqft = carportWidth * carport.depth;
  const carportPerimeter = 2 * (carportWidth + carport.depth);

  return calculateFoundationCost(
    carportSqft,
    carportPerimeter,
    concrete.carportFoundationType,
    concrete.carportExistingPad,
    building.buildingType
  );
}

/**
 * Labor is included in the base building package — no separate charge
 * (Labor is baked into the price table: Materials + Concrete Labor + Erection Labor + GC + Margin)
 */
export function calculateLaborTotal(_building: BuildingConfig): number {
  return 0;
}

/**
 * Delivery + Haul Off — flat rate
 */
export function calculateDeliveryTotal(_distanceMiles: number = 50): number {
  return DELIVERY_BASE;
}

/**
 * Calculate the complete pricing breakdown
 */
export function calculateTotalPrice(
  building: BuildingConfig,
  accessories: AccessoriesConfig,
  concrete: ConcreteConfig,
  distanceMiles: number = 50
): PricingBreakdown {
  const basePrice = calculateBasePrice(building);
  const accessoriesTotal = calculateAccessoriesTotal(building, accessories);

  // Foundation costs — building and carport calculated separately
  let concreteTotal: number;
  let carportConcreteTotal: number;

  if (building.attachedCarport.enabled && concrete.combinedFoundation) {
    // Combined: calculate foundation for building + carport as one footprint
    const wall = building.attachedCarport.attachWall;
    const wallLength = (wall === 'front' || wall === 'back') ? building.width : building.length;
    const carportWidth = building.attachedCarport.customWidth ?? wallLength;
    const carportSqft = carportWidth * building.attachedCarport.depth;
    const totalSqft = (building.width * building.length) + (building.attachedCarport.mode === 'interior' ? 0 : carportSqft);
    const totalPerimeter = 2 * (building.width + building.length); // approximate
    concreteTotal = calculateFoundationCost(totalSqft, totalPerimeter, concrete.type, concrete.existingPad, building.buildingType);
    carportConcreteTotal = 0;
  } else {
    concreteTotal = calculateConcreteTotal(building, concrete);
    carportConcreteTotal = calculateCarportConcreteTotal(building, concrete);
  }

  const deliveryTotal = calculateDeliveryTotal(distanceMiles);
  const carportTotal = calculateAttachedCarportPrice(building);

  const grandTotal = basePrice + accessoriesTotal + concreteTotal + carportConcreteTotal + carportTotal + deliveryTotal;
  const depositAmount = grandTotal * DEPOSIT_PERCENTAGE;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    accessoriesTotal: Math.round(accessoriesTotal * 100) / 100,
    concreteTotal: Math.round(concreteTotal * 100) / 100,
    carportConcreteTotal: Math.round(carportConcreteTotal * 100) / 100,
    carportTotal: Math.round(carportTotal * 100) / 100,
    laborTotal: 0,
    deliveryTotal: Math.round(deliveryTotal * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    depositAmount: Math.round(depositAmount * 100) / 100
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
