import { api } from './api';
import { Collection, Bookmark, PaginatedResponse } from '@bookmark-hero/types';

export const collectionService = {
  async getCollections() {
    const response = await api.get<{ collections: Collection[] }>('/collections');
    return response.data;
  },

  async getCollection(id: string) {
    const response = await api.get<{ collection: Collection }>(`/collections/${id}`);
    return response.data;
  },

  async createCollection(data: {
    name: string;
    description?: string;
    color?: string;
    parentId?: string;
    isPublic?: boolean;
  }) {
    const response = await api.post<{ collection: Collection }>('/collections', data);
    return response.data;
  },

  async updateCollection(id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    parentId?: string;
    isPublic?: boolean;
  }) {
    const response = await api.put<{ collection: Collection }>(`/collections/${id}`, data);
    return response.data;
  },

  async deleteCollection(id: string) {
    const response = await api.delete(`/collections/${id}`);
    return response.data;
  },

  async getCollectionBookmarks(id: string, params?: { page?: number; limit?: number }) {
    const response = await api.get<PaginatedResponse<Bookmark>>(`/collections/${id}/bookmarks`, {
      params
    });
    return response.data;
  }
};