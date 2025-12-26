import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserCheck,
  UserCircle2,
  Flag,
  DollarSign,
  FileText,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Shield,
  ChevronRight,
  BarChart3,
  Globe,
  Settings,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import useUserStore from '../../../../../zustore/store';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMentors: 0,
    totalStudents: 0,
    totalRoadmaps: 0,
    totalSessions: 0,
    totalRevenue: 0,
  });

  const admin = {
    name: user?.name || "Admin",
    email: user?.email || "admin@example.com",
    profilePic: user?.profilePic || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z'/%3E%3C/svg%3E",
  };

  const sidebarItems = [
    { icon: <LayoutDashboard />, label: "Dashboard", to: "/admin/dashboard", active: true },
    { icon: <Users />, label: "All Users", to: "/admin/adminUser" },
    { icon: <FileText />, label: "All Roadmaps", to: "/admin/adminRoadmap" },
    { icon: <CreditCard />, label: "Transactions", to: "/admin/transaction" },
    { icon: <Settings />, label: "Settings", to: "/admin/setting" },
    { icon: <LogOut />, label: "Logout", to: "/logout", danger: true },
  ];

  useEffect(() => {
    const fetchstats = async () => {
      try {
        const res = await api.get("/api/admin/stats", { withCredentials: true });
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchstats();
  }, []);

  // Prepare data for charts
  const chartData = [
    { name: "Total Users", value: stats.totalUsers, color: "#2563EB" },
    { name: "Students", value: stats.totalStudents, color: "#8B5CF6" },
    { name: "Active Mentors", value: stats.totalMentors, color: "#10B981" },
    { name: "Roadmaps", value: stats.totalRoadmaps, color: "#6366F1" },
    { name: "Active Sessions", value: stats.totalSessions, color: "#EC4899" },
    { name: "Revenue", value: stats.totalRevenue, color: "#059669" },
  ];

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

  const handleNavigation = (path) => {
    if (path === "/logout") {
      handleLogout();
    } else {
      navigate(path);
    }
    setSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-xl font-medium text-gray-700">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      {/* Toast Container for notifications */}
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
        theme="light"
      />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between border-b border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xl font-bold text-gray-800">AdminPanel</div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-72 transform border-r border-gray-200 bg-white px-6 py-6 shadow-lg transition-all duration-300 md:relative md:block md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo (visible on desktop) */}
        <div className="mb-8 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-600">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AdminPanel</h1>
              <p className="text-xs text-gray-500">System Control</p>
            </div>
          </div>
        </div>

        {/* Close button for mobile sidebar */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-600 md:hidden"
        >
          <X size={24} />
        </button>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col gap-2">
          {sidebarItems.map(({ icon, label, to, danger, active, badge }) => (
            <button
              key={label}
              onClick={() => handleNavigation(to)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                active
                  ? "scale-105 bg-gradient-to-r from-blue-600 to-blue-600 text-white shadow-md"
                  : danger
                  ? "text-red-500 hover:bg-red-50 hover:shadow-sm"
                  : "text-gray-600 hover:scale-105 hover:bg-gray-100 hover:shadow-sm"
              }`}
            >
              <span className={`transition-transform duration-200 ${active ? "" : "group-hover:scale-110"}`}>
                {icon}
              </span>
              <span className="flex-1 font-medium">{label}</span>
              {badge && (
                <span className="min-w-[20px] rounded-full px-2 py-1 text-center text-xs text-white bg-red-500">
                  {badge}
                </span>
              )}
              {!danger && !active && (
                <ChevronRight
                  size={16}
                  className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-gray-400"
                />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        {/* Top Bar / Welcome Section */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              Welcome back, {admin.name} 👋
            </h1>
            <p className="text-lg text-gray-600">Monitor and manage your platform with confidence</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Admin Profile Display */}
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="relative">
                <img
                  src={admin.profilePic}
                  alt="Admin"
                  className="h-12 w-12 rounded-full border-2 border-gray-200 object-cover"
                />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-400"></div>
              </div>
              <div className="hidden text-right sm:block">
                <p className="font-semibold text-gray-800">{admin.name}</p>
                <p className="text-sm text-gray-500">{admin.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            icon={<Users />}
            title="Total Users"
            value={stats.totalUsers}
            change="+12%"
            gradient="from-blue-500 to-blue-600"
            trend="up"
          />
          <StatsCard
            icon={<UserCheck />}
            title="Active Mentors"
            value={stats.totalMentors}
            change="+8%"
            gradient="from-green-500 to-green-600"
            trend="up"
          />
          <StatsCard
            icon={<UserCircle2 />}
            title="Students"
            value={stats.totalStudents}
            change="+15%"
            gradient="from-purple-500 to-purple-600"
            trend="up"
          />
          <StatsCard
            icon={<DollarSign />}
            title="Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            change="+22%"
            gradient="from-emerald-500 to-teal-500"
            trend="up"
          />
          <StatsCard
            icon={<FileText />}
            title="Roadmaps"
            value={stats.totalRoadmaps}
            change="+6%"
            gradient="from-indigo-500 to-purple-500"
            trend="up"
          />
          <StatsCard
            icon={<Globe />}
            title="Active Sessions"
            value={stats.totalSessions}
            change="+18%"
            gradient="from-pink-500 to-rose-500"
            trend="up"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-xl font-semibold text-gray-800">Platform Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {
                    chartData.map((entry, index) => (
                      <Bar key={`bar-${index}`} fill={entry.color} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">Quick Actions</h3>
            <div className="space-y-3">
              <QuickActionButton
                icon={<Users />} 
                label="User Management"
                gradient="from-blue-500 to-blue-600"
                onClick={() => navigate('/admin/adminUser')}
              />
              <QuickActionButton
                icon={<FileText />}
                label="Roadmap Management"
                gradient="from-indigo-500 to-purple-500" // Changed gradient for distinct look
                onClick={() => navigate('/admin/adminRoadmap')}
              />
              <QuickActionButton
                icon={<CreditCard />} 
                label="Payment Management"
                gradient="from-emerald-500 to-teal-500" // Changed gradient for distinct look
                onClick={() => navigate('/admin/transaction')}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatsCard = ({ icon, title, value, change, gradient, trend, alert }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md">
    {alert && (
      <div className="absolute right-2 top-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-red-400"></div>
      </div>
    )}
    <div className="mb-4 flex items-center justify-between">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${gradient} shadow-sm transition-transform duration-300 group-hover:scale-110 text-white`}
      >
        {icon}
      </div>
      <div
        className={`flex items-center text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}
      >
        <TrendingUp className={`mr-1 h-4 w-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
        {change}
      </div>
    </div>
    <h3 className="mb-1 text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

const QuickActionButton = ({ icon, label, gradient, onClick }) => (
  <button
    onClick={onClick}
    className={`group flex w-full items-center gap-3 rounded-xl bg-gradient-to-r ${gradient} p-3 text-white transition-all duration-200 hover:scale-105 hover:shadow-md`}
  >
    <span className="transition-transform duration-200 group-hover:scale-110">{icon}</span>
    <span className="flex-1 text-left font-medium">{label}</span>
    <ChevronRight size={16} className="text-white opacity-0 transition-transform duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
  </button>
);

export default AdminDashboard;