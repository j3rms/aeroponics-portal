'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Leaf,
  Activity,
  LogOut,
  Clock
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/landing'); // Redirect to Welcome page
  };

  return (
    <div className="flex flex-col w-64 bg-gradient-to-b from-green-600 to-green-400 text-white flex-min-h-screen p-6 shadow-lg justify-between">
      <div>
        <h2 className="text-3xl font-bold mb-8 text-center text-green-100">Aeroponics</h2>

        <ul className="flex flex-col space-y-6">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-green-500 transition duration-200"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-lg">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/createtower"
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-green-500 transition duration-200"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-lg">Create Tower</span>
            </Link>
          </li>
          <li>
            <Link
              href="/addplants"
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-green-500 transition duration-200"
            >
              <Leaf className="w-5 h-5" />
              <span className="text-lg">Add Plants</span>
            </Link>
          </li>
          <li>
          <Link
              href="/scheduling"
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-green-500 transition duration-200"
            >
              <Clock className="w-5 h-5" />
              <span className="text-lg">Scheduling</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-4 p-3 rounded-lg hover:bg-green-500 transition duration-200 mt-8"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-lg">Logout</span>
      </button>
    </div>
  );
}
