'use client';

import { useState } from 'react';
import React from 'react';
import Sidebar from '@/components/sidebar';

type PlantInfo = {
  name: string;
  ph: string;
  ppm: string;
  previewImage: string;
};

const plants: PlantInfo[] = [
  { name: 'Lettuce', ph: '5.5 - 6.5', ppm: '560 - 840', previewImage: 'images/lettuce.jpg' },
  { name: 'Kale', ph: '5.5 - 6.5', ppm: '1400 - 3500', previewImage: 'images/kale.jpg' },
  { name: 'Spinach', ph: '6.0 - 7.0', ppm: '1260 - 1610', previewImage: 'images/spinach.jpg' },
  { name: 'Cabbage', ph: '5.8 - 6.0', ppm: '1190 - 1750', previewImage: 'images/cabbage.jpg' },
  { name: 'Basil', ph: '5.5 - 6.5', ppm: '700 - 1120', previewImage: 'images/basil.jpg' },
  { name: 'Broccoli', ph: '6.0 - 6.5', ppm: '1960 - 2450', previewImage: 'images/broccoli.jpg' },
];

type WateringSchedule = {
  time: string;
  frequency: string;
};

type SelectedPlantWithSchedule = {
  plant: PlantInfo;
  schedule: WateringSchedule;
};

export default function CreateTower() {
  const [selectedPlants, setSelectedPlants] = useState<SelectedPlantWithSchedule[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSelectPlant = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plantName = e.target.value;
    if (!plantName) return;

    const plant = plants.find((p) => p.name === plantName);
    if (!plant) return;

    setSelectedPlants((prev) => [
      ...prev,
      { plant, schedule: { time: '', frequency: '' } },
    ]);
  };

  const handleWateringScheduleChange = (
    index: number,
    field: 'time' | 'frequency',
    value: string
  ) => {
    const updated = [...selectedPlants];
    updated[index].schedule[field] = value;
    setSelectedPlants(updated);
  };

  const handleRemovePlant = (index: number) => {
    const updated = selectedPlants.filter((_, i) => i !== index);
    setSelectedPlants(updated);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Sidebar />

      <main className="flex-1 p-8 overflow-hidden">
        <h1 className="text-3xl font-semibold text-green-700 mb-10">Create Tower</h1>

        {/* Plant Selector */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 max-w-xl mb-10">
          <label htmlFor="plant-select" className="block text-sm font-medium text-gray-600 mb-2">
            Select a plant to add:
          </label>
          <select
            id="plant-select"
            onChange={handleSelectPlant}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          >
            <option value="">Choose a plant</option>
            {plants.map((plant) => (
              <option key={plant.name} value={plant.name}>
                {plant.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Plants */}
        {selectedPlants.length > 0 && (
          <div className="space-y-6 max-w-xl">
            {selectedPlants.map((item, index) => (
              <div
                key={`${item.plant.name}-${index}`}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-5 space-x-4 mb-4">
                  <img
                    src={item.plant.previewImage}
                    alt={item.plant.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{item.plant.name}</h3>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-600">pH:</span> {item.plant.ph}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-600">PPM:</span> {item.plant.ppm} ppm
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Watering Time</label>
                    <input
                      type="time"
                      value={item.schedule.time}
                      onChange={(e) =>
                        handleWateringScheduleChange(index, 'time', e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Watering Frequency</label>
                    <select
                      value={item.schedule.frequency}
                      onChange={(e) =>
                        handleWateringScheduleChange(index, 'frequency', e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      <option value="">Choose frequency</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-weekly">Bi-weekly</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleRemovePlant(index)}
                    className="w-full py-3 text-green rounded-lg hover:bg-red-500 transition"
                  >
                    Remove Plant
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="text-center mt-12">
          <button
            onClick={() => {
              if (selectedPlants.length > 0) {
                setShowSuccessModal(true); // Show the success modal
              }
            }}
            disabled={selectedPlants.length === 0}
            className={`py-3 px-6 rounded-2xl shadow-md text-sm font-semibold transition 
              ${selectedPlants.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            CREATE TOWER
          </button>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-sm mx-auto">
              <h2 className="text-xl font-bold text-green-700 mb-2">Tower Created!</h2>
              <p className="text-gray-600 mb-4">Your tower has been successfully configured. 🌱</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
