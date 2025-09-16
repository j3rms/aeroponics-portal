'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';

export default function Scheduling() {
  const [frequency, setFrequency] = useState<number | ''>('');
  const [time, setTime] = useState<string>('');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = () => {
    console.log({ frequency, time });
    setShowSuccessModal(true); // Show the success modal after submission
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-white text-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-hidden">
        <h1 className="text-3xl font-semibold mb-10 tracking-tight text-green-700">
          Watering Schedule
        </h1>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 max-w-lg space-y-6">
          {/* Frequency Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Frequency (times per day)
            </label>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="e.g. 2"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
            />
          </div>

          {/* Time Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Watering Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={frequency === '' || frequency === 0 || time === ''} // Disable if frequency is empty, 0, or time is empty
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              frequency === '' || frequency === 0 || time === ''
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Save Schedule
          </button>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-sm mx-auto">
              <p className="text-gray-600 mb-4">Schedule saved! 🌱</p>
              <button
                onClick={() => setShowSuccessModal(false)} // Close the modal when clicked
                className="px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
