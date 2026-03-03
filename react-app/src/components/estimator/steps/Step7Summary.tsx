import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  DoorOpen,
  Palette,
  Layers,
  DollarSign,
  CheckCircle2,
  Plus,
  Copy,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import { calculatePurlins } from '../../../utils/calculations/purlins';
import { SaveQuoteButton } from '../quote/SaveQuoteButton';
import { DRAW_SCHEDULE } from '../../../constants/pricing';
import type { BuildingEntry } from '../../../types/estimator';

/* ─── color helpers ─── */
const COLOR_NAMES: Record<string, string> = {
  '#E8E8E8': 'Light Gray',
  '#D4D4D4': 'Gray',
  '#8B4513': 'Saddle Brown',
  '#2F4F4F': 'Dark Slate Gray',
  '#800020': 'Burgundy',
  '#1C1C1C': 'Black',
  '#FFFFFF': 'White',
  '#228B22': 'Forest Green',
  '#B22222': 'Firebrick Red',
  '#4169E1': 'Royal Blue',
  '#DAA520': 'Goldenrod',
  '#708090': 'Slate Gray',
};
const colorName = (hex: string) => COLOR_NAMES[hex?.toUpperCase()] || hex || '—';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function getBuildingTypeLabel(buildingType: string): string {
  switch (buildingType) {
    case 'pole-barn': return 'Pole Barn';
    case 'carport': return 'Carport';
    case 'i-beam': return 'I-Beam Construction';
    case 'bolt-up': return 'Bolt-Up';
    default: return 'Building';
  }
}

function getConcreteLabel(type: string): string {
  switch (type) {
    case 'none': return 'None (Owner Provides)';
    case 'piers': return 'Concrete Piers';
    case 'slab': return '4" Slab w/ #3 Rebar';
    case 'turnkey': return 'Turnkey Package w/ #3 Rebar';
    case 'limestone': return 'Crushed Limestone Pad';
    case 'caliche': return 'Caliche Base';
    default: return 'None';
  }
}

function getInsulationLabel(type: string): string {
  switch (type) {
    case 'none': return 'None';
    case 'ceiling': return 'Ceiling Only';
    case 'wall': return 'Wall Only';
    case 'full': return 'Full (Walls + Ceiling)';
    default: return 'None';
  }
}

/* ─── tiny section card ─── */
function SummaryCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
        {icon}
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-5 py-4 text-sm text-gray-600 space-y-1">{children}</div>
    </motion.div>
  );
}

/* ─── Row helper ─── */
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{String(value)}</span>
    </div>
  );
}

