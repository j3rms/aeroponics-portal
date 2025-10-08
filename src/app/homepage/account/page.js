'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, KeyRound, Camera, User, UserCircle, Mail, Shield, Calendar } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import Footer from '@/components/footer';

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

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = () => {
        setUser({ ...user, avatarUrl: reader.result });
        setSuccessMessage('Profile photo updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setUploadingAvatar(false);
      };
      reader.onerror = () => {
        alert('Failed to read image file');
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload image');
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 ml-64">
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-10 py-10 md:py-12">
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
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent pb-1 leading-tight">
                  My Account
                </h1>
                <p className="text-gray-600 text-lg mt-1">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </motion.div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 shadow-md flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">{successMessage}</span>
            </motion.div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">Loading account information...</p>
            </div>
          ) : (

          <div className="grid grid-cols-12 gap-6">
            {/* USER DETAILS CARD */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="col-span-12 md:col-span-4"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center">
                {/* Avatar & Upload */}
                <div className="relative mb-6">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-green-200 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border-4 border-green-200 shadow-lg">
                      <User className="w-20 h-20 text-white" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 p-3 rounded-full shadow-lg cursor-pointer transition-all hover:scale-110">
                    <Camera size={20} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Name & Email */}
                <h2 className="text-2xl font-bold text-gray-800 text-center">{user.fullName}</h2>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 mt-3 text-center bg-green-50 px-4 py-2 rounded-full">
                  Click camera icon to upload photo
                </p>
              </div>
            </motion.div>

            {/* RIGHT SIDE FORMS */}
            <div className="col-span-12 md:col-span-8 space-y-6">
              {/* PROFILE INFORMATION FORM */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  Profile Information
                </h2>
                <p className="text-gray-600 mt-3 mb-6">
                  View your account information.
                </p>

                {errors.profile && (
                  <div className="mb-4 p-4 rounded-xl bg-red-100 text-red-700 border-2 border-red-300 font-medium">
                    {errors.profile}
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">First Name</label>
                      <input
                        type="text"
                        value={user.firstName}
                        disabled
                        className="w-full rounded-xl bg-gray-100 border-2 border-gray-200 p-4 cursor-not-allowed font-medium text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">Last Name</label>
                      <input
                        type="text"
                        value={user.lastName}
                        disabled
                        className="w-full rounded-xl bg-gray-100 border-2 border-gray-200 p-4 cursor-not-allowed font-medium text-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">Email Address</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full rounded-xl bg-gray-100 border-2 border-gray-200 p-4 cursor-not-allowed font-medium text-gray-600"
                      />
                    </div>
                  </div>
                </form>
              </motion.div>

              {/* CHANGE PASSWORD FORM */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-green-100 shadow-lg hover:shadow-2xl transition-all duration-300 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <KeyRound className="w-6 h-6 text-white" />
                  </div>
                  Change Password
                </h2>
                <p className="text-gray-600 mt-3 mb-6">
                  For security, use a strong password. Don't reuse old passwords.
                </p>

                {errors.password && (
                  <div className="mb-4 p-4 rounded-xl bg-red-100 text-red-700 border-2 border-red-300 font-medium">
                    {errors.password}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">Current Password</label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-4 transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">New Password</label>
                      <input
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-4 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-3">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-4 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {errors.newPasswordMatch && (
                    <p className="text-red-600 font-medium">{errors.newPasswordMatch}</p>
                  )}

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
                    <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Password requirements:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                        At least 8 characters
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                        Include uppercase and lowercase letters
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                        Include at least one number
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <KeyRound className="w-5 h-5" />
                      Update Password
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
