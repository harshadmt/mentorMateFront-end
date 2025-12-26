import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, BookOpen, BarChart2, User, Search } from 'lucide-react';
import api from '../../../services/api';
import { motion } from 'framer-motion';

const MyStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 6;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/mentor/students', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStudents(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleViewStudent = (studentId) => {
    navigate(`/mentor/students/${studentId}`);
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
            Loading your students...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
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
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-6 rounded-lg shadow-md transition-all"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
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
            y: [Math.random() * 100, 0.3],
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

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          
          <motion.button 
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/mentor/mentordashboard')}
            className="absolute left-6 top-6 p-2 rounded-lg hover:bg-blue-50 transition-all flex items-center"
          >
            <ArrowLeft className="w-5 h-5 text-blue-600 mr-1" />
            <span className="text-sm font-medium text-blue-600">Back</span>
          </motion.button>
          
          <div className="text-center px-4 md:px-10 pt-2">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-800 mb-3"
            >
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                My Students
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Track and support your students' learning journey. See who's enrolled in your roadmaps and monitor their progress.
            </motion.p>
            
            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 mt-6 justify-center"
            >
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white border border-blue-100 px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center"
              >
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Students</p>
                  <motion.p 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-lg font-bold text-blue-600"
                  >
                    {filteredStudents.length}
                  </motion.p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white border border-blue-100 px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center"
              >
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active Learners</p>
                  <motion.p 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-lg font-bold text-blue-600"
                  >
                    {filteredStudents.length}
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-3 px-4 pl-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* Students List */}
        {filteredStudents.length > 0 ? (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {currentStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ y: -10, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2)" }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-blue-50"
                >
                  {/* Student Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 flex items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full transform translate-x-8 -translate-y-8"></div>
                    <div className="relative z-10">
                      {student.profilePicture ? (
                        <motion.img 
                          whileHover={{ scale: 1.05 }}
                          src={student.profilePicture} 
                          alt={student.fullName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl"
                        >
                          {student.fullName.charAt(0)}
                        </motion.div>
                      )}
                    </div>
                    <div className="ml-4 relative z-10">
                      <h3 className="font-semibold text-gray-800">
                        {student.fullName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Mail className="w-4 h-4 mr-1" />
                        <span>{student.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span>Enrolled Roadmaps</span>
                      </div>
                      {student.purchasedRoadmaps && student.purchasedRoadmaps.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {student.purchasedRoadmaps.slice(0, 3).map((roadmap, idx) => (
                            <motion.span 
                              key={idx}
                              whileHover={{ scale: 1.05 }}
                              className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded"
                            >
                              {roadmap.title}
                            </motion.span>
                          ))}
                          {student.purchasedRoadmaps.length > 3 && (
                            <motion.span 
                              whileHover={{ scale: 1.05 }}
                              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                            >
                              +{student.purchasedRoadmaps.length - 3} more
                            </motion.span>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No roadmaps yet</p>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center text-gray-600">
                          <BarChart2 className="w-4 h-4 mr-2" />
                          <span>Engagement</span>
                        </div>
                        <span className="font-semibold text-gray-800">
                          {Math.floor(Math.random() * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.floor(Math.random() * 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.button 
                      whileHover={{ 
                        scale: 1.02,
                        background: "linear-gradient(to right, #3b82f6, #2563eb)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewStudent(student.id)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition-all relative overflow-hidden"
                    >
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 0.2 }}
                        transition={{ duration: 0.3 }}
                        className="absolute left-0 top-0 h-full w-8 bg-white transform -skew-x-12"
                      />
                      View Profile
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

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
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center max-w-3xl mx-auto"
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
              className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Students Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm
                ? 'No students match your search. Try a different search term.'
                : 'When students enroll in your roadmaps, they\'ll appear here. Share your roadmaps to attract learners!'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-all"
              >
                Share Your Roadmaps
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/mentor/roadmaps')}
                className="border border-blue-500 text-blue-500 hover:bg-blue-50 py-2 px-6 rounded-lg shadow-sm transition-all"
              >
                Create New Roadmap
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Floating CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 right-6 z-10"
        >
          <motion.button
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/mentor/roadmaps')}
            className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <BookOpen size={24} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default MyStudents;