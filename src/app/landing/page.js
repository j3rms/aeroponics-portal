"use client";
import Link from "next/link"; 
import { motion } from "framer-motion";
import { HeroButton } from "@/components/ui/herobutton";
import FeatureCard from "@/components/ui/featurecard";
import { Droplets, Sprout, Zap, Leaf, TrendingUp, Shield, ArrowRight, CheckCircle, Users, Award, BarChart3 } from "lucide-react";
import Image from "next/image";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                UrbanFarm
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-green-600 transition font-medium">Features</a>
              <a href="#benefits" className="text-gray-700 hover:text-green-600 transition font-medium">Benefits</a>
              <a href="#stats" className="text-gray-700 hover:text-green-600 transition font-medium">Impact</a>
              <Link href="/login" className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="inline-block px-4 py-2 bg-green-100 rounded-full mb-4"
              >
                <span className="text-green-700 font-semibold text-sm">🌱 The Future of Sustainable Farming</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight"
              >
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">
                  Grow Smarter,
                </span>
                <br />
                <span className="text-gray-900">Not Harder</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl sm:text-2xl text-gray-700 leading-relaxed max-w-2xl font-light"
              >
                Transform your farming with <span className="font-semibold text-green-600">cutting-edge aeroponics</span>.
                Grow healthier crops using <span className="font-semibold text-green-600">90% less water</span> in a
                completely soil-free environment.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex items-center space-x-6 text-sm text-gray-600"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>No soil needed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>3x faster growth</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Year-round harvest</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/signup" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
                  <span>Start Growing Today</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-700 border-2 border-green-600 rounded-xl hover:bg-green-50 transition-all font-semibold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
                  Sign In
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/images/aeroponics.jpg"
                  alt="Modern aeroponics farming system"
                  width={700}
                  height={500}
                  className="rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-600/30 to-transparent" />
              </div>

              {/* Floating stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">90%</div>
                  <div className="text-sm text-gray-600 font-medium">Less Water</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl p-6 shadow-xl"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">3x</div>
                  <div className="text-sm text-gray-600 font-medium">Faster Growth</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-green-200/40 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-48 w-48 rounded-full bg-emerald-300/30 blur-2xl" />
      </section>

      {/* Stats Section */}
      <section id="stats" className="px-4 py-16 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
            >
              <div className="text-5xl font-bold mb-2">90%</div>
              <div className="text-green-100 text-sm">Less Water Usage</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="text-5xl font-bold mb-2">3x</div>
              <div className="text-green-100 text-sm">Faster Growth Rate</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-5xl font-bold mb-2">50%</div>
              <div className="text-green-100 text-sm">Higher Yields</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-5xl font-bold mb-2">365</div>
              <div className="text-green-100 text-sm">Days of Harvest</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="px-4 py-20 bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              How It <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary technology that transforms how we grow food, combining nature and
              innovation for unprecedented results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Water-Efficient"
              description="Our system uses up to 90% less water than traditional farming methods, making it ideal for drought-prone areas and sustainable agriculture."
              icon={<Droplets className="h-8 w-8 text-white" />}
              delay={0}
            />
            <FeatureCard
              title="Soil-Free Growth"
              description="Plants grow in a nutrient-rich mist environment, promoting faster growth without soil contamination or the need for harmful pesticides."
              icon={<Sprout className="h-8 w-8 text-white" />}
              delay={1}
            />
            <FeatureCard
              title="Space Efficient"
              description="Vertical growing systems require minimal space compared to traditional farming, perfect for urban environments and maximum yield per square foot."
              icon={<Zap className="h-8 w-8 text-white" />}
              delay={2}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="px-4 py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">UrbanFarm</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover why leading agricultural innovators choose our aeroponics solutions for
              sustainable, high-yield farming.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="High Yields"
              description="Achieve 30-50% higher crop yields compared to traditional farming through optimized nutrient delivery and perfect growing conditions."
              icon={<TrendingUp className="h-8 w-8 text-white" />}
              delay={0}
            />
            <FeatureCard
              title="Sustainability"
              description="Reduce environmental impact with minimal water usage, zero soil erosion, and dramatically lower carbon footprint farming."
              icon={<Leaf className="h-8 w-8 text-white" />}
              delay={1}
            />
            <FeatureCard
              title="Pest Protection"
              description="Soil-free growing eliminates most pests and diseases naturally, reducing the need for chemical pesticides by up to 95%."
              icon={<Shield className="h-8 w-8 text-white" />}
              delay={2}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Join thousands of farmers who are already growing smarter with our aeroponics system.
              Start your journey to sustainable, high-yield farming today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="px-10 py-4 bg-white text-green-700 rounded-xl hover:bg-gray-100 transition-all shadow-lg font-semibold text-lg flex items-center justify-center space-x-2">
                  <span>Get Started Free</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <Link href="/login">
                <button className="px-10 py-4 bg-transparent text-white border-2 border-white rounded-xl hover:bg-white/10 transition-all font-semibold text-lg">
                  Sign In
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-8 w-8 text-green-500" />
                <span className="text-2xl font-bold text-white">UrbanFarm</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Revolutionizing agriculture with cutting-edge aeroponics technology for a sustainable future.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-green-500 transition">Features</a></li>
                <li><a href="#benefits" className="hover:text-green-500 transition">Benefits</a></li>
                <li><a href="#stats" className="hover:text-green-500 transition">Impact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Get Started</h3>
              <ul className="space-y-2">
                <li><Link href="/signup" className="hover:text-green-500 transition">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-green-500 transition">Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>&copy; 2025 UrbanFarm. All rights reserved. Growing a sustainable future together.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
