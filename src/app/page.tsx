"use client";

import React, { useState, useRef } from "react";
import { ArrowRight, Loader2, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { formatAreaChartData, type ChartData } from "@/utils/chartData";
import Image from "next/image";
import snobolLogo from "./snobol-ai-logo.png";
import ChatbotPill, { ChatbotPillRef } from "@/components/ChatbotPill";

// Reusable donut period component
const DonutPeriod = () => (
  <span 
    className="inline-block rounded-[80%] border-[1.5px] sm:border-[1.5px] md:border-[1.8px] border-current bg-transparent ml-[0.1em] w-[0.3em] h-[0.3em] md:w-[0.26em] md:h-[0.26em] lg:w-[0.26em] lg:h-[0.26em]"
  ></span>
);

// Ultra-simple 2-line chart component - optimized to prevent re-renders
interface SimpleLineChartProps {
  currentPrice?: number;
  currentSP500Price?: number;
}

const SimpleLineChart = React.memo(function SimpleLineChart({ currentPrice = 18.49, currentSP500Price = 3.30 }: SimpleLineChartProps) {
  const chartData = (() => {
    // Initialize chart data only once during component creation
    const formattedData = formatAreaChartData();
    
    // Create static date values to prevent continuous re-renders
    const currentDate = 'Oct 4, 2025'; // Static date to prevent re-renders
    const currentYear = '2025'; // Static year to prevent re-renders
    
    formattedData.push({
      date: currentYear,
      fullDate: currentDate,
      sp500: currentSP500Price,
      snobol: currentPrice - currentSP500Price,
      totalSnobol: currentPrice
    });
    
    return formattedData;
  })();

  // Data is now static - no state or effects needed

  return (
    <div className="w-full h-60 md:h-[40vh] md:mt-[-1em] md:mt-[-4em] lg:mt-[-4em] xl:mt-[-4em]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
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
});

export default function Homepage() {
  const chatbotRef = useRef<ChatbotPillRef>(null);
  const [emailError, setEmailError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [emailValue, setEmailValue] = useState('');

  const handleOpenChat = () => {
    chatbotRef.current?.open();
  };

  const handleCloseSent = () => {
    setIsSent(false);
    setErrorMessage('');
    setEmailError(false);
    setIsSuccess(false);
    setEmailValue('');
    setIsEmailValid(false);
    
    // Restore dynamic width behavior
    const input = document.querySelector('.email-input') as HTMLInputElement;
    if (input) {
      input.value = '';
      const wrapper = input.closest('.email-wrapper') as HTMLElement;
      if (wrapper) {
        wrapper.style.width = '';
        wrapper.style.minWidth = '';
      }
    }
  };

  // Email validation regex - comprehensive domain validation for global .co domains
  const validateEmail = (email: string): boolean => {
    // Enhanced email regex that validates:
    // - Local part: alphanumeric, dots, hyphens, underscores, plus signs
    // - Domain: alphanumeric, hyphens, dots
    // - TLD: 2-63 characters, letters only
    // - Properly handles .co.## domains from all countries worldwide
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,63}$/;
    
    // Check if email matches the basic regex pattern
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // Extract domain from email and split into parts
    const domain = email.split('@')[1];
    const domainParts = domain.split('.');
    
    // Special validation for .co domains
    // Allow .co.## where ## is any valid country code (2+ letters)
    // Examples: .co.uk, .co.jp, .co.in, .co.za, .co.nz, .co.il, .co.kr, etc.
    if (domain.endsWith('.co')) {
      // Check if it's a standalone .co domain (no country code)
      if (domainParts.length === 2 && domainParts[1] === 'co') {
        return false; // Reject standalone .co domains
      }
      
      // If it's .co.##, validate the country code part
      if (domainParts.length >= 3 && domainParts[domainParts.length - 2] === 'co') {
        const countryCode = domainParts[domainParts.length - 1];
        // Country codes should be 2-10 characters, letters only
        if (!/^[a-zA-Z]{2,10}$/.test(countryCode)) {
          return false;
        }
      }
    }
    
    // Additional validation for domain structure
    
    // Must have at least 2 parts (domain.tld)
    if (domainParts.length < 2) {
      return false;
    }
    
    // TLD must be at least 2 characters and contain only letters
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
      return false;
    }
    
    // Domain name must be valid (no consecutive dots, no starting/ending with hyphen)
    for (let i = 0; i < domainParts.length - 1; i++) {
      const part = domainParts[i];
      if (part.length === 0 || part.startsWith('-') || part.endsWith('-') || part.includes('..')) {
        return false;
      }
    }
    
    return true;
  };

  // Handle email submission
  const handleEmailSubmit = async (email: string) => {
    if (!email || !validateEmail(email)) {
      setEmailError(true);
      setErrorMessage(' ');
      
      // Preserve current width when error occurs
      const input = document.querySelector('.email-input') as HTMLInputElement;
      if (input) {
        const wrapper = input.closest('.email-wrapper') as HTMLElement;
        if (wrapper) {
          const currentWidth = wrapper.offsetWidth;
          wrapper.style.width = `${currentWidth}px`;
          wrapper.style.minWidth = `${currentWidth}px`;
        }
      }
      
      return;
    }

    // Clear error state for valid email
    setEmailError(false);
    setErrorMessage('');
    setIsEmailLoading(true);
    
    // Preserve width during loading
    const input = document.querySelector('.email-input') as HTMLInputElement;
    if (input) {
      const wrapper = input.closest('.email-wrapper') as HTMLElement;
      if (wrapper) {
        const currentWidth = wrapper.offsetWidth;
        wrapper.style.width = `${currentWidth}px`;
        wrapper.style.minWidth = `${currentWidth}px`;
        wrapper.classList.add('loading');
      }
    }
    
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
        setEmailValue('');
        setIsEmailValid(false);
        setEmailError(false);
        setErrorMessage('');
        setIsSuccess(false);
        setIsSent(true);
        
        // Keep the current width for sent state - don't reset to minimum
        const wrapper = input?.closest('.email-wrapper') as HTMLElement;
        if (wrapper) {
          // Preserve the current width instead of resetting
          const currentWidth = wrapper.offsetWidth;
          wrapper.style.width = `${currentWidth}px`;
          wrapper.style.minWidth = `${currentWidth}px`;
        }
      } else {
        setEmailError(true);
        setErrorMessage(result.error || 'Something went wrong. Please try again.');
        
        // Preserve current width when API error occurs
        if (input) {
          const wrapper = input.closest('.email-wrapper') as HTMLElement;
          if (wrapper) {
            const currentWidth = wrapper.offsetWidth;
            wrapper.style.width = `${currentWidth}px`;
            wrapper.style.minWidth = `${currentWidth}px`;
          }
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setEmailError(true);
      setErrorMessage('Something went wrong. Please try again.');
      
      // Preserve current width when catch error occurs
      const input = document.querySelector('.email-input') as HTMLInputElement;
      if (input) {
        const wrapper = input.closest('.email-wrapper') as HTMLElement;
        if (wrapper) {
          const currentWidth = wrapper.offsetWidth;
          wrapper.style.width = `${currentWidth}px`;
          wrapper.style.minWidth = `${currentWidth}px`;
        }
      }
    } finally {
      setIsEmailLoading(false);
      
      // Remove class and restore normal behavior if not sent
      const wrapper = input?.closest('.email-wrapper') as HTMLElement;
      if (wrapper) {
        wrapper.classList.remove('loading');
        // Only restore dynamic width if not in sent state
        if (!isSent) {
          wrapper.style.width = '';
          wrapper.style.minWidth = '';
        }
      }
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col" data-name="Homepage" data-node-id="1:2">
      {/* Snobol logo at the top */}
      <div className="w-full flex justify-center px-4 md:px-12 lg:px-24 py-8 md:py-8 sm:py-2 py-0" data-name="Header" data-node-id="1:154">
        <div className="w-full max-w-6xl">
          <div className="flex gap-2 items-center justify-center opacity-85">
            <Image
              src={snobolLogo}
              alt="Snobol"
              width={120}
              height={48}
              className="h-8 md:h-10 w-auto"
              priority
              onClick={handleOpenChat}
            />
          </div>
        </div>
      </div>
      
      {/* Main content centered */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-12 lg:px-30 mt-0 pt:8 sm:pt-0 md:pt-12 pb-4">
        <div className="relative w-full p-2">
          <div className="content-stretch flex flex-col lg:flex-col gap-0 md:gap-10 items-center relative w-full" data-name="Container" data-node-id="1:157">
              <div className="flex-1 px-2 max-w-full" data-name="Paragraph" data-node-id="1:158">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border relative w-full pr-2 md:pr-50 lg:pr-100 xl:pr-100">
                  <p className="leading-tight not-italic text-xl sm:text-xl md:text-2xl lg:text-3xl text-black mb-4 pr-0 xs:pr-20" data-node-id="1:159" style={{ fontFamily: 'Avenir Light', fontWeight: 300 }}>
                  <span className="inline-block md:hidden">Building a world where Al invests </span>
                  <span className="inline-block md:hidden">money better than any human can<DonutPeriod /></span>
                  <span className="hidden md:inline-block">Building a world where Al invests money better than any human can<DonutPeriod /></span></p>
                  
                  
                  <p className="leading-tight not-italic text-xl sm:text-xl md:text-2xl lg:text-3xl text-black mb-4 sm:mb-6 md:mb-8 pr-0 xs:pr-20 " data-node-id="1:161" style={{ fontFamily: 'Avenir Light', fontWeight: 300 }}>
                    <span className="inline-block ">Snobol invests in global crises<DonutPeriod /></span>
                  </p>
                </div>
              </div>
              
              <div className="flex-1 w-full max-w-4xl lg:max-w-none mb-2 md:mb-8 lg:mb-[-2em] xl:mb-[-4em]">
                <div className=" bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-74 md:h-[40vh] pb-2 mt-[-1em] items-center justify-center relative w-full outline-none focus:outline-none focus-visible:outline-none">
                  <div className="h-full w-full max-w-7xl relative outline-none focus:outline-none focus-visible:outline-none select-none">
                    <SimpleLineChart currentPrice={18.49} currentSP500Price={3.30} />
                  </div>
                </div>
              </div>
              
              {/* Email Signup */}
              <div className="flex flex-col items-center mt-0 md:mt-0 lg:mt-0 xl:mt-0 pb-2 gap-2">
              <div className="text-center flex flex-col sm:flex-row items-center gap-1.5">
                <p className="text-lg" style={{ fontFamily: 'Avenir Light', fontWeight: 300 }}>Get Snobol AI investment tips:</p>
                <div className="flex justify-center items-center">
                  <div className="flex items-center gap-2">
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
                            <X className="h-4 w-4" />
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
                          const email = input.value;
                          
                          // Update email value and validation state
                          setEmailValue(email);
                          setIsEmailValid(validateEmail(email));
                          
                          // Clear error state when user starts typing
                          if (emailError) {
                            setEmailError(false);
                            setErrorMessage('');
                            
                            // Restore dynamic width behavior when error is cleared
                            const wrapper = input.closest('.email-wrapper') as HTMLElement;
                            if (wrapper) {
                              wrapper.style.width = '';
                              wrapper.style.minWidth = '';
                            }
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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const email = input.value.trim();
                            handleEmailSubmit(email);
                          }
                        }}
                        />
                      )}
                    </div>
                    {/* Submit button that appears when email is valid */}
                    {!isSent && isEmailValid && (
                      <button
                        type="button"
                        className={`email-submit-btn ${isEmailLoading ? 'loading' : ''}`}
                        onClick={() => !isEmailLoading && handleEmailSubmit(emailValue)}
                        disabled={isEmailLoading}
                      >
                        {isEmailLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {/* Error/Success message */}
                
                </div>
              </div>
              </div>
              <div className="relative">
                <p className="text-sm" style={{ fontFamily: 'Avenir Light', fontWeight: 300 }}>Disclaimer: This is not investment advice.</p>
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
      <div className="text-center pb-8" id="manifesto-footer">
            <p className="text-sm sm:text-lg mb-2" style={{ fontFamily: 'Avenir Light', fontWeight: 300 }}>SNOBOL - HUMANITARIAN AI FUND MANAGER</p>
          <a 
            href="#" 
            className="manifesto-link underline text-base cursor-pointer"
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
                    // Scroll to position the manifesto section's top edge at the screen top
                    const sectionRect = section.getBoundingClientRect();
                    const currentScrollY = window.scrollY;
                    const targetScrollY = currentScrollY + sectionRect.top;
                    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
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
            Manifesto
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
              <span className="manifesto-text">Our initiative is guided by Nordic values. The word &quot;snøbol&quot; means snowball in Old Swedish — a symbol of quiet, steady growth.</span>
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
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" className="social-icon youtube">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://tiktok.com/" target="_blank" rel="noopener noreferrer" className="social-icon tiktok">
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