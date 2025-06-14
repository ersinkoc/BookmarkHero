import { api } from './api';
import { Tag } from '@bookmark-hero/types';

export const tagService = {
  async getTags() {
    const response = await api.get<{ tags: Tag[] }>('/tags');
    return response.data;
  },

  async createTag(data: { name: string; color?: string }) {
    const response = await api.post<{ tag: Tag }>('/tags', data);
    return response.data;
  },

  async updateTag(id: string, data: { name?: string; color?: string }) {
    const response = await api.put<{ tag: Tag }>(`/tags/${id}`, data);
    return response.data;
  },

  async deleteTag(id: string) {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  }
};