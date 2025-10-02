"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotPill() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I'm Snobol AI. Ask me about finance, investing, or our crisis investing approach."
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastRequestTime = useRef<number>(0);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      // Rate limiting: Prevent requests faster than every 2 seconds
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < 2000) {
        setError("Please wait a moment before sending another message.");
        return;
      }

      const userMessage = inputValue.trim();
      setInputValue("");
      setError(null);
      
      // Add user message
      const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
      setMessages(newMessages);
      setIsLoading(true);
      lastRequestTime.current = now;

      try {
        // Only send last 10 messages to reduce token usage
        const recentMessages = newMessages.slice(-10);
        
        // Call the chat API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: recentMessages,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get response");
        }

        const data = await response.json();
        
        // Add AI response
        setMessages([...newMessages, {
          role: "assistant",
          content: data.message,
        }]);
      } catch (err: unknown) {
        console.error("Chat error:", err);
        const error = err as { message?: string };
        const errorMessage = error.message || "Failed to send message. Please try again.";
        
        // Show user-friendly message for rate limits
        if (errorMessage.includes("Rate limit")) {
          setError("Too many requests. Please wait a moment and try again.");
          setMessages([...newMessages, {
            role: "assistant",
            content: "I am receiving a lot of requests right now. Please wait a moment and try again, or email us at hello@snobol.com.",
          }]);
        } else {
          setError(errorMessage);
          setMessages([...newMessages, {
            role: "assistant",
            content: "I apologize, but I am having trouble responding right now. Please try again or contact us at hello@snobol.com for assistance.",
          }]);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Pill Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 sm:gap-2.5 bg-black hover:bg-gray-900 text-white pl-3 pr-4 sm:pl-4 sm:pr-5 py-2.5 sm:py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
            aria-label="Open chat"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-normal text-sm">Snobol AI</span>
          </button>
        </div>
      )}

      {/* Full Page Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-white animate-in fade-in zoom-in-95 duration-300 ease-out">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-white z-10 border-b border-gray-100 animate-in slide-in-from-top duration-300">
            <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-medium text-gray-900">Snobol AI</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Close chat"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="h-full pt-12 sm:pt-14 pb-32 sm:pb-40 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6">
              <div className="space-y-4 sm:space-y-6 md:space-y-8 py-4 sm:py-6 md:py-8">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`group ${
                      message.role === "user" 
                        ? "animate-in slide-in-from-right-4 fade-in duration-300" 
                        : "animate-in slide-in-from-top-2 fade-in duration-400"
                    }`}
                    style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
                  >
                    {message.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="bg-gray-100 rounded-2xl sm:rounded-3xl px-3.5 py-2.5 sm:px-5 sm:py-3 max-w-[85%] sm:max-w-[80%]">
                          <p className="text-[14px] sm:text-[15px] text-gray-900 leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5 sm:gap-1">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">Snobol AI</div>
                        <p className="text-[14px] sm:text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex flex-col gap-0.5 sm:gap-1 animate-in slide-in-from-top-3 fade-in duration-500">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">Snobol AI</div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Input Area (Fixed at bottom) */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-4 sm:pt-6 md:pt-8 animate-in slide-in-from-bottom duration-400">
            <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
              {error && (
                <div className="mb-2 sm:mb-3 px-3 sm:px-4 py-2 bg-red-50 rounded-lg animate-in slide-in-from-top-2 fade-in duration-300">
                  <p className="text-xs sm:text-sm text-red-600">{error}</p>
                </div>
              )}
              <div className="relative bg-white border border-gray-200 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Snobol AI..."
                  rows={1}
                  disabled={isLoading}
                  className="w-full px-3.5 py-3 pr-11 sm:px-5 sm:py-4 sm:pr-12 bg-transparent focus:outline-none resize-none text-[14px] sm:text-[15px] leading-relaxed max-h-32 overflow-y-auto disabled:opacity-50"
                  style={{
                    minHeight: "48px",
                    height: "auto"
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-1.5 sm:p-2 rounded-full transition-all"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 text-center mt-2 sm:mt-3 px-2">
                Snobol AI can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
