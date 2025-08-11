'use client';

import { cn } from './utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
      <div className="mb-2">
        <div className="flex items-center">
          <Skeleton className="h-4 w-24" />
          <div className="ml-2 flex items-center">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-8 ml-1" />
          </div>
        </div>
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs border-b border-gray-200 dark:border-gray-700">
              {Array.from({ length: 9 }).map((_, i) => (
                <th key={i} className="px-5 py-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                {Array.from({ length: 9 }).map((_, colIndex) => (
                  <td key={colIndex} className="px-5 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}