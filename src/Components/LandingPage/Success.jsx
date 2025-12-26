import React from 'react';
import { FaStar } from 'react-icons/fa';

const SuccessStories = () => {
  return (
    <div className="bg-white py-16 px-6 md:px-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Success Stories</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Sarah Johnson"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold">Sarah Johnson</h3>
              <p className="text-sm text-gray-500">Software Developer</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            "MentorMate helped me transition into tech with personalized guidance and structured learning paths."
          </p>
          <div className="flex items-center text-sm text-gray-600 space-x-2">
            <div className="flex text-yellow-500">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <span>Mentored by David Chen • Senior Software Engineer</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Michael Brown"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold">Michael Brown</h3>
              <p className="text-sm text-gray-500">Data Scientist</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            "The mentorship program accelerated my learning and helped me land my dream job."
          </p>
          <div className="flex items-center text-sm text-gray-600 space-x-2">
            <div className="flex text-yellow-500">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <span>Mentored by Emily Watson • Data Science Lead</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl hover:-translate-y-1 transition duration-300">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src="https://randomuser.me/api/portraits/women/68.jpg"
              alt="Lisa Chen"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold">Lisa Chen</h3>
              <p className="text-sm text-gray-500">UX Designer</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            "The structured approach and expert guidance made all the difference in my career growth."
          </p>
          <div className="flex items-center text-sm text-gray-600 space-x-2">
            <div className="flex text-yellow-500">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <span>Mentored by Alex Thompson • UX Director</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
