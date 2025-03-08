'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:8080/api/user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
  
      if (response.ok) {
        router.push("/dashboard"); // Redirect to the home page after successful login
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-red-800">Login</h2>
        <p className="mt-4 font-medium text-center text-gray-600">Sign in to your account to access the dashboard.</p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-800 focus:border-red-800 sm:text-sm"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-800 focus:border-red-800 sm:text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-red-800 text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-800"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link href="/forgotpass">
            <span className="text-sm text-red-800 hover:underline">Forgot Password?</span>
          </Link>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup">
              <span className="text-red-800 hover:underline">Create one</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}