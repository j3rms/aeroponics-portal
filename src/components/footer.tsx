"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-green-700 text-white shadow-inner mt-10">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* Brand */}
        <div className="font-bold text-lg tracking-wide">
          🌱 UrbanFarm
        </div>

        {/* Footer Links */}
        <nav className="flex space-x-6 text-sm font-medium">
          <Link href="/about" className="hover:text-green-200 transition">
            About
          </Link>
          <Link href="/contact" className="hover:text-green-200 transition">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-green-200 transition">
            Privacy Policy
          </Link>
        </nav>

        {/* Copyright */}
        <div className="text-xs text-green-200">
          © {new Date().getFullYear()} UrbanFarm. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
