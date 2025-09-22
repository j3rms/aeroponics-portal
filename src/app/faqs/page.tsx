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

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="flex min-h-screen bg-white pl-64">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2"
          >
            FAQs
          </motion.h1>
          <p className="text-gray-500 text-sm md:text-base mb-10">
            Answers to common questions about your aeroponics system.
          </p>

          {/* FAQs */}
          <section className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                onClick={() => toggleFaq(index)}
                className="border-b border-gray-200 pb-4 cursor-pointer group"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-gray-800 font-medium group-hover:text-green-700 transition">
                    {faq.question}
                  </h3>
                  <span className="text-gray-400 text-xl">
                    {activeIndex === index ? "−" : "+"}
                  </span>
                </div>
                {activeIndex === index && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-600 mt-3 text-sm leading-relaxed"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
