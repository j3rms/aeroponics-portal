'use client';

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  FileText,
  User,
  Info,
  LogOut,
  Menu,
  X,
  Leaf,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Helper function to check if link is active
  const isActive = (path) => pathname === path;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/apis/getCurrentUser');
        const result = await response.json();
        
        if (result.success && result.data) {
          const fullName = `${result.data.firstName} ${result.data.lastName}`;
          setUserName(fullName);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchProfilePicture();

    const onFocus = () => { fetchProfilePicture(); };
    const onProfileUpdated = () => { fetchProfilePicture(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('profile-picture-updated', onProfileUpdated);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('profile-picture-updated', onProfileUpdated);
      if (avatarUrl) { try { URL.revokeObjectURL(avatarUrl); } catch {} }
    };
  }, []);

  const getAuthHeaders = () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  };

  const fetchProfilePicture = async () => {
    try {
      const res = await fetch('/apis/profilePicture', {
        method: 'GET',
        headers: { ...getAuthHeaders() },
      });
      if (res.ok) {
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        setAvatarUrl((prev) => {
          if (prev) {
            try { URL.revokeObjectURL(prev); } catch {}
          }
          return objectUrl;
        });
      } else if (res.status === 404) {
        setAvatarUrl((prev) => {
          if (prev) {
            try { URL.revokeObjectURL(prev); } catch {}
          }
          return null;
        });
      }
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear session cookie
      const response = await fetch('/apis/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Clear local storage and session storage
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to login page
        router.push("/login");
      } else {
        console.error('Logout failed');
        // Still redirect even if API fails
        localStorage.clear();
        sessionStorage.clear();
        router.push("/login");
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect even if error occurs
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login");
    }
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-br from-green-600 to-green-700 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-green-700 via-green-800 to-green-900 text-white flex flex-col z-40 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-green-600/30">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Leaf className="h-6 w-6 text-green-300" />
          </div>
          <Link
            href="/homepage/dashboard"
            className="font-bold text-2xl tracking-tight hover:text-green-200 transition"
            onClick={() => setIsOpen(false)}
          >
            UrbanFarm
          </Link>
        </div>

        {/* User Profile */}
        <div className="mx-4 my-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
              />
            ) : (
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full ring-2 ring-white/20">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-200 font-medium">Welcome back</p>
              {loading ? (
                <div className="h-5 w-28 bg-white/20 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="font-semibold text-white truncate">{userName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <Link
            href="/homepage/dashboard"
            onClick={() => setIsOpen(false)}
            className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive('/homepage/dashboard')
                ? 'bg-white/15 text-white shadow-lg'
                : 'text-green-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </div>
            {isActive('/homepage/dashboard') && (
              <ChevronRight className="h-4 w-4" />
            )}
          </Link>

          <Link
            href="/homepage/managetower"
            onClick={() => setIsOpen(false)}
            className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive('/homepage/managetower')
                ? 'bg-white/15 text-white shadow-lg'
                : 'text-green-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5" />
              <span className="font-medium">Towers</span>
            </div>
            {isActive('/homepage/managetower') && (
              <ChevronRight className="h-4 w-4" />
            )}
          </Link>

          <Link
            href="/homepage/logs"
            onClick={() => setIsOpen(false)}
            className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive('/homepage/logs')
                ? 'bg-white/15 text-white shadow-lg'
                : 'text-green-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Logs</span>
            </div>
            {isActive('/homepage/logs') && (
              <ChevronRight className="h-4 w-4" />
            )}
          </Link>

          <Link
            href="/homepage/account"
            onClick={() => setIsOpen(false)}
            className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive('/homepage/account')
                ? 'bg-white/15 text-white shadow-lg'
                : 'text-green-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5" />
              <span className="font-medium">My Account</span>
            </div>
            {isActive('/homepage/account') && (
              <ChevronRight className="h-4 w-4" />
            )}
          </Link>

          <Link
            href="/homepage/about"
            onClick={() => setIsOpen(false)}
            className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive('/homepage/about')
                ? 'bg-white/15 text-white shadow-lg'
                : 'text-green-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5" />
              <span className="font-medium">About</span>
            </div>
            {isActive('/homepage/about') && (
              <ChevronRight className="h-4 w-4" />
            )}
          </Link>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
