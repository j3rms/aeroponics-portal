"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; // added for password show/hide

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // state to toggle password
  const [errorMessage, setErrorMessage] = useState(""); // state for error messages

  const handleSubmit = async (e) => {
      e.preventDefault();
      setErrorMessage(""); // Clear any previous error messages
      toast.loading("Signing in...");
      setIsDisabled(true);
  
      const formData = new FormData(e.target);
      const user = {
        email: formData.get("email"),
        password: formData.get("password"),
      };
  
      try {
        const response = await fetch("/apis/signIn", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });
  
        const result = await response.json();
        toast.remove();
  
        if (response.ok && result.success) {
          document.cookie = `user=${JSON.stringify(result.user)}; path=/; max-age=3600`;
          toast.success("Signed in successfully!");
          router.push("/homepage/dashboard");
        } else {
          // Handle login failure
          const errorMsg = result.message === "Unauthorized" || !response.ok
            ? "Login failed! Invalid email or password. Please try again."
            : result.message || "Login failed! Please try again.";
          
          setErrorMessage(errorMsg);
          setIsDisabled(false);
          toast.error(errorMsg);
        }
      } catch (error) {
        setIsDisabled(false);
        console.error("Error:", error);
        const errorMsg = "Login failed! Please check your connection and try again.";
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
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

          {/* Error Message Display */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            </div>
          )}

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
                name="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-600 focus:outline-none pr-10"
                placeholder="Enter your password"
              />
              {/* Show/Hide Icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
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