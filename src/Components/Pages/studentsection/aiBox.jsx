import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MessageSquare, CalendarDays, BookOpen, Send, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import useUserStore from "../../../../zustore/store";

const DialogBox = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const userId = user?._id;

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !userId) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage(userMessage, 'user');
    setIsLoading(true);

    try {
      const { data } = await api.post('/api/chatbot', {
        userId,
        message: userMessage
      });

      if (data.error) {
        addMessage(`AI Service Error: ${data.error}. Please try again later.`, 'bot');
      } else {
        addMessage(data.response || data.message || 'Sorry, I could not process your request.', 'bot');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'An error occurred';
      addMessage(`Sorry, there was an error: ${errorMsg}`, 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (text, sender) => {
    setMessages(prev => [...prev, { text, sender }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const navigateTo = (path) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    {
      icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
      label: 'Chat with AI Mentor',
      action: () => setShowChat(true)
    },
    {
      icon: <CalendarDays className="w-5 h-5 text-purple-600" />,
      label: 'Schedule a Session',
      action: () => navigateTo('/student/mySession')
    },
    {
      icon: <BookOpen className="w-5 h-5 text-green-600" />,
      label: 'Explore Roadmaps',
      action: () => navigateTo('/student/getroadmaps')
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 border border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {showChat ? 'AI Chat' : 'AI Assistant'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!showChat ? (
          <div className="p-6">
            <div className="space-y-4">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-3 border border-gray-100"
                >
                  {item.icon}
                  <span className="text-gray-700">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[32rem]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-8">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  Start a conversation with your AI mentor!
                </div>
              )}

              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}

              {isLoading && <LoadingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t flex justify-between bg-gray-50 rounded-b-xl">
          {showChat && (
            <button
              onClick={() => setShowChat(false)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const MessageBubble = ({ message }) => (
  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-xs px-3 py-2 rounded-lg text-sm flex items-start gap-2 ${
        message.sender === 'user'
          ? 'bg-blue-500 text-white rounded-br-sm'
          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
      }`}
    >
      {message.sender === 'bot' ? (
        <Bot className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
      ) : (
        <User className="w-4 h-4 mt-0.5 text-white flex-shrink-0" />
      )}
      <span>{message.text}</span>
    </div>
  </div>
);

const LoadingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm max-w-xs">
      <div className="flex items-center gap-2">
        <Bot className="w-4 h-4 text-blue-500" />
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default DialogBox;