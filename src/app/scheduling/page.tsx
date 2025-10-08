'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';

export default function Scheduling() {
  const [frequency, setFrequency] = useState<number | ''>('');
  const [time, setTime] = useState<string>('');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log({ frequency, time });
    setIsLoading(false);
    setShowSuccessModal(true);
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
            disabled={frequency === '' || frequency === 0 || time === '' || isLoading}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              frequency === '' || frequency === 0 || time === '' || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>

        {/* Loading Screen */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
              <div className="flex flex-col items-center space-y-4">
                {/* Animated Spinner */}
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-800">Saving Schedule</p>
                  <p className="text-sm text-gray-500 mt-1">Please wait...</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
