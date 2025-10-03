"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Sidebar from "@/components/sidebar";

export default function AboutPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [aboutData, setAboutData] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAboutAndFaqs();
  }, []);

  const fetchAboutAndFaqs = async () => {
    try {
      setLoading(true);
      
      // Fetch About data
      const aboutResponse = await fetch("/apis/getAbout");
      if (aboutResponse.ok) {
        const aboutJson = await aboutResponse.json();
        if (aboutJson.success && aboutJson.data) {
          setAboutData(aboutJson.data);
        }
      } else if (aboutResponse.status === 401) {
        setError("Please log in to view this content");
      }
      
      // Fetch FAQ data
      const faqResponse = await fetch("/apis/getFaq");
      if (faqResponse.ok) {
        const faqJson = await faqResponse.json();
        if (faqJson.success && faqJson.data) {
          setFaqs(faqJson.data);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
      setLoading(false);
    }
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-green-700 to-green-900 text-white shadow-xl">
        <Sidebar />
      </div>

      {/* Main Content */}
      <motion.div
        className="flex-1 p-10 overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-8">
            <p className="text-xl font-semibold">{error}</p>
            <button
              onClick={fetchAboutAndFaqs}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
              About
            </h1>

            {/* Dynamic About Content */}
            {aboutData.length > 0 ? (
              <div className="space-y-6 mb-8 max-w-3xl">
                {aboutData.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700 mb-8 leading-relaxed max-w-3xl">
                Our Aeroponics Monitoring and Management System is built to help
                automate, track, and optimize plant growth conditions. With seamless
                integration of IoT hardware, backend services, and a modern user
                dashboard, it provides real-time insights to improve efficiency and
                sustainability in agriculture.
              </p>
            )}

            {/* FAQ Section */}
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Frequently Asked Questions
            </h2>
            {faqs.length > 0 ? (
              <div className="space-y-4 max-w-3xl">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    className="border border-gray-200 rounded-2xl p-5 shadow-sm bg-white hover:shadow-md transition-all duration-300"
                    whileHover={{ scale: 1.01 }}
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <span className="font-medium text-gray-900 text-lg">
                        {faq.question}
                      </span>
                      {openIndex === index ? (
                        <ChevronUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-green-600" />
                      )}
                    </button>

                    {openIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 text-gray-600 leading-relaxed whitespace-pre-line"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No FAQs available at the moment.</p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}