'use client';

import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { TrendingUp, Droplets, Activity, Leaf, AlertCircle, Info } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";

const LineChart = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Line),
  { ssr: false }
);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// Plant-specific thresholds
const PLANT_THRESHOLDS = {
  Cabbage: { ph: { min: 6.0, max: 6.8 }, ppm: { min: 1250, max: 2250 } },
  Lettuce: { ph: { min: 6.0, max: 7.0 }, ppm: { min: 560, max: 840 } },
  Basil: { ph: { min: 5.5, max: 6.5 }, ppm: { min: 700, max: 1120 } },
  Kale: { ph: { min: 5.5, max: 6.8 }, ppm: { min: 2800, max: 3500 } },
  Spinach: { ph: { min: 6.0, max: 7.0 }, ppm: { min: 1260, max: 1610 } },
  Broccoli: { ph: { min: 6.0, max: 6.8 }, ppm: { min: 1960, max: 2450 } }
};

// Helper function to get text color based on value
const getTextColor = (type, value, thresholds) => {
  if (type === 'water') {
    // Water: green if high (>= 50%), yellow if mid (30-49%), red if too low (< 30%)
    if (value >= 50) return 'text-green-600'; // High - good
    if (value >= 30) return 'text-yellow-600'; // Mid
    return 'text-red-600'; // Too low
  }

  if (!thresholds) return 'text-gray-600';

  switch (type) {
    case 'ph':
      const phMin = thresholds.ph.min;
      const phMax = thresholds.ph.max;
      const phRange = phMax - phMin;
      
      // Green if within ideal range (middle 60% of range)
      if (value >= phMin + phRange * 0.2 && value <= phMax - phRange * 0.2) {
        return 'text-green-600';
      }
      // Yellow if in acceptable range but not ideal
      if (value >= phMin && value <= phMax) {
        return 'text-yellow-600';
      }
      // Red if outside range
      return 'text-red-600';
      
    case 'ppm':
      const ppmMin = thresholds.ppm.min;
      const ppmMax = thresholds.ppm.max;
      const ppmRange = ppmMax - ppmMin;
      
      // Green if within ideal range (middle 60% of range)
      if (value >= ppmMin + ppmRange * 0.2 && value <= ppmMax - ppmRange * 0.2) {
        return 'text-green-600';
      }
      // Yellow if in acceptable range but not ideal
      if (value >= ppmMin && value <= ppmMax) {
        return 'text-yellow-600';
      }
      // Red if outside range
      return 'text-red-600';
      
    default:
      return 'text-gray-600';
  }
};

// Ensure water level values are normalized to 0-100%
const normalizeWaterLevel = (value) => {
  if (value === null || value === undefined) return 0;
  let n = Number(value);
  if (Number.isNaN(n)) return 0;
  // If API returns 0-1, convert to percent
  if (n <= 1) n = n * 100;
  // If API returns an oversized number (e.g., 1428571), scale down until <= 100
  while (n > 100) n = n / 10;
  // Clamp to [0, 100]
  return Math.max(0, Math.min(100, n));
};

