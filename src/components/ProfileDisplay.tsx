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
  const [profileLoading, setProfileLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone || "");
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
        body: JSON.stringify({ name: editName, email: editEmail, phone: editPhone }),
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
          <div className="h-14 w-14 rounded-full bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center border border-indigo-500 shadow-md">
            {initialLetter}
          </div>
          <div className="flex-1">
            {isEditingProfile ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
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
    </AnimatePresence>
  );
}
