'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarkService } from '@/services/bookmark-service';
import { CreateBookmarkRequest, UpdateBookmarkRequest } from '@bookmark-hero/types';
import toast from 'react-hot-toast';

export function useBookmarks(params?: {
  page?: number;
  limit?: number;
  search?: string;
  collectionId?: string;
  tagIds?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  domain?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['bookmarks', params],
    queryFn: () => bookmarkService.getBookmarks(params),
  });
}

export function useBookmark(id: string) {
  return useQuery({
    queryKey: ['bookmark', id],
    queryFn: () => bookmarkService.getBookmark(id),
    enabled: !!id,
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookmarkRequest) => bookmarkService.createBookmark(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Bookmark created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create bookmark');
    },
  });
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookmarkRequest }) =>
      bookmarkService.updateBookmark(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Bookmark updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update bookmark');
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookmarkService.deleteBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Bookmark deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete bookmark');
    },
  });
}

export function useSearchBookmarks(query: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['bookmarks', 'search', query, params],
    queryFn: () => bookmarkService.searchBookmarks(query, params),
    enabled: !!query.trim(),
  });
}