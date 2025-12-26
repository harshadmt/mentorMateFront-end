import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, BookOpen, Clock, CheckCircle, Award, X, ChevronRight, Star, Bookmark } from 'lucide-react';
import api from '../../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const ViewStudentProfile = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [roadmapDetails, setRoadmapDetails] = useState(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/api/mentor/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudent(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const fetchRoadmapDetails = async (roadmapId) => {
    try {
      setLoadingRoadmap(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await api.get(`/api/roadmaps/${roadmapId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        setRoadmapDetails(response.data);
      } else {
        throw new Error('Received empty response from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 
               err.response?.data?.error || 
               err.message || 
               'Failed to fetch roadmap details');
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleViewRoadmap = async (roadmap) => {
    setSelectedRoadmap(roadmap);
    await fetchRoadmapDetails(roadmap.roadmapId);
  };

  const closeModal = () => {
    setSelectedRoadmap(null);
    setRoadmapDetails(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse" }
            }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-600"
          >
            Loading student profile...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error && !selectedRoadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-red-500 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </motion.div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-all"
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-12">
      {/* Floating background elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: Math.random() * 100,
            x: Math.random() * 100,
            opacity: 0.3
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
            width: `${10 + Math.random() * 30}px`,
            height: `${10 + Math.random() * 30}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            filter: 'blur(8px)',
            opacity: 0.3
          }}
        />
      ))}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative py-6">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="absolute left-0 top-6 p-2 rounded-lg hover:bg-blue-50 transition-all flex items-center"
            >
              <ArrowLeft className="w-5 h-5 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-blue-600">Back to Students</span>
            </motion.button>
            
            <div className="text-center px-10">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-800"
              >
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Student Profile
                </span>
              </motion.h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 opacity-20 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="flex flex-col md:flex-row items-center relative z-10">
              <div className="relative mb-4 md:mb-0 md:mr-6">
                {student.profilePicture ? (
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    src={student.profilePicture} 
                    alt={student.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-lg"
                  >
                    {student.fullName.charAt(0)}
                  </motion.div>
                )}
              </div>
              
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold">{student.fullName}</h2>
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <Mail className="w-5 h-5 mr-2" />
                  <span>{student.email}</span>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 max-w-2xl"
                >
                  {student.bio || 'Enthusiastic learner focused on skill development'}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-t border-gray-200">
            {[
              { icon: <BookOpen className="w-5 h-5 mr-2" />, label: 'Roadmaps', value: student.purchasedRoadmaps?.length || 0, color: 'text-blue-600' },
              { icon: <CheckCircle className="w-5 h-5 mr-2" />, label: 'Completed', value: student.completedRoadmaps?.length || 0, color: 'text-green-600' },
              { icon: <Clock className="w-5 h-5 mr-2" />, label: 'In Progress', value: student.purchasedRoadmaps?.length - (student.completedRoadmaps?.length || 0), color: 'text-yellow-500' },
              { icon: <Award className="w-5 h-5 mr-2" />, label: 'Achievements', value: student.achievements?.length || 0, color: 'text-blue-600' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 text-center"
              >
                <div className="text-gray-500 flex items-center justify-center">
                  {stat.icon}
                  <span>{stat.label}</span>
                </div>
                <div className={`text-2xl font-bold ${stat.color} mt-1`}>
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Roadmaps Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
            Enrolled Roadmaps
          </h2>

          {student.purchasedRoadmaps?.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {student.purchasedRoadmaps.map((roadmap, index) => {
                const isCompleted = student.completedRoadmaps?.includes(roadmap.roadmapId);
                const progressPercentage = roadmap.progress ? Math.round(roadmap.progress * 100) : 0;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, type: "spring", stiffness: 100 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)" }}
                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all"
                  >
                    <div className={`h-2 ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`}></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800">{roadmap.title}</h3>
                        {isCompleted && (
                          <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </motion.span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Enrolled {new Date(roadmap.purchaseDate).toLocaleDateString()}</span>
                      </div>
                      
                      {!isCompleted && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-blue-600">{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercentage}%` }}
                              transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                              className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                            />
                          </div>
                        </div>
                      )}
                      
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleViewRoadmap(roadmap)}
                        className="w-full flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-lg transition-all text-sm font-medium"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
                className="text-blue-400 mb-4 mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center"
              >
                <BookOpen className="w-12 h-12" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Roadmaps Yet</h3>
              <p className="text-gray-600 mb-6">
                This student hasn't enrolled in any of your roadmaps yet.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/mentor/roadmaps')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-all flex items-center mx-auto"
              >
                Create New Roadmap
                <ChevronRight className="w-4 h-4 ml-1" />
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Roadmap Details Modal */}
      <AnimatePresence>
        {selectedRoadmap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
            >
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
                  {roadmapDetails?.title || selectedRoadmap.title}
                </h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              
              {loadingRoadmap ? (
                <div className="p-8 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-600">Loading roadmap details...</p>
                </div>
              ) : error ? (
                <div className="text-center p-8">
                  <div className="text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">{error}</h4>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchRoadmapDetails(selectedRoadmap.roadmapId)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm mt-4"
                  >
                    Try Again
                  </motion.button>
                </div>
              ) : (
                <div className="p-6">
                  {/* Roadmap Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <div className="flex items-center mb-2">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            student.completedRoadmaps?.includes(selectedRoadmap.roadmapId) 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {student.completedRoadmaps?.includes(selectedRoadmap.roadmapId) 
                            ? 'Completed' 
                            : 'In Progress'}
                        </motion.span>
                        {roadmapDetails?.category && (
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="ml-2 px-3 py-1 rounded-full bg-purple-100 text-blue-800 text-sm font-medium"
                          >
                            {roadmapDetails.category}
                          </motion.span>
                        )}
                      </div>
                      <p className="text-gray-600">{roadmapDetails?.description || 'No description available'}</p>
                    </div>
                    
                    {roadmapDetails?.duration && (
                      <motion.div
                        whileHover={{ y: -3 }}
                        className="mt-4 md:mt-0 bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center text-gray-700">
                          <Clock className="w-5 h-5 mr-2 text-blue-500" />
                          <span className="font-medium">Estimated Duration:</span>
                          <span className="ml-1">{roadmapDetails.duration}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Learning Path */}
                  {roadmapDetails?.steps?.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
                        <Bookmark className="w-5 h-5 mr-2 text-blue-500" />
                        Learning Path
                      </h4>
                      <div className="space-y-4">
                        {roadmapDetails.steps.map((step, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-8"
                          >
                            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            </div>
                            <div className={`border-l-2 ${index === roadmapDetails.steps.length - 1 ? 'border-transparent' : 'border-blue-200'} pl-6 pb-6`}>
                              <motion.div
                                whileHover={{ y: -3 }}
                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                              >
                                <div className="font-medium text-gray-800 flex items-center">
                                  {step.week && (
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                                      Week {step.week}
                                    </span>
                                  )}
                                  {step.title}
                                </div>
                                {step.description && (
                                  <p className="text-gray-600 text-sm mt-2">{step.description}</p>
                                )}
                                {step.completed && (
                                  <div className="mt-2 flex items-center text-sm text-green-600">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Completed on {new Date(step.completed).toLocaleDateString()}
                                  </div>
                                )}
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {roadmapDetails?.resources?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-blue-500" />
                        Recommended Resources
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {roadmapDetails.resources.map((resource, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                          >
                            <div className="flex items-start">
                              <motion.div
                                whileHover={{ rotate: 10 }}
                                className={`p-2 rounded-lg mr-3 ${
                                  resource.type === 'video' ? 'bg-red-100 text-red-600' :
                                  resource.type === 'article' ? 'bg-blue-100 text-blue-600' :
                                  resource.type === 'book' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-purple-100 text-blue-600'
                                }`}
                              >
                                {resource.type === 'video' ? (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                                  </svg>
                                ) : resource.type === 'article' ? (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                  </svg>
                                ) : resource.type === 'book' ? (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </motion.div>
                              <div>
                                <div className="font-medium text-gray-800">{resource.name}</div>
                                <div className="text-sm text-gray-500 capitalize">{resource.type}</div>
                                {resource.link && (
                                  <motion.a
                                    whileHover={{ x: 3 }}
                                    href={resource.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                                  >
                                    Open Resource
                                    <ChevronRight className="w-4 h-4 inline ml-1" />
                                  </motion.a>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={closeModal}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-all"
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewStudentProfile;