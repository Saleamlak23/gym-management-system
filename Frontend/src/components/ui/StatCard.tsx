import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, className = '' }) => {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <div className={`mt-2 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    </div>
  );
};
