'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const NutrientLogForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    tower: '',
    datetime: '',
    ph_level: '',
    ppm: '',
    water_level: 5
  });
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch available towers
  useEffect(() => {
    const fetchTowers = async () => {
      try {
        const response = await fetch('/apis/getAllUserTowers');
        const result = await response.json();
        if (result.success) {
          setTowers(result.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching towers:', error);
      }
    };

    if (isOpen) {
      fetchTowers();
    }
  }, [isOpen]);

  // Set initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        tower: initialData.tower?.id || '',
        datetime: initialData.datetime || '',
        ph_level: initialData.ph_level || '',
        ppm: initialData.ppm || '',
        water_level: initialData.water_level || 5
      });
    } else {
      // Reset form for new entry
      const now = new Date();
      const datetimeString = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
      setFormData({
        tower: '',
        datetime: datetimeString,
        ph_level: '',
        ppm: '',
        water_level: 5
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find the selected tower object
      const selectedTower = towers.find(tower => tower.id === parseInt(formData.tower));
      
      const submitData = {
        ...formData,
        tower: selectedTower,
        ph_level: parseFloat(formData.ph_level),
        ppm: parseFloat(formData.ppm),
        water_level: parseInt(formData.water_level)
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save nutrient log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-8 w-full max-w-md mx-4"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {initialData ? 'Edit Nutrient Log' : 'Add New Nutrient Log'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tower Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tower
            </label>
            <select
              name="tower"
              value={formData.tower}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select a tower</option>
              {towers.map(tower => (
                <option key={tower.id} value={tower.id}>
                  {tower.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              name="datetime"
              value={formData.datetime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* pH Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              pH Level
            </label>
            <input
              type="number"
              name="ph_level"
              value={formData.ph_level}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="14"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="6.5"
            />
          </div>

          {/* PPM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PPM (Parts Per Million)
            </label>
            <input
              type="number"
              name="ppm"
              value={formData.ppm}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="1200"
            />
          </div>

          {/* Water Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Water Level (1-10)
            </label>
            <input
              type="number"
              name="water_level"
              value={formData.water_level}
              onChange={handleChange}
              min="1"
              max="10"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="5"
            />
            <p className="text-xs text-gray-500 mt-1">
              1-3 = High, 4-7 = Medium, 8-10 = Low
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : (initialData ? 'Update' : 'Add Log')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NutrientLogForm;
