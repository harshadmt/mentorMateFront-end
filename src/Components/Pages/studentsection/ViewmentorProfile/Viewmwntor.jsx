import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiMail,
  FiBook,
  FiUser,
  FiMessageSquare,
  FiCalendar,
  FiDollarSign,
} from 'react-icons/fi';

const MentorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(
          `/api/student/mentor/${id}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setMentor(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load mentor profile');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load mentor profile');
        if (err.response?.status === 401) {
          navigate('/login');
        } else if (err.response?.status === 404 || err.response?.status === 403) {
          setError(err.response.data.message || 'Mentor not found or you do not have access to this profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.2, repeat: Infinity, repeatType: "reverse" }
            }}
            className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-blue-200 flex items-center justify-center mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg font-medium"
          >
            Loading mentor profile...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
        >
          <div className="bg-white p-6 text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FiUser className="text-blue-500 text-2xl" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Profile Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/student/mentors')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              Back to Mentors
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!mentor) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/student/mentor')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Mentors
        </motion.button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8"
        >
          <div className="bg-gray-50 h-32"></div>
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden"
              >
                <img
                  src={mentor.profilePicture || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80'}
                  alt={mentor.fullName}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="mt-4 md:mt-0 md:ml-6">
                <h1 className="text-2xl font-bold text-gray-800">{mentor.fullName}</h1>
                <p className="text-gray-500">{mentor.bio || 'Professional Mentor'}</p>
                {mentor.skills?.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-2 mt-3"
                  >
                    {mentor.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </motion.div>
                )}
              </div>
              <div className="mt-4 md:mt-0 md:ml-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-sm"
                  disabled
                >
                  <FiMessageSquare className="mr-2"/>
                 <button>Contact Mentor</button> 
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">About {mentor.fullName.split(' ')[0]}</h2>
              <p className="text-gray-600 mb-6">{mentor.bio || 'This mentor hasn\'t added a bio yet.'}</p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiBook className="mt-0.5 mr-3 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-gray-700">Roadmaps Created</h3>
                    <p className="text-gray-500 text-sm">{mentor.roadmapsCount || 0} roadmap{mentor.roadmapsCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiMail className="mt-0.5 mr-3 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-gray-700">Contact</h3>
                    <p className="text-gray-500 text-sm">{mentor.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Roadmaps Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Created Roadmaps</h2>
              {mentor.createdRoadmaps.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <FiBook className="mx-auto text-gray-300 text-3xl mb-3" />
                  <p className="text-gray-500">This mentor hasn't created any roadmaps yet.</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {mentor.createdRoadmaps.map((roadmap) => (
                      <motion.div
                        key={roadmap._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ y: -2 }}
                        className="border border-gray-100 rounded-lg p-5 hover:shadow-xs transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center">
                          <div className="md:flex-1">
                            <h3 className="font-bold text-gray-800 mb-1">{roadmap.title}</h3>
                            <p className="text-gray-500 text-sm mb-3">{roadmap.description}</p>
                            {roadmap.price > 0 && (
                              <div className="flex items-center text-xs text-gray-500 mb-2">
                                <FiDollarSign className="mr-1.5" />
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(roadmap.price)}</span>
                              </div>
                            )}
                            <div className="flex items-center text-xs text-gray-400">
                              <FiCalendar className="mr-1.5" />
                              <span>Updated {new Date(roadmap.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="mt-3 md:mt-0 md:ml-4">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => navigate(`/student/roadmaps/${roadmap._id}`)}
                              className="w-full md:w-auto px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-all"
                            >
                              View Roadmap
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;