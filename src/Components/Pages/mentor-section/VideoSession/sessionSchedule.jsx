import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useUserStore from '../../../../../zustore/store';

const ScheduleSession = () => {
  // Get user data from store
  const { user, fetchUser } = useUserStore();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    topic: '',
    scheduledAt: '',
  });
  const [serverErrors, setServerErrors] = useState({});

  const navigate = useNavigate();

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user data first
        await fetchUser();
        
        // Only fetch students if user is authenticated
        if (user?._id) {
          await fetchStudents();
        } else {
          toast.error('Please login to schedule sessions');
          navigate('/login');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        toast.error('Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [fetchUser, navigate, user?._id]);

  // Fetch students list
  const fetchStudents = async () => {
    try {
      const { data } = await api.get(`/api/mentor/students`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!data?.success) {
        throw new Error(data?.message || 'Failed to fetch students');
      }

      const studentsData = Array.isArray(data?.data) 
        ? data.data.map(student => ({
            _id: student.id,
            name: student.fullName,
            email: student.email,
          }))
        : [];
      
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      let errorMessage = 'Failed to load students';
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = error.message || errorMessage;
      }

      toast.error(errorMessage);
      setStudents([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    // Clear server errors when user edits the field
    if (serverErrors[name]) {
      setServerErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.studentId) {
      errors.studentId = 'Please select a student';
    }
    
    if (!formData.topic || formData.topic.length < 5) {
      errors.topic = 'Topic must be at least 5 characters';
    }
    
    if (!formData.scheduledAt) {
      errors.scheduledAt = 'Please select a date and time';
    } else {
      const selectedDate = new Date(formData.scheduledAt);
      if (selectedDate < new Date()) {
        errors.scheduledAt = 'Please select a future date and time';
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setServerErrors(validationErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    // Ensure user is authenticated
    if (!user?._id) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setServerErrors({});

    try {
      // Prepare the request data
      const requestData = {
        student: formData.studentId, // Matches backend expectation
        topic: formData.topic,
        scheduledAt: new Date(formData.scheduledAt).toISOString(), // Proper ISO format
        mentor: user._id // From user store
      };

      // Submitting session data

      const response = await api.post(
        `/api/videosession/schedule`,
        requestData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000 // 10 second timeout
        }
      );

      // Session created

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Session creation failed');
      }

      toast.success('Session scheduled successfully!');
      navigate('/mentor/mysession');
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        stack: error.stack
      });

      // Handle specific error cases
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again.');
      } 
      else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your connection.');
      }
      else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      }
      else if (error.response?.data?.errors) {
        // Server validation errors
        setServerErrors(error.response.data.errors);
        toast.error('Please fix the highlighted errors');
      }
      else {
        toast.error(
          error.response?.data?.message || 
          'Failed to schedule session. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentDateTimeString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Schedule a Live Session
          </h2>
          <p className="mt-3 text-xl text-gray-600">
            Connect with your students for real-time learning
          </p>
        </div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Student
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {isLoading ? (
                  <div className="flex items-center justify-center h-10">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`block w-full pl-3 pr-10 py-2 text-base border ${
                      serverErrors.studentId ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md transition-all duration-200`}
                    required
                    disabled={students.length === 0}
                  >
                    <option value="">-- Choose a student --</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                    {students.length === 0 && (
                      <option disabled>No students available</option>
                    )}
                  </select>
                )}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {serverErrors.studentId && (
                <p className="text-sm text-red-600 mt-1">{serverErrors.studentId}</p>
              )}
              {!isLoading && students.length === 0 && !serverErrors.studentId && (
                <p className="text-sm text-red-600 mt-1">No students found. Please check back later.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Topic
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  serverErrors.topic ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200`}
                placeholder="What will you discuss in this session?"
                required
                minLength="5"
                maxLength="100"
              />
              {serverErrors.topic && (
                <p className="text-sm text-red-600 mt-1">{serverErrors.topic}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date & Time
                <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    serverErrors.scheduledAt ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200`}
                  required
                  min={getCurrentDateTimeString()}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {serverErrors.scheduledAt && (
                <p className="text-sm text-red-600 mt-1">{serverErrors.scheduledAt}</p>
              )}
            </div>

            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting || isLoading || students.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scheduling...
                  </>
                ) : (
                  <>
                    Schedule Session
                    <svg className="ml-2 -mr-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/mentor/mysession')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to sessions
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ScheduleSession;