"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Lock, Eye, EyeOff, Shield, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  useEffect(() => {
    // Get email from localStorage if available
    const storedEmail = localStorage.getItem('resetPasswordEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Check if OTP is complete (all 6 digits filled)
  const isOtpComplete = otpCode.every(digit => digit !== "");

  // Password validation (same as signup)
  const passwordValidation = {
    length: newPassword.length >= 8,
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    number: /\d/.test(newPassword),
    specialChar: /[^a-zA-Z0-9\-\/]/.test(newPassword),
  };

  const isConfirmPasswordValid =
    confirmPassword.length > 0 &&
    confirmPassword === newPassword;

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      const errorMsg = "Passwords do not match";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate password strength (same as signup)
    if (!Object.values(passwordValidation).every(Boolean)) {
      const errorMsg = "Password does not meet all requirements";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      return;
    }

    toast.loading("Resetting your password...", {
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
      const response = await fetch("/apis/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
          confirmPassword,
          otpCode: otpCode.join("")
        }),
      });

      const result = await response.json();
      toast.remove();

      if (response.ok && result.success) {
        setSuccessMessage("Password reset successfully! You can now login with your new password.");
        toast.success("Password reset successfully!", {
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
        
        // Clear stored email
        localStorage.removeItem('resetPasswordEmail');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        const errorMsg = result.message || "Failed to reset password. Please check your OTP and try again.";
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
        className="flex w-full max-w-4xl min-h-[580px] shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-green-100 relative z-10"
      >
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <img
              src="images/urbanfarm (2).png"
              alt="UrbanFarm Logo"
              className="h-20 w-auto"
            />
          </motion.div>
          
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-2">
              Reset Password
            </h2>
            <p className="text-gray-600 text-base">
              Enter the OTP sent to your email and set a new password
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* OTP Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Shield className="w-4 h-4 text-green-600" />
                OTP Code
              </label>
              <div className="flex justify-center gap-2 mb-2">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    pattern="[0-9]"
                    inputMode="numeric"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center">Enter the 6-digit code sent to your email</p>
            </div>

            {/* New Password Field */}
            <div className="relative">
              <label
                htmlFor="newPassword"
                className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                  isOtpComplete ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                <Lock className={`w-4 h-4 ${isOtpComplete ? 'text-green-600' : 'text-gray-400'}`} />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  id="newPassword"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  disabled={!isOtpComplete}
                  className={`block w-full px-4 py-2.5 border-2 rounded-xl shadow-sm transition-all pr-12 font-medium ${
                    isOtpComplete
                      ? 'border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                  placeholder={isOtpComplete ? "Create a strong password" : "Complete OTP first"}
                  minLength="8"
                />
                {passwordFocused && isOtpComplete && (
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>
              {newPassword.length > 0 && isOtpComplete && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${
                    passwordValidation.lowercase ? "text-green-600" : "text-gray-400"
                  }`}>
                    {passwordValidation.lowercase ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span className="font-medium">Lowercase</span>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    passwordValidation.uppercase ? "text-green-600" : "text-gray-400"
                  }`}>
                    {passwordValidation.uppercase ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span className="font-medium">Uppercase</span>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    passwordValidation.number ? "text-green-600" : "text-gray-400"
                  }`}>
                    {passwordValidation.number ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span className="font-medium">Number</span>
                  </div>
                  <div className={`flex items-center gap-1 ${
                    passwordValidation.specialChar ? "text-green-600" : "text-gray-400"
                  }`}>
                    {passwordValidation.specialChar ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span className="font-medium">Special char</span>
                  </div>
                  <div className={`flex items-center gap-1 col-span-2 ${
                    passwordValidation.length ? "text-green-600" : "text-gray-400"
                  }`}>
                    {passwordValidation.length ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span className="font-medium">Min 8 characters</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className={`flex items-center gap-2 text-sm font-semibold mb-2 ${
                  isOtpComplete ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                <Lock className={`w-4 h-4 ${isOtpComplete ? 'text-green-600' : 'text-gray-400'}`} />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  disabled={!isOtpComplete}
                  className={`block w-full px-4 py-2.5 border-2 rounded-xl shadow-sm transition-all pr-12 font-medium ${
                    isOtpComplete
                      ? 'border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                  placeholder={isOtpComplete ? "Confirm your password" : "Complete OTP first"}
                  minLength="8"
                />
                {confirmFocused && isOtpComplete && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>
              {confirmPassword.length > 0 && isOtpComplete && (
                <p className={`mt-2 text-sm font-medium flex items-center gap-1 ${
                  isConfirmPasswordValid ? "text-green-600" : "text-red-600"
                }`}>
                  {isConfirmPasswordValid ? (
                    <><CheckCircle className="w-4 h-4" /> Passwords match</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> Passwords do not match</>
                  )}
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: isDisabled ? 1 : 1.02 }}
              whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              type="submit"
              disabled={isDisabled}
              className="w-full py-3 px-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-5"
            >
              {isDisabled ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-5 space-y-3">
            <div className="text-center">
              <Link href="/forgotpass">
                <span className="text-sm cursor-pointer font-semibold text-green-700 hover:text-green-800 transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Forgot Password
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
                Remember your password?{" "}
                <Link href="/login">
                  <span className="font-bold cursor-pointer text-green-700 hover:text-green-800 transition-colors">
                    Sign In
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
