import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AllTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const transactionsPerPage = 9; // Number of transactions per page
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get("/api/admin/alltransactions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setTransactions(res.data.payments);
      } catch (err) {
        console.error("Error fetching transactions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Pagination Logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to open the transaction details modal
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
  };

  // Function to close the transaction details modal
  const handleCloseModal = () => {
    setSelectedTransaction(null);
  };

  // Function to navigate back to the previous page (for the main page back button)
  const handleGoBack = () => {
    navigate(-1); // Navigates one step back in the browser history
  };

  // Variants for main content animation
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  // Variants for individual card animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Variants for modal backdrop animation
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  // Variants for modal content animation
  const modalVariants = {
    hidden: { y: "-100vh", opacity: 0 },
    visible: { y: "0", opacity: 1, transition: { type: "spring", stiffness: 120, damping: 20 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      {/* Main container with entrance animation */}
      <motion.div
        className="mx-auto max-w-7xl px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-extrabold text-blue-700">All Transactions</h1>
          {/* Back button for the main page */}
          <button
            onClick={handleGoBack}
            className="group flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <motion.span
              className="mr-2"
              initial={{ x: 0 }}
              whileHover={{ x: -3 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              ←
            </motion.span>
            Go Back
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-xl text-gray-600">
            <p>No transactions found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentTransactions.map((tx, index) => (
                <motion.div
                  key={tx._id}
                  variants={cardVariants}
                  transition={{ delay: index * 0.05 }} // Staggered animation for cards
                >
                  <div
                    className="group cursor-pointer overflow-hidden rounded-xl border border-blue-200 bg-white shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.03] hover:border-blue-500 hover:shadow-2xl"
                    onClick={() => handleViewDetails(tx)}
                  >
                    <div className="rounded-t-xl bg-blue-100 p-5">
                      <h2 className="text-xl font-bold text-blue-800">
                        {tx.studentId?.fullName || "Unknown User"}
                      </h2>
                    </div>
                    <div className="space-y-3 p-5">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-blue-700">Email:</span>{" "}
                        {tx.studentId?.email || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-blue-700">Roadmap:</span>{" "}
                        {tx.roadmapId?.title || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-blue-700">Amount:</span> ₹{tx.amount}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-blue-700">Status:</span>{" "}
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase text-white ${
                            tx.status === "paid" ? "bg-green-500" : "bg-red-500"
                          } transition-colors duration-200`}
                        >
                          {tx.status}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-blue-700">Date:</span>{" "}
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                      <button
                        className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white shadow-md transition-all duration-300 ease-in-out hover:scale-[1.01] hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card onClick from firing
                          handleViewDetails(tx);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-blue-400 bg-white px-4 py-2 text-blue-600 shadow-sm transition-all duration-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white shadow-md"
                        : "border border-blue-200 bg-white text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-blue-400 bg-white px-4 py-2 text-blue-600 shadow-sm transition-all duration-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Animated Modal for Transaction Details */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleCloseModal} // Close modal when clicking outside
          >
            <motion.div
              className="w-full max-w-lg overflow-hidden rounded-xl border border-blue-200 bg-white bg-opacity-95 p-8 shadow-2xl backdrop-blur-md"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()} // Prevent clicking modal content from closing modal
            >
              <h2 className="mb-6 text-3xl font-bold text-blue-800">Transaction Details</h2>
              <div className="space-y-4 text-gray-700">
                <p className="flex justify-between border-b border-blue-100 pb-2">
                  <span className="font-semibold text-blue-700">Transaction ID:</span>
                  <span className="truncate pl-2">{selectedTransaction._id}</span>
                </p>
                <p className="flex justify-between border-b border-blue-100 pb-2">
                  <span className="font-semibold text-blue-700">User:</span>
                  <span className="pl-2">{selectedTransaction.studentId?.fullName || "N/A"}</span>
                </p>
                <p className="flex justify-between border-b border-blue-100 pb-2">
                  <span className="font-semibold text-blue-700">Email:</span>
                  <span className="pl-2">{selectedTransaction.studentId?.email || "N/A"}</span>
                </p>
                <p className="flex justify-between border-b border-blue-100 pb-2">
                  <span className="font-semibold text-blue-700">Roadmap:</span>
                  <span className="pl-2">{selectedTransaction.roadmapId?.title || "N/A"}</span>
                </p>
                <p className="flex justify-between border-b border-blue-100 pb-2">
                  <span className="font-semibold text-blue-700">Amount:</span>
                  <span className="pl-2">₹{selectedTransaction.amount}</span>
                </p>
                <p className="flex justify-between border-b border-blue-100 pb-2">
                  <span className="font-semibold text-blue-700">Status:</span>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-semibold uppercase text-white ${
                      selectedTransaction.status === "paid" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {selectedTransaction.status}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold text-blue-700">Date:</span>
                  <span className="pl-2">{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                </p>
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                {/* Close button inside the modal */}
                <button
                  className="rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 transition-colors duration-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                {/* Removed "View User Profile" button as per request */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}