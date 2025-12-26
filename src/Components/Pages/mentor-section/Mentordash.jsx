import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookPlus,
  Users,
  CalendarCheck,
  Bell,
  UserCog,
  LogOut,
  MessageCircle,
  Menu,
  X,
  TrendingUp,
  Clock,
  Star,
  Award,
  ChevronRight,
  Video,
} from "lucide-react";
import useUserStore from "../../../../zustore/store";
import api from '../../../services/api';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const MentorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    roadmaps: 0,
    students: 0,
    completionRate: "0%",
    nextSession: "Not scheduled"
  });
  const [recentRoadmaps, setRecentRoadmaps] = useState([]);
  const navigate = useNavigate();

  const { user, logout } = useUserStore();

  const sidebarItems = [
    { icon: <LayoutDashboard />, label: "Landing-page", to: "/", active: true },
    { icon: <BookPlus />, label: "Manage Roadmaps", to: "/mentor/roadmaps" },
    { icon: <Users />, label: "My Students", to: "/mentor/student" },
    { icon: <CalendarCheck />, label: "Schedule Session", to: "/mentor/schedule-session" },
    { icon: <Video />, label: "My Sessions", to: "/mentor/mysession" },
    { icon: <MessageCircle />, label: "Chat with Students", to: "/mentor/chat" },
    { icon: <Bell />, label: "Notifications", to: "/mentor/notification" },
    { icon: <UserCog />, label: "Edit Profile", to: "/mentor/editprofile" },
    { icon: <LogOut />, label: "Logout", to: "/logout", danger: true },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [statsRes, roadmapsRes] = await Promise.all([
          api.get("/api/mentor/dashboard/stats", { withCredentials: true }),
          api.get("/api/mentor/dashboard/recentRoadmaps", { withCredentials: true })
        ]);
        
        // Handle stats response
        if (statsRes.data?.success) {
          const apiData = statsRes.data.data || {};
          setDashboardData({
            roadmaps: apiData.totalRoadmaps || 0,
            students: apiData.unlockedRoadmapStudents || 0, // Changed from activeStudents to unlockedRoadmapStudents
            completionRate: apiData.completionRate || "0%",
            nextSession: apiData.nextSession || "Not scheduled"
          });
        }

        // Handle roadmaps response
        if (roadmapsRes.data?.success) {
          setRecentRoadmaps(roadmapsRes.data.data || []);
        } else {
          setRecentRoadmaps([]);
        }
      } catch (error) {
        toast.error("Failed to load dashboard data. Please try again later.");
        console.error("Dashboard error:", error);
        // Reset to default values on error
        setDashboardData({
          roadmaps: 0,
          students: 0,
          completionRate: "0%",
          nextSession: "Not scheduled"
        });
        setRecentRoadmaps([]);
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
        
        toast.success("Logged out successfully! Redirecting to login page...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      // Clear user state even on error to prevent stale data
      if (typeof logout === "function") logout();
      toast.error("An error occurred during logout. Please check your connection.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Toast Container */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="md:hidden flex justify-between items-center p-4 bg-white/80 backdrop-blur-md shadow-sm border-b">
        <div className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
          MentorMate
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside
        className={`bg-white/80 backdrop-blur-md shadow-xl w-full md:w-72 px-6 py-6 transition-all duration-300 z-10 border-r border-gray-200/50 ${
          sidebarOpen ? "block" : "hidden"
        } md:block`}
      >
        <div className="hidden md:block mb-8">
          <h1 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
            MentorMate
          </h1>
          <p className="text-sm text-gray-500 mt-1">⚡Mentor Dashboard</p>
        </div>

        <nav className="flex flex-col gap-2">
          {sidebarItems.map(({ icon, label, to, danger, active }) => (
            <button
              key={label}
              onClick={label === "Logout" ? handleLogout : () => navigate(to)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-lg transform scale-[1.02]"
                  : danger
                  ? "text-red-600 hover:bg-red-50 hover:shadow-md"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md hover:transform hover:scale-[1.02]"
              }`}
            >
              <span className={`transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`}>
                {icon}
              </span>
              <span className="font-medium">{label}</span>
              {!danger && !active && (
                <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-[70vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, {user?.fullName || "guest"} 👋
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Ready to inspire and guide your students today?
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold">
                      {user?.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="text-right">
                  <h2 className="font-semibold text-gray-800">{user?.fullName}</h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Created Roadmaps" 
                value={dashboardData.roadmaps} 
                icon={<BookPlus size={24} />} 
                gradient="from-blue-500 to-blue-600" 
                bgGradient="from-blue-50 to-blue-100" 
                change="+2 this month" 
              />
              <StatCard 
                title="Students with Roadmaps" 
                value={dashboardData.students} 
                icon={<Users size={24} />} 
                gradient="from-green-500 to-green-600" 
                bgGradient="from-green-50 to-green-100" 
                change={`${dashboardData.students > 0 ? '+' + dashboardData.students : 'No'} students`} 
              />
              <StatCard 
                title="Completion Rate" 
                value={dashboardData.completionRate} 
                icon={<TrendingUp size={24} />} 
                gradient="from-purple-500 to-purple-600" 
                bgGradient="from-purple-50 to-purple-100" 
                change="+5% from last month" 
              />
              <StatCard 
                title="Next Session" 
                value={dashboardData.nextSession} 
                icon={<Clock size={24} />} 
                gradient="from-orange-500 to-orange-600" 
                bgGradient="from-orange-50 to-orange-100" 
                change="Live Q&A" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Recent Roadmaps</h3>
                    <button 
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      onClick={() => navigate("/mentor/roadmaps")}
                    >
                      View All
                    </button>
                  </div>
                  {!recentRoadmaps || recentRoadmaps.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center py-20"
                    >
                      <p className="text-gray-500">No roadmaps created yet</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {recentRoadmaps.map((roadmap) => (
                        <div 
                          key={roadmap._id || Math.random().toString(36).substring(2, 9)} 
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => roadmap._id && navigate(`/mentor/roadmap/${roadmap._id}`)}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 flex items-center justify-center text-white font-medium">
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{roadmap.title || "Untitled Roadmap"}</p>
                            <p className="text-sm text-gray-600">
                            </p>
                          </div>
                          <div className="text-xs text-gray-400">
                            {roadmap.createdAt ? `Created: ${new Date(roadmap.createdAt).toLocaleDateString()}` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <div onClick={() => navigate("/mentor/createRoadmap")}>
                      <QuickActionButton icon={<BookPlus size={20} />} label="Create New Roadmap" color="from-blue-500 to-blue-600" />
                    </div>
                    <div onClick={() => navigate("/mentor/schedule-session") }>
                      <QuickActionButton icon={<CalendarCheck size={20} />} label="Schedule Session" color="from-green-500 to-green-600" />
                    </div>
                    <div onClick={() => navigate("/mentor/chat") }>
                      <QuickActionButton icon={<MessageCircle size={20} />} label="Message Students" color="from-purple-500 to-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl shadow-lg border border-yellow-200/50 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="text-yellow-600" size={24} />
                    <h3 className="text-lg font-semibold text-yellow-800">Achievement</h3>
                  </div>
                  <p className="text-yellow-700 mb-2">Congratulations! 🎉</p>
                  <p className="text-sm text-yellow-600">
                    {dashboardData.students > 0 
                      ? `You have ${dashboardData.students} students using your roadmaps! Keep inspiring!`
                      : "Start creating roadmaps to help students learn!"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, gradient, bgGradient, change }) => (
  <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-800 mb-2">{value}</p>
    <p className="text-xs text-gray-500">{change}</p>
  </div>
);

const QuickActionButton = ({ icon, label, color }) => (
  <button className={`w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${color} text-white hover:shadow-lg hover:scale-105 transition-all duration-200 group`}>
    <span className="group-hover:scale-110 transition-transform duration-200">{icon}</span>
    <span className="font-medium">{label}</span>
    <ChevronRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform duration-200" />
  </button>
);

export default MentorDashboard;