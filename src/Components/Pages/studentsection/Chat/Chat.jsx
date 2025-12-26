import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User, BookOpen, Menu, X } from 'lucide-react';
import api from '../../../../services/api';
import { format, formatDistanceToNow } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useUserStore from '../../../../../zustore/store';

const ChatWithMentor = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Authentication check
  useEffect(() => {
    if (!currentUser?._id || currentUser.role !== 'student') {
      toast.error('Please login as a student to access messages', {
        position: 'top-center',
        autoClose: 3000,
      });
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Fetch mentors
  useEffect(() => {
    if (!currentUser?._id) return;

    const fetchMentors = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/student/mentors`, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          },
          withCredentials: true
        });

        if (res.data?.success) {
          const formattedMentors = (res.data.data || []).map(mentor => ({
            _id: mentor._id,
            fullName: mentor.fullName,
            email: mentor.email,
            profilePicture: mentor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.fullName)}&background=random`,
            createdRoadmaps: mentor.createdRoadmaps || [],
            lastActive: mentor.lastActive || 'Recently active'
          }));
          setMentors(formattedMentors);
          if (window.innerWidth >= 768 && formattedMentors.length > 0) {
            setSelectedMentor(formattedMentors[0]);
          }
        } else {
          throw new Error(res.data?.message || 'Failed to fetch mentors');
        }
      } catch (err) {
        console.error('Fetch mentors error:', err);
        setError(err.message);
        toast.error(err.message, { position: 'top-center', autoClose: 3000 });
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [currentUser?._id, navigate]);

  // Fetch messages with polling
  useEffect(() => {
    if (!selectedMentor?._id || !currentUser?._id) return;
    
    const fetchMessages = async () => {
      try {
        const res = await api.get(
          `/api/message?receiverId=${selectedMentor._id}`,
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            },
            withCredentials: true
          }
        );
        
        if (res.data?.success) {
          const formattedMessages = (res.data.data || []).map(msg => ({
            _id: msg._id,
            content: msg.content,
            createdAt: msg.createdAt,
            sender: msg.sender?._id || msg.sender,
            isCurrentUser: (msg.sender?._id || msg.sender) === currentUser._id,
          }));
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        toast.error(err.message, { position: 'top-center', autoClose: 3000 });
      }
    };
    
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedMentor, currentUser?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMentor?._id || !currentUser?._id) return;
    
    try {
      const tempId = Date.now().toString();
      const tempMessage = {
        _id: tempId,
        content: newMessage,
        createdAt: new Date(),
        isCurrentUser: true,
        sender: currentUser._id
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      const res = await api.post(
        `/api/message/send`,
        {
          receiver: selectedMentor._id,
          content: newMessage
        },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          },
          withCredentials: true
        }
      );
      
      if (res.data?.success) {
        setMessages(prev => prev.map(msg => 
          msg._id === tempId ? {
            ...msg,
            _id: res.data.data._id,
            createdAt: new Date(res.data.data.createdAt)
          } : msg
        ));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error(err.message, { position: 'top-center', autoClose: 3000 });
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Navigation to dashboard
  const goToDashboard = () => {
    navigate('/student/studentdashboard');
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-sm mx-4">
          <h3 className="text-xl font-semibold text-red-600 mb-4">Authentication Required</h3>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-sm mx-4">
          <h3 className="text-xl font-semibold text-red-600 mb-4">Error Loading Chat</h3>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300 overflow-hidden`}>
      <ToastContainer position="top-center" theme={isDarkMode ? 'dark' : 'light'} />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-3/4 sm:w-64 md:w-80 bg-white shadow-lg flex flex-col transform transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-50`}>
        <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-blue-500 text-white">
          <div className="flex items-center">
            <button 
              onClick={goToDashboard}
              className="mr-2 p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-bold">My Mentors</h2>
          </div>
       
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {mentors.length > 0 ? (
            mentors.map(mentor => (
              <div 
                key={mentor._id}
                onClick={() => {
                  setSelectedMentor(mentor);
                  setIsSidebarOpen(false);
                }}
                className={`p-3 border-b border-blue-100 cursor-pointer flex items-center transition-colors duration-200 ${
                  selectedMentor?._id === mentor._id ? 'bg-blue-50' : 'hover:bg-blue-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 overflow-hidden ring-2 ring-blue-200">
                  <img
                    src={mentor.profilePicture}
                    alt={mentor.fullName}
                    className="w-full h-full rounded-full object-cover transform hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{mentor.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{mentor.email}</p>
                  <div className="flex items-center mt-1">
                    <BookOpen size={14} className="text-blue-500 mr-1" />
                    <span className="text-xs text-blue-500">
                      {mentor.createdRoadmaps?.length || 0} roadmaps
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No mentors found
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedMentor ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-blue-100 bg-white shadow-sm flex items-center">
              <div className="md:hidden mr-2">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 rounded-full hover:bg-blue-50"
                >
                  <Menu size={20} />
                </button>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 overflow-hidden ring-2 ring-blue-200">
                <img
                  src={selectedMentor.profilePicture}
                  alt={selectedMentor.fullName}
                  className="w-full h-full rounded-full object-cover transform hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="ml-3">
                <p className="font-semibold text-gray-800 text-sm sm:text-base">{selectedMentor.fullName}</p>
                <div className="flex items-center">
                  <BookOpen size={14} className="text-blue-500 mr-1" />
                  <span className="text-xs text-blue-500">
                    {selectedMentor.createdRoadmaps?.length || 0} created roadmaps
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-blue-50">
              {messages.length > 0 ? (
                messages.map((message, index) => {
                  const isCurrentUser = message.isCurrentUser;
                  const messageContent = message.content || '';
                  const messageDate = message.createdAt ? format(new Date(message.createdAt), 'h:mm a') : '';
                  const fullDate = message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : '';

                  return (
                    <div 
                      key={index}
                      className={`mb-3 flex animate-slide-in ${
                        isCurrentUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div 
                        className={`max-w-[80%] sm:max-w-[70%] px-3 py-2 rounded-xl shadow-sm ${
                          isCurrentUser
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-800 border border-blue-200'
                        } transition-all duration-200 group relative`}
                      >
                        <p className="text-xs sm:text-sm">{messageContent}</p>
                        <p className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                        } group-hover:opacity-0 transition-opacity duration-200`}>
                          {messageDate}
                        </p>
                        <span className="absolute bottom-0 left-0 right-0 text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500">
                          {fullDate}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm sm:text-base">No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-blue-100 bg-white shadow-sm">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${selectedMentor.fullName}...`}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 transition-all duration-200 text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className={`px-3 py-2 rounded-lg flex items-center justify-center transition-all duration-200 text-sm ${
                    newMessage.trim()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} className="mr-1" /> Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-blue-50">
            <div className="text-center p-6 max-w-sm mx-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                <User size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-700">Select a mentor</h3>
              <p className="text-gray-500 mt-2 text-sm">Choose a mentor from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatWithMentor;