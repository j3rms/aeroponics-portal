"use client";

import Head from "next/head";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Aeroponics System</title>
        <meta name="description" content="Explore our cutting-edge aeroponics system for efficient farming." />
      </Head>

      <main className="bg-gradient-to-br from-green-100 to-blue-50 min-h-screen flex flex-col items-center">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center py-20 px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-extrabold text-green-800 mb-4"
          >
            Revolutionizing Farming with Aeroponics
          </motion.h1>
          <p className="text-lg text-gray-700 mb-6 max-w-4xl">
            Our aeroponics system allows for sustainable, water-efficient, and high-yield farming in a controlled environment. Experience the future of agriculture today.
          </p>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 bg-green-700 text-white text-lg font-bold rounded-lg shadow-md hover:bg-green-800 transition"
            >
              Get Started
            </motion.button>
          </Link>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 max-w-6xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-green-800 mb-10"
          >
            How Our Aeroponics System Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Water-Efficient</h3>
              <p className="text-gray-700">
                Our system uses up to 90% less water than traditional farming methods, making it ideal for drought-prone areas.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Soil-Free Growth</h3>
              <p className="text-gray-700">
                Plants grow in a nutrient-rich mist, promoting faster growth without soil, eliminating the need for pesticides.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Space Efficient</h3>
              <p className="text-gray-700">
                Aeroponics systems require less space than traditional farming, making them ideal for urban and vertical farming.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-green-50 py-20 px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-green-800 mb-10"
          >
            Key Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-green-700 mb-4">High Yields</h3>
              <p className="text-gray-700">
                Grow crops faster and in higher quantities due to optimized nutrient delivery and controlled environmental conditions.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-green-700 mb-4">Sustainability</h3>
              <p className="text-gray-700">
                Designed with the environment in mind, our system significantly reduces water and energy consumption.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-green-700 mb-4">Scalable</h3>
              <p className="text-gray-700">
                Whether you're a small grower or a large enterprise, our system can be scaled to meet your needs.
              </p>
            </div>
          </div>
        </section>

       
      </main>
    </>
  );
}
