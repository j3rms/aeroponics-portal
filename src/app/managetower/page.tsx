'use client';

import { useState } from 'react';
import React from 'react';
import Sidebar from '@/components/sidebar';
import { Pencil, Trash2 } from 'lucide-react';

type Tower = {
  id: number;
  name: string;
  image: string;
};

const initialTowers: Tower[] = [
  { id: 1, name: 'TOWER 1', image: '/images/tower.png' },
  { id: 2, name: 'TOWER 2', image: '/images/tower.png' },
  { id: 3, name: 'TOWER 3', image: '/images/tower.png' },
  { id: 4, name: 'TOWER 4', image: '/images/tower.png' },
  { id: 5, name: 'TOWER 5', image: '/images/tower.png' },
  { id: 6, name: 'TOWER 6', image: '/images/tower.png' },
  { id: 7, name: 'TOWER 7', image: '/images/tower.png' },
  { id: 8, name: 'TOWER 8', image: '/images/tower.png' },
];

const plants = [
  { name: 'Lettuce' },
  { name: 'Kale' },
  { name: 'Spinach' },
  { name: 'Cabbage' },
  { name: 'Basil' },
  { name: 'Broccoli' },
];

export default function ManageTower() {
  const [towers, setTowers] = useState<Tower[]>(initialTowers);
  const [selectedPlant, setSelectedPlant] = useState<string>('');

  const handleDeleteTower = (id: number) => {
    setTowers((prev) => prev.filter((tower) => tower.id !== id));
  };

  const handleEditTower = (id: number) => {
    alert(`Edit settings for Tower ${id}`);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Sidebar />

      <main className="flex-1 p-8 overflow-hidden">
        <h1 className="text-3xl font-semibold text-green-700 mb-10">Manage Tower</h1>

        {/* Plant Selector */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 max-w-sm mb-10">
          <label
            htmlFor="plant-select"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Select a plant to add:
          </label>
          <select
            id="plant-select"
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
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

        {/* Towers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {towers.map((tower) => (
            <div
              key={tower.id}
              className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center"
            >
              <img
                src={tower.image}
                alt={tower.name}
                className="w-24 h-24 object-contain mb-4"
              />
              <p className="text-gray-800 font-semibold">{tower.name}</p>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => handleEditTower(tower.id)}
                  className="p-2 text-green-700 hover:bg-green-100 rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTower(tower.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
