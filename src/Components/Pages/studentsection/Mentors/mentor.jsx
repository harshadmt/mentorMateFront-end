import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import { FiUser, FiAlertCircle, FiArrowLeft, FiMail, FiMessageSquare, FiBook, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Mentors = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const mentorsPerPage = 6;

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(
          '/api/student/mentors',
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.success) {
          setMentors(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load mentors');
        }
      } catch (err) {
        console.error('Error fetching mentors:', err);
        const errorMessage = err.response?.data?.message || 'Unable to fetch mentors';
        setError(errorMessage);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [navigate]);

  // Filter mentors based on search term
  const filteredMentors = mentors.filter(mentor =>
    mentor.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastMentor = currentPage * mentorsPerPage;
  const indexOfFirstMentor = indexOfLastMentor - mentorsPerPage;
  const currentMentors = filteredMentors.slice(indexOfFirstMentor, indexOfLastMentor);
  const totalPages = Math.ceil(filteredMentors.length / mentorsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.2, repeat: Infinity, repeatType: "reverse" }
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg mx-auto mb-4"
          >
            <FiUser className="text-2xl" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg font-medium"
          >
            Loading your mentors...
          </motion.p>
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
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiAlertCircle className="mx-auto text-5xl" />
            </motion.div>
          </div>
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
              >
                <FiArrowLeft className="mr-2" />
                Go Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/student/studentdashboard')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Dashboard
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Floating background elements */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Your Mentors
            </h1>
            <p className="text-gray-600">
              Connect with industry experts guiding your learning journey
            </p>
          </div>
          <motion.button
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/student/studentdashboard')}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </motion.button>
        </motion.div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search mentors..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-3 px-4 pl-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Mentor List */}
        <AnimatePresence>
          {filteredMentors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-2xl mx-auto"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiUser className="text-blue-500 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No Mentors Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'No mentors match your search. Try a different search term.'
                  : 'You haven’t purchased any roadmaps yet. Explore our roadmaps to connect with expert mentors.'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/student/roadmaps')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Browse Roadmaps
              </motion.button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentMentors.map((mentor, index) => (
                  <motion.div
                    key={mentor._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden"
                  >
                    <div className="relative">
                      <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-100 rounded-full opacity-20"></div>
                      <div className="flex flex-col items-center text-center mb-4 relative z-10">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md mb-4"
                        >
                          <img
                            src={mentor.profilePicture || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80'}
                            alt={mentor.fullName}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-800">{mentor.fullName}</h3>
                        <p className="text-gray-500 text-sm">{mentor.bio || 'Professional Mentor'}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-600 p-3 bg-blue-50 rounded-lg">
                        <FiMail className="mr-3 text-blue-500" />
                        <span className="text-sm truncate">{mentor.email}</span>
                      </div>
                      <div className="flex items-start text-gray-600 p-3 bg-blue-50 rounded-lg">
                        <FiBook className="mt-1 mr-3 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Roadmaps Created</p>
                          <p className="text-xs text-gray-500">
                            {mentor.roadmapsCount} roadmap{mentor.roadmapsCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex-1 flex items-center justify-center py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        disabled
                      >
                        <FiMessageSquare className="mr-2" />
                        Message
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(`/student/mentorprofile/${mentor._id}`)}
                        className="flex-1 flex items-center justify-center py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors text-sm shadow-md"
                      >
                        View Profile
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-4">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-200 transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === index + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        } transition-colors`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-200 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Mentors;