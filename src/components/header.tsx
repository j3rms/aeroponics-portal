"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, User, Menu, X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-green-700 text-white shadow-md relative">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo / Brand - now links to dashboard */}
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard"
            className="font-bold text-xl tracking-wide hover:text-green-200 transition"
          >
            🌱 UrbanFarm
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <Link href="/createtower" className="hover:text-green-200 transition">
            Create Tower
          </Link>
          <Link href="/managetower" className="hover:text-green-200 transition">
            Manage Tower
          </Link>
          <Link href="/manageplant" className="hover:text-green-200 transition">
            Manage Plant
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4 relative">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative hover:text-green-200 transition"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden z-20">
                <div className="p-3 font-semibold text-green-700 border-b">
                  Notifications
                </div>
                <ul className="max-h-60 overflow-y-auto text-sm">
                  {/* Sample notifications */}
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    🌱 Tower 1 watering schedule updated
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    ⚠️ Plant in Tower 3 needs attention
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    ✅ New tower created successfully
                  </li>
                </ul>
                <div className="px-4 py-2 text-center text-sm text-green-700 hover:bg-gray-100 cursor-pointer">
                  View all
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="hover:text-green-200 transition"
              aria-label="User Profile"
            >
              <User className="h-5 w-5" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-lg shadow-lg z-20">
                <ul className="text-sm">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Profile
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Settings
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden hover:text-green-200 transition"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="md:hidden bg-green-600 px-6 py-4 space-y-3 text-sm font-medium">
          <Link href="/managetower" className="block hover:text-green-200">
            Manage Tower
          </Link>
          <Link href="/manageplant" className="block hover:text-green-200">
            Manage Plant
          </Link>
          <Link href="/createtower" className="block hover:text-green-200">
            Create Tower
          </Link>
        </nav>
      )}
    </header>
  );
}
