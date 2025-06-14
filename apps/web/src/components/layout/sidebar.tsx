'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookmarkIcon,
  FolderIcon,
  TagIcon,
  HeartIcon,
  ArchiveBoxIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useCollections } from '@/hooks/use-collections';
import { useTags } from '@/hooks/use-tags';
import { cn } from '@/lib/utils';
import { Collection } from '@bookmark-hero/types';
import { CreateCollectionModal } from '@/components/collections/create-collection-modal';

export function Sidebar() {
  const pathname = usePathname();
  const { data: collectionsData } = useCollections();
  const { data: tagsData } = useTags();
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  const collections = collectionsData?.collections || [];
  const tags = tagsData?.tags || [];

  const toggleCollection = (id: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCollections(newExpanded);
  };

  const renderCollection = (collection: Collection, depth = 0) => {
    const hasChildren = collection.children && collection.children.length > 0;
    const isExpanded = expandedCollections.has(collection.id);
    const isActive = pathname === `/dashboard/collections/${collection.id}`;

    return (
      <div key={collection.id}>
        <Link
          href={`/dashboard/collections/${collection.id}`}
          className={cn(
            'sidebar-item group',
            isActive && 'active',
            'flex items-center justify-between'
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <div className="flex items-center min-w-0">
            <FolderIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{collection.name}</span>
            {collection._count?.bookmarks !== undefined && (
              <span className="ml-2 text-xs text-muted-foreground">
                {collection._count.bookmarks}
              </span>
            )}
          </div>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleCollection(collection.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
            </button>
          )}
        </Link>
        {hasChildren && isExpanded && (
          <div>
            {collection.children!.map((child) => renderCollection(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">BookmarkHero</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="p-3">
            <div className="space-y-1">
              <Link
                href="/dashboard"
                className={cn('sidebar-item', pathname === '/dashboard' && 'active')}
              >
                <BookmarkIcon className="w-4 h-4 mr-2" />
                All Bookmarks
              </Link>
              <Link
                href="/dashboard/favorites"
                className={cn('sidebar-item', pathname === '/dashboard/favorites' && 'active')}
              >
                <HeartIcon className="w-4 h-4 mr-2" />
                Favorites
              </Link>
              <Link
                href="/dashboard/archive"
                className={cn('sidebar-item', pathname === '/dashboard/archive' && 'active')}
              >
                <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                Archive
              </Link>
            </div>
          </div>

          {/* Collections */}
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Collections
              </h3>
              <button
                onClick={() => setIsCreateCollectionOpen(true)}
                className="p-1 hover:bg-accent rounded"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {collections.map((collection) => renderCollection(collection))}
            </div>
          </div>

          {/* Tags */}
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Tags
              </h3>
            </div>
            <div className="space-y-1">
              {tags.slice(0, 10).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/dashboard/tags/${tag.id}`}
                  className={cn(
                    'sidebar-item',
                    pathname === `/dashboard/tags/${tag.id}` && 'active'
                  )}
                >
                  <TagIcon className="w-4 h-4 mr-2" />
                  <span className="truncate">{tag.name}</span>
                  {tag._count?.bookmarks !== undefined && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {tag._count.bookmarks}
                    </span>
                  )}
                </Link>
              ))}
              {tags.length > 10 && (
                <Link
                  href="/dashboard/tags"
                  className="sidebar-item text-muted-foreground"
                >
                  <span className="ml-6 text-sm">View all tags...</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateCollectionModal
        isOpen={isCreateCollectionOpen}
        onClose={() => setIsCreateCollectionOpen(false)}
      />
    </>
  );
}