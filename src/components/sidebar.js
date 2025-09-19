'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  FileText,
  User,
  Info,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar({ username = "OG Diaz" }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    // 👉 Clear session/token if needed
    localStorage.clear();
    sessionStorage.clear();

    // 👉 Redirect to login page
    router.push("/login");
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-green-700 text-white p-2 rounded-lg shadow-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-green-700 text-white flex flex-col z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Brand / Logo */}
        <div className="flex items-center px-4 py-5 border-b border-green-600">
          <Link
            href="/dashboard"
            className="font-bold text-2xl tracking-wide"
            onClick={() => setIsOpen(false)}
          >
            🌱 UrbanFarm
          </Link>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-green-600">
          <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-200">Welcome,</p>
            <p className="font-semibold">{username}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 space-y-1 text-lg font-medium">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-3 hover:bg-green-600 transition"
          >
            <LayoutDashboard className="h-6 w-6" />
            <span className="ml-3">Dashboard</span>
          </Link>

          <Link
            href="/managetower"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-3 hover:bg-green-600 transition"
          >
            <Building2 className="h-6 w-6" />
            <span className="ml-3">Towers</span>
          </Link>

          <Link
            href="/logs"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-3 hover:bg-green-600 transition"
          >
            <FileText className="h-6 w-6" />
            <span className="ml-3">Logs</span>
          </Link>

          <Link
            href="/account"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-3 hover:bg-green-600 transition"
          >
            <User className="h-6 w-6" />
            <span className="ml-3">My Account</span>
          </Link>

          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-3 hover:bg-green-600 transition"
          >
            <Info className="h-6 w-6" />
            <span className="ml-3">About</span>
          </Link>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="px-4 py-4 border-t border-green-600">
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="flex items-center w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-2">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
