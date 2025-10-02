"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface StockChartProps {
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

export default function StockChart({
  symbol,
  companyName,
  period,
  currentPrice,
  change,
  data
}: StockChartProps) {
  const isPositive = parseFloat(change) >= 0;
  
  // Convert string prices to numbers for charting
  const chartData = data.map(item => ({
    ...item,
    price: parseFloat(item.price),
    high: parseFloat(item.high),
    low: parseFloat(item.low)
  }));

  return (
    <div className="my-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-lg font-semibold text-gray-900">{symbol}</h3>
          <span className="text-sm text-gray-500">{companyName}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-gray-900">${currentPrice}</span>
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-gray-400 uppercase">{period}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#666' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e5e5' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#666' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e5e5' }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Price']}
              labelStyle={{ color: '#666', fontWeight: 'bold' }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <span>Source: Yahoo Finance</span>
        <span>Updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

