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

  // Focus states (to show/hide eye icon only when focused)
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

  // Confirm password validation: true if passwords match and confirmPassword is not empty
  const isConfirmPasswordValid =
    formData.confirmPassword.length > 0 && formData.confirmPassword === formData.password;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-100 to-blue-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="shadow-lg rounded-xl p-8 w-full max-w-md backdrop-blur-xl bg-opacity-90 border border-gray-200"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 className="text-3xl font-extrabold text-center tracking-wide text-green-800 drop-shadow-md animate-pulse">
          Create an Account
        </h2>
        <p className="mt-4 text-center text-sm text-gray-600">
          Join us to get the best phone cases for your device.
        </p>

        {error && (
          <div className="mt-4 p-2 rounded-md bg-red-100 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                placeholder="Enter your first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                placeholder="Enter your last name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                placeholder="Enter your password"
              />
              {passwordFocused && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-3 top-9 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}

              {/* Password rules */}
              {formData.password.length > 0 && (
                <ul className="mt-2 text-sm space-y-1">
                  <li className={passwordValidation.lowercase ? "text-green-600" : "text-red-600"}>
                    {passwordValidation.lowercase ? "✔" : "✖"} At least one lowercase letter
                  </li>
                  <li className={passwordValidation.uppercase ? "text-green-600" : "text-red-600"}>
                    {passwordValidation.uppercase ? "✔" : "✖"} At least one uppercase letter
                  </li>
                  <li className={passwordValidation.number ? "text-green-600" : "text-red-600"}>
                    {passwordValidation.number ? "✔" : "✖"} At least one number
                  </li>
                  <li className={passwordValidation.specialChar ? "text-green-600" : "text-red-600"}>
                    {passwordValidation.specialChar ? "✔" : "✖"} At least one special character
                  </li>
                  <li className={passwordValidation.length ? "text-green-600" : "text-red-600"}>
                    {passwordValidation.length ? "✔" : "✖"} Minimum 8 characters
                  </li>
                </ul>
              )}
            </div>


            {/* Confirm Password */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                placeholder="Confirm your password"
              />
              {confirmFocused && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-3 top-9 text-gray-500"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}

              {/* Confirm password validation message */}
              {formData.confirmPassword.length > 0 && (
                <p
                  className={isConfirmPasswordValid ? "text-green-600" : "text-red-600"}
                  style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}
                >
                  {isConfirmPasswordValid ? "✔ Passwords match" : "✖ Passwords do not match"}
                </p>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-lg font-bold rounded-lg transition-all bg-green-700 text-white shadow-md hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: "#4A5568" }}>
            Already have an account?{" "}
            <Link href="/login">
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="text-sm cursor-pointer font-medium hover:underline text-green-700"
              >
                Login here
              </motion.span>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}