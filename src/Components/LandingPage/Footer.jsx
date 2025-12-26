import React from 'react';
import { FaTwitter, FaLinkedin, FaInstagram, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <div className="w-full mt-20">

      {/* Call-to-Action Section */}
      <div className="bg-blue-600 text-white py-16 text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Learning Journey Today</h2>
        <p className="text-lg md:text-xl mb-6">Join thousands of successful learners on MentorMate</p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-100 transition">
          Get Started for Free
        </button>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white px-6 md:px-20 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          
          {/* Left Section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-blue-500 text-2xl font-bold">⚡</span>
              <h2 className="text-xl font-semibold">MentorMate</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering learners through expert mentorship and structured learning paths.
            </p>
            <div className="flex gap-4 text-gray-400 text-xl">
              <FaTwitter className="hover:text-white cursor-pointer" />
              <FaLinkedin className="hover:text-white cursor-pointer" />
              <FaInstagram className="hover:text-white cursor-pointer" />
              <FaGithub className="hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Link Sections */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm text-gray-400">
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li className="hover:text-white cursor-pointer">Features</li>
                <li className="hover:text-white cursor-pointer">Pricing</li>
                <li className="hover:text-white cursor-pointer">Success Stories</li>
                <li className="hover:text-white cursor-pointer">Resources</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                <li className="hover:text-white cursor-pointer">About Us</li>
                <li className="hover:text-white cursor-pointer">Careers</li>
                <li className="hover:text-white cursor-pointer">Blog</li>
                <li className="hover:text-white cursor-pointer">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                <li className="hover:text-white cursor-pointer">Terms of Service</li>
                <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer">Cookie Policy</li>
                <li className="hover:text-white cursor-pointer">GDPR</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          © 2024 MentorMate. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Footer;
