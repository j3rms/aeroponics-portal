"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

// Dynamically import Line chart
const LineChart = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Line),
  { ssr: false }
);

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Dashboard() {
  // Chart data
  const chartDataPH = {
    labels: ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM"],
    datasets: [
      {
        label: "pH Level",
        data: [5.5, 5.4, 6.2, 5.9, 6.0],
        borderColor: "#4CAF50",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartDataPPM = {
    labels: ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM"],
    datasets: [
      {
        label: "PPM Level",
        data: [10, 9, 25, 20, 22],
        borderColor: "#2196F3",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="flex items-center justify-between bg-green-700 text-white px-6 py-3 shadow-md">
        <div className="flex items-center space-x-3">
          <img src="/urbanfarm.png" alt="UrbanFarm Logo" className="h-10" />
          <h1 className="font-bold text-xl">URBANFARM</h1>
        </div>
        <nav className="flex items-center space-x-6">
          <a href="#" className="hover:underline">Manage tower</a>
          <a href="#" className="hover:underline">Manage plant</a>
          <button className="hover:scale-110 transition">🔔</button>
          <button className="hover:scale-110 transition">👤</button>
        </nav>
      </header>

      {/* Dashboard Content */}
      <main className="p-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold mb-6 text-green-900"
        >
          Dashboard
        </motion.h1>

        {/* Charts Section */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3 text-green-800">Nutrient Level Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md border">
              <h3 className="font-bold text-green-900 mb-2">pH Level</h3>
              <LineChart data={chartDataPH} options={chartOptions} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border">
              <h3 className="font-bold text-green-900 mb-2">PPM Level</h3>
              <LineChart data={chartDataPPM} options={chartOptions} />
            </div>
          </div>
        </section>

        {/* Active Tower Section */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-green-800">Active Tower</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["SPINACH", "CABBAGE", "LETTUCE", "TOMATOES"].map((plant) => (
              <motion.div
                key={plant}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center border"
              >
                <img
                  src="/tower.png" // replace with your tower image
                  alt={plant}
                  className="h-28 mb-3"
                />
                <p className="font-bold text-green-900">{plant}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
