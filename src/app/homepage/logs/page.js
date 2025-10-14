'use client';

import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FileText, ChevronLeft, ChevronRight, Droplets, Activity, Gauge, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

// Data is now fetched from backend via /apis/getLogs

// Plant-specific thresholds
const PLANT_THRESHOLDS = {
  Cabbage: { ph: { min: 6.0, max: 6.8 }, ppm: { min: 1250, max: 2250 } },
  Lettuce: { ph: { min: 6.0, max: 7.0 }, ppm: { min: 560, max: 840 } },
  Basil: { ph: { min: 5.5, max: 6.5 }, ppm: { min: 700, max: 1120 } },
  Kale: { ph: { min: 5.5, max: 6.8 }, ppm: { min: 2800, max: 3500 } },
  Spinach: { ph: { min: 6.0, max: 7.0 }, ppm: { min: 1260, max: 1610 } },
  Broccoli: { ph: { min: 6.0, max: 6.8 }, ppm: { min: 1960, max: 2450 } }
};

// Water threshold
const WATER_THRESHOLD = { min: 50 };

// Helper function (JS version)
const getStatusColor = (type, value, plantName) => {
  if (type === 'water') {
    return value >= WATER_THRESHOLD.min ? 'text-green-600' : 'text-red-600 font-semibold';
  }

  const plantThresholds = PLANT_THRESHOLDS[plantName];
  if (!plantThresholds) return 'text-gray-600';

  switch (type) {
    case 'ph':
      return (value >= plantThresholds.ph.min && value <= plantThresholds.ph.max)
        ? 'text-green-600'
        : 'text-red-600 font-semibold';
    case 'ppm':
      return (value >= plantThresholds.ppm.min && value <= plantThresholds.ppm.max)
        ? 'text-green-600'
        : 'text-yellow-600 font-semibold';
    default:
      return 'text-gray-600';
  }
};

