import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle,
  FiClock,
  FiAward,
  FiBookOpen,
  FiBarChart2,
  FiExternalLink,
  FiAlertCircle,
  FiArrowLeft,
  FiChevronRight,
  FiChevronLeft
} from 'react-icons/fi';

const PurchasedRoadmap = () => {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const stepRefs = useRef([]);
  const [activeTab, setActiveTab] = useState('learning-path');

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const response = await api.get(
          '/api/student/my-roadmap',
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.data.success) {
          setRoadmaps(response.data.unlocked);
          if (response.data.unlocked.length > 0) {
            setSelectedRoadmap(response.data.unlocked[0]);
          }
        } else {
          setError(response.data.message || 'Failed to load roadmaps');
        }
      } catch (err) {
        console.error('Error fetching roadmaps:', err);
        const errorMessage = err.response?.data?.message || 'You do not have access to any roadmaps';
        setError(errorMessage);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, [navigate]);

  const getResourceIcon = (type) => {
    const icons = {
      video: '🎥',
      article: '📄',
      exercise: '💻',
      cheatsheet: '📋',
      template: '🚀'
    };
    return (
      <span className={`text-xl ${
        type === 'video' ? 'text-red-400' :
        type === 'article' ? 'text-blue-400' :
        type === 'exercise' ? 'text-green-400' :
        type === 'cheatsheet' ? 'text-yellow-400' :
        'text-purple-400'
      }`}>
        {icons[type] || '📚'}
      </span>
    );
  };

  const handleContinueLearning = () => {
    if (!selectedRoadmap || !selectedRoadmap.steps) {
      alert('No roadmap selected or no steps available.');
      return;
    }

    const firstUncompletedStepIndex = selectedRoadmap.steps.findIndex(step => !step.completed);
    
    if (firstUncompletedStepIndex === -1) {
      alert('Congratulations! You have completed all steps in this roadmap.');
      return;
    }

    const stepElement = stepRefs.current[firstUncompletedStepIndex];
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.2, repeat: Infinity, repeatType: "reverse" }
          }}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg"
        >
          <FiBookOpen className="text-xl sm:text-2xl" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-red-500 to-red-400 p-4 sm:p-6 text-white text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiAlertCircle className="mx-auto text-4xl sm:text-5xl" />
            </motion.div>
          </div>
          <div className="p-4 sm:p-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-3 sm:space-y-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoBack}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center"
              >
                <FiChevronLeft className="mr-2" />
                Go Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/student/roadmaps')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                My Roadmaps
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden text-center"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 text-white">
            <FiBookOpen className="mx-auto text-4xl sm:text-5xl" />
          </div>
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No Roadmaps Found</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">You haven't unlocked any roadmaps yet</p>
            <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-3 sm:space-y-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoBack}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center"
              >
                <FiChevronLeft className="mr-2" />
                Go Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/student/studentdashboard')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Dashboard
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSelectRoadmap = (roadmap) => {
    setSelectedRoadmap(roadmap);
    stepRefs.current = [];
    setActiveTab('learning-path');
  };

  const completedSections = selectedRoadmap?.steps?.filter((s) => s.completed).length || 0;
  const totalSections = selectedRoadmap?.steps?.length || 0;
  const allResources = selectedRoadmap?.steps?.flatMap((s) => s.resources || []) || [];
  const completedResources = allResources.filter((r) => r.completed).length;
  const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: Math.random() * 100,
            x: Math.random() * 100,
            opacity: 0.2
          }}
          animate={{ 
            y: [Math.random() * 100, Math.random() * -100],
            x: [Math.random() * 100, Math.random() * -100],
          }}
          transition={{
            duration: 20 + Math.random() * 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          className={`absolute rounded-full ${i % 2 === 0 ? 'bg-blue-200' : 'bg-blue-100'}`}
          style={{
            width: `${20 + Math.random() * 40}px`,
            height: `${20 + Math.random() * 40}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            filter: 'blur(12px)',
            opacity: 0.15
          }}
        />
      ))}

      {/* Roadmap List */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white py-4 sm:py-6 md:py-8 px-4 sm:px-6 shadow-sm"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="flex items-center text-gray-600 hover:text-gray-800 text-xs sm:text-sm font-medium"
            >
              <FiChevronLeft className="mr-1" />
              Back
            </motion.button>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent px-2">
              My Learning Paths
            </h2>
            <div className="w-10 sm:w-16 md:w-20"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {roadmaps.map((roadmap, index) => {
              const roadmapProgress = roadmap.steps?.length > 0 
                ? Math.round((roadmap.steps.filter(s => s.completed).length / roadmap.steps.length) * 100)
                : 0;
              
              return (
                <motion.div
                  key={roadmap._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
                  onClick={() => handleSelectRoadmap(roadmap)}
                  className={`relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer transition-all ${
                    selectedRoadmap?._id === roadmap._id
                      ? 'ring-2 sm:ring-4 ring-blue-400'
                      : 'hover:ring-1 sm:hover:ring-2 hover:ring-blue-300'
                  } bg-white shadow-sm sm:shadow-md`}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${roadmapProgress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full ${
                        roadmapProgress === 100 ? 'bg-green-400' : 'bg-blue-400'
                      }`}
                    />
                  </div>
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 sm:p-3 rounded-lg mr-2 sm:mr-3 md:mr-4">
                        <FiBookOpen className="text-blue-600 text-base sm:text-lg md:text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 line-clamp-2">{roadmap.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{roadmap.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500 truncate max-w-[120px] sm:max-w-none">
                        {roadmap.createdBy?.fullName || 'Unknown Mentor'}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        roadmapProgress === 100 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {roadmapProgress}% Complete
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Selected Roadmap Details */}
      {selectedRoadmap && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg mb-4 sm:mb-6 md:mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-90"></div>
            <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-12">
              <motion.button
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoBack}
                className="mb-3 sm:mb-4 md:mb-6 flex items-center text-white/90 hover:text-white text-xs sm:text-sm font-medium"
              >
                <FiChevronLeft className="mr-1 sm:mr-2" />
                Back
              </motion.button>

              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div className="mb-4 md:mb-0">
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2"
                  >
                    {selectedRoadmap.title}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm sm:text-base md:text-lg text-white/90 max-w-3xl"
                  >
                    {selectedRoadmap.description}
                  </motion.p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 sm:mt-4 md:mt-0"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
                    <div className="flex items-center">
                      <div className="bg-white/20 p-1 sm:p-2 rounded-full mr-2 sm:mr-3">
                        <FiClock className="text-white text-sm sm:text-base" />
                      </div>
                      <div>
                        <p className="text-xs text-white/70">Estimated Duration</p>
                        <p className="text-white font-medium text-sm sm:text-base">{selectedRoadmap.duration || 'Self-paced'}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden sticky top-4 sm:top-8"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 sm:p-6 text-white">
                  <h3 className="text-lg sm:text-xl font-bold flex items-center">
                    <FiBarChart2 className="mr-2 text-sm sm:text-base" />
                    Progress Overview
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Completion</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-800">{progress}%</p>
                    </div>
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e6e6e6"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray={`${progress}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm sm:text-lg font-bold text-gray-700">{progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                        <span>Sections</span>
                        <span className="font-medium">{completedSections}/{totalSections}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(completedSections / totalSections) * 100}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-2 bg-blue-500 rounded-full"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                        <span>Resources</span>
                        <span className="font-medium">{completedResources}/{allResources.length}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(completedResources / allResources.length) * 100}%` }}
                          transition={{ duration: 1, delay: 0.4 }}
                          className="h-2 bg-green-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinueLearning}
                    className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center text-sm sm:text-base"
                  >
                    Continue Learning
                    <FiChevronRight className="ml-1 sm:ml-2" />
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('learning-path')}
                      className={`py-3 px-4 sm:py-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm flex items-center justify-center whitespace-nowrap ${
                        activeTab === 'learning-path'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FiBookOpen className="mr-1 sm:mr-2 text-sm sm:text-base" />
                      Learning Path
                    </button>
                    <button
                      onClick={() => setActiveTab('resources')}
                      className={`py-3 px-4 sm:py-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm flex items-center justify-center whitespace-nowrap ${
                        activeTab === 'resources'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FiAward className="mr-1 sm:mr-2 text-sm sm:text-base" />
                      All Resources
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-3 sm:p-4 md:p-6">
                  {activeTab === 'learning-path' && (
                    <div className="space-y-3 sm:space-y-4 md:space-y-6">
                      {selectedRoadmap.steps?.map((step, index) => (
                        <motion.div
                          key={index}
                          ref={(el) => (stepRefs.current[index] = el)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                          whileHover={{ y: -2 }}
                          className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-gray-200 hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-start">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mr-2 sm:mr-3 md:mr-4 flex-shrink-0 ${
                              step.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {step.completed ? (
                                <FiCheckCircle className="text-base sm:text-lg md:text-xl" />
                              ) : (
                                <span className="font-bold text-sm sm:text-base md:text-lg">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                                  {step.title}
                                </h3>
                                {step.completed && (
                                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mt-1 sm:mt-0">
                                    Completed
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">{step.description}</p>

                              {step.resources?.length > 0 && (
                                <div className="mt-3 sm:mt-4 md:mt-6">
                                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 flex items-center">
                                    <FiAward className="mr-1 sm:mr-2" />
                                    Resources
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                                    {step.resources.map((res, i) => (
                                      <motion.a
                                        key={i}
                                        whileHover={{ y: -1 }}
                                        href={res.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-start"
                                      >
                                        <div className="mr-2 sm:mr-3 md:mr-4 text-xl sm:text-2xl">
                                          {getResourceIcon(res.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-medium text-gray-900 text-sm sm:text-base truncate">{res.name}</h5>
                                          <div className="flex items-center mt-1 text-xs sm:text-sm text-gray-500">
                                            <FiClock className="mr-1 text-xs" />
                                            {res.duration || '—'} • {res.type}
                                          </div>
                                        </div>
                                        {res.completed ? (
                                          <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0">
                                            Completed
                                          </span>
                                        ) : (
                                          <FiExternalLink className="ml-2 text-gray-400 flex-shrink-0" />
                                        )}
                                      </motion.a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'resources' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                      {allResources.map((resource, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.03 }}
                          whileHover={{ y: -3 }}
                          className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex items-start">
                            <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 md:mr-4">
                              {getResourceIcon(resource.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{resource.name}</h4>
                              <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center">
                                <FiClock className="mr-1 text-xs" />
                                {resource.duration || '—'} • {resource.type}
                              </p>
                              {resource.completed && (
                                <span className="inline-block mt-1 sm:mt-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                          <a
                            href={resource.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 sm:mt-3 md:mt-4 inline-flex items-center text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Open Resource
                            <FiExternalLink className="ml-1" />
                          </a>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasedRoadmap;