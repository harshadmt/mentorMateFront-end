import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import heroImage from '../../assets/study.jpg';

const Landing = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="bg-red- min-h-screen flex items-center justify-center px-8 md:px-28 py-20 overflow-hidden">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between w-full max-w-[1440px] gap-16">
        
        {/* Text Content with AOS */}
        <div
          className="w-full md:w-1/2 text-center md:text-left"
          data-aos="fade-up"
        >
          <p className="text-blue-600 font-semibold text-base md:text-lg uppercase tracking-wide mb-4">
            Your Personal Learning Partner
          </p>

          <h1 className="text-5xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
            Empower Your Self-Learning Journey <br className="hidden md:block" />
            with <span className="text-blue-600">MentorMate</span>
          </h1>

          <p className="text-gray-600 text-l md:text-l mb-10 max-w-xl">
            Connect with expert mentors, access guided roadmaps, book live sessions, and join a thriving community of learners — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-base font-medium hover:bg-blue-700 transition">
              Get Started
            </button>
            <button className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-base font-medium hover:bg-blue-50 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Hero Image with AOS */}
        <div className="w-full md:w-1/2" data-aos="zoom-in">
          <img
            src={heroImage}
            alt="Mentorship illustration"
            className="w-full max-w-[700px] h-auto mx-auto md:mx-0"
          />
        </div>
      </div>
    </div>
  );
};

export default Landing;
