'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Footer from '@/components/footer';
import { Clock, RefreshCw, ChevronLeft, ChevronRight, X, Plus, Leaf, ArrowLeft, Calendar, Info, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import DeviceAssignmentModal from '@/components/DeviceAssignmentModal';
import withAuth from '@/components/withAuth';

const CreateTower = () => {
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
  const [wateringTimes, setWateringTimes] = useState([]); // Array of {time: string, duration: number}
  const [customFrequency, setCustomFrequency] = useState('');
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [durationText, setDurationText] = useState('');

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

  // Step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    { number: 1, title: 'Tower Name', description: 'Name your aeroponics tower' },
    { number: 2, title: 'Select Plant', description: 'Choose the plant variety' },
    { number: 3, title: 'Watering Schedule', description: 'Set watering frequency and times' },
    { number: 4, title: 'Select Dates', description: 'Choose start and end dates' }
  ];

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

  const formatDateLocal = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Step validation functions
  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!towerName.trim()) {
          toast.error('Please enter a tower name');
          return false;
        }
        return true;
      case 2:
        if (!selectedPlant) {
          toast.error('Please select a plant');
          return false;
        }
        return true;
      case 3:
        if (!wateringFrequency) {
          toast.error('Please select watering frequency');
          return false;
        }
        if (wateringTimes.length === 0 || wateringTimes.some(t => !t.time || !t.duration)) {
          toast.error('Please set all watering times and durations');
          return false;
        }
        return true;
      case 4:
        if (!startDate || !endDate) {
          toast.error('Please select both start and end dates');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // Step navigation handlers
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (step) => {
    // Allow going back to any previous step
    if (step <= currentStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

      // Immediately refresh plants so the new custom plant can be selected without page refresh
      try {
        setPlantsLoading(true);
        const plantsRes = await fetch('/apis/getAllPlants');
        const plantsResult = await plantsRes.json();

        if ((plantsResult.success || plantsResult.status) && plantsResult.data) {
          const plantsArray = Array.isArray(plantsResult.data) ? plantsResult.data : plantsResult.data.data;
          if (Array.isArray(plantsArray)) {
            const transformedPlants = plantsArray
              .map(plant => {
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
              .filter(plant => {
                if (!plant.userId || plant.userId === 1) return true;
                return plant.userId === currentUserId;
              });

            setPlants(transformedPlants);
          }
        }
      } catch (e) {
        console.error('Failed to refresh plants after creating custom plant', e);
      } finally {
        setPlantsLoading(false);
      }

      // Select the newly created custom plant by name
      setSelectedPlant(customName);
      setCustomPlantData(null);
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

  // Utility: generate  // Default time intervals with duration (e.g., 8:00, 14:00, 20:00) - default 15 min duration
  const generateDefaultTimes = (freq) => {
    const times = [];
    const interval = Math.floor(24 / freq);
    for (let i = 0; i < freq; i++) {
      const hour = (8 + i * interval) % 24;
      times.push({ time: `${String(hour).padStart(2, '0')}:00`, duration: 15 });
    }
    return times;
  };

  // Keep duration text in sync when number of sessions changes
  useEffect(() => {
    if (wateringTimes.length > 0) {
      const d = wateringTimes[0].duration;
      setDurationText(d === undefined || d === null ? '' : String(d));
    } else {
      setDurationText('');
    }
  }, [wateringTimes.length]);

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
  const handleCustomFrequencySave = () => {
    const freq = parseInt(customFrequency);
    if (!freq || freq <= 0) {
      alert('Please enter a valid custom frequency');
      return;
    }
    setWateringFrequency(freq.toString());

    // For custom, create empty slots with default duration
    setWateringTimes(Array(freq).fill(null).map(() => ({ time: "", duration: 15 })));

    setShowFrequencyModal(false);
    setCustomFrequency('');
  };

  // Helper function to check if a time overlaps with existing schedules
  const isTimeOverlapping = (newTime, newDuration, currentIndex) => {
    if (!newTime) return false;
    
    const [newHour, newMinute] = newTime.split(':').map(Number);
    const newStartMinutes = newHour * 60 + newMinute;
    const newEndMinutes = newStartMinutes + newDuration;
    
    for (let i = 0; i < wateringTimes.length; i++) {
      if (i === currentIndex || !wateringTimes[i].time) continue;
      
      const [existingHour, existingMinute] = wateringTimes[i].time.split(':').map(Number);
      const existingStartMinutes = existingHour * 60 + existingMinute;
      const existingEndMinutes = existingStartMinutes + wateringTimes[i].duration;
      
      // Check if there's any overlap
      if (
        (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
        (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
        (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
      ) {
        return true;
      }
    }
    
    return false;
  };

  // Update individual watering time
  const handleTimeChange = (index, value) => {
    if (!value) {
      const updated = [...wateringTimes];
      updated[index] = { ...updated[index], time: value };
      setWateringTimes(updated);
      return;
    }
    
    // Check for overlaps
    const duration = wateringTimes[index].duration;
    if (isTimeOverlapping(value, duration, index)) {
      toast.error('This time conflicts with another watering schedule!');
      return;
    }
    
    const updated = [...wateringTimes];
    updated[index] = { ...updated[index], time: value };
    setWateringTimes(updated);
  };

  // Duration input handler: allow erase, accept only 1..120, propagate to all sessions
  const handleDurationTextChange = (value) => {
    setDurationText(value);
    if (value === '') {
      const updated = wateringTimes.map(s => ({ ...s, duration: undefined }));
      setWateringTimes(updated);
      return;
    }
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) {
      const updated = wateringTimes.map(s => ({ ...s, duration: undefined }));
      setWateringTimes(updated);
      return;
    }
    if (n > 0 && n <= 120) {
      const updated = wateringTimes.map(s => ({ ...s, duration: n }));
      setWateringTimes(updated);
    } else {
      // mark as invalid (0 or below / > 120) so submission will not pass
      const updated = wateringTimes.map(s => ({ ...s, duration: 0 }));
      setWateringTimes(updated);
    }
  };

  const handleNumericKeyDown = (e) => {
    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
    if (allowed.includes(e.key)) return;
    if ((e.ctrlKey || e.metaKey) && ['a','c','v','x','A','C','V','X'].includes(e.key)) return;
    if (/^[0-9]$/.test(e.key)) return;
    e.preventDefault();
  };

  const handleNumericPaste = (e) => {
    const text = e.clipboardData.getData('text');
    const digits = text.replace(/\D/g, '');
    e.preventDefault();
    handleDurationTextChange(digits);
  };

  // Update individual watering duration
  const handleDurationChange = (index, value) => {
    const duration = parseInt(value);
    if (duration > 0 && duration <= 120) { // Max 120 minutes (2 hours)
      const updated = [...wateringTimes];
      
      // If this is the first schedule, apply duration to all schedules
      if (index === 0) {
        updated.forEach((schedule, i) => {
          updated[i] = { ...updated[i], duration: duration };
        });
      } else {
        // For other schedules, just update the current one
        updated[index] = { ...updated[index], duration: duration };
      }
      
      setWateringTimes(updated);
    }
  };
  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const plant =
      selectedPlant === 'custom' ? customPlantData : plants.find((p) => p.name === selectedPlant);

    if (!towerName || !plant || wateringTimes.length === 0 || wateringTimes.some(t => !t.time || !t.duration) || !wateringFrequency || !startDate || !endDate) {
      toast.error('Please complete all fields including watering times and durations');
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
      time: wateringTimes[0].time, // First watering time (HH:mm format, no seconds)
      water_level: 5, // Default to medium (1-3=High, 4-7=Medium, 8-10=Low)
      frequency: parseInt(wateringFrequency),
      start_date: formatDateLocal(startDate),
      end_date: formatDateLocal(endDate),
      status: true, // New towers are active by default
      watering_duration: wateringTimes[0].duration, // Duration in minutes (same for all sessions)
      schedules: wateringTimes.map((schedule) => ({
        id: 0, // New schedule, no ID yet
        start_time: schedule.time, // HH:mm format
        duration: schedule.duration // Duration in minutes
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
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 md:pl-64 overflow-x-hidden">
      <div className="flex flex-col flex-1">
        <main className="flex-1 max-w-3xl md:max-w-7xl mx-auto w-full px-4 md:px-10 py-8 md:py-12">
          {/* Header with decorative elements */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 relative overflow-hidden"
          >
            {/* Decorative background */}
            <div className="absolute top-10 -left-20 w-72 h-72 bg-green-200/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left gap-4 relative z-10">
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

          {/* Step Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-green-100 shadow-lg p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <button
                    type="button"
                    onClick={() => goToStep(step.number)}
                    disabled={step.number > currentStep}
                    className={`relative flex flex-col items-center cursor-pointer group ${
                      step.number > currentStep ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                        currentStep === step.number
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-110'
                          : currentStep > step.number
                          ? 'bg-green-100 text-green-700 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-400 border-2 border-gray-300'
                      }`}
                    >
                      {currentStep > step.number ? '✓' : step.number}
                    </div>
                    <div className="mt-2 text-center">
                      <div
                        className={`text-sm font-semibold ${
                          currentStep === step.number
                            ? 'text-green-700'
                            : currentStep > step.number
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                        {step.description}
                      </div>
                    </div>
                  </button>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-4 relative" style={{ top: '-24px' }}>
                      <div
                        className={`h-full rounded transition-all duration-500 ${
                          currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Current Step Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {currentStep === 1 && "Give your tower a unique, descriptive name to easily identify it."}
                    {currentStep === 2 && "Choose the plant variety you'll be growing. This determines the optimal nutrient levels."}
                    {currentStep === 3 && "Configure how often and when your system should water the plants."}
                    {currentStep === 4 && "Set the cultivation period by choosing start and end dates for this tower."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* STEP 1: Tower Name */}
            {currentStep === 1 && (
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
                <p className="text-sm text-gray-600 mb-4">
                  Choose a descriptive name that helps you easily identify this tower (e.g., "Basil Tower A", "Tomato Greenhouse 1")
                </p>
                <input
                  type="text"
                  value={towerName}
                  onChange={(e) => setTowerName(e.target.value)}
                  placeholder="e.g., Hydroponic Tower 1, Lettuce Farm A"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  required
                />
              </motion.div>
            )}

            {/* STEP 2: Plant Selection */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8 lg:col-span-2"
              >
                <h2 className="font-semibold text-xl text-gray-800 mb-3 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Select Your Plant
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select from our database of common plants or create a custom plant profile with specific pH and PPM requirements.
                </p>
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
            )}

            {/* STEP 3: Watering Schedule */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8 lg:col-span-2"
              >
              <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-green-600" />
                Watering Schedule
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Set how many times per day the system should water, then configure the duration and specific start times for each watering session.
              </p>

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
                <option value="4">4 times a day</option>
                <option value="custom">Custom...</option>
              </select>

              {/* Dynamic Watering Times */}
              {wateringTimes.length > 0 && (
                <div className="space-y-4">
                  {/* Info Banner */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <div className="flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-blue-700">
                        <strong>Tip:</strong> Set duration once → applies to all sessions. Times can't overlap.
                      </p>
                    </div>
                  </div>

                  {/* Duration Section */}
                  <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                    <label className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-green-600" /> 
                      Duration (All Sessions)
                    </label>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={durationText}
                        onKeyDown={handleNumericKeyDown}
                        onPaste={handleNumericPaste}
                        onChange={(e) => handleDurationTextChange(e.target.value.replace(/\D/g, ''))}
                        className="w-20 px-3 py-2 rounded-lg border border-green-300 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm font-semibold"
                        placeholder="15"
                      />
                      <span className="text-xs font-medium text-gray-700">min for all {wateringTimes.length} session{wateringTimes.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Times Section */}
                  <div>
                    <label className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" /> 
                      Start Times
                    </label>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {wateringTimes.map((schedule, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <label className="text-[11px] font-semibold text-gray-600 mb-1.5 block">Session {index + 1}</label>
                          
                          <input
                            type="time"
                            value={schedule.time}
                            onChange={(e) => handleTimeChange(index, e.target.value)}
                            step="60"
                            className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                            placeholder="Hour"
                          />
                          
                          {schedule.time && schedule.duration && (
                            <p className="text-[10px] text-orange-600 font-medium mt-1.5">
                              ⏰ {schedule.time} - {(() => {
                                const [h, m] = schedule.time.split(':').map(Number);
                                const endMinutes = h * 60 + m + schedule.duration;
                                const endH = Math.floor(endMinutes / 60) % 24;
                                const endM = endMinutes % 60;
                                return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
                              })()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              </motion.div>
            )}

            {/* STEP 4: Calendar */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8 lg:col-span-2"
              >
                <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Select Watering Period
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Choose the start date (today or future) and end date for your tower's cultivation cycle. The system will operate during this period.
                </p>

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
            )}

          </form>

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between items-center">
            <motion.button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all ${
                currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:shadow-xl hover:border-gray-400'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </motion.button>

            {currentStep < totalSteps ? (
              <motion.button
                type="button"
                onClick={handleNextStep}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Next Step
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <LoadingSpinner size="sm" color="white" />}
                {isSubmitting ? 'CREATING TOWER...' : 'CREATE TOWER'}
              </motion.button>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Custom Plant Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border-2 border-green-100"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowCustomModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Create Custom Plant</h2>
                <p className="text-sm text-gray-500">Define optimal nutrient ranges for your plant</p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> Enter the optimal pH and PPM ranges for your specific plant variety. These values will be used for monitoring and alerts.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Plant Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cherry Tomatoes, Basil, Lettuce"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                />
              </div>

              {/* pH Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  pH Range <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Minimum pH</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 5.5"
                      value={customPhMin}
                      onChange={(e) => setCustomPhMin(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Maximum pH</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 6.5"
                      value={customPhMax}
                      onChange={(e) => setCustomPhMax(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">💡 Typical range: 5.5 - 6.5 for most plants</p>
              </div>

              {/* PPM Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PPM Range (Nutrient Concentration) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Minimum PPM</label>
                    <input
                      type="number"
                      placeholder="e.g., 800"
                      value={customPpmMin}
                      onChange={(e) => setCustomPpmMin(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Maximum PPM</label>
                    <input
                      type="number"
                      placeholder="e.g., 1400"
                      value={customPpmMax}
                      onChange={(e) => setCustomPpmMax(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">💡 Typical range: 800-1400 for leafy greens, 1200-2000 for fruiting plants</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCustomModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomSave}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Leaf className="w-4 h-4" />
                Save Plant
              </button>
            </div>
          </motion.div>
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
};

export default withAuth(CreateTower);