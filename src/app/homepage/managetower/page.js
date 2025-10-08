'use client';

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X, Building2, Leaf, Loader2, Clock, Calendar, Droplets, RefreshCw, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import Link from "next/link";

export default function ManageTower() {
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTower, setEditingTower] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingTowerData, setLoadingTowerData] = useState(false);
  
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
    try {
      const response = await fetch(`/apis/deleteTower/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete tower");
      }
      setTowers((prev) => prev.filter((tower) => tower.id !== id));
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      notification.textContent = 'Tower deleted successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    } catch (error) {
      console.error("Error deleting tower:", error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      notification.textContent = 'Failed to delete tower. Please try again.';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  };

  const handleEditTower = async (tower) => {
    try {
      setLoadingTowerData(true);
      setEditingTower({ id: tower.id }); // Set with just ID to show modal
      
      // Fetch fresh tower data from backend
      const response = await fetch(`/apis/getTower/${tower.id}`);
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch tower data');
      }
      
      const towerData = result.data?.data || result.data;
      
      console.log('Fetched tower data:', towerData);
      
      // Extract watering times from schedules
      const schedules = towerData.schedules || [];
      const wateringTimes = schedules.map(s => {
        const time = s.start_time || s.time || "";
        // Handle both HH:mm and HH:mm:ss formats
        if (time.length >= 5) {
          return time.substring(0, 5); // Extract HH:mm
        }
        return time;
      });
      
      // Ensure we have the right number of watering times based on frequency
      const frequency = towerData.frequency || 1;
      while (wateringTimes.length < frequency) {
        wateringTimes.push(""); // Add empty slots if needed
      }
      
      console.log('Extracted watering times:', wateringTimes);
      
      // Prepare tower data for editing with fresh data
      setEditingTower({
        id: towerData.id,
        name: towerData.name,
        status: towerData.status,
        startDate: towerData.start_date || towerData.startDate,
        endDate: towerData.end_date || towerData.endDate,
        frequency: frequency,
        waterLevel: towerData.water_level || towerData.waterLevel,
        user: towerData.user,
        plant: towerData.plant,
        schedules: schedules,
        wateringTimes: wateringTimes,
      });
    } catch (error) {
      console.error('Error fetching tower data:', error);
      alert('Failed to load tower data. Please try again.');
      setEditingTower(null);
    } finally {
      setLoadingTowerData(false);
    }
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
    console.log('Validating watering times:', editingTower.wateringTimes);
    console.log('Frequency:', editingTower.frequency);
    
    if (!editingTower.wateringTimes || editingTower.wateringTimes.length < editingTower.frequency) {
      alert(`Please fill in all ${editingTower.frequency} watering times.`);
      return;
    }
    
    const emptyTimes = editingTower.wateringTimes.slice(0, editingTower.frequency).filter(t => !t);
    if (emptyTimes.length > 0) {
      alert(`Please fill in all watering times. ${emptyTimes.length} time(s) are missing.`);
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
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 ml-64">
        <main className="flex-1 max-w-7xl mx-auto w-full px-10 py-12">
          {/* Header with decorative elements */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 relative overflow-visible"
          >
            {/* Decorative background */}
            <div className="absolute top-10 -left-20 w-72 h-72 bg-green-200/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent pb-1 leading-tight">
                    Manage Towers
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    View, edit, and manage your aeroponics towers
                  </p>
                </div>
              </div>

              <Link href="/homepage/createtower">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-7 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  New Tower
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Towers Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-16 h-16 text-green-600 animate-spin mb-4" />
              <p className="text-gray-600 text-lg">Loading towers...</p>
            </div>
          ) : towers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {towers.map((tower, index) => (
                <motion.div
                  key={tower.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl hover:border-green-200 p-6 flex flex-col items-center transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                  
                  <div className="relative w-full flex flex-col items-center">
                    {/* Tower Image */}
                    <div className="w-32 h-32 mb-5 group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={tower.image || "/images/tower.png"}
                        alt={tower.name}
                        className="w-full h-full object-contain drop-shadow-lg"
                      />
                    </div>

                    {/* Tower Name */}
                    <p className="text-lg font-bold text-gray-800 mb-2 group-hover:text-green-700 transition-colors">{tower.name}</p>
                    
                    {/* Plant Name */}
                    {tower.plant && (
                      <p className="text-sm text-gray-600 font-medium mb-3">{tower.plant.name}</p>
                    )}

                    {/* Status Badge */}
                    <div className={`mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
                      tower.status ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        tower.status ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                      }`}></div>
                      <span className={`text-xs font-semibold ${
                        tower.status ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {tower.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => handleEditTower(tower)}
                        className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-sm font-semibold text-green-700 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTower(tower.id)}
                        className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center mt-28 text-center bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-3xl p-12 shadow-lg"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">No towers created yet</p>
              <p className="text-sm text-gray-500">Create your first tower to get started</p>
            </motion.div>
          )}
        </main>
        <Footer />
      </div>

      {/* Edit Tower Modal */}
      {editingTower && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
          onClick={handleCloseEdit}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border-2 border-green-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseEdit}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Loading State */}
            {loadingTowerData ? (
              <div className="flex flex-col items-center justify-center p-20">
                <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium text-lg">Loading tower data...</p>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-3xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Edit Tower</h2>
                      <p className="text-green-100 text-sm">Update your tower settings</p>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6">

                  {/* Tower Name */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                      <Building2 className="w-4 h-4 text-green-600" />
                      Tower Name
                    </label>
                    <input
                      type="text"
                      value={editingTower.name}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                      className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                      placeholder="Enter tower name"
                    />
                  </div>
              
                  {/* Plant (Read-only) */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                      <Leaf className="w-4 h-4 text-green-600" />
                      Plant Type
                    </label>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                      <p className="font-bold text-gray-800 mb-2">{editingTower.plant?.name || 'N/A'}</p>
                      {editingTower.plant && (
                        <div className="flex gap-4 text-sm text-gray-700">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">pH:</span> {editingTower.plant.min_ph_level || editingTower.plant.minPhLevel} - {editingTower.plant.max_ph_level || editingTower.plant.maxPhLevel}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">PPM:</span> {editingTower.plant.min_ppm || editingTower.plant.minPpm} - {editingTower.plant.max_ppm || editingTower.plant.maxPpm}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                      Tower Status
                    </label>
                    <div className="flex items-center gap-4 bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                      <button
                        type="button"
                        onClick={() => handleEditChange("status", !editingTower.status)}
                        className={`relative w-14 h-7 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-green-400 ${
                          editingTower.status ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                            editingTower.status ? "translate-x-7" : ""
                          }`}
                        />
                      </button>
                      <span className={`font-bold ${
                        editingTower.status ? "text-green-700" : "text-gray-600"
                      }`}>
                        {editingTower.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Water Level */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      Water Level
                    </label>
                    <select
                      value={editingTower.waterLevel || 'MEDIUM'}
                      onChange={(e) => handleEditChange("waterLevel", e.target.value)}
                      className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium bg-white"
                    >
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Start Date (read-only) */}
                    <div>
                      <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={editingTower.startDate}
                        readOnly
                        className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 bg-gray-100 cursor-not-allowed font-medium text-gray-600"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                        <Calendar className="w-4 h-4 text-green-600" />
                        End Date
                      </label>
                      <input
                        type="date"
                        value={editingTower.endDate}
                        onChange={(e) => handleEditChange("endDate", e.target.value)}
                        className={`block w-full rounded-xl border-2 px-4 py-3 focus:ring-2 focus:ring-green-500 transition-all font-medium ${
                          isEndDateInvalid() ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-green-500"
                        }`}
                      />
                      {isEndDateInvalid() && (
                        <p className="text-red-600 text-sm mt-2 font-medium">
                          End date must be later than start date
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                      <RefreshCw className="w-4 h-4 text-green-600" />
                      Watering Frequency
                    </label>
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
                      className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                    />
                    <p className="text-sm text-gray-600 mt-2 font-medium">
                      <span className="text-green-700">{editingTower.frequency}</span> times per day
                    </p>
                  </div>

                  {/* Watering Times */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                      <Clock className="w-4 h-4 text-green-600" />
                      Watering Times
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: editingTower.frequency }).map((_, index) => (
                        <div key={index} className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-600 mb-2">Time {index + 1}</span>
                          <input
                            type="time"
                            value={editingTower.wateringTimes?.[index] || ""}
                            onChange={(e) => {
                              const updatedTimes = [...(editingTower.wateringTimes || [])];
                              updatedTimes[index] = e.target.value;
                              handleEditChange("wateringTimes", updatedTimes);
                            }}
                            className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fixed Footer Buttons */}
                <div className="flex gap-3 justify-end p-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-green-50 rounded-b-3xl">
                  <motion.button
                    onClick={handleCloseEdit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all font-semibold text-gray-700"
                    disabled={saving}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSaveEdit}
                    disabled={isEndDateInvalid() || saving}
                    whileHover={{ scale: isEndDateInvalid() || saving ? 1 : 1.02 }}
                    whileTap={{ scale: isEndDateInvalid() || saving ? 1 : 0.98 }}
                    className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                      isEndDateInvalid() || saving
                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? "Saving..." : "Save Changes"}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
        
      )}
    </div>
  );
}
