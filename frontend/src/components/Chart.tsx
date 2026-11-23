'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartProps {
  spec: string;
  title?: string;
  description?: string;
}

export default function Chart({ spec, title, description }: ChartProps) {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(spec);
      setConfig(parsed);
    } catch (error) {
      console.error('Failed to parse chart spec:', error);
    }
  }, [spec]);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading chart...
      </div>
    );
  }

  const ChartComponent = config.type === 'line' ? LineChart : config.type === 'bar' ? BarChart : LineChart;
  const labels = config.data?.labels || [];
  const datasets = config.data?.datasets || [];

  const chartData = labels.map((label: string, index: number) => {
    const entry: any = { name: label };
    datasets.forEach((dataset: any) => {
      entry[dataset.label] = dataset.data[index];
    });
    return entry;
  });

  return (
    <div>
      {title && <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>}
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {datasets.map((dataset: any, index: number) => {
              if (config.type === 'line') {
                return (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={dataset.label}
                    stroke={dataset.borderColor}
                    fill={dataset.fill ? dataset.backgroundColor : false}
                    strokeWidth={2}
                  />
                );
              }
              return (
                <Bar
                  key={index}
                  dataKey={dataset.label}
                  fill={dataset.backgroundColor || dataset.fill}
                  stroke={dataset.borderColor}
                  strokeWidth={1}
                  radius={4}
                />
              );
            })}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
