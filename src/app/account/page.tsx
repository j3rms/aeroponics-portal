'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, KeyRound, Camera } from 'lucide-react';
import Sidebar from '@/components/sidebar';

export default function MyAccount() {
  const [user, setUser] = useState({
    fullName: 'Jeremy Ryan Quiroz',
    email: 'jeremy@example.com',
    username: 'jeremy123',
    status: 'Active',
    memberSince: 'March 2024',
    avatarUrl: null as string | null,
  });

  const [editMode, setEditMode] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [errors, setErrors] = useState({
    newPasswordMatch: '',
  });

  // Reset password error hint when new / confirm change
  useEffect(() => {
    if (passwords.new && passwords.confirm && passwords.new !== passwords.confirm) {
      setErrors({ ...errors, newPasswordMatch: 'Passwords do not match.' });
    } else {
      setErrors({ ...errors, newPasswordMatch: '' });
    }
  }, [passwords.new, passwords.confirm]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: validate & send to backend
    alert('Profile updated!');
    setEditMode(false);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      // Already handled by error message
      return;
    }
    // TODO: API call
    alert('Password changed!');
    // Clear passwords
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // simple preview
      const reader = new FileReader();
      reader.onload = () => {
        setUser({ ...user, avatarUrl: reader.result as string });
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            My Account
          </h1>
          <p className="text-gray-600 text-lg mt-2">
            Manage your account settings and preferences
          </p>
        </motion.div>

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
              <h2 className="mt-4 text-xl font-semibold text-gray-800">
                {user.fullName}
              </h2>
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

              {/* Edit Button */}
              <button
                onClick={() => setEditMode(!editMode)}
                className="mt-6 px-6 py-2 rounded-full border border-green-600 text-green-600 hover:bg-green-50 transition"
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* RIGHT SIDE FORMS */}
          <div className="col-span-12 md:col-span-8 space-y-8">
            {/* PROFILE INFORMATION FORM */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-800">
                Profile Information
              </h2>
              <p className="text-gray-500 mt-2 mb-6">
                Update your personal info. Some fields may be disabled.
              </p>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={user.fullName}
                      onChange={(e) =>
                        setUser({ ...user, fullName: e.target.value })
                      }
                      disabled={!editMode}
                      className={`w-full rounded-lg border ${
                        editMode
                          ? 'border-gray-300 focus:ring-2 focus:ring-green-500'
                          : 'bg-gray-100 border-gray-200 cursor-not-allowed'
                      } p-3`}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="w-full rounded-lg bg-gray-100 border border-gray-200 p-3 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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

                {editMode && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* CHANGE PASSWORD FORM */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <KeyRound size={24} className="mr-2 text-green-600" />
                Change Password
              </h2>
              <p className="text-gray-500 mt-2 mb-6">
                For security, use a strong password. Don’t reuse old passwords.
              </p>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
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
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 p-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
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
      </div>
    </div>
  );
}
