'use client';

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Link from "next/link";

export default function ManageTower() {
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTower, setEditingTower] = useState(null);

  // fetch towers on mount
  useEffect(() => {
    const fetchTowers = async () => {
      try {
        const towersFromApi = await fetch(`/apis/getAllUserTowers`);
        const towersResponse = await towersFromApi.json();

        const mappedTowers = towersResponse.data.data.map((tower) => ({
          id: tower.id,
          name: tower.name || `Tower ${tower.id}`,
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

  // delete tower
  const handleDeleteTower = async (id) => {
    try {
      const response = await fetch(`/apis/deleteTower/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete tower");
      }
      setTowers((prev) => prev.filter((tower) => tower.id !== id));
    } catch (error) {
      console.error("Error deleting tower:", error);
      alert("Failed to delete tower. Please try again.");
    }
  };

  // edit handlers
  const handleEditTower = (tower) => setEditingTower(tower);
  const handleCloseEdit = () => setEditingTower(null);
  const handleEditChange = (field, value) =>
    setEditingTower((prev) => ({ ...prev, [field]: value }));

  const handleSaveEdit = () => {
    setTowers((prev) =>
      prev.map((t) => (t.id === editingTower.id ? editingTower : t))
    );
    setEditingTower(null);
  };

  const isEndDateInvalid = () => {
    if (!editingTower) return false;
    return new Date(editingTower.endDate) <= new Date(editingTower.startDate);
  };

  // derive number of times
  const getTimesCount = (freq) => {
    if (freq === "Once a day") return 1;
    if (freq === "Twice a day") return 2;
    if (freq === "Thrice a day") return 3;
    if (freq === "Four times a day") return 4;
    const match = freq?.match(/^(\d+)\s*times\/day$/);
    return match ? parseInt(match[1]) : 1;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pl-6">
      <Sidebar />

      <main className="flex-1 px-12 py-16 max-w-7xl mx-auto w-full ml-20 md:ml-64">
        {/* header */}
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
                    src={tower.image || "/images/tower.png"}
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-lg flex flex-col max-h-[80vh]">
            {/* scrollable content */}
            <div className="overflow-y-auto p-8">
              <h2 className="text-2xl font-bold mb-6">Edit Tower</h2>

              {/* Tower Name */}
              <label className="block mb-4">
                <span className="text-gray-700 font-medium">Tower Name</span>
                <input
                  type="text"
                  value={editingTower.name}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                />
              </label>

              {/* Active Status */}
              <div className="mb-4">
                <span className="text-gray-700 font-medium block mb-1">Active Status</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={editingTower.active}
                    onChange={(e) => handleEditChange("active", e.target.checked)}
                  />
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors
                      ${editingTower.active ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    <span
                      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform
                        ${editingTower.active ? "translate-x-5" : ""}`}
                    />
                  </div>
                  <span className="ml-3 text-gray-700">
                    {editingTower.active ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>

              {/* Start Date */}
              <label className="block mb-4">
                <span className="text-gray-700 font-medium">Start Date</span>
                <input
                  type="date"
                  value={editingTower.startDate}
                  readOnly
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
              </label>

              {/* End Date */}
              <label className="block mb-4">
                <span className="text-gray-700 font-medium">End Date</span>
                <input
                  type="date"
                  value={editingTower.endDate}
                  onChange={(e) => handleEditChange("endDate", e.target.value)}
                  className={`mt-1 block w-full rounded px-3 py-2 ${
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
                <select
                  value={
                    editingTower.wateringFrequency?.match(/^\d+\s*times\/day$/)
                      ? "Custom"
                      : editingTower.wateringFrequency
                  }
                  onChange={(e) => {
                    if (e.target.value === "Custom") {
                      handleEditChange("wateringFrequency", "1 times/day");
                      handleEditChange("wateringTimes", Array(1).fill(""));
                    } else {
                      handleEditChange("wateringFrequency", e.target.value);
                      handleEditChange(
                        "wateringTimes",
                        Array(getTimesCount(e.target.value)).fill("")
                      );
                    }
                  }}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option>Once a day</option>
                  <option>Twice a day</option>
                  <option>Thrice a day</option>
                  <option>Four times a day</option>
                  <option value="Custom">Custom</option>
                </select>
              </label>

              {/* Custom Input */}
              {editingTower.wateringFrequency?.match(/^\d+\s*times\/day$/) && (
                <label className="block mb-4">
                  <span className="text-gray-700 font-medium">Number of times per day</span>
                  <input
                    type="number"
                    min="1"
                    value={getTimesCount(editingTower.wateringFrequency)}
                    onChange={(e) => {
                      const times = Number(e.target.value) || 1;
                      handleEditChange("wateringFrequency", `${times} times/day`);
                      handleEditChange("wateringTimes", Array(times).fill(""));
                    }}
                    className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                  />
                </label>
              )}

              {/* Watering Times */}
              <label className="block mb-4">
                <span className="text-gray-700 font-medium">Watering Times</span>
                <div className="space-y-2">
                  {Array.from({ length: getTimesCount(editingTower.wateringFrequency) }).map(
                    (_, index) => (
                      <input
                        key={index}
                        type="time"
                        value={editingTower.wateringTimes?.[index] || ""}
                        onChange={(e) => {
                          const updatedTimes = [...(editingTower.wateringTimes || [])];
                          updatedTimes[index] = e.target.value;
                          handleEditChange("wateringTimes", updatedTimes);
                        }}
                        className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                      />
                    )
                  )}
                </div>
              </label>
            </div>

            {/* buttons */}
            <div className="flex gap-4 justify-end p-4 border-t border-gray-200 bg-white">
              <button
                onClick={handleCloseEdit}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isEndDateInvalid()}
                className={`px-6 py-2 rounded-lg text-white transition
                  ${isEndDateInvalid() ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
                `}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
