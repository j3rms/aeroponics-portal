"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, UserPlus, CheckCircle, XCircle, Shield, ArrowRight } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-hot-toast";

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // OTP flow states
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP verification
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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
    // Clear field-specific error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  // Handle OTP input change
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

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Check if OTP is complete
  const isOtpComplete = otpCode.every(digit => digit !== "");

  // Format seconds to mm:ss (e.g., 5:00)
  const formatTime = (totalSeconds) => {
    const m = Math.floor((totalSeconds || 0) / 60);
    const s = Math.max(0, (totalSeconds || 0) % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(300);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    // Client-side validation
    const errors = {};
    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!Object.values(passwordValidation).every(Boolean)) {
      errors.password = "Password does not meet all requirements";
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors below");
      setLoading(false);
      return;
    }

    toast.loading("Sending OTP to your email...");

    try {
      const response = await fetch("/apis/sendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      toast.dismiss();

      if (!response.ok) {
        const errorMsg = data.message || "Failed to send OTP. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Success - move to OTP step
      toast.success("OTP sent to your email!");
      setOtpSent(true);
      setStep(2);
      startResendTimer();
      setLoading(false);
    } catch (err) {
      console.error("Send OTP error:", err);
      toast.dismiss();
      const errorMsg = "Network error. Please check your connection and try again.";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setError("");
    toast.loading("Resending OTP...");

    try {
      const response = await fetch("/apis/sendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      toast.dismiss();

      if (!response.ok) {
        const errorMsg = data.message || "Failed to resend OTP. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success("OTP resent to your email!");
      setOtpCode(["", "", "", "", "", ""]);
      startResendTimer();
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.dismiss();
      const errorMsg = "Network error. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Verify OTP and create account
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isOtpComplete) {
      setError("Please enter the complete OTP code");
      setLoading(false);
      return;
    }

    toast.loading("Verifying OTP and creating your account...");

    try {
      const response = await fetch("/apis/verifyOtpRegister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.first_name,
          lastName: formData.last_name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          otpCode: otpCode.join("")
        }),
      });

      const data = await response.json();
      toast.dismiss();

      if (!response.ok) {
        const errorMsg = data.message || "Failed to verify OTP or create account. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Success - store token if provided and redirect to dashboard
      if (data.token || data.data?.token) {
        // Store authentication token in localStorage
        const token = data.token || data.data?.token;
        localStorage.setItem('authToken', token);
        
        // If user data is provided, store it as well
        if (data.user || data.data?.user) {
          const userData = data.user || data.data?.user;
          localStorage.setItem('userData', JSON.stringify(userData));
        }
      }
      
      toast.success("Account created successfully! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/homepage/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Verify OTP error:", err);
      toast.dismiss();
      const errorMsg = "Network error. Please check your connection and try again.";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-5xl min-h-[700px] shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-green-100 relative z-10"
      >
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center overflow-y-auto">
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
              {step === 1 ? "Create Account" : "Verify Email"}
            </h2>
            <p className="text-gray-600 text-base">
              {step === 1 
                ? "Join us to manage your aeroponics system" 
                : `Enter the OTP sent to ${formData.email}`}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl"
            >
              <div className="font-semibold text-red-700">{error}</div>
              {Object.keys(fieldErrors).length > 0 && (
                <ul className="mt-2 ml-4 list-disc text-xs text-red-600">
                  {Object.entries(fieldErrors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {step === 1 ? (
            <form className="space-y-4" onSubmit={handleSendOtp}>
            {/* First + Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
                >
                  <User className="w-4 h-4 text-green-600" />
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:ring-2 transition-all font-medium ${
                    fieldErrors.first_name
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                  }`}
                  placeholder="John"
                />
                {fieldErrors.first_name && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.first_name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
                >
                  <User className="w-4 h-4 text-green-600" />
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:ring-2 transition-all font-medium ${
                    fieldErrors.last_name
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                  }`}
                  placeholder="Doe"
                />
                {fieldErrors.last_name && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.last_name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
              >
                <Mail className="w-4 h-4 text-green-600" />
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:ring-2 transition-all font-medium ${
                  fieldErrors.email
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                }`}
                placeholder="your.email@example.com"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
              >
                <Lock className="w-4 h-4 text-green-600" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:ring-2 transition-all pr-12 font-medium ${
                    fieldErrors.password
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                  }`}
                  placeholder="Create a strong password"
                />
                {passwordFocused && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>
              {formData.password.length > 0 && (
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
              >
                <Lock className="w-4 h-4 text-green-600" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:ring-2 transition-all pr-12 font-medium ${
                    fieldErrors.confirmPassword
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200 focus:ring-green-500 focus:border-green-500"
                  }`}
                  placeholder="Confirm your password"
                />
                {confirmFocused && (
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
              {formData.confirmPassword.length > 0 && (
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

            {/* Submit */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  Continue to Verification
                </>
              )}
            </motion.button>
          </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyAndRegister}>
              {/* OTP Input */}
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

              {/* Resend OTP */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend OTP in <span className="font-bold text-green-600">{formatTime(resendTimer)}</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Submit OTP */}
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                type="submit"
                disabled={loading || !isOtpComplete}
                className="w-full py-4 px-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </motion.button>

              {/* Back button */}
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpCode(["", "", "", "", "", ""]);
                  setError("");
                }}
                className="w-full text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded"
              >
                ← Back to form
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login">
                <span className="font-bold cursor-pointer text-green-700 hover:text-green-800 transition-colors">
                  Sign In
                </span>
              </Link>
            </p>
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
