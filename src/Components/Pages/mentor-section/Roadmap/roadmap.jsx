import React, { useEffect, useState } from 'react';
import { PlusCircle, BookOpen, DollarSign, Eye, Sparkles, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const SeeRoadmaps = () => {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const roadmapsPerPage = 6;

  const fetchRoadmaps = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/roadmaps/myroadmaps', {
        withCredentials: true,
      });
      setRoadmaps(response.data);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  // Filter roadmaps based on search term
  const filteredRoadmaps = roadmaps.filter(roadmap =>
    roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (roadmap.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastRoadmap = currentPage * roadmapsPerPage;
  const indexOfFirstRoadmap = indexOfLastRoadmap - roadmapsPerPage;
  const currentRoadmaps = filteredRoadmaps.slice(indexOfFirstRoadmap, indexOfLastRoadmap);
  const totalPages = Math.ceil(filteredRoadmaps.length / roadmapsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Intermediate': return 'bg-blue-200 text-blue-800 border-blue-300';
      case 'Advanced': return 'bg-blue-300 text-blue-900 border-blue-400';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
            className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-blue-500 border-t-transparent mb-4 sm:mb-6"
          ></motion.div>
          <motion.p 
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-base sm:text-lg md:text-xl font-medium text-blue-800"
          >
            Loading your roadmaps...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Floating animated bubbles */}
      {[...Array(8)].map((_, i) => (
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
          className={`absolute rounded-full ${i % 3 === 0 ? 'bg-blue-200' : i % 2 === 0 ? 'bg-indigo-200' : 'bg-sky-200'}`}
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

      <div className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 gap-4 sm:gap-5 md:gap-6"
        >
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/mentor/mentordashboard')}
              className="p-1.5 sm:p-2 rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 shadow-sm border border-blue-200 hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
            </motion.button>
            <div className="space-y-1 sm:space-y-2">
              <motion.div 
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 sm:gap-3"
              >
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                  className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-lg sm:rounded-xl shadow-md"
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </motion.div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                  Your Roadmaps
                </h2>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500" />
                </motion.div>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-blue-600 text-sm sm:text-base md:text-lg"
              >
                Manage and track your learning paths
              </motion.p>
            </div>
          </div>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/mentor/createRoadmap')}
            className="group relative flex items-center justify-center sm:justify-start gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-4 sm:px-5 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden w-full sm:w-auto mt-3 sm:mt-0"
          >
            <div className="absolute inset-0 bg-white opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <PlusCircle size={18} sm:size={20} md:size={22} className="relative z-10" />
            </motion.div>
            <span className="relative z-10 font-semibold text-sm sm:text-base md:text-lg whitespace-nowrap">Create Roadmap</span>
          </motion.button>
        </motion.div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-2 sm:px-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search roadmaps by title or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2.5 sm:py-3 px-4 pl-10 sm:pl-12 text-sm sm:text-base rounded-lg sm:rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
            />
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} sm:size={20} />
          </div>
        </div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8 md:mb-10 lg:mb-12 px-2 sm:px-0"
        >
          {[
            {
              icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />,
              title: "Total Roadmaps",
              value: filteredRoadmaps.length,
              color: "from-blue-100 to-blue-200"
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-30 -z-10" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-xs sm:text-sm font-medium">{stat.title}</p>
                  <motion.p 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800"
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className={`p-2 sm:p-3 bg-gradient-to-br ${stat.color} rounded-full shadow-inner`}
                >
                  {stat.icon}
                </motion.div>
              </div>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                className="h-1 bg-gradient-to-r from-blue-400 to-blue-200 mt-3 sm:mt-4 rounded-full"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Roadmaps Grid */}
        {filteredRoadmaps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-8 sm:py-12 md:py-16 px-4"
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
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-inner"
            >
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-400" />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold text-blue-600 mb-1 sm:mb-2">
              {searchTerm ? 'No roadmaps found' : 'No roadmaps found'}
            </h3>
            <p className="text-blue-500 mb-4 sm:mb-6 text-sm sm:text-base">
              {searchTerm
                ? 'No roadmaps match your search. Try a different search term.'
                : 'Create your first roadmap to get started'}
            </p>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => searchTerm ? setSearchTerm('') : navigate('/mentor/createRoadmap')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <PlusCircle size={16} sm:size={18} md:size={20} />
              </motion.div>
              {searchTerm ? 'Clear Search' : 'Create Your First Roadmap'}
            </motion.button>
          </motion.div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid gap-4 sm:gap-5 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-2 sm:px-0"
            >
              {currentRoadmaps.map((rm, index) => (
                <motion.div
                  key={rm._id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 10
                  }}
                  whileHover={{ 
                    y: -8,
                    boxShadow: "0 15px 30px -5px rgba(59, 130, 246, 0.3)"
                  }}
                  className="group bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-blue-100 hover:shadow-2xl transform transition-all duration-300 relative overflow-hidden"
                >
                  {/* Gradient overlay */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.2 }}
                    className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur-xl sm:blur-2xl transition-opacity duration-500"
                  />
                  
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4 sm:mb-5 md:mb-6">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-full border ${
                        rm.status === 'Active'
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-blue-200 text-blue-800 border-blue-300'
                      }`}
                    >
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${rm.status === 'Active' ? 'bg-blue-500' : 'bg-blue-600'}`}
                      />
                      {rm.status}
                    </motion.span>
                    
                    {rm.rating && (
                      <motion.div 
                        whileHover={{ rotate: 10 }}
                        className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border border-blue-200"
                      >
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs font-medium text-blue-700">{rm.rating}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-5 md:mb-6 relative z-10">
                    <motion.h3 
                      whileHover={{ color: "#2563eb" }}
                      className="text-base sm:text-lg md:text-xl font-bold text-blue-800 line-clamp-2 transition-colors duration-300"
                    >
                      {rm.title}
                    </motion.h3>
                    <motion.p 
                      whileHover={{ color: "#1d4ed8" }}
                      className="text-blue-600 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed transition-colors duration-300"
                    >
                      {rm.description || 'No description available'}
                    </motion.p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 md:mb-6 relative z-10">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-1 sm:gap-2 text-blue-600"
                      >
                      </motion.div>
                      <motion.div 
                        whileHover={{ x: -5 }}
                        className="flex items-center gap-1 sm:gap-2 font-bold text-blue-700"
                      >
                        <DollarSign size={14} sm:size={16} />
                        <span>₹{rm.price.toLocaleString()}</span>
                      </motion.div>
                    </div>
                    
                    {rm.duration && (
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-blue-600">Duration: {rm.duration}</span>
                        <motion.span 
                          whileHover={{ scale: 1.1 }}
                          className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-medium rounded-full border ${getDifficultyColor(rm.difficulty)}`}
                        >
                          {rm.difficulty}
                        </motion.span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ 
                      scale: 1.02,
                      background: "linear-gradient(to right, #2563eb, #4338ca)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/mentor/viewroad/${rm._id}`)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 relative overflow-hidden text-sm sm:text-base"
                  >
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute left-0 top-0 h-full w-6 sm:w-8 bg-white opacity-20 transform -skew-x-12"
                    />
                    <Eye size={14} sm:size={16} md:size={18} />
                    <span>View Details</span>
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="mt-8 sm:mt-10 md:mt-12 flex flex-wrap justify-center items-center gap-2 sm:gap-3 md:gap-4 px-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-blue-100 text-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-200 transition-colors"
                >
                  Previous
                </button>
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm ${
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
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-blue-100 text-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-200 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating CTA at bottom */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-10"
      >
        <motion.button
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/mentor/createRoadmap')}
          className="flex items-center justify-center p-2.5 sm:p-3 md:p-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <PlusCircle size={18} sm:size={20} md:size={22} lg:size={24} />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SeeRoadmaps;