/* ─── Building Card (for multi-building view) ─── */
function BuildingCard({
  entry,
  isCurrentlyEditing,
  onEdit,
  onRemove,
  showRemove,
}: {
  entry: BuildingEntry;
  isCurrentlyEditing: boolean;
  onEdit: () => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const { building, accessories, colors, concrete, pricing } = entry;
  const buildingLabel = getBuildingTypeLabel(building.buildingType);
  const sqft = building.width * building.length;
  const totalDoors = accessories.walkDoors.length + accessories.rollUpDoors.length;
  const totalWindows = accessories.windows.length;
  const leanToSuffix = entry.leanTo.isLeanTo ? ' (Lean-To)' : '';

  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-xl border-2 overflow-hidden ${
        isCurrentlyEditing
          ? 'border-orange-400 bg-orange-50/30'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Header with label + actions */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            {entry.label}{leanToSuffix}
          </h3>
          {isCurrentlyEditing && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
              Editing
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            title="Edit building"
          >
            <Pencil className="w-3.5 h-3.5 text-gray-500" />
          </button>
          {showRemove && (
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
              title="Remove building"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Building details grid */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {/* Left column */}
          <div className="space-y-1">
            <Row label="Type" value={buildingLabel} />
            <Row label="Size" value={`${building.width}' × ${building.length}' (${sqft.toLocaleString()} sf)`} />
            <Row label="Eave Height" value={`${building.height}'`} />
            <Row label="Frame" value={building.legType === 'certified' ? 'Certified' : 'Standard'} />
          </div>
          {/* Right column */}
          <div className="space-y-1">
            <Row label="Doors" value={totalDoors > 0 ? `${totalDoors} total` : 'None'} />
            <Row label="Windows" value={totalWindows > 0 ? `${totalWindows} total` : 'None'} />
            <Row label="Insulation" value={getInsulationLabel(accessories.insulation)} />
            <Row label="Foundation" value={getConcreteLabel(concrete.type)} />
          </div>
        </div>

        {/* Colors row */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">Colors:</span>
          {[
            { label: 'Roof', color: colors.roof },
            { label: 'Walls', color: colors.walls },
            { label: 'Trim', color: colors.trim },
            { label: 'Doors', color: colors.doors },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-xs text-gray-500">{c.label}</span>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Subtotal</span>
          <span className="text-lg font-bold text-orange-600">{fmt(pricing.grandTotal)}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */

export function Step7Summary() {
  const {
    building, accessories, colors, concrete, pricing,
    buildings, currentBuildingIndex,
    calculatePricing, saveCurrentBuilding,
    addBuilding, duplicateBuilding, editBuilding, removeBuilding
  } = useEstimatorStore();

  // Auto-save current building and recalculate on mount
  useEffect(() => {
    calculatePricing();
    // Auto-save so the buildings array always has the latest
    saveCurrentBuilding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildingLabel = getBuildingTypeLabel(building.buildingType);
  const sqft = building.width * building.length;
  const hasMultipleBuildings = buildings.length > 1;

  // Calculate combined total
  const combinedTotal = buildings.reduce((sum, b) => sum + b.pricing.grandTotal, 0);
  const displayTotal = hasMultipleBuildings ? combinedTotal : pricing.grandTotal;
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="py-4 space-y-5"
    >
      {/* Hero total */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 text-center shadow-lg"
      >
        <p className="text-sm font-medium uppercase tracking-wider text-orange-100 mb-1">
          {hasMultipleBuildings ? 'Combined Estimate Total' : 'Estimated Total'}
        </p>
        <p className="text-4xl font-extrabold">{fmt(displayTotal)}</p>
        {hasMultipleBuildings ? (
          <p className="text-xs text-orange-200 mt-2">
            {buildings.length} buildings &mdash; {buildings.map(b =>
              `${b.building.width}'×${b.building.length}'`
            ).join(' + ')}
          </p>
        ) : (
          <p className="text-xs text-orange-200 mt-2">
            {building.width}&prime; &times; {building.length}&prime; {buildingLabel} &mdash;{' '}
            {sqft.toLocaleString()} sq ft
          </p>
        )}
      </motion.div>

      {/* ─── Multi-Building View ─── */}
      {hasMultipleBuildings ? (
        <>
          {/* Building cards */}
          {buildings.map((entry, index) => (
            <BuildingCard
              key={entry.id}
              entry={entry}
              isCurrentlyEditing={index === currentBuildingIndex}
              onEdit={() => editBuilding(index)}
              onRemove={() => removeBuilding(index)}
              showRemove={buildings.length > 1}
            />
          ))}

          {/* Combined Price Breakdown */}
          <SummaryCard
            icon={<DollarSign className="w-4 h-4 text-orange-500" />}
            title="Combined Price Breakdown"
          >
            {buildings.map((entry) => (
              <Row
                key={entry.id}
                label={`${entry.label} (${entry.building.width}'×${entry.building.length}' ${getBuildingTypeLabel(entry.building.buildingType)})`}
                value={fmt(entry.pricing.grandTotal)}
              />
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
              <span className="font-bold text-gray-800">Grand Total</span>
              <span className="font-extrabold text-orange-600 text-base">{fmt(combinedTotal)}</span>
            </div>
            {DRAW_SCHEDULE.map((draw) => (
              <div key={draw.label} className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{draw.label} ({Math.round(draw.percent * 100)}%) — {draw.description}</span>
                <span>{fmt(combinedTotal * draw.percent)}</span>
              </div>
            ))}
          </SummaryCard>
        </>
      ) : (
        <>
          {/* ─── Single-Building View (original layout) ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Building */}
            <SummaryCard
              icon={<Building2 className="w-4 h-4 text-orange-500" />}
              title="Building"
            >
              <Row label="Type" value={buildingLabel} />
              <Row label="Size" value={`${building.width}' × ${building.length}'`} />
              <Row label="Eave Height" value={`${building.height}'`} />
              {building.attachedCarport.enabled && (
                <>
                  <Row
                    label={building.attachedCarport.mode === 'interior' ? 'Interior Carport' : 'Attached Carport'}
                    value={`${building.attachedCarport.attachWall.charAt(0).toUpperCase() + building.attachedCarport.attachWall.slice(1)} wall, ${building.attachedCarport.depth}' deep${building.attachedCarport.customWidth ? `, ${building.attachedCarport.customWidth}' wide` : ''}`}
                  />
                  {building.attachedCarport.partitionWalls.length > 0 && (
                    <Row
                      label="Partition Walls"
                      value={building.attachedCarport.partitionWalls.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(', ')}
                    />
                  )}
                </>
              )}
              <Row label="Frame" value={building.legType === 'certified' ? 'Engineer Certified' : 'Standard'} />
              <Row label="Panels" value="26 gauge" />
              <Row label="Square Feet" value={`${sqft.toLocaleString()} sq ft`} />
              {(() => {
                const p = calculatePurlins(building.width, building.length, building.height);
                return (
                  <>
                    <Row label="Sidewall Purlins" value={`${p.sidewallPurlinsPerWall}/wall`} />
                    <Row label="Roof Purlins" value={`${p.roofPurlinsPerSide}/side @ ${p.roofPurlinSpacing}' O.C.`} />
                    <Row label="Total Purlins" value={`${p.totalPurlins} (${p.totalLinearFeet.toLocaleString()} lnft)`} />
                  </>
                );
              })()}
            </SummaryCard>

            {/* Doors & Windows */}
            <SummaryCard
              icon={<DoorOpen className="w-4 h-4 text-orange-500" />}
              title="Doors & Windows"
            >
              {accessories.walkDoors.length + accessories.rollUpDoors.length + accessories.windows.length === 0 ? (
                <p className="text-gray-400 italic">None selected</p>
              ) : (
                <>
                  {accessories.walkDoors.map((d) => (
                    <Row
                      key={d.id}
                      label={`Walk Door (${d.size})`}
                      value={`${d.wall.charAt(0).toUpperCase() + d.wall.slice(1)} wall × ${d.quantity}`}
                    />
                  ))}
                  {accessories.rollUpDoors.map((d) => (
                    <Row
                      key={d.id}
                      label={`Roll-Up (${d.size})`}
                      value={`${d.wall.charAt(0).toUpperCase() + d.wall.slice(1)} wall × ${d.quantity}`}
                    />
                  ))}
                  {accessories.windows.map((w) => (
                    <Row
                      key={w.id}
                      label={`Window (${w.size})`}
                      value={`${w.wall.charAt(0).toUpperCase() + w.wall.slice(1)} wall × ${w.quantity}`}
                    />
                  ))}
                </>
              )}
            </SummaryCard>

            {/* Colors */}
            <SummaryCard
              icon={<Palette className="w-4 h-4 text-orange-500" />}
              title="Colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: colors.roof }} />
                <Row label="Roof" value={colorName(colors.roof)} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: colors.walls }} />
                <Row label="Walls" value={colorName(colors.walls)} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: colors.trim }} />
                <Row label="Trim" value={colorName(colors.trim)} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: colors.doors }} />
                <Row label="Doors" value={colorName(colors.doors)} />
              </div>
            </SummaryCard>

            {/* Add-Ons */}
            <SummaryCard
              icon={<Layers className="w-4 h-4 text-orange-500" />}
              title="Add-Ons & Foundation"
            >
              <Row label="Insulation" value={getInsulationLabel(accessories.insulation)} />
              <Row label="Ventilation" value={accessories.ventilation ? 'Ridge Vents' : 'None'} />
              <Row label="Gutters" value={accessories.gutters ? 'Included' : 'None'} />
              <Row label="Foundation" value={getConcreteLabel(concrete.type)} />
              {building.attachedCarport.enabled && !concrete.combinedFoundation && (
                <Row label="Carport Foundation" value={getConcreteLabel(concrete.carportFoundationType)} />
              )}
              {building.attachedCarport.enabled && concrete.combinedFoundation && (
                <Row label="Foundation" value="Combined (building + carport)" />
              )}
            </SummaryCard>
          </div>

          {/* Pricing Breakdown */}
          <SummaryCard
            icon={<DollarSign className="w-4 h-4 text-orange-500" />}
            title="Price Breakdown"
          >
            <Row label="Base Building Package (includes install)" value={fmt(pricing.basePrice)} />
            <Row label="Doors, Windows & Accessories" value={fmt(pricing.accessoriesTotal)} />
            <Row label={building.attachedCarport.enabled && !concrete.combinedFoundation ? 'Building Foundation' : 'Foundation'} value={fmt(pricing.concreteTotal)} />
            {pricing.carportConcreteTotal > 0 && (
              <Row label="Carport Foundation" value={fmt(pricing.carportConcreteTotal)} />
            )}
            {pricing.carportTotal > 0 && (
              <Row label={building.attachedCarport.mode === 'interior' ? 'Interior Carport (walls only)' : 'Attached Carport'} value={fmt(pricing.carportTotal)} />
            )}
            {building.attachedCarport.enabled && building.attachedCarport.mode === 'interior' && pricing.carportTotal === 0 && (
              <Row label="Interior Carport" value="$0.00 (under main roof)" />
            )}
            <Row label="Delivery + Haul Off" value={fmt(pricing.deliveryTotal)} />
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
              <span className="font-bold text-gray-800">Grand Total</span>
              <span className="font-extrabold text-orange-600 text-base">{fmt(pricing.grandTotal)}</span>
            </div>
            {DRAW_SCHEDULE.map((draw) => (
              <div key={draw.label} className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{draw.label} ({Math.round(draw.percent * 100)}%) — {draw.description}</span>
                <span>{fmt(pricing.grandTotal * draw.percent)}</span>
              </div>
            ))}
          </SummaryCard>
        </>
      )}

      {/* ─── Add / Duplicate Building Buttons ─── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-3"
      >
        <button
          onClick={addBuilding}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Building
        </button>
        <button
          onClick={duplicateBuilding}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all font-medium"
        >
          <Copy className="w-5 h-5" />
          Duplicate Building
        </button>
      </motion.div>

      {/* Save Quote Button (only shows if Supabase is configured) */}
      <motion.div variants={itemVariants}>
        <SaveQuoteButton />
      </motion.div>

      {/* Ready CTA */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2 justify-center text-emerald-600 mt-2"
      >
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm font-medium">
          Estimate complete — click <strong>Proceed to Contract</strong> below when ready.
        </span>
      </motion.div>
    </motion.div>
  );
}

export default Step7Summary;
