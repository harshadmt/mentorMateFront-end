import React from 'react';
import { Users, GraduationCap, Video, School, LineChart, Clock } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <div className="bg-white w-full px-6 md:px-20 py-16">
      {/* Why Choose MentorMate */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose MentorMate</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6 text-center transition-transform duration-300 transform hover:scale-105 hover:shadow-lg">
          <Users className="text-blue-600 w-10 h-10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Expert Mentors</h3>
          <p className="text-gray-600 text-sm">Connect with industry professionals who guide your learning journey</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center transition-transform duration-300 transform hover:scale-105 hover:shadow-lg">
          <GraduationCap className="text-blue-600 w-10 h-10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Structured Roadmaps</h3>
          <p className="text-gray-600 text-sm">Follow proven learning paths designed for your success</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center transition-transform duration-300 transform hover:scale-105 hover:shadow-lg">
          <Video className="text-blue-600 w-10 h-10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Live Sessions</h3>
          <p className="text-gray-600 text-sm">Join interactive sessions for real-time learning and feedback</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center transition-transform duration-300 transform hover:scale-105 hover:shadow-lg">
          <School className="text-blue-600 w-10 h-10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Curated Resources</h3>
          <p className="text-gray-600 text-sm">Access hand-picked learning materials and exercises</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 mt-20 py-16 px-6 rounded-xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="bg-white rounded-xl p-6 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg">
            <Users className="text-blue-600 w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Match with the Right Mentor</h3>
            <p className="text-gray-600 text-sm">Find mentors who match your goals and interests</p>
          </div>
          <div className="bg-white rounded-xl p-6 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg">
            <LineChart className="text-blue-600 w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Follow Your Learning Path</h3>
            <p className="text-gray-600 text-sm">Access structured content and personalized guidance</p>
          </div>
          <div className="bg-white rounded-xl p-6 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg">
            <Clock className="text-blue-600 w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Track Your Progress</h3>
            <p className="text-gray-600 text-sm">Monitor your achievements and celebrate milestones</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