export default function Logs() {
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState('timestamp'); // Default sort by timestamp
  const [sortOrder, setSortOrder] = useState('desc'); // Default descending (latest first)
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/apis/getLogs?limit=200`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || `Failed to fetch logs (${res.status})`);
        }
        setLogs(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error('Logs fetch error:', err);
        setError(err.message || 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const sortedData = [...logs].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'id':
        aValue = a.id || 0;
        bValue = b.id || 0;
        break;
      case 'tower':
        aValue = (a.towerName || '').toLowerCase();
        bValue = (b.towerName || '').toLowerCase();
        break;
      case 'ph':
        aValue = a.phLevel || 0;
        bValue = b.phLevel || 0;
        break;
      case 'ppm':
        aValue = a.ppmLevel || 0;
        bValue = b.ppmLevel || 0;
        break;
      case 'water':
        aValue = a.waterLevel || 0;
        bValue = b.waterLevel || 0;
        break;
      case 'timestamp':
        aValue = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        bValue = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 md:pl-64 overflow-x-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-1 max-w-3xl md:max-w-none mx-auto md:mx-0 w-full px-4 md:px-10 py-8 md:py-12">
          {/* Header with decorative elements */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 relative overflow-hidden"
          >
            {/* Decorative background */}
            <div className="absolute top-10 -left-20 w-72 h-72 bg-green-200/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-start md:text-left gap-4 relative z-10">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent pb-1 leading-tight">
                  Tower Data Logs
                </h1>
                <p className="text-gray-600 text-sm md:text-lg mt-1">
                  View historical sensor data from your towers
                </p>
              </div>
            </div>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden w-full"
          >
            <div className="overflow-x-auto px-2 md:px-0">
              <table className="w-full text-xs md:text-base min-w-full table-fixed md:table-auto">
                <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <tr>
                    <th className="px-2 md:px-5 py-3 md:py-5 text-center font-bold text-xs md:text-base">
                      <button
                        onClick={() => handleSort('id')}
                        className="flex items-center justify-center gap-1 mx-auto hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
                      >
                        <span className="md:hidden">ID</span>
                        <span className="hidden md:inline">#</span>
                        {sortField === 'id' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </button>
                    </th>
                    <th className="px-2 md:px-6 py-3 md:py-5 text-center font-bold text-xs md:text-base">
                      <button
                        onClick={() => handleSort('tower')}
                        className="flex items-center justify-center gap-1 mx-auto hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
                      >
                        <span className="md:hidden">TN</span>
                        <span className="hidden md:inline">TOWER</span>
                        {sortField === 'tower' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </button>
                    </th>
                    <th className="px-2 md:px-6 py-3 md:py-5 text-center font-bold text-xs md:text-base">
                      <button
                        onClick={() => handleSort('ph')}
                        className="flex items-center justify-center gap-2 mx-auto hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
                      >
                        <Activity className="w-4 h-4" />
                        <span>PH</span>
                        {sortField === 'ph' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </button>
                    </th>
                    <th className="px-2 md:px-6 py-3 md:py-5 text-center font-bold text-xs md:text-base">
                      <button
                        onClick={() => handleSort('ppm')}
                        className="flex items-center justify-center gap-2 mx-auto hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
                      >
                        <Gauge className="w-4 h-4" />
                        <span>PPM</span>
                        {sortField === 'ppm' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </button>
                    </th>
                    <th className="px-2 md:px-6 py-3 md:py-5 text-center font-bold text-xs md:text-base">
                      <button
                        onClick={() => handleSort('water')}
                        className="flex items-center justify-center gap-2 mx-auto hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
                      >
                        <Droplets className="w-4 h-4" />
                        <span className="md:hidden">WT</span>
                        <span className="hidden md:inline">WATER</span>
                        {sortField === 'water' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </button>
                    </th>
                    <th className="px-2 md:px-6 py-3 md:py-5 text-center font-bold text-xs md:text-base">
                      <button
                        onClick={() => handleSort('timestamp')}
                        className="flex items-center justify-center gap-1 mx-auto hover:bg-white/10 px-3 py-1 rounded-lg transition-colors"
                      >
                        <span className="md:hidden">TS</span>
                        <span className="hidden md:inline">TIMESTAMP</span>
                        {sortField === 'timestamp' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="font-medium">Loading logs...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-12 h-12 text-gray-300" />
                          <span className="font-medium">No logs available</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentData.map((data, index) => (
                    <tr
                      key={data.id}
                      className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-2 md:px-5 py-2.5 md:py-4 text-center font-medium text-gray-500">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-semibold">
                          {data.id}
                        </span>
                      </td>
                      <td className="px-2 md:px-6 py-2.5 md:py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-xs md:text-sm truncate max-w-[100px] md:max-w-none">
                          {data.towerName}
                        </span>
                      </td>
                      <td className={`px-2 md:px-6 py-2.5 md:py-4 text-center`}>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full font-bold text-xs md:text-sm ${
                          getStatusColor('ph', data.phLevel, data.towerName).includes('green') 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {Number.isFinite(data.phLevel) ? data.phLevel.toFixed(1) : '—'}
                        </span>
                      </td>
                      <td className={`px-2 md:px-6 py-2.5 md:py-4 text-center`}>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full font-bold text-xs md:text-sm ${
                          getStatusColor('ppm', data.ppmLevel, data.towerName).includes('green') 
                            ? 'bg-green-100 text-green-700' 
                            : getStatusColor('ppm', data.ppmLevel, data.towerName).includes('yellow')
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {Number.isFinite(data.ppmLevel) ? data.ppmLevel.toLocaleString() : '—'}
                        </span>
                      </td>
                      <td className={`px-2 md:px-6 py-2.5 md:py-4 text-center`}>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full font-bold text-xs md:text-sm ${
                          getStatusColor('water', data.waterLevel, data.towerName).includes('green') 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {Number.isFinite(data.waterLevel) ? `${data.waterLevel}%` : '—'}
                        </span>
                      </td>
                      <td className="px-2 md:px-6 py-2.5 md:py-4 text-center">
                        {data.time ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] md:text-sm font-bold text-gray-800">
                              {new Date(`2000-01-01T${data.time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              {new Date(data.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: window.innerWidth > 768 ? 'numeric' : '2-digit'
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center px-6 md:px-10 py-5 md:py-6 bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-100">
              <motion.button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-300 hover:shadow-md transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden md:inline">Previous</span>
                <span className="md:hidden">Prev</span>
              </motion.button>
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-semibold text-gray-700 bg-white px-4 py-2 rounded-xl border-2 border-green-200">
                  <span className="hidden md:inline">Page {currentPage} of {totalPages}</span>
                  <span className="md:hidden">{currentPage}/{totalPages}</span>
                </span>
              </div>
              <motion.button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-green-300 hover:shadow-md transition-all"
              >
                <span className="hidden md:inline">Next</span>
                <span className="md:hidden">Next</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
