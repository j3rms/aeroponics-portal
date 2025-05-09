'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';

export default function Scheduling() {
  const [frequency, setFrequency] = useState<number | ''>('');
  const [time, setTime] = useState<string>('');

  const handleSubmit = () => {
    console.log({ frequency, time });
    alert('Schedule saved!');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 to-blue-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-hidden">
        <h1 className="text-4xl font-semibold text-green-800 mb-8">Watering Schedule</h1>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-green-200 max-w-xl space-y-6">
          {/* Frequency Input */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Frequency (times per day)
            </label>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="e.g. 2"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full p-4 border-2 border-green-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300 hide-arrows"
            />
          </div>
          
          {/* Time Input */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Watering Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-4 border-2 border-green-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white p-4 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
          >
            Save Schedule
          </button>
        </div>
      </main>
    </div>
  );
}
