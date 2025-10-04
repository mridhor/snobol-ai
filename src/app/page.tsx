"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { formatAreaChartData, ChartData } from "@/utils/chartData";
import Image from "next/image";
import snobolLogo from "./snobol-ai-logo.png";
import ChatbotPill, { ChatbotPillRef } from "@/components/ChatbotPill";

// Reusable donut period component
const DonutPeriod = () => (
  <span 
    className="inline-block rounded-[80%] border-[2px] border-current bg-transparent ml-[0.1em] w-[0.24em] h-[0.24em] md:w-[0.15em] md:h-[0.15em]"
  ></span>
);

// Ultra-simple 2-line chart component
const SimpleLineChart = ({ currentPrice = 18.49, currentSP500Price = 3.30 }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const formattedData = formatAreaChartData();
    
    // Add current data point
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    formattedData.push({
      date: new Date().getFullYear().toString(),
      fullDate: currentDate,
      sp500: currentSP500Price,
      snobol: currentPrice - currentSP500Price,
      totalSnobol: currentPrice
    });
    
    setChartData(formattedData);
  }, [currentPrice, currentSP500Price]);

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <XAxis 
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={false}
            hide
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={false}
            hide
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 rounded shadow-sm border text-xs">
                    <p className="text-gray-600">{data.fullDate}</p>
                    <p className="font-semibold">${data.totalSnobol?.toFixed(2)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          {/* S&P 500 line - light gray */}
          <Line
            type="monotone"
            dataKey="sp500"
            stroke="#E5E5E5"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: "transparent", stroke: "transparent" }}
          />
          {/* Snobol line - black */}
          <Line
            type="monotone"
            dataKey="totalSnobol"
            stroke="#000000"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4.5, fill: "white", stroke: "black", strokeWidth: 3.1 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function Homepage() {
  const chatbotRef = useRef<ChatbotPillRef>(null);
  const [emailError, setEmailError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleOpenChat = () => {
    chatbotRef.current?.open();
  };

  const handleCloseSent = () => {
    setIsSent(false);
    setErrorMessage('');
    setEmailError(false);
    setIsSuccess(false);
  };

  // Email validation regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col" data-name="Homepage" data-node-id="1:2">
      {/* Snobol logo at the top */}
      <div className="w-full flex justify-center px-4 md:px-12 lg:px-24 py-8 " data-name="Header" data-node-id="1:154">
        <div className="w-full max-w-6xl">
          <div className="flex gap-2 items-center justify-center opacity-85">
            <Image
              src={snobolLogo}
              alt="Snobol"
              width={120}
              height={48}
              className="h-8 md:h-12 w-auto"
              priority
              onClick={handleOpenChat}
            />
          </div>
        </div>
      </div>
      
      {/* Main content centered */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-12 lg:px-30 pt-16 md:pt-20 pb-12">
        <div className="relative w-full p-2">
          <div className="content-stretch flex flex-col lg:flex-col gap-8 lg:gap-10 items-center relative w-full" data-name="Container" data-node-id="1:157">
              <div className="flex-1 px-2 max-w-full" data-name="Paragraph" data-node-id="1:158">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border relative w-full pr-2
                ">
                  <p className="leading-tight not-italic text-3xl md:text-3xl lg:text-5xl text-black mb-4" data-node-id="1:159" style={{ fontFamily: 'Avenir Light', fontWeight: 300 }}>
                  Building a world where Al invests money better than any human can<DonutPeriod />
                  </p>
                  <p className="leading-tight not-italic text-3xl md:text-3xl lg:text-5xl text-black mb-8 pr-4" data-node-id="1:161" style={{ fontFamily: 'Avenir Light', fontWeight: 300 }}>
                    Snobol invests in global crises<DonutPeriod />
                  </p>
                </div>
              </div>
              
              <div className="flex-1 w-full max-w-4xl lg:max-w-none">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-64 md:h-80 items-center justify-center relative w-full outline-none focus:outline-none focus-visible:outline-none">
                  <div className="h-full w-full relative outline-none focus:outline-none focus-visible:outline-none select-none">
                    <SimpleLineChart currentPrice={18.49} currentSP500Price={3.30} />
                  </div>
                </div>
              </div>
              
              {/* Email Signup */}
              <div className="flex flex-col items-center gap-6">
              <div className="text-center flex flex-col sm:flex-row items-center gap-4">
                <p className="text-lg" style={{ fontFamily: 'Avenir Light', fontWeight: 300 }}>Get Snobol AI investment tips:</p>
                <div className="flex justify-center items-center">
                  <div className={`email-wrapper ${emailError ? 'error' : ''} ${isSuccess ? 'success' : ''} ${isSent ? 'sent' : ''}`}>
                    <div className="email-pill">
                      {isSent ? (
                        <div className="email-sent-content gap-1">
                          <span className="email-sent-text">Submitted! Thank You</span>
                          <button 
                            type="button"
                            className="email-close-btn"
                            onClick={handleCloseSent}
                            aria-label="Close"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <input 
                          type="email" 
                          placeholder="Insert email." 
                          className="email-input"
                        ref={(input) => {
                          if (input) {
                            // Create a temporary span to measure the placeholder text
                            const span = document.createElement('span');
                            span.style.visibility = 'hidden';
                            span.style.position = 'absolute';
                            span.style.whiteSpace = 'nowrap';
                            span.style.fontSize = '13px';
                            span.style.fontFamily = getComputedStyle(input).fontFamily;
                            span.textContent = 'Insert email';
                            document.body.appendChild(span);
                            
                            // Set input width and min-width to match the measured placeholder text
                            const placeholderWidth = span.offsetWidth + 6; // Add 4px buffer to prevent cutoff
                            input.style.width = `${placeholderWidth}px`;
                            input.style.minWidth = `${placeholderWidth}px`;
                            
                            // Store placeholder width for later use
                            (input as HTMLInputElement & { _placeholderWidth?: number })._placeholderWidth = placeholderWidth;
                            
                            // Also set minimum width on the wrapper
                            const wrapper = input.closest('.email-wrapper') as HTMLElement;
                            if (wrapper) {
                              const wrapperMinWidth = placeholderWidth + 24; // 12px padding on each side
                              wrapper.style.minWidth = `${wrapperMinWidth}px`;
                              (wrapper as HTMLElement & { _minWidth?: number })._minWidth = wrapperMinWidth;
                            }
                            
                            // Clean up
                            document.body.removeChild(span);
                          }
                        }}
                        onInput={(e) => {
                          const input = e.target as HTMLInputElement;
                          const placeholderWidth = (input as HTMLInputElement & { _placeholderWidth?: number })._placeholderWidth;
                          
                          // Clear error state when user starts typing
                          if (emailError) {
                            setEmailError(false);
                            setErrorMessage('');
                          }
                          if (isSuccess) {
                            setIsSuccess(false);
                          }
                          if (isSent) {
                            setIsSent(false);
                          }
                          
                          // Use setTimeout to ensure the input value is updated before measurement
                          setTimeout(() => {
                            const wrapper = input.closest('.email-wrapper') as HTMLElement;
                            const wrapperMinWidth = (wrapper as HTMLElement & { _minWidth?: number })?._minWidth;
                            
                            if (input.value.length > 0) {
                              // Measure current text width with more precise styling
                              const span = document.createElement('span');
                              span.style.visibility = 'hidden';
                              span.style.position = 'absolute';
                              span.style.whiteSpace = 'nowrap';
                              span.style.fontSize = '13px';
                              span.style.fontFamily = getComputedStyle(input).fontFamily;
                              span.style.fontWeight = getComputedStyle(input).fontWeight;
                              span.style.letterSpacing = getComputedStyle(input).letterSpacing;
                              span.style.padding = '0';
                              span.style.margin = '0';
                              span.style.border = 'none';
                              span.textContent = input.value;
                              document.body.appendChild(span);
                              
                              const textWidth = span.offsetWidth;
                              const finalWidth = Math.max(textWidth + 30, placeholderWidth || 100); // Add 2px buffer, fallback to 100px
                              
                              input.style.width = `${finalWidth}px`;
                              input.style.minWidth = `${placeholderWidth || 100}px`;
                              
                              // Update wrapper width
                              if (wrapper && wrapperMinWidth) {
                                const newWrapperWidth = finalWidth + 24; // 12px padding on each side
                                wrapper.style.minWidth = `${Math.max(newWrapperWidth, wrapperMinWidth)}px`;
                              }
                              
                              document.body.removeChild(span);
                            } else {
                              // Reset to placeholder size when empty
                              input.style.width = `${placeholderWidth || 100}px`;
                              input.style.minWidth = `${placeholderWidth || 100}px`;
                              
                              // Reset wrapper to minimum size
                              if (wrapper && wrapperMinWidth) {
                                wrapper.style.minWidth = `${wrapperMinWidth}px`;
                              }
                            }
                          }, 0);
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const email = input.value.trim();
                          
                          if (!email) {
                            // Show error for empty email
                            setEmailError(true);
                            setErrorMessage(' ');
                            return;
                          }
                          
                          // Validate email format
                          if (!validateEmail(email)) {
                            setEmailError(true);
                            setErrorMessage(' ');
                            return;
                          }
                          
                          // Clear error state for valid email
                          setEmailError(false);
                          setErrorMessage('');
                          
                          try {
                            const response = await fetch('/api/subscribe', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ email }),
                            });

                            const result = await response.json();
                            
                            if (response.ok) {
                              input.value = '';
                              setEmailError(false);
                              setErrorMessage('');
                              setIsSuccess(false);
                              setIsSent(true);
                              
                              // Reset wrapper width to minimum for sent state
                              const wrapper = input.closest('.email-wrapper') as HTMLElement;
                              const placeholderWidth = (input as HTMLInputElement & { _placeholderWidth?: number })._placeholderWidth;
                              if (wrapper && placeholderWidth) {
                                wrapper.style.width = 'fit-content';
                                wrapper.style.minWidth = `${(placeholderWidth || 100) + 24}px`;
                              }
                            } else {
                              setEmailError(true);
                              setErrorMessage(result.error || 'Something went wrong. Please try again.');
                            }
                          } catch (error) {
                            console.error('Subscription error:', error);
                            setEmailError(true);
                            setErrorMessage('Something went wrong. Please try again.');
                          }
                        }
                      }}
                        />
                      )}
                    </div>
                  </div>{/* Error/Success message */}
                
                </div>
              </div>
              <div className="relative">
                <p className="text-sm" style={{ fontFamily: 'Avenir Light', fontWeight: 300 }}>Disclaimer: This is not an investment advice.</p>
                {errorMessage && (
                  <div className="absolute-y-4"><div className={`email-error-message ${errorMessage ? 'show' : ''}`}>
                    {errorMessage}
                  </div></div>
                )}

              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Manifesto Link */}
        <div className="text-center py-8" id="manifesto-footer">
            <p className="text-lg mb-2" style={{ fontFamily: 'Avenir Light', fontWeight: 300 }}>SNOBOL - HUMANITARIAN AI FUND MANAGER</p>
          <a 
            href="#" 
            className="manifesto-link underline text-xl cursor-pointer"
            style={{ fontFamily: 'Avenir Light', fontWeight: 300 }}
            onClick={(e) => {
              e.preventDefault();
              const section = document.getElementById('manifesto');
              const footer = document.getElementById('manifesto-footer');
              const link = e.target as HTMLElement;
              
              if (section && footer) {
                const isHidden = section.style.display === 'none' || section.style.display === '';
                
                if (isHidden) {
                  // Use requestAnimationFrame for smoother transitions
                  requestAnimationFrame(() => {
                    section.style.display = 'block';
                    footer.style.display = 'none';
                    link.style.display = 'none';
                    // Remove smooth scrolling to reduce lag
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
                  });
                } else {
                  // Use requestAnimationFrame for smoother transitions
                  requestAnimationFrame(() => {
                    section.style.display = 'none';
                    footer.style.display = 'block';
                    link.style.display = 'inline';
                    link.textContent = 'Manifesto';
                    // Remove smooth scrolling to reduce lag
                    window.scrollTo({ top: 0, behavior: 'auto' });
                  });
                }
              }
            }}
          >
            M a n i f e s t o
          </a>
        </div>

        {/* Manifesto Section */}
        <div id="manifesto">
          <h2 className="manifesto-title">
            MANIFESTO
          </h2>
          
          <div className="manifesto-content">
            <div className="manifesto-item">
              <span className="manifesto-prefix">#1</span>
              <span className="manifesto-text">Economic inequality is greater than ever.</span>
            </div>
            
            <div className="manifesto-item">
              <span className="manifesto-prefix">#2</span>
              <span className="manifesto-text">Yet more than ever, ordinary people can reach financial freedom — by starting the right habits early, even at 10 or 12, and becoming free in their 20s or 30s.</span>
            </div>
            
            <div className="manifesto-item">
              <span className="manifesto-prefix">#3</span>
              <span className="manifesto-text">Since 2013, Snobol Research Lead Kristian Kuutok has been developing contrarian investment algorithms that outperform traditional investing.</span>
            </div>
            
            <div className="manifesto-item">
              <span className="manifesto-prefix">#4</span>
              <span className="manifesto-text">Snobol&apos;s mission is to build an AI Fund Manager that consistently outperforms the markets by investing through crises, not avoiding them.</span>
            </div>
            
            <div className="manifesto-item">
              <span className="manifesto-prefix">#5</span>
              <span className="manifesto-text">The next contrarian star investor will not be human — it will be AI.</span>
            </div>
            
            <div className="manifesto-item">
              <span className="manifesto-prefix">#6</span>
              <span className="manifesto-text">Financial freedom is one of the deepest sources of happiness and optimism.</span>
            </div>
            
            <div className="manifesto-item">
              <span className="manifesto-prefix">#7</span>
              <span className="manifesto-text">Our initiative is guided by Nordic values. The word &quot;snøbol&quot; means snowball in Old Swedish u2013 a symbol of quiet, steady growth.</span>
            </div>
          </div>
          
          {/* Signature Block */}
          <div className="signature-section">
            <p className="signature-name">Kristian J. Kuutok</p>
            <p className="signature-date">October 2025, Alaska Way — Seattle, WA</p>
          </div>
          
          {/* Copyright */}
          <div className="copyright">
            <p>© Snobol Inc. 2025</p>
          </div>
          
          {/* Footer with Social Media and Contact */}
          <div className="manifesto-footer">
            {/* Social Media Icons */}
            <div className="social-icons">
              <a href="https://instagram.com/snobol" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@snobol" target="_blank" rel="noopener noreferrer" className="social-icon youtube">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://tiktok.com/@snobol" target="_blank" rel="noopener noreferrer" className="social-icon tiktok">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
            
            {/* Company Tagline */}
            <div className="company-tagline">
              <p>SNOBOL - HUMANITARIAN AI FUND MANAGER</p>
            </div>
            
            {/* Contact Information */}
            <div className="contact-info">
              <p>Text us at +1 704 200 9000 or email hello@snobol.ai</p>
            </div>
          </div>
        </div>

        {/* Sticky Chatbot Pill */}
        <ChatbotPill ref={chatbotRef} />

      </div>
    );
  }