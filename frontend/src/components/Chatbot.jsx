import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const Chatbot = () => {
  const { user } = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize or reset chat when user changes (login/logout)
  useEffect(() => {
    setMessages([
      { 
        role: "model", 
        text: user 
          ? `Hi ${user.FirstName}! I'm your Flossie Clothing assistant. How can I help you today?`
          : "Hi there! I'm your Flossie Clothing assistant. How can I help you today?" 
      }
    ]);
  }, [user]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Send message and history (excluding the very first greeting and the current message)
      const history = newMessages.slice(1, -1);
      
      // Send message, history, and userName to the backend
      const res = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage.text,
        history: history,
        userName: user?.FirstName || "Guest"
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: "model", text: res.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "model", text: "Sorry, I'm having trouble right now." }]);
      }
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { role: "model", text: "I couldn't connect to the server. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-[88px] right-4 w-14 h-14 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all duration-200 z-50 cursor-pointer ${isOpen ? 'hidden' : 'flex'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageSquare size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-0 right-0 w-full h-[100dvh] sm:h-[600px] sm:max-h-[80vh] sm:bottom-24 sm:right-6 sm:w-[380px] bg-white sm:rounded-2xl shadow-2xl z-[60] flex flex-col sm:border border-stone-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Flossie Assistant</h3>
                  <p className="text-[10px] text-white/70">Online & ready to help</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
                >
                  {msg.role === "model" && (
                    <div className="w-6 h-6 bg-stone-200 rounded-full flex items-center justify-center shrink-0 mb-1">
                      <Bot size={12} className="text-stone-700" />
                    </div>
                  )}
                  <div 
                    className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                      msg.role === "user" 
                        ? "bg-stone-900 text-white rounded-br-none" 
                        : "bg-white text-stone-800 rounded-bl-none border border-stone-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start items-end gap-2">
                  <div className="w-6 h-6 bg-stone-200 rounded-full flex items-center justify-center shrink-0 mb-1">
                    <Bot size={12} className="text-stone-700" />
                  </div>
                  <div className="px-4 py-3 bg-white border border-stone-100 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                    <motion.div className="w-1.5 h-1.5 bg-stone-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-stone-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-stone-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-100">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-stone-100/50 hover:bg-stone-100 focus:bg-stone-100 px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-colors border border-transparent focus:border-stone-200"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-stone-900 text-white rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
