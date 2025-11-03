'use client';

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X, Building2, Leaf, Loader2, Clock, Calendar, Droplets, RefreshCw, Edit3, Cpu, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/footer";
import Link from "next/link";
import { toast } from 'react-hot-toast';
import withAuth from "@/components/withAuth";
import DeviceAssignmentModal from "@/components/DeviceAssignmentModal";

// Helper function to convert numeric water level to text
const getWaterLevelText = (value) => {
  // If already text, return as is
  if (typeof value === 'string' && ['HIGH', 'MEDIUM', 'LOW'].includes(value.toUpperCase())) {
    return value.toUpperCase();
  }
  
  // Convert numeric to text based on range
  const numValue = parseInt(value);
  if (numValue >= 1 && numValue <= 3) return 'HIGH';
  if (numValue >= 4 && numValue <= 7) return 'MEDIUM';
  if (numValue >= 8 && numValue <= 10) return 'LOW';
  
  // Default to MEDIUM if invalid
  return 'MEDIUM';
};

function ManageTower() {
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTower, setEditingTower] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingTowerData, setLoadingTowerData] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const towersPerPage = 8;
  const [towerFilter, setTowerFilter] = useState('most_recent');
  const [filteredTowers, setFilteredTowers] = useState([]);
  
  // Device assignment states
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [deviceAssignTower, setDeviceAssignTower] = useState(null);
  
  // Device connectivity tracking - maps tower ID to boolean
  const [towerDeviceStatus, setTowerDeviceStatus] = useState({});
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [towerToDelete, setTowerToDelete] = useState(null);
  
  // Filter and sort towers based on tower filter
  useEffect(() => {
    if (towers.length === 0) {
      setFilteredTowers([]);
      return;
    }

    let filtered = [...towers];

    // Sort based on selected option using created_at from database only
    if (towerFilter === 'most_recent') {
      // Sort by created_at (most recent first)
      filtered.sort((a, b) => {
        const dateStrA = a.created_at || a.createdAt;
        const dateStrB = b.created_at || b.createdAt;

        // If missing timestamps, fall back to id (assuming auto-increment)
        if (!dateStrA || !dateStrB) {
          const idA = Number(a.id) || 0;
          const idB = Number(b.id) || 0;
          return idB - idA; // higher id as more recent
        }

        const dateA = new Date(dateStrA);
        const dateB = new Date(dateStrB);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (towerFilter === 'oldest') {
      // Sort by created_at (oldest first)
      filtered.sort((a, b) => {
        const dateStrA = a.created_at || a.createdAt;
        const dateStrB = b.created_at || b.createdAt;

        // If missing timestamps, fall back to id (assuming auto-increment)
        if (!dateStrA || !dateStrB) {
          const idA = Number(a.id) || 0;
          const idB = Number(b.id) || 0;
          return idA - idB; // lower id as older
        }

        const dateA = new Date(dateStrA);
        const dateB = new Date(dateStrB);
        return dateA.getTime() - dateB.getTime();
      });
    }

    setFilteredTowers(filtered);
    setCurrentPage(0); // Reset to first page when filter changes
  }, [towers, towerFilter]);

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
        // Show active and inactive towers, but exclude archived ones
        const nonArchivedTowers = towersResponse.data.data.filter(tower => tower.status !== 'ARCHIVED');
        
        // Check device connectivity for ACTIVE towers and auto-deactivate if no devices connected
        await checkAndDeactivateTowersWithoutDevices(nonArchivedTowers);
        
        setTowers(nonArchivedTowers);
      }
    } catch (error) {
      console.error("Error fetching towers:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if active towers have devices, and deactivate them if not
  const checkAndDeactivateTowersWithoutDevices = async (towers) => {
    try {
      const deviceStatusMap = {};
      
      // Check all towers (not just active) for device connectivity
      for (const tower of towers) {
        const hasDevice = await checkTowerHasDevice(tower.id);
        deviceStatusMap[tower.id] = hasDevice;
        
        // Only deactivate if tower is ACTIVE but has no devices
        if (tower.status === 'ACTIVE' && !hasDevice) {
          console.log(`Tower ${tower.name} (ID: ${tower.id}) is ACTIVE but has no connected devices. Setting to INACTIVE.`);
          
          // Update tower status to INACTIVE in the backend
          await updateTowerStatusToInactive(tower.id, tower);
          
          // Update the tower object in the local array
          tower.status = 'INACTIVE';
        }
      }
      
      // Update device status state
      setTowerDeviceStatus(deviceStatusMap);
    } catch (error) {
      console.error('Error checking tower device connectivity:', error);
    }
  };

  const handleDeleteTower = (tower) => {
    // Show confirmation modal
    setTowerToDelete(tower);
    setShowDeleteModal(true);
  };

  const confirmDeleteTower = async () => {
    if (!towerToDelete) return;
    
    const tower = towerToDelete;

    try {
      setShowDeleteModal(false);
      // Archive tower by fetching full data and updating status to ARCHIVED
      // This implements soft delete - tower remains in database but is hidden from UI
      const getTowerResponse = await fetch(`/apis/getTower/${tower.id}`);
      const getTowerResult = await getTowerResponse.json();
      
      if (!getTowerResponse.ok || !getTowerResult.success) {
        throw new Error('Failed to fetch tower data');
      }
      
      const fullTowerData = getTowerResult.data?.data || getTowerResult.data;
      
      // Prepare payload with all required fields, just changing status
      const payload = {
        id: fullTowerData.id,
        user: fullTowerData.user,
        plant: fullTowerData.plant,
        name: fullTowerData.name,
        start_date: fullTowerData.start_date || fullTowerData.startDate,
        end_date: fullTowerData.end_date || fullTowerData.endDate,
        start_time: fullTowerData.start_time || "08:00",
        end_time: fullTowerData.end_time || "20:00",
        watering_duration: parseInt(fullTowerData.watering_duration || fullTowerData.wateringDuration || 30),
        intervals: parseInt(fullTowerData.intervals || 60),
        status: 'ARCHIVED', // Soft delete by archiving
      };
      
      const response = await fetch(`/apis/updateTower/${tower.id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const err = await response.json();
        console.error('Archive error:', err);
        throw new Error(err.message || "Failed to archive tower");
      }
      
      // Remove archived tower from UI
      setTowers((prev) => prev.filter((t) => t.id !== tower.id));
      
      toast.success(`"${tower.name}" has been archived successfully!`);
      setTowerToDelete(null);
    } catch (error) {
      console.error("Error archiving tower:", error);
      toast.error('Failed to archive tower: ' + error.message);
      setTowerToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTowerToDelete(null);
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
      
      // Check if tower has connected devices
      const hasDevice = await checkTowerHasDevice(tower.id);
      console.log('Tower has device:', hasDevice);
      
      // Extract watering schedule data
      const startTime = towerData.start_time || "";
      const endTime = towerData.end_time || "";
      const wateringDuration = towerData.watering_duration || towerData.wateringDuration || 30;
      const intervals = towerData.intervals || 60;
      
      console.log('Extracted watering schedule:', { startTime, endTime, wateringDuration, intervals });
      
      // Prepare tower data for editing with fresh data
      // If no device is connected, force status to INACTIVE regardless of backend status
      const shouldBeActive = hasDevice && towerData.status === 'ACTIVE';
      
      setEditingTower({
        id: towerData.id,
        name: towerData.name,
        status: shouldBeActive, // Convert enum string to boolean for UI, but only if device is connected
        startDate: towerData.start_date || towerData.startDate,
        endDate: towerData.end_date || towerData.endDate,
        waterLevel: towerData.water_level || towerData.waterLevel || 5,
        startTime: startTime,
        endTime: endTime,
        wateringDuration: wateringDuration,
        intervals: intervals,
        user: towerData.user,
        plant: towerData.plant,
      });
      
      // If tower was supposed to be active but has no device, update backend to INACTIVE
      if (!hasDevice && towerData.status === 'ACTIVE') {
        console.log('Tower has no device but status is ACTIVE, updating to INACTIVE');
        await updateTowerStatusToInactive(tower.id, towerData);
        toast('Tower status set to inactive - disconnected');
      }
    } catch (error) {
      console.error('Error fetching tower data:', error);
      toast.error('Failed to load tower data. Please try again.');
      setEditingTower(null);
    } finally {
      setLoadingTowerData(false);
    }
  };

  const handleCloseEdit = () => {
    setEditingTower(null);
  };

  const handleConnectDevice = (tower) => {
    setDeviceAssignTower(tower);
    setShowDeviceModal(true);
  };

  const handleDeviceModalClose = async (assigned) => {
    setShowDeviceModal(false);
    const towerId = deviceAssignTower?.id;
    setDeviceAssignTower(null);
    
    if (assigned) {
      // Device was assigned successfully
      setEditingTower((prev) => (prev ? { ...prev, status: true } : prev));
      
      // Update device status for this tower
      setTowerDeviceStatus(prev => ({ ...prev, [towerId]: true }));
      
      fetchTowers();
      toast.success('Device assigned. Tower is now ready to be activated.');
    } else {
      // Device was not assigned or was disconnected
      // Check if tower still has any devices
      if (towerId) {
        const hasDevice = await checkTowerHasDevice(towerId);
        
        // Update device status for this tower
        setTowerDeviceStatus(prev => ({ ...prev, [towerId]: hasDevice }));
        
        if (!hasDevice) {
          // No devices connected, force status to inactive
          setEditingTower((prev) => (prev ? { ...prev, status: false } : prev));
          
          // Update backend to set status to INACTIVE
          if (editingTower) {
            await updateTowerStatusToInactive(towerId, editingTower);
          }
          
          toast('Tower status set to inactive - disconnected');
          fetchTowers();
        }
      }
    }
  };

  // Check if the tower already has an assigned device
  const checkTowerHasDevice = async (towerId) => {
    try {
      const res = await fetch(`/apis/getTowerDevices/${towerId}`);
      const result = await res.json();
      if (res.ok && result.success) {
        const devices = result.data?.data || result.data;
        return Array.isArray(devices) && devices.length > 0;
      }
    } catch (e) {
      console.error('Error checking tower devices:', e);
    }
    return false;
  };

  // Handle toggling status with device assignment requirement
  const handleToggleStatus = async () => {
    if (!editingTower) return;
    const nextStatus = !editingTower.status;
    if (nextStatus) {
      // If activating, ensure a device is assigned
      const hasDevice = await checkTowerHasDevice(editingTower.id);
      if (hasDevice) {
        setEditingTower((prev) => ({ ...prev, status: true }));
      } else {
        setDeviceAssignTower({ id: editingTower.id, name: editingTower.name });
        setShowDeviceModal(true);
        toast('Assign a device to activate this tower.');
      }
    } else {
      // Deactivating is allowed directly
      setEditingTower((prev) => ({ ...prev, status: false }));
    }
  };

  const handleEditChange = (field, value) => {
    setEditingTower((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper function to update tower status to INACTIVE when no device is connected
  const updateTowerStatusToInactive = async (towerId, towerData) => {
    try {
      const payload = {
        id: towerId,
        user: towerData.user,
        plant: towerData.plant,
        name: towerData.name,
        start_date: towerData.start_date || towerData.startDate,
        end_date: towerData.end_date || towerData.endDate,
        start_time: towerData.start_time || towerData.startTime || "08:00",
        end_time: towerData.end_time || towerData.endTime || "20:00",
        watering_duration: parseInt(towerData.watering_duration || towerData.wateringDuration || 30),
        intervals: parseInt(towerData.intervals || 60),
        status: 'INACTIVE', // Force to INACTIVE
      };
      
      const response = await fetch(`/apis/updateTower/${towerId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const err = await response.json();
        console.error('Error updating tower status to inactive:', err);
      } else {
        console.log('Tower status updated to INACTIVE successfully');
      }
    } catch (error) {
      console.error('Error updating tower status:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (isEndDateInvalid()) {
      toast.error("End date must be later than the start date.");
      return;
    }

    // Validate watering schedule fields if tower is active
    if (editingTower.status) {
      if (!editingTower.startTime) {
        toast.error('Please enter start time');
        return;
      }
      if (!editingTower.endTime) {
        toast.error('Please enter end time');
        return;
      }
      if (!editingTower.wateringDuration || parseInt(editingTower.wateringDuration) <= 0) {
        toast.error('Please enter a valid watering duration');
        return;
      }
      if (!editingTower.intervals || parseInt(editingTower.intervals) < 6) {
        toast.error('Please enter a valid interval (minimum 6 minutes)');
        return;
      }
    }

    try {
      setSaving(true);
      toast.loading('Updating tower...');

      // Edit tower: update with new watering schedule structure
      // Status conversion: boolean (UI state) -> enum string (backend)
      // - true -> 'ACTIVE' (requires device assignment, validated by backend)
      // - false -> 'INACTIVE' (allowed immediately, skips schedule validation)
      const payload = {
        id: editingTower.id,
        user: editingTower.user, // Send full user object
        plant: editingTower.plant, // Send full plant object
        name: editingTower.name,
        start_date: editingTower.startDate,
        end_date: editingTower.endDate,
        start_time: editingTower.startTime,
        end_time: editingTower.endTime,
        watering_duration: parseInt(editingTower.wateringDuration),
        intervals: parseInt(editingTower.intervals),
        status: editingTower.status ? 'ACTIVE' : 'INACTIVE', // Convert boolean to enum string
      };

      console.log('Updating tower with payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`/apis/updateTower/${editingTower.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Tower updated successfully:', result);

      toast.dismiss();
      toast.success("Tower updated successfully!");
      setEditingTower(null);
      fetchTowers(); // Refresh the list
    } catch (error) {
      console.error("Error updating tower:", error);
      toast.dismiss();
      const errorMsg = error.message || 'Unknown error occurred';
      toast.error(`Failed to update tower: ${errorMsg}`);
      // If activation failed due to missing device, prompt assignment
      if (editingTower?.status && /device/i.test(errorMsg) && /assign/i.test(errorMsg)) {
        setEditingTower((prev) => (prev ? { ...prev, status: false } : prev));
        setDeviceAssignTower({ id: editingTower.id, name: editingTower.name });
        setShowDeviceModal(true);
        toast('Assign a device to activate this tower.');
      }
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredTowers.length / towersPerPage);
  const startIndex = currentPage * towersPerPage;
  const endIndex = startIndex + towersPerPage;
  const currentTowers = filteredTowers.slice(startIndex, endIndex);

  // Navigation handlers
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 md:pl-64 overflow-x-hidden">
      <div className="flex flex-col flex-1">
        <main className="flex-1 max-w-3xl md:max-w-7xl mx-auto w-full px-4 md:px-10 py-8 md:py-12">
          {/* Header with decorative elements */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 relative"
          >
            {/* Decorative background */}
            <div className="absolute top-10 -left-20 w-72 h-72 bg-green-200/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left gap-4 relative z-10">
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
                  className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-7 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                >
                  <Plus className="w-5 h-5" />
                  New Tower
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Tower Sort Filter */}
          {!loading && towers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    All Towers
                  </h2>
                </div>
                
                {/* Sort Dropdown */}
                <div className="relative group">
                  <div className="flex items-center gap-2 bg-gradient-to-br from-white to-green-50/30 backdrop-blur-sm px-4 md:px-5 py-2.5 md:py-3 rounded-2xl shadow-md hover:shadow-xl border-2 border-green-200/60 transition-all duration-300 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      <span className="text-sm font-semibold hidden md:inline">Sort:</span>
                    </div>
                    <select
                      value={towerFilter}
                      onChange={(e) => setTowerFilter(e.target.value)}
                      className="bg-transparent outline-none text-sm font-semibold text-gray-700 cursor-pointer appearance-none pr-8 min-w-[160px] md:min-w-[180px]"
                    >
                      <option value="most_recent">Most Recent First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                    <svg className="w-4 h-4 text-green-600 absolute right-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Towers Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-16 h-16 text-green-600 animate-spin mb-4" />
              <p className="text-gray-600 text-lg">Loading towers...</p>
            </div>
          ) : towers.length > 0 ? (
            <div>
              <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                {currentTowers.map((tower, index) => (
                <motion.div
                  key={tower.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl hover:border-green-200 p-6 flex flex-col items-center transition-all duration-300 overflow-hidden w-full max-w-sm"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                  
                  <div className="relative w-full flex flex-col items-center">
                    {/* Tower Image */}
                    <div className="w-28 h-28 mb-5 group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={tower.image || "/images/tower.png"}
                        alt={tower.name}
                        className="w-full h-full object-contain drop-shadow-lg"
                      />
                    </div>

                    {/* Tower Name */}
                    <p className="text-lg font-bold text-gray-800 mb-3 group-hover:text-green-700 transition-colors">{tower.name}</p>
                    
                    {/* Plant Name */}
                    {tower.plant && (
                      <p className="text-sm text-gray-600 font-medium mb-4">{tower.plant.name}</p>
                    )}

                    {/* Status Badge */}
                    <div className={`mb-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                      tower.status === 'ACTIVE' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        tower.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                      }`}></div>
                      <span className={`text-xs font-semibold ${
                        tower.status === 'ACTIVE' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {tower.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex gap-3 w-full">
                        <button
                          onClick={() => handleEditTower(tower)}
                          className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-sm font-semibold text-green-700 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTower(tower)}
                          className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                      
                      {/* Device Connection Status Indicator */}
                      <div 
                        className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold rounded-xl border-2 ${
                          towerDeviceStatus[tower.id] 
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                        title={towerDeviceStatus[tower.id] ? 'Device is connected' : 'Device not connected'}
                      >
                        <Cpu className={`w-4 h-4 ${
                          towerDeviceStatus[tower.id] ? 'text-green-700' : 'text-red-700'
                        }`} />
                        <span>
                          {towerDeviceStatus[tower.id] ? 'Device Connected' : 'Device Not Connected'}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          towerDeviceStatus[tower.id] ? 'bg-green-700 animate-pulse' : 'bg-red-700'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    aria-label="Previous page"
                    className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${
                      currentPage === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-lg'
                    }`}
                  >
                    <ChevronLeft className={`w-5 h-5 transition-transform ${
                      currentPage !== 0 ? 'group-hover:-translate-x-1' : ''
                    }`} />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        aria-label={`Go to page ${i + 1}`}
                        aria-current={currentPage === i ? 'page' : undefined}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${
                          currentPage === i
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-110'
                            : 'bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    aria-label="Next page"
                    className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${
                      currentPage === totalPages - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-lg'
                    }`}
                  >
                    Next
                    <ChevronRight className={`w-5 h-5 transition-transform ${
                      currentPage !== totalPages - 1 ? 'group-hover:translate-x-1' : ''
                    }`} />
                  </button>
                </div>
              )}
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
                      disabled={!editingTower.status}
                      className={`block w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium ${!editingTower.status ? "bg-gray-100 cursor-not-allowed text-gray-500 focus:ring-0 focus:border-gray-200" : ""}`}
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
                        onClick={handleToggleStatus}
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
                      Water Level (1-10)
                    </label>
                    <input
                      type="number"
                      value={editingTower.waterLevel || 5}
                      onChange={(e) => handleEditChange("waterLevel", parseInt(e.target.value))}
                      min="1"
                      max="10"
                      disabled={!editingTower.status}
                      className={`block w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium ${!editingTower.status ? "bg-gray-100 cursor-not-allowed text-gray-500 focus:ring-0 focus:border-gray-200" : ""}`}
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      1-3 = High, 4-7 = Medium, 8-10 = Low
                    </p>
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
                        disabled={!editingTower.status}
                        className={`block w-full rounded-xl border-2 px-4 py-3 focus:ring-2 transition-all font-medium ${
                          isEndDateInvalid()
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                        } ${!editingTower.status ? "bg-gray-100 cursor-not-allowed text-gray-500 focus:ring-0 focus:border-gray-200" : ""}`}
                      />
                      {isEndDateInvalid() && (
                        <p className="text-red-600 text-sm mt-2 font-medium">
                          End date must be later than start date
                        </p>
                      )}
                    </div>
                  </div>

                  {!editingTower.status && (
                    <div className="mb-6 rounded-xl border-2 border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-800 flex gap-2 items-start">
                      <Info className="w-4 h-4 mt-0.5" />
                      <span>Scheduling fields are disabled while the tower is inactive.</span>
                    </div>
                  )}

                  {editingTower.status && (
                    <>
                      {/* Watering Schedule Section Header */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <RefreshCw className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800">Watering Schedule</h3>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700">
                              Configure when and how often your tower waters plants each day
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Time Window */}
                      <div className="mb-6">
                        <label className="text-sm font-bold text-gray-700 mb-3 block">Daily Time Window</label>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Start Time */}
                          <div>
                            <label className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                              <Clock className="w-3.5 h-3.5 text-green-600" />
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={editingTower.startTime}
                              onChange={(e) => handleEditChange("startTime", e.target.value)}
                              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                            />
                          </div>

                          {/* End Time */}
                          <div>
                            <label className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                              <Clock className="w-3.5 h-3.5 text-green-600" />
                              End Time
                            </label>
                            <input
                              type="time"
                              value={editingTower.endTime}
                              onChange={(e) => handleEditChange("endTime", e.target.value)}
                              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">⏰ System will only water between these times</p>
                      </div>

                      {/* Watering Settings */}
                      <div className="mb-4">
                        <label className="text-sm font-bold text-gray-700 mb-3 block">Watering Settings</label>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Watering Interval */}
                          <div>
                            <label className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                              Interval (minutes)
                            </label>
                            <input
                              type="number"
                              min="6"
                              value={editingTower.intervals}
                              onChange={(e) => handleEditChange("intervals", e.target.value)}
                              className={`block w-full rounded-xl border-2 px-4 py-3 focus:ring-2 transition-all font-medium ${
                                editingTower.intervals && parseInt(editingTower.intervals) < 6
                                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                  : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                              }`}
                              placeholder="60"
                            />
                            {editingTower.intervals && parseInt(editingTower.intervals) < 6 ? (
                              <p className="text-xs text-red-600 mt-2 font-medium">⚠️ Minimum 6 minutes</p>
                            ) : (
                              <p className="text-xs text-gray-500 mt-2">Time between sessions</p>
                            )}
                          </div>

                          {/* Watering Duration */}
                          <div>
                            <label className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              Duration (seconds)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="300"
                              value={editingTower.wateringDuration}
                              onChange={(e) => handleEditChange("wateringDuration", e.target.value)}
                              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                              placeholder="30"
                            />
                            <p className="text-xs text-gray-500 mt-2">Per session (1-300 sec)</p>
                          </div>
                        </div>
                      </div>

                      {/* Example Banner */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-green-800 mb-1">📋 Example Schedule:</p>
                        <p className="text-xs text-green-700">
                          Start: <span className="font-bold">{editingTower.startTime || '08:00'}</span> → 
                          End: <span className="font-bold">{editingTower.endTime || '20:00'}</span> | 
                          Every <span className="font-bold">{editingTower.intervals || '60'}</span> min for <span className="font-bold">{editingTower.wateringDuration || '30'}</span> sec
                        </p>
                      </div>
                    </>
                  )}
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

      {/* Device Assignment Modal */}
      {deviceAssignTower && (
        <DeviceAssignmentModal
          isOpen={showDeviceModal}
          onClose={handleDeviceModalClose}
          towerId={deviceAssignTower.id}
          towerName={deviceAssignTower.name}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && towerToDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm p-4"
          onClick={cancelDelete}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 pb-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Delete Tower?</h2>
                <p className="text-gray-600 text-base">
                  Are you sure you want to delete <span className="font-semibold text-gray-800">"{towerToDelete.name}"</span>?
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-8 pb-8">
              <motion.button
                onClick={cancelDelete}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3.5 rounded-xl border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all font-semibold text-gray-700"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={confirmDeleteTower}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default withAuth(ManageTower);
