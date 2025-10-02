"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { formatAreaChartData, ChartData } from "@/utils/chartData";

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
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: "#E5E5E5" }}
          />
          {/* Snobol line - black */}
          <Line
            type="monotone"
            dataKey="totalSnobol"
            stroke="#000000"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: "#000000" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function Homepage() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[20px] items-center relative size-full" data-name="Homepage" data-node-id="1:2">
      <div className="box-border content-stretch flex flex-col gap-8 md:gap-20 items-center px-4 md:px-12 lg:px-24 py-8 md:py-12 relative shrink-0 w-full" data-name="Header" data-node-id="1:154">
        <div className="relative shrink-0 w-full max-w-6xl" data-node-id="1:180">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-8 md:gap-20 items-center relative">
            <div className="content-stretch flex gap-2 items-center justify-center relative shrink-0" data-name="Heading 1" data-node-id="1:155">
              <p className="font-['Inter:Light',_sans-serif] font-light leading-tight not-italic relative shrink-0 text-2xl md:text-4xl text-black text-nowrap tracking-tight whitespace-pre" data-node-id="1:156">
                Snobol
              </p>
            </div>
            <div className="content-stretch flex flex-col lg:flex-row gap-8 lg:gap-24 items-center relative shrink-0 w-full" data-name="Container" data-node-id="1:157">
              <div className="flex-1 max-w-lg lg:max-w-none" data-name="Paragraph" data-node-id="1:158">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border relative w-full">
                  <p className="font-['Inter:Light',_sans-serif] font-light leading-tight not-italic text-xl md:text-2xl lg:text-4xl text-black mb-4" data-node-id="1:159">
                    Imagine a world where AI makes us money better than any human can.
                  </p>
                  <p className="font-['Inter:Light',_sans-serif] font-light leading-tight not-italic text-xl md:text-2xl lg:text-4xl text-black" data-node-id="1:161">
                    Snobol invests in various crisis.
                  </p>
                </div>
              </div>
              <div className="flex-1 w-full max-w-lg lg:max-w-none" data-name="Container" data-node-id="1:162">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-64 md:h-80 items-center justify-center relative w-full">
                  <div className="h-full w-full relative" data-name="LineChart" data-node-id="1:163">
                    <SimpleLineChart currentPrice={18.49} currentSP500Price={3.30} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 box-border content-stretch flex flex-col items-center py-8 md:py-12 px-4 md:px-8 lg:px-24 relative shrink-0 w-full" data-name="Footer" data-node-id="1:146">
        <div className="box-border content-stretch flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-between w-full max-w-6xl" data-name="Container" data-node-id="1:147">
          <div className="flex-shrink-0" data-name="Link" data-node-id="1:148">
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-5 text-[#666666] text-sm" data-node-id="1:149">
              hello@snobol.com
            </p>
          </div>
          <div className="flex-shrink-0" data-name="Button" data-node-id="1:150">
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-5 text-[#666666] text-sm" data-node-id="1:151">
              about us
            </p>
          </div>
          <div className="flex-shrink-0" data-name="Text" data-node-id="1:152">
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-5 text-[#666666] text-sm text-center md:text-right" data-node-id="1:153">
              © 2025 Snobol Inc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}