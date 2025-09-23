'use client';
import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import Footer from '@/components/footer';
import { Clock, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Plant list
const plants = [
  { id: 16, name: "Arugula", ph: "5.5 - 6.8", ppm: "560 - 980 ppm" },
  { id: 2, name: "Basil", ph: "5.5 - 6.5", ppm: "700 - 1120 ppm" },
  { id: 3, name: "Bean", ph: "6.0 - 6.5", ppm: "1400 - 1680 ppm" },
  { id: 4, name: "Bok Choy", ph: "6.5 - 7.0", ppm: "1050 - 1400 ppm" },
  { id: 5, name: "Broccoli", ph: "6.0 - 6.5", ppm: "1960 - 2450 ppm" },
  { id: 6, name: "Brussel Sprouts", ph: "6.5 - 7.5", ppm: "1750 - 2100 ppm" },
  { id: 7, name: "Bunching Onion", ph: "5.5 - 6.8", ppm: "1260 - 1680 ppm" },
  { id: 8, name: "Cabbage", ph: "6.5 - 7.0", ppm: "1750 - 2100 ppm" },
  { id: 9, name: "Cauliflower", ph: "6.0 - 7.0", ppm: "1050 - 1400 ppm" },
  { id: 10, name: "Celery", ph: "6.3 - 6.7", ppm: "1260 - 1680 ppm" },
  { id: 11, name: "Chamomile", ph: "5.5 - 6.5", ppm: "560 - 980 ppm" },
  { id: 12, name: "Chives", ph: "6.0 - 6.5", ppm: "1260 - 1680 ppm" },
  { id: 13, name: "Cilantro", ph: "6.5 - 6.7", ppm: "910 - 1260 ppm" },
  { id: 14, name: "Collard Greens", ph: "5.5 - 6.8", ppm: "1120 - 1750 ppm" },
  { id: 15, name: "Cucumber", ph: "5.8 - 6.0", ppm: "1190 - 1750 ppm" },
];

export default function CreateTower() {
  const router = useRouter();

  const [towerName, setTowerName] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const [customPlantData, setCustomPlantData] = useState(null);

  // Watering states
  const [wateringFrequency, setWateringFrequency] = useState('');
  const [wateringTimes, setWateringTimes] = useState([]);
  const [customFrequency, setCustomFrequency] = useState('');
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);

  // Calendar states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Custom plant modal states
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPhMin, setCustomPhMin] = useState('');
  const [customPhMax, setCustomPhMax] = useState('');
  const [customPpmMin, setCustomPpmMin] = useState('');
  const [customPpmMax, setCustomPpmMax] = useState('');

  // Calendar setup
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

  const makeDate = (day) => new Date(year, month, day);

  const formatDateLocal = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDateClick = (day) => {
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

  const isSelected = (day) => {
    const date = makeDate(day);
    if (startDate && endDate) {
      return date >= startDate && date <= endDate;
    }
    return startDate && date.getTime() === startDate.getTime();
  };

  // Plant dropdown
  const handlePlantChange = (value) => {
    if (value === 'custom') {
      setShowCustomModal(true);
    } else {
      setSelectedPlant(value);
      setCustomPlantData(null);
    }
  };

  // Save custom plant
  const handleCustomSave = () => {
    if (!customName || !customPhMin || !customPhMax || !customPpmMin || !customPpmMax) {
      alert('Please fill all custom plant fields');
      return;
    }
    const customPlant = {
      id: null,
      name: customName,
      ph: `${customPhMin} - ${customPhMax}`,
      ppm: `${customPpmMin} - ${customPpmMax} ppm`,
    };
    setCustomPlantData(customPlant);
    setSelectedPlant('custom');
    setShowCustomModal(false);

    setCustomName('');
    setCustomPhMin('');
    setCustomPhMax('');
    setCustomPpmMin('');
    setCustomPpmMax('');
  };

  // Utility: generate times with 6hr interval starting at 08:00
  const generateDefaultTimes = (count) => {
    const times = [];
    let hour = 8;
    for (let i = 0; i < count; i++) {
      const h = String(hour).padStart(2, '0');
      times.push(`${h}:00`);
      hour = (hour + 6) % 24;
    }
    return times;
  };

  // Frequency dropdown
  // Frequency dropdown
const handleFrequencyChange = (value) => {
  if (value === 'custom') {
    setShowFrequencyModal(true);
  } else {
    setWateringFrequency(value);
    const freq = parseInt(value);
    if (!isNaN(freq)) {
      setWateringTimes(generateDefaultTimes(freq)); // default 8:00 + 6hr interval
    } else {
      setWateringTimes([]);
    }
  }
};


  // Save custom frequency
  // Save custom frequency
const handleCustomFrequencySave = () => {
  const freq = parseInt(customFrequency);
  if (!freq || freq <= 0) {
    alert('Please enter a valid custom frequency');
    return;
  }
  setWateringFrequency(freq.toString());

  // 👉 For custom, create empty slots instead of default times
  setWateringTimes(Array(freq).fill(""));

  setShowFrequencyModal(false);
  setCustomFrequency('');
};

  // Update individual watering time
  const handleTimeChange = (index, value) => {
    const updated = [...wateringTimes];
    updated[index] = value;
    setWateringTimes(updated);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const plant =
      selectedPlant === 'custom' ? customPlantData : plants.find((p) => p.name === selectedPlant);

    if (!towerName || !plant || wateringTimes.length === 0 || wateringTimes.some(t => !t) || !wateringFrequency || !startDate || !endDate) {
      alert('Please complete all fields before submitting');
      return;
    }

    const payload = {
      towerName,
      user: { id: 1 },
      plant: { id: plant.id, name: plant.name },
      times: wateringTimes.map(t => t + ':00'),
      water_level: 123,
      frequency: parseInt(wateringFrequency),
      start_date: formatDateLocal(startDate),
      end_date: formatDateLocal(endDate),
    };

    try {
      const res = await fetch('/apis/addTower', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const data = await res.json();
      console.log('Tower created:', data);
      alert('Tower successfully created!');
      router.push('/managetower');
    } catch (err) {
      console.error('Failed to create tower:', err);
      alert('Error creating tower');
    }
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
      <Sidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Tower</h1>
          <p className="text-gray-600 mb-10">Set up your aeroponics system for optimal plant growth</p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Tower Name */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6 lg:col-span-2">
              <h2 className="font-semibold text-lg text-gray-800 mb-3">Tower Name</h2>
              <input
                type="text"
                value={towerName}
                onChange={(e) => setTowerName(e.target.value)}
                placeholder="Enter tower name"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 shadow-sm focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* Plant */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6">
              <h2 className="font-semibold text-lg text-gray-800 mb-3">Select Your Plant</h2>
              <select
                value={selectedPlant}
                onChange={(e) => handlePlantChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 shadow-sm focus:ring-2 focus:ring-green-400"
              >
                <option value="">Choose your plant variety</option>
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.name}>{plant.name}</option>
                ))}
                <option value="custom">+ Custom Plant</option>
              </select>

              {selectedPlant && selectedPlant !== 'custom' && (
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>pH:</strong> {plants.find((p) => p.name === selectedPlant)?.ph}</p>
                  <p><strong>PPM:</strong> {plants.find((p) => p.name === selectedPlant)?.ppm}</p>
                </div>
              )}

              {selectedPlant === 'custom' && customPlantData && (
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Plant:</strong> {customPlantData.name}</p>
                  <p><strong>pH:</strong> {customPlantData.ph}</p>
                  <p><strong>PPM:</strong> {customPlantData.ppm}</p>
                </div>
              )}
            </div>

            {/* Watering Schedule */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6">
              <h2 className="font-semibold text-lg text-gray-800 mb-3">Watering Schedule</h2>

              {/* Watering Frequency */}
              <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Watering Frequency
              </label>
              <select
                value={wateringFrequency}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 shadow-sm focus:ring-2 focus:ring-green-400 mb-4"
              >
                <option value="">Select frequency</option>
                <option value="1">Once a day</option>
                <option value="2">Twice a day</option>
                <option value="3">3 times a day</option>
                <option value="custom">Custom</option>
              </select>

              {/* Dynamic Watering Times */}
              {wateringTimes.length > 0 && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Watering Times
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {wateringTimes.map((time, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Time {index + 1}</span>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(index, e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Calendar */}
<div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-6 lg:col-span-2">
  <h2 className="font-semibold text-lg text-gray-800 mb-3">Select Watering Period</h2>

  {/* Month navigation */}
  <div className="flex justify-between items-center mb-4">
    <button type="button" onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
      <ChevronLeft className="w-5 h-5 text-gray-600" />
    </button>
    <h3 className="text-lg font-semibold text-gray-800">{monthNames[month]} {year}</h3>
    <button type="button" onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
      <ChevronRight className="w-5 h-5 text-gray-600" />
    </button>
  </div>

  {/* Weekdays */}
<div className="grid grid-cols-7 text-center font-medium text-gray-500 mb-2 w-full">
  {weekDays.map((day) => (
    <div key={day} className="flex items-center justify-center">
      {day}
    </div>
  ))}
</div>

{/* Days */}
<div className="grid grid-cols-7 gap-2 text-center w-full">
  {/* Empty slots before the first day */}
  {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
    <div key={idx} className="flex items-center justify-center"></div>
  ))}

  {/* Days in month */}
  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
    <button
      type="button"
      key={day}
      onClick={() => handleDateClick(day)}
      className={`w-9 h-9 flex items-center justify-center rounded-md text-sm transition mx-auto
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




  {(startDate || endDate) && (
    <p className="mt-4 text-sm text-gray-700">
      <strong>Selected range:</strong>{' '}
      {startDate ? startDate.toDateString() : ''}{' '}
      {endDate ? `→ ${endDate.toDateString()}` : ''}
    </p>
  )}
</div>

          </form>

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
        <Footer />
      </div>

      {/* Custom Plant Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowCustomModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Custom Plant</h2>

            <input
              type="text"
              placeholder="Plant Name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full mb-3 px-4 py-2 rounded-lg border border-gray-200"
            />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="number"
                step="0.1"
                placeholder="Min pH"
                value={customPhMin}
                onChange={(e) => setCustomPhMin(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Max pH"
                value={customPhMax}
                onChange={(e) => setCustomPhMax(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="number"
                placeholder="Min PPM"
                value={customPpmMin}
                onChange={(e) => setCustomPpmMin(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200"
              />
              <input
                type="number"
                placeholder="Max PPM"
                value={customPpmMax}
                onChange={(e) => setCustomPpmMax(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200"
              />
            </div>

            <button
              onClick={handleCustomSave}
              className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
            >
              Save Plant
            </button>
          </div>
        </div>
      )}

      {/* Custom Frequency Modal */}
      {showFrequencyModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowFrequencyModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-800">Custom Frequency</h2>

            <input
              type="number"
              placeholder="Number of times per day"
              value={customFrequency}
              onChange={(e) => setCustomFrequency(e.target.value)}
              className="w-full mb-3 px-4 py-2 rounded-lg border border-gray-200"
            />

            <button
              onClick={handleCustomFrequencySave}
              className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
            >
              Save Frequency
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
