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
      <div className="box-border content-stretch flex flex-col gap-6 md:gap-8 items-center px-4 md:px-8 lg:px-12 py-6 md:py-8 relative shrink-0 w-full max-w-4xl" data-name="Section" data-node-id="1:3">
        <div className="w-full" data-name="Heading 2" data-node-id="1:4">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-tight not-italic text-xl md:text-2xl text-black" data-node-id="1:5">
            Executive Summary
          </p>
        </div>
        <div className="w-full" data-name="Paragraph" data-node-id="1:6">
          <p className="font-['Inter:Light',_sans-serif] font-light leading-relaxed not-italic text-base md:text-lg text-black" data-node-id="1:7">{`Snobol is a crisis investing movement that responds rationally when the market panics. We don't predict the future. We prepare, monitor, and respond with discipline when fear creates opportunity.`}</p>
        </div>
        <div className="content-stretch flex flex-col gap-4 md:gap-5 items-start relative shrink-0 w-full" data-name="List" data-node-id="1:8">
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:9">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:13">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:14">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:11">
              Thesis: Markets overreact during crises. Durable companies become mispriced.
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:15">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:19">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:20">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:17">
              Edge: Real-time monitoring of order flow, options signals, and macro stress, filtered through quality and valuation rules.
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:21">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:25">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:26">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:23">
              Promise: Radical transparency. Every alert published live, every win and loss logged.
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:27">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:31">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:32">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:29">{`Vision: Build the world's most trusted brand in crisis investing — calm, clear, and inevitable like a snowball rolling downhill.`}</p>
          </div>
        </div>
      </div>
      <div className="box-border content-stretch flex flex-col gap-6 md:gap-8 items-center px-4 md:px-8 lg:px-12 py-6 md:py-8 relative shrink-0 w-full max-w-4xl" data-name="Section" data-node-id="1:33">
        <div className="w-full" data-name="Heading 2" data-node-id="1:34">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-tight not-italic text-xl md:text-2xl text-black" data-node-id="1:35">
            Investment Philosophy
          </p>
        </div>
        <div className="content-stretch flex flex-col gap-4 md:gap-6 items-start relative shrink-0 w-full" data-name="List" data-node-id="1:36">
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:43">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:47">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:48">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:46">
              Buy quality under panic. Only durable companies with strong balance sheets,
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:37">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:41">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:42">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:39">{`Respond, don't predict. Crises can't be timed, but they can be recognized.`}</p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:49">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:53">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:54">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:51">
              Transparency over hindsight. Every signal is logged and public. No retroactive editing.
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:55">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:59">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:60">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:57">
              Risk management first. Cash buffer, sizing discipline, and no leverage by default.
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:61">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:65">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:66">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:63">
              AI as tool running in the background, not oracle. Our AI processes flows, volumes, and stress signals. Humans apply wisdom and judgment.
            </p>
          </div>
        </div>
      </div>
      <div className="box-border content-stretch flex flex-col gap-6 md:gap-8 items-center px-4 md:px-8 lg:px-12 py-6 md:py-8 relative shrink-0 w-full max-w-4xl" data-name="Section" data-node-id="1:67">
        <div className="w-full" data-name="Heading 2" data-node-id="1:68">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-tight not-italic text-xl md:text-2xl text-black" data-node-id="1:69">
            The Snobol Process
          </p>
        </div>
        <div className="content-stretch flex flex-col gap-6 md:gap-8 items-start relative shrink-0 w-full" data-name="Container" data-node-id="1:70">
          <div className="content-stretch flex flex-col gap-2 items-start relative shrink-0 w-full" data-name="Container" data-node-id="1:71">
            <div className="w-full" data-name="Heading 3" data-node-id="1:72">
              <div className="flex items-center gap-2">
                <p className="font-['Inter:Regular',_sans-serif] font-normal leading-7 not-italic text-lg text-black" data-node-id="1:73">
                  Signal Layer
                </p>
                <p className="font-['Inter:Light',_sans-serif] font-light leading-7 not-italic text-lg text-[#666666]" data-node-id="1:75">
                  (AI)
                </p>
              </div>
            </div>
            <div className="w-full" data-name="Paragraph" data-node-id="1:76">
              <p className="font-['Inter:Light',_sans-serif] font-light leading-6 not-italic text-base text-black" data-node-id="1:77">
                Order flow stress, options panic, macro alerts.
              </p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-2 items-start relative shrink-0 w-full" data-name="Container" data-node-id="1:78">
            <div className="w-full" data-name="Heading 3" data-node-id="1:79">
              <div className="flex items-center gap-2">
                <p className="font-['Inter:Regular',_sans-serif] font-normal leading-7 not-italic text-lg text-black" data-node-id="1:80">
                  Filter Layer
                </p>
                <p className="font-['Inter:Light',_sans-serif] font-light leading-7 not-italic text-lg text-[#666666]" data-node-id="1:82">
                  (Rules)
                </p>
              </div>
            </div>
            <div className="w-full" data-name="Paragraph" data-node-id="1:83">
              <p className="font-['Inter:Light',_sans-serif] font-light leading-6 not-italic text-base text-black" data-node-id="1:84">
                Quality metrics, valuation checks, crisis scoring.
              </p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-2 items-start relative shrink-0 w-full" data-name="Container" data-node-id="1:85">
            <div className="w-full" data-name="Heading 3" data-node-id="1:86">
              <div className="flex items-center gap-2">
                <p className="font-['Inter:Regular',_sans-serif] font-normal leading-7 not-italic text-lg text-black" data-node-id="1:87">
                  Action Layer
                </p>
                <p className="font-['Inter:Light',_sans-serif] font-light leading-7 not-italic text-lg text-[#666666]" data-node-id="1:89">
                  (Transparency)
                </p>
              </div>
            </div>
            <div className="w-full" data-name="Paragraph" data-node-id="1:90">
              <p className="font-['Inter:Light',_sans-serif] font-light leading-6 not-italic text-base text-black" data-node-id="1:91">
                Real-time alerts, live portfolio, educational commentary.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="box-border content-stretch flex flex-col gap-6 md:gap-8 items-center justify-center px-4 md:px-8 lg:px-12 py-12 md:py-16 relative shrink-0 w-full max-w-4xl" data-name="Section" data-node-id="1:92">
        <div className="box-border content-stretch flex flex-col gap-3 items-center justify-center text-black w-full" data-name="Heading 2" data-node-id="1:93">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-tight text-xl md:text-2xl" data-node-id="1:94">
            Crisis Contrarians
          </p>
          <p className="font-['Inter:Light',_sans-serif] font-light leading-relaxed text-base md:text-lg text-center max-w-2xl" data-node-id="1:96">{`Snobol is not a hedge fund dressed up. It's a movement of calm contrarians.`}</p>
        </div>
        <div className="bg-black box-border content-stretch flex gap-2 items-center justify-center px-8 md:px-12 py-4 relative rounded-full shrink-0" data-name="Button" data-node-id="1:122">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-white" data-node-id="1:123">
            Get Early Access
          </p>
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