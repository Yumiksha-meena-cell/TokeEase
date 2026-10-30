"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatInr } from "../lib/format";

export interface PricePointData {
  timeLabel: string;
  priceEth: number;
  priceInr: number;
}

interface PriceChartProps {
  data?: PricePointData[];
  symbol: string;
}

const DEFAULT_SAMPLE_DATA: Record<string, PricePointData[]> = {
  JFT: [
    { timeLabel: "Oct 1", priceEth: 0.000095, priceInr: 475 },
    { timeLabel: "Oct 8", priceEth: 0.000097, priceInr: 485 },
    { timeLabel: "Oct 15", priceEth: 0.000098, priceInr: 490 },
    { timeLabel: "Oct 22", priceEth: 0.0001, priceInr: 500 },
    { timeLabel: "Current", priceEth: 0.000108, priceInr: 540 },
  ],
  JPT: [
    { timeLabel: "Oct 1", priceEth: 0.00009, priceInr: 450 },
    { timeLabel: "Oct 8", priceEth: 0.000094, priceInr: 470 },
    { timeLabel: "Oct 15", priceEth: 0.000097, priceInr: 485 },
    { timeLabel: "Oct 22", priceEth: 0.0001, priceInr: 500 },
    { timeLabel: "Current", priceEth: 0.000105, priceInr: 525 },
  ],
  TGOLD: [
    { timeLabel: "Oct 1", priceEth: 0.000028, priceInr: 140 },
    { timeLabel: "Oct 8", priceEth: 0.000029, priceInr: 145 },
    { timeLabel: "Oct 15", priceEth: 0.0000295, priceInr: 148 },
    { timeLabel: "Oct 22", priceEth: 0.00003, priceInr: 150 },
    { timeLabel: "Current", priceEth: 0.0000324, priceInr: 162 },
  ],
  TBOND: [
    { timeLabel: "Oct 1", priceEth: 0.0001, priceInr: 500 },
    { timeLabel: "Oct 8", priceEth: 0.0001, priceInr: 500 },
    { timeLabel: "Oct 15", priceEth: 0.0001, priceInr: 500 },
    { timeLabel: "Oct 22", priceEth: 0.0001, priceInr: 500 },
    { timeLabel: "Current", priceEth: 0.0001, priceInr: 500 },
  ],
};

export const PriceChart: React.FC<PriceChartProps> = ({ data, symbol }) => {
  const chartData =
    data && data.length > 0
      ? data
      : DEFAULT_SAMPLE_DATA[symbol] || DEFAULT_SAMPLE_DATA["JFT"];

  return (
    <div className="w-full h-48 sm:h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#26201b" />
          <XAxis
            dataKey="timeLabel"
            stroke="#787268"
            tick={{ fontSize: 10, fill: "#787268" }}
            axisLine={{ stroke: "#26201b" }}
          />
          <YAxis
            stroke="#787268"
            tick={{ fontSize: 10, fill: "#787268" }}
            axisLine={{ stroke: "#26201b" }}
            domain={["dataMin - 10", "dataMax + 10"]}
            tickFormatter={(val) => `₹${val}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as PricePointData;
                return (
                  <div className="p-2.5 rounded-xl bg-[#14100e] border border-amber-500/30 text-xs shadow-xl font-mono">
                    <div className="text-[#8e887d] text-[10px]">{item.timeLabel}</div>
                    <div className="text-amber-400 font-bold text-sm">
                      {formatInr(item.priceInr)}
                    </div>
                    <div className="text-[#c4beb3] text-[11px]">
                      {item.priceEth.toFixed(6)} ETH
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="priceInr"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#f59e0b", stroke: "#000", strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: "#fbbf24", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
