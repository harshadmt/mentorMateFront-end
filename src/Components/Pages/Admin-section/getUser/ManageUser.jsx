import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import { FaLock, FaUnlock, FaTimes, FaUser, FaEnvelope, FaUserTag, FaCalendarAlt, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(9); // Changed to 9 for better grid layout (3x3)
  const navigate = useNavigate();

  // Default profile image
  const defaultProfilePic = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z'/%3E%3C/svg%3E";

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/api/admin/users", {
        withCredentials: true,
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
        setFilteredUsers(response.data.data);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || "Failed to load users. Please try again.");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search users
  useEffect(() => {
    const filtered = users.filter(user => 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, users]);

  // Block/Unblock user
  const toggleBlock = async (id) => {
    try {
      await api.patch(
        `/api/admin/blockuser/${id}`,
        {},
        { withCredentials: true }
      );
      fetchUsers();
      if (selectedUser?._id === id) {
        setSelectedUser(prev => ({
          ...prev,
          isBlocked: !prev.isBlocked
        }));
      }
    } catch (error) {
      console.error("Error toggling user block status:", error);
      setError(error.response?.data?.message || "Failed to update user status");
    }
  };

  // View user details
  const viewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedUser(null), 300);
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4 md:p-8 bg-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-800">User Management</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition duration-200 shadow-sm flex items-center justify-center"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <p className="text-gray-500 text-lg">
              {searchTerm ? "No matching users found" : "No users found"}
            </p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </motion.div>
        ) : (
          <>
            {/* Card Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentUsers.map((user) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="p-5">
                    {/* User Header */}
                    <div className="flex items-center mb-4">
                      <img
                        src={user.profilePicture || defaultProfilePic}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border-2 border-blue-200 mr-3 bg-gray-100"
                      />
                      <div>
                        <h3 className="font-bold text-blue-800 truncate">{user.fullName}</h3>
                        <p className="text-sm text-blue-600 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Role</p>
                        <p className="text-sm font-medium capitalize">{user.role}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className={`text-sm font-medium ${
                          user.isBlocked ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {user.isBlocked ? "Blocked" : "Active"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm font-medium">
                          {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between space-x-2">
                      <button
                        onClick={() => toggleBlock(user._id)}
                        className={`flex-1 px-3 py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center ${
                          user.isBlocked
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {user.isBlocked ? (
                          <>
                            <FaUnlock className="mr-1" size={12} />
                            Unblock
                          </>
                        ) : (
                          <>
                            <FaLock className="mr-1" size={12} />
                            Block
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => viewUser(user)}
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium flex items-center justify-center"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {filteredUsers.length > usersPerPage && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastUser, filteredUsers.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredUsers.length}</span> users
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md border ${
                      currentPage === 1
                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                        : "border-blue-300 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <FaChevronLeft className="inline mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`w-8 h-8 rounded-md ${
                          currentPage === number
                            ? "bg-blue-600 text-white"
                            : "text-blue-600 hover:bg-blue-50 border border-blue-200"
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md border ${
                      currentPage === totalPages
                        ? "border-gray-300 text-gray-400 cursor-not-allowed"
                        : "border-blue-300 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    Next
                    <FaChevronRight className="inline ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-blue-800">User Details</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                  <img
                    src={selectedUser.profilePicture || defaultProfilePic}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-blue-100 object-cover shadow-md mb-4 bg-gray-100"
                  />
                  <h3 className="text-xl font-bold text-center text-blue-800">{selectedUser.fullName}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <FaEnvelope className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-blue-800">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <FaUserTag className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium text-blue-800 capitalize">{selectedUser.role}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <FaCalendarAlt className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Created</p>
                      <p className="font-medium text-blue-800">
                        {new Date(selectedUser.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      {selectedUser.isBlocked ? (
                        <FaLock className="text-red-600" />
                      ) : (
                        <FaUnlock className="text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className={`font-medium ${
                        selectedUser.isBlocked ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {selectedUser.isBlocked ? "Blocked" : "Active"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => toggleBlock(selectedUser._id)}
                    className={`px-6 py-2 rounded-lg text-white font-medium flex items-center ${
                      selectedUser.isBlocked
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {selectedUser.isBlocked ? (
                      <>
                        <FaUnlock className="mr-2" />
                        Unblock User
                      </>
                    ) : (
                      <>
                        <FaLock className="mr-2" />
                        Block User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;