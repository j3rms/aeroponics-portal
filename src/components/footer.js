"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-transparent via-green-50/50 to-green-100/30 backdrop-blur-sm border-t border-green-200/30 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="pt-8 border-t border-green-200/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} UrbanFarm Aeroponics System. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <Link href="/terms" className="hover:text-green-700 transition">
                Terms of Service
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/privacy" className="hover:text-green-700 transition">
                Privacy Policy
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/cookies" className="hover:text-green-700 transition">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
