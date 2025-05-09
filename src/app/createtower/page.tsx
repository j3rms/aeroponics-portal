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
  {
    name: 'Lettuce',
    ph: '5.5 - 6.5',
    ppm: '560 - 840',
    previewImage: 'images/lettuce.jpg',
  },
  {
    name: 'Kale',
    ph: '5.5 - 6.5',
    ppm: '1400 - 3500',
    previewImage: 'images/kale.jpg',
  },
  {
    name: 'Spinach',
    ph: '6.0 - 7.0',
    ppm: '1260 - 1610',
    previewImage: 'images/spinach.jpg',
  },
  {
    name: 'Cabbage',
    ph: '5.8 - 6.0',
    ppm: '1190 - 1750',
    previewImage: 'images/cabbage.jpg',
  },
  {
    name: 'Basil',
    ph: '5.5 - 6.5',
    ppm: '700 - 1120',
    previewImage: 'images/basil.jpg',
  },
  {
    name: 'Broccoli',
    ph: '6.0 - 6.5',
    ppm: '1960 - 2450',
    previewImage: 'images/broccoli.jpg',
  },
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

  const handleSelectPlant = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plantName = e.target.value;
    if (plantName === '') return;

    const plant = plants.find(p => p.name === plantName);
    if (!plant) return;

    setSelectedPlants([
      ...selectedPlants,
      { plant, schedule: { time: '', frequency: '' } },
    ]);
  };

  const handleWateringScheduleChange = (
    index: number,
    field: 'time' | 'frequency',
    value: string
  ) => {
    const updatedPlants = [...selectedPlants];
    updatedPlants[index].schedule[field] = value;
    setSelectedPlants(updatedPlants);
  };

  const handleRemovePlant = (index: number) => {
    const updatedPlants = selectedPlants.filter((_, i) => i !== index);
    setSelectedPlants(updatedPlants);
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 to-blue-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-hidden">
        <h1 className="text-3xl font-bold text-green-800 mb-8">Create Tower</h1>

        {/* Plant Selection */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="space-y-4 flex-1">
              <label htmlFor="plant-select" className="text-md text-gray-700">
                Select a plant to add to the tower:
              </label>
              <select
                id="plant-select"
                onChange={handleSelectPlant}
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
          </div>
        </div>

        {/* Display Selected Plants with Watering Schedule */}
        {selectedPlants.length > 0 && (
          <div className="space-y-4">
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
                    <p className="text-sm text-gray-500">
                      <strong>pH Level:</strong> {item.plant.ph}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>PPM Range:</strong> {item.plant.ppm} ppm
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-lg font-semibold text-gray-700">Watering Time</label>
                    <input
                      type="time"
                      value={item.schedule.time}
                      onChange={(e) =>
                        handleWateringScheduleChange(index, 'time', e.target.value)
                      }
                      className="w-full p-4 border-2 border-green-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                    />
                  </div>

                  <div>
                    <label className="text-lg font-semibold text-gray-700">Watering Frequency</label>
                    <select
                      value={item.schedule.frequency}
                      onChange={(e) =>
                        handleWateringScheduleChange(index, 'frequency', e.target.value)
                      }
                      className="w-full p-4 border-2 border-green-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                    >
                      <option value="">-- Choose frequency --</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-weekly">Bi-weekly</option>
                    </select>
                  </div>

                  {/* Remove Plant Button */}
                  <button
                    onClick={() => handleRemovePlant(index)}
                    className="p-3 bg-red-600 text-white rounded-2xl shadow-md hover:bg-red-700 transition duration-300 mt-4"
                  >
                    Remove Plant
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Display Summary of the Tower */}
            <div className="mt-10 text-center">
              <button
                onClick={() => setShowSuccessModal(true)}
                className="py-3 px-6 bg-green-600 mt-2 text-white text-sm font-semibold rounded-2xl shadow-md hover:bg-green-700 transition duration-300"
              >
                CREATE TOWER
              </button>

              {/* Centered Success Modal */}
              {showSuccessModal && (
                <div className="bg-black mt-2 bg-opacity-40 fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-xl shadow-xl text-center">
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
            </div>
      </main>
    </div>
  );
}



    