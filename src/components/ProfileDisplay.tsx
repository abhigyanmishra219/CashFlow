"use client";

import React, { useState } from "react";
import { User, useUser } from "../app/component/context/user-context";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  logout: () => Promise<void>;
}

export default function ProfileDisplay({ isOpen, onClose, user, logout }: ProfileDisplayProps) {
  const { login } = useUser();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhone, setEditPhone] = useState(user.phone || "");
  const [editPhotoUrl, setEditPhotoUrl] = useState(user.photoUrl || "");
  const [imgError, setImgError] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("PNG Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setEditPhotoUrl(result);
        setImgError(false);
        setIsEditingProfile(true);
      }
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    if (isOpen) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone || "");
      setEditPhotoUrl(user.photoUrl || "");
      setImgError(false);
      setIsEditingProfile(false);
      setError("");
      setSuccess("");
      setOldPassword("");
      setNewPassword("");
    }
  }, [isOpen, user]);

  const handleUpdateProfile = async () => {
    setError("");
    setSuccess("");
    setProfileLoading(true);
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, email: editEmail, phone: editPhone, photoUrl: editPhotoUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to update profile.");
      } else {
        setSuccess("Profile updated successfully!");
        login(data.user);
        setIsEditingProfile(false);
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password.");
      } else {
        setSuccess("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : "A";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6 relative font-sans text-slate-800"
          >

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">User Profile</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <div className="h-14 w-14 rounded-full bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center border border-indigo-500 shadow-md overflow-hidden">
              {(editPhotoUrl.trim() || user.photoUrl) && !imgError ? (
                <img
                  src={editPhotoUrl.trim() || user.photoUrl}
                  alt={user.name}
                  onClick={() => setIsPreviewOpen(true)}
                  className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  title="Click to view full image"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span>{initialLetter}</span>
              )}
            </div>
            
            {/* Hidden File Input for PNG Image Selection */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Camera / Edit Icon Badge */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload PNG Profile Picture"
              className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-1 shadow border-2 border-white transition-transform hover:scale-110 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </button>
          </div>

          <div className="flex-1">
            {isEditingProfile ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Full Name"
                className="w-full text-base font-extrabold text-slate-800 leading-tight bg-white border border-slate-200 rounded-md px-2 py-1 mb-1 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            ) : (
              <h4 className="text-base font-extrabold text-slate-800 leading-tight">{user.name}</h4>
            )}
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md mt-1.5 inline-block">
              {user.role}
            </span>
          </div>
        </div>

        {/* Contact info list */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
          {isEditingProfile && (
            <div className="border-b border-slate-200/60 pb-3 font-sans">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Profile Photo (PNG / JPEG)</span>
                {editPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditPhotoUrl("");
                      setImgError(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Select PNG Image
                </button>
                {editPhotoUrl ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    PNG Image Selected
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">No image selected</span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
            {isEditingProfile ? (
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-1/2 bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            ) : (
              <span className="font-semibold text-slate-700 select-all">{user.email}</span>
            )}
          </div>
          <div className="border-t border-slate-100"></div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Mobile Number</span>
            {isEditingProfile ? (
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-1/2 bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            ) : (
              <span className="font-semibold text-slate-700">{user.phone || "Not set"}</span>
            )}
          </div>
          <div className="pt-2 flex justify-end">
            {isEditingProfile ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  disabled={profileLoading}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateProfile}
                  disabled={profileLoading}
                  className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg"
                >
                  {profileLoading ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 uppercase tracking-wider"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Reset password section */}
        <form onSubmit={handleResetPassword} className="space-y-3.5 border-t border-slate-100 pt-4">
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reset Password</h5>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-3 text-xs font-semibold">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl p-3 text-xs font-semibold">
              {success}
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Old Password *</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Enter current password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Enter new password (min. 6 chars)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2 shadow-sm transition-all"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>

        {/* Logout Action */}
        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={logout}
            className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 shadow-md shadow-indigo-600/10 transition-all text-center"
          >
            Logout
          </button>
        </div>

          </motion.div>
        </motion.div>
      )}

      {/* Full Screen Image Preview Lightbox */}
      {isPreviewOpen && (editPhotoUrl.trim() || user.photoUrl) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsPreviewOpen(false)}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[70] cursor-zoom-out"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-2xl flex flex-col items-center justify-center overflow-hidden cursor-default"
          >
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full p-2 transition-colors z-10 shadow-lg cursor-pointer"
              title="Close Preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <img
              src={editPhotoUrl.trim() || user.photoUrl}
              alt={user.name}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-md"
            />
            
            <div className="pt-3 pb-1 text-center font-sans">
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{user.role}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
