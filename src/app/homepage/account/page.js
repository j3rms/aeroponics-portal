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
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [cropBox, setCropBox] = useState({ x: 100, y: 100, size: 200 });
  const [dragging, setDragging] = useState(null); // 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se'
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, box: null });
  const containerSize = { w: 400, h: 400 };

  // Attach Authorization header from localStorage so API routes can fallback if server session is missing
  const getAuthHeaders = () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  };

  const fetchProfilePicture = async () => {
    try {
      const res = await fetch(`/apis/profilePicture`, { 
        method: 'GET',
        headers: { ...getAuthHeaders() },
      });
      if (res.ok) {
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        setUser((prev) => {
          if (prev.avatarUrl) {
            try { URL.revokeObjectURL(prev.avatarUrl); } catch {}
          }
          return { ...prev, avatarUrl: objectUrl };
        });
      } else if (res.status === 404) {
        // no profile picture set
        setUser((prev) => ({ ...prev, avatarUrl: null }));
      }
    } catch (e) {
      // ignore errors for avatar fetch
    }
  };

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

    fetchUserData().then(() => fetchProfilePicture());
  }, []);

  // Also refresh avatar when window regains focus
  useEffect(() => {
    const onFocus = () => { fetchProfilePicture(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
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

    try {
      const objectUrl = URL.createObjectURL(file);
      setTempImageUrl(objectUrl);
      setPendingFile(file);
      setShowCropper(true);
    } catch {}
  };

  const confirmCropAndUpload = async () => {
    if (!tempImageUrl || !pendingFile) { setShowCropper(false); return; }
    setUploadingAvatar(true);
    try {
      const img = document.createElement('img');
      const load = new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      img.src = tempImageUrl;
      await load;
      // Fit image into 400x400 container using object-contain to compute mapping
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const cw = containerSize.w;
      const ch = containerSize.h;
      const scale = Math.min(cw / iw, ch / ih);
      const displayedW = iw * scale;
      const displayedH = ih * scale;
      const offsetLeft = (cw - displayedW) / 2;
      const offsetTop = (ch - displayedH) / 2;
      // Clamp crop box to visible image area
      const bx = Math.max(cropBox.x, offsetLeft);
      const by = Math.max(cropBox.y, offsetTop);
      const bRight = Math.min(cropBox.x + cropBox.size, offsetLeft + displayedW);
      const bBottom = Math.min(cropBox.y + cropBox.size, offsetTop + displayedH);
      const bSize = Math.max(0, Math.min(bRight - bx, bBottom - by));
      if (bSize <= 0) throw new Error('Invalid crop area');
      // Map to natural image coordinates
      const sx = (bx - offsetLeft) / scale;
      const sy = (by - offsetTop) / scale;
      const sSize = bSize / scale;
      // Render to 512x512 square
      const outSize = 512;
      const canvas = document.createElement('canvas');
      canvas.width = outSize;
      canvas.height = outSize;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, outSize, outSize);
      ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, outSize, outSize);
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
      const formData = new FormData();
      const croppedFile = new File([blob], pendingFile.name.replace(/\.[^/.]+$/, '') + '_cropped.jpg', { type: 'image/jpeg' });
      formData.append('file', croppedFile);
      const res = await fetch(`/apis/uploadProfilePicture`, { method: 'POST', headers: { ...getAuthHeaders() }, body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.message || 'Failed to upload image';
        alert(msg);
        setUploadingAvatar(false);
        return;
      }
      if (tempImageUrl) { try { URL.revokeObjectURL(tempImageUrl); } catch {} }
      setTempImageUrl(null);
      setPendingFile(null);
      setShowCropper(false);
      await fetchProfilePicture();
      try { window.dispatchEvent(new Event('profile-picture-updated')); } catch {}
      setSuccessMessage('Profile photo updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      try { window.location.reload(); } catch {}
    } catch (error) {
      alert('Failed to process image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const cancelCrop = () => {
    if (tempImageUrl) { try { URL.revokeObjectURL(tempImageUrl); } catch {} }
    setTempImageUrl(null);
    setPendingFile(null);
    setShowCropper(false);
  };

  // Crop interactions
  const onCropMouseDown = (e, mode) => {
    e.preventDefault();
    setDragging(mode);
    setDragStart({ x: e.clientX, y: e.clientY, box: { ...cropBox } });
  };
  const onCropMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    if (dragging === 'move') {
      let nx = dragStart.box.x + dx;
      let ny = dragStart.box.y + dy;
      nx = Math.max(0, Math.min(nx, containerSize.w - dragStart.box.size));
      ny = Math.max(0, Math.min(ny, containerSize.h - dragStart.box.size));
      setCropBox({ ...cropBox, x: nx, y: ny });
    } else {
      const minSize = 50;
      let { x, y, size } = dragStart.box;
      const applyBounds = () => {
        // keep within container
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x + size > containerSize.w) x = Math.max(0, containerSize.w - size);
        if (y + size > containerSize.h) y = Math.max(0, containerSize.h - size);
        size = Math.max(minSize, Math.min(size, containerSize.w, containerSize.h));
      };
      const diagResize = (signX, signY) => {
        // increase or decrease size based on dominant movement while preserving square
        const delta = Math.max(signX * dx, signY * dy);
        let nsize = size + delta;
        if (nsize < minSize) nsize = minSize;
        // adjust origin when resizing from north or west
        let nx = x, ny = y;
        if (signX < 0) nx = x + (size - nsize);
        if (signY < 0) ny = y + (size - nsize);
        x = nx; y = ny; size = nsize; applyBounds();
      };

      switch (dragging) {
        case 'resize-nw': diagResize(-1, -1); break;
        case 'resize-ne': diagResize(1, -1); break;
        case 'resize-sw': diagResize(-1, 1); break;
        case 'resize-se': diagResize(1, 1); break;
      }
      setCropBox({ x, y, size });
    }
  };
  const onCropMouseUp = () => setDragging(null);

  // no-op for reverted crop box

  // Ensure dragging works even if mouse leaves overlay
  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => onCropMouseMove(e);
    const handleUp = () => setDragging(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 md:pl-64 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1">
        {showCropper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onMouseMove={onCropMouseMove} onMouseUp={onCropMouseUp}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="text-lg font-semibold mb-4">Adjust Profile Picture</div>
              <div className="mx-auto mb-4 bg-gray-100 flex items-center justify-center" style={{ width: `${containerSize.w}px`, height: `${containerSize.h}px`, position: 'relative', overflow: 'hidden' }}>
                {tempImageUrl && (
                  <img src={tempImageUrl} alt="crop" className="object-contain w-full h-full select-none" draggable={false} />
                )}
                {/* Crop box */}
                <div
                  style={{ left: `${cropBox.x}px`, top: `${cropBox.y}px`, width: `${cropBox.size}px`, height: `${cropBox.size}px` }}
                  className="absolute border-2 border-green-500 bg-green-500/10 cursor-move"
                  onMouseDown={(e) => onCropMouseDown(e, 'move')}
                >
                  {/* Corner handles */}
                  <div onMouseDown={(e) => { e.stopPropagation(); onCropMouseDown(e, 'resize-nw'); }} className="absolute w-3 h-3 bg-green-600 -left-1.5 -top-1.5 rounded-sm cursor-nw-resize" />
                  <div onMouseDown={(e) => { e.stopPropagation(); onCropMouseDown(e, 'resize-ne'); }} className="absolute w-3 h-3 bg-green-600 -right-1.5 -top-1.5 rounded-sm cursor-ne-resize" />
                  <div onMouseDown={(e) => { e.stopPropagation(); onCropMouseDown(e, 'resize-sw'); }} className="absolute w-3 h-3 bg-green-600 -left-1.5 -bottom-1.5 rounded-sm cursor-sw-resize" />
                  <div onMouseDown={(e) => { e.stopPropagation(); onCropMouseDown(e, 'resize-se'); }} className="absolute w-3 h-3 bg-green-600 -right-1.5 -bottom-1.5 rounded-sm cursor-se-resize" />
                  {/* Corner-only resizing for even square */}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={cancelCrop} className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">Cancel</button>
                <button onClick={confirmCropAndUpload} disabled={uploadingAvatar} className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">Confirm</button>
              </div>
            </div>
          </div>
        )}
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
            
            <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-start md:text-left gap-4 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent pb-1 leading-tight">
                  My Account
                </h1>
                <p className="text-gray-600 text-base md:text-lg mt-1">
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
