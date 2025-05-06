"use client";
import { useState } from "react";
import Head from "next/head";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <>
      <Head>
        <title>Aeroponics Dashboard</title>
        <meta name="description" content="Monitor and control your aeroponics system in real time." />
      </Head>
      <Navbar />
      <main className="min-h-screen bg-[#D8E3D5] text-[#333333] flex flex-col items-center p-6">
        <h1 className="text-3xl font-bold mb-6">Aeroponics System Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {/* pH Level */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold">Nutrient Solution pH</h2>
              <p className="text-3xl text-[#333333]">5.9</p>
            </CardContent>
          </Card>
          
          {/* EC Level */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold">Nutrient Concentration (EC)</h2>
              <p className="text-3xl text-[#333333]">1.8 mS/cm</p>
            </CardContent>
          </Card>
          
          {/* Water Level & Quality */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold">Water Level & Quality</h2>
              <p className="text-lg">Dissolved Oxygen: <span className="text-[#333333]">6.5 mg/L</span></p>
              <p className="text-lg">Turbidity: <span className="text-red-400">High</span></p>
            </CardContent>
          </Card>
          
          {/* Pump Status */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold">Pump & Misting System</h2>
              <p className={`text-3xl ${pumpStatus === "ON" ? "text-[#333333]" : "text-red-400"}`}>{pumpStatus}</p>
              <button className="mt-4 bg-orange-500 px-4 py-2 rounded-full" onClick={() => setPumpStatus(pumpStatus === "ON" ? "OFF" : "ON")}>Toggle Pump</button>
            </CardContent>
          </Card>
          
          {/* Alerts & Warnings */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold">System Alerts</h2>
              <ul className="mt-2 text-red-400">
                <li>⚠ Low Water Level</li>
                <li>⚠ Nutrient Imbalance</li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Logs & User Access */}
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold">User Access & Logs</h2>
              <p className="text-lg">Current Role: <span className="text-yellow-400">Admin</span></p>
              <p className="text-lg mt-2">Last Activity: Pump Activated</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Historical Trends */}
        <div className="w-full max-w-6xl mt-8">
          <h2 className="text-2xl font-semibold mb-4">Nutrient Level Trends</h2>
          <LineChart width={700} height={300} data={nutrientLevel} className="bg-[#D8E3D5] p-4 rounded-lg">
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis dataKey="time" stroke="#333333" />
            <YAxis stroke="#333333" />
            <Tooltip />
            <Line type="monotone" dataKey="level" stroke="#82ca9d" strokeWidth={2} />
          </LineChart>
        </div>
      </main>
      <Footer />
    </>
  );
}