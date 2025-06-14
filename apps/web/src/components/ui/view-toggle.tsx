'use client';

import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex bg-muted rounded-md p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={cn(
          'p-2 rounded transition-colors',
          view === 'grid'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="Grid view"
      >
        <Squares2X2Icon className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={cn(
          'p-2 rounded transition-colors',
          view === 'list'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        title="List view"
      >
        <ListBulletIcon className="w-4 h-4" />
      </button>
    </div>
  );
}