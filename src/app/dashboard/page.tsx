'use client';

import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

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
    <div className="flex min-h-screen bg-green-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 max-w-6xl mx-auto w-full px-10 py-12">
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

          {/* Charts Section */}
          <section className="mb-12">
            <h2 className="text-lg md:text-xl font-semibold mb-6 text-gray-800">
              Nutrient Level Trends
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md p-8">
                <h3 className="font-bold text-green-900 mb-6">pH Level</h3>
                <LineChart data={chartDataPH} options={chartOptions} />
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md p-8">
                <h3 className="font-bold text-green-900 mb-6">PPM Level</h3>
                <LineChart data={chartDataPPM} options={chartOptions} />
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
                  <img
                    src="/tower.png" // replace with your tower image
                    alt={plant}
                    className="h-32 mb-5"
                  />
                  <p className="font-bold text-green-900 text-lg">{plant}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
