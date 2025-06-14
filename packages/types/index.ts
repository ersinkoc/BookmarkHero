export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'grid' | 'list';
  itemsPerPage: number;
  autoSaveBookmarks: boolean;
  enableNotifications: boolean;
}

export interface Bookmark {
  id: string;
  userId: string;
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  previewImage?: string;
  screenshot?: string;
  content?: string;
  isArchived: boolean;
  isFavorite: boolean;
  readingTime?: number;
  collections: Collection[];
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Collection {
  id: string;
  userId: string;
  parentId?: string;
  name: string;
  description?: string;
  color?: string;
  isPublic: boolean;
  bookmarks?: Bookmark[];
  children?: Collection[];
  _count?: {
    bookmarks: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color?: string;
  _count?: {
    bookmarks: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Share {
  id: string;
  collectionId: string;
  sharedBy: string;
  permissions: 'read' | 'write';
  expiresAt?: Date;
  createdAt: Date;
}

export interface CreateBookmarkRequest {
  url: string;
  title?: string;
  description?: string;
  collectionIds?: string[];
  tagIds?: string[];
}

export interface UpdateBookmarkRequest {
  title?: string;
  description?: string;
  collectionIds?: string[];
  tagIds?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
}

export interface BookmarkFilters {
  search?: string;
  collectionId?: string;
  tagIds?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  domain?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'title' | 'url' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface WebsiteMetadata {
  title?: string;
  description?: string;
  favicon?: string;
  previewImage?: string;
  siteName?: string;
  readingTime?: number;
}