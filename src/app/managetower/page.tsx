"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import Header from "@/components/header";
import Link from "next/link";

type Tower = {
  id: number;
  name: string;
  image: string;
};

const initialTowers: Tower[] = [
  { id: 1, name: "Tower 1", image: "/images/tower.png" },
  { id: 2, name: "Tower 2", image: "/images/tower.png" },
  { id: 3, name: "Tower 3", image: "/images/tower.png" },
  { id: 4, name: "Tower 4", image: "/images/tower.png" },
  { id: 5, name: "Tower 5", image: "/images/tower.png" },
  { id: 6, name: "Tower 6", image: "/images/tower.png" },
  { id: 7, name: "Tower 7", image: "/images/tower.png" },
  { id: 8, name: "Tower 8", image: "/images/tower.png" },
];

export default function ManageTower() {
  const [towers, setTowers] = useState<Tower[]>(initialTowers);

  const handleDeleteTower = (id: number) => {
    setTowers((prev) => prev.filter((tower) => tower.id !== id));
  };

  const handleEditTower = (id: number) => {
    alert(`Edit settings for Tower ${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* ✅ Header */}
      <Header />

      <main className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full">
        {/* Top Section */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">Manage Towers</h1>
            <p className="text-gray-600 mb-10">
              View, edit, and manage your hydroponic towers with ease.
            </p>
          </div>

          <Link href="/createtower">
            <button className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:bg-green-700 hover:shadow-xl transition-all">
              <Plus className="w-5 h-5" />
              New Tower
            </button>
          </Link>
        </div>

        {/* Towers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {towers.map((tower) => (
            <div
              key={tower.id}
              className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-green-200 transition-all p-6 flex flex-col items-center"
            >
              {/* Tower Image */}
              <div className="w-28 h-28 mb-4 flex items-center justify-center bg-green-50 rounded-xl group-hover:bg-green-100 transition">
                <img
                  src={tower.image}
                  alt={tower.name}
                  className="w-24 h-24 object-contain"
                />
              </div>

              {/* Tower Name */}
              <p className="text-lg font-semibold text-gray-800">
                {tower.name}
              </p>
              <p className="text-sm text-gray-400 mb-4">Healthy • Online</p>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => handleEditTower(tower.id)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTower(tower.id)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {towers.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <img
              src="/images/empty-state.svg"
              alt="No Towers"
              className="w-40 h-40 mb-6 opacity-80"
            />
            <p className="text-gray-600 text-lg font-medium mb-4">
              No towers created yet
            </p>
            <Link href="/createtower">
              <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-green-700 hover:shadow-xl transition">
                + Create Tower
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
