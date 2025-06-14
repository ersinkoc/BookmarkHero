import { z } from 'zod';
import { 
  registerSchema, 
  loginSchema, 
  createBookmarkSchema,
  createCollectionSchema,
  createTagSchema,
  extractMetadataSchema
} from '../validators';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123!'
        }
      };

      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it('should reject weak passwords', () => {
      const invalidData = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'weak'
        }
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid email formats', () => {
      const invalidData = {
        body: {
          name: 'John Doe',
          email: 'invalid-email',
          password: 'Password123!'
        }
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should normalize email to lowercase', () => {
      const data = {
        body: {
          name: 'John Doe',
          email: 'JOHN@EXAMPLE.COM',
          password: 'Password123!'
        }
      };

      const result = registerSchema.parse(data);
      expect(result.body.email).toBe('john@example.com');
    });
  });

  describe('createBookmarkSchema', () => {
    it('should validate correct bookmark data', () => {
      const validData = {
        body: {
          url: 'https://example.com',
          title: 'Example Site',
          description: 'A test website',
          collectionIds: ['cuid1', 'cuid2'],
          tagIds: ['tag1', 'tag2']
        }
      };

      expect(() => createBookmarkSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid URLs', () => {
      const invalidData = {
        body: {
          url: 'not-a-url',
          title: 'Test'
        }
      };

      expect(() => createBookmarkSchema.parse(invalidData)).toThrow();
    });

    it('should limit collection and tag arrays', () => {
      const invalidData = {
        body: {
          url: 'https://example.com',
          collectionIds: new Array(51).fill('cuid') // Too many collections
        }
      };

      expect(() => createBookmarkSchema.parse(invalidData)).toThrow();
    });
  });

  describe('createCollectionSchema', () => {
    it('should validate correct collection data', () => {
      const validData = {
        body: {
          name: 'My Collection',
          description: 'A test collection',
          color: '#FF5733',
          icon: 'folder'
        }
      };

      expect(() => createCollectionSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid color formats', () => {
      const invalidData = {
        body: {
          name: 'My Collection',
          color: 'red' // Should be hex format
        }
      };

      expect(() => createCollectionSchema.parse(invalidData)).toThrow();
    });

    it('should reject names that are too long', () => {
      const invalidData = {
        body: {
          name: 'a'.repeat(101) // Too long
        }
      };

      expect(() => createCollectionSchema.parse(invalidData)).toThrow();
    });
  });

  describe('createTagSchema', () => {
    it('should validate correct tag data', () => {
      const validData = {
        body: {
          name: 'development',
          color: '#10B981'
        }
      };

      expect(() => createTagSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid tag names', () => {
      const invalidData = {
        body: {
          name: 'invalid tag name!' // Contains invalid characters
        }
      };

      expect(() => createTagSchema.parse(invalidData)).toThrow();
    });

    it('should accept valid tag characters', () => {
      const validData = {
        body: {
          name: 'valid-tag_name123'
        }
      };

      expect(() => createTagSchema.parse(validData)).not.toThrow();
    });
  });

  describe('extractMetadataSchema', () => {
    it('should validate safe URLs', () => {
      const validData = {
        body: {
          url: 'https://example.com'
        }
      };

      expect(() => extractMetadataSchema.parse(validData)).not.toThrow();
    });

    it('should reject localhost URLs', () => {
      const invalidData = {
        body: {
          url: 'http://localhost:3000'
        }
      };

      expect(() => extractMetadataSchema.parse(invalidData)).toThrow();
    });

    it('should reject internal IP addresses', () => {
      const invalidData = {
        body: {
          url: 'http://192.168.1.1'
        }
      };

      expect(() => extractMetadataSchema.parse(invalidData)).toThrow();
    });

    it('should reject file:// URLs', () => {
      const invalidData = {
        body: {
          url: 'file:///etc/passwd'
        }
      };

      expect(() => extractMetadataSchema.parse(invalidData)).toThrow();
    });
  });
});