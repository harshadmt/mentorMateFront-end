import React, { useState } from 'react';
import api from '../../../../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, ChevronDown, ChevronUp, Trash2, ArrowLeft } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateRoadmap = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    resources: [{ type: '', name: '' }],
    steps: [{ title: '', description: '', week: '' }],
  });

  const [submitting, setSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState('basic');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResourceChange = (index, field, value) => {
    const updated = [...form.resources];
    updated[index][field] = value;
    setForm({ ...form, resources: updated });
  };

  const addResource = () =>
    setForm({
      ...form,
      resources: [...form.resources, { type: '', name: '' }],
    });

  const removeResource = (index) => {
    const updated = form.resources.filter((_, i) => i !== index);
    setForm({ ...form, resources: updated });
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...form.steps];
    updated[index][field] = value;
    setForm({ ...form, steps: updated });
  };

  const addStep = () =>
    setForm({
      ...form,
      steps: [...form.steps, { title: '', description: '', week: '' }],
    });

  const removeStep = (index) => {
    const updated = form.steps.filter((_, i) => i !== index);
    setForm({ ...form, steps: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.price || !form.duration) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const cleanedResources = form.resources.filter(
        (res) => res.type.trim() !== '' && res.name.trim() !== ''
      );

      const cleanedSteps = form.steps.filter(
        (step) => step.title.trim() !== ''
      );

      const payload = {
        ...form,
        price: Number(form.price),
        steps: cleanedSteps.map((step) => ({
          ...step,
          week: Number(step.week) || 1,
        })),
        resources: cleanedResources,
      };

      await api.post('/api/roadmaps', payload, {
        withCredentials: true,
      });

      toast.success('🎉 Roadmap created successfully!');
      setForm({
        title: '',
        description: '',
        price: '',
        duration: '',
        resources: [{ type: '', name: '' }],
        steps: [{ title: '', description: '', week: '' }],
      });

      setTimeout(() => navigate('/mentor/roadmaps'), 2000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
            <button 
              onClick={() => navigate(-1)}
              className="absolute left-4 top-6 p-2 rounded-full hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center pl-8 pr-8">
              <h1 className="text-3xl font-bold flex items-center justify-center">
                <span className="bg-white/20 p-2 rounded-lg mr-3">🛤️</span>
                Create New Learning Roadmap
              </h1>
              <p className="text-blue-100 mt-1">
                Design a structured learning path for your students
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <ToastContainer position="top-center" autoClose={3000} />

            {/* Basic Info Section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('basic')}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3 text-blue-600">
                    📘
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
                </div>
                {expandedSection === 'basic' ? (
                  <ChevronUp className="text-gray-500" />
                ) : (
                  <ChevronDown className="text-gray-500" />
                )}
              </button>

              {expandedSection === 'basic' && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roadmap Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Full Stack Web Development"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      placeholder="Describe what students will learn..."
                      value={form.description}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        placeholder="0.00"
                        value={form.price}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="duration"
                        placeholder="e.g. 12 weeks"
                        value={form.duration}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Steps Section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('steps')}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3 text-purple-600">
                    📍
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Learning Steps</h2>
                </div>
                {expandedSection === 'steps' ? (
                  <ChevronUp className="text-gray-500" />
                ) : (
                  <ChevronDown className="text-gray-500" />
                )}
              </button>

              {expandedSection === 'steps' && (
                <div className="p-4 space-y-4">
                  {form.steps.map((step, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-700">Step {i + 1}</h3>
                        {form.steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(i)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            placeholder={`e.g. Introduction to React`}
                            value={step.title}
                            onChange={(e) => handleStepChange(i, 'title', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Description</label>
                          <input
                            type="text"
                            placeholder="What will be covered in this step?"
                            value={step.description}
                            onChange={(e) => handleStepChange(i, 'description', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Week</label>
                          <input
                            type="number"
                            placeholder="e.g. 1"
                            value={step.week}
                            onChange={(e) => handleStepChange(i, 'week', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addStep}
                    className="flex items-center justify-center w-full py-2 px-4 border border-dashed border-gray-300 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Learning Step
                  </button>
                </div>
              )}
            </div>

            {/* Resources Section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('resources')}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3 text-green-600">
                    📚
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Learning Resources</h2>
                </div>
                {expandedSection === 'resources' ? (
                  <ChevronUp className="text-gray-500" />
                ) : (
                  <ChevronDown className="text-gray-500" />
                )}
              </button>

              {expandedSection === 'resources' && (
                <div className="p-4 space-y-4">
                  {form.resources.map((res, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-700">Resource {i + 1}</h3>
                        {form.resources.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeResource(i)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Link</label>
                          <input
                            type="text"
                            placeholder="e.g. https://reactjs.org/docs"
                            value={res.type}
                            onChange={(e) => handleResourceChange(i, 'type', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Name</label>
                          <input
                            type="text"
                            placeholder="e.g. React Official Documentation"
                            value={res.name}
                            onChange={(e) => handleResourceChange(i, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addResource}
                    className="flex items-center justify-center w-full py-2 px-4 border border-dashed border-gray-300 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Resource
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl font-medium text-white transition-all ${
                  submitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Creating Roadmap...
                  </>
                ) : (
                  '🚀 Publish Roadmap'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoadmap;