import { motion } from 'framer-motion';
import { DoorOpen, Square, Thermometer, Wind, Droplets, Plus, Minus, Trash2, MapPin } from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import Select from '../../common/Select/Select';
import Button from '../../common/Button/Button';
import Card from '../../common/Card/Card';
import BuildingProfile from '../building-profile/BuildingProfile';
import ViewControls from '../building-profile/ViewControls';
import type { DoorConfig, WindowConfig } from '../../../types/estimator';

// Generate a simple unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

export function Step3Accessories() {
  const {
    accessories,
    building,
    addDoor,
    removeDoor,
    updateDoor,
    addWindow,
    removeWindow,
    setAccessories
  } = useEstimatorStore();

  // Width options for walk doors
  const walkDoorWidths = [
    { value: '3', label: "3'" },
    { value: '4', label: "4'" },
    { value: '6', label: "6'" }
  ];

  // Height options for walk doors
  const walkDoorHeights = [
    { value: '7', label: "7'" },
    { value: '8', label: "8'" }
  ];

  // Width options for roll-up doors (8' to 14' in 2' increments)
  const rollUpDoorWidths = [
    { value: '8', label: "8'" },
    { value: '10', label: "10'" },
    { value: '12', label: "12'" },
    { value: '14', label: "14'" }
  ];

  // Height options for roll-up doors - must be at least 2' less than building height
  // Generated dynamically based on building.height
  const getAvailableDoorHeights = () => {
    const maxDoorHeight = building.height - 2; // Door must be 2' less than building height
    const heights = [];
    // Start at 8' and go up in 2' increments until maxDoorHeight
    for (let h = 8; h <= maxDoorHeight; h += 2) {
      heights.push({ value: String(h), label: `${h}'` });
    }
    return heights;
  };

  const rollUpDoorHeights = getAvailableDoorHeights();

  const windowSizes = [
    { value: '3x3', label: "3' x 3' Window" },
    { value: '4x4', label: "4' x 4' Window" }
  ];

  const wallOptions = [
    { value: 'front', label: 'Front Wall' },
    { value: 'back', label: 'Back Wall' },
    { value: 'left', label: 'Left Wall' },
    { value: 'right', label: 'Right Wall' }
  ];

  const insulationOptions = [
    { value: 'none', label: 'No Insulation' },
    { value: 'ceiling', label: 'Ceiling Only (R-19)' },
    { value: 'full', label: 'Full Insulation (Ceiling + Walls)' }
  ];

  // Get wall length based on selected wall
  const getWallLength = (wall: string) => {
    if (wall === 'front' || wall === 'back') {
      return building.width;
    }
    return building.length;
  };

  const handleAddWalkDoor = () => {
    const newDoor: DoorConfig = {
      id: generateId(),
      type: 'walk',
      size: '3x7',
      width: 3,
      height: 7,
      wall: 'front',
      position: 5,
      quantity: 1
    };
    addDoor(newDoor);
  };

  const handleAddRollUpDoor = () => {
    // Default height is the max available (building height - 2)
    const maxHeight = building.height - 2;
    const defaultHeight = Math.min(maxHeight, 10); // Start with 10' or max if building is shorter
    const newDoor: DoorConfig = {
      id: generateId(),
      type: 'rollUp',
      size: `10x${defaultHeight}` as any,
      width: 10,
      height: defaultHeight,
      wall: 'front',
      position: 5,
      quantity: 1
    };
    addDoor(newDoor);
  };

  const handleAddWindow = () => {
    const newWindow: WindowConfig = {
      id: generateId(),
      size: '3x3',
      width: 3,
      height: 3,
      wall: 'front',
      position: 5,
      quantity: 1
    };
    addWindow(newWindow);
  };

  const handleQuantityChange = (doorId: string, delta: number) => {
    const allDoors = [...accessories.walkDoors, ...accessories.rollUpDoors];
    const door = allDoors.find(d => d.id === doorId);
    if (door) {
      const newQty = Math.max(1, Math.min(10, door.quantity + delta));
      updateDoor(doorId, { quantity: newQty });
    }
  };

  const handleWidthChange = (doorId: string, width: number) => {
    const allDoors = [...accessories.walkDoors, ...accessories.rollUpDoors];
    const door = allDoors.find(d => d.id === doorId);
    if (door) {
      const newSize = `${width}x${door.height}` as any;
      updateDoor(doorId, { width, size: newSize });
    }
  };

  const handleHeightChange = (doorId: string, height: number) => {
    const allDoors = [...accessories.walkDoors, ...accessories.rollUpDoors];
    const door = allDoors.find(d => d.id === doorId);
    if (door) {
      const newSize = `${door.width}x${height}` as any;
      updateDoor(doorId, { height, size: newSize });
    }
  };

  const handlePositionChange = (doorId: string, position: number) => {
    updateDoor(doorId, { position });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      <motion.p variants={itemVariants} className="text-gray-600">
        Add doors, windows, and other accessories to your building.
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accessories Selection */}
        <div className="space-y-6">
          {/* Walk Doors */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-orange-600" />
                Walk Doors
              </h3>
              <Button size="sm" variant="outline" onClick={handleAddWalkDoor} leftIcon={<Plus className="w-4 h-4" />}>
                Add Door
              </Button>
            </div>

            {accessories.walkDoors.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No walk doors added</p>
            ) : (
              <div className="space-y-4">
                {accessories.walkDoors.map((door, index) => (
                  <Card key={door.id} variant="bordered" padding="md" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Walk Door #{index + 1}</span>
                      <button
                        onClick={() => removeDoor(door.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 w-16">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(door.id, -1)}
                          disabled={door.quantity <= 1}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-800">{door.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(door.id, 1)}
                          disabled={door.quantity >= 10}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Width & Height */}
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        label="Width"
                        options={walkDoorWidths}
                        value={String(door.width || 3)}
                        onChange={(e) => handleWidthChange(door.id, Number(e.target.value))}
                      />
                      <Select
                        label="Height"
                        options={walkDoorHeights}
                        value={String(door.height || 7)}
                        onChange={(e) => handleHeightChange(door.id, Number(e.target.value))}
                      />
                    </div>

                    {/* Wall & Position */}
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        label="Wall"
                        options={wallOptions}
                        value={door.wall}
                        onChange={(e) => updateDoor(door.id, { wall: e.target.value as any })}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          Position (ft from left)
                        </label>
                        <input
                          type="number"
                          min={2}
                          max={getWallLength(door.wall) - (door.width || 3) - 2}
                          value={door.position || 5}
                          onChange={(e) => handlePositionChange(door.id, Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

          {/* Roll-Up Doors */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Square className="w-5 h-5 text-orange-600" />
                Roll-Up Doors
              </h3>
              <Button size="sm" variant="outline" onClick={handleAddRollUpDoor} leftIcon={<Plus className="w-4 h-4" />}>
                Add Door
              </Button>
            </div>

            {accessories.rollUpDoors.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No roll-up doors added</p>
            ) : (
              <div className="space-y-4">
                {accessories.rollUpDoors.map((door, index) => (
                  <Card key={door.id} variant="bordered" padding="md" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Roll-Up Door #{index + 1}</span>
                      <button
                        onClick={() => removeDoor(door.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 w-16">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(door.id, -1)}
                          disabled={door.quantity <= 1}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-800">{door.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(door.id, 1)}
                          disabled={door.quantity >= 10}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Width & Height */}
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        label="Width"
                        options={rollUpDoorWidths}
                        value={String(door.width || 10)}
                        onChange={(e) => handleWidthChange(door.id, Number(e.target.value))}
                      />
                      <Select
                        label="Height"
                        options={rollUpDoorHeights}
                        value={String(door.height || 10)}
                        onChange={(e) => handleHeightChange(door.id, Number(e.target.value))}
                      />
                    </div>

                    {/* Wall & Position */}
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        label="Wall"
                        options={wallOptions}
                        value={door.wall}
                        onChange={(e) => updateDoor(door.id, { wall: e.target.value as any })}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          Position (ft from left)
                        </label>
                        <input
                          type="number"
                          min={2}
                          max={getWallLength(door.wall) - (door.width || 10) - 2}
                          value={door.position || 5}
                          onChange={(e) => handlePositionChange(door.id, Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

          {/* Windows */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Square className="w-5 h-5 text-orange-600" />
                Windows
              </h3>
              <Button size="sm" variant="outline" onClick={handleAddWindow} leftIcon={<Plus className="w-4 h-4" />}>
                Add
              </Button>
            </div>

            {accessories.windows.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No windows added</p>
            ) : (
              <div className="space-y-3">
                {accessories.windows.map((window) => (
                  <Card key={window.id} variant="bordered" padding="sm" className="flex items-center gap-3">
                    <Select
                      options={windowSizes}
                      value={window.size}
                      onChange={(e) => {
                        const updatedWindows = accessories.windows.map((w) =>
                          w.id === window.id ? { ...w, size: e.target.value as any } : w
                        );
                        setAccessories({ windows: updatedWindows });
                      }}
                      className="flex-1"
                    />
                    <Select
                      options={wallOptions}
                      value={window.wall}
                      onChange={(e) => {
                        const updatedWindows = accessories.windows.map((w) =>
                          w.id === window.id ? { ...w, wall: e.target.value as any } : w
                        );
                        setAccessories({ windows: updatedWindows });
                      }}
                      className="flex-1"
                    />
                    <button
                      onClick={() => removeWindow(window.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

          {/* Other Options */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-600" />
              Additional Options
            </h3>

            <Select
              label="Insulation"
              options={insulationOptions}
              value={accessories.insulation}
              onChange={(e) => setAccessories({ insulation: e.target.value as any })}
            />

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessories.ventilation}
                  onChange={(e) => setAccessories({ ventilation: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-400"
                />
                <Wind className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Ridge Ventilation</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessories.gutters}
                  onChange={(e) => setAccessories({ gutters: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-400"
                />
                <Droplets className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Gutters & Downspouts</span>
              </label>
            </div>
          </motion.div>
        </div>

        {/* Building Preview */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Building Preview</h3>
          <ViewControls />
          <BuildingProfile showDoors showClearanceZones />

          {/* Door Placement Guide */}
          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
            <h4 className="text-sm font-semibold text-cyan-800 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Door Placement Guide
            </h4>
            <ul className="text-sm text-cyan-700 space-y-1">
              <li>• Position is measured in feet from the left edge of the wall</li>
              <li>• Doors must be at least 2'6" away from structural posts</li>
              <li>• The preview shows approximate door locations</li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Final door placement will be verified during the engineering review to ensure structural integrity.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Step3Accessories;
