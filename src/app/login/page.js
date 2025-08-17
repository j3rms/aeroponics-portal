"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function Login() {
  const router = useRouter();
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.loading("Signing you up...");
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

      if (response.ok) {
        // document.cookie = `user=${JSON.stringify(result.user)}; path=/; max-age=3600`
        toast.success("Signed in successfully!");
      }

      toast.remove();
      if (result.success) {
        toast.success("Signed in successfully!");

        router.push("/dashboard");
      } else {
        // toast.success(
        //   result.message === "Unauthorized"
        //     ? "Incorrect email address or password. Please try again."
        //     : result.message
        // );
        setIsDisabled(false);

        toast.error(
          result.message === "Unauthorized"
            ? "Incorrect email address or password. Please try again."
            : result.message
        );
      }
    } catch (error) {
      setIsDisabled(false);
      console.error("Error:", error);
      toast.error("An error occurred while signing in.");
    }
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  
  //   // Dummy credentials
  //   const dummyEmail = "user@example.com";
  //   const dummyPassword = "password123";
  
  //   if (email === dummyEmail && password === dummyPassword) {
  //     router.push("/dashboard");
  //   } else {
  //     alert("Invalid email or password");
  //   }
  // };
  
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-100 to-blue-100"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="shadow-lg rounded-xl p-8 w-full max-w-md backdrop-blur-xl bg-opacity-90 border border-gray-200"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 className="text-3xl font-extrabold text-center tracking-wide text-green-800 drop-shadow-md animate-pulse">
          Login
        </h2>
        <p className="mt-4 text-center text-sm text-gray-600">
          Enter your credentials to access your account.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              // value={email}
              // onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-600 focus:outline-none transition-all"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              // value={password}
              // onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-600 focus:outline-none transition-all"
              placeholder="Enter your password"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 px-4 text-lg font-bold rounded-lg text-white bg-green-700 hover:bg-green-800 transition-all"
            disabled={isDisabled}
          >
            Sign In
          </motion.button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/forgotpass">
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="text-sm cursor-pointer font-medium text-green-700 hover:underline"
            >
              Forgot Password?
            </motion.span>
          </Link>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account? {" "}
            <Link href="/signup">
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="font-medium cursor-pointer text-green-700 hover:underline"
              >
                Create one
              </motion.span>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}