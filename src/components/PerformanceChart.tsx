import React, { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { formatAreaChartData as importedFormatAreaChartData, ChartData } from "@/utils/chartData";

interface PerformanceChartProps {
  currentPrice: number;
  currentSP500Price: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ currentPrice, currentSP500Price }) => {
  console.log("PerformanceChart - Rendered with Props:", { currentPrice, currentSP500Price });

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Add state to force chart update
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const formattedData = importedFormatAreaChartData();
  
    const validCurrentPrice = !isNaN(currentPrice) ? currentPrice : 19.5202;
    const validSP500Price = !isNaN(currentSP500Price) ? currentSP500Price : 3.3006;
    const snobolPortion = validCurrentPrice - validSP500Price;
  
    console.log("PerformanceChart - Computing Data:", { validCurrentPrice, validSP500Price, snobolPortion });
  
    if (!isNaN(snobolPortion) && snobolPortion >= 0) {
      formattedData.push({
        date: new Date().getFullYear().toString(),
        fullDate: currentDate,
        sp500: validSP500Price,
        snobol: snobolPortion,
        totalSnobol: validCurrentPrice
      });
    } else {
      console.error("PerformanceChart - Invalid Snobol portion calculated:", {
        currentPrice: validCurrentPrice,
        currentSP500Price: validSP500Price,
        snobolPortion
      });
      formattedData.push({
        date: new Date().getFullYear().toString(),
        fullDate: currentDate,
        sp500: validSP500Price,
        snobol: 0,
        totalSnobol: validCurrentPrice
      });
    }
    setChartData(formattedData);
  }, [currentPrice, currentSP500Price, currentDate]);

  const [fontSize, setFontSize] = useState("12px");
  const [chartHeight, setChartHeight] = useState("100%");
  const [chartMinWidth, setChartMinWidth] = useState("320px");
  const [chartMinHeight, setChartMinHeight] = useState("auto");
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSizes = () => {
      const width = window.innerWidth;
      if (width <= 478) {
        setFontSize("14px");
        setChartHeight("400px");
        setChartMinWidth("280px");
        setChartMinHeight("400px");
      } else if (width <= 767) {
        setFontSize("12px");
        setChartHeight("300px");
        setChartMinWidth("320px");
        setChartMinHeight("300px");
      } else if (width <= 991) {
        setFontSize("11px");
        setChartHeight("350px");
        setChartMinWidth("400px");
        setChartMinHeight("350px");
      } else {
        setFontSize("10px");
        setChartHeight("400px");
        setChartMinWidth("500px");
        setChartMinHeight("400px");
      }

      const container = chartContainerRef.current;
      if (container) {
        const { offsetWidth: width, offsetHeight: height } = container;
        const surfaces = container.querySelectorAll<SVGElement>(".recharts-surface");
        surfaces.forEach((surface) => {
          surface.setAttribute("viewBox", `0 0 ${width} ${height}`);
        });
      }
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, []);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
      style={{
        height: chartHeight,
        minWidth: chartMinWidth,
        minHeight: chartMinHeight,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData} // Use state instead of memo
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorSp500" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F7F5E8" stopOpacity={1} />
              <stop offset="95%" stopColor="#F7F5E8" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="colorSnobol" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#656559" stopOpacity={1} />
              <stop offset="95%" stopColor="#656559" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E5E5"
            strokeWidth={1}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666666", fontWeight: "bold", fontSize }}
            tickMargin={20}
            height={60}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            domain={[0, 20]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666666", fontWeight: "bold", fontSize }}
            tickCount={11}
            tickMargin={5}
            width={35}
            ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]}
          />
          <Tooltip
            content={({ payload }) => {
              if (payload && payload.length > 0) {
                const entry = payload.find((item) => item.name === "snobol");
                if (entry) {
                  const fullDate = entry.payload.fullDate;
                  const snobolPrice = entry.payload.totalSnobol ?? ((entry.payload.snobol || 0) + (entry.payload.sp500 || 0));

                  console.log("PerformanceChart - Tooltip Rendered:", { fullDate, snobolPrice });

                  if (!isNaN(snobolPrice)) {
                    return (
                      <div className="bg-white p-2 rounded shadow">
                        <div className="text-sm font-medium" style={{ color: "#65655A" }}>{fullDate}</div>
                        <div className="text-lg">${snobolPrice.toFixed(2)}</div>
                      </div>
                    );
                  }
                }
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="sp500"
            stackId="1"
            stroke="none"
            fillOpacity={1}
            fill="url(#colorSp500)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="snobol"
            stackId="1"
            stroke="none"
            fillOpacity={1}
            fill="url(#colorSnobol)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};