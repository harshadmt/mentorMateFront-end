import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import {
  FiUser, FiMail, FiLock, FiAward, FiEdit2,
  FiLink, FiCheck, FiArrowLeft
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../../../../zustore/store";

const EditstudentProfile = () => {
  const navigate = useNavigate();
  const { fetchUser } = useUserStore();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    bio: "",
    profilePicture: "", // Changed from null to empty string for URL
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [profilePreview, setProfilePreview] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/user/profile", {
          withCredentials: true,
        });

        const { fullName, email, role, bio, profilePicture } = res.data.user || {}; 
       
        setFormData({
          fullName: fullName || "",
          email: email || "",
          password: "",
          role: role || "student",
          bio: bio || "",
          profilePicture: profilePicture || ""
        });

        // Set preview to current profile picture
        if (profilePicture) {
          setProfilePreview(profilePicture);
        }

      } catch (err) {
        setError("Failed to load profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBioChange = (e) => {
    const value = e.target.value;
    if (value.length <= 200) {
      setFormData(prev => ({ ...prev, bio: value }));
    }
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Use FormData to support file upload
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('bio', formData.bio);
      
      // Append file if it's a File object
      if (formData.profilePicture instanceof File) {
        submitData.append('profilePicture', formData.profilePicture);
      }

      // DO NOT set Content-Type header - let browser set it with boundary
      const response = await api.put(
        "/api/user/studentprofile", 
        submitData,
        {
          withCredentials: true,
        }
      );

      // Success response received
      setSuccess(true);
      
      // Refresh the profile data from backend
      const updatedProfile = await api.get("/api/user/profile", {
        withCredentials: true,
      });
      const { fullName, bio, profilePicture } = updatedProfile.data.user || {};
      
      // Update form data with fresh data
      setFormData(prev => ({
        ...prev,
        fullName: fullName || "",
        bio: bio || "",
        profilePicture: profilePicture || ""
      }));
      
      // Update preview with new image
      if (profilePicture) {
        setProfilePreview(profilePicture);
      }
      
      // Refresh global user store so dashboard updates with new image
      try {
        await fetchUser();
      } catch (fetchErr) {
        console.warn("Could not refresh user store:", fetchErr);
      }
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Profile update failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white relative">
            <button 
              onClick={() => navigate('/student/studentdashboard')}
              className="absolute left-6 top-6 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center px-10">
              <h2 className="text-3xl font-bold flex items-center justify-center">
                <FiEdit2 className="mr-3" /> Edit Your Profile
              </h2>
              <p className="text-center text-indigo-100 mt-2">
                Update your information to keep your profile fresh
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg mb-4">
                {profilePreview ? (
                  <img 
                    src={profilePreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "";
                    }}
                  />
                ) : (
                  <FiUser className="text-gray-400 text-5xl" />
                )}
              </div>
              
              <div className="w-full max-w-md">
                <label className="block text-sm font-medium text-gray-700 flex items-center mb-3">
                  <FiEdit2 className="mr-2 text-indigo-600" /> Change Profile Picture
                </label>
                <label className="block cursor-pointer">
                  <div className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-500 transition-all duration-300 bg-indigo-50 hover:bg-indigo-100">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📸</div>
                      <span className="text-gray-700 font-medium">Upload Image</span>
                      <span className="text-gray-500 text-xs block mt-1">PNG, JPG, GIF up to 5MB</span>
                    </div>
                    <input 
                      type="file" 
                      name="profilePicture" 
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden" 
                    />
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-2">Click to select a new image from your device</p>
              </div>
            </div>

            {/* Rest of the form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiUser className="mr-2 text-indigo-600" /> Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiMail className="mr-2 text-indigo-600" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiLock className="mr-2 text-indigo-600" /> Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiAward className="mr-2 text-indigo-600" /> Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  required
                >
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">About You</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleBioChange}
                rows="4"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                placeholder="Tell us about yourself..."
                maxLength="200"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/200 characters
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg">
                Profile updated successfully!
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center py-3 px-6 rounded-xl font-medium text-white transition-all ${
                  isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Make sure your information is up-to-date to get the best experience.
        </div>
      </div>
    </div>
  );
};

export default EditstudentProfile;