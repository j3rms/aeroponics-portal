import { motion } from "framer-motion";
import React from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="rounded-2xl p-6 shadow-md bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-transform transform hover:-translate-y-2"
    >
      {/* ✅ Icon container like your screenshot */}
      <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-green-700 to-green-500">
        <div className="text-white">{icon}</div>
      </div>

      <h3 className="mt-4 text-xl font-semibold text-green-800">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
