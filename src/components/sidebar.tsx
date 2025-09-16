'use client';

import Link from "next/link";
import { LayoutDashboard, Building2, FileText, User, Info } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-green-700 text-white flex flex-col">
      {/* Brand / Logo */}
      <div className="flex items-center px-4 py-5 border-b border-green-600">
        <Link href="/dashboard" className="font-bold text-2xl tracking-wide">
          🌱 UrbanFarm
        </Link>
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
    </aside>
  );
}
