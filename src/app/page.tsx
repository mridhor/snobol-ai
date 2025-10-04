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
import { MessageCircle } from "lucide-react";

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

  const handleOpenChat = () => {
    chatbotRef.current?.open();
  };

  return (
    <div className="bg-white min-h-screen flex flex-col" data-name="Homepage" data-node-id="1:2">
      {/* Snobol logo at the top */}
      <div className="w-full flex justify-center px-4 md:px-12 lg:px-24 py-8 mb-16" data-name="Header" data-node-id="1:154">
        <div className="w-full max-w-6xl">
          <div className="flex gap-2 items-center justify-center">
            <Image
              src={snobolLogo}
              alt="Snobol"
              width={120}
              height={48}
              className="h-8 md:h-12 w-auto"
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Main content centered */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-12 lg:px-30 py-16 md:py-32">
        <div className="relative w-full max-w-7xl p-2">
          <div className="content-stretch flex flex-col lg:flex-row gap-8 lg:gap-20 items-center relative w-full" data-name="Container" data-node-id="1:157">
              <div className="flex-1 px-2 max-w-full lg:max-w-xl" data-name="Paragraph" data-node-id="1:158">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border relative w-full pr-2
                ">
                  <p className="font-['Inter:Light',_sans-serif] font-light leading-tight not-italic text-3xl md:text-3xl lg:text-5xl text-black mb-4" data-node-id="1:159">
                    Imagine a world where AI makes us money better than any human can.
                  </p>
                  <p className="font-['Inter:Light',_sans-serif] font-light leading-tight not-italic text-3xl md:text-3xl lg:text-5xl text-black mb-8 pr-4" data-node-id="1:161">
                    Snobol invests in various crisis.
                  </p>
                </div>
              </div>
              <div className="flex-1 w-full max-w-lg lg:max-w-none" data-name="Container" data-node-id="1:162">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-64 md:h-80 items-center justify-center relative w-full outline-none focus:outline-none focus-visible:outline-none">
                  <div className="h-full w-full relative outline-none focus:outline-none focus-visible:outline-none select-none" data-name="LineChart" data-node-id="1:163">
                    <SimpleLineChart currentPrice={18.49} currentSP500Price={3.30} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      {/* Manifesto Section */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-30 py-12 md:py-32">
        <div className="relative w-full max-w-7xl p-2">
          <h3 className="font-['Inter:Regular',_sans-serif] font-normal text-2xl md:text-4xl lg:text-4xl text-black mb-8 text-left">
            MANIFESTO
          </h3>
          <div className="prose prose-lg max-w-none">
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-relaxed text-lg md:text-xl text-black space-y-4">
              <span className="block">#1 Economic inequality is greater than ever.</span>
              <span className="block">#2 Yet more than ever, ordinary people can reach financial freedom — by starting the right habits early, even at 10 or 12, and becoming free in their 20s or 30s.</span>
              <span className="block">#3 Since 2013, Snobol Research Lead Kristian Kuutok has been developing contrarian investment algorithms that outperform traditional investing.</span>
              <span className="block">#4 Snobol's mission is to build an AI Fund Manager that consistently outperforms the markets by investing through crises, not avoiding them.</span>
              <span className="block">#5 The next contrarian star investor will not be human — it will be AI.</span>
              <span className="block">#6 Financial freedom is one of the deepest sources of happiness and optimism.</span>
              <span className="block">#7 Our initiative is guided by Nordic values. The word "snøbol" means snowball in Old Swedish — a symbol of quiet, steady growth.</span>
            </p>
          </div>
        </div>
      </div>

      <div className="box-border content-stretch flex flex-col items-center pt-0 pb-8 md:py-20 px-6 md:px-8 lg:px-24 w-full mt-auto mb-10 md:mb-0" data-name="Footer" data-node-id="1:146">
        <div className="box-border content-stretch flex flex-row md:flex-row gap-4 md:gap-0 items-center justify-between w-full max-w-7xl p-2 md-12" data-name="Container" data-node-id="1:147">
          <div className="flex-shrink-0" data-name="Text" data-node-id="1:152">
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-5 text-[#666666] text-sm text-center md:text-right" data-node-id="1:153">
                © 2025 Snobol Inc.
              </p>
          </div>
          <div className="flex-shrink-0" data-name="Link" data-node-id="1:148">
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-5 text-[#666666] text-sm" data-node-id="1:149">
              hello@snobol.ai 
            </p>
          </div>

        </div>
      </div>

      {/* Sticky Chatbot Pill */}
      <ChatbotPill ref={chatbotRef} />
    </div>
  );
}