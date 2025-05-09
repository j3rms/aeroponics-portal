'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';

type PlantInfo = {
  name: string;
  ph: string;
  ppm: string;
  previewImage: string;
};

const plants: PlantInfo[] = [
  { name: 'Lettuce', ph: '5.5 - 6.5', ppm: '560 - 840', previewImage: '/images/lettuce.jpg' },
  { name: 'Kale', ph: '5.5 - 6.5', ppm: '1400 - 3500', previewImage: '/images/kale.jpg' },
  { name: 'Spinach', ph: '6.0 - 7.0', ppm: '1260 - 1610', previewImage: '/images/spinach.jpg' },
  { name: 'Cabbage', ph: '5.8 - 6.0', ppm: '1190 - 1750', previewImage: '/images/cabbage.jpg' },
  { name: 'Basil', ph: '5.5 - 6.5', ppm: '700 - 1120', previewImage: '/images/basil.jpg' },
  { name: 'Broccoli', ph: '6.0 - 6.5', ppm: '1960 - 2450', previewImage: '/images/broccoli.jpg' },
];

export default function AddPlant() {
  const [selectedPlant, setSelectedPlant] = useState<PlantInfo | null>(null);
  const [selectedPlants, setSelectedPlants] = useState<{ plant: PlantInfo }[]>([]);
  const [customPlant, setCustomPlant] = useState<PlantInfo | null>(null);
  const [isAddingCustomPlant, setIsAddingCustomPlant] = useState(false);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plant = plants.find(p => p.name === e.target.value) || null;
    setSelectedPlant(plant);
  };

  const handleCustomPlantSubmit = () => {
    if (!customPlant) return;
    plants.push(customPlant);
    setSelectedPlant(customPlant);
    setCustomPlant(null);
    setIsAddingCustomPlant(false);
  };

  const handleAddPlant = () => {
    if (selectedPlant) {
      setSelectedPlants(prev => [...prev, { plant: selectedPlant }]);
      setSelectedPlant(null); // Clear preview
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 to-blue-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-hidden">
        <h1 className="text-4xl font-semibold text-green-800 mb-8">Add Plant</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label htmlFor="plant-select" className="text-lg font-semibold text-gray-700">
              Select a plant:
            </label>
            <select
              id="plant-select"
              onChange={handleSelect}
              value={selectedPlant?.name || ''}
              className="w-full p-4 border-2 border-green-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
            >
              <option value="">Choose a plant</option>
              {plants.map((plant) => (
                <option key={plant.name} value={plant.name}>
                  {plant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 flex items-center justify-center md:justify-start">
            <button
              onClick={() => setIsAddingCustomPlant(!isAddingCustomPlant)}
              className="w-full md:w-auto p-4 bg-green-700 text-white rounded-2xl shadow-md hover:bg-green-800 transition duration-300"
            >
              {isAddingCustomPlant ? 'Cancel' : 'Add Custom Plant'}
            </button>
          </div>
        </div>

        {/* Custom Plant Form */}
        {isAddingCustomPlant && (
          <div className="mt-8 space-y-6 max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-700">Custom Plant Details</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Plant Name"
                className="w-full p-4 border-2 border-green-300 rounded-lg shadow-md"
                value={customPlant?.name || ''}
                onChange={(e) => setCustomPlant({ ...customPlant, name: e.target.value } as PlantInfo)}
              />
              <input
                type="text"
                placeholder="pH Level"
                className="w-full p-4 border-2 border-green-300 rounded-lg shadow-md"
                value={customPlant?.ph || ''}
                onChange={(e) => setCustomPlant({ ...customPlant, ph: e.target.value } as PlantInfo)}
              />
              <input
                type="text"
                placeholder="PPM Range"
                className="w-full p-4 border-2 border-green-300 rounded-lg shadow-md"
                value={customPlant?.ppm || ''}
                onChange={(e) => setCustomPlant({ ...customPlant, ppm: e.target.value } as PlantInfo)}
              />
            </div>
            <button
              onClick={handleCustomPlantSubmit}
              className="w-full p-4 bg-green-700 text-white rounded-lg shadow-md hover:bg-green-800 transition duration-300"
            >
              Add Custom Plant
            </button>
          </div>
        )}

        {/* Selected Plant Preview */}
        <div className="mt-8">
          {selectedPlant ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-4">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={selectedPlant.previewImage}
                  alt={selectedPlant.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-700">{selectedPlant.name}</h3>
                  <p className="text-sm text-gray-500"><strong>pH:</strong> {selectedPlant.ph}</p>
                  <p className="text-sm text-gray-500"><strong>PPM:</strong> {selectedPlant.ppm} ppm</p>
                </div>
              </div>
              <button
                onClick={handleAddPlant}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Plant
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200 text-center">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Select a plant from the dropdown to view its details 🌱</h3>
            </div>
          )}
        </div>

        {/* List of Added Plants */}
        {selectedPlants.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold text-green-800">Selected Plants</h2>
            {selectedPlants.map((item, index) => (
              <div
                key={`${item.plant.name}-${index}`}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={item.plant.previewImage}
                    alt={item.plant.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-700">{item.plant.name}</h3>
                    <p className="text-sm text-gray-500"><strong>pH:</strong> {item.plant.ph}</p>
                    <p className="text-sm text-gray-500"><strong>PPM:</strong> {item.plant.ppm} ppm</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
