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
  // Mock values
  const ppmValue = 950;
  const phValue = 5.8;
  const targetWaterLevel = 70; // % full
  const [waterLevel, setWaterLevel] = useState(0);

  // Animate tank fill-up
  useEffect(() => {
    const timeout = setTimeout(() => {
      setWaterLevel(targetWaterLevel);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  // Chart data (split for PPM & pH)
  const chartDataPPM = {
    labels: ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM"],
    datasets: [
      {
        label: "PPM Level",
        data: [950, 920, 980, 960, 940],
        borderColor: "#2196F3",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartDataPH = {
    labels: ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM"],
    datasets: [
      {
        label: "pH Level",
        data: [5.9, 5.7, 6.0, 5.8, 5.9],
        borderColor: "#4CAF50",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: { y: { beginAtZero: false } },
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
            className="text-3xl md:text-4xl font-bold text-green-700 mb-4"
          >
            Dashboard
          </motion.h1>
          <p className="text-gray-600 text-base md:text-lg mb-12">
            Monitor your aeroponics system performance and plant tower activity
          </p>

          {/* Top Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
              <p className="text-gray-600">PPM</p>
              <h2 className="text-2xl font-bold text-blue-600">{ppmValue} ppm</h2>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
              <p className="text-gray-600">pH</p>
              <h2 className="text-2xl font-bold text-green-600">{phValue}</h2>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
              <p className="text-gray-600">Water Level</p>
              <h2 className="text-2xl font-bold text-cyan-600">
                {targetWaterLevel}%
              </h2>
            </div>
          </section>

          {/* Charts Section */}
<section className="mb-12">
  <h2 className="text-lg md:text-xl font-semibold mb-6 text-gray-800">
    Nutrient & Water Monitoring
  </h2>
  <div className="grid grid-cols-12 gap-6">
    {/* pH Level */}
    <div className="col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <h3 className="font-bold text-green-900 mb-6">pH Level</h3>
      <LineChart
        data={{
          labels: ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM"],
          datasets: [
            {
              label: "pH Level",
              data: [5.9, 5.7, 6.0, 5.8, 5.9],
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
    <div className="col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <h3 className="font-bold text-green-900 mb-6">PPM Level</h3>
      <LineChart
        data={{
          labels: ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM"],
          datasets: [
            {
              label: "PPM Level",
              data: [950, 920, 980, 960, 940],
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
<div className="col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center">
  <h3 className="font-bold text-green-900 mb-6">Water Level</h3>
  <div className="relative w-20 h-64 bg-gray-200 rounded-lg border-2 border-gray-400 overflow-hidden">
    {/* Animated Fill */}
    <div
      className="absolute bottom-0 left-0 w-full bg-cyan-500 transition-all duration-1000 ease-in-out"
      style={{ height: `${waterLevel}%` }}
    >
      {/* Waves */}
      <div className="wave wave1"></div>
      <div className="wave wave2"></div>
    </div>

    {/* Percentage Label (stays on top, no wave effect) */}
    <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-700 z-10">
      {waterLevel}%
    </div>
  </div>
</div>

  </div>
</section>


          {/* Active Tower Section */}
          <section>
            <h2 className="text-lg md:text-xl font-semibold mb-6 text-gray-800">
              Active Towers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              {["SPINACH", "CABBAGE", "LETTUCE", "TOMATOES"].map((plant) => (
                <motion.div
                  key={plant}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md p-8 flex flex-col items-center transition"
                >
                  <img src="/tower.png" alt={plant} className="h-32 mb-5" />
                  <p className="font-bold text-green-900 text-lg">{plant}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Wave animations */}
      <style jsx>{`
  .wave {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 200%;
    height: 200%;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 35%;
    animation: wave-animation 4s infinite linear;
  }
  .wave1 {
    animation-delay: 0s;
  }
  .wave2 {
    animation-delay: -2s;
    opacity: 0.5;
  }
  @keyframes wave-animation {
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
