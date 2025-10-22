"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader2, Info, HelpCircle, RefreshCw, Sparkles, Leaf } from "lucide-react";
import Footer from "@/components/footer";
import withAuth from "@/components/withAuth";

function AboutPage() {
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
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 md:pl-64 overflow-x-hidden">
      {/* Sidebar */}
      

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 max-w-3xl md:max-w-7xl mx-auto w-full px-4 md:px-10 py-8 md:py-12">
          {/* Header with decorative elements */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-12 relative overflow-hidden"
          >
            {/* Decorative background */}
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-green-200/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-start md:text-left gap-4 mb-4">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Leaf className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  About UrbanFarm
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <p className="text-gray-600 text-base md:text-lg">
                    Revolutionizing urban agriculture with smart technology
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-16 h-16 text-green-600 animate-spin mb-4" />
              <p className="text-gray-600 text-lg">Loading content...</p>
            </div>
          ) : error ? (
            /* Error State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-md border border-red-200 p-8 text-center max-w-2xl mx-auto"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Content</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchAboutAndFaqs}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-5 h-5" />
                Retry
              </button>
            </motion.div>
          ) : (
            <>
              {/* About Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-16"
              >
                {aboutData.length > 0 ? (
                  <div className="grid gap-6">
                    {aboutData.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-green-100 p-8 hover:shadow-2xl hover:border-green-200 transition-all duration-300 overflow-hidden"
                      >
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                        
                        <div className="relative flex items-start gap-5">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Info className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-green-700 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                              {item.content}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  /* Default About Content */
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-green-100 p-8 hover:shadow-2xl hover:border-green-200 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                    
                    <div className="relative flex items-start gap-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Info className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-green-700 transition-colors">
                          Our Mission
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          Our Aeroponics Monitoring and Management System is built to help
                          automate, track, and optimize plant growth conditions. With seamless
                          integration of IoT hardware, backend services, and a modern user
                          dashboard, it provides real-time insights to improve efficiency and
                          sustainability in agriculture.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* FAQ Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <HelpCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                      Frequently Asked Questions
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Find answers to common questions</p>
                  </div>
                </div>

                {faqs.length > 0 ? (
                  <div className="grid gap-4">
                    {faqs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group bg-white/80 backdrop-blur-sm border border-green-100 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(index)}
                          className="w-full flex justify-between items-center text-left p-6 gap-4 hover:bg-green-50/50 transition-colors"
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <span className="font-semibold text-gray-800 text-lg group-hover:text-green-700 transition-colors">
                              {faq.question}
                            </span>
                          </div>
                          <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center transition-all duration-300 ${
                            openIndex === index ? 'rotate-180 bg-gradient-to-br from-green-500 to-emerald-600' : ''
                          }`}>
                            <ChevronDown className={`w-5 h-5 transition-colors ${
                              openIndex === index ? 'text-white' : 'text-green-600'
                            }`} />
                          </div>
                        </button>

                        <AnimatePresence>
                          {openIndex === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6">
                                <div className="pt-4 border-t border-green-100 bg-gradient-to-br from-green-50/30 to-emerald-50/30 rounded-xl p-4">
                                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                                    {faq.answer}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-green-100 p-12 text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HelpCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No FAQs available at the moment.</p>
                    <p className="text-gray-400 text-sm mt-2">Check back later for updates</p>
                  </motion.div>
                )}
              </motion.div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default withAuth(AboutPage);