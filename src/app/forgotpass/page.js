"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Mail, ArrowLeft, Send, Leaf } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    toast.loading("Sending OTP to your email...", {
      position: "top-center",
      style: {
        background: '#fff',
        color: '#374151',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    });
    setIsDisabled(true);

    try {
      const response = await fetch("/apis/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      toast.remove();

      if (response.ok && result.success) {
        setSuccessMessage("OTP has been sent to your email! Please check your inbox.");
        toast.success("OTP sent successfully!", {
          duration: 3000,
          position: "top-center",
          style: {
            background: '#10b981',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          icon: '✓',
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
          },
        });
        
        // Store email in localStorage for the reset password page
        localStorage.setItem('resetPasswordEmail', email);
        
        // Redirect to OTP verification page after 2 seconds
        setTimeout(() => {
          window.location.href = '/reset-password';
        }, 2000);
      } else {
        const errorMsg = result.message || "Failed to send OTP. Please check your email and try again.";
        setErrorMessage(errorMsg);
        toast.error(errorMsg, {
          duration: 4000,
          position: "top-center",
          style: {
            background: '#ef4444',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        });
      }
    } catch (error) {
      toast.remove();
      console.error("Error:", error);
      const errorMsg = "Network error. Please check your connection and try again.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg, {
        duration: 4000,
        position: "top-center",
        style: {
          background: '#ef4444',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      });
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-5xl min-h-[650px] shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-green-100 relative z-10"
      >
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <img
              src="images/urbanfarm (2).png"
              alt="UrbanFarm Logo"
              className="h-24 w-auto"
            />
          </motion.div>
          
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold leading-tight overflow-visible mb-2 pb-1 bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                Forgot Password?
            </h2>

            <p className="text-gray-600 text-base">
              Enter your email address and we'll send you a reset link
            </p>
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl"
            >
              <p className="text-sm text-red-700 text-center font-medium">{errorMessage}</p>
            </motion.div>
          )}

          {/* Success Message Display */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-xl"
            >
              <p className="text-sm text-green-700 text-center font-medium">{successMessage}</p>
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
              >
                <Mail className="w-4 h-4 text-green-600" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                placeholder="your.email@example.com"
              />
            </div>

            <motion.button
              whileHover={{ scale: isDisabled ? 1 : 1.02 }}
              whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              type="submit"
              disabled={isDisabled}
              className="w-full py-4 px-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isDisabled ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Please wait for a moment...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send OTP code
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link href="/login">
                <span className="text-sm cursor-pointer font-semibold text-green-700 hover:text-green-800 transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </span>
              </Link>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">or</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup">
                  <span className="font-bold cursor-pointer text-green-700 hover:text-green-800 transition-colors">
                    Create Account
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block md:w-1/2 relative overflow-hidden">
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