'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar'; // Ensure Sidebar is correctly imported

type PlantInfo = {
  name: string;
  ph: string;
  ppm: string;
  previewImage: string;
};

const plants: PlantInfo[] = [
  { name: 'Lettuce', ph: '5.5 - 6.5', ppm: '560 - 840', previewImage: '/images/lettuce.jpg' },
  { name: 'Tomato', ph: '5.5 - 6.5', ppm: '1400 - 3500', previewImage: '/images/tomato.jpg' },
  { name: 'Spinach', ph: '6.0 - 7.0', ppm: '1260 - 1610', previewImage: '/images/spinach.jpg' },
  { name: 'Cucumber', ph: '5.8 - 6.0', ppm: '1190 - 1750', previewImage: '/images/cucumber.jpg' },
  { name: 'Peppers', ph: '5.5 - 6.0', ppm: '1260 - 1540', previewImage: '/images/peppers.jpg' },
  { name: 'Strawberries', ph: '5.5 - 6.2', ppm: '1260 - 1540', previewImage: '/images/strawberries.jpg' },
  { name: 'Basil', ph: '5.5 - 6.5', ppm: '700 - 1120', previewImage: '/images/basil.jpg' },
  { name: 'Broccoli', ph: '6.0 - 6.5', ppm: '1960 - 2450', previewImage: '/images/broccoli.jpg' },
];

export default function AddPlant() {
  const [selectedPlant, setSelectedPlant] = useState<PlantInfo | null>(null);
  const [customPlant, setCustomPlant] = useState<PlantInfo | null>(null);
  const [isAddingCustomPlant, setIsAddingCustomPlant] = useState(false);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plant = plants.find(p => p.name === e.target.value) || null;
    setSelectedPlant(plant);
  };

  const handleCustomPlantSubmit = () => {
    if (!customPlant) return;
    // Add the custom plant to the list (can also store in database)
    plants.push(customPlant);
    setSelectedPlant(customPlant);
    setCustomPlant(null); // Reset after submission
    setIsAddingCustomPlant(false); // Hide the form
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 to-blue-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-hidden">
        <h1 className="text-4xl font-semibold text-green-800 mb-8">Add Plant</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - Select a Plant */}
          <div className="space-y-4">
            <label htmlFor="plant-select" className="text-lg font-semibold text-gray-700">
              Select a plant:
            </label>
            <select
              id="plant-select"
              onChange={handleSelect}
              className="w-full p-4 border-2 border-green-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
            >
              <option value="">-- Choose a plant --</option>
              {plants.map((plant) => (
                <option key={plant.name} value={plant.name}>
                  {plant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right side - Add Custom Plant Button */}
          <div className="space-y-4 flex items-center justify-center md:justify-start">
            <button
              onClick={() => setIsAddingCustomPlant(!isAddingCustomPlant)}
              className="w-full md:w-auto p-4 bg-green-700 text-white rounded-lg shadow-md hover:bg-green-800 transition duration-300"
            >
              {isAddingCustomPlant ? 'Cancel' : 'Add Custom Plant'}
            </button>
          </div>
        </div>

        {/* Custom Plant Form (Toggle Visibility) */}
        {isAddingCustomPlant && (
          <div className="mt-8 space-y-6 max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-700">Custom Plant Details</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Plant Name"
                className="w-full p-4 border-2 border-green-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                value={customPlant?.name || ''}
                onChange={(e) => setCustomPlant({ ...customPlant, name: e.target.value } as PlantInfo)}
              />
              <input
                type="text"
                placeholder="pH Level"
                className="w-full p-4 border-2 border-green-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                value={customPlant?.ph || ''}
                onChange={(e) => setCustomPlant({ ...customPlant, ph: e.target.value } as PlantInfo)}
              />
              <input
                type="text"
                placeholder="PPM Range"
                className="w-full p-4 border-2 border-green-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
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

        {/* Plant Preview */}
        <div className="mt-8">
          {selectedPlant === null ? (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Select a plant to view details</h3>
              <img
                src="/images/plant-preview.png"
                alt="Plant preview"
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <p className="text-lg text-gray-600">Choose a plant from the dropdown above to see its details.</p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">{selectedPlant.name}</h3>
              <img
                src={selectedPlant.previewImage}
                alt={selectedPlant.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <p className="text-lg font-medium">
                <strong>pH Level:</strong> {selectedPlant.ph}
              </p>
              <p className="text-lg font-medium">
                <strong>PPM Range:</strong> {selectedPlant.ppm} ppm
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}