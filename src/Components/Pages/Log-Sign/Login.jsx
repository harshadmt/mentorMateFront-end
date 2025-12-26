import React, { useState } from 'react';
import api from '../../../services/api';
import { User, Laptop, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useUserStore from '../../../../zustore/store';

const LoginPage = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const setToken = useUserStore((state) => state.setToken);  // ✅ ADDED: Get token setter
  const fetchUser = useUserStore((state) => state.fetchUser);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post(
        `/api/auth/login`,
        { email, password, role },
        { withCredentials: true }
      );

      // Accept common token shapes from backend
      const token = response.data?.token || response.data?.data?.token || response.data?.accessToken || response.data?.access_token;
      const user = response.data?.user || response.data?.data?.user || response.data?.userData;

      // Save auth token to localStorage AND Zustand store (if present)
      if (token) setToken(token);

      // Set user in store from login response (if present)
      if (user) setUser(user);
      
      // Fetch fresh user profile data to ensure we have complete data
      // Don't let fetchUser error break the login flow
      try {
        await fetchUser();
      } catch (fetchErr) {
        console.warn("Could not fetch fresh user profile, using login response data:", fetchErr);
        // Continue anyway - user data from login response is sufficient
      }

      toast.success(response.data.message);

      setTimeout(() => {
        if (user.role === 'student') navigate('/student/studentdashboard');
        else if (user.role === 'mentor') navigate('/mentor/mentordashboard');
        else if (user.role === 'admin') navigate('/admin/admindashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Login error:', err);
      const status = err.response?.status;
      const serverMsg = err.response?.data || err.message;
      const message = (err.response?.data?.message) || `Login failed${status ? ' (' + status + ')' : ''}`;
      toast.error(message, { position: 'top-right' });
      // Helpful console output for debugging
      console.debug('Login error details:', { status, serverMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (roleType) => {
    switch(roleType) {
      case 'student': return <User size={18} />;
      case 'mentor': return <Laptop size={18} />;
      case 'admin': return <ShieldCheck size={18} />;
      default: return <User size={18} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full opacity-10 animate-ping" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-blue-100 rounded-full opacity-20 animate-bounce" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-blue-400 rounded-full opacity-5 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <ToastContainer />

      <div className="bg-white/90 backdrop-blur-lg w-full max-w-5xl shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative z-10 animate-fadeIn border border-blue-200/50">
        {/* Left Side Form */}
        <div className="p-8 sm:p-10 md:p-12 animate-slideRight">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center hover:scale-105 transition-all duration-300"
            >
             <span className='text-4xl'>⚡</span><h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1 group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-300">
                 MentorMate
              </h1>
            </button>
            <p className="text-blue-600/70 mb-6 animate-slideUp" style={{animationDelay: '0.2s'}}>
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-3 mb-6 animate-slideUp" style={{animationDelay: '0.4s'}}>
            {['student', 'mentor', 'admin'].map((roleType) => (
              <button
                key={roleType}
                onClick={() => setRole(roleType)}
                className={`flex-1 py-3 px-4 border-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 ${
                  role === roleType
                    ? 'border-blue-500 text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg scale-105'
                    : 'border-blue-200 text-blue-400 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className={`transition-transform duration-300 ${role === roleType ? 'animate-pulse' : ''}`}>
                  {getRoleIcon(roleType)}
                </div>
                <span className="capitalize">{roleType}</span>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5 animate-slideUp" style={{animationDelay: '0.6s'}}>
            {/* Email Input */}
            <div className="relative group">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-white to-blue-50/30 hover:from-blue-50/50 hover:to-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500 transition-all duration-300 bg-gradient-to-r from-white to-blue-50/30 hover:from-blue-50/50 hover:to-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between text-sm text-blue-600">
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-blue-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                />
                <span className="group-hover:text-blue-700 transition-colors duration-200">Remember me</span>
              </label>
              <a 
                href="#" 
                className="text-blue-500 hover:text-blue-700 hover:underline transition-all duration-200 transform hover:scale-105"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>

            {/* Sign up link */}
            <p className="text-center text-sm text-blue-600/70 mt-6">
              Don't have an account?
              <a 
                href="/signup" 
                className="text-blue-600 hover:text-blue-800 hover:underline ml-1 font-medium transition-all duration-200 hover:scale-105 inline-block"
              >
                Create account
              </a>
            </p>
          </form>
        </div>

        {/* Right Side Image/Info Section */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white p-8 relative overflow-hidden animate-slideLeft">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full animate-ping" style={{animationDuration: '4s'}}></div>
          </div>

          <div className="relative z-10 text-center animate-fadeIn" style={{animationDelay: '0.8s'}}>
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="text-4xl">🎓</div>
              </div>
              <h2 className="text-3xl font-bold mb-4 animate-slideUp">
                Empower Your Learning Journey
              </h2>
              <p className="text-blue-100 text-lg max-w-sm leading-relaxed animate-slideUp" style={{animationDelay: '1s'}}>
                Connect with mentors, track your progress, and achieve your goals with personalized support.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4 animate-slideUp" style={{animationDelay: '1.2s'}}>
              <div className="flex items-center justify-center gap-3 text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                <span className="text-sm">One-on-one mentoring sessions</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span className="text-sm">Track your learning progress</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-blue-100">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span className="text-sm">Achieve your career goals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        
        .animate-slideRight {
          animation: slideRight 0.8s ease-out;
        }
        
        .animate-slideLeft {
          animation: slideLeft 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;