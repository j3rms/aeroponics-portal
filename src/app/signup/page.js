"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Eye toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Focus states
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  // Password validation
  const passwordValidation = {
    length: formData.password.length >= 8,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    specialChar: /[^a-zA-Z0-9\-\/]/.test(formData.password),
  };

  const isConfirmPasswordValid =
    formData.confirmPassword.length > 0 &&
    formData.confirmPassword === formData.password;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create account");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch (err) {
      setError("Signup failed. Please try again.");
      setLoading(false);
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
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center overflow-y-auto">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="images/urbanfarm (2).png"
              alt="UrbanFarm Logo"
              className="h-20 w-auto"
            />
          </div>

          <h2 className="text-3xl font-extrabold text-green-800 text-center">
            Sign Up
          </h2>
          <p className="mt-2 text-center text-gray-600 text-sm">
            Create your account to get started.
          </p>

          {error && (
            <div className="mt-4 p-2 rounded-md bg-red-100 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
            {/* First + Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600 focus:outline-none"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600 focus:outline-none"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600 focus:outline-none pr-10"
                placeholder="Enter your password"
              />
              {passwordFocused && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
              {formData.password.length > 0 && (
                <ul className="mt-2 text-sm space-y-1">
                  <li
                    className={
                      passwordValidation.lowercase
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {passwordValidation.lowercase ? "✔" : "✖"} One lowercase
                    letter
                  </li>
                  <li
                    className={
                      passwordValidation.uppercase
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {passwordValidation.uppercase ? "✔" : "✖"} One uppercase
                    letter
                  </li>
                  <li
                    className={
                      passwordValidation.number
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {passwordValidation.number ? "✔" : "✖"} One number
                  </li>
                  <li
                    className={
                      passwordValidation.specialChar
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {passwordValidation.specialChar ? "✔" : "✖"} One special
                    character
                  </li>
                  <li
                    className={
                      passwordValidation.length
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {passwordValidation.length ? "✔" : "✖"} Min 8 characters
                  </li>
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600 focus:outline-none pr-10"
                placeholder="Confirm your password"
              />
              {confirmFocused && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              )}
              {formData.confirmPassword.length > 0 && (
                <p
                  className={
                    isConfirmPasswordValid ? "text-green-600" : "text-red-600"
                  }
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {isConfirmPasswordValid
                    ? "✔ Passwords match"
                    : "✖ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-lg font-bold rounded-md text-white bg-green-700 hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </motion.button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login">
                <span className="font-medium cursor-pointer text-green-700 hover:underline">
                  Login here
                </span>
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="images/aeroponics.jpg"
            alt="Vertical Farming"
            className="h-full w-full object-cover"
          />
        </div>
      </motion.div>
    </div>
  );
}
