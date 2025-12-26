import React, { useState, useEffect } from 'react';

const MentorMate404 = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(0);

  const mentorQuotes = [
    "Every expert was once a beginner.",
    "The best teachers are those who show you where to look, but don't tell you what to see.",
    "Learning never exhausts the mind.",
    "A mentor is someone who sees more talent and ability within you than you see in yourself."
  ];

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % mentorQuotes.length);
    }, 4000);

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(quoteInterval);
    };
  }, []);

  const createRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4 relative">
      
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
            filter: 'blur(60px)'
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[
          { icon: '📚', left: 20, top: 30 },
          { icon: '💡', left: 80, top: 25 },
          { icon: '🎓', left: 15, top: 70 },
          { icon: '✨', left: 85, top: 75 }
        ].map((item, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-15 hover:opacity-40 transition-opacity duration-300"
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              animation: `gentleFloat ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            {item.icon}
          </div>
        ))}
      </div>

      <div className={`text-center space-y-10 relative z-10 max-w-4xl mx-auto transform transition-all duration-1000 ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        
        <div className={`transform transition-all duration-500 delay-200 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">MM</span>
            </div>
            <h3 className="text-2xl font-semibold text-blue-600">
              Mentor Mate
            </h3>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 select-none">
            404
          </h1>
        </div>

        <div className={`space-y-4 transform transition-all duration-500 delay-400 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
        }`}>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800">
            Oops! This Learning Path Doesn't Exist
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            It seems like you've wandered off the mentorship trail. Don't worry though – 
            every great learner gets lost sometimes. Let's guide you back to your learning journey!
          </p>
        </div>

        <div className={`transform transition-all duration-500 delay-600 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
        }`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💡</span>
              </div>
              <span className="text-sm font-medium text-blue-600">Mentor's Wisdom</span>
            </div>
            <p className="text-gray-700 italic text-center transition-all duration-500">
              "{mentorQuotes[currentQuote]}"
            </p>
          </div>
        </div>

        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 transform transition-all duration-500 delay-800 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
        }`}>
          <button
            onClick={(e) => {
              createRipple(e);
              setTimeout(() => window.location.href = '/', 200);
            }}
            className="group relative px-8 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all duration-300 hover:bg-blue-700 hover:shadow-lg overflow-hidden"
          >
            {ripples.map(ripple => (
              <span
                key={ripple.id}
                className="absolute bg-white/30 rounded-full animate-ping"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: ripple.size,
                  height: ripple.size,
                }}
              />
            ))}
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Find a Mentor
            </span>
          </button>
          
          <button
            onClick={(e) => {
              createRipple(e);
              setTimeout(() => window.history.back(), 200);
            }}
            className="group relative px-8 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg font-medium transition-all duration-300 hover:bg-blue-50 hover:border-blue-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </span>
          </button>

          <button
            onClick={(e) => {
              createRipple(e);
              setTimeout(() => window.location.href = '/search', 200);
            }}
            className="group relative px-8 py-3 bg-sky-500 text-white rounded-lg font-medium transition-all duration-300 hover:bg-sky-600 hover:shadow-lg overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore Learning
            </span>
          </button>
        </div>

        <div className={`flex justify-center pt-8 transform transition-all duration-500 delay-1000 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
        }`}>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Learning Progress</span>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  style={{
                    animation: `simplePulse 1.6s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes simplePulse {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default MentorMate404;
