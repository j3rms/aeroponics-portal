'use client';

import { useState, useEffect } from "react";
// import axios from "axios"; // install if not already: npm install axios
import { Pencil, Trash2, Plus } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Link from "next/link";

export default function ManageTower() {
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch towers from backend API
  useEffect(() => {
  const fetchTowers = async () => {
    try {
      // Fetch towers using parsedUser directly (not state)
      const towersFromApi = await fetch(`apis/getAllUserTowers`);
      const towersResponse = await towersFromApi.json();

      const mappedTowers = towersResponse.data.data.map((tower) => ({
        id: tower.id,
        name: tower.plant?.name || `Tower ${tower.id}`,
        image: "/images/tower.png",
      }));

      setTowers(mappedTowers);
    } catch (error) {
      console.error("Error fetching towers:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchTowers();
}, []);

  const handleDeleteTower = async (id) => {
    try {
      const response = await fetch(`/apis/deleteTower/${id}`, {
        method: "DELETE",
      });
        
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete tower");
      }

      // Remove from UI only if backend confirms success
      setTowers((prev) => prev.filter((tower) => tower.id !== id));
    } catch (error) {
      console.error("Error deleting tower:", error);
      alert("Failed to delete tower. Please try again.");
    }
  };

  const handleEditTower = (id) => {
    alert(`Edit settings for Tower ${id}`);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pl-32">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 px-12 py-16 max-w-7xl mx-auto w-full ml-20 md:ml-64 transition-all duration-300">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Manage Towers
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              View, edit, and manage your hydroponic towers with ease.
            </p>
          </div>

          <Link href="/createtower">
            <button className="flex items-center gap-3 bg-green-600 text-white px-7 py-3 rounded-2xl font-medium shadow-lg hover:bg-green-700 hover:shadow-xl transition-all">
              <Plus className="w-5 h-5" />
              New Tower
            </button>
          </Link>
        </div>

        {/* Towers Grid */}
        {loading ? (
          <p className="text-gray-600 text-lg">Loading towers...</p>
        ) : towers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {towers.map((tower) => (
              <div
                key={tower.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-md 
                 hover:shadow-lg p-6 flex flex-col justify-between items-center 
                 min-h-[300px] max-w-xs mx-auto"
              >
                {/* Tower Image */}
                <div className="w-28 h-28 mb-4 flex items-center justify-center bg-green-50 rounded-xl group-hover:bg-green-100 transition">
                  <img
                    src={tower.image || "/images/tower.png"} // fallback image
                    alt={tower.name}
                    className="w-24 h-24 object-contain"
                  />
                </div>

                {/* Tower Name */}
                <p className="text-lg font-semibold text-gray-800">{tower.name}</p>
                <p className="text-sm text-gray-500 mb-4">Healthy • Online</p>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => handleEditTower(tower.id)}
                    className="flex items-center justify-center gap-2 flex-1 px-4 py-2 text-sm font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTower(tower.id)}
                    className="flex items-center justify-center gap-2 flex-1 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center mt-28 text-center">
            <img
              src="/images/urbanfarm (2).png"
              alt="No Towers"
              className="w-52 h-52 mb-6 opacity-80"
            />
            <p className="text-gray-600 text-lg md:text-xl font-medium mb-5">
              No towers created yet
            </p>
          </div>
        )}
      </main>
    </div>
  );
}