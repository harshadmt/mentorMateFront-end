import React, { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Trash2, BookOpen, Link2, Clock, Users, IndianRupee, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../services/api';
import { toast } from 'react-toastify';

const ViewRoadmap = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await api.get(`/api/roadmaps/${id}`, {
          withCredentials: true,
        });
        setRoadmap(res.data);
      } catch (error) {
        console.error('Error fetching roadmap:', error);
        toast.error('Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) return;

    try {
      await api.delete(`/api/roadmaps/${id}`, {
        withCredentials: true,
      });
      toast.success('Roadmap deleted successfully');
      setTimeout(() => navigate('/mentor/roadmaps'), 500);
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      toast.error('Failed to delete roadmap');
    }
  };

  const toggleWeek = (weekIndex) => {
    setExpandedWeek(expandedWeek === weekIndex ? null : weekIndex);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Roadmap Not Found</h2>
          <p className="text-gray-600 mb-4">The roadmap you're looking for doesn't exist or may have been removed.</p>
          <button
            onClick={() => navigate('/mentor/roadmaps')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Roadmaps
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/mentor/roadmaps')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate(`/mentor/edit/${id}`)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Roadmap</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Roadmap Overview Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{roadmap.title || 'Untitled Roadmap'}</h1>
            <p className="text-blue-100">{roadmap.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-semibold">₹{roadmap.price || 'Free'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-semibold">{roadmap.duration || 'Flexible'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Students</p>
                <p className="font-semibold">{roadmap.students?.length || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold capitalize">{roadmap.status || 'draft'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Journey Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <BookOpen className="w-5 h-5" />
                  Learning Journey
                </h2>
              </div>

              <div className="p-6">
                {Array.isArray(roadmap.steps) && roadmap.steps.length > 0 ? (
                  <div className="space-y-4">
                    {roadmap.steps.map((step, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleWeek(index)}
                          className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                              <span className="font-medium">Week {step.week}</span>
                            </div>
                            <h3 className="font-semibold text-gray-800">{step.title}</h3>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${expandedWeek === index ? 'rotate-90' : ''}`} />
                        </button>

                        {expandedWeek === index && (
                          <div className="p-4 bg-white">
                            <p className="text-gray-600 whitespace-pre-line">{step.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">📭</div>
                    <h3 className="text-gray-500 font-medium">No learning steps added yet</h3>
                    <p className="text-gray-400 text-sm mt-1">Add steps to create a structured learning path</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resources & Quick Actions */}
          <div className="space-y-6">
            {/* Resources Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <Link2 className="w-5 h-5" />
                  Learning Resources
                </h2>
              </div>

              <div className="p-6">
                {Array.isArray(roadmap.resources) && roadmap.resources.length > 0 ? (
                  <ul className="space-y-3">
                    {roadmap.resources.map((res, idx) => (
                      <li key={idx} className="group">
                        <a
                          href={res.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                        >
                          <div className="flex-shrink-0 bg-green-100 text-green-600 p-2 rounded-lg">
                            <Link2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">{res?.type || 'Resource'}</p>
                            <p className="text-sm text-gray-500 truncate">{res.name}</p>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">📚</div>
                    <h3 className="text-gray-500 font-medium">No resources added yet</h3>
                    <p className="text-gray-400 text-sm mt-1">Add helpful links and materials for students</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
                <h2 className="text-xl font-bold">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                <button
                  onClick={() => navigate(`/mentor/edit/${id}`)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                >
                  <span className="font-medium">Edit Roadmap Details</span>
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/mentor/roadmaps/${id}/students`)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                >
                  <span className="font-medium">View Enrolled Students</span>
                  <Users className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <span className="font-medium">Delete Roadmap</span>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRoadmap;