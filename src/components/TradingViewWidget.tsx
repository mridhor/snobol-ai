"use client";

import React, { useEffect, useRef } from "react";

type TradingViewWidgetProps = {
  symbol: string; // Prefer format EXCHANGE:SYMBOL (e.g., NASDAQ:AAPL)
  height?: number | string;
  width?: number | string;
  interval?: "1" | "5" | "15" | "30" | "60" | "120" | "240" | "D" | "W" | "M";
  theme?: "light" | "dark";
};

export default function TradingViewWidget({
  symbol,
  height = 500,
  width = "100%",
  interval = "D",
  theme = "light",
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content to avoid duplicate widgets on prop changes
    containerRef.current.innerHTML = "";

    // Add global error handler for iframe contentWindow issues
    const handleIframeError = (event: ErrorEvent) => {
      if (event.message?.includes('contentWindow is not available')) {
        event.preventDefault();
        console.warn('TradingView iframe contentWindow access blocked - this is normal for security reasons');
        return false;
      }
    };

    window.addEventListener('error', handleIframeError);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    const config = {
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    } as const;

    script.innerHTML = JSON.stringify(config);

    // Add error handling for iframe contentWindow issues
    script.onerror = (error) => {
      console.warn('TradingView widget failed to load:', error);
    };

    // Create container structure expected by TradingView
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.width = typeof width === "number" ? `${width}px` : width;
    widget.style.height = typeof height === "number" ? `${height}px` : String(height);

    const copyright = document.createElement("div");
    copyright.className = "tradingview-widget-copyright";
    copyright.style.display = "none";

    widgetContainer.appendChild(widget);
    widgetContainer.appendChild(copyright);
    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

    return () => {
      window.removeEventListener('error', handleIframeError);
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, height, width, interval, theme]);

  return <div ref={containerRef} style={{ width: "100%", height: typeof height === "number" ? height : undefined }} />;
}


