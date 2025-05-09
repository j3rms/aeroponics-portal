"use client";

import dynamic from "next/dynamic"; // Import dynamic function
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

// Dynamically import Line from react-chartjs-2 (client-side only)
const LineChart = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Line), 
  { ssr: false }
);

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Dashboard() {
  const [nutrientLevel, setNutrientLevel] = useState([
    { time: "10 AM", level: 5.8 },
    { time: "11 AM", level: 6.0 },
    { time: "12 PM", level: 5.9 },
    { time: "1 PM", level: 6.1 },
  ]);

  // Chart.js data
  const chartData = {
    labels: nutrientLevel.map((d) => d.time),
    datasets: [
      {
        label: "PH Level",
        data: nutrientLevel.map((d) => d.level),
        borderColor: "#4CAF50",
        fill: false,
        tension: 0.4,
      },
      {
        label: "PPM",
        data: [400, 420, 410, 430, 415], // Static for now
        borderColor: "#2196F3",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // Chart.js options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-green-100 to-blue-50 text-gray-800 p-6 overflow-y-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-green-800 drop-shadow"
        >
          Dashboard
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {/* Nutrient Solution pH */}
          <motion.div whileHover={{ scale: 1.03 }}>
            <div className="rounded-2xl bg-white/50 shadow-lg border border-green-200 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-2">Nutrient Solution pH</h2>
              <p className="text-4xl font-bold text-green-700">5.9</p>
            </div>
          </motion.div>

          {/* PPM (Solution Level) */}
          <motion.div whileHover={{ scale: 1.03 }}>
            <div className="rounded-2xl bg-white/50 shadow-lg border border-green-200 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-2">PPM (Solution Level)</h2>
              <p className="text-4xl font-bold text-green-700">420 ppm</p>
            </div>
          </motion.div>
        </div>


        {/* Nutrient Level Trends */}
        <div className="w-full max-w-6xl mt-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-green-800">Nutrient Level Trends</h2>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 overflow-x-auto">
              {/* Render dynamically imported LineChart */}
              <LineChart data={chartData} options={chartOptions} />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
