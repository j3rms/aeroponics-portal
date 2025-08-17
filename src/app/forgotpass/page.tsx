"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-100 to-blue-100"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="shadow-xl rounded-2xl p-8 w-full max-w-md backdrop-blur-md bg-white/90 border border-gray-300"
      >
        <h2 className="text-3xl font-extrabold text-center tracking-wide text-green-800 drop-shadow-md animate-pulse">
          Forgot Password?
        </h2>
        <p className="mt-4 text-center text-sm text-gray-600">
          Enter your email below, and we'll send you a reset link.
        </p>

        <form className="mt-6 space-y-6" action="#" method="POST">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 px-4 text-lg font-bold rounded-lg transition-all bg-green-700 text-white shadow-md hover:bg-green-800"
          >
            Send Reset Link
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login">
            <motion.span 
              whileHover={{ scale: 1.1 }}
              className="text-sm cursor-pointer font-medium hover:underline text-green-700"
            >
              Back to Login
            </motion.span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}