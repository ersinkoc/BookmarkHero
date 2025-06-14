import { z } from 'zod';

// Common validators
const urlSchema = z.string().url().min(1).max(2048);
const titleSchema = z.string().min(1).max(255);
const descriptionSchema = z.string().max(1000).optional();
const idSchema = z.string().cuid();
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

// Auth validators
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Password must contain at least one uppercase letter, one lowercase letter, and one number')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1)
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1)
  })
});

export const requestEmailVerificationSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase()
  })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1)
  })
});

export const requestPasswordResetSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase()
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Password must contain at least one uppercase letter, one lowercase letter, and one number')
  })
});

// Bookmark validators
export const createBookmarkSchema = z.object({
  body: z.object({
    url: urlSchema,
    title: titleSchema.optional(),
    description: descriptionSchema,
    collectionIds: z.array(idSchema).max(50).optional(),
    tagIds: z.array(idSchema).max(50).optional(),
    isFavorite: z.boolean().optional()
  })
});

export const updateBookmarkSchema = z.object({
  params: z.object({
    id: idSchema
  }),
  body: z.object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    collectionIds: z.array(idSchema).max(50).optional(),
    tagIds: z.array(idSchema).max(50).optional(),
    isFavorite: z.boolean().optional(),
    isArchived: z.boolean().optional()
  })
});

export const bulkImportSchema = z.object({
  body: z.object({
    bookmarks: z.array(z.object({
      url: urlSchema,
      title: titleSchema.optional(),
      description: descriptionSchema,
      tags: z.array(z.string().max(50)).max(20).optional()
    })).min(1).max(1000) // Limit bulk import to 1000 items
  })
});

export const searchBookmarksSchema = z.object({
  query: z.object({
    q: z.string().min(1).max(100),
    ...paginationSchema.shape
  })
});

export const getBookmarksSchema = z.object({
  query: z.object({
    collectionId: idSchema.optional(),
    tagId: idSchema.optional(),
    isFavorite: z.coerce.boolean().optional(),
    isArchived: z.coerce.boolean().optional(),
    ...paginationSchema.shape
  })
});

// Collection validators
export const createCollectionSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: descriptionSchema,
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    icon: z.string().max(50).optional(),
    isPublic: z.boolean().optional()
  })
});

export const updateCollectionSchema = z.object({
  params: z.object({
    id: idSchema
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: descriptionSchema,
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    icon: z.string().max(50).optional(),
    isPublic: z.boolean().optional()
  })
});

// Tag validators
export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Tag name can only contain letters, numbers, hyphens and underscores'),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
  })
});

export const updateTagSchema = z.object({
  params: z.object({
    id: idSchema
  }),
  body: z.object({
    name: z.string().min(1).max(50)
      .regex(/^[a-zA-Z0-9-_]+$/, 'Tag name can only contain letters, numbers, hyphens and underscores')
      .optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
  })
});

// Share validators
export const shareCollectionSchema = z.object({
  params: z.object({
    id: idSchema
  })
});

// Common param validators
export const idParamSchema = z.object({
  params: z.object({
    id: idSchema
  })
});

export const shareTokenParamSchema = z.object({
  params: z.object({
    shareToken: z.string().min(1)
  })
});

// Extract metadata validator with URL validation
export const extractMetadataSchema = z.object({
  body: z.object({
    url: urlSchema.refine((url) => {
      // Block internal URLs to prevent SSRF
      const blockedPatterns = [
        /^https?:\/\/localhost/i,
        /^https?:\/\/127\./,
        /^https?:\/\/10\./,
        /^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^https?:\/\/192\.168\./,
        /^https?:\/\/\[::1\]/,
        /^https?:\/\/\[fc00::/,
        /^https?:\/\/\[fe80::/,
        /^file:\/\//i,
        /^ftp:\/\//i
      ];
      
      return !blockedPatterns.some(pattern => pattern.test(url));
    }, 'URL points to internal or restricted resource')
  })
});