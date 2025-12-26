import React, { useEffect, useState } from 'react';
import api from '../../../../services/api';
import { BellRing, Filter, Mail, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [expandedNotification, setExpandedNotification] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications', {
        withCredentials: true,
      });
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications =
    selectedType === 'all'
      ? notifications
      : notifications.filter((n) => n.type === selectedType);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'message':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'session':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const toggleExpandNotification = (id) => {
    setExpandedNotification(expandedNotification === id ? null : id);
  };

  const handleBackClick = () => {
    navigate(-1); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section with Back Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackClick}
              className="p-2 rounded-full bg-white shadow-sm hover:bg-blue-50 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-blue-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <BellRing className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Notifications</h2>
                <p className="text-sm text-gray-500">Stay updated with your activities</p>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 py-2 border border-blue-100">
            <Filter className="w-4 h-4 text-blue-500" />
            <select
              className="bg-transparent border-none rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Notifications</option>
              <option value="message">Messages</option>
              <option value="session">Sessions</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-blue-100 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-blue-100 rounded"></div>
                  <div className="h-4 bg-blue-100 rounded w-5/6"></div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-blue-600 text-sm">Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-sm p-8 border border-blue-50 max-w-md mx-auto">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <BellRing className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedType !== 'all' 
                ? `No ${selectedType} notifications right now.`
                : "You don't have any notifications at this time."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                className="bg-white border border-blue-50 rounded-xl shadow-sm p-4 hover:shadow-md transition-all duration-200 hover:border-blue-100 group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-800 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                        {notif.message}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2 capitalize">
                        {notif.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    
                    {/* Expandable Content */}
                    {expandedNotification === notif._id && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Notification Details</h4>
                        <p className="text-sm text-gray-700">{notif.content || 'No additional content available'}</p>
                      </div>
                    )}
                    
                    {/* See Content Button */}
                    <button
                      onClick={() => toggleExpandNotification(notif._id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      {expandedNotification === notif._id ? 'Hide Content' : 'See Content'}
                      <svg 
                        className={`w-3 h-3 transition-transform ${expandedNotification === notif._id ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;