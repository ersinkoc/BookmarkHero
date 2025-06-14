'use client';

import { useMemo } from 'react';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { BookmarkCard } from './bookmark-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface BookmarkListProps {
  view: 'grid' | 'list';
  searchQuery: string;
  filters: {
    collectionId?: string;
    tagIds: string[];
    isFavorite?: boolean;
    isArchived: boolean;
  };
}

export function BookmarkList({ view, searchQuery, filters }: BookmarkListProps) {
  const queryParams = useMemo(() => {
    const params: any = {
      page: 1,
      limit: 20,
      isArchived: filters.isArchived,
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    if (filters.collectionId) {
      params.collectionId = filters.collectionId;
    }

    if (filters.tagIds.length > 0) {
      params.tagIds = filters.tagIds;
    }

    if (filters.isFavorite !== undefined) {
      params.isFavorite = filters.isFavorite;
    }

    return params;
  }, [searchQuery, filters]);

  const { data, isLoading, error } = useBookmarks(queryParams);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load bookmarks</p>
      </div>
    );
  }

  const bookmarks = data?.data || [];

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? 'No bookmarks found' : 'No bookmarks yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? `No bookmarks match "${searchQuery}". Try adjusting your search or filters.`
              : 'Get started by adding your first bookmark!'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {data?.total} bookmark{data?.total !== 1 ? 's' : ''} found
        </span>
        {searchQuery && (
          <span>Searching for "{searchQuery}"</span>
        )}
      </div>

      {/* Bookmark grid/list */}
      <div
        className={cn(
          view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
        )}
      >
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            view={view}
          />
        ))}
      </div>

      {/* Pagination would go here */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </p>
          {/* TODO: Add pagination controls */}
        </div>
      )}
    </div>
  );
}