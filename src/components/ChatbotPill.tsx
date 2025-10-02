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
      content: "Hi! I'm Snobol AI . How can I help you today?"
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
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 bg-black hover:bg-gray-900 text-white pl-4 pr-5 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
            aria-label="Open chat"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-normal text-sm">Chat with Snobol AI</span>
          </button>
        </div>
      )}

      {/* Full Page Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-white animate-in fade-in duration-200">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-white z-10 border-b border-gray-100">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-900">Snobol AI</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="h-full pt-14 pb-40 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4">
              <div className="space-y-8 py-8">
                {messages.map((message, index) => (
                  <div key={index} className="group">
                    {message.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="bg-gray-100 rounded-3xl px-5 py-3 max-w-[80%]">
                          <p className="text-[15px] text-gray-900 leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-gray-900">Snobol AI</div>
                        <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-gray-900">Snobol AI</div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Input Area (Fixed at bottom) */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8">
            <div className="max-w-3xl mx-auto px-4 pb-6">
              {error && (
                <div className="mb-3 px-4 py-2 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <div className="relative bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Snobol AI..."
                  rows={1}
                  disabled={isLoading}
                  className="w-full px-5 py-4 pr-12 bg-transparent focus:outline-none resize-none text-[15px] leading-relaxed max-h-32 overflow-y-auto disabled:opacity-50"
                  style={{
                    minHeight: "56px",
                    height: "auto"
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-3 bottom-3 bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-2 rounded-full transition-all"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">
                Snobol AI can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
