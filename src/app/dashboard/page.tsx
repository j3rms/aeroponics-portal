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

       {/* Charts Label Section */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold mb-3 text-green-800">
          Nutrient Level Trends
        </h3>
        <div className="flex flex-wrap gap-6">      
          <div className="bg-[#58803D] shadow-xl rounded-xl px-6 py-4 shadow-sm flex flex-col items-start gap-2 w-140">
            <h1 className="font-bold text-white text-xl">pH Level</h1>
            <span className="text-[#D8C535] text-3xl font-semibold">6.1</span>
          </div>
          <div className="bg-[#58803D] shadow-xl rounded-xl px-6 py-4 shadow-sm flex flex-col items-start gap-2 w-140">
            <h1 className="font-bold text-white text-xl">PPM Level</h1>
            <span className="text-[#2196F3] text-3xl font-semibold">820</span>
          </div>
          <div className="bg-[#58803D] shadow-xl rounded-xl px-6 py-4 shadow-sm flex flex-col items-start gap-2 w-140">
            <h1 className="font-bold text-white text-xl">Water Level</h1>
            <span className="text-[#D91C1C] text-3xl font-semibold">30</span>
          </div>
        </div>
      </section>

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
