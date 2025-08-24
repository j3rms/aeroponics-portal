'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Leaf,
  Activity,
  LogOut,
  Clock,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    router.push('/landing');
  };

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/createtower', icon: PlusCircle, label: 'Create Tower' },
    { href: '/addplants', icon: Leaf, label: 'Add Plants' },
    { href: '/scheduling', icon: Clock, label: 'Scheduling' }
  ];

  return (
    <div className={`flex flex-col ${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-green-600 to-green-400 text-white min-h-screen p-4 shadow-lg transition-all duration-300`}>
      
      {/* Top Section with Logo and Toggle */}
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <h2 className="text-2xl font-bold text-green-100">Aeroponics</h2>
        )}
        <button onClick={toggleSidebar} className="text-white">
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <ul className="flex flex-col space-y-4 flex-grow">
        {navItems.map(({ href, icon: Icon, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-green-500 transition duration-200"
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="text-lg">{label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-4 p-3 rounded-lg hover:bg-green-500 transition duration-200 mt-4"
      >
        <LogOut className="w-5 h-5" />
        {!collapsed && <span className="text-lg">Logout</span>}
      </button>
    </div>
  );
}
