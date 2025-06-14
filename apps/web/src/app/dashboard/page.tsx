'use client';

import { BookmarkList } from '@/components/bookmarks/bookmark-list';
import { AddBookmarkButton } from '@/components/bookmarks/add-bookmark-button';
import { SearchBar } from '@/components/ui/search-bar';
import { ViewToggle } from '@/components/ui/view-toggle';
import { FilterBar } from '@/components/bookmarks/filter-bar';
import { useState } from 'react';

export default function DashboardPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    collectionId: undefined as string | undefined,
    tagIds: [] as string[],
    isFavorite: undefined as boolean | undefined,
    isArchived: false,
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Bookmarks</h1>
          <p className="text-muted-foreground">
            Organize and manage your saved links
          </p>
        </div>
        <AddBookmarkButton />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search bookmarks..."
          />
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {/* Bookmark List */}
      <BookmarkList
        view={view}
        searchQuery={searchQuery}
        filters={filters}
      />
    </div>
  );
}