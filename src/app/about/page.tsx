"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import Sidebar from "@/components/sidebar";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "What is this system about?",
    answer:
      "Our system is designed to manage and monitor the aeroponics process efficiently. It integrates hardware (NodeMCU sensors) with a Java backend and a modern frontend dashboard for real-time updates.",
  },
  {
    question: "Who can use this system?",
    answer:
      "It is intended for researchers, students, and farm managers who want to automate and track plant growth conditions in an aeroponics environment.",
  },
  {
    question: "How does the system collect data?",
    answer:
      "The NodeMCU collects sensor readings such as pH, PPM, temperature, and humidity, then sends them to the backend, where they are stored and visualized in the dashboard.",
  },
  {
    question: "Is the data stored securely?",
    answer:
      "Yes. All data is stored in the backend with proper handling to ensure accuracy and security. Users can also download reports for offline use.",
  },
  {
    question: "Can I customize the settings?",
    answer:
      "Yes. You can adjust watering periods, nutrient levels, and other preferences directly from the dashboard.",
  },
];

export default function AboutPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <motion.div
        className="flex-1 p-8 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-3xl font-bold mb-4">About Our System</h1>
        <p className="text-gray-700 mb-6 leading-relaxed">
          Our Aeroponics Monitoring and Management System is built to help
          automate, track, and optimize plant growth conditions. With seamless
          integration of IoT hardware, backend services, and a modern user
          dashboard, it provides real-time insights to improve efficiency and
          sustainability in agriculture.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border rounded-xl p-4 shadow-sm bg-white"
              whileHover={{ scale: 1.01 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left"
              >
                <span className="font-medium text-gray-900">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-gray-600"
                >
                  {faq.answer}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
