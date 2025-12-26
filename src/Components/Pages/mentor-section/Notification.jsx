import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { Bell, Loader2, Inbox, Mail, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MentorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'session':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 transition"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-full">
                <Bell className="w-6 h-6 text-indigo-600" />
              </div>
              <span>Your Notifications</span>
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
            <p className="text-indigo-600 font-medium">Loading your notifications</p>
            <p className="text-sm text-gray-500">Please wait a moment...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-sm p-8 border border-gray-100 max-w-md mx-auto">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <Inbox className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">No notifications yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              You're all caught up! We'll notify you when there's new activity.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getNotificationIcon(notif.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-800 text-sm sm:text-base font-medium">
                        {notif.message}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-2 capitalize">
                        {notif.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>

                    {/* Expandable content */}
                    {expandedId === notif._id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Details</h4>
                        <p className="text-sm text-gray-600">
                          {notif.content || 'No additional details available'}
                        </p>
                      </div>
                    )}

                    {/* Toggle button */}
                    <button
                      onClick={() => toggleExpand(notif._id)}
                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      {expandedId === notif._id ? 'Hide details' : 'View details'}
                      <svg
                        className={`w-3 h-3 transition-transform ${
                          expandedId === notif._id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
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

export default MentorNotifications;
