'use client';

import { FunnelIcon, HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { useCollections } from '@/hooks/use-collections';
import { useTags } from '@/hooks/use-tags';
import { Tag } from '@bookmark-hero/types';

interface FilterBarProps {
  filters: {
    collectionId?: string;
    tagIds: string[];
    isFavorite?: boolean;
    isArchived: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const { data: collectionsData } = useCollections();
  const { data: tagsData } = useTags();

  const collections = collectionsData?.collections || [];
  const tags = tagsData?.tags || [];

  const hasActiveFilters = filters.collectionId || filters.tagIds.length > 0 || filters.isFavorite !== undefined;

  const toggleFavoriteFilter = () => {
    onFiltersChange({
      ...filters,
      isFavorite: filters.isFavorite ? undefined : true,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      collectionId: undefined,
      tagIds: [],
      isFavorite: undefined,
      isArchived: filters.isArchived,
    });
  };

  const selectedCollection = filters.collectionId 
    ? collections.find(c => c.id === filters.collectionId)
    : null;

  const selectedTags = filters.tagIds
    .map(id => tags.find(t => t.id === id))
    .filter((tag): tag is Tag => tag !== undefined);

  if (!hasActiveFilters) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleFavoriteFilter}
          className={cn(
            'inline-flex items-center px-3 py-1.5 rounded-md text-sm border transition-colors',
            'border-border hover:bg-accent'
          )}
        >
          <HeartIcon className="w-4 h-4 mr-2" />
          Favorites
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 flex-wrap">
      <FunnelIcon className="w-4 h-4 text-muted-foreground" />
      
      {/* Favorite filter */}
      {filters.isFavorite && (
        <div className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm border border-primary/20">
          <HeartSolidIcon className="w-4 h-4 mr-2" />
          Favorites
          <button
            onClick={toggleFavoriteFilter}
            className="ml-2 hover:bg-primary/20 rounded"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Collection filter */}
      {selectedCollection && (
        <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
          {selectedCollection.name}
          <button
            onClick={() => onFiltersChange({ ...filters, collectionId: undefined })}
            className="ml-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Tag filters */}
      {selectedTags.map((tag) => (
        <div
          key={tag.id}
          className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
        >
          {tag.name}
          <button
            onClick={() => onFiltersChange({
              ...filters,
              tagIds: filters.tagIds.filter(id => id !== tag.id)
            })}
            className="ml-2 hover:bg-green-100 dark:hover:bg-green-800 rounded"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* Clear all */}
      <button
        onClick={clearFilters}
        className="text-sm text-muted-foreground hover:text-foreground underline"
      >
        Clear all
      </button>
    </div>
  );
}