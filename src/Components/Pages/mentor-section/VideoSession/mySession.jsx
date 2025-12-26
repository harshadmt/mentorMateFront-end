import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { FiSearch } from 'react-icons/fi';

const MySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [editData, setEditData] = useState({ topic: '', scheduledAt: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/api/videosession', { 
          withCredentials: true 
        });
        
        const sessionsData = data?.data || data?.sessions || [];
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        toast.error(err.response?.data?.message || 'Failed to load sessions');
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session =>
    session.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = filteredSessions.slice(indexOfFirstSession, indexOfLastSession);
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/api/videosession/${id}`, { 
        withCredentials: true 
      });
      toast.success('Session canceled successfully');
      setSessions(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error('Error canceling session:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel session');
    }
  };

  const handleJoin = (sessionId) => {
    navigate(`/mentor/videopage/${sessionId}`);
  };

  const isJoinable = (scheduledAt) => {
    if (!scheduledAt) return false;
    const now = new Date();
    const scheduledTime = new Date(scheduledAt);
    const timeDiff = Math.abs(now - scheduledTime);
    return timeDiff < 1000 * 60 * 15; // 15 minutes window
  };

  const openEditModal = (session) => {
    setEditingSession(session);
    setEditData({
      topic: session.topic,
      scheduledAt: format(parseISO(session.scheduledAt), "yyyy-MM-dd'T'HH:mm")
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(
        `/api/videosession/${editingSession._id}`,
        {
          topic: editData.topic,
          scheduledAt: new Date(editData.scheduledAt).toISOString(),
        },
        { withCredentials: true }
      );
      
      const updatedSession = data?.data || data;
      if (!updatedSession) throw new Error('Invalid response format');
      
      toast.success('Session updated successfully!');
      setSessions(prev =>
        prev.map(s => (s._id === editingSession._id ? updatedSession : s))
      );
      setEditingSession(null);
    } catch (err) {
      console.error('Error updating session:', err);
      toast.error(err.response?.data?.message || 'Failed to update session');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/mentor/mentordashboard');
  };

  const formatSessionDate = (dateString) => {
    if (!dateString) return 'No date set';
    try {
      return format(parseISO(dateString), 'PPpp');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackToDashboard}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </motion.button>

        <div className="text-center mb-8 md:mb-10">
          <motion.h2 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
          >
            My Scheduled Sessions
          </motion.h2>
          <p className="text-base md:text-lg text-gray-600">
            Manage your upcoming mentoring sessions
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sessions by topic or student name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-3 px-4 pl-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16 md:py-20"
          >
            <div className="mx-auto w-20 h-20 md:w-24 md:h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-medium text-gray-700 mb-2">
              {searchTerm ? 'No sessions found' : 'No sessions scheduled yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'No sessions match your search. Try a different search term.'
                : 'Schedule your first session to get started'}
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentSessions.map((session, index) => (
                <motion.div
                  key={session._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`h-2 ${isJoinable(session.scheduledAt) ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <div className="p-5 md:p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 line-clamp-2">{session.topic}</h3>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          isJoinable(session.scheduledAt) 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isJoinable(session.scheduledAt) ? 'Live Now' : 'Upcoming'}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-3 md:mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">{session.student?.name || 'Student'}</span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-4 md:mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatSessionDate(session.scheduledAt)}</span>
                    </div>

                    <div className="flex justify-end space-x-2 md:space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCancel(session._id)}
                        className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(session)}
                        className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleJoin(session._id)}
                        disabled={!isJoinable(session.scheduledAt)}
                        className={`px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white rounded-lg transition-colors ${
                          isJoinable(session.scheduledAt)
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Join
                      </motion.button>
                    </div>
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

        {/* Edit Modal */}
        {editingSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingSession(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <motion.h3 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl md:text-2xl font-bold text-gray-800"
                  >
                    Edit Session
                  </motion.h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEditingSession(null)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4 md:space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <input
                      type="text"
                      name="topic"
                      value={editData.topic}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                      autoFocus
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
                    <input
                      type="datetime-local"
                      name="scheduledAt"
                      value={editData.scheduledAt}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-end gap-2 md:gap-3 pt-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setEditingSession(null)}
                      className="px-4 py-2 md:px-5 md:py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="px-4 py-2 md:px-5 md:py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MySessions;
