import request from 'supertest';
import express from 'express';
import { authRoutes } from '../routes/auth';
import { bookmarkRoutes } from '../routes/bookmarks';
import { errorHandler } from '../middleware/errorHandler';
import { validateEnv } from '../config/security';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use(errorHandler);

// Test data
let accessToken: string;
let userId: string;

beforeAll(() => {
  validateEnv();
});

beforeEach(async () => {
  // Create a test user and get access token
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Bookmark Test User',
      email: 'bookmark@example.com',
      password: 'Test123!Pass'
    });
  
  accessToken = response.body.data.tokens.accessToken;
  userId = response.body.data.user.id;
});

describe('Bookmark Endpoints', () => {
  describe('POST /api/bookmarks', () => {
    it('should create a new bookmark', async () => {
      const response = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          url: 'https://example.com',
          title: 'Example Website',
          description: 'A test bookmark'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bookmark).toHaveProperty('id');
      expect(response.body.data.bookmark.url).toBe('https://example.com');
      expect(response.body.data.bookmark.title).toBe('Example Website');
    });

    it('should not create duplicate bookmarks', async () => {
      const bookmarkData = {
        url: 'https://duplicate.com',
        title: 'Duplicate Test',
        description: 'A duplicate bookmark'
      };

      // First bookmark
      await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bookmarkData);

      // Duplicate bookmark
      const response = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(bookmarkData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Bookmark already exists');
    });

    it('should validate URL format', async () => {
      const response = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          url: 'invalid-url',
          title: 'Invalid URL Test'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/bookmarks')
        .send({
          url: 'https://example.com',
          title: 'No Auth Test'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookmarks', () => {
    beforeEach(async () => {
      // Create some test bookmarks
      const bookmarks = [
        { url: 'https://example1.com', title: 'Example 1' },
        { url: 'https://example2.com', title: 'Example 2' },
        { url: 'https://example3.com', title: 'Example 3' }
      ];

      for (const bookmark of bookmarks) {
        await request(app)
          .post('/api/bookmarks')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(bookmark);
      }
    });

    it('should get user bookmarks', async () => {
      const response = await request(app)
        .get('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bookmarks).toHaveLength(3);
      expect(response.body.data.total).toBe(3);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/bookmarks?page=1&limit=2')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bookmarks).toHaveLength(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
      expect(response.body.data.totalPages).toBe(2);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/bookmarks');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookmarks/search', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          url: 'https://github.com',
          title: 'GitHub',
          description: 'Code repository hosting'
        });
    });

    it('should search bookmarks by title', async () => {
      const response = await request(app)
        .get('/api/bookmarks/search?q=GitHub')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bookmarks).toHaveLength(1);
      expect(response.body.data.bookmarks[0].title).toBe('GitHub');
    });

    it('should return empty results for no matches', async () => {
      const response = await request(app)
        .get('/api/bookmarks/search?q=nonexistent')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bookmarks).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });

    it('should require search query', async () => {
      const response = await request(app)
        .get('/api/bookmarks/search')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/bookmarks/:id', () => {
    let bookmarkId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          url: 'https://update.com',
          title: 'Original Title',
          description: 'Original description'
        });
      
      bookmarkId = response.body.data.bookmark.id;
    });

    it('should update bookmark', async () => {
      const response = await request(app)
        .put(`/api/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description',
          isFavorite: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bookmark.title).toBe('Updated Title');
      expect(response.body.data.bookmark.isFavorite).toBe(true);
    });

    it('should not update non-existent bookmark', async () => {
      const response = await request(app)
        .put('/api/bookmarks/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Title'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/bookmarks/:id', () => {
    let bookmarkId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/bookmarks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          url: 'https://delete.com',
          title: 'To Delete',
          description: 'Will be deleted'
        });
      
      bookmarkId = response.body.data.bookmark.id;
    });

    it('should delete bookmark', async () => {
      const response = await request(app)
        .delete(`/api/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Bookmark deleted successfully');
    });

    it('should not delete non-existent bookmark', async () => {
      const response = await request(app)
        .delete('/api/bookmarks/nonexistent-id')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});