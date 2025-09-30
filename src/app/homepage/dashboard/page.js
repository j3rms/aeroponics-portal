'use client';

import Sidebar from "@/components/sidebar";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
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
  const [harvestPredictions, setHarvestPredictions] = useState([]);
  const [predictionsLoading, setPredictionsLoading] = useState(true);
  const [selectedTower, setSelectedTower] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch sensor data from backend
  const fetchSensorData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/apis/getSensorData');
      const result = await response.json();

      if (result.success && result.data) {
        setSensorData({
          phValue: result.data.phValue || 0,
          ppmValue: result.data.ppmValue || 0,
          targetWaterLevel: result.data.waterLevel || 0,
        });
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

  // Fetch historical data for charts
  const fetchHistoricalData = async () => {
    try {
      const response = await fetch('/apis/getSensorHistory?limit=5');
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

  // Fetch harvest predictions from backend
  const fetchHarvestPredictions = async () => {
    try {
      setPredictionsLoading(true);
      const response = await fetch('/apis/getHarvestPredictions');
      const result = await response.json();

      if (result.success && result.data && result.data.data) {
        setHarvestPredictions(result.data.data);
      }
    } catch (err) {
      console.error('Error fetching harvest predictions:', err);
    } finally {
      setPredictionsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSensorData();
    fetchHistoricalData();
    fetchTowers();
    fetchHarvestPredictions();
  }, []);

  // Animate tank fill-up when data changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setWaterLevel(sensorData.targetWaterLevel);
    }, 500);
    return () => clearTimeout(timeout);
  }, [sensorData.targetWaterLevel]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSensorData();
      fetchHistoricalData();
      fetchTowers();
      fetchHarvestPredictions();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle tower click
  const handleTowerClick = (tower) => {
    setSelectedTower(tower);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedTower(null);
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
    <div className="flex min-h-screen bg-green-50 pl-64">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 max-w-7xl mx-auto w-full px-10 py-12">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
          >
            Dashboard
          </motion.h1>
          <p className="text-gray-600 text-base md:text-lg mb-12">
            Monitor your aeroponics system performance and plant tower activity
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
            </div>
          )}

          {/* Top Stats */}
          <section className="flex flex-wrap gap-6 mb-12">
            <div className="flex-1 min-w-[200px] bg-white rounded-2xl border shadow-sm p-6 text-center">
              <p className="text-gray-600">pH</p>
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded mt-2"></div>
              ) : (
                <h2 className="text-2xl font-bold text-green-600">
                  {sensorData.phValue.toFixed(1)}
                </h2>
              )}
            </div>
            <div className="flex-1 min-w-[200px] bg-white rounded-2xl border shadow-sm p-6 text-center">
              <p className="text-gray-600">PPM</p>
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded mt-2"></div>
              ) : (
                <h2 className="text-2xl font-bold text-blue-600">
                  {sensorData.ppmValue.toFixed(0)} ppm
                </h2>
              )}
            </div>
            <div className="flex-1 min-w-[200px] bg-white rounded-2xl border shadow-sm p-6 text-center">
              <p className="text-gray-600">Water Level</p>
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded mt-2"></div>
              ) : (
                <h2 className="text-2xl font-bold text-cyan-600">
                  {sensorData.targetWaterLevel}%
                </h2>
              )}
            </div>
          </section>

          {/* Charts Section */}
          <section className="mb-12">
            <h2 className="text-lg md:text-xl font-semibold mb-6 text-gray-800">
              Nutrient & Water Monitoring
            </h2>
            <div className="flex flex-wrap gap-6">
              {/* pH Level */}
              <div className="flex-1 min-w-[300px] bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <h3 className="font-bold text-green-900 mb-6">pH Level</h3>
                <LineChart
                  data={{
                    labels: chartData.labels,
                    datasets: [
                      {
                        label: "pH Level",
                        data: chartData.phData,
                        borderColor: "#4CAF50",
                        fill: false,
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: true } },
                    scales: { y: { beginAtZero: false } },
                  }}
                />
              </div>

              {/* PPM Level */}
              <div className="flex-1 min-w-[300px] bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <h3 className="font-bold text-green-900 mb-6">PPM Level</h3>
                <LineChart
                  data={{
                    labels: chartData.labels,
                    datasets: [
                      {
                        label: "PPM Level",
                        data: chartData.ppmData,
                        borderColor: "#2196F3",
                        fill: false,
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: true } },
                    scales: { y: { beginAtZero: false } },
                  }}
                />
              </div>

              {/* Water Tank */}
              <div className="flex flex-col items-center min-w-[150px] bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <h3 className="font-bold text-green-900 mb-6">Water Level</h3>
                <div className="relative w-20 h-64 bg-gray-200 rounded-lg border-2 border-gray-400 overflow-hidden">
                  {/* Water Fill */}
                  <div
                    className="absolute bottom-0 left-0 w-full bg-cyan-500 transition-all duration-1000 ease-in-out overflow-hidden"
                    style={{ height: `${waterLevel}%` }}
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
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-700 z-10">
                    {waterLevel}%
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Harvest Predictions Section */}
          <section className="mb-12">
            <h2 className="text-lg md:text-xl font-semibold mb-6 text-gray-800">
              Harvest Predictions
            </h2>
            
            {predictionsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
                    <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            ) : harvestPredictions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {harvestPredictions.map((prediction) => {
                  const healthColors = {
                    EXCELLENT: 'bg-green-100 text-green-800 border-green-300',
                    GOOD: 'bg-blue-100 text-blue-800 border-blue-300',
                    FAIR: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                    POOR: 'bg-red-100 text-red-800 border-red-300',
                    NO_DATA: 'bg-gray-100 text-gray-800 border-gray-300'
                  };

                  return (
                    <motion.div
                      key={prediction.towerId}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md p-6 transition"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-green-900 text-lg">{prediction.plantName}</h3>
                          <p className="text-sm text-gray-600">{prediction.towerName}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${healthColors[prediction.healthStatus] || healthColors.NO_DATA}`}>
                          {prediction.healthStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Growth Progress</span>
                          <span className="font-semibold text-green-700">{prediction.growthProgress}%</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${prediction.growthProgress}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm text-gray-600">Days Until Harvest</span>
                          <span className="font-bold text-xl text-green-900">{prediction.daysUntilHarvest}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          <div>
                            <p className="text-xs text-gray-500">Avg pH</p>
                            <p className="font-semibold text-green-700">{prediction.averagePh}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Avg PPM</p>
                            <p className="font-semibold text-blue-700">{prediction.averagePpm}</p>
                          </div>
                        </div>

                        {prediction.recommendation && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-800">
                              <span className="font-semibold">💡 Tip: </span>
                              {prediction.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-100 border border-gray-300 text-gray-600 px-6 py-8 rounded-lg text-center">
                <p className="text-lg">No harvest predictions available</p>
                <p className="text-sm mt-2">Add active towers to see predictions</p>
              </div>
            )}
          </section>

          {/* Active Tower Section */}
          <section>
            <h2 className="text-lg md:text-xl font-semibold mb-6 text-gray-800">
              Active Towers
            </h2>
            
            {towersError && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-6">
                <p>{towersError}</p>
              </div>
            )}
            
            {towersLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center">
                    <div className="h-32 w-32 bg-gray-200 animate-pulse rounded mb-5"></div>
                    <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            ) : towers.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {towers.map((tower) => (
                  <motion.div
                    key={tower.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleTowerClick(tower)}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md p-8 flex flex-col items-center transition cursor-pointer"
                  >
                    <img src="/images/tower.png" alt={tower.plant?.name || tower.name} className="h-32 mb-5" />
                    <p className="font-bold text-green-900 text-lg text-center">
                      {tower.plant?.name?.toUpperCase() || tower.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">{tower.name}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 border border-gray-300 text-gray-600 px-6 py-8 rounded-lg text-center">
                <p className="text-lg">No active towers found</p>
                <p className="text-sm mt-2">Add a tower to get started</p>
              </div>
            )}
          </section>
        </main>
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
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6">
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
