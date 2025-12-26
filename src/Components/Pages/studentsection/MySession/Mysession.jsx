import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiVideo, FiArrowRight, FiArrowLeft, FiSearch } from 'react-icons/fi';
import { format, parseISO, isAfter, isBefore, addMinutes } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const MySession = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/api/videosession', { 
          withCredentials: true 
        });
        
        // Process and sort sessions
        const processedSessions = (res.data.data || []).map(session => ({
          ...session,
          // Ensure we have a consistent date field
          displayDate: session.scheduledAt || session.date
        })).sort((a, b) => 
          new Date(b.displayDate) - new Date(a.displayDate)
        );
        
        setSessions(processedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setError('Failed to load sessions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const formatSessionDate = (dateString) => {
    try {
      if (!dateString) return 'Date not set';
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return format(date, 'MMMM do, yyyy');
    } catch (e) {
      console.error('Invalid date format:', dateString);
      return 'Invalid date';
    }
  };

  const formatSessionTime = (dateString) => {
    try {
      if (!dateString) return 'Time not set';
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return format(date, 'h:mm a');
    } catch (e) {
      console.error('Invalid time format:', dateString);
      return 'Invalid time';
    }
  };

  const getSessionStatus = (dateString, duration = 60) => {
    try {
      if (!dateString) return { isUpcoming: false, isLive: false };
      
      const sessionDate = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      const now = new Date();
      const endTime = addMinutes(sessionDate, duration);
      
      return {
        isUpcoming: isAfter(sessionDate, now),
        isLive: isAfter(now, sessionDate) && isBefore(now, endTime)
      };
    } catch (e) {
      console.error('Error determining session status:', e);
      return { isUpcoming: false, isLive: false };
    }
  };

  const handleJoinSession = (sessionId) => {
    navigate(`/student/videopage/${sessionId}`);
  };

  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session =>
    (session.topic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.mentor?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
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

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="bg-blue-50 p-8 rounded-xl shadow-md max-w-md text-center border border-blue-100">
          <div className="text-blue-500 mb-4 text-5xl">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Sessions</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 sm:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-blue-700 mb-3">
            Your Scheduled Sessions
          </h1>
          <p className="text-lg text-blue-500 max-w-2xl mx-auto">
            Manage and join your mentoring sessions
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sessions by topic or mentor..."
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-blue-50 rounded-xl shadow-sm max-w-md mx-auto p-8 border border-blue-100"
          >
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCalendar className="text-blue-600 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'No sessions found' : 'No sessions yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? 'No sessions match your search. Try a different search term.'
                : 'You don\'t have any scheduled sessions'}
            </p>
            <button 
              onClick={() => navigate('/schedule-session')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule a Session
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {currentSessions.map((session) => {
                const { isUpcoming, isLive } = getSessionStatus(session.displayDate, session.duration);
                
                return (
                  <motion.div
                    key={session._id}
                    variants={item}
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 relative overflow-hidden"
                  >
                    {/* Status ribbon */}
                    <div className={`absolute top-0 right-0 px-4 py-1 text-xs font-semibold rounded-bl-lg ${
                      isLive ? 'bg-green-100 text-green-800' :
                      isUpcoming ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isLive ? 'Live Now' : isUpcoming ? 'Upcoming' : 'Completed'}
                    </div>

                    <div className="flex items-start mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <FiVideo className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800 line-clamp-2">
                          {session.topic || 'Mentoring Session'}
                        </h2>
                        <p className="text-sm text-blue-600">
                          Session with {session.mentor?.fullName || 'mentor'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center">
                        <FiUser className="text-gray-500 mr-3" />
                        <span className="text-gray-700">
                          Mentor: <span className="font-medium">{session.mentor?.fullName || 'TBA'}</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-500 mr-3" />
                        <span className="text-gray-700">
                          {formatSessionDate(session.displayDate)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="text-gray-500 mr-3" />
                        <span className="text-gray-700">
                          {formatSessionTime(session.displayDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        Duration: {session.duration || '60'} mins
                      </span>
                      <button 
                        onClick={() => handleJoinSession(session._id)}
                        disabled={!isLive && !isUpcoming}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                          isLive ? 'bg-green-600 text-white hover:bg-green-700' :
                          isUpcoming ? 'bg-blue-600 text-white hover:bg-blue-700' :
                          'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isLive ? 'Join Now' : isUpcoming ? 'Join Soon' : 'Completed'} 
                        <FiArrowRight className="ml-2" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
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
        )}
      </div>
    </div>
  );
};

export default MySession;