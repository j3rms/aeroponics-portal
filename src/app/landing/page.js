"use client";
import Link from "next/link"; 
import { motion } from "framer-motion";
import { HeroButton } from "@/components/ui/herobutton";
import FeatureCard from "@/components/ui/featurecard";
import { Droplets, Sprout, Zap, Leaf, TrendingUp, Shield } from "lucide-react";
import Image from "next/image";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight 
                           bg-gradient-to-r from-green-500 to-emerald-600 
                           bg-clip-text text-transparent"
              >
                Revolutionizing Farming with Aeroponics
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl"
              >
                Experience the future of sustainable agriculture with our cutting-edge aeroponics
                system. Grow healthier crops using 90% less water in a completely soil-free
                environment.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/login">
                  <HeroButton
                    variant="primary"
                    size="lg"
                    className="group bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                               hover:from-green-600 hover:to-emerald-700 
                               px-10 min-w-[260px]"
                  >
                    Get Started Today
                  </HeroButton>
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
              <div className="relative overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src="/images/aeroponics.jpg"
                  alt="Modern aeroponics farming system"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent" />
              </div>

              {/* Floating stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md animate-float"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">90%</div>
                  <div className="text-sm text-gray-500">Less Water</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute -top-6 -right-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md animate-float"
                style={{ animationDelay: "2s" }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">3x</div>
                  <div className="text-sm text-gray-500">Faster Growth</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-green-200/40 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 h-48 w-48 rounded-full bg-emerald-300/30 blur-2xl animate-pulse" />
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-20 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700 mb-6">
              How Our Aeroponics System Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
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

      {/* Features Section */}
      <section className="px-4 py-20 bg-green-50">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700 mb-6">
              Key Features & Benefits
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
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
    </div>
  );
};

export default LandingPage;
