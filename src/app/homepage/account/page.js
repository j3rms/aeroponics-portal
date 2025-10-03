'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, KeyRound, Camera } from 'lucide-react';
import Sidebar from '@/components/sidebar';

export default function MyAccount() {
  const [user, setUser] = useState({
    fullName: '',
    email: '',
    username: '',
    status: 'Active',
    memberSince: '',
    avatarUrl: null,
    firstName: '',
    lastName: '',
  });

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [errors, setErrors] = useState({
    newPasswordMatch: '',
    profile: '',
    password: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/apis/getCurrentUser');
        const result = await response.json();
        
        if (result.success && result.data) {
          const fullName = `${result.data.firstName} ${result.data.lastName}`;
          setUser({
            fullName: fullName,
            email: result.data.email,
            username: fullName,
            status: 'Active',
            memberSince: 'Member',
            avatarUrl: null,
            firstName: result.data.firstName,
            lastName: result.data.lastName,
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setErrors({ ...errors, profile: 'Failed to load user data' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Reset password error hint when new / confirm change
  useEffect(() => {
    if (passwords.new && passwords.confirm && passwords.new !== passwords.confirm) {
      setErrors({ ...errors, newPasswordMatch: 'Passwords do not match.' });
    } else {
      setErrors({ ...errors, newPasswordMatch: '' });
    }
  }, [passwords.new, passwords.confirm]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, profile: '' });
    setSuccessMessage('');

    try {
      // Split fullName into first and last name
      const nameParts = user.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await fetch('/apis/updateProfile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: user.email,
          password: 'unchanged', // Keep existing password
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrors({ ...errors, profile: data.message || 'Failed to update profile' });
        return;
      }

      setSuccessMessage('Profile updated successfully!');
      setEditMode(false);
      
      // Update local state
      setUser({
        ...user,
        firstName: firstName,
        lastName: lastName,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({ ...errors, profile: 'Failed to update profile' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, password: '' });
    setSuccessMessage('');

    if (passwords.new !== passwords.confirm) {
      setErrors({ ...errors, password: 'Passwords do not match' });
      return;
    }

    // Validate password strength
    if (passwords.new.length < 8) {
      setErrors({ ...errors, password: 'Password must be at least 8 characters' });
      return;
    }

    try {
      const response = await fetch('/apis/changePassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrors({ ...errors, password: data.message || 'Failed to change password' });
        return;
      }

      setSuccessMessage('Password changed successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Password change error:', error);
      setErrors({ ...errors, password: 'Failed to change password' });
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUser({ ...user, avatarUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen bg-green-50 pl-64">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 px-10 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">My Account</h1>
          <p className="text-gray-600 text-lg mt-2">
            Manage your account settings and preferences
          </p>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 rounded-lg bg-green-100 text-green-700 border border-green-300">
            {successMessage}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading account information...</p>
          </div>
        ) : (

        <div className="grid grid-cols-12 gap-8">
          {/* USER DETAILS CARD */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 flex flex-col items-center">
              {/* Avatar & Upload */}
              <div className="relative">
                <img
                  src={user.avatarUrl ?? '/default-avatar.png'}
                  alt="Avatar"
                  className="w-28 h-28 rounded-full object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow cursor-pointer">
                  <Camera size={18} className="text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Name & Email */}
              <h2 className="mt-4 text-xl font-semibold text-gray-800">{user.fullName}</h2>
              <p className="text-gray-500 mt-1">{user.email}</p>

              {/* Status & Info */}
              <div className="mt-6 w-full space-y-4 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="flex items-center text-green-600 font-medium">
                    <CheckCircle size={16} className="mr-1" />
                    {user.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Member since</span>
                  <span className="font-medium">{user.memberSince}</span>
                </div>
                <div className="flex justify-between">
                  <span>Username</span>
                  <span className="font-medium">@{user.username}</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE FORMS */}
          <div className="col-span-12 md:col-span-8 space-y-8">
            {/* PROFILE INFORMATION FORM */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-800">Profile Information</h2>
              <p className="text-gray-500 mt-2 mb-6">
                View your account information.
              </p>

              {errors.profile && (
                <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
                  {errors.profile}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={user.firstName}
                      disabled
                      className="w-full rounded-lg bg-gray-100 border border-gray-200 p-3 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={user.lastName}
                      disabled
                      className="w-full rounded-lg bg-gray-100 border border-gray-200 p-3 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full rounded-lg bg-gray-100 border border-gray-200 p-3 cursor-not-allowed"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* CHANGE PASSWORD FORM */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <KeyRound size={24} className="mr-2 text-green-600" />
                Change Password
              </h2>
              <p className="text-gray-500 mt-2 mb-6">
                For security, use a strong password. Don't reuse old passwords.
              </p>

              {errors.password && (
                <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
                  {errors.password}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Current Password</label>
                  <input
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 p-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 p-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 p-3"
                      required
                    />
                  </div>
                </div>

                {errors.newPasswordMatch && (
                  <p className="text-red-500 text-sm">{errors.newPasswordMatch}</p>
                )}

                <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-medium">Password requirements:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>At least 8 characters</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Include at least one number</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
