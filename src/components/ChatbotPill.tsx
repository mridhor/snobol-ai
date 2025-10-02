"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  thinkingTime?: number;
  suggestions?: string[];
}

export default function ChatbotPill() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I'm Snobol AI. Ask me about finance, investing, or our crisis investing approach.",
      suggestions: [
        "What is Snobol AI's crisis investing approach?",
        "How do you manage risk during market volatility?",
        "What makes a quality investment during uncertain times?"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<Set<number>>(new Set());
  const [thinkingDuration, setThinkingDuration] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastRequestTime = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Suggestion templates organized by topic (fallback only)
  const suggestionTemplates = {
    general: [
      "What is Snobol AI's crisis investing approach?",
      "How do you manage risk during market volatility?",
      "What makes a quality investment during uncertain times?",
      "How should beginners start investing?",
      "What's your view on diversification?"
    ],
    company: [
      "What financial metrics should I look at?",
      "How do I evaluate if a company is financially healthy?",
      "What are the risks I should consider?",
      "Should I focus on revenue growth or profitability?",
      "How important are dividends when investing?"
    ],
    market: [
      "Should I invest during a market downturn?",
      "How do I protect my portfolio during crashes?",
      "What's the difference between bull and bear markets?",
      "Is now a good time to buy stocks?",
      "How do economic cycles affect investments?"
    ],
    risk: [
      "How much of my portfolio should be in cash?",
      "What is position sizing and why does it matter?",
      "How do I avoid emotional investing decisions?",
      "What's the role of stop-losses in risk management?",
      "Should I use leverage in my investments?"
    ],
    specific: [
      "How do I know when to sell an investment?",
      "What's the role of dividends in investing?",
      "Should I invest in index funds or individual stocks?",
      "How do I balance growth vs value stocks?",
      "What's the best way to track my portfolio performance?"
    ],
    snobol: [
      "What makes Snobol AI different from other advisors?",
      "How does Snobol AI help during market crises?",
      "What is the philosophy behind crisis investing?",
      "Can you explain Snobol AI's investment strategy?",
      "How does Snobol AI stay calm during market panic?"
    ]
  };

  // AI-powered suggestion generation
  const generateAISuggestions = async (userMessage: string, assistantMessage: string): Promise<string[]> => {
    try {
      const response = await fetch("/api/chat/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage,
          assistantMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate suggestions");
      }

      const data = await response.json();
      return data.suggestions || getFallbackSuggestions(userMessage, assistantMessage);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      return getFallbackSuggestions(userMessage, assistantMessage);
    }
  };

  // Fallback: keyword-based suggestions
  const getFallbackSuggestions = (userQuestion: string, aiResponse: string): string[] => {
    const lowerQ = userQuestion.toLowerCase();
    const lowerA = aiResponse.toLowerCase();
    
    // Detect if asking about Snobol AI specifically
    if (lowerQ.includes('snobol') || lowerA.includes('snobol')) {
      return getRandomSuggestions(suggestionTemplates.snobol);
    }
    
    // Detect company/stock analysis
    if (lowerQ.match(/\b(apple|tesla|amazon|google|microsoft|meta|stock|company|share)\b/i) || 
        lowerA.includes('company') || lowerA.includes('financial health')) {
      return getRandomSuggestions(suggestionTemplates.company);
    }
    
    // Detect market conditions
    if (lowerQ.match(/\b(market|crash|downturn|bull|bear|recession|economy)\b/i) ||
        lowerA.match(/\b(market|volatility|downturn|crash)\b/i)) {
      return getRandomSuggestions(suggestionTemplates.market);
    }
    
    // Detect risk management
    if (lowerQ.match(/\b(risk|safe|protect|hedge|loss)\b/i) ||
        lowerA.match(/\b(risk|diversif|protect|buffer)\b/i)) {
      return getRandomSuggestions(suggestionTemplates.risk);
    }
    
    // Detect specific how-to questions
    if (lowerQ.match(/\b(how|when|should i|what's the best)\b/i)) {
      return getRandomSuggestions(suggestionTemplates.specific);
    }
    
    // Default to general suggestions
    return getRandomSuggestions(suggestionTemplates.general);
  };
  
  // Get 3 random suggestions from a category
  const getRandomSuggestions = (category: string[]) => {
    const shuffled = [...category].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Helper to find the last assistant message index with suggestions
  const getLastAssistantMessageWithSuggestions = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant" && messages[i].suggestions && messages[i].suggestions!.length > 0) {
        return i;
      }
    }
    return -1;
  };

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

  // Keep scrolling during streaming to follow the response
  useEffect(() => {
    if (isStreaming) {
      // Use instant scroll during streaming for better follow effect
      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" });
      };
      
      // Scroll immediately
      scrollToBottom();
      
      // Continue scrolling at intervals during streaming
      const scrollInterval = setInterval(scrollToBottom, 100);
      
      return () => clearInterval(scrollInterval);
    }
  }, [isStreaming, messages]);

  // Thinking duration counter
  useEffect(() => {
    if (isLoading) {
      // Reset counter and start timer
      setThinkingDuration(0);
      const startTime = Date.now();
      
      const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setThinkingDuration(elapsed);
      }, 100); // Update every 100ms for smooth counting
      
      return () => clearInterval(timer);
    } else {
      // Reset when not loading
      setThinkingDuration(0);
    }
  }, [isLoading]);

  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    
    if (textToSend && !isLoading && !isStreaming) {
      // Rate limiting: Prevent requests faster than every 2 seconds
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < 2000) {
        setError("Please wait a moment before sending another message.");
        return;
      }

      const userMessage = textToSend;
      setInputValue("");
      setError(null);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Add user message and empty assistant message for streaming
      const newMessages: Message[] = [
        ...messages, 
        { role: "user", content: userMessage },
        { role: "assistant", content: "" }
      ];
      setMessages(newMessages);
      setIsLoading(true);
      // Don't set isStreaming yet - wait for stream to actually start
      lastRequestTime.current = now;

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      let accumulatedContent = "";
      let suggestionsPromise: Promise<string[]> | null = null;
      let suggestionTriggered = false;

      try {
        // Only send last 10 messages to reduce token usage (excluding the empty assistant message)
        const recentMessages = newMessages.slice(-11, -1).slice(-10);
        
        // Call the streaming chat API
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: recentMessages,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        // Read the stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let reasoningData: { reasoning: string; thinkingTime: number } | null = null;

        if (reader) {
          // Now set streaming to true and hide loading dots
          setIsLoading(false);
          setIsStreaming(true);
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }

            // Decode the chunk and add to accumulated content
            const chunk = decoder.decode(value, { stream: true });
            
            // Check for reasoning metadata (using [\s\S] instead of 's' flag for wider compatibility)
            const reasoningMatch = chunk.match(/\[REASONING\]([\s\S]*?)\[\/REASONING\]/);
            if (reasoningMatch) {
              try {
                const metadata = JSON.parse(reasoningMatch[1]);
                reasoningData = {
                  reasoning: metadata.reasoning,
                  thinkingTime: metadata.thinkingTime
                };
              } catch (e) {
                console.error("Failed to parse reasoning metadata:", e);
              }
              // Remove the reasoning tags from content
              accumulatedContent += chunk.replace(/\[REASONING\][\s\S]*?\[\/REASONING\]/, "");
            } else {
              accumulatedContent += chunk;
            }

            // Start generating suggestions early when we have enough content (100 chars)
            // This runs in parallel with streaming
            if (!suggestionTriggered && accumulatedContent.length > 100) {
              suggestionTriggered = true;
              suggestionsPromise = generateAISuggestions(userMessage, accumulatedContent);
            }

            // Update the last message with accumulated content and reasoning
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: accumulatedContent,
                ...(reasoningData && {
                  reasoning: reasoningData.reasoning,
                  thinkingTime: reasoningData.thinkingTime
                })
              };
              return updated;
            });
          }
        }
      } catch (err: unknown) {
        console.error("Chat error:", err);
        const error = err as { message?: string; name?: string };
        
        // Don't show error if request was aborted
        if (error.name === 'AbortError') {
          return;
        }
        
        const errorMessage = error.message || "Failed to send message. Please try again.";
        
        // Show user-friendly message for rate limits
        if (errorMessage.includes("Rate limit")) {
          setError("Too many requests. Please wait a moment and try again.");
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: "I am receiving a lot of requests right now. Please wait a moment and try again, or email us at hello@snobol.com."
            };
            return updated;
          });
        } else {
          setError(errorMessage);
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: "I apologize, but I am having trouble responding right now. Please try again or contact us at hello@snobol.com for assistance."
            };
            return updated;
          });
        }
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
        
        // Wait for suggestions to be ready (they should already be generated by now)
        if (accumulatedContent && suggestionsPromise) {
          // Suggestions were already being generated in parallel
          const newSuggestions = await suggestionsPromise;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              suggestions: newSuggestions
            };
            return updated;
          });
        } else if (accumulatedContent) {
          // Fallback if suggestions weren't triggered during streaming
          const newSuggestions = await generateAISuggestions(userMessage, accumulatedContent);
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              suggestions: newSuggestions
            };
            return updated;
          });
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    // Wait for exit animation to complete before actually closing
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 250); // Match animation duration
  };

  const handleSuggestionClick = (suggestion: string, messageIndex: number) => {
    // Clear suggestions from the clicked message immediately
    setMessages(prev => {
      const updated = [...prev];
      updated[messageIndex] = {
        ...updated[messageIndex],
        suggestions: [] // Clear suggestions
      };
      return updated;
    });
    
    // Send the suggestion immediately
    handleSendMessage(suggestion);
  };

  return (
    <>
      <style jsx>{`
        @keyframes smoothReveal {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .streaming-text {
          animation: smoothReveal 0.6s ease-out forwards;
        }
        
        @keyframes elegantSlideIn {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }
        
        .message-appear {
          animation: elegantSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* Exit animations */
        @keyframes fadeOutZoom {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.96);
          }
        }
        
        @keyframes slideOutTop {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-12px);
          }
        }
        
        @keyframes slideOutBottom {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(12px);
          }
        }
        
        .exit-overlay {
          animation: fadeOutZoom 0.25s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        
        .exit-top {
          animation: slideOutTop 0.2s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        
        .exit-bottom {
          animation: slideOutBottom 0.2s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        
        /* Thinking text animation */
        @keyframes thinkingPulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes thinkingFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .thinking-text {
          animation: thinkingPulse 1.5s ease-in-out infinite, thinkingFadeIn 0.4s ease-out forwards;
        }
      `}</style>
      
      {/* Chatbot Pill Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 sm:gap-2.5 bg-white hover:bg-gray-900 text-white pl-3 pr-4 sm:pl-4 sm:pr-5 py-2.5 sm:py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-200"
            aria-label="Open chat"
          >
            <MessageCircle className="w-5 h-5 text-black group-hover:text-white transition-colors" />
            <span className="font-normal text-black text-md group-hover:text-white transition-colors">Ask Snobol</span>
          </button>
        </div>
      )}

      {/* Full Page Overlay */}
      {isOpen && (
        <div className={`fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm ${
          isClosing ? 'exit-overlay' : 'animate-in fade-in zoom-in-98 duration-600 ease-out'
        }`}>
          {/* Header */}
          <div className={`absolute top-0 left-0 right-0 z-10 bg-white/70 backdrop-blur-sm ${
            isClosing ? 'exit-top' : 'animate-in slide-in-from-top-2 fade-in duration-500 ease-out'
          }`}>
            <div className="max-w-full mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
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
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-colors -mr-1"
                aria-label="Close chat"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={`h-full pt-12 sm:pt-14 pb-28 sm:pb-32 overflow-y-auto ${
            isClosing ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-600 delay-150 ease-out'
          }`}>
            <div className="max-w-3xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6 py-4 sm:py-6">
              {messages.map((message, index) => {
                // Hide the empty assistant message during loading or if it's still empty during streaming
                const isEmptyAssistantMessage = message.role === "assistant" && message.content === "" && index === messages.length - 1;
                if (isEmptyAssistantMessage && (isLoading || isStreaming)) {
                  return null;
                }
                
                // Check if this is the last assistant message with suggestions
                const lastAssistantWithSuggestions = getLastAssistantMessageWithSuggestions();
                const isLatestSuggestion = index === lastAssistantWithSuggestions;
                
                return (
                  <div key={index}>
                    <div
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "user" ? (
                        <div 
                          className="bg-gray-900 text-white rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-[13px] sm:text-sm max-w-[85%] sm:max-w-[75%] break-words message-appear"
                          style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
                        >
                          {message.content}
                        </div>
                      ) : (
                        <div 
                          className={`bg-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-gray-800 max-w-[85%] sm:max-w-[75%] break-words relative ${
                            isStreaming && index === messages.length - 1 && message.content !== "" ? 'streaming-text' : 'message-appear'
                          }`}
                          style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
                        >
                        {/* Thinking Process Section */}
                        {message.reasoning && message.thinkingTime && (
                          <div className="mb-3 sm:mb-4 border-b border-gray-200 pb-3">
                            <button
                              onClick={() => {
                                setExpandedThinking(prev => {
                                  const next = new Set(prev);
                                  if (next.has(index)) {
                                    next.delete(index);
                                  } else {
                                    next.add(index);
                                  }
                                  return next;
                                });
                              }}
                              className="flex items-center justify-between w-full text-left hover:opacity-70 transition-opacity"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-600">
                                  Thinking process
                                </span>
                                <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                                  {(message.thinkingTime / 1000).toFixed(1)}s
                                </span>
                              </div>
                              {expandedThinking.has(index) ? (
                                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                              )}
                            </button>
                            
                            {expandedThinking.has(index) && (
                              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-2 sm:p-3 whitespace-pre-wrap animate-in slide-in-from-top-2 fade-in duration-200">
                                {message.reasoning}
                              </div>
                            )}
                          </div>
                        )}
                        
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
                  
                  {/* Suggestion Pills Below Message */}
                  {message.role === "assistant" && message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex justify-start mt-3">
                      <div className="max-w-[85%] sm:max-w-[75%] flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300 delay-100">
                        {message.suggestions.map((suggestion, suggestionIndex) => (
                          <button
                            key={suggestionIndex}
                            onClick={() => handleSuggestionClick(suggestion, index)}
                            disabled={isLoading || isStreaming}
                            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              isLatestSuggestion
                                ? 'bg-white hover:bg-gray-900 text-gray-700 hover:text-white border border-gray-200 hover:border-gray-900 hover:shadow-sm'
                                : 'bg-gray-50 hover:bg-gray-900 text-gray-400 hover:text-white border border-gray-100 hover:border-gray-900 opacity-60 hover:opacity-100 hover:shadow-sm'
                            }`}
                          >
                            <span className="line-clamp-1">{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
              })}

              {isLoading && !isStreaming && (
                <div className="flex flex-col items-start gap-2">
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 max-w-[85%] sm:max-w-[75%] message-appear">
                      <div className="flex items-center space-x-1.5">
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
                  <span className="thinking-text text-xs sm:text-sm text-gray-500 font-medium ml-3 sm:ml-4">
                    Thinking... ({thinkingDuration}s)
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md pt-3 sm:pt-4 ${
              isClosing ? 'exit-bottom' : 'animate-in slide-in-from-bottom-2 fade-in duration-600 delay-100 ease-out'
            }`}
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
              <div className="flex items-end gap-2 sm:gap-2.5 bg-white border border-gray-300 rounded-[1.625em] p-2 sm:p-2.5">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Snobol AI..."
                  rows={1}
                  disabled={isLoading || isStreaming}
                  className="flex-1 px-2.5 py-2 sm:px-3 sm:py-2 bg-transparent resize-none focus:outline-none text-[14px] sm:text-sm leading-relaxed disabled:opacity-50 overflow-y-auto"
                  style={{ minHeight: "40px", maxHeight: "120px" }}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading || isStreaming}
                  className="flex-shrink-0 bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed p-2 sm:p-2.5 rounded-full transition-colors self-end"
                  aria-label="Send message"
                >
                  {isLoading || isStreaming ? (
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


