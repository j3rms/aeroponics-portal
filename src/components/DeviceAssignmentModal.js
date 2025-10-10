'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Wifi, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DeviceAssignmentModal({ isOpen, onClose, towerId, towerName }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableDevices();
    }
  }, [isOpen]);

  const fetchAvailableDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/apis/getFreeDevices');
      const result = await response.json();
      
      if (result.success && result.data) {
        setDevices(Array.isArray(result.data) ? result.data : []);
      } else {
        console.error('Failed to fetch devices:', result.message);
        setDevices([]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load available devices');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDevice = async (deviceId) => {
    try {
      setAssigning(true);
      setSelectedDeviceId(deviceId);
      
      const response = await fetch(`/apis/assignDeviceToTower`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          towerId: towerId,
          deviceId: deviceId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Device assigned successfully!');
        setTimeout(() => {
          onClose(true); // Pass true to indicate successful assignment
        }, 1000);
      } else {
        toast.error(result.message || 'Failed to assign device');
        setAssigning(false);
        setSelectedDeviceId(null);
      }
    } catch (error) {
      console.error('Error assigning device:', error);
      toast.error('Failed to assign device');
      setAssigning(false);
      setSelectedDeviceId(null);
    }
  };

  const handleSkip = () => {
    onClose(false); // Pass false to indicate skipped
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 relative">
            <button
              onClick={handleSkip}
              disabled={assigning}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Assign Device</h2>
                <p className="text-white/90 text-sm mt-1">
                  Connect a NodeMCU device to <strong>{towerName}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
                <p className="text-gray-600 mt-4">Loading available devices...</p>
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Available Devices</h3>
                <p className="text-gray-600 mb-6">
                  All devices are currently assigned. Please register a new device or unassign an existing one.
                </p>
                <button
                  onClick={handleSkip}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Skip for Now
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Select a device to connect to your tower. You can change this later.
                </p>
                <div className="grid gap-3">
                  {devices.map((device) => (
                    <motion.button
                      key={device.id}
                      onClick={() => handleAssignDevice(device.id)}
                      disabled={assigning}
                      whileHover={{ scale: assigning ? 1 : 1.02 }}
                      whileTap={{ scale: assigning ? 1 : 0.98 }}
                      className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                        selectedDeviceId === device.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                      } ${assigning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            selectedDeviceId === device.id ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {selectedDeviceId === device.id ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <Cpu className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">Device {device.id}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Wifi className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">{device.macAddress}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">IP: {device.ipAddress}</p>
                          </div>
                        </div>
                        {selectedDeviceId === device.id && assigning && (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-200 border-t-green-600"></div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!loading && devices.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <button
                onClick={handleSkip}
                disabled={assigning}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50"
              >
                Skip for Now (Assign Later)
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
