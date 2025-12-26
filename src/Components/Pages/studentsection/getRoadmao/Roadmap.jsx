import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import { useNavigate } from "react-router-dom";
import { FiBookOpen, FiLock, FiSearch } from "react-icons/fi";
import useRoadmapStore from '../../../../../zustore/Roadmapstore';
import { motion } from "framer-motion";

const AllRoadmaps = () => {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const roadmapsPerPage = 6;

  const fetchRoadmaps = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/student/getall', {
        withCredentials: true,
      });
      setRoadmaps(response.data.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching roadmaps:', error.message);
      setError("Failed to load roadmaps. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleUnlockClick = (roadmap) => {
    useRoadmapStore.getState().setRoadmapData({
      roadmapId: roadmap._id,
      roadmapTitle: roadmap.title,
      amount: roadmap.price || 499,
    });
    navigate('/student/payment');
  };

  // Filter roadmaps based on search term
  const filteredRoadmaps = roadmaps.filter(roadmap =>
    roadmap.title.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <button 
        onClick={() => navigate('/student/studentdashboard')}
        className="mb-8 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
          🚀 Learning Roadmaps
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Carefully crafted learning paths designed by industry experts to accelerate your career growth
        </p>
        <div className="mt-8 inline-flex items-center space-x-8 text-sm text-gray-500">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Expert-designed curricula
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Progress tracking
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Real-world projects
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search roadmaps..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-3 px-4 pl-12 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
          />
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-red-50 rounded-xl max-w-2xl mx-auto"
        >
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl text-gray-700">{error}</p>
          <button
            onClick={fetchRoadmaps}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      ) : filteredRoadmaps.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl text-gray-500">No roadmaps found matching your search.</p>
          <p className="text-gray-400 mt-2">Try a different search term or check back soon!</p>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {currentRoadmaps.map((roadmap) => (
              <motion.div
                key={roadmap._id}
                whileHover={{ scale: 1.02 }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200"
              >
                <div className={`h-2 ${roadmap.color || 'bg-gradient-to-r from-indigo-500 to-blue-500'}`}></div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {roadmap.title}
                    </h3>
                    {roadmap.isPurchased && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                        ✅ Owned
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {roadmap.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-indigo-600">{roadmap.steps?.length || 0}</div>
                      <div className="text-xs text-gray-500">📚 Steps</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{roadmap.rating}</div>
                      <div className="text-xs text-gray-500">⭐ Rating</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{roadmap.students}</div>
                      <div className="text-xs text-gray-500">👥 Students</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">{roadmap.resources?.length || 0}</div>
                      <div className="text-xs text-gray-500">📚 Resources</div>
                    </div>
                  </div>

                  {roadmap.createdBy && (
                    <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={roadmap.createdBy.profilePicture || "/default-avatar.png"}
                        alt="creator"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{roadmap.createdBy.fullName}</div>
                        <div className="text-sm text-gray-500">Course Instructor</div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleUnlockClick(roadmap)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      roadmap.isPurchased
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-green-200"
                        : "bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-lg hover:shadow-indigo-200"
                    } transform hover:scale-105 flex items-center justify-center`}
                  >
                    {roadmap.isPurchased ? (
                      <>
                        <FiBookOpen className="mr-2" />
                        Continue Learning
                      </>
                    ) : (
                      <>
                        <FiLock className="mr-2" />
                        Unlock Roadmap
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-200 transition-colors"
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
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    } transition-colors`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-200 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllRoadmaps;