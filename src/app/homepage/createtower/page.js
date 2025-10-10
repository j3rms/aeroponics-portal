'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/sidebar';
import Footer from '@/components/footer';
import { Clock, RefreshCw, ChevronLeft, ChevronRight, X, Plus, Leaf, ArrowLeft, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import DeviceAssignmentModal from '@/components/DeviceAssignmentModal';

export default function CreateTower() {
  const router = useRouter();

  const [plants, setPlants] = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Device assignment modal states
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [createdTowerId, setCreatedTowerId] = useState(null);
  const [createdTowerName, setCreatedTowerName] = useState('');

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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch current user
        const userResponse = await fetch('/apis/getCurrentUser');
        const userResult = await userResponse.json();
        let userId = null;
        if (userResult.success && userResult.data) {
          userId = userResult.data.userId;
          setCurrentUserId(userId);
        }

        // Fetch plants
        setPlantsLoading(true);
        const response = await fetch('/apis/getAllPlants');
        const result = await response.json();
        
        // Check if we have the success flag from the API wrapper or status from backend
        if ((result.success || result.status) && result.data) {
          // Handle both nested (result.data.data) and direct (result.data) array structures
          const plantsArray = Array.isArray(result.data) ? result.data : result.data.data;
          
          if (Array.isArray(plantsArray) && plantsArray.length > 0) {
            // Transform and filter plants
            const transformedPlants = plantsArray
              .map(plant => {
                // Check if plant has user info and if user is NOT user 1 (system user)
                const plantUserId = plant.user?.id;
                const isCustomPlant = plantUserId && plantUserId !== 1;
                
                return {
                  id: plant.id,
                  name: plant.name,
                  ph: `${plant.min_ph_level} - ${plant.max_ph_level}`,
                  ppm: `${plant.min_ppm} - ${plant.max_ppm} ppm`,
                  isCustom: isCustomPlant,
                  userId: plantUserId
                };
              })
              // Filter: Show system plants (user 1) OR custom plants created by current user
              .filter(plant => {
                console.log(`Filtering plant "${plant.name}": isCustom=${plant.isCustom}, plantUserId=${plant.userId}, currentUserId=${userId}`);
                
                // System plants (user 1 or no user) are visible to everyone
                if (!plant.userId || plant.userId === 1) {
                  console.log(`  -> Showing (system plant)`);
                  return true;
                }
                
                // Custom plants are only visible to their creator
                const shouldShow = plant.userId === userId;
                console.log(`  -> ${shouldShow ? 'Showing' : 'Hiding'} (custom plant, creator: ${plant.userId})`);
                return shouldShow;
              });

            console.log(`Total plants: ${plantsArray.length}, Filtered plants for user ${userId}: ${transformedPlants.length}`);
            setPlants(transformedPlants);
          } else {
            console.warn('No plants found in response');
            setPlants([]);
          }
        } else {
          console.error('Failed to fetch plants:', result.message);
          setPlants([]);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setPlants([]);
      } finally {
        setPlantsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const makeDate = (day) => new Date(year, month, day);

  const formatDateLocal = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Check if a date is in the past (before today)
  const isPastDate = (day) => {
    const date = makeDate(day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const handleDateClick = (day) => {
    // Prevent selecting past dates
    if (isPastDate(day)) {
      toast.error('Cannot select past dates');
      return;
    }

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
  const handleCustomSave = async () => {
    if (!customName || !customPhMin || !customPhMax || !customPpmMin || !customPpmMax) {
      alert('Please fill all custom plant fields');
      return;
    }

    try {
      // Save custom plant to backend
      const response = await fetch('/apis/addPlant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customName,
          min_ph_level: parseFloat(customPhMin),
          max_ph_level: parseFloat(customPhMax),
          min_ppm: parseInt(customPpmMin),
          max_ppm: parseInt(customPpmMax),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || 'Failed to create custom plant');
        return;
      }

      // Create custom plant object with backend ID
      const customPlant = {
        id: result.data?.data?.id || Date.now(), // Use backend ID or fallback
        name: customName,
        ph: `${customPhMin} - ${customPhMax}`,
        ppm: `${customPpmMin} - ${customPpmMax} ppm`,
      };

      setCustomPlantData(customPlant);
      setSelectedPlant('custom');
      setShowCustomModal(false);

      // Clear form
      setCustomName('');
      setCustomPhMin('');
      setCustomPhMax('');
      setCustomPpmMin('');
      setCustomPpmMax('');

      toast.success('Custom plant created successfully!');
    } catch (error) {
      console.error('Error creating custom plant:', error);
      toast.error('Failed to create custom plant. Please try again.');
    }
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
      toast.error('Please complete all fields before submitting');
      return;
    }

    if (!currentUserId) {
      toast.error('User session not found. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Creating tower...');

    // Prepare payload matching backend TowerRO structure
    const payload = {
      name: towerName,
      user: { id: currentUserId }, // Use current logged-in user ID
      plant: { id: plant.id },
      time: wateringTimes[0], // First watering time (HH:mm format, no seconds)
      water_level: 'MEDIUM', // Use enum value: HIGH, MEDIUM, or LOW
      frequency: parseInt(wateringFrequency),
      start_date: formatDateLocal(startDate),
      end_date: formatDateLocal(endDate),
      status: true, // New towers are active by default
      schedules: wateringTimes.map((time) => ({
        id: 0, // New schedule, no ID yet
        start_time: time // HH:mm format
      }))
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    try {
      const res = await fetch('/apis/addTower', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Backend error response:', errorData);
        throw new Error(errorData.message || `Error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Tower created successfully - Full response:', JSON.stringify(data, null, 2));
      
      // Extract tower ID from response
      // API wrapper returns: { success: true, data: { status: true, statusCode: 200, message: "...", data: TowerDTO } }
      // So tower ID is at: data.data.data.id
      const towerId = data.data?.data?.id || data.data?.id || data.id || null;
      console.log('Extracted tower ID:', towerId);
      
      if (!towerId) {
        console.error('Tower ID not found in response. Response structure:', data);
        toast.error('Tower created but could not retrieve ID for device assignment');
        setIsSubmitting(false);
        // Still redirect to manage towers after a delay
        setTimeout(() => {
          router.push('/homepage/managetower');
        }, 2000);
        return;
      }
      
      toast.dismiss();
      toast.success('Tower successfully created!');
      
      // Store tower info and show device assignment modal
      setCreatedTowerId(towerId);
      setCreatedTowerName(towerName);
      setIsSubmitting(false);
      setShowDeviceModal(true);
    } catch (err) {
      console.error('Failed to create tower:', err);
      toast.dismiss();
      const errorMsg = err.message || 'Unknown error occurred';
      toast.error(`Error creating tower: ${errorMsg}`);
      setIsSubmitting(false);
    }
  };

  const prevMonth = () => {
    // Calculate what the previous month would be
    const prevMonthValue = month === 0 ? 11 : month - 1;
    const prevYearValue = month === 0 ? year - 1 : year;
    
    // Don't allow going to months before the current month
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    if (prevYearValue < currentYear || (prevYearValue === currentYear && prevMonthValue < currentMonth)) {
      toast.error('Cannot navigate to past months');
      return;
    }
    
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
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
          {/* Header with decorative elements */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 relative overflow-visible"
          >
            {/* Decorative background */}
            <div className="absolute top-10 -left-20 w-72 h-72 bg-green-200/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent pb-1 leading-tight">
                    Create Tower
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    Set up your aeroponics system for optimal plant growth
                  </p>
                </div>
              </div>
              
              {/* Back Button */}
              <motion.button
                type="button"
                onClick={() => router.push('/homepage/managetower')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:border-green-200 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Towers
              </motion.button>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Tower Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8 lg:col-span-2"
            >
              <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Tower Name
              </h2>
              <input
                type="text"
                value={towerName}
                onChange={(e) => setTowerName(e.target.value)}
                placeholder="Enter tower name"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
              />
            </motion.div>

            {/* Plant */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8"
            >
              <h2 className="font-semibold text-lg text-gray-800 mb-3">Select Your Plant</h2>
              <select
                value={selectedPlant}
                onChange={(e) => handlePlantChange(e.target.value)}
                disabled={plantsLoading}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 shadow-sm focus:ring-2 focus:ring-green-400"
              >
                  <option value="">Choose your plant variety</option>
                  {plants.map((plant) => (
                    <option key={plant.id} value={plant.name}>
                      {plant.name}{plant.isCustom ? ' (My Custom Plant)' : ''}
                    </option>
                  ))}
                  <option value="custom">+ Create New Custom Plant</option>
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
            </motion.div>

            {/* Watering Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8"
            >
              <h2 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-green-600" />
                Watering Schedule
              </h2>

              {/* Watering Frequency */}
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Watering Frequency
              </label>
              <select
                value={wateringFrequency}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all mb-6"
              >
                <option value="">Select frequency</option>
                <option value="1">Once a day</option>
                <option value="2">Twice a day</option>
                <option value="3">3 times a day</option>
                <option value="custom">Custom</option>
              </select>

              {/* Dynamic Watering Times */}
              {wateringTimes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" /> Watering Times
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {wateringTimes.map((time, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-xs font-medium text-gray-600 mb-2">Time {index + 1}</span>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(index, e.target.value)}
                          className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Calendar */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.4 }}
  className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8 lg:col-span-2"
>
  <h2 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
    <Calendar className="w-5 h-5 text-green-600" />
    Select Watering Period
  </h2>

  {/* Month navigation */}
  <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
    <button 
      type="button" 
      onClick={prevMonth} 
      disabled={year === today.getFullYear() && month === today.getMonth()}
      className={`p-2 rounded-xl transition ${
        year === today.getFullYear() && month === today.getMonth()
          ? 'text-gray-300 cursor-not-allowed'
          : 'hover:bg-white hover:shadow-md text-gray-700'
      }`}
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
    <h3 className="text-xl font-bold text-gray-800">{monthNames[month]} {year}</h3>
    <button type="button" onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition text-gray-700">
      <ChevronRight className="w-5 h-5" />
    </button>
  </div>

  {/* Weekdays */}
<div className="grid grid-cols-7 text-center font-semibold text-gray-600 mb-3 w-full">
  {weekDays.map((day) => (
    <div key={day} className="flex items-center justify-center py-2">
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
  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
    const isPast = isPastDate(day);
    const selected = isSelected(day);
    
    return (
      <button
        type="button"
        key={day}
        onClick={() => handleDateClick(day)}
        disabled={isPast}
        className={`w-11 h-11 flex items-center justify-center rounded-xl text-sm font-medium transition mx-auto
          ${
            isPast
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
              : selected
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold shadow-lg scale-105'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50 cursor-pointer'
          }`}
      >
        {day}
      </button>
    );
  })}
</div>




  {(startDate || endDate) && (
    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
      <p className="text-sm font-semibold text-gray-800">
        <span className="text-green-700">Selected Period:</span>{' '}
        {startDate ? startDate.toDateString() : ''}{' '}
        {endDate ? `→ ${endDate.toDateString()}` : ''}
      </p>
    </div>
  )}
</motion.div>

          </form>

          <div className="mt-10 flex justify-center gap-4">
            <motion.button
              type="button"
              onClick={() => router.push('/homepage/managetower')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white border-2 border-gray-300 text-gray-700 px-10 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:border-gray-400 transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <LoadingSpinner size="sm" color="white" />}
              {isSubmitting ? 'CREATING TOWER...' : 'CREATE TOWER'}
            </motion.button>
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

      {/* Device Assignment Modal */}
      <DeviceAssignmentModal
        isOpen={showDeviceModal}
        onClose={(assigned) => {
          setShowDeviceModal(false);
          // Redirect to manage towers after modal closes
          setTimeout(() => {
            router.push('/homepage/managetower');
          }, 500);
        }}
        towerId={createdTowerId}
        towerName={createdTowerName}
      />
    </div>
  );
}