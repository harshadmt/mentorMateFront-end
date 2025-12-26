import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowStudentSignup: true,
    allowMentorSignup: true,
  });

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingSettings(true);
      setLoadingProfile(true);
      try {
        const settingsRes = await api.get(
          "/api/admin/settings",
          { withCredentials: true }
        );
        if (settingsRes.data.success) {
          setSettings(settingsRes.data.data);
        } else {
          toast.error("Failed to load settings");
        }

        const profileRes = await api.get(
          "/api/admin/profile",
          { withCredentials: true }
        );
        if (profileRes.data.success) {
          setProfile(profileRes.data.data);
        } else {
          toast.error("Failed to load profile");
        }
      } catch (error) {
        toast.error("Error loading data");
      } finally {
        setLoadingSettings(false);
        setLoadingProfile(false);
      }
    };

    fetchData();
  }, []);

  const handleSettingsChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await api.put(
        "/api/admin/settings",
        settings,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Settings saved!");
      } else {
        toast.error(res.data.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Error saving settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await api.put(
        "/api/admin/profile",
        profile,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Profile updated!");
      } else {
        toast.error(res.data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        toastClassName="shadow-lg rounded-lg"
        progressClassName="bg-blue-500"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden"
        >
          {/* Header with Back Button */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white relative">
            <motion.button 
              onClick={() => navigate(-1)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="absolute left-6 top-6 flex items-center text-blue-100 hover:text-white transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              Back
            </motion.button>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-center"
            >
              Admin Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-blue-100 text-center"
            >
              Manage system settings and your profile
            </motion.p>
          </div>

          {/* Maintenance Mode Banner */}
          {settings.maintenanceMode && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-6 mt-6 rounded-lg border border-red-300 bg-red-50 text-red-700 p-4 font-semibold flex items-center space-x-3 shadow-sm"
            >
              <svg
                className="w-6 h-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12" y2="17"></line>
              </svg>
              <span>
                The system is currently in <strong>maintenance mode</strong>. User
                logins are disabled.
              </span>
            </motion.div>
          )}

          <div className="p-8">
            {/* Settings Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-10"
            >
              <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  System Settings
                </h2>
              </div>

              {loadingSettings ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveSettings();
                  }}
                  className="space-y-4"
                >
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="maintenanceMode"
                          checked={settings.maintenanceMode}
                          onChange={handleSettingsChange}
                          className="sr-only"
                        />
                        <div className={`block w-12 h-6 rounded-full ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${settings.maintenanceMode ? 'translate-x-6' : ''}`}></div>
                      </div>
                      <span className="text-gray-700 font-medium">
                        Maintenance Mode
                      </span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1 ml-16">
                      When enabled, all user logins will be disabled
                    </p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="allowStudentSignup"
                          checked={settings.allowStudentSignup}
                          onChange={handleSettingsChange}
                          className="sr-only"
                        />
                        <div className={`block w-12 h-6 rounded-full ${settings.allowStudentSignup ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${settings.allowStudentSignup ? 'translate-x-6' : ''}`}></div>
                      </div>
                      <span className="text-gray-700 font-medium">
                        Allow Student Signup
                      </span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1 ml-16">
                      Controls whether new students can register accounts
                    </p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="allowMentorSignup"
                          checked={settings.allowMentorSignup}
                          onChange={handleSettingsChange}
                          className="sr-only"
                        />
                        <div className={`block w-12 h-6 rounded-full ${settings.allowMentorSignup ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${settings.allowMentorSignup ? 'translate-x-6' : ''}`}></div>
                      </div>
                      <span className="text-gray-700 font-medium">
                        Allow Mentor Signup
                      </span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1 ml-16">
                      Controls whether new mentors can register accounts
                    </p>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={savingSettings}
                    whileTap={{ scale: 0.98 }}
                    className={`mt-6 px-6 py-3 rounded-lg text-white font-semibold shadow-md ${
                      savingSettings
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } transition-all`}
                  >
                    {savingSettings ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save Settings"
                    )}
                  </motion.button>
                </form>
              )}
            </motion.section>

            {/* Profile Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Admin Profile
                </h2>
              </div>

              {loadingProfile ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveProfile();
                  }}
                  className="space-y-6 max-w-lg"
                >
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.01 }}>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.01 }}>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      rows={4}
                    />
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={savingProfile}
                    whileTap={{ scale: 0.98 }}
                    className={`mt-2 px-6 py-3 rounded-lg text-white font-semibold shadow-md ${
                      savingProfile
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } transition-all`}
                  >
                    {savingProfile ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      "Update Profile"
                    )}
                  </motion.button>
                </form>
              )}
            </motion.section>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminSettingsPage;