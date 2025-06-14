'use client';

import { useState } from 'react';
import { Bookmark } from '@bookmark-hero/types';
import { 
  HeartIcon, 
  ArchiveBoxIcon, 
  PencilIcon, 
  TrashIcon,
  ClockIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { cn, formatRelativeTime, extractDomain } from '@/lib/utils';
import { useUpdateBookmark, useDeleteBookmark } from '@/hooks/use-bookmarks';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface BookmarkCardProps {
  bookmark: Bookmark;
  view: 'grid' | 'list';
}

export function BookmarkCard({ bookmark, view }: BookmarkCardProps) {
  const updateBookmark = useUpdateBookmark();
  const deleteBookmark = useDeleteBookmark();
  const [imageError, setImageError] = useState(false);

  const handleToggleFavorite = () => {
    updateBookmark.mutate({
      id: bookmark.id,
      data: { isFavorite: !bookmark.isFavorite }
    });
  };

  const handleToggleArchive = () => {
    updateBookmark.mutate({
      id: bookmark.id,
      data: { isArchived: !bookmark.isArchived }
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      deleteBookmark.mutate(bookmark.id);
    }
  };

  const handleCardClick = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const domain = extractDomain(bookmark.url);
  const previewImage = !imageError && (bookmark.previewImage || bookmark.screenshot);

  if (view === 'list') {
    return (
      <div className="bookmark-card group cursor-pointer" onClick={handleCardClick}>
        <div className="flex items-start space-x-4">
          {/* Favicon */}
          <div className="flex-shrink-0 mt-1">
            {bookmark.favicon ? (
              <img
                src={bookmark.favicon}
                alt=""
                className="w-4 h-4"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-4 h-4 bg-muted rounded-sm" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate group-hover:text-primary">
                  {bookmark.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {bookmark.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                  <span>{domain}</span>
                  <span className="flex items-center">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {formatRelativeTime(bookmark.createdAt)}
                  </span>
                  {bookmark.readingTime && (
                    <span>{bookmark.readingTime} min read</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite();
                  }}
                  className="p-1 hover:bg-accent rounded"
                >
                  {bookmark.isFavorite ? (
                    <HeartSolidIcon className="w-4 h-4 text-red-500" />
                  ) : (
                    <HeartIcon className="w-4 h-4" />
                  )}
                </button>
                <Menu as="div" className="relative">
                  <Menu.Button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 hover:bg-accent rounded"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleToggleArchive}
                              className={cn(
                                'flex items-center w-full px-4 py-2 text-sm',
                                active ? 'bg-accent' : 'text-foreground'
                              )}
                            >
                              <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                              {bookmark.isArchived ? 'Unarchive' : 'Archive'}
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleDelete}
                              className={cn(
                                'flex items-center w-full px-4 py-2 text-sm text-red-600',
                                active ? 'bg-accent' : ''
                              )}
                            >
                              <TrashIcon className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>

            {/* Tags */}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex items-center flex-wrap gap-1 mt-2">
                {bookmark.tags.map((tagRelation: any) => (
                  <span
                    key={tagRelation.tag.id}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground"
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tagRelation.tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bookmark-card group cursor-pointer" onClick={handleCardClick}>
      {/* Preview Image */}
      {previewImage && (
        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
          <img
            src={previewImage}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {bookmark.favicon && (
              <img
                src={bookmark.favicon}
                alt=""
                className="w-4 h-4 flex-shrink-0"
                onError={() => setImageError(true)}
              />
            )}
            <span className="text-xs text-muted-foreground truncate">{domain}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
          >
            {bookmark.isFavorite ? (
              <HeartSolidIcon className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Title and Description */}
        <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary">
          {bookmark.title}
        </h3>
        {bookmark.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {bookmark.description}
          </p>
        )}

        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-1 mb-3">
            {bookmark.tags.slice(0, 3).map((tagRelation: any) => (
              <span
                key={tagRelation.tag.id}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tagRelation.tag.name}
              </span>
            ))}
            {bookmark.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{bookmark.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-3 h-3" />
            <span>{formatRelativeTime(bookmark.createdAt)}</span>
          </div>
          {bookmark.readingTime && (
            <span>{bookmark.readingTime} min read</span>
          )}
        </div>

        {/* Actions Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
          <Menu as="div" className="relative">
            <Menu.Button
              onClick={(e) => e.stopPropagation()}
              className="p-1 bg-background/80 backdrop-blur-sm hover:bg-accent rounded border border-border"
            >
              <PencilIcon className="w-4 h-4" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleToggleArchive}
                        className={cn(
                          'flex items-center w-full px-4 py-2 text-sm',
                          active ? 'bg-accent' : 'text-foreground'
                        )}
                      >
                        <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                        {bookmark.isArchived ? 'Unarchive' : 'Archive'}
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleDelete}
                        className={cn(
                          'flex items-center w-full px-4 py-2 text-sm text-red-600',
                          active ? 'bg-accent' : ''
                        )}
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}