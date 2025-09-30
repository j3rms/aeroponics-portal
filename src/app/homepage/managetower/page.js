'use client';

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Link from "next/link";

export default function ManageTower() {
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTower, setEditingTower] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Fetch towers from backend API
  useEffect(() => {
    fetchTowers();
  }, []);

  const fetchTowers = async () => {
    try {
      setLoading(true);
      const towersFromApi = await fetch(`/apis/getAllUserTowers`);
      const towersResponse = await towersFromApi.json();

      if (towersResponse.success && towersResponse.data && towersResponse.data.data) {
        setTowers(towersResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching towers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTower = async (id) => {
    if (!confirm("Are you sure you want to delete this tower?")) return;

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
      alert("Tower deleted successfully!");
    } catch (error) {
      console.error("Error deleting tower:", error);
      alert("Failed to delete tower. Please try again.");
    }
  };

  const handleEditTower = (tower) => {
    // Prepare tower data for editing
    setEditingTower({
      ...tower,
      wateringTimes: tower.schedules?.map(s => s.time?.substring(0, 5) || "") || [],
    });
  };

  const handleCloseEdit = () => {
    setEditingTower(null);
  };

  const handleEditChange = (field, value) => {
    setEditingTower((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (isEndDateInvalid()) {
      alert("End date must be later than the start date.");
      return;
    }

    // Validate watering times
    if (!editingTower.wateringTimes || editingTower.wateringTimes.some(t => !t)) {
      alert("Please fill in all watering times.");
      return;
    }

    try {
      setSaving(true);

      // Prepare payload matching backend TowerRO structure
      const payload = {
        id: editingTower.id,
        user: { id: editingTower.user.id },
        plant: { id: editingTower.plant.id },
        name: editingTower.name,
        time: editingTower.wateringTimes[0] + ":00", // First time as main time
        water_level: editingTower.waterLevel,
        frequency: editingTower.frequency,
        start_date: editingTower.startDate,
        end_date: editingTower.endDate,
        status: editingTower.status, // Send as boolean
        schedules: editingTower.wateringTimes.map((time, index) => ({
          id: editingTower.schedules?.[index]?.id || null,
          start_time: time + ":00",
          duration: editingTower.schedules?.[index]?.duration || 15,
          active: editingTower.status,
        })),
      };

      const response = await fetch(`/apis/updateTower/${editingTower.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update tower");
      }

      alert("Tower updated successfully!");
      setEditingTower(null);
      fetchTowers(); // Refresh the list
    } catch (error) {
      console.error("Error updating tower:", error);
      alert("Failed to update tower. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isEndDateInvalid = () => {
    if (!editingTower) return false;
    return new Date(editingTower.endDate) <= new Date(editingTower.startDate);
  };

  // Helper to derive number of times
  const getTimesCount = (freq) => {
    return freq || 1;
  };

  return (
    <div className="flex min-h-screen  bg-green-50 pl-32">
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

          <Link href="/homepage/createtower">
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
                <p className="text-lg font-semibold text-gray-800 mb-3">{tower.name}</p>
                
                {/* Plant Name and Status - Side by Side */}
                <div className="flex items-center justify-between w-full mb-4 px-2">
                  {tower.plant && (
                    <p className="text-sm text-gray-600 font-medium">{tower.plant.name}</p>
                  )}
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${
                      tower.status ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <p className={`text-xs font-medium ${
                      tower.status ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tower.status ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => handleEditTower(tower)}
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

      {/* Edit Tower Modal */}
      {editingTower && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20" onClick={handleCloseEdit}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={handleCloseEdit}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Tower</h2>

              {/* Tower Name */}
              <label className="block mb-4">
                <span className="text-gray-700 font-medium">Tower Name</span>
                <input
                  type="text"
                  value={editingTower.name}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-400"
                />
              </label>
              
              {/* Active Status */}
              <div className="mb-4">
                <span className="text-gray-700 font-medium block mb-2">Active Status</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={editingTower.status}
                    onChange={(e) => handleEditChange("status", e.target.checked)}
                  />
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      editingTower.status ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        editingTower.status ? "translate-x-5" : ""
                      }`}
                    />
                  </div>
                  <span className="ml-3 text-gray-700">
                    {editingTower.status ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>

              {/* Start Date (read-only) */}
              <label className="block mb-4">
                <span className="text-gray-700 font-medium">Start Date</span>
                <input
                  type="date"
                  value={editingTower.startDate}
                  readOnly
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 bg-gray-100 cursor-not-allowed"
                />
              </label>

              {/* End Date */}
              <label className="block mb-4">
                <span className="text-gray-700 font-medium">End Date</span>
                <input
                  type="date"
                  value={editingTower.endDate}
                  onChange={(e) => handleEditChange("endDate", e.target.value)}
                  className={`mt-1 block w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-400 ${
                    isEndDateInvalid() ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {isEndDateInvalid() && (
                  <p className="text-red-500 text-sm mt-1">
                    End date must be later than the start date.
                  </p>
                )}
              </label>

              {/* Frequency */}
              <label className="block mb-4">
                <span className="text-gray-700 font-medium">Watering Frequency</span>
                <input
                  type="number"
                  min="1"
                  value={editingTower.frequency}
                  onChange={(e) => {
                    const freq = Number(e.target.value) || 1;
                    handleEditChange("frequency", freq);
                    // Adjust watering times array
                    const currentTimes = editingTower.wateringTimes || [];
                    if (freq > currentTimes.length) {
                      handleEditChange("wateringTimes", [...currentTimes, ...Array(freq - currentTimes.length).fill("")]);
                    } else {
                      handleEditChange("wateringTimes", currentTimes.slice(0, freq));
                    }
                  }}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-400"
                />
                <p className="text-sm text-gray-500 mt-1">{editingTower.frequency} times per day</p>
              </label>

              {/* Watering Times */}
              <label className="block mb-4">
                <span className="text-gray-700 font-medium">Watering Times</span>
                <div className="space-y-2 mt-2">
                  {Array.from({ length: editingTower.frequency }).map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-16">Time {index + 1}</span>
                      <input
                        type="time"
                        value={editingTower.wateringTimes?.[index] || ""}
                        onChange={(e) => {
                          const updatedTimes = [...(editingTower.wateringTimes || [])];
                          updatedTimes[index] = e.target.value;
                          handleEditChange("wateringTimes", updatedTimes);
                        }}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-400"
                      />
                    </div>
                  ))}
                </div>
              </label>
            </div>

            {/* Fixed Footer Buttons */}
            <div className="flex gap-4 justify-end p-6 border-t border-gray-200 bg-white rounded-b-xl">
              <button
                onClick={handleCloseEdit}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isEndDateInvalid() || saving}
                className={`px-6 py-2 rounded-lg text-white transition ${
                  isEndDateInvalid() || saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}