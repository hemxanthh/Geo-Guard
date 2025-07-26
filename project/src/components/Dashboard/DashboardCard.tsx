import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

const colorMap = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    text: 'text-blue-600',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
  },
  green: {
    bg: 'from-green-500 to-green-600',
    text: 'text-green-600',
    bgLight: 'bg-green-50',
    border: 'border-green-200',
  },
  yellow: {
    bg: 'from-yellow-500 to-yellow-600',
    text: 'text-yellow-600',
    bgLight: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  red: {
    bg: 'from-red-500 to-red-600',
    text: 'text-red-600',
    bgLight: 'bg-red-50',
    border: 'border-red-200',
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    text: 'text-purple-600',
    bgLight: 'bg-purple-50',
    border: 'border-purple-200',
  },
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  loading = false,
}) => {
  const colors = colorMap[color];

  return (
    <div className={clsx(
      'bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200',
      'hover:shadow-md hover:-translate-y-1',
      colors.border
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={clsx(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          colors.bgLight
        )}>
          <Icon className={clsx('w-6 h-6', colors.text)} />
        </div>
        {trend && (
          <div className={clsx(
            'px-2 py-1 rounded-full text-xs font-medium',
            trend.isPositive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            <p className="text-gray-600 font-medium">{title}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;