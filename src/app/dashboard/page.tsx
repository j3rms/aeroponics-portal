"use client";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const [pumpStatus, setPumpStatus] = useState("ON");
  const [nutrientLevel, setNutrientLevel] = useState([
    { time: "10 AM", level: 5.8 },
    { time: "11 AM", level: 6.0 },
    { time: "12 PM", level: 5.9 },
    { time: "1 PM", level: 6.1 },
  ]);

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
          Aeroponics System Dashboard
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {/* Nutrient Solution pH */}
          <motion.div whileHover={{ scale: 1.03 }}>
            <Card className="rounded-2xl shadow-lg border border-green-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Nutrient Solution pH</h2>
                <p className="text-4xl font-bold text-green-700">5.9</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Nutrient Concentration (EC) */}
          <motion.div whileHover={{ scale: 1.03 }}>
            <Card className="rounded-2xl shadow-lg border border-green-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Nutrient Concentration (EC)</h2>
                <p className="text-4xl font-bold text-green-700">1.8 mS/cm</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Water Level & Quality */}
          <motion.div whileHover={{ scale: 1.03 }}>
            <Card className="rounded-2xl shadow-lg border border-green-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Water Level & Quality</h2>
                <p className="text-lg">Dissolved Oxygen: <span className="font-medium text-green-700">6.5 mg/L</span></p>
                <p className="text-lg">Turbidity: <span className="text-red-500 font-medium">High</span></p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pump & Misting System */}
          <motion.div whileHover={{ scale: 1.03 }}>
            <Card className="rounded-2xl shadow-lg border border-green-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Pump & Misting System</h2>
                <p className={`text-3xl font-bold ${pumpStatus === "ON" ? "text-green-700" : "text-red-500"}`}>
                  {pumpStatus}
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
                  onClick={() => setPumpStatus(pumpStatus === "ON" ? "OFF" : "ON")}
                >
                  Toggle Pump
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Alerts */}
          <motion.div whileHover={{ scale: 1.03 }}>
            <Card className="rounded-2xl shadow-lg border border-red-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">System Alerts</h2>
                <ul className="text-red-500 font-medium space-y-1">
                  <li>⚠ Low Water Level</li>
                  <li>⚠ Nutrient Imbalance</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Access & Logs */}
          <motion.div whileHover={{ scale: 1.03 }}>
            <Card className="rounded-2xl shadow-lg border border-yellow-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">User Access & Logs</h2>
                <p className="text-lg">Current Role: <span className="text-yellow-500 font-semibold">Admin</span></p>
                <p className="text-lg mt-2">Last Activity: Pump Activated</p>
              </CardContent>
            </Card>
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
              <LineChart width={700} height={300} data={nutrientLevel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="time" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip />
                <Line type="monotone" dataKey="level" stroke="#38a169" strokeWidth={3} />
              </LineChart>
            </div>
          </motion.div>
        </div>
      </main>

      
    </div>
  );
}
