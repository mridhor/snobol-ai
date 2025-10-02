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
    <div className="w-full h-[280px]">
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
      <div className="box-border content-stretch flex flex-col gap-[80px] items-center pl-[96px] pr-0 py-[48px] relative shrink-0 w-full" data-name="Header" data-node-id="1:154">
        <div className="relative shrink-0" data-node-id="1:180">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[80px] items-start relative">
            <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0" data-name="Heading 1" data-node-id="1:155">
              <p className="font-['Inter:Light',_sans-serif] font-light leading-[48px] not-italic relative shrink-0 text-[32px] text-black text-nowrap tracking-[-0.8px] whitespace-pre" data-node-id="1:156">
                Snobol
              </p>
            </div>
            <div className="content-stretch flex gap-[96px] h-[338px] items-center relative shrink-0 w-[998px]" data-name="Container" data-node-id="1:157">
              <div className="h-[308.5px] relative shrink-0 w-[451px]" data-name="Paragraph" data-node-id="1:158">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[308.5px] relative w-[451px]">
                  <div className="absolute h-[117px] left-0 top-[120.75px] w-[451px]" data-name="Text" data-node-id="1:160">
                    <p className="absolute font-['Inter:Light',_sans-serif] font-light leading-[40px] left-0 not-italic text-[36px] text-black top-[0.5px] w-[416px]" data-node-id="1:161">
                      Snobol invests in various crisis.
                    </p>
                  </div>
                  <p className="absolute font-['Inter:Light',_sans-serif] font-light leading-[40px] left-0 not-italic text-[36px] text-black top-[0.5px] w-[425px]" data-node-id="1:159">
                    Imagine a world where AI makes us money better than any human can.
                  </p>
                </div>
              </div>
              <div className="basis-0 grow h-[280px] min-h-px min-w-px relative shrink-0" data-name="Container" data-node-id="1:162">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[280px] items-start justify-end relative w-full">
                  <div className="h-[313.6px] relative shrink-0 w-[448px]" data-name="LineChart" data-node-id="1:163">
                    <SimpleLineChart currentPrice={18.49} currentSP500Price={3.30} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="box-border content-stretch flex flex-col gap-[30px] h-[444px] items-start px-[30px] py-[20px] relative shrink-0 w-[896px]" data-name="Section" data-node-id="1:3">
        <div className="h-[36px] relative shrink-0 w-full" data-name="Heading 2" data-node-id="1:4">
          <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[36px] left-0 not-italic text-[24px] text-black text-nowrap top-[-1px] whitespace-pre" data-node-id="1:5">
            Executive Summary
          </p>
        </div>
        <div className="h-[87.75px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="1:6">
          <p className="absolute font-['Inter:Light',_sans-serif] font-light leading-[29.25px] left-0 not-italic text-[18px] text-black top-0 w-[836px]" data-node-id="1:7">{`Snobol is a crisis investing movement that responds rationally when the market panics. We don't predict the future. We prepare, monitor, and respond with discipline when fear creates opportunity.`}</p>
        </div>
        <div className="content-stretch flex flex-col gap-[20px] h-[240px] items-start relative shrink-0 w-full" data-name="List" data-node-id="1:8">
          <div className="h-[24px] relative shrink-0 w-full" data-name="List Item" data-node-id="1:9">
            <div className="absolute content-stretch flex h-[19.5px] items-start left-[32px] top-[2px] w-[54.492px]" data-name="Text" data-node-id="1:10">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-black text-nowrap whitespace-pre" data-node-id="1:11">
                Thesis: Markets overreact during crises. Durable companies become mispriced.
              </p>
            </div>
            <div className="absolute h-[24px] left-0 top-0 w-[9px]" data-name="Text" data-node-id="1:13">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[#a3d5ff] text-[16px] text-nowrap top-[-1px] whitespace-pre" data-node-id="1:14">
                •
              </p>
            </div>
          </div>
          <div className="h-[48px] relative shrink-0 w-full" data-name="List Item" data-node-id="1:15">
            <div className="absolute content-stretch flex h-[19.5px] items-start left-[32px] top-[2px] w-[43.164px]" data-name="Text" data-node-id="1:16">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-black w-[673px]" data-node-id="1:17">
                Edge: Real-time monitoring of order flow, options signals, and macro stress, filtered through quality and valuation rules.
              </p>
            </div>
            <div className="absolute h-[24px] left-0 top-0 w-[9px]" data-name="Text" data-node-id="1:19">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[#a3d5ff] text-[16px] text-nowrap top-[-1px] whitespace-pre" data-node-id="1:20">
                •
              </p>
            </div>
          </div>
          <div className="h-[24px] relative shrink-0 w-full" data-name="List Item" data-node-id="1:21">
            <div className="absolute content-stretch flex h-[19.5px] items-start left-[32px] top-[2px] w-[65.844px]" data-name="Text" data-node-id="1:22">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-black text-nowrap whitespace-pre" data-node-id="1:23">
                Promise: Radical transparency. Every alert published live, every win and loss logged.
              </p>
            </div>
            <div className="absolute h-[24px] left-0 top-0 w-[9px]" data-name="Text" data-node-id="1:25">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[#a3d5ff] text-[16px] text-nowrap top-[-1px] whitespace-pre" data-node-id="1:26">
                •
              </p>
            </div>
          </div>
          <div className="h-[48px] relative shrink-0 w-full" data-name="List Item" data-node-id="1:27">
            <div className="absolute content-stretch flex h-[19.5px] items-start left-[32px] top-[2px] w-[50.891px]" data-name="Text" data-node-id="1:28">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-black w-[804px]" data-node-id="1:29">{`Vision: Build the world's most trusted brand in crisis investing — calm, clear, and inevitable like a snowball rolling downhill.`}</p>
            </div>
            <div className="absolute h-[24px] left-0 top-0 w-[9px]" data-name="Text" data-node-id="1:31">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[#a3d5ff] text-[16px] text-nowrap top-[-1px] whitespace-pre" data-node-id="1:32">
                •
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="box-border content-stretch flex flex-col gap-[30px] items-start px-[30px] py-[20px] relative shrink-0 w-[896px]" data-name="Section" data-node-id="1:33">
        <div className="h-[36px] relative shrink-0 w-full" data-name="Heading 2" data-node-id="1:34">
          <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[36px] left-0 not-italic text-[24px] text-black text-nowrap top-[-1px] whitespace-pre" data-node-id="1:35">
            Investment Philosophy
          </p>
        </div>
        <div className="content-stretch flex flex-col gap-[25px] h-[296px] items-start relative shrink-0 w-full" data-name="List" data-node-id="1:36">
          <div className="content-stretch flex gap-[23px] items-center relative shrink-0 w-full" data-name="List Item" data-node-id="1:43">
            <div className="h-[24px] relative shrink-0 w-[9px]" data-name="Text" data-node-id="1:47">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[#a3d5ff] text-[16px] text-nowrap top-[-1px] whitespace-pre" data-node-id="1:48">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-black w-[625px]" data-node-id="1:46">
              Buy quality under panic. Only durable companies with strong balance sheets,
            </p>
          </div>
          <div className="h-[24px] relative shrink-0 w-full" data-name="List Item" data-node-id="1:37">
            <div className="absolute content-stretch flex items-start left-[32px] top-[2px] w-[176.5px]" data-name="Text" data-node-id="1:38">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-black text-nowrap whitespace-pre" data-node-id="1:39">{`Respond, don't predict. Crises can't be timed, but they can be recognized.`}</p>
            </div>
            <div className="absolute h-[24px] left-0 top-0 w-[9px]" data-name="Text" data-node-id="1:41">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[#a3d5ff] text-[16px] text-nowrap top-[-1px] whitespace-pre" data-node-id="1:42">
                •
              </p>
            </div>
          </div>
          <div className="h-[24px] relative shrink-0 w-full" data-name="List Item" data-node-id="1:49">
            <div className="absolute content-stretch flex h-[19.5px] items-start left-[32px] top-[2px] w-[219.961px]" data-name="Text" data-node-id="1:50">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-black text-nowrap whitespace-pre" data-node-id="1:51">
                Transparency over hindsight. Every signal is logged and public. No retroactive editing.
              </p>
            </div>
            <div className="absolute h-[24px] left-0 top-0 w-[9px]" data-name="Text" data-node-id="1:53">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[#a3d5ff] text-[16px] text-nowrap top-[-1px] whitespace-pre" data-node-id="1:54">
                •
              </p>
            </div>
          </div>
          <div className="h-[24px] relative shrink-0 w-full" data-name="List Item" data-node-id="1:55">
            <div className="absolute content-stretch flex h-[19.5px] items-start left-[32px] top-[2px] w-[173.117px]" data-name="Text" data-node-id="1:56">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-black text-nowrap whitespace-pre" data-node-id="1:57">
                Risk management first. Cash buffer, sizing discipline, and no leverage by default.
              </p>
            </div>
            <div className="absolute h-[24px] left-0 top-0 w-[9px]" data-name="Text" data-node-id="1:59">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[#a3d5ff] text-[16px] text-nowrap top-[-1px] whitespace-pre" data-node-id="1:60">
                •
              </p>
            </div>
          </div>
          <div className="h-[48px] relative shrink-0 w-full" data-name="List Item" data-node-id="1:61">
            <div className="absolute content-stretch flex h-[19.5px] items-start left-[32px] top-[2px] w-[159.352px]" data-name="Text" data-node-id="1:62">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-black w-[664px]" data-node-id="1:63">
                AI as tool running in the background, not oracle. Our AI processes flows, volumes, and stress signals. Humans apply wisdom and judgment.
              </p>
            </div>
            <div className="absolute h-[24px] left-0 top-0 w-[9px]" data-name="Text" data-node-id="1:65">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-0 not-italic text-[#a3d5ff] text-[16px] text-nowrap top-[-1px] whitespace-pre" data-node-id="1:66">
                •
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="box-border content-stretch flex flex-col gap-[30px] items-start px-[30px] py-[20px] relative shrink-0 w-[896px]" data-name="Section" data-node-id="1:67">
        <div className="h-[36px] relative shrink-0 w-full" data-name="Heading 2" data-node-id="1:68">
          <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[36px] left-0 not-italic text-[24px] text-black text-nowrap top-[-1px] whitespace-pre" data-node-id="1:69">
            The Snobol Process
          </p>
        </div>
        <div className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0 w-full" data-name="Container" data-node-id="1:70">
          <div className="content-stretch flex flex-col gap-[10px] h-[68px] items-start relative shrink-0 w-full" data-name="Container" data-node-id="1:71">
            <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3" data-node-id="1:72">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-black text-nowrap top-0 whitespace-pre" data-node-id="1:73">
                Signal Layer
              </p>
              <div className="absolute content-stretch flex h-[22px] items-start left-[109.23px] top-[3px] w-[29.375px]" data-name="Text" data-node-id="1:74">
                <p className="font-['Inter:Light',_sans-serif] font-light leading-[28px] not-italic relative shrink-0 text-[#666666] text-[18px] text-nowrap whitespace-pre" data-node-id="1:75">
                  (AI)
                </p>
              </div>
            </div>
            <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="1:76">
              <p className="absolute font-['Inter:Light',_sans-serif] font-light leading-[24px] left-0 not-italic text-[16px] text-black text-nowrap top-[-1px] whitespace-pre" data-node-id="1:77">
                Order flow stress, options panic, macro alerts.
              </p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[10px] h-[68px] items-start relative shrink-0 w-full" data-name="Container" data-node-id="1:78">
            <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3" data-node-id="1:79">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-black text-nowrap top-0 whitespace-pre" data-node-id="1:80">
                Filter Layer
              </p>
              <div className="absolute content-stretch flex h-[22px] items-start left-[99.77px] top-[3px] w-[58.484px]" data-name="Text" data-node-id="1:81">
                <p className="font-['Inter:Light',_sans-serif] font-light leading-[28px] not-italic relative shrink-0 text-[#666666] text-[18px] text-nowrap whitespace-pre" data-node-id="1:82">
                  (Rules)
                </p>
              </div>
            </div>
            <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="1:83">
              <p className="absolute font-['Inter:Light',_sans-serif] font-light leading-[24px] left-0 not-italic text-[16px] text-black text-nowrap top-[-1px] whitespace-pre" data-node-id="1:84">
                Quality metrics, valuation checks, crisis scoring.
              </p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[10px] h-[68px] items-start relative shrink-0 w-full" data-name="Container" data-node-id="1:85">
            <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3" data-node-id="1:86">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[28px] left-0 not-italic text-[18px] text-black text-nowrap top-0 whitespace-pre" data-node-id="1:87">
                Action Layer
              </p>
              <div className="absolute content-stretch flex h-[22px] items-start left-[111.56px] top-[3px] w-[127.023px]" data-name="Text" data-node-id="1:88">
                <p className="font-['Inter:Light',_sans-serif] font-light leading-[28px] not-italic relative shrink-0 text-[#666666] text-[18px] text-nowrap whitespace-pre" data-node-id="1:89">
                  (Transparency)
                </p>
              </div>
            </div>
            <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph" data-node-id="1:90">
              <p className="absolute font-['Inter:Light',_sans-serif] font-light leading-[24px] left-0 not-italic text-[16px] text-black text-nowrap top-[-1px] whitespace-pre" data-node-id="1:91">
                Real-time alerts, live portfolio, educational commentary.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="box-border content-stretch flex flex-col gap-[23px] h-[261px] items-center justify-center p-[96px] relative shrink-0 w-[896px]" data-name="Section" data-node-id="1:92">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center not-italic px-[251px] py-0 relative shrink-0 text-black text-nowrap w-full whitespace-pre" data-name="Heading 2" data-node-id="1:93">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[36px] relative shrink-0 text-[24px]" data-node-id="1:94">
            Crisis Contrarians
          </p>
          <p className="font-['Inter:Light',_sans-serif] font-light leading-[29.25px] relative shrink-0 text-[18px] text-center" data-node-id="1:96">{`Snobol is not a hedge fund dressed up. It's a movement of calm contrarians.`}</p>
        </div>
        <div className="bg-black box-border content-stretch flex gap-[10px] items-center justify-center px-[48px] py-[15px] relative rounded-[100px] shrink-0" data-name="Button" data-node-id="1:122">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre" data-node-id="1:123">
            Get Early Access
          </p>
        </div>
      </div>
      <div className="border-[1px_0px_0px] border-gray-200 border-solid box-border content-stretch flex flex-col h-[117px] items-start pb-0 pt-[49px] px-[96px] relative shrink-0 w-full" data-name="Footer" data-node-id="1:146">
        <div className="box-border content-stretch flex h-[20px] items-center justify-between pl-0 pr-[0.008px] py-0 relative shrink-0 w-full" data-name="Container" data-node-id="1:147">
          <div className="h-[17px] relative shrink-0 w-[122.242px]" data-name="Link" data-node-id="1:148">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[17px] items-start relative w-[122.242px]">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#666666] text-[14px] text-nowrap whitespace-pre" data-node-id="1:149">
                hello@snobol.com
              </p>
            </div>
          </div>
          <div className="h-[20px] relative shrink-0 w-[57.297px]" data-name="Button" data-node-id="1:150">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[57.297px]">
              <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[20px] left-0 not-italic text-[#666666] text-[14px] text-nowrap top-[0.5px] whitespace-pre" data-node-id="1:151">
                about us
              </p>
            </div>
          </div>
          <div className="h-[17px] relative shrink-0 w-[128.898px]" data-name="Text" data-node-id="1:152">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[17px] items-start relative w-[128.898px]">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#666666] text-[14px] text-nowrap text-right whitespace-pre" data-node-id="1:153">
                © 2025 Snobol Inc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}