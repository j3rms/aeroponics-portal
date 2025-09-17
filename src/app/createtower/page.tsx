'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Footer from '@/components/footer';
import { Clock, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

type Plant = {
  name: string;
  ph: string;
  ppm: string;
};

const plants: Plant[] = [
  { name: 'Lettuce', ph: '5.5 - 6.5', ppm: '560 - 840 ppm' },
  { name: 'Kale', ph: '6.0 - 7.0', ppm: '1050 - 1400 ppm' },
  { name: 'Spinach', ph: '6.0 - 7.0', ppm: '1050 - 1400 ppm' },
  { name: 'Basil', ph: '5.5 - 6.5', ppm: '700 - 1120 ppm' },
];

export default function CreateTower() {
  const [selectedPlant, setSelectedPlant] = useState('');
  const [wateringTime, setWateringTime] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const makeDate = (day: number) => new Date(year, month, day);

  const handleDateClick = (day: number) => {
    const clickedDate = makeDate(day);

    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (clickedDate >= startDate) {
        setEndDate(clickedDate);
      } else {
        setStartDate(clickedDate);
        setEndDate(null);
      }
    }
  };

  const isSelected = (day: number) => {
    const date = makeDate(day);
    if (startDate && endDate) {
      return date >= startDate && date <= endDate;
    }
    return startDate && date.getTime() === startDate.getTime();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Tower created!\nPlant: ${selectedPlant}\nTime: ${wateringTime}\nFrequency: ${wateringFrequency}\nPeriod: ${startDate ? startDate.toDateString() : ''} → ${endDate ? endDate.toDateString() : ''}`
    );
  };

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
     <div className="flex min-h-screen bg-green-50 pl-64">
          {/* Sidebar */}
          <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Tower</h1>
          <p className="text-gray-600 mb-10">
            Set up your aeroponics system for optimal plant growth
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Step 1 - Select Plant */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-green-600 text-white font-semibold text-sm">
                  1
                </div>
                <h2 className="font-semibold text-lg text-gray-800">
                  Select Your Plant
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Choose the plant variety for your tower
              </p>
              <select
                value={selectedPlant}
                onChange={(e) => setSelectedPlant(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 shadow-sm focus:ring-2 focus:ring-green-400"
              >
                <option value="">Choose your plant variety</option>
                {plants.map((plant) => (
                  <option key={plant.name} value={plant.name}>
                    {plant.name}
                  </option>
                ))}
              </select>

              {selectedPlant && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    <strong>pH:</strong>{' '}
                    {plants.find((p) => p.name === selectedPlant)?.ph}
                  </p>
                  <p>
                    <strong>PPM:</strong>{' '}
                    {plants.find((p) => p.name === selectedPlant)?.ppm}
                  </p>
                </div>
              )}
            </div>

            {/* Step 2 - Watering Schedule */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-green-600 text-white font-semibold text-sm">
                  2
                </div>
                <h2 className="font-semibold text-lg text-gray-800">
                  Watering Schedule
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Configure when and how often to water
              </p>

              <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Watering Time
              </label>
              <input
                type="time"
                value={wateringTime}
                onChange={(e) => setWateringTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 shadow-sm focus:ring-2 focus:ring-green-400 mb-4"
              />

              <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Watering Frequency
              </label>
              <select
                value={wateringFrequency}
                onChange={(e) => setWateringFrequency(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 shadow-sm focus:ring-2 focus:ring-green-400"
              >
                <option value="">Select frequency</option>
                <option value="1">Once a day</option>
                <option value="2">Twice a day</option>
                <option value="3">3 times a day</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Step 3 - Calendar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-green-600 text-white font-semibold text-sm">
                  3
                </div>
                <h2 className="font-semibold text-lg text-gray-800">
                  Select Watering Period
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Choose a start and end date for the watering system
              </p>

              {/* Month navigation */}
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-lg font-semibold text-gray-800">
                  {monthNames[month]} {year}
                </h3>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 text-center font-medium text-gray-500 mb-2">
                {weekDays.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                  <div key={idx}></div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm transition
                      ${
                        isSelected(day)
                          ? 'bg-green-600 text-white font-semibold shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                      }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Selected Dates Summary */}
              {(startDate || endDate) && (
                <p className="mt-4 text-sm text-gray-700">
                  <strong>Selected range:</strong>{' '}
                  {startDate ? startDate.toDateString() : ''}{' '}
                  {endDate ? `→ ${endDate.toDateString()}` : ''}
                </p>
              )}
            </div>
          </form>

          {/* Submit Button */}
          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-green-600 text-white px-10 py-4 rounded-xl font-semibold shadow-lg hover:bg-green-700 transition"
            >
              CREATE TOWER
            </button>
          </div>
        </main>

     
        
      </div>
      
    </div>
  );
}
