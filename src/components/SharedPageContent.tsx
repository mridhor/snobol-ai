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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip as ChartJSTooltip,
  Filler,
  TooltipItem,
} from "chart.js";
import { Line as ChartJSLine } from "react-chartjs-2";
import { formatAreaChartData, ChartData } from "@/utils/chartData";
import EditableText from "./EditableText";
import { useContent } from "../hooks/useContent";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartJSTooltip, Filler);

interface SharedPageContentProps {
  isAdmin?: boolean;
  editMode?: boolean;
  onSave?: (html: string, elementId?: string) => void;
}

// Ultra-simple 2-line chart component for main page
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

// Chart.js chart for admin page
const AdminChart = () => {
  const labels = [
    "2013", "2014", "2015", "2016", "2017",
    "2018", "2019", "2020", "2021", "2022",
    "2023", "2024", "2025"
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Snobol Fund Price",
        data: [
          1.0, 1.34, 2.02, 2.51, 5.40,
          9.97, 11.77, 10.81, 12.45, 13.04,
          14.41, 14.95, 18.49
        ],
        borderColor: "#000000",
        backgroundColor: "rgba(0,0,0,0.1)",
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"line">) => `$${Number(context.raw).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        ticks: { callback: (value: string | number) => `$${value}` },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  return <ChartJSLine data={data} options={options} />;
};

export default function SharedPageContent({ isAdmin = false, editMode = false, onSave }: SharedPageContentProps) {
  const { loading, getContent } = useContent();

  const handleSave = async (html: string, elementId?: string) => {
    if (onSave && elementId) {
      await onSave(html, elementId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    // Admin layout with editing capabilities
    return (
      <main className="font-sans bg-white text-black px-6 md:px-16 lg:px-32 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-4">
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "hero-title")}
            tag="h1"
            className="text-4xl md:text-5xl font-bold"
          >
            {getContent("hero-title", "Snobol")}
          </EditableText>
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "hero-subtitle")}
            tag="h2"
            className="text-xl md:text-2xl text-gray-700"
          >
            {getContent("hero-subtitle", "Imagine a world where AI makes us money better than any human can. Snobol invests in various crisis.")}
          </EditableText>
          <div className="max-w-3xl mx-auto mt-8">
            <AdminChart />
            <EditableText
              editMode={editMode}
              onSave={(html) => handleSave(html, "chart-disclaimer")}
              tag="p"
              className="text-xs text-gray-500 mt-2"
            >
              {getContent("chart-disclaimer", "*Past performance in no way guarantees future performance.")}
            </EditableText>
          </div>
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "hero-cta")}
            tag="button"
            className="mt-8 px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            {getContent("hero-cta", "Get Early Access")}
          </EditableText>
        </section>

        {/* Executive Summary */}
        <section>
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "exec-summary-title")}
            tag="h3"
            className="text-2xl font-semibold mb-4"
          >
            {getContent("exec-summary-title", "Executive Summary")}
          </EditableText>
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "exec-summary-intro")}
            tag="p"
            className="mb-4"
          >
            {getContent("exec-summary-intro", "Snobol is a crisis investing movement that responds rationally when the market panics. We don't predict the future. We prepare, monitor, and respond with discipline when fear creates opportunity.")}
          </EditableText>
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "exec-summary-list")}
            tag="ul"
            className="list-disc list-inside space-y-1 text-gray-800"
          >
            {getContent("exec-summary-list", `
              <li><strong>Thesis:</strong> Markets overreact during crises. Durable companies become mispriced.</li>
              <li><strong>Edge:</strong> Real-time monitoring of order flow, options signals, and macro stress, filtered through quality and valuation rules.</li>
              <li><strong>Promise:</strong> Radical transparency. Every alert published live, every win and loss logged.</li>
              <li><strong>Vision:</strong> Build the world's most trusted brand in crisis investing — calm, clear, and inevitable like a snowball rolling downhill.</li>
            `)}
          </EditableText>
        </section>

        {/* Investment Philosophy */}
        <section>
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "philosophy-title")}
            tag="h3"
            className="text-2xl font-semibold mb-4"
          >
            {getContent("philosophy-title", "Investment Philosophy")}
          </EditableText>
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "philosophy-list")}
            tag="ul"
            className="list-disc list-inside space-y-1 text-gray-800"
          >
            {getContent("philosophy-list", `
              <li>Buy quality under panic. Only durable companies with strong balance sheets,</li>
              <li>Respond, don't predict. Crises can't be timed, but they can be recognized.</li>
              <li>Transparency over hindsight. Every signal is logged and public. No retroactive editing.</li>
              <li>Risk management first. Cash buffer, sizing discipline, and no leverage by default.</li>
              <li>AI as tool running in the background, not oracle. Our AI processes flows, volumes, and stress signals. Humans apply wisdom and judgment.</li>
            `)}
          </EditableText>
        </section>

        {/* Process */}
        <section>
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "process-title")}
            tag="h3"
            className="text-2xl font-semibold mb-6"
          >
            {getContent("process-title", "The Snobol Process")}
          </EditableText>
          <div className="grid md:grid-cols-3 gap-8 text-gray-800">
            <div>
              <EditableText
                editMode={editMode}
                onSave={(html) => handleSave(html, "signal-layer-title")}
                tag="h4"
                className="font-semibold mb-2"
              >
                {getContent("signal-layer-title", "Signal Layer (AI)")}
              </EditableText>
              <EditableText
                editMode={editMode}
                onSave={(html) => handleSave(html, "signal-layer-list")}
                tag="p"
                className="text-sm"
              >
                {getContent("signal-layer-list", "Order flow stress, options panic, macro alerts.")}
              </EditableText>
            </div>
            <div>
              <EditableText
                editMode={editMode}
                onSave={(html) => handleSave(html, "filter-layer-title")}
                tag="h4"
                className="font-semibold mb-2"
              >
                {getContent("filter-layer-title", "Filter Layer (Rules)")}
              </EditableText>
              <EditableText
                editMode={editMode}
                onSave={(html) => handleSave(html, "filter-layer-list")}
                tag="p"
                className="text-sm"
              >
                {getContent("filter-layer-list", "Quality metrics, valuation checks, crisis scoring.")}
              </EditableText>
            </div>
            <div>
              <EditableText
                editMode={editMode}
                onSave={(html) => handleSave(html, "action-layer-title")}
                tag="h4"
                className="font-semibold mb-2"
              >
                {getContent("action-layer-title", "Action Layer (Transparency)")}
              </EditableText>
              <EditableText
                editMode={editMode}
                onSave={(html) => handleSave(html, "action-layer-list")}
                tag="p"
                className="text-sm"
              >
                {getContent("action-layer-list", "Real-time alerts, live portfolio, educational commentary.")}
              </EditableText>
            </div>
          </div>
        </section>

        {/* Community */}
        <section>
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "community-title")}
            tag="h3"
            className="text-2xl font-semibold mb-4"
          >
            {getContent("community-title", "Crisis Contrarians")}
          </EditableText>
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "community-intro")}
            tag="p"
            className="mb-4"
          >
            {getContent("community-intro", "Snobol is not a hedge fund dressed up. It's a movement of calm contrarians.")}
          </EditableText>
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "community-cta")}
            tag="button"
            className="mt-6 px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            {getContent("community-cta", "Get Early Access")}
          </EditableText>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-12">
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "footer-email")}
            tag="p"
          >
            {getContent("footer-email", "hello@snobol.com")}
          </EditableText>
          <EditableText
            editMode={editMode}
            onSave={(html) => handleSave(html, "footer-copyright")}
            tag="p"
          >
            {getContent("footer-copyright", "© 2025 Snobol Inc.")}
          </EditableText>
        </footer>
      </main>
    );
  }

  // Main page layout (read-only)
  return (
    <div className="bg-white content-stretch flex flex-col gap-[20px] items-center relative size-full" data-name="Homepage" data-node-id="1:2">
      <div className="box-border content-stretch flex flex-col gap-8 md:gap-20 items-center px-4 md:px-12 lg:px-24 py-8 md:py-12 relative shrink-0 w-full" data-name="Header" data-node-id="1:154">
        <div className="relative shrink-0 w-full max-w-6xl" data-node-id="1:180">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-8 md:gap-20 items-center relative">
            <div className="content-stretch flex gap-2 items-center justify-center relative shrink-0" data-name="Heading 1" data-node-id="1:155">
              <p className="font-['Inter:Light',_sans-serif] font-light leading-tight not-italic relative shrink-0 text-2xl md:text-4xl text-black text-nowrap tracking-tight whitespace-pre" data-node-id="1:156">
                {getContent("hero-title", "Snobol")}
              </p>
            </div>
            <div className="content-stretch flex flex-col lg:flex-row gap-8 lg:gap-24 items-center relative shrink-0 w-full" data-name="Container" data-node-id="1:157">
              <div className="flex-1 max-w-lg lg:max-w-none" data-name="Paragraph" data-node-id="1:158">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border relative w-full">
                  <p className="font-['Inter:Light',_sans-serif] font-light leading-tight not-italic text-xl md:text-2xl lg:text-4xl text-black mb-4" data-node-id="1:159">
                    {getContent("hero-subtitle", "Imagine a world where AI makes us money better than any human can.")}
                  </p>
                  <p className="font-['Inter:Light',_sans-serif] font-light leading-tight not-italic text-xl md:text-2xl lg:text-4xl text-black" data-node-id="1:161">
                    {getContent("hero-subtitle-2", "Snobol invests in various crisis.")}
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
            {getContent("exec-summary-title", "Executive Summary")}
          </p>
        </div>
        <div className="w-full" data-name="Paragraph" data-node-id="1:6">
          <p className="font-['Inter:Light',_sans-serif] font-light leading-relaxed not-italic text-base md:text-lg text-black" data-node-id="1:7">
            {getContent("exec-summary-intro", "Snobol is a crisis investing movement that responds rationally when the market panics. We don't predict the future. We prepare, monitor, and respond with discipline when fear creates opportunity.")}
          </p>
        </div>
        <div className="content-stretch flex flex-col gap-4 md:gap-5 items-start relative shrink-0 w-full" data-name="List" data-node-id="1:8">
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:9">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:13">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:14">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:11">
              {getContent("thesis-point", "Thesis: Markets overreact during crises. Durable companies become mispriced.")}
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:15">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:19">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:20">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:17">
              {getContent("edge-point", "Edge: Real-time monitoring of order flow, options signals, and macro stress, filtered through quality and valuation rules.")}
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:21">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:25">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:26">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:23">
              {getContent("promise-point", "Promise: Radical transparency. Every alert published live, every win and loss logged.")}
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:27">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:31">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:32">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:29">
              {getContent("vision-point", "Vision: Build the world's most trusted brand in crisis investing — calm, clear, and inevitable like a snowball rolling downhill.")}
            </p>
          </div>
        </div>
      </div>
      <div className="box-border content-stretch flex flex-col gap-6 md:gap-8 items-center px-4 md:px-8 lg:px-12 py-6 md:py-8 relative shrink-0 w-full max-w-4xl" data-name="Section" data-node-id="1:33">
        <div className="w-full" data-name="Heading 2" data-node-id="1:34">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-tight not-italic text-xl md:text-2xl text-black" data-node-id="1:35">
            {getContent("philosophy-title", "Investment Philosophy")}
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
              {getContent("philosophy-1", "Buy quality under panic. Only durable companies with strong balance sheets,")}
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:37">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:41">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:42">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:39">
              {getContent("philosophy-2", "Respond, don't predict. Crises can't be timed, but they can be recognized.")}
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:49">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:53">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:54">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:51">
              {getContent("philosophy-3", "Transparency over hindsight. Every signal is logged and public. No retroactive editing.")}
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:55">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:59">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:60">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:57">
              {getContent("philosophy-4", "Risk management first. Cash buffer, sizing discipline, and no leverage by default.")}
            </p>
          </div>
          <div className="flex items-start gap-3 w-full" data-name="List Item" data-node-id="1:61">
            <div className="flex-shrink-0 mt-1" data-name="Text" data-node-id="1:65">
              <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-[#a3d5ff] text-base" data-node-id="1:66">
                •
              </p>
            </div>
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-black flex-1" data-node-id="1:63">
              {getContent("philosophy-5", "AI as tool running in the background, not oracle. Our AI processes flows, volumes, and stress signals. Humans apply wisdom and judgment.")}
            </p>
          </div>
        </div>
      </div>
      <div className="box-border content-stretch flex flex-col gap-6 md:gap-8 items-center px-4 md:px-8 lg:px-12 py-6 md:py-8 relative shrink-0 w-full max-w-4xl" data-name="Section" data-node-id="1:67">
        <div className="w-full" data-name="Heading 2" data-node-id="1:68">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-tight not-italic text-xl md:text-2xl text-black" data-node-id="1:69">
            {getContent("process-title", "The Snobol Process")}
          </p>
        </div>
        <div className="content-stretch flex flex-col gap-6 md:gap-8 items-start relative shrink-0 w-full" data-name="Container" data-node-id="1:70">
          <div className="content-stretch flex flex-col gap-2 items-start relative shrink-0 w-full" data-name="Container" data-node-id="1:71">
            <div className="w-full" data-name="Heading 3" data-node-id="1:72">
              <div className="flex items-center gap-2">
                <p className="font-['Inter:Regular',_sans-serif] font-normal leading-7 not-italic text-lg text-black" data-node-id="1:73">
                  {getContent("signal-layer-title", "Signal Layer")}
                </p>
                <p className="font-['Inter:Light',_sans-serif] font-light leading-7 not-italic text-lg text-[#666666]" data-node-id="1:75">
                  (AI)
                </p>
              </div>
            </div>
            <div className="w-full" data-name="Paragraph" data-node-id="1:76">
              <p className="font-['Inter:Light',_sans-serif] font-light leading-6 not-italic text-base text-black" data-node-id="1:77">
                {getContent("signal-layer-list", "Order flow stress, options panic, macro alerts.")}
              </p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-2 items-start relative shrink-0 w-full" data-name="Container" data-node-id="1:78">
            <div className="w-full" data-name="Heading 3" data-node-id="1:79">
              <div className="flex items-center gap-2">
                <p className="font-['Inter:Regular',_sans-serif] font-normal leading-7 not-italic text-lg text-black" data-node-id="1:80">
                  {getContent("filter-layer-title", "Filter Layer")}
                </p>
                <p className="font-['Inter:Light',_sans-serif] font-light leading-7 not-italic text-lg text-[#666666]" data-node-id="1:82">
                  (Rules)
                </p>
              </div>
            </div>
            <div className="w-full" data-name="Paragraph" data-node-id="1:83">
              <p className="font-['Inter:Light',_sans-serif] font-light leading-6 not-italic text-base text-black" data-node-id="1:84">
                {getContent("filter-layer-list", "Quality metrics, valuation checks, crisis scoring.")}
              </p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-2 items-start relative shrink-0 w-full" data-name="Container" data-node-id="1:85">
            <div className="w-full" data-name="Heading 3" data-node-id="1:86">
              <div className="flex items-center gap-2">
                <p className="font-['Inter:Regular',_sans-serif] font-normal leading-7 not-italic text-lg text-black" data-node-id="1:87">
                  {getContent("action-layer-title", "Action Layer")}
                </p>
                <p className="font-['Inter:Light',_sans-serif] font-light leading-7 not-italic text-lg text-[#666666]" data-node-id="1:89">
                  (Transparency)
                </p>
              </div>
            </div>
            <div className="w-full" data-name="Paragraph" data-node-id="1:90">
              <p className="font-['Inter:Light',_sans-serif] font-light leading-6 not-italic text-base text-black" data-node-id="1:91">
                {getContent("action-layer-list", "Real-time alerts, live portfolio, educational commentary.")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="box-border content-stretch flex flex-col gap-6 md:gap-8 items-center justify-center px-4 md:px-8 lg:px-12 py-12 md:py-16 relative shrink-0 w-full max-w-4xl" data-name="Section" data-node-id="1:92">
        <div className="box-border content-stretch flex flex-col gap-3 items-center justify-center text-black w-full" data-name="Heading 2" data-node-id="1:93">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-tight text-xl md:text-2xl" data-node-id="1:94">
            {getContent("community-title", "Crisis Contrarians")}
          </p>
          <p className="font-['Inter:Light',_sans-serif] font-light leading-relaxed text-base md:text-lg text-center max-w-2xl" data-node-id="1:96">
            {getContent("community-intro", "Snobol is not a hedge fund dressed up. It's a movement of calm contrarians.")}
          </p>
        </div>
        <div className="bg-black box-border content-stretch flex gap-2 items-center justify-center px-8 md:px-12 py-4 relative rounded-full shrink-0" data-name="Button" data-node-id="1:122">
          <p className="font-['Inter:Regular',_sans-serif] font-normal leading-6 not-italic text-base text-white" data-node-id="1:123">
            {getContent("community-cta", "Get Early Access")}
          </p>
        </div>
      </div>
      <div className="border-t border-gray-200 box-border content-stretch flex flex-col items-center py-8 md:py-12 px-4 md:px-8 lg:px-24 relative shrink-0 w-full" data-name="Footer" data-node-id="1:146">
        <div className="box-border content-stretch flex flex-col md:flex-row gap-4 md:gap-0 items-center justify-between w-full max-w-6xl" data-name="Container" data-node-id="1:147">
          <div className="flex-shrink-0" data-name="Link" data-node-id="1:148">
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-5 text-[#666666] text-sm" data-node-id="1:149">
              {getContent("footer-email", "hello@snobol.com")}
            </p>
          </div>
          <div className="flex-shrink-0" data-name="Button" data-node-id="1:150">
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-5 text-[#666666] text-sm" data-node-id="1:151">
              about us
            </p>
          </div>
          <div className="flex-shrink-0" data-name="Text" data-node-id="1:152">
            <p className="font-['Inter:Regular',_sans-serif] font-normal leading-5 text-[#666666] text-sm text-center md:text-right" data-node-id="1:153">
              {getContent("footer-copyright", "© 2025 Snobol Inc.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
