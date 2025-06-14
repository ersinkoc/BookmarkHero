import { api } from './api';
import { 
  Bookmark, 
  PaginatedResponse, 
  CreateBookmarkRequest, 
  UpdateBookmarkRequest,
  BookmarkFilters 
} from '@bookmark-hero/types';

export const bookmarkService = {
  async getBookmarks(params?: {
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
    const response = await api.get<PaginatedResponse<Bookmark>>('/bookmarks', {
      params
    });
    return response.data;
  },

  async getBookmark(id: string) {
    const response = await api.get<{ bookmark: Bookmark }>(`/bookmarks/${id}`);
    return response.data;
  },

  async createBookmark(data: CreateBookmarkRequest) {
    const response = await api.post<{ bookmark: Bookmark }>('/bookmarks', data);
    return response.data;
  },

  async updateBookmark(id: string, data: UpdateBookmarkRequest) {
    const response = await api.put<{ bookmark: Bookmark }>(`/bookmarks/${id}`, data);
    return response.data;
  },

  async deleteBookmark(id: string) {
    const response = await api.delete(`/bookmarks/${id}`);
    return response.data;
  },

  async searchBookmarks(query: string, params?: { page?: number; limit?: number }) {
    const response = await api.get<PaginatedResponse<Bookmark>>('/bookmarks/search', {
      params: { q: query, ...params }
    });
    return response.data;
  },

  async bulkImport(bookmarks: Array<{ url: string; title?: string; description?: string }>) {
    const response = await api.post('/bookmarks/bulk-import', { bookmarks });
    return response.data;
  }
};