import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../../../services/api';
import { toast, ToastContainer } from "react-toastify";
import DialogBox from './aiBox';
import "react-toastify/dist/ReactToastify.css";
import {
  GraduationCap,
  BookOpen,
  CalendarDays,
  MessageSquare,
  Bell,
  UserCog,
  LogOut,
  Menu,
  X,
  Clock,
  Plus,
} from "lucide-react";
import useUserStore from "../../../../zustore/store";
import { motion } from "framer-motion";
import { BsRobot } from "react-icons/bs";

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useUserStore();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [latestMessage, setLatestMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    purchasedMentorCount: 0,
    purchasedRoadmapsCount: 0,
    sessionCount: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel with error handling for each request
        const results = await Promise.allSettled([
          api.get('/api/student/dashboard/upcoming', { withCredentials: true }),
          api.get('/api/student/dashboard/latestmessage', { withCredentials: true }),
          api.get('/api/student/dashboard/latestnotification', { withCredentials: true }),
          api.get('/api/student/dashboard/stats', { withCredentials: true })
        ]);

        // Handle upcoming sessions response
        if (results[0].status === 'fulfilled') {
          const sessionsData = results[0].value.data;
          if (sessionsData?.success) {
            setUpcomingSessions(Array.isArray(sessionsData.data) ? sessionsData.data : []);
          } else {
            console.error('Error in upcoming sessions response:', sessionsData?.message);
            toast.error(sessionsData?.message || 'Failed to load upcoming sessions');
          }
        } else {
          console.error('Error fetching upcoming sessions:', results[0].reason);
          toast.error('Failed to load upcoming sessions');
        }

        // Handle latest message response
        if (results[1].status === 'fulfilled') {
          const messageData = results[1].value.data;
          if (messageData?.success) {
            setLatestMessage(messageData.data || null);
          } else {
            console.error('Error in latest message response:', messageData?.message);
            toast.error(messageData?.message || 'Failed to load latest message');
          }
        } else {
          console.error('Error fetching latest message:', results[1].reason);
          toast.error('Failed to load messages');
        }

        // Handle notifications response
        if (results[2].status === 'fulfilled') {
          const notificationsData = results[2].value.data;
          if (notificationsData?.success) {
            setNotifications(notificationsData.data ? [notificationsData.data] : []);
          } else {
            console.error('Error in notifications response:', notificationsData?.message);
            toast.error(notificationsData?.message || 'Failed to load notifications');
          }
        } else {
          console.error('Error fetching notifications:', results[2].reason);
          toast.error('Failed to load notifications');
        }

        // Handle stats response
        if (results[3].status === 'fulfilled') {
          const statsData = results[3].value.data;
          if (statsData?.success) {
            setStats({
              purchasedMentorCount: statsData.data?.purchasedMentorCount || 0,
              purchasedRoadmapsCount: statsData.data?.purchasedRoadmapsCount || 0,
              sessionCount: statsData.data?.sessionCount || 0
            });
          }
        } else {
          console.error('Error fetching stats:', results[3].reason);
          toast.error('Failed to load dashboard stats');
        }

      } catch (err) {
        console.error('Error in fetchDashboardData:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await api.post(
        "/api/auth/logout",
        {},
        { withCredentials: true }
      );
    
      if (res.status === 200) {
        // Clear user state BEFORE redirecting to prevent stale data
        if (typeof logout === "function") logout();
        
        toast.success("Logged out successfully!");
        setTimeout(() => navigate("/login"), 800);
      } else {
        toast.error("Logout failed!");
      }
    } catch (error) {
      console.error(error);
      // Clear user state even on error to prevent stale data
      if (typeof logout === "function") logout();
      toast.error("An error occurred during logout.");
    }
  };

  // Format session date and time
  const formatSessionDateTime = (session) => {
    if (!session.scheduledAt) return 'No date set';
    
    const date = new Date(session.scheduledAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${formattedDate} at ${formattedTime}`;
  };

  // Safe access to upcoming sessions data
  const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 to-white">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center p-4 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100">
          <div className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MentorMate
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-800 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`bg-white/90 backdrop-blur-xl shadow-xl w-full md:w-72 px-6 py-6 space-y-4 transition-all duration-300 z-10 border-r border-gray-100 ${
            sidebarOpen ? "block" : "hidden"
          } md:block`}
        >
          <div className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent hidden md:block mb-8">
            ⚡ MentorMate
          </div>
          <nav className="flex flex-col gap-3 mt-4">
            <SidebarLink icon={<GraduationCap />} label="Dashboard" to="/student/dashboard" active />
            <SidebarLink icon={<BookOpen />} label="Roadmap" to="/student/getroadmaps" />
            <SidebarLink icon={<BookOpen />} label="MyRoadmap" to="/student/unlockedRoadmap/:id" />
            <SidebarLink icon={<MessageSquare />} label="Chat with Mentor" to="/student/chat" />
            <SidebarLink icon={<CalendarDays />} label="Mentor" to="/student/mentor" />
            <SidebarLink icon={<Clock />} label="My Sessions" to="/student/mySession" />
            <SidebarLink 
              icon={<Bell />} 
              label="Notifications" 
              badge={notifications.filter(n => !n.read).length || null} 
              to="/student/notifications" 
            />
            <SidebarLink icon={<UserCog />} label="Edit Profile" to="/student/editprofile" />
            <div className="mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="flex items-center w-full justify-between px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </div>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Welcome back, {user?.fullName || "guest"} 👋
              </h1>
              <p className="text-gray-500 mt-1 font-medium">
                Ready to continue your learning journey?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-700">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="relative">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="avatar"
                    className="w-12 h-12 rounded-full border-3 border-white shadow-lg ring-2 ring-blue-100 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full border-3 border-white shadow-lg ring-2 ring-blue-100 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                    {user?.fullName?.[0]?.toUpperCase() || 'S'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={<BookOpen className="w-6 h-6" />} 
              title="Purchased Roadmaps" 
              value={stats.purchasedRoadmapsCount} 
              change="Your learning paths" 
              color="blue" 
            />
            <StatCard 
              icon={<GraduationCap className="w-6 h-6" />} 
              title="Mentors" 
              value={stats.purchasedMentorCount} 
              change="Experts guiding you" 
              color="green" 
            />
            <StatCard 
              icon={<CalendarDays className="w-6 h-6" />} 
              title="Sessions" 
              value={stats.sessionCount} 
              change="Learning sessions" 
              color="purple" 
            />
            <StatCard 
              icon={<MessageSquare className="w-6 h-6" />} 
              title="Progress" 
              value="68%" 
              change="This month" 
              color="orange" 
            />
          </div>

          {/* Main Cards Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Next Session" subtitle="Don't miss your upcoming class" icon={<CalendarDays className="w-5 h-5" />}>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : !nextSession ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center py-20"
                  >
                    <p className="text-gray-500">No upcoming sessions scheduled</p>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                    <div>
                      <h3 className="font-semibold text-gray-800">{nextSession.topic || 'Untitled Session'}</h3>
                      <p className="text-sm text-gray-600">
                        {formatSessionDateTime(nextSession)}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {nextSession.mentor?.fullName ? `with Mentor ${nextSession.mentor.fullName}` : 'No mentor assigned'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        Status: {nextSession.status || 'unknown'}
                      </p>
                    </div>
                    {nextSession.scheduledAt && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {new Date(nextSession.scheduledAt).getHours()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(nextSession.scheduledAt).getHours() >= 12 ? 'PM' : 'AM'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              <Card title="Upcoming Sessions" subtitle="Your learning roadmap" icon={<CalendarDays className="w-5 h-5" />}>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center py-20"
                  >
                    <p className="text-gray-500">No sessions scheduled</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.map((session, idx) => (
                      <div key={session._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${idx % 3 === 0 ? 'bg-red-100' : idx % 3 === 1 ? 'bg-yellow-100' : 'bg-blue-100'}`}></div>
                          <div>
                            <p className="font-medium text-gray-800">{session.topic || 'Untitled Session'}</p>
                            <p className="text-sm text-gray-500">
                              {formatSessionDateTime(session)}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {session.mentor?.fullName ? `with ${session.mentor.fullName}` : 'No mentor assigned'}
                            </p>
                          </div>
                        </div>
                        {session.scheduledAt && (
                          <span className="text-sm font-medium text-gray-600">
                            {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Latest Message" subtitle="From your mentor" icon={<MessageSquare className="w-5 h-5" />}>
                {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : !latestMessage ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center py-16"
                  >
                    <p className="text-gray-500">No messages yet</p>
                  </motion.div>
                ) : (
                  <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-100">
                    <div className="flex items-start gap-3">
                      {latestMessage.sender?.profilePicture ? (
                        <img 
                          src={latestMessage.sender.profilePicture} 
                          alt="mentor" 
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                          {latestMessage.sender?.fullName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {latestMessage.sender?.fullName || 'Unknown sender'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {latestMessage.content || 'No message content'}
                        </p>
                        {latestMessage.createdAt && (
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(latestMessage.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card title="Recent Notifications" subtitle="Stay updated" icon={<Bell className="w-5 h-5" />}>
                {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center py-16"
                  >
                    <p className="text-gray-500">No notifications yet</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-gray-400' : 'bg-blue-500'}`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{notification.content || 'No message'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            From: {notification.sender?.fullName || 'System'}
                          </p>
                          {notification.createdAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
          {/* Floating Action Button */}
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => setIsDialogOpen(true)}
  className="fixed bottom-8 right-8 z-40 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
>
  <BsRobot className="w-6 h-6" />
</motion.button>

{/* Dialog Box Component */}
<DialogBox 
  isOpen={isDialogOpen} 
  onClose={() => setIsDialogOpen(false)} 
/>
        </main>
      </div>
    </>
  );
};

// SidebarLink Component
const SidebarLink = ({ icon, label, to, danger, active, badge }) => (
  <Link
    to={to}
    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
      active
        ? "bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-lg"
        : danger
        ? "text-red-600 hover:bg-red-50 hover:text-red-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
    }`}
  >
    <div className="flex items-center gap-3">
      <span className={`w-5 h-5 transition-transform ${active ? "" : "group-hover:scale-110"}`}>{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
    {badge && (
      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
        {badge}
      </span>
    )}
  </Link>
);

// StatCard Component
const StatCard = ({ icon, title, value, change, color }) => {
  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorMap[color]} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        <span className="text-xs text-gray-500">{change}</span>
      </div>
    </div>
  );
};

// Card Component
const Card = ({ title, subtitle, icon, children }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
};

export default StudentDashboard;