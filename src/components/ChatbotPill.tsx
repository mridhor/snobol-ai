"use client";

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { MessageCircle, X, Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import TradingViewWidget from "./TradingViewWidget";

interface ChartData {
  type: string;
  symbol: string;
  companyName: string;
  period: string;
  currentPrice: string;
  change: string;
  data: Array<{
    date: string;
    price: string;
    high: string;
    low: string;
    volume: number;
  }>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  thinkingTime?: number;
  suggestions?: string[];
  chartData?: ChartData;
}

export interface ChatbotPillRef {
  open: () => void;
  close: () => void;
}

const ChatbotPill = forwardRef<ChatbotPillRef>((props, ref) => {
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
  const [loadingMessage, setLoadingMessage] = useState("Thinking...");
  const [inputContext, setInputContext] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastRequestTime = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Expose open and close methods
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: handleClose
  }));

  // Suggestion templates organized by topic (fallback only)
  const suggestionTemplates = {
    general: [
      "What is Snobol AI's crisis investing approach?",
      "How do you manage risk during market volatility?",
      "What makes a quality investment during uncertain times?",
      "How should beginners start investing?",
      "What's your view on diversification?",
      "How much money do I need to start investing?",
      "What's the difference between investing and trading?",
      "Should I invest in what I don't understand?",
      "How do I build a long-term investment plan?",
      "What are the biggest mistakes new investors make?",
      "How often should I check my portfolio?",
      "Is it better to invest regularly or wait for dips?",
      "How do I stay calm when everyone else is panicking?",
      "What should I focus on during market uncertainty?",
      "How do I prepare for the next crisis?",
      "What's a safe investing strategy for beginners?"
    ],
    company: [
      "What financial metrics should I look at?",
      "How do I evaluate if a company is financially healthy?",
      "What are the risks I should consider?",
      "Should I focus on revenue growth or profitability?",
      "How important are dividends when investing?",
      "What does debt-to-equity ratio tell me?",
      "How do I know if a stock is overvalued?",
      "What's more important: earnings or cash flow?",
      "Should I worry about management changes?",
      "How do I research a company before investing?",
      "What red flags should I watch out for?",
      "How does company size affect my investment?",
      "Which companies survive market crashes better?",
      "How do I spot financially stable companies?",
      "What makes a company crisis-resistant?",
      "Should I avoid companies with high debt during crises?",
      "How important is a company's cash reserves?",
      "What industries are safer during downturns?",
    ],
    market: [
      "Should I invest during a market downturn?",
      "How do I protect my portfolio during crashes?",
      "What's the difference between bull and bear markets?",
      "Is now a good time to buy stocks?",
      "How do economic cycles affect investments?",
      "What happens to stocks during a recession?",
      "Should I sell everything when markets crash?",
      "How long do market downturns usually last?",
      "What's the best strategy during high inflation?",
      "How do interest rate changes affect stocks?",
      "Should I time the market or invest consistently?",
      "What causes stock market volatility?",
      "How can I profit from market fear and panic?",
      "What are the signs of a market crisis?",
      "Should I buy when others are fearful?",
      "How do I stay rational during market crashes?",
      "What's the best defense in a bear market?",
      "How do crisis cycles create opportunities?",
      "Analyze current market conditions",
      "Show me historical bear market recoveries",
      "Explain today's market volatility",
      "Compare this downturn to 2008"
    ],
    risk: [
      "How much of my portfolio should be in cash?",
      "What is position sizing and why does it matter?",
      "How do I avoid emotional investing decisions?",
      "What's the role of stop-losses in risk management?",
      "Should I use leverage in my investments?",
      "How much risk should I take at my age?",
      "What's a safe withdrawal rate in retirement?",
      "Should I sell losing positions or hold on?",
      "How do I balance risk and reward?",
      "What's the right asset allocation for me?",
      "How do I protect against market crashes?",
      "Is it risky to invest in just one sector?",
      "How do I build a safety buffer for crises?",
      "What's a conservative portfolio allocation?",
      "Should I reduce risk during uncertain times?",
      "How can I minimize losses in a downturn?",
      "What's the safest way to preserve capital?",
      "How do I prepare my portfolio for a crisis?",
      "Assess my portfolio risk level",
      "Create a conservative allocation plan",
      "Review my current risk exposure",
      "Build me a defensive portfolio"
    ],
    specific: [
      "How do I know when to sell an investment?",
      "What's the role of dividends in investing?",
      "Should I invest in index funds or individual stocks?",
      "How do I balance growth vs value stocks?",
      "What's the best way to track my portfolio performance?",
      "Should I reinvest my dividends automatically?",
      "How do taxes affect my investment returns?",
      "What's the benefit of dollar-cost averaging?",
      "Should I rebalance my portfolio regularly?",
      "How do I choose between stocks and bonds?",
      "What's a reasonable return to expect?",
      "Should I invest in international stocks?",
      "How do I invest safely during a crisis?",
      "What's the best way to buy during market fear?",
      "Should I hold more cash during downturns?",
      "How can I use market crashes to my advantage?",
      "What assets hold value during crises?",
      "Should I focus on value stocks during bear markets?",
      "Show me dividend aristocrats",
      "Compare index funds vs ETFs",
      "Calculate tax-efficient investing strategies",
      "Explain dollar-cost averaging with examples"
    ],
    snobol: [
      "What makes Snobol AI different from other advisors?",
      "How does Snobol AI help during market crises?",
      "What is the philosophy behind crisis investing?",
      "Can you explain Snobol AI's investment strategy?",
      "How does Snobol AI stay calm during market panic?",
      "Why does Snobol AI focus on crisis investing?",
      "What does Snobol AI recommend for beginners?",
      "How can Snobol AI help me build wealth?",
      "What's Snobol AI's approach to risk?",
      "Does Snobol AI work for long-term investing?",
      "How does Snobol AI handle market uncertainty?",
      "What makes crisis investing effective?",
      "How does Snobol AI turn panic into opportunity?",
      "What's Snobol AI's secret to staying calm?",
      "How can I invest like Snobol AI during crises?",
      "What does Snobol AI do when markets crash?"
    ],
    crisis: [
      "How do I invest during a financial crisis?",
      "What should I buy when markets are crashing?",
      "How can I profit from market panic?",
      "What's the best strategy during economic uncertainty?",
      "Should I hold cash during a crisis?",
      "How do I stay calm when my portfolio is down?",
      "What makes a good crisis investment?",
      "How long should I wait before buying the dip?",
      "What are the warning signs of a market crash?",
      "How do I protect my wealth during turbulent times?",
      "Should I sell before a recession hits?",
      "What opportunities emerge during market fear?",
      "How do I build a crisis-proof portfolio?",
      "What assets perform well during downturns?",
      "How can fear create buying opportunities?",
      "What's the safest approach during market chaos?",
      "Show me crisis investing strategies",
      "Analyze market crash patterns",
      "Find undervalued stocks during panic",
      "Build me a crisis-resistant portfolio"
    ],
    valueinvesting: [
      "What is value investing?",
      "How do I find undervalued stocks?",
      "What makes a stock a good value?",
      "Should I focus on value during bear markets?",
      "How do I know if a company is trading below value?",
      "What's the difference between price and value?",
      "How patient should I be with value investments?",
      "What are the best value investing strategies?",
      "How do I spot value during market crashes?",
      "Should I buy quality companies at low prices?",
      "What role does patience play in value investing?",
      "How do crises create value opportunities?",
      "Find undervalued stocks for me",
      "Analyze Warren Buffett's value approach",
      "Show me quality companies trading below value",
      "Teach me value investing fundamentals"
    ],
    psychology: [
      "How do I control fear when investing?",
      "What should I do when I panic about losses?",
      "How do I avoid making emotional decisions?",
      "Why do I want to sell when markets drop?",
      "How can I think long-term during chaos?",
      "What's the psychology behind market panic?",
      "How do I stay disciplined during volatility?",
      "Why is it hard to buy when others are selling?",
      "How can I be greedy when others are fearful?",
      "What mindset do successful crisis investors have?",
      "How do I overcome investment anxiety?",
      "Why does the crowd usually get it wrong?",
      "Help me overcome my fear of losses",
      "Teach me emotional discipline",
      "Show me how Warren Buffett stays calm",
      "Explain the psychology of successful investors"
    ],
    personalfinance: [
      "How much should I save for emergencies?",
      "What's a good budgeting strategy?",
      "Should I pay off debt before investing?",
      "How do I balance saving and investing?",
      "What percentage of income should I invest?",
      "How do I plan for retirement?",
      "Should I prioritize 401k or personal investing?",
      "How much house can I afford?",
      "What's the best way to save for college?",
      "How do I prepare financially for a crisis?",
      "Should I have multiple income streams?",
      "How much cash should I keep liquid?",
      "What's a safe withdrawal strategy?",
      "How do I build long-term financial security?",
      "What insurance do I really need?",
      "How do I protect my family financially?",
      "Create a budget plan for me",
      "Calculate my retirement needs",
      "Review my current financial situation",
      "Build me an emergency fund strategy"
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
    const combined = lowerQ + ' ' + lowerA;
    
    // Detect if asking about Snobol AI specifically
    if (lowerQ.includes('snobol') || lowerA.includes('snobol')) {
      return getRandomSuggestions(suggestionTemplates.snobol);
    }
    
    // Detect crisis/panic/fear topics (HIGH PRIORITY - Snobol's specialty)
    if (combined.match(/\b(crisis|crash|panic|fear|uncertain|turbulent|chaos|market fear|economic crisis|financial crisis|downturn|collapse|blood|carnage|disaster)\b/i)) {
      return getRandomSuggestions(suggestionTemplates.crisis);
    }
    
    // Detect psychology/emotions/behavior
    if (combined.match(/\b(afraid|scared|nervous|worry|anxious|emotion|panic|fear|psychology|mindset|discipline|greed|calm|patient|irrational|rational)\b/i)) {
      return getRandomSuggestions(suggestionTemplates.psychology);
    }
    
    // Detect value investing topics
    if (combined.match(/\b(value|undervalued|cheap|bargain|intrinsic|fair value|discount|margin of safety|quality|fundamental)\b/i)) {
      return getRandomSuggestions(suggestionTemplates.valueinvesting);
    }
    
    // Detect personal finance topics
    if (combined.match(/\b(budget|save|saving|emergency fund|debt|loan|mortgage|retirement|401k|ira|pension|insurance|income|salary|expense|college fund|financial plan|net worth|credit|afford|pay off)\b/i)) {
      return getRandomSuggestions(suggestionTemplates.personalfinance);
    }
    
    // Detect company/stock analysis (expanded keywords)
    if (combined.match(/\b(apple|tesla|amazon|google|microsoft|meta|netflix|nvidia|stock|company|share|equity|corporation|business|ticker|earnings|revenue|profit|balance sheet|income statement|cash flow|dividend|p\/e|price-to-earnings)\b/i)) {
      return getRandomSuggestions(suggestionTemplates.company);
    }
    
    // Detect market conditions (expanded)
    if (combined.match(/\b(market|bull|bear|recession|depression|recovery|expansion|cycle|boom|bust|economy|economic|gdp|unemployment|inflation|deflation|fed|federal reserve|interest rate|correction|rally)\b/i)) {
      return getRandomSuggestions(suggestionTemplates.market);
    }
    
    // Detect risk management (expanded)
    if (combined.match(/\b(risk|safe|protect|hedge|loss|avoid loss|preservation|capital preservation|buffer|emergency fund|cash reserve|allocation|defensive|conservative|volatility|drawdown|stop loss)\b/i)) {
      return getRandomSuggestions(suggestionTemplates.risk);
    }
    
    // Detect specific how-to questions
    if (lowerQ.match(/\b(how do|how can|how should|when do|when should|should i|what's the best|which is better|help me|teach me|explain|tell me about)\b/i)) {
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

  // Helper to extract chart data from content
  const extractChartData = (content: string): { cleanContent: string; chartData: ChartData | null } => {
    const chartMatch = content.match(/\[CHART_DATA\]([\s\S]*?)\[\/CHART_DATA\]/);
    if (chartMatch) {
      try {
        const chartData = JSON.parse(chartMatch[1]) as ChartData;
        const cleanContent = content.replace(/\[CHART_DATA\][\s\S]*?\[\/CHART_DATA\]/, '').trim();
        return { cleanContent, chartData };
      } catch (e) {
        console.error('Failed to parse chart data:', e);
      }
    }
    return { cleanContent: content, chartData: null };
  };


  // Helper to get dynamic loading message based on tool being called
  const getLoadingMessage = (toolName?: string): string => {
    if (!toolName) return "Thinking...";
    
    const messages: Record<string, string> = {
      'get_stock_quote': 'Fetching stock price...',
      'analyze_company': 'Analyzing company...',
      'show_stock_chart': 'Loading chart data...',
      'search_web': 'Searching the web...',
    };
    
    return messages[toolName] || 'Processing...';
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

  // Robust scroll function
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    // Try multiple methods to ensure scroll works
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
    }
    
    // Also scroll the container directly
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };


  // Handle Escape key to close chatbot
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);
  // Auto scroll to bottom when new messages arrive or loading state changes
  // BUT disable auto-scroll for stock analysis cases
  useEffect(() => {
    // Check if the latest message is a stock analysis
    const latestMessage = messages[messages.length - 1];
    const isStockAnalysis = latestMessage && 
      latestMessage.role === "assistant" && 
      latestMessage.content && 
      (latestMessage.content.includes("stock") || 
       latestMessage.content.includes("analysis") ||
       latestMessage.content.includes("Company Deep Dive") ||
       latestMessage.chartData);
    
    // For stock analysis, scroll to the user's prompt request first
    if (isStockAnalysis) {
      setTimeout(() => {
        // Find the user's prompt message (the request) and scroll to its top
        const userMessageElements = document.querySelectorAll('[data-message-index]');
        // Find the second-to-last message (user's prompt) since the last one is the assistant's response
        const userPromptElement = userMessageElements[userMessageElements.length - 2];
        if (userPromptElement) {
          userPromptElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    } else {
      // Only auto-scroll if it's NOT a stock analysis
      setTimeout(() => {
        scrollToBottom("smooth");
      }, 50);
    }
  }, [messages, isLoading]);

  // Ensure scroll to bottom when loading state changes (Thinking... message appears)
  // BUT handle stock analysis differently
  useEffect(() => {
    if (isLoading) {
      // Check if we're about to start a stock analysis
      const latestMessage = messages[messages.length - 1];
      const isStockAnalysis = latestMessage && 
        latestMessage.role === "assistant" && 
        latestMessage.content && 
        (latestMessage.content.includes("stock") || 
         latestMessage.content.includes("analysis") ||
         latestMessage.content.includes("Company Deep Dive") ||
         latestMessage.chartData);
      
      if (isStockAnalysis) {
        // For stock analysis, scroll to the user's prompt request during loading
        setTimeout(() => {
          const userMessageElements = document.querySelectorAll('[data-message-index]');
          // Find the second-to-last message (user's prompt) since the last one is the assistant's response
          const userPromptElement = userMessageElements[userMessageElements.length - 2];
          if (userPromptElement) {
            userPromptElement.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      } else {
        // Small delay to ensure the loading message is rendered
        setTimeout(() => {
          scrollToBottom("smooth");
        }, 50);
      }
    }
  }, [isLoading]);

  // Keep scrolling during streaming to follow the response
  // BUT handle stock analysis differently
  useEffect(() => {
    if (isStreaming) {
      // Check if current streaming is for stock analysis
      const latestMessage = messages[messages.length - 1];
      const isStockAnalysis = latestMessage && 
        latestMessage.role === "assistant" && 
        latestMessage.content && 
        (latestMessage.content.includes("stock") || 
         latestMessage.content.includes("analysis") ||
         latestMessage.content.includes("Company Deep Dive") ||
         latestMessage.chartData);
      
      if (isStockAnalysis) {
        // For stock analysis, scroll to the user's prompt request during streaming
        setTimeout(() => {
          const userMessageElements = document.querySelectorAll('[data-message-index]');
          // Find the second-to-last message (user's prompt) since the last one is the assistant's response
          const userPromptElement = userMessageElements[userMessageElements.length - 2];
          if (userPromptElement) {
            userPromptElement.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      } else {
        // Only auto-scroll if it's NOT a stock analysis
        // Scroll immediately
        scrollToBottom("instant");
        
        // Continue scrolling at intervals during streaming
        const scrollInterval = setInterval(() => scrollToBottom("instant"), 100);
        
        return () => clearInterval(scrollInterval);
      }
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
      setInputContext("");
      
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
      
      // Immediately scroll to bottom when user sends message
      setTimeout(() => {
        scrollToBottom("smooth");
      }, 100);

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
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`Failed to get response (${response.status}): ${errorText}`);
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
            
            // Check for tool call metadata
            const toolCallMatch = chunk.match(/\[TOOL_CALL\]([\s\S]*?)\[\/TOOL_CALL\]/);
            if (toolCallMatch) {
              try {
                const toolMetadata = JSON.parse(toolCallMatch[1]);
                const dynamicMessage = getLoadingMessage(toolMetadata.toolName);
                setLoadingMessage(dynamicMessage);
                setIsLoading(true); // Show loading state during tool execution
                setIsStreaming(false);
              } catch (e) {
                console.error("Failed to parse tool call metadata:", e);
              }
              // Remove the tool call tags from content
              accumulatedContent += chunk.replace(/\[TOOL_CALL\][\s\S]*?\[\/TOOL_CALL\]/, "");
              continue; // Skip to next chunk
            }
            
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
            
            // If we get content, switch back to streaming
            if (accumulatedContent && isLoading) {
              setIsLoading(false);
              setIsStreaming(true);
              setLoadingMessage("Thinking..."); // Reset to default
            }

            // Start generating suggestions early when we have enough content (100 chars)
            // This runs in parallel with streaming
            if (!suggestionTriggered && accumulatedContent.length > 100) {
              suggestionTriggered = true;
              suggestionsPromise = generateAISuggestions(userMessage, accumulatedContent);
            }

            // Update the last message with accumulated content, chart data, sources, and reasoning
            setMessages(prev => {
              const updated = [...prev];
              // Extract chart data from content
              const chart = extractChartData(accumulatedContent);
              updated[updated.length - 1] = {
                role: "assistant",
                content: chart.cleanContent,
                ...(chart.chartData && { chartData: chart.chartData }),
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
              content: "I am receiving a lot of requests right now. Please wait a moment and try again, or email us at hello@snobol.ai"
            };
            return updated;
          });
        } else {
          setError(errorMessage);
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: "I apologize, but I am having trouble responding right now. Please try again or contact us at hello@snobol.ai for assistance."
            };
            return updated;
          });
        }
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setLoadingMessage("Thinking..."); // Reset to default
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

  const handleToolkitClick = (toolkitText: string) => {
    if (toolkitText === "Do contrarian discovery for " || toolkitText === "Do contrarian discovery for ") {
      setInputContext("Type a company, asset, or commodity to discover hidden opportunities");
      setInputValue("Do contrarian discovery for ");
    } else if (toolkitText === "Find fear opportunities of " || toolkitText === "Find fear opportunities of ") {
      setInputContext("Type a company, sector, or market to find fear-driven opportunities");
      setInputValue("Find fear opportunities of ");
    }
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const length = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(length, length);
      }
    }, 100);
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
          <div 
            ref={messagesContainerRef}
            className={`h-full pt-12 sm:pt-14 pb-28 sm:pb-32 overflow-y-auto ${
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
                  <div key={index} data-message-index={index}>
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
                          className={`bg-transparent rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base text-gray-800 max-w-full break-words relative ${
                            isStreaming && index === messages.length - 1 && message.content !== "" ? '' : 'message-appear'
                          }`}
                          style={{ 
                            animationDelay: isStreaming && index === messages.length - 1 ? '0ms' : `${Math.min(index * 40, 200)}ms`,
                            transition: 'opacity 0.15s ease-out'
                          }}
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
                        
                        {/* Render TradingView chart RIGHT AFTER the main analysis text for stock analysis */}
                        {message.chartData && message.chartData.type === 'stock_chart' && message.chartData.symbol && (
                          <div className="w-full mt-4 message-appear" style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}>
                            <TradingViewWidget symbol={message.chartData.symbol} height={420} />
                          </div>
                        )}
                        
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

                  {/* Toolkit Pills Below Every 3 Suggestions */}
                  {message.role === "assistant" && message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex justify-start mt-4">
                      <div className="max-w-[85%] sm:max-w-[75%] flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300 delay-200">
                         <button
                           onClick={() => handleToolkitClick("Do contrarian discovery for ")}
                           disabled={isLoading || isStreaming}
                           className="px-2 py-1 rounded-full text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 hover:bg-gray-900 text-gray-700 hover:text-white border border-gray-200 hover:border-gray-900 hover:shadow-sm"
                         >
                           <span className="line-clamp-1">🔍 Do contrarian discovery</span>
                         </button>
                         <button
                           onClick={() => handleToolkitClick("Find fear opportunities of ")}
                           disabled={isLoading || isStreaming}
                           className="px-2 py-1 rounded-full text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 hover:bg-gray-900 text-gray-700 hover:text-white border border-gray-200 hover:border-gray-900 hover:shadow-sm"
                         >
                           <span className="line-clamp-1">⚡ Find fear opportunities</span>
                         </button>
                      </div>
                    </div>
                  )}
                </div>
              );
              })}

              {isLoading && !isStreaming && (
                <div className="flex flex-col items-start gap-2">
                  <div className="flex justify-start">
                    <div className="bg-transparent rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 max-w-full message-appear">
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
                  <div className="text-xs sm:text-sm font-medium ml-3 sm:ml-4 flex items-center gap-1.5">
                    <span className="thinking-text text-gray-500">
                      {loadingMessage}
                    </span>
                    <span className="text-gray-400 tabular-nums">
                      ({thinkingDuration}s)
                    </span>
                  </div>
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
              
              {/* Context info text above input */}
              {inputContext && (
                <div className="mb-2 px-3 py-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  {inputContext}
                </div>
              )}
              
              
              
              <div className="flex items-end gap-2 sm:gap-2.5 bg-white border border-gray-300 rounded-[1.625em] p-2 sm:p-2.5">
                <div className="flex-1 relative">
                   <textarea
                     ref={textareaRef}
                     value={inputValue}
                     onChange={(e) => {
                       setInputValue(e.target.value);
                       
                       const currentValue = e.target.value;
                       
                       // Show context when user types the template text
                       if (currentValue.includes("Do contrarian discovery for ") || currentValue.includes("Do contrarian discovery for")) {
                         setInputContext("Type a company, stock ticker, asset, or any market commodity to discover hidden opportunities");
                       } else if (currentValue.includes("Find fear opportunities of ") || currentValue.includes("Find fear opportunities of")) {
                         setInputContext("Type a company, sector, or market to find fear-driven opportunities");
                       } else if (currentValue.includes("Do contrarian discovery")) {
                         setInputContext("Type a company, stock ticker, asset, or any market commodity to discover hidden opportunities");
                       } else if (currentValue.includes("Find fear opportunities")) {
                         setInputContext("Type a company, sector, or market to find fear-driven opportunities");
                       } else if (!currentValue.includes("Do contrarian discovery") && !currentValue.includes("Find fear opportunities")) {
                         setInputContext("");
                       }
                     }}
                     onKeyDown={handleKeyPress}
                     placeholder="Message Snobol AI..."
                     rows={1}
                     disabled={isLoading || isStreaming}
                     className={`w-full py-2 sm:py-2 bg-transparent resize-none focus:outline-none text-[14px] sm:text-sm leading-relaxed disabled:opacity-50 overflow-y-auto relative z-10 ${
                       (inputValue.includes("Do contrarian discovery for ") || inputValue.includes("Do contrarian discovery for ") ||
                        inputValue.includes("Find fear opportunities of ") || inputValue.includes("Find fear opportunities of "))
                       ? 'pl-2 pr-2.5 sm:pl-5 sm:pr-3' : 'px-2.5 sm:px-3'
                     }`}
                     style={{ minHeight: "40px", maxHeight: "120px" }}
                   />
                  
                   {/* Text highlighter overlay */}
                   {inputValue && (
                     <div className="absolute inset-0 pointer-events-none z-20 px-2.5 py-2 sm:px-3 sm:py-2 text-[14px] sm:text-sm leading-relaxed whitespace-pre-wrap overflow-hidden" style={{ marginLeft: '-6px' }}>
                      {(() => {
                        // Highlight "Do contrarian discovery for " (with space)
                        if (inputValue.includes("Do contrarian discovery for ")) {
                          const before = inputValue.substring(0, inputValue.indexOf("Do contrarian discovery for "));
                          const highlight = "Do contrarian discovery for";
                          const after = inputValue.substring(inputValue.indexOf("Do contrarian discovery for ") + highlight.length);
                          return (
                            <>
                              <span className="text-transparent">{before}</span>
                               <span className="bg-gray-200 rounded px-1.5 py-1 text-gray-800">{highlight}</span>
                              <span className="text-transparent">{after}</span>
                            </>
                          );
                        }
                        
                        // Highlight "Find fear opportunities of " (with space)
                        if (inputValue.includes("Find fear opportunities of ")) {
                          const before = inputValue.substring(0, inputValue.indexOf("Find fear opportunities of "));
                          const highlight = "Find fear opportunities of";
                          const after = inputValue.substring(inputValue.indexOf("Find fear opportunities of ") + highlight.length);
                          return (
                            <>
                              <span className="text-transparent">{before}</span>
                               <span className="bg-gray-200 rounded px-2 py-1 text-gray-800">{highlight}</span>
                              <span className="text-transparent">{after}</span>
                            </>
                          );
                        }
                        
                        return <span className="text-transparent">{inputValue}</span>;
                      })()}
                    </div>
                  )}
                </div>
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
});

ChatbotPill.displayName = 'ChatbotPill';

export default ChatbotPill;