export default function Dashboard() {
  // State for sensor data
  const [sensorData, setSensorData] = useState({
    phValue: 0,
    ppmValue: 0,
    targetWaterLevel: 0,
  });
  const [waterLevel, setWaterLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    labels: ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM"],
    phData: [5.9, 5.7, 6.0, 5.8, 5.9],
    ppmData: [950, 920, 980, 960, 940],
  });
  const [towers, setTowers] = useState([]);
  const [towersLoading, setTowersLoading] = useState(true);
  const [towersError, setTowersError] = useState(null);
  const [selectedTower, setSelectedTower] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [waterDepletion, setWaterDepletion] = useState(null);
  const [depletionLoading, setDepletionLoading] = useState(false);
  const [selectedTowerFilter, setSelectedTowerFilter] = useState('all');
  const [currentPlantName, setCurrentPlantName] = useState(null);
  const [plantThresholds, setPlantThresholds] = useState(null);
  const [activeTowerFilter, setActiveTowerFilter] = useState('all');
  const [filteredTowers, setFilteredTowers] = useState([]);

  // Fetch sensor data from backend (optionally filtered by tower)
  const fetchSensorData = async (towerId = null) => {
    try {
      setLoading(true);
      const url = towerId ? `/apis/getSensorData?towerId=${towerId}` : '/apis/getSensorData';
      const response = await fetch(url);
      const result = await response.json();

      if (result.success && result.data) {
        setSensorData({
          phValue: result.data.phValue || 0,
          ppmValue: result.data.ppmValue || 0,
          targetWaterLevel: normalizeWaterLevel(result.data.waterLevel),
        });
        
        // Set plant name and thresholds for color coding
        if (towerId) {
          const tower = towers.find(t => t.id === parseInt(towerId));
          if (tower?.plant) {
            setCurrentPlantName(tower.plant.name);
            setPlantThresholds({
              ph: { 
                min: tower.plant.min_ph_level, 
                max: tower.plant.max_ph_level 
              },
              ppm: { 
                min: tower.plant.min_ppm, 
                max: tower.plant.max_ppm 
              }
            });
          }
        } else {
          // For "All Towers", use the first tower's plant as reference
          const firstTower = towers.find(t => t.plant?.name);
          if (firstTower?.plant) {
            setCurrentPlantName(firstTower.plant.name);
            setPlantThresholds({
              ph: { 
                min: firstTower.plant.min_ph_level, 
                max: firstTower.plant.max_ph_level 
              },
              ppm: { 
                min: firstTower.plant.min_ppm, 
                max: firstTower.plant.max_ppm 
              }
            });
          }
        }
      } else {
        setError('Failed to fetch sensor data');
      }
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Error loading sensor data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch historical data for charts (optionally filtered by tower)
  const fetchHistoricalData = async (towerId = null) => {
    try {
      const url = towerId ? `/apis/getSensorHistory?limit=5&towerId=${towerId}` : '/apis/getSensorHistory?limit=5';
      const response = await fetch(url);
      const result = await response.json();

      if (result.success && result.data) {
        setChartData({
          labels: result.data.labels.length > 0 ? result.data.labels : ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM"],
          phData: result.data.phData.length > 0 ? result.data.phData : [5.9, 5.7, 6.0, 5.8, 5.9],
          ppmData: result.data.ppmData.length > 0 ? result.data.ppmData : [950, 920, 980, 960, 940],
        });
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
    }
  };

  // Fetch towers data from backend
  const fetchTowers = async () => {
    try {
      setTowersLoading(true);
      const response = await fetch('/apis/getAllUserTowers');
      const result = await response.json();

      if (result.success && result.data && result.data.data) {
        // Filter only active towers (status = true)
        const activeTowers = result.data.data.filter(tower => tower.status === true);
        setTowers(activeTowers);
        setTowersError(null);
      } else {
        setTowersError('Failed to fetch towers');
      }
    } catch (err) {
      console.error('Error fetching towers:', err);
      setTowersError('Error loading towers');
    } finally {
      setTowersLoading(false);
    }
  };

  // Fetch water depletion for a specific tower
  const fetchWaterDepletion = async (towerId) => {
    try {
      setDepletionLoading(true);
      const response = await fetch(`/apis/getWaterDepletion?towerId=${towerId}`);
      const result = await response.json();

      if (result.success && result.data && result.data.data) {
        setWaterDepletion(result.data.data);
      }
    } catch (err) {
      console.error('Error fetching water depletion:', err);
      setWaterDepletion(null);
    } finally {
      setDepletionLoading(false);
    }
  };

  // Handle tower filter change
  const handleTowerFilterChange = (towerId) => {
    setSelectedTowerFilter(towerId);
    const towerIdParam = towerId === 'all' ? null : towerId;
    
    // Set plant name and thresholds for color coding
    if (towerId !== 'all') {
      const tower = towers.find(t => t.id === parseInt(towerId));
      if (tower?.plant) {
        setCurrentPlantName(tower.plant.name);
        setPlantThresholds({
          ph: { 
            min: tower.plant.min_ph_level, 
            max: tower.plant.max_ph_level 
          },
          ppm: { 
            min: tower.plant.min_ppm, 
            max: tower.plant.max_ppm 
          }
        });
      }
    } else {
      // For "All Towers", use the first tower's plant as reference
      const firstTower = towers.find(t => t.plant?.name);
      if (firstTower?.plant) {
        setCurrentPlantName(firstTower.plant.name);
        setPlantThresholds({
          ph: { 
            min: firstTower.plant.min_ph_level, 
            max: firstTower.plant.max_ph_level 
          },
          ppm: { 
            min: firstTower.plant.min_ppm, 
            max: firstTower.plant.max_ppm 
          }
        });
      }
    }
    
    fetchSensorData(towerIdParam);
    fetchHistoricalData(towerIdParam);
  };

  // Handle active tower filter change
  const handleActiveTowerFilterChange = (filterValue) => {
    setActiveTowerFilter(filterValue);
  };

  // Get unique plant names for filter options
  const getUniquePlantNames = () => {
    const plantNames = towers
      .map(tower => tower.plant?.name)
      .filter(name => name)
      .filter((name, index, arr) => arr.indexOf(name) === index);
    return plantNames;
  };

  // Initial data fetch
  useEffect(() => {
    fetchSensorData();
    fetchHistoricalData();
    fetchTowers();
  }, []);

  // Set plant name and thresholds after towers are loaded
  useEffect(() => {
    if (towers.length > 0 && !currentPlantName) {
      const firstTower = towers.find(t => t.plant?.name);
      if (firstTower?.plant) {
        setCurrentPlantName(firstTower.plant.name);
        setPlantThresholds({
          ph: { 
            min: firstTower.plant.min_ph_level, 
            max: firstTower.plant.max_ph_level 
          },
          ppm: { 
            min: firstTower.plant.min_ppm, 
            max: firstTower.plant.max_ppm 
          }
        });
      }
    }
  }, [towers]);

  // Filter towers based on active tower filter
  useEffect(() => {
    if (towers.length === 0) {
      setFilteredTowers([]);
      return;
    }

    let filtered = [...towers];

    switch (activeTowerFilter) {
      case 'all':
        // Show all towers
        break;
      case 'thisWeek':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = towers.filter(tower => {
          if (!tower.startDate) return false;
          const startDate = new Date(tower.startDate);
          return startDate >= oneWeekAgo;
        });
        break;
      case 'thisMonth':
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filtered = towers.filter(tower => {
          if (!tower.startDate) return false;
          const startDate = new Date(tower.startDate);
          return startDate >= oneMonthAgo;
        });
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        filtered = towers.filter(tower => {
          if (!tower.startDate) return false;
          const startDate = new Date(tower.startDate);
          return startDate >= threeMonthsAgo;
        });
        break;
      default:
        // Check if it's a plant filter
        if (activeTowerFilter.startsWith('plant_')) {
          const plantName = activeTowerFilter.replace('plant_', '');
          filtered = towers.filter(tower => tower.plant?.name === plantName);
        }
        break;
    }

    setFilteredTowers(filtered);
  }, [towers, activeTowerFilter]);

  // Animate tank fill-up when data changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setWaterLevel(normalizeWaterLevel(sensorData.targetWaterLevel));
    }, 500);
    return () => clearTimeout(timeout);
  }, [sensorData.targetWaterLevel]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const towerIdParam = selectedTowerFilter === 'all' ? null : selectedTowerFilter;
      fetchSensorData(towerIdParam);
      fetchHistoricalData(towerIdParam);
      fetchTowers();
      if (selectedTower) {
        fetchWaterDepletion(selectedTower.id);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [selectedTower, selectedTowerFilter]);

  // Handle tower click
  const handleTowerClick = (tower) => {
    setSelectedTower(tower);
    setShowModal(true);
    setWaterDepletion(null);
    fetchWaterDepletion(tower.id);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedTower(null);
    setWaterDepletion(null);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Format water level
  const formatWaterLevel = (level) => {
    if (!level) return 'N/A';
    return level.replace('_', ' ');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 md:pl-64 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 max-w-3xl md:max-w-7xl mx-auto w-full px-4 md:px-10 py-8 md:py-12">
          {/* Header with decorative elements */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 relative overflow-hidden"
          >
            {/* Decorative background */}
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-green-200/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-gray-600 text-sm md:text-lg mt-1">
                    Real-time monitoring of your aeroponics system
                  </p>
                </div>
              </div>
              
              {/* Tower Filter Dropdown */}
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-3 md:px-6 py-2 md:py-3 rounded-2xl shadow-lg border border-green-100 w-full md:w-auto">
                <label className="text-sm font-semibold text-gray-700">Filter:</label>
                <select
                  value={selectedTowerFilter}
                  onChange={(e) => handleTowerFilterChange(e.target.value)}
                  className="px-4 py-2 border-2 border-green-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-medium text-gray-700 w-full md:min-w-[200px] cursor-pointer hover:border-green-300 transition-colors"
                >
                  <option value="all">🕒 Most Recent</option>
                  {towers.map((tower) => (
                    <option key={tower.id} value={tower.id}>
                      🏢 {tower.name} - {tower.plant?.name || 'No Plant'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
            </div>
          )}

          {/* Average Data Indicator */}
          {selectedTowerFilter === 'all' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 text-blue-800 px-4 md:px-6 py-3 md:py-4 rounded-2xl mb-8 flex items-center gap-3 shadow-sm"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-semibold text-sm md:text-base">Showing most recent data from all active towers</p>
            </motion.div>
          )}

          {/* Top Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* pH Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-4 md:p-8 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">Live</span>
                </div>
                <p className="text-gray-600 font-medium mb-2">{selectedTowerFilter === 'all' ? 'Most Recent pH Level' : 'pH Level'}</p>
                {loading ? (
                  <div className="h-10 bg-gray-200 animate-pulse rounded-xl mt-2"></div>
                ) : (
                  <h2 className={`text-3xl md:text-4xl font-bold ${selectedTowerFilter !== 'all' && plantThresholds ? getTextColor('ph', sensorData.phValue, plantThresholds) : 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'}`}>
                    {sensorData.phValue.toFixed(1)}
                  </h2>
                )}
              </div>
            </motion.div>

            {/* PPM Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-blue-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-4 md:p-8 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Live</span>
                </div>
                <p className="text-gray-600 font-medium mb-2">{selectedTowerFilter === 'all' ? 'Most Recent PPM' : 'PPM Level'}</p>
                {loading ? (
                  <div className="h-10 bg-gray-200 animate-pulse rounded-xl mt-2"></div>
                ) : (
                  <h2 className={`text-3xl md:text-4xl font-bold ${selectedTowerFilter !== 'all' && plantThresholds ? getTextColor('ppm', sensorData.ppmValue, plantThresholds) : 'bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent'}`}>
                    {sensorData.ppmValue.toFixed(0)} <span className="text-xl md:text-2xl">ppm</span>
                  </h2>
                )}
              </div>
            </motion.div>

            {/* Water Level Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-cyan-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-4 md:p-8 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-cyan-600 bg-cyan-100 px-3 py-1 rounded-full">Live</span>
                </div>
                <p className="text-gray-600 font-medium mb-2">{selectedTowerFilter === 'all' ? 'Most Recent Water Level' : 'Water Level'}</p>
                {loading ? (
                  <div className="h-10 bg-gray-200 animate-pulse rounded-xl mt-2"></div>
                ) : (
                  <h2 className={`text-3xl md:text-4xl font-bold ${selectedTowerFilter !== 'all' ? getTextColor('water', sensorData.targetWaterLevel, null) : 'bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent'}`}>
                    {Math.round(Math.max(0, Math.min(100, sensorData.targetWaterLevel)))}<span className="text-xl md:text-2xl">%</span>
                  </h2>
                )}
              </div>
            </motion.div>
          </section>

          {/* Charts Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Nutrient & Water Monitoring
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[45%_45%_10%] gap-6">
              {/* pH Level Chart */}
              <motion.div
                whileHover={{ y: -4 }}
                className="group bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">pH Level Trend</h3>
                  </div>
                  <LineChart
                    data={{
                      labels: chartData.labels,
                      datasets: [
                        {
                          label: "pH Level",
                          data: chartData.phData,
                          borderColor: "#10b981",
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                          fill: true,
                          tension: 0.4,
                          borderWidth: 3,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: { 
                        legend: { 
                          display: true,
                          labels: {
                            font: { size: 12, weight: 'bold' },
                            color: '#374151'
                          }
                        } 
                      },
                      scales: { 
                        y: { 
                          beginAtZero: false,
                          grid: { color: '#f3f4f6' }
                        },
                        x: {
                          grid: { display: false }
                        }
                      },
                    }}
                  />
                </div>
              </motion.div>

              {/* PPM Level Chart */}
              <motion.div
                whileHover={{ y: -4 }}
                className="group bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-blue-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">PPM Level Trend</h3>
                  </div>
                  <LineChart
                    data={{
                      labels: chartData.labels,
                      datasets: [
                        {
                          label: "PPM Level",
                          data: chartData.ppmData,
                          borderColor: "#3b82f6",
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                          fill: true,
                          tension: 0.4,
                          borderWidth: 3,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: { 
                        legend: { 
                          display: true,
                          labels: {
                            font: { size: 12, weight: 'bold' },
                            color: '#374151'
                          }
                        } 
                      },
                      scales: { 
                        y: { 
                          beginAtZero: false,
                          grid: { color: '#f3f4f6' }
                        },
                        x: {
                          grid: { display: false }
                        }
                      },
                    }}
                  />
                </div>
              </motion.div>

              {/* Water Tank */}
              <motion.div
                whileHover={{ y: -4 }}
                className="group flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-cyan-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                <div className="relative w-full flex flex-col items-center h-full">
                  <div className="flex flex-col items-center gap-1 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                      <Droplets className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-xs text-center">Water Level</h3>
                  </div>
                  <div className="relative w-20 flex-1 min-h-[200px] bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl border-4 border-gray-300 overflow-hidden shadow-inner">
                  {/* Water Fill */}
                  <div
                    className="absolute bottom-0 left-0 w-full bg-cyan-500 transition-all duration-1000 ease-in-out overflow-hidden"
                    style={{ height: `${Math.max(0, Math.min(100, waterLevel))}%` }}
                  >
                    {/* Waves */}
                    <svg
                      className="absolute bottom-0 left-0 w-[200%] h-8 wave wave1"
                      viewBox="0 0 1440 320"
                      preserveAspectRatio="none"
                    >
                      <path
                        fill="rgba(255,255,255,0.4)"
                        d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,160C672,160,768,192,864,186.7C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128V320H0Z"
                      />
                    </svg>
                    <svg
                      className="absolute bottom-0 left-0 w-[200%] h-8 wave wave2"
                      viewBox="0 0 1440 320"
                      preserveAspectRatio="none"
                    >
                      <path
                        fill="rgba(255,255,255,0.3)"
                        d="M0,192L60,176C120,160,240,128,360,122.7C480,117,600,139,720,154.7C840,171,960,181,1080,176C1200,171,1320,149,1380,138.7L1440,128V320H0Z"
                      />
                    </svg>
                    <svg
                      className="absolute bottom-0 left-0 w-[200%] h-8 wave wave3"
                      viewBox="0 0 1440 320"
                      preserveAspectRatio="none"
                    >
                      <path
                        fill="rgba(255,255,255,0.2)"
                        d="M0,224L48,229.3C96,235,192,245,288,229.3C384,213,480,171,576,165.3C672,160,768,192,864,202.7C960,213,1056,203,1152,197.3C1248,192,1344,192,1392,192L1440,192V320H0Z"
                      />
                    </svg>
                  </div>

                  {/* Percentage Label */}
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-gray-700 z-10">
                    {Math.round(waterLevel)}%
                  </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Active Tower Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Active Towers
                </h2>
              </div>
              
              {/* Active Tower Filter Dropdown */}
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-3 md:px-6 py-2 md:py-3 rounded-2xl shadow-lg border border-green-100 w-full md:w-auto">
                <label className="text-sm font-semibold text-gray-700">Filter:</label>
                <select
                  value={activeTowerFilter}
                  onChange={(e) => handleActiveTowerFilterChange(e.target.value)}
                  className="px-4 py-2 border-2 border-green-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-medium text-gray-700 w-full md:min-w-[200px] cursor-pointer hover:border-green-300 transition-colors"
                >
                  <option value="all">🌍 All Towers</option>
                  <option value="thisWeek">📅 This Week</option>
                  <option value="thisMonth">📅 This Month</option>
                  <option value="last3Months">📅 Last 3 Months</option>
                  {getUniquePlantNames().map((plantName) => (
                    <option key={plantName} value={`plant_${plantName}`}>
                      🌱 {plantName} Only
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {towersError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 text-yellow-800 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="font-semibold">{towersError}</p>
              </motion.div>
            )}
            
            {towersLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-gray-200 shadow-lg p-8 flex flex-col items-center">
                    <div className="h-32 w-32 bg-gray-200 animate-pulse rounded-2xl mb-5"></div>
                    <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : filteredTowers.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredTowers.map((tower, index) => (
                  <motion.div
                    key={tower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onClick={() => handleTowerClick(tower)}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl hover:border-green-200 p-8 flex flex-col items-center transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                    
                    <div className="relative flex flex-col items-center">
                      {/* Tower Image */}
                      <div className="w-32 h-32 mb-5 group-hover:scale-110 transition-transform duration-300">
                        <img 
                          src="/images/tower.png" 
                          alt={tower.plant?.name || tower.name} 
                          className="w-full h-full object-contain drop-shadow-lg" 
                        />
                      </div>
                      
                      {/* Plant Name */}
                      <div className="w-full text-center">
                        <p className="font-bold text-gray-800 text-lg mb-2 group-hover:text-green-700 transition-colors">
                          {tower.plant?.name?.toUpperCase() || tower.name}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">{tower.name}</p>
                        
                        {/* Status Badge */}
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-semibold text-green-700">Active</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-600 px-8 py-12 rounded-3xl text-center shadow-lg"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {towers.length === 0 ? 'No active towers found' : 'No towers match the selected filter'}
                </p>
                <p className="text-sm text-gray-500">
                  {towers.length === 0 ? 'Add a tower to get started with monitoring' : 'Try selecting a different filter option'}
                </p>
              </motion.div>
            )}
          </motion.section>
           
        </main>
        <Footer />
      </div>

      {/* Tower Detail Modal */}
      {showModal && selectedTower && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center gap-6">
                <img src="/images/tower.png" alt={selectedTower.plant?.name || selectedTower.name} className="h-20 w-20" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    {selectedTower.plant?.name?.toUpperCase() || 'Plant'}
                  </h2>
                  <p className="text-gray-600">{selectedTower.name}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {/* Plant Information */}
              {selectedTower.plant && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6 mb-6">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4">Plant Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Plant Name</p>
                      <p className="font-semibold text-gray-800">{selectedTower.plant.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">pH Range</p>
                      <p className="font-semibold text-gray-800">
                        {selectedTower.plant.min_ph_level} - {selectedTower.plant.max_ph_level}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">PPM Range</p>
                      <p className="font-semibold text-gray-800">
                        {selectedTower.plant.min_ppm} - {selectedTower.plant.max_ppm} ppm
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tower Configuration */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6 mb-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Tower Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Water Level</p>
                    <p className="font-semibold text-gray-800">{formatWaterLevel(selectedTower.waterLevel)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Watering Frequency</p>
                    <p className="font-semibold text-gray-800">{selectedTower.frequency} times/day</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                    <p className="font-semibold text-gray-800">{formatDate(selectedTower.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">End Date</p>
                    <p className="font-semibold text-gray-800">{formatDate(selectedTower.endDate)}</p>
                  </div>
                </div>
              </div>

              {/* Watering Schedule */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6 mb-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Watering Schedule</h3>
                {selectedTower.schedules && selectedTower.schedules.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTower.schedules.map((schedule, index) => (
                      <div 
                        key={schedule.id || index} 
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-800">Time {index + 1}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            schedule.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {schedule.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>Time:</strong> {schedule.time || 'Not set'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Duration:</strong> {schedule.duration || 'N/A'} minutes
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No schedules configured for this tower</p>
                  </div>
                )}
              </div>

              {/* Water Depletion Analytics */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Water Depletion Analysis</h3>
                
                {depletionLoading ? (
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  </div>
                ) : waterDepletion ? (
                  <div className="space-y-4">
                    {/* Depletion Timeline - Most Prominent */}
                    <div className={`p-6 rounded-xl border-2 ${
                      waterDepletion.overallStatus === 'CRITICAL' ? 'bg-red-50 border-red-400' :
                      waterDepletion.overallStatus === 'ATTENTION_NEEDED' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-green-50 border-green-400'
                    }`}>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-2">Water Will Reach Critical Level In</p>
                        <div className="flex items-center justify-center">
                          <div>
                            <p className={`text-5xl font-bold ${
                              waterDepletion.daysUntilCritical <= 3 ? 'text-red-600' :
                              waterDepletion.daysUntilCritical <= 7 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {waterDepletion.daysUntilCritical > 99 ? '99+' : waterDepletion.daysUntilCritical}
                            </p>
                            <p className="text-lg text-gray-500 mt-2">days</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Overall Status */}
                    <div className={`p-4 rounded-lg border ${
                      waterDepletion.overallStatus === 'EXCELLENT' ? 'bg-green-50 border-green-300' :
                      waterDepletion.overallStatus === 'GOOD' ? 'bg-blue-50 border-blue-300' :
                      waterDepletion.overallStatus === 'ATTENTION_NEEDED' ? 'bg-yellow-50 border-yellow-300' :
                      waterDepletion.overallStatus === 'CRITICAL' ? 'bg-red-50 border-red-300' :
                      'bg-gray-50 border-gray-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">Overall Status</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          waterDepletion.overallStatus === 'EXCELLENT' ? 'bg-green-100 text-green-800' :
                          waterDepletion.overallStatus === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                          waterDepletion.overallStatus === 'ATTENTION_NEEDED' ? 'bg-yellow-100 text-yellow-800' :
                          waterDepletion.overallStatus === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {waterDepletion.overallStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Current Water Level */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">Current Water Level</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-cyan-700">{waterDepletion.currentWaterLevel}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Approximately {waterDepletion.currentWaterPercentage}%
                          </p>
                        </div>
                        <span className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                          waterDepletion.waterStatus === 'OPTIMAL' ? 'bg-green-100 text-green-800' :
                          waterDepletion.waterStatus === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {waterDepletion.waterStatus}
                        </span>
                      </div>
                    </div>

                    {/* Depletion Rates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">Water Depletion Rate</p>
                        <p className={`text-lg font-bold ${
                          waterDepletion.waterDepletionRate < 0 ? 'text-red-600' : 
                          waterDepletion.waterDepletionRate > 0 ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {waterDepletion.waterDepletionRate > 0 ? '+' : ''}{waterDepletion.waterDepletionRate}% per day
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {waterDepletion.waterDepletionRate < 0 ? 'Decreasing' : waterDepletion.waterDepletionRate > 0 ? 'Increasing' : 'Stable'}
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">Average Change</p>
                        <p className="text-lg font-bold text-gray-700">
                          {waterDepletion.avgWaterChange > 0 ? '+' : ''}{waterDepletion.avgWaterChange}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Per reading ({waterDepletion.totalReadings} readings analyzed)
                        </p>
                      </div>
                    </div>

                    {/* Recommendation */}
                    {waterDepletion.recommendation && (
                      <div className={`p-4 rounded-lg border ${
                        waterDepletion.needsImmediateAction 
                          ? 'bg-red-50 border-red-300' 
                          : 'bg-blue-50 border-blue-300'
                      }`}>
                        <p className={`text-sm font-semibold mb-2 ${
                          waterDepletion.needsImmediateAction ? 'text-red-800' : 'text-blue-800'
                        }`}>
                          {waterDepletion.needsImmediateAction ? '⚠️ Action Required' : '💡 Recommendation'}
                        </p>
                        <p className={`text-sm ${
                          waterDepletion.needsImmediateAction ? 'text-red-700' : 'text-blue-700'
                        }`}>
                          {waterDepletion.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No water level data available</p>
                    <p className="text-sm mt-2">Sensor readings are required for analysis</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Wave animations */}
      <style jsx>{`
        .wave {
          position: absolute;
          top: -10px;
          left: 0;
          width: 200%;
          height: 30px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 100%;
          opacity: 0.6;
          animation: waveAnim 4s linear infinite;
        }
        .wave1 {
          animation: waveAnim 4s linear infinite;
        }
        .wave2 {
          animation: waveAnim 6s linear infinite reverse;
          opacity: 0.3;
        }
        @keyframes waveAnim {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
