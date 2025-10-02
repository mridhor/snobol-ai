export interface FinancialData {
  date: string;
  snobol: number;
  sp500: number;
}

// Define the ChartData interface in chartData.ts to match PerformanceChart.tsx
export interface ChartData {
  date: string;
  fullDate: string;
  sp500: number;
  snobol: number;
  totalSnobol?: number; // Optional field for total Snobol price
}

export const financialData: FinancialData[] = JSON.parse(localStorage.getItem("financialData") || "[]")?.length
  ? JSON.parse(localStorage.getItem("financialData")!)
  : [
      { date: "Aug 8, 2013", snobol: 1, sp500: 1 },
      { date: "Dec 31, 2014", snobol: 1.3427, sp500: 1.2303 },
      { date: "Dec 31, 2015", snobol: 2.0271, sp500: 1.2203 },
      { date: "Dec 31, 2016", snobol: 2.5137, sp500: 1.324 },
      { date: "Dec 31, 2017", snobol: 5.4072, sp500: 1.5812 },
      { date: "Dec 31, 2018", snobol: 9.9748, sp500: 1.4701 },
      { date: "Dec 31, 2019", snobol: 11.7744, sp500: 1.9051 },
      { date: "Dec 31, 2020", snobol: 10.8155, sp500: 2.2071 },
      { date: "Dec 31, 2021", snobol: 12.4553, sp500: 2.8261 },
      { date: "Dec 31, 2022", snobol: 13.0448, sp500: 2.2707 },
      { date: "Dec 31, 2023", snobol: 14.4117, sp500: 2.8209 },
      { date: "Dec 31, 2024", snobol: 14.9501, sp500: 3.4933 }
    ];

export const addTodayData = (latestPrice: number, sp500: number) => {
  const today = new Date();
  const formattedToday = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const withoutToday = financialData.filter(d => d.date !== formattedToday);
  const updatedData: FinancialData[] = [
    ...withoutToday,
    { date: formattedToday, snobol: latestPrice, sp500: sp500 }
  ];

  localStorage.setItem("financialData", JSON.stringify(updatedData));
  return updatedData;
};

export const checkAndRecordYearlyData = (latestPrice: number, sp500: number) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const expectedDate = `Dec 31, ${currentYear - 1}`;

  const alreadyRecorded = financialData.some(d => d.date === expectedDate);

  if (today.getMonth() === 0 && today.getDate() === 1 && !alreadyRecorded) {
    const yearEndEntry = {
      date: expectedDate,
      snobol: latestPrice,
      sp500: sp500
    };
    const updatedData = [...financialData, yearEndEntry];
    localStorage.setItem("financialData", JSON.stringify(updatedData));
    return updatedData;
  }
  return financialData;
};

export const formatAreaChartData = (): ChartData[] => {
  return financialData.map(item => {
    const year = item.date.split(", ")[1];
    return {
      date: year,
      fullDate: item.date,
      sp500: item.sp500,
      snobol: item.snobol - item.sp500,
      totalSnobol: item.snobol // Add totalSnobol for historical data
    };
  });
};

export const getYAxisDomain = () => {
  const maxValue = Math.max(...financialData.map(item => item.snobol), 20);
  return [0, Math.ceil(maxValue)];
};
