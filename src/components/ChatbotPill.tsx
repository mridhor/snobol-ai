"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function ChatbotPill() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chatbot Pill Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
          aria-label="Open chat"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium text-sm">Chat with us</span>
        </button>
      </div>

      {/* Chat Window (Optional - shown when clicked) */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-black text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">Snobol AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-gray-800 rounded-full p-1 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="bg-black text-white rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                  <p className="text-sm">
                    Hi! I'm your Snobol AI assistant. How can I help you today?
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              />
              <button
                className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full transition-colors text-sm font-medium"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

