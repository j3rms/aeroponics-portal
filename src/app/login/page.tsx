"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Dummy credentials
    const dummyEmail = "user@example.com";
    const dummyPassword = "password123";

    if (email === dummyEmail && password === dummyPassword) {
      router.push("/dashboard");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex w-full max-w-4xl h-[600px] shadow-lg rounded-xl overflow-hidden bg-white"
      >
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="images/urbanfarm (2).png"
              alt="UrbanFarm Logo"
              className="h-20 w-auto"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-green-800 text-center">
            Login
          </h2>
          <p className="mt-2 text-center text-gray-600 text-sm">
            Enter your credentials to access your account.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600 focus:outline-none"
                placeholder="Enter your password"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full py-3 px-4 text-lg font-bold rounded-md text-white bg-green-700 hover:bg-green-800 transition"
            >
              Sign In
            </motion.button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/forgotpass">
              <span className="text-sm cursor-pointer font-medium text-green-700 hover:underline">
                Forgot Password?
              </span>
            </Link>
            <p className="mt-2 text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link href="/signup">
                <span className="font-medium cursor-pointer text-green-700 hover:underline">
                  Create one
                </span>
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="images/aeroponics.jpg" // replace with your own image path
            alt="Vertical Farming"
            className="h-full w-full object-cover"
          />
        </div>
      </motion.div>
    </div>
  );
}
