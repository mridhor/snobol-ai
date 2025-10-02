"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

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
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
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
            className="group flex items-center gap-2 sm:gap-2.5 bg-white hover:bg-gray-900 text-white pl-3 pr-4 sm:pl-4 sm:pr-5 py-2.5 sm:py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-200"
            aria-label="Open chat"
          >
            <MessageCircle className="w-4 h-4 text-black group-hover:text-white transition-colors" />
            <span className="font-normal text-black text-sm group-hover:text-white transition-colors">Ask Snobol</span>
          </button>
        </div>
      )}

      {/* Full Page Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm animate-in fade-in duration-300 ease-out">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 border-b border-gray-200/60 bg-white/70 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image 
                  src="/snobol-ai-logo.png" 
                  alt="Snobol AI" 
                  width={89} 
                  height={24}
                  className="h-5 sm:h-6 w-auto"
                />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-colors -mr-1"
                aria-label="Close chat"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-full pt-12 sm:pt-14 pb-28 sm:pb-32 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6 py-4 sm:py-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-1 duration-300`}
                  style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
                >
                  {message.role === "user" ? (
                    <div className="bg-gray-900 text-white rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-[13px] sm:text-sm max-w-[85%] sm:max-w-[75%] shadow-sm break-words">
                      {message.content}
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-gray-800 max-w-[85%] sm:max-w-[75%] shadow-sm break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-3 sm:mb-4 last:mb-0 leading-relaxed">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-4 last:mb-0 ml-1">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-4 last:mb-0 ml-1 list-decimal list-inside">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="flex items-start gap-2 leading-relaxed">
                              <span className="text-gray-500 mt-1 select-none text-sm">•</span>
                              <span className="flex-1 break-words">{children}</span>
                            </li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-900">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic">{children}</em>
                          ),
                          h3: ({ children }) => (
                            <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 mt-4 sm:mt-5 first:mt-0 text-base sm:text-lg">{children}</h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-2.5 mt-3 sm:mt-4 first:mt-0 text-sm sm:text-base">{children}</h4>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono break-all">{children}</code>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-gray-300 pl-3 italic my-2 sm:my-3 text-sm sm:text-base opacity-90">{children}</blockquote>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm">
                    <div className="flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200/50 pt-3 sm:pt-4"
            style={{ 
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
            }}
          >
            <div className="max-w-3xl mx-auto px-3 sm:px-4">
              {error && (
                <div className="mb-2 sm:mb-3 px-3 py-2 sm:px-4 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm">
                  {error}
                </div>
              )}
              <div className="flex items-end gap-2 sm:gap-2.5 bg-white border border-gray-300 rounded-full shadow-sm p-2 sm:p-2.5">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Snobol AI..."
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 px-2.5 py-2 sm:px-3 sm:py-2 bg-transparent resize-none focus:outline-none text-[14px] sm:text-sm leading-relaxed disabled:opacity-50 overflow-y-auto"
                  style={{ minHeight: "40px", maxHeight: "120px" }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex-shrink-0 bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed p-2 sm:p-2.5 rounded-full transition-colors self-end"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 text-center mt-1.5 sm:mt-2 px-2">
                Snobol AI can make mistakes. Always double-check important info.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


