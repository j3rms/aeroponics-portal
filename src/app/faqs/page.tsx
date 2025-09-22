'use client';

import Sidebar from "@/components/sidebar";
import { motion } from "framer-motion";
import { useState } from "react";

const faqs = [
  {
    question: "How often should I change the nutrient solution?",
    answer:
      "It's recommended to change the nutrient solution every 1-2 weeks to maintain optimal plant growth and prevent nutrient imbalances.",
  },
  {
    question: "What pH level is ideal for aeroponics?",
    answer:
      "The ideal pH range for aeroponics systems is between 5.5 and 6.5, depending on the plant type.",
  },
  {
    question: "Why is water level monitoring important?",
    answer:
      "Monitoring the water level ensures that the pump doesn't run dry, which could damage equipment and halt plant growth.",
  },
  {
    question: "How do I prevent root diseases?",
    answer:
      "Ensure proper sanitation, maintain optimal temperature and humidity, and use beneficial microbes when possible.",
  },
];

export default function FaqPage() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="flex min-h-screen bg-green-50 pl-64">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <main className="flex-1 max-w-4xl mx-auto w-full px-10 py-12">
          {/* Page Title */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
          >
            Frequently Asked Questions
          </motion.h1>
          <p className="text-gray-600 text-base md:text-lg mb-12">
            Find quick answers to common questions about your aeroponics system.
          </p>

          {/* FAQ List */}
          <section className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 cursor-pointer"
                onClick={() => toggleFaq(index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-green-800">
                    {faq.question}
                  </h3>
                  <span className="text-gray-400 text-xl">
                    {activeIndex === index ? "-" : "+"}
                  </span>
                </div>
                {activeIndex === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 text-gray-700"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
