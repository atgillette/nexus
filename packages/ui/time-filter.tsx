'use client';

import { cn } from './utils';

interface TimeFilter {
  id: string;
  label: string;
  value: string;
}

const timeFilters: TimeFilter[] = [
  { id: 'last-7', label: 'Last 7 days', value: 'last-7' },
  { id: 'last-30', label: 'Last 30 days', value: 'last-30' },
  { id: 'mtd', label: 'MTD', value: 'mtd' },
  { id: 'qtd', label: 'QTD', value: 'qtd' },
  { id: 'ytd', label: 'YTD', value: 'ytd' },
  { id: 'itd', label: 'ITD', value: 'itd' },
];

interface TimeFilterProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export function TimeFilter({ selectedFilter, onFilterChange }: TimeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {timeFilters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.value)}
          className={cn(
            'px-4 py-2 text-sm rounded-md transition-colors',
            selectedFilter === filter.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-foreground border border-border hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}