import React, { useEffect, useState } from "react";
import api from "../../../../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiLock, FiUnlock, FiCheck, FiShield, FiCreditCard, FiZap, FiArrowLeft } from "react-icons/fi";

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RazorpayPayment = ({ roadmapId, amount = 499, roadmapTitle = "Premium Roadmap" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!roadmapId) {
      toast.error("No roadmap selected. Redirecting...");
      setTimeout(() => navigate("/student/unlockedRoadmap/:id"), 2000);
    }
  }, [roadmapId, navigate]);

  const handlePayment = async () => {
    if (!roadmapId) return;

    setIsLoading(true);
    
    try {
      const scriptLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      const { data } = await api.post(
        "/api/payment/create-order",
        { 
          roadmapId, 
          amount: amount * 100 
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!data?.order?.id) {
        throw new Error("Failed to create payment order");
      }

      const { order } = data;

      const options = {
        key: order.key || process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Mentor-Mate",
        description: `Purchase: ${roadmapTitle}`,
        image: "https://i.imgur.com/n5tjHFD.png",
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post(
              "/api/payment/verify-payment",
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                roadmapId,
                amount: amount * 100
              },
              { 
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );

            if (verifyRes.data?.success) {
              toast.success(
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <FiUnlock className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">Payment Successful!</div>
                    <div className="text-gray-600">You now have access to "{roadmapTitle}"</div>
                  </div>
                </div>,
                { autoClose: 5000 }
              );
              
              try {
                await api.get('/api/user/me', { 
                  withCredentials: true 
                });
              } catch (refreshError) {
                console.error("User refresh error:", refreshError);
              }
              
              navigate("/student/unlockedRoadmap/:id");
            } else {
              throw new Error(verifyRes.data?.message || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error(
              <div className="flex items-start">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <FiLock className="text-red-600 text-xl" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">Verification Error</div>
                  <div className="text-gray-600">{error.message || "Please contact support"}</div>
                </div>
              </div>
            );
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: localStorage.getItem("userName") || "Customer",
          email: localStorage.getItem("userEmail") || "customer@example.com",
          contact: localStorage.getItem("userPhone") || "+919999999999"
        },
        notes: {
          roadmapId,
          purchaseNote: "Non-refundable transaction"
        },
        theme: {
          color: "#7C3AED",
          backdrop_color: "#1E293B"
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            toast.info(
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FiCreditCard className="text-blue-600 text-xl" />
                </div>
                <div>
                  <div className="text-gray-800">Payment window closed</div>
                </div>
              </div>
            );
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on("payment.failed", (response) => {
        toast.error(
          <div className="flex items-start">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <FiLock className="text-red-600 text-xl" />
            </div>
            <div>
              <div className="font-bold text-gray-800">Payment Failed</div>
              <div className="text-gray-600">{response.error.description || "Please try another payment method"}</div>
            </div>
          </div>
        );
        setIsLoading(false);
      });

      rzp.open();

    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        <div className="flex items-start">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <FiLock className="text-red-600 text-xl" />
          </div>
          <div>
            <div className="font-bold text-gray-800">Payment Error</div>
            <div className="text-gray-600">{error.response?.data?.message || "Failed to initiate payment"}</div>
          </div>
        </div>
      );
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <FiCheck className="text-green-500" />, text: "Lifetime access" },
    { icon: <FiCheck className="text-green-500" />, text: "All future updates included" },
    { icon: <FiCheck className="text-green-500" />, text: "Priority support" },
    { icon: <FiCheck className="text-green-500" />, text: "Downloadable resources" },
    { icon: <FiCheck className="text-green-500" />, text: "Community access" }
  ];

  const paymentMethods = [
    { name: "Credit Cards", icon: "💳" },
    { name: "Debit Cards", icon: "🏦" },
    { name: "Net Banking", icon: "🌐" },
    { name: "UPI", icon: "📱" },
    { name: "Wallets", icon: "💰" }
  ];

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6">
      {/* Back Button - Mobile optimized */}
      <motion.button
        onClick={() => navigate(-1)}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center text-blue-600 mb-4 font-medium text-sm sm:text-base"
      >
        <FiArrowLeft className="mr-2" />
        Back
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden border border-purple-100"
      >
        {/* Header - Responsive padding and text sizes */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Unlock {roadmapTitle}</h2>
              <p className="text-xs sm:text-sm opacity-90">Get instant access to premium content</p>
            </div>
            <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-full">
              <FiLock className="text-lg sm:text-xl" />
            </div>
          </div>
        </div>

        {/* Pricing Card - Responsive padding and layout */}
        <div className="p-4 sm:p-6">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-bl-lg">
              POPULAR
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
              <div className="mb-2 sm:mb-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{roadmapTitle}</h3>
                <p className="text-xs sm:text-sm text-gray-500">One-time payment</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">₹{amount}</div>
                <div className="text-xs sm:text-sm text-gray-500">+ applicable taxes</div>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <button 
                onClick={() => setShowFeatures(!showFeatures)}
                className="flex items-center text-blue-600 font-medium text-xs sm:text-sm"
              >
                {showFeatures ? "Hide features" : "Show all features"}
                <motion.span
                  animate={{ rotate: showFeatures ? 180 : 0 }}
                  className="ml-1"
                >
                  ▼
                </motion.span>
              </button>
              
              <AnimatePresence>
                {showFeatures && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-2 space-y-1 sm:space-y-2"
                  >
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2">{feature.icon}</span>
                        <span className="text-sm sm:text-base text-gray-700">{feature.text}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              onClick={handlePayment}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={isLoading}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-white shadow-md sm:shadow-lg transition-all duration-300 ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg sm:hover:shadow-xl"
              }`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center justify-center text-sm sm:text-base">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <motion.span
                      animate={{
                        x: isHovered ? [0, 2, 0] : 0,
                        transition: { repeat: isHovered ? Infinity : 0, duration: 1 },
                      }}
                      className="mr-1 sm:mr-2"
                    >
                      <FiUnlock className="inline" />
                    </motion.span>
                    <span>Pay ₹{amount} to Unlock</span>
                    <motion.span
                      animate={{
                        x: isHovered ? [0, -2, 0] : 0,
                        transition: { repeat: isHovered ? Infinity : 0, duration: 1 },
                      }}
                      className="ml-1 sm:ml-2"
                    >
                      <FiZap className="inline" />
                    </motion.span>
                  </>
                )}
              </div>
            </motion.button>
          </div>

          {/* Payment Methods - Responsive grid */}
          <div className="mb-4 sm:mb-6">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 sm:mb-3 uppercase tracking-wider">Payment Methods</h4>
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -2 }}
                  className="bg-white px-2 py-1 sm:px-3 sm:py-2 rounded-md sm:rounded-lg shadow-xs border border-gray-100 flex items-center justify-center sm:justify-start"
                >
                  <span className="mr-1 sm:mr-2 text-xs sm:text-sm">{method.icon}</span>
                  <span className="text-xs sm:text-xs font-medium truncate">{method.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Security Info - Responsive layout */}
          <div className="bg-white bg-opacity-50 p-3 sm:p-4 rounded-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center sm:space-x-4 space-y-2 sm:space-y-0 mb-2 sm:mb-3">
              <div className="flex items-center justify-center">
                <FiShield className="text-green-500 mr-1 text-sm sm:text-base" />
                <span className="text-xs sm:text-xs text-gray-600">Secure</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-gray-200"></div>
              <div className="flex items-center justify-center">
                <FiCreditCard className="text-blue-500 mr-1 text-sm sm:text-base" />
                <span className="text-xs sm:text-xs text-gray-600">PCI DSS</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-gray-200"></div>
              <div className="flex items-center justify-center">
                <span className="text-xs sm:text-xs bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500 font-bold">256-bit SSL</span>
              </div>
            </div>
            <p className="text-xs text-center text-gray-500">
              Your payment information is processed securely. We do not store credit card details.
            </p>
          </div>

          {/* Money Back Guarantee - Responsive layout */}
          <div className="mt-4 sm:mt-6 flex items-center justify-center bg-yellow-50 p-2 sm:p-3 rounded-lg border border-yellow-100">
            <div className="bg-yellow-100 p-1 sm:p-2 rounded-full mr-2 sm:mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-800">7-day money back guarantee</p>
              <p className="text-xxs sm:text-xs text-gray-500">If you're not satisfied, we'll refund your payment.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RazorpayPayment;