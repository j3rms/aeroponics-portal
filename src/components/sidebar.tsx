'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Building2, FileText, User, Info, LogOut } from "lucide-react";

export default function Sidebar({ username = "User" }: { username?: string }) {
  const router = useRouter();

  const handleLogout = () => {
    // 👉 Clear any stored session/token if needed
    localStorage.clear(); 
    sessionStorage.clear();

    // 👉 Redirect to login page
    router.push("/login");
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-green-700 text-white flex flex-col z-40">
      {/* Brand / Logo */}
      <div className="flex items-center px-4 py-5 border-b border-green-600">
        <Link href="/dashboard" className="font-bold text-2xl tracking-wide">
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
          className="flex items-center px-4 py-3 hover:bg-green-600 transition"
        >
          <LayoutDashboard className="h-6 w-6" />
          <span className="ml-3">Dashboard</span>
        </Link>

        <Link
          href="/managetower"
          className="flex items-center px-4 py-3 hover:bg-green-600 transition"
        >
          <Building2 className="h-6 w-6" />
          <span className="ml-3">Towers</span>
        </Link>

        <Link
          href="/logs"
          className="flex items-center px-4 py-3 hover:bg-green-600 transition"
        >
          <FileText className="h-6 w-6" />
          <span className="ml-3">Logs</span>
        </Link>

        <Link
          href="/account"
          className="flex items-center px-4 py-3 hover:bg-green-600 transition"
        >
          <User className="h-6 w-6" />
          <span className="ml-3">My Account</span>
        </Link>

        <Link
          href="/about"
          className="flex items-center px-4 py-3 hover:bg-green-600 transition"
        >
          <Info className="h-6 w-6" />
          <span className="ml-3">About</span>
        </Link>
      </nav>

      {/* Logout Button at Bottom */}
      <div className="px-4 py-4 border-t border-green-600">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition"
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-2">Logout</span>
        </button>
      </div>
    </aside>
  );
}
