'use client';

import { useState } from 'react';

export default function WelcomePage() {
  const [message, setMessage] = useState('Welcome to Our Website!');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{message}</h1>
        <p className="text-gray-600">We're glad to have you here. Enjoy exploring!</p>
        <button
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          onClick={() => setMessage('Have a Great Day!')}
        >
          Click Me
        </button>
      </div>
    </div>
  );
}