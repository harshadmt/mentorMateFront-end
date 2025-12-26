import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaTrash, FaCheckCircle, FaTimesCircle, FaSearch, FaArrowLeft } from "react-icons/fa";
import { MdPublish, MdUnpublished } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const AdminRoadmaps = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [filteredRoadmaps, setFilteredRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [roadmapsPerPage] = useState(6); // Changed to 6 for better grid layout
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch all roadmaps
  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/roadmaps", {
        withCredentials: true,
      });
      setRoadmaps(res.data.roadmaps || []);
      setFilteredRoadmaps(res.data.roadmaps || []);
    } catch (error) {
      console.error("Error fetching roadmaps", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  // Filter roadmaps based on search term
  useEffect(() => {
    const filtered = roadmaps.filter(
      (roadmap) =>
        roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (roadmap.createdBy?.fullName && roadmap.createdBy.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredRoadmaps(filtered);
    setCurrentPage(1);
  }, [searchTerm, roadmaps]);

  // Delete roadmap
  const deleteRoadmap = async (id) => {
    if (window.confirm("Are you sure you want to delete this roadmap?")) {
      try {
        await api.delete(`/api/admin/roadmaps/${id}`, {
          withCredentials: true,
        });
        fetchRoadmaps();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const publishRoadmap = async (id) => {
    try {
      await api.patch(
        `/api/admin/roadmaps/publish/${id}`,
        {},
        { withCredentials: true }
      );
      fetchRoadmaps();
    } catch (error) {
      console.error("Error publishing roadmap:", error);
      alert("Failed to publish roadmap. Please try again.");
    }
  };

  const unpublishRoadmap = async (id) => {
    try {
      await api.patch(
        `/api/admin/roadmaps/unpublish/${id}`,
        {},
        { withCredentials: true }
      );
      fetchRoadmaps();
    } catch (error) {
      console.error("Error unpublishing roadmap:", error);
      alert("Failed to unpublish roadmap. Please try again.");
    }
  };

  // Pagination logic
  const indexOfLastRoadmap = currentPage * roadmapsPerPage;
  const indexOfFirstRoadmap = indexOfLastRoadmap - roadmapsPerPage;
  const currentRoadmaps = filteredRoadmaps.slice(indexOfFirstRoadmap, indexOfLastRoadmap);

  const totalPages = Math.ceil(filteredRoadmaps.length / roadmapsPerPage);

  // Safely render array items
  const renderArrayItems = (items) => {
    if (!items || !Array.isArray(items)) return null;
    return items.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return <li key={index}>{item.title || item.description || JSON.stringify(item)}</li>;
      }
      return <li key={index}>{item}</li>;
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 mt-10">
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
        <div className="flex flex-col space-y-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 w-max"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-blue-800">Mentor Roadmaps Management</h1>
            
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search roadmaps..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRoadmaps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <div className="text-gray-500 text-lg">
              {searchTerm ? "No matching roadmaps found" : "No roadmaps available"}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Card Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentRoadmaps.map((roadmap) => (
                <motion.div
                  key={roadmap._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-800 truncate">{roadmap.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        roadmap.isPublished 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {roadmap.isPublished ? (
                          <FaCheckCircle className="mr-1" />
                        ) : (
                          <FaTimesCircle className="mr-1" />
                        )}
                        {roadmap.isPublished ? "Published" : "Unpublished"}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <span className="truncate">
                        By: {roadmap.createdBy?.fullName || "Unknown"}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {roadmap.description || "No description provided"}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-medium">
                        ₹{roadmap.price || "0"}
                      </span>
                      
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          onClick={() => setSelectedRoadmap(roadmap)}
                          title="View Details"
                        >
                          <FaEye size={14} />
                        </motion.button>
                        
                        {roadmap.isPublished ? (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                            onClick={() => unpublishRoadmap(roadmap._id)}
                            title="Unpublish"
                          >
                            <MdUnpublished size={14} />
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                            onClick={() => publishRoadmap(roadmap._id)}
                            title="Publish"
                          >
                            <MdPublish size={14} />
                          </motion.button>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          onClick={() => deleteRoadmap(roadmap._id)}
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-blue-50 rounded-lg">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstRoadmap + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastRoadmap, filteredRoadmaps.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredRoadmaps.length}</span> roadmaps
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for viewing roadmap details */}
      <AnimatePresence>
        {selectedRoadmap && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-blue-800">{selectedRoadmap.title}</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700 p-1"
                    onClick={() => setSelectedRoadmap(null)}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedRoadmap.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Details</h3>
                      <p className="mb-1"><span className="font-medium">Price:</span> ₹{selectedRoadmap.price}</p>
                      <p><span className="font-medium">Mentor:</span> {selectedRoadmap.createdBy?.fullName || "Unknown"}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Status</h3>
                      {selectedRoadmap.isPublished ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheckCircle className="mr-1" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FaTimesCircle className="mr-1" /> Unpublished
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedRoadmap.skills?.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Skills</h3>
                      <ul className="list-disc list-inside">
                        {renderArrayItems(selectedRoadmap.skills)}
                      </ul>
                    </div>
                  )}

                  {selectedRoadmap.steps?.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Steps</h3>
                      <ol className="list-decimal list-inside">
                        {renderArrayItems(selectedRoadmap.steps)}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminRoadmaps;