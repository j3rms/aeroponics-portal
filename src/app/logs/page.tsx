'use client';

import Sidebar from "@/components/sidebar";
import { motion } from "framer-motion";
import { useState } from "react";

// Sample hardcoded data
const sampleData = [
  { id: 1, towerName: "Cabbage", phLevel: 6.0, ppmLevel: 1350, waterLevel: 75, timestamp: "2025-09-16T12:31:11"},
  { id: 2, towerName: "Lettuce", phLevel: 6.2, ppmLevel: 580, waterLevel: 82, timestamp: "2025-09-16T13:25:16"},
  { id: 3, towerName: "Basil", phLevel: 5.8, ppmLevel: 880, waterLevel: 68, timestamp: "2025-09-16T14:22:02"},
  { id: 4, towerName: "Kale", phLevel: 6.4, ppmLevel: 3250, waterLevel: 45, timestamp: "2025-09-16T15:19:55"},
  { id: 5, towerName: "Spinach", phLevel: 6.9, ppmLevel: 1469, waterLevel: 60, timestamp: "2025-09-16T16:21:44"},
  { id: 6, towerName: "Broccoli", phLevel: 6.3, ppmLevel: 2150, waterLevel: 80, timestamp: "2025-09-16T17:28:33"},
  { id: 7, towerName: "Kale", phLevel: 6.4, ppmLevel: 3250, waterLevel: 45, timestamp: "2025-09-16T18:19:18"},
  { id: 8, towerName: "Spinach", phLevel: 6.9, ppmLevel: 1469, waterLevel: 60, timestamp: "2025-09-16T19:41:01"},
  { id: 9, towerName: "Broccoli", phLevel: 6.3, ppmLevel: 2150, waterLevel: 80, timestamp: "2025-09-16T20:02:21"},
  { id: 10, towerName: "Broccoli", phLevel: 6.3, ppmLevel: 2150, waterLevel: 80, timestamp: "2025-09-16T21:10:50"},
  { id: 11, towerName: "Kale", phLevel: 6.4, ppmLevel: 3250, waterLevel: 45, timestamp: "2025-09-16T22:08:46"},
  { id: 12, towerName: "Spinach", phLevel: 6.9, ppmLevel: 1469, waterLevel: 60, timestamp: "2025-09-16T23:06:23"},
  { id: 13, towerName: "Broccoli", phLevel: 6.3, ppmLevel: 2150, waterLevel: 80, timestamp: "2025-09-16T00:25:43"},
  { id: 14, towerName: "Broccoli", phLevel: 6.3, ppmLevel: 2150, waterLevel: 80, timestamp: "2025-09-16T11:28:54"},
  { id: 15, towerName: "Broccoli", phLevel: 6.3, ppmLevel: 2150, waterLevel: 80, timestamp: "2025-09-16T10:23:12"},
];

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

// Helper function
const getStatusColor = (type: string, value: number, plantName: string) => {
  if (type === 'water') {
    return value >= WATER_THRESHOLD.min ? 'text-green-600' : 'text-red-600 font-semibold';
  }
  const plantThresholds = PLANT_THRESHOLDS[plantName as keyof typeof PLANT_THRESHOLDS];
  if (!plantThresholds) return 'text-gray-600';
  switch(type) {
    case 'ph':
      return (value >= plantThresholds.ph.min && value <= plantThresholds.ph.max)
        ? 'text-green-600' : 'text-red-600 font-semibold';
    case 'ppm':
      return (value >= plantThresholds.ppm.min && value <= plantThresholds.ppm.max)
        ? 'text-green-600' : 'text-yellow-600 font-semibold';
    default:
      return 'text-gray-600';
  }
};

export default function Logs() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const sortedData = [...sampleData].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex min-h-screen bg-green-50 pl-64">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-1 max-w-8xl mx-auto w-full px-10 py-14">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-800 mb-4"
          >
            Tower Data Logs
          </motion.h1>
          <p className="text-gray-600 text-lg mb-10">
            View historical sensor data from your towers
          </p>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden w-full"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-lg">
                <thead className="bg-green-700 text-white text-lg">
                  <tr>
                    <th className="px-5 py-4 text-center font-bold">ID</th>
                    <th className="px-6 py-4 text-center font-bold">TOWER</th>
                    <th className="px-6 py-4 text-center font-bold">PH</th>
                    <th className="px-6 py-4 text-center font-bold">PPM</th>
                    <th className="px-6 py-4 text-center font-bold">WATER</th>
                    <th className="px-6 py-4 text-center font-bold">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((data, index) => (
                    <tr
                      key={data.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-green-50/50' : 'bg-white'
                      }`}
                    >
                      <td className="px-5 py-4 text-center font-medium text-gray-600">
                        {data.id}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-800">
                        {data.towerName}
                      </td>
                      <td className={`px-6 py-4 text-center font-semibold ${getStatusColor('ph', data.phLevel, data.towerName)}`}>
                        {data.phLevel.toFixed(1)}
                      </td>
                      <td className={`px-6 py-4 text-center font-semibold ${getStatusColor('ppm', data.ppmLevel, data.towerName)}`}>
                        {data.ppmLevel.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-center font-semibold ${getStatusColor('water', data.waterLevel, data.towerName)}`}>
                        {data.waterLevel}%
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-600">
                        {new Date(data.timestamp).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true,
                        }).replace(',', ', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center px-10 py-5 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-6 py-2 text-base font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="text-base text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-6 py-2 text-base font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
