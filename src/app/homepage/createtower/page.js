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
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('');
  const [intervals, setIntervals] = useState('');

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

  // Defer tower creation until device modal answered
  const [pendingTowerPayload, setPendingTowerPayload] = useState(null);

  const createTowerAndMaybeAssign = async (payload, selection) => {
    // selection: { assigned: boolean, deviceId?: number } | { closed: true }
    try {
      toast.loading('Creating tower...');
      const res = await fetch('/apis/addTower', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Error: ${res.status}`);
      }
      const data = await res.json();
      const towerId = data.data?.data?.id || data.data?.id || data.id || null;
      if (!towerId) throw new Error('Tower ID missing from response');

      // If a device was selected, assign it now
      if (selection?.assigned && selection?.deviceId) {
        const assignRes = await fetch(`/apis/assignDeviceToTower`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ towerId, deviceId: selection.deviceId }),
        });
        const assignData = await assignRes.json();
        if (!assignRes.ok || !assignData.success) {
          toast.error(assignData.message || 'Device assignment failed');
        } else {
          toast.success('Device assigned successfully!');
        }
      }

      toast.dismiss();
      toast.success('Tower successfully created!');
      router.push('/homepage/managetower');
    } catch (err) {
      console.error('Create flow failed:', err);
      toast.dismiss();
      toast.error(err.message || 'Failed to create tower');
    } finally {
      setIsSubmitting(false);
      setPendingTowerPayload(null);
    }
  };

  // Step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const steps = [
    { number: 1, title: 'Instructions', description: 'Prerequisites and setup guide' },
    { number: 2, title: 'Tower Name', description: 'Name your aeroponics tower' },
    { number: 3, title: 'Select Plant', description: 'Choose the plant variety' },
    { number: 4, title: 'Watering Schedule', description: 'Set watering frequency and times' },
    { number: 5, title: 'Select Dates', description: 'Choose start and end dates' }
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
        // Instructions step - no validation needed
        return true;
      case 2:
        if (!towerName.trim()) {
          toast.error('Please enter a tower name');
          return false;
        }
        return true;
      case 3:
        if (!selectedPlant) {
          toast.error('Please select a plant');
          return false;
        }
        return true;
      case 4:
        if (!startTime) {
          toast.error('Please enter start time');
          return false;
        }
        if (!endTime) {
          toast.error('Please enter end time');
          return false;
        }
        if (endTime <= startTime) {
          toast.error('End time must be later than start time');
          return false;
        }
        if (!duration || parseInt(duration) <= 0) {
          toast.error('Please enter a valid duration');
          return false;
        }
        if (!intervals || parseInt(intervals) < 6) {
          toast.error('Please enter a valid interval (minimum 6 minutes)');
          return false;
        }
        return true;
      case 5:
        if (!startDate || !endDate) {
          toast.error('Please select both start and end dates');
          return false;
        }
        // Validate that start date is not today if start time has passed
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const selectedStart = new Date(startDate);
        selectedStart.setHours(0, 0, 0, 0);
        if (selectedStart.getTime() === todayStart.getTime() && startTime) {
          const now = new Date();
          const [hours, minutes] = startTime.split(':').map(Number);
          const startTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
          if (startTimeToday < now) {
            toast.error('Cannot start today - the start time has already passed. Please select a future date or change the start time.');
            return false;
          }
        }
        // Validate that end date is later than start date (not same day)
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        if (end <= start) {
          toast.error('End date must be later than start date (not the same day)');
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

  // Check if today's date is invalid for start date (if start time has already passed)
  const isTodayInvalidForStartDate = (day) => {
    if (!startTime) return false;
    const date = makeDate(day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const clickedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Check if the clicked date is today
    if (clickedDate.getTime() !== todayStart.getTime()) return false;
    
    // If it's today, check if start time has already passed
    const now = new Date();
    const [hours, minutes] = startTime.split(':').map(Number);
    const startTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    
    // If start time is earlier than current time, today is invalid
    return startTimeToday < now;
  };

  // Check if a date is invalid for end date (same day as start date or earlier)
  const isInvalidEndDate = (day) => {
    if (!startDate) return false;
    const date = makeDate(day);
    const start = new Date(startDate);
    const end = new Date(date);
    // Set time to midnight for date-only comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    // End date must be later than start date (not same day)
    return end <= start;
  };

  const handleDateClick = (day) => {
    // Prevent selecting past dates
    if (isPastDate(day)) {
      toast.error('Cannot select past dates');
      return;
    }

    const clickedDate = makeDate(day);
    if (!startDate || (startDate && endDate)) {
      // When selecting start date, check if today is invalid (start time has passed)
      if (isTodayInvalidForStartDate(day)) {
        toast.error('Cannot select today - the start time has already passed. Please select a future date or change the start time.');
        return;
      }
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // When selecting end date, prevent selecting same day or earlier
      if (isInvalidEndDate(day)) {
        toast.error('End date must be later than start date (not the same day)');
        return;
      }
      if (clickedDate > startDate) {
        setEndDate(clickedDate);
      } else {
        // When changing start date, check if today is invalid
        if (isTodayInvalidForStartDate(day)) {
          toast.error('Cannot select today - the start time has already passed. Please select a future date or change the start time.');
          return;
        }
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

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const plant =
      selectedPlant === 'custom' ? customPlantData : plants.find((p) => p.name === selectedPlant);

    if (!towerName || !plant || !startTime || !endTime || !duration || !intervals || !startDate || !endDate) {
      toast.error('Please complete all fields');
      return;
    }

    // Validate that start date is not today if start time has passed
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedStart = new Date(startDate);
    selectedStart.setHours(0, 0, 0, 0);
    if (selectedStart.getTime() === todayStart.getTime()) {
      const now = new Date();
      const [hours, minutes] = startTime.split(':').map(Number);
      const startTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
      if (startTimeToday < now) {
        toast.error('Cannot start today - the start time has already passed. Please select a future date or change the start time.');
        return;
      }
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (end <= start) {
      toast.error('End date must be later than start date (not the same day)');
      return;
    }

    // Validate time range
    if (endTime <= startTime) {
      toast.error('End time must be later than start time');
      return;
    }

    if (!currentUserId) {
      toast.error('User session not found. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    // Create tower with new watering schedule structure
    const payload = {
      name: towerName,
      user: { id: currentUserId },
      plant: { id: plant.id },
      start_date: formatDateLocal(startDate),
      end_date: formatDateLocal(endDate),
      start_time: startTime, // HH:mm format
      end_time: endTime, // HH:mm format
      watering_duration: parseInt(duration), // Duration in seconds
      intervals: parseInt(intervals), // Interval in minutes
      status: 'INACTIVE' // New towers start INACTIVE, become ACTIVE only when device assigned
    };

    // Defer creation until device modal is answered
    setPendingTowerPayload(payload);
    setCreatedTowerId(null);
    setCreatedTowerName(towerName);
    setShowDeviceModal(true);
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
            className="mb-12 relative"
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
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:border-green-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
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
            transition={{ duration: 0.5, delay: 0.2 }}
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
                    {currentStep === 1 && "Review the prerequisites and requirements before creating your tower."}
                    {currentStep === 2 && "Give your tower a unique, descriptive name to easily identify it."}
                    {currentStep === 3 && "Choose the plant variety you'll be growing. This determines the optimal nutrient levels."}
                    {currentStep === 4 && "Configure how often and when your system should water the plants."}
                    {currentStep === 5 && "Set the cultivation period by choosing start and end dates for this tower."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') { if (currentStep < totalSteps) { e.preventDefault(); handleNextStep(); } } }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* STEP 1: Instructions */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-3xl shadow-lg p-8 lg:col-span-2"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Before You Begin
                    </h3>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Please ensure the following requirements are met before creating your tower:
                      </p>
                      <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                          <span><strong className="text-gray-800">Hardware Setup:</strong> Your aeroponics tower hardware should be fully assembled and ready for operation.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                          <span><strong className="text-gray-800">Device Connection:</strong> Ensure your IoT device/controller is connected and online.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                          <span><strong className="text-gray-800">Plant Selection:</strong> Know which plant variety you'll be growing to configure optimal nutrient levels.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                          <span><strong className="text-gray-800">Watering Schedule:</strong> Have a watering schedule in mind based on your plant's needs.</span>
                        </li>
                      </ul>
                      <div className="bg-blue-100 border border-blue-300 rounded-xl p-4 mt-4">
                        <p className="text-sm text-blue-800 font-medium">
                          💡 <strong>Tip:</strong> After creating your tower, you'll be prompted to assign a device. The tower will remain inactive until a device is connected.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Tower Name */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
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
                  placeholder="e.g., Aeroponics Tower 1, Lettuce Farm A"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  required
                />
              </motion.div>
            )}

            {/* STEP 3: Plant Selection */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
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

            {/* STEP 4: Watering Schedule */}
            {currentStep === 4 && (
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
                  Configure the watering schedule for your tower by setting the time window, duration, and interval between watering cycles.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Clock className="w-4 h-4 inline mr-2 text-green-600" />
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">When to start the watering cycle each day</p>
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Clock className="w-4 h-4 inline mr-2 text-green-600" />
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white shadow-sm focus:ring-2 transition-all ${
                        endTime && startTime && endTime <= startTime
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                      }`}
                      required
                    />
                    {endTime && startTime && endTime <= startTime && (
                      <p className="text-xs text-red-600 mt-2 font-medium">
                        End time must be later than start time
                      </p>
                    )}
                    {!(endTime && startTime && endTime <= startTime) && (
                      <p className="text-xs text-gray-500 mt-2">When to end the watering cycle each day</p>
                    )}
                  </div>

                  {/* Watering Interval */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <RefreshCw className="w-4 h-4 inline mr-2 text-blue-600" />
                      Watering Interval (minutes)
                    </label>
                    <input
                      type="number"
                      value={intervals}
                      onChange={(e) => setIntervals(e.target.value)}
                      min="6"
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white shadow-sm focus:ring-2 transition-all ${
                        intervals && parseInt(intervals) < 6
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:ring-green-500 focus:border-green-500'
                      }`}
                      placeholder="60"
                      required
                    />
                    {intervals && parseInt(intervals) < 6 ? (
                      <p className="text-xs text-red-600 mt-2 font-medium">⚠️ Interval must be at least 6 minutes to prevent interference</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2">Time between each watering session (minimum 6 minutes)</p>
                    )}
                  </div>

                  {/* Watering Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Clock className="w-4 h-4 inline mr-2 text-blue-600" />
                      Watering Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      min="1"
                      max="300"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="30"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">How long each watering session lasts (1-300 seconds)</p>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-semibold mb-1">Example:</p>
                      <p>Start: 08:00, End: 20:00, Interval: 60 min, Duration: 30 sec</p>
                      <p className="text-xs mt-1">→ Waters for 30 seconds every 60 minutes between 8 AM and 8 PM</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Calendar */}
            {currentStep === 5 && (
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
      aria-label="Previous month"
      className={`p-2 rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${
        year === today.getFullYear() && month === today.getMonth()
          ? 'text-gray-300 cursor-not-allowed'
          : 'hover:bg-white hover:shadow-md text-gray-700'
      }`}
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
    <h3 className="text-xl font-bold text-gray-800">{monthNames[month]} {year}</h3>
    <button type="button" onClick={nextMonth} aria-label="Next month" className="p-2 hover:bg-white hover:shadow-md rounded-xl transition text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
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
    // When selecting end date, disable dates that are same as or before start date
    const isInvalidForEndDate = startDate && !endDate && isInvalidEndDate(day);
    // When selecting start date, disable today if start time has already passed
    const isTodayInvalid = (!startDate || (startDate && endDate)) && isTodayInvalidForStartDate(day);
    const isDisabled = isPast || isInvalidForEndDate || isTodayInvalid;
    
    return (
      <button
        type="button"
        key={day}
        onClick={() => handleDateClick(day)}
        disabled={isDisabled}
        className={`w-11 h-11 flex items-center justify-center rounded-xl text-sm font-medium transition mx-auto
          ${
            isDisabled
              ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
              : selected
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold shadow-lg scale-105'
              : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50 cursor-pointer'
          }`}
        title={
          isInvalidForEndDate 
            ? 'End date must be later than start date' 
            : isTodayInvalid 
            ? 'Start time has already passed today. Select a future date or change the start time.'
            : ''
        }
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
              whileHover={{ scale: currentStep === 1 ? 1 : 1.02 }}
              whileTap={{ scale: currentStep === 1 ? 1 : 0.98 }}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${
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
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
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
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Device Assignment Modal */}
      <DeviceAssignmentModal
        isOpen={showDeviceModal}
        deferAssign={true}
        onClose={(result) => {
          setShowDeviceModal(false);
          // If user simply closed, do nothing (no fetch, no creation)
          if (result?.closed) {
            setIsSubmitting(false);
            return;
          }
          // Create tower; optionally assign device
          if (pendingTowerPayload) {
            createTowerAndMaybeAssign(pendingTowerPayload, result);
          }
        }}
        towerId={createdTowerId}
        towerName={createdTowerName}
      />
    </div>
  );
};

export default withAuth(CreateTower);