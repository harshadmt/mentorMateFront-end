import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Calendar,
  Clock,
  Video,
  User,
  Bookmark,
  X,
  ChevronLeft,
  Check,
  AlertCircle,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion } from 'framer-motion';

const EditSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [session, setSession] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    participants: [],
    status: 'scheduled'
  });

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'ongoing', label: 'Ongoing', color: 'bg-purple-100 text-purple-800' },
  ];

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get(`/api/videosession/${id}`);
        setSession(response.data);
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load session details');
        console.error(error);
        navigate('/sessions');
      }
    };

    fetchSession();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSession(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put(`/api/videosession/${id}`, session);
      toast.success('Session updated successfully!');
      setSession(response.data);
    } catch (error) {
      toast.error('Failed to update session');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/api/videosession/${id}`);
      toast.success('Session deleted successfully');
      navigate('/sessions');
    } catch (error) {
      toast.error('Failed to delete session');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronLeft className="mr-1" size={20} />
            Back to Sessions
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <span className="animate-spin mr-2">🌀</span>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-1" size={18} />
                Delete Session
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold flex items-center">
                <Video className="mr-3" size={24} />
                Edit Session
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusOptions.find(s => s.value === session.status)?.color || 'bg-gray-100 text-gray-800'}`}>
                {statusOptions.find(s => s.value === session.status)?.label || session.status}
              </span>
            </div>
            <p className="mt-2 opacity-90">Update the details of your video session</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Session Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={session.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={session.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={session.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={session.date}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={session.startTime}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                      <Clock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={session.endTime}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                      <Clock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Participants
                  </label>
                  <div className="space-y-2">
                    {session.participants.length > 0 ? (
                      session.participants.map((participant, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                          <div className="flex items-center">
                            <User className="text-gray-500 mr-2" size={16} />
                            <span>{participant}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSession(prev => ({
                                ...prev,
                                participants: prev.participants.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No participants added
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">🌀</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2" size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Session Link</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Share this link with participants: 
                  <a href={`/join/${id}`} className="ml-2 text-blue-600 hover:underline">
                    {window.location.origin}/join/{id}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditSessionPage;