import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { extractMetadata as extractMetadataService } from '../services/metadataService';
import { sanitizeText, sanitizeHtml } from '../utils/sanitizer';
import { AppError, ConflictError, NotFoundError, ValidationError } from '../utils/errors';

export async function createBookmark(req: AuthRequest, res: Response) {
  try {
    const { url, title, description, collectionIds = [], tagIds = [] } = req.body;
    const userId = req.user!.id;

    const existingBookmark = await prisma.bookmark.findFirst({
      where: { userId, url }
    });

    if (existingBookmark) {
      throw new ConflictError('Bookmark already exists');
    }

    let metadata = {};
    try {
      metadata = await extractMetadataService(url);
    } catch (error) {
      logger.warn('Failed to extract metadata:', error);
    }

    const domain = new URL(url).hostname;

    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        url,
        title: sanitizeText(title || (metadata as any).title || url),
        description: sanitizeText(description || (metadata as any).description || ''),
        favicon: (metadata as any).favicon,
        previewImage: (metadata as any).previewImage,
        readingTime: (metadata as any).readingTime,
        domain,
        collections: {
          create: collectionIds.map((collectionId: string) => ({
            collection: { connect: { id: collectionId } }
          }))
        },
        tags: {
          create: tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } }
          }))
        }
      },
      include: {
        collections: {
          include: { collection: true }
        },
        tags: {
          include: { tag: true }
        }
      }
    });

    const io = req.app.get('io');
    io.to(`user:${userId}`).emit('bookmark:created', bookmark);

    res.status(201).json({
      success: true,
      data: { bookmark }
    });
  } catch (error) {
    logger.error('Create bookmark error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bookmark'
    });
  }
}

export async function getBookmarks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 20,
      search,
      collectionId,
      tagIds,
      isFavorite,
      isArchived,
      domain,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { url: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (collectionId) {
      where.collections = {
        some: { collectionId: collectionId as string }
      };
    }

    if (tagIds) {
      const tagIdsArray = Array.isArray(tagIds) ? tagIds : [tagIds];
      where.tags = {
        some: { tagId: { in: tagIdsArray } }
      };
    }

    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite === 'true';
    }

    if (isArchived !== undefined) {
      where.isArchived = isArchived === 'true';
    }

    if (domain) {
      where.domain = domain;
    }

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        include: {
          collections: {
            include: { collection: true }
          },
          tags: {
            include: { tag: true }
          }
        },
        orderBy: { [sortBy as string]: sortOrder },
        skip,
        take: Number(limit)
      }),
      prisma.bookmark.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        bookmarks,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bookmarks'
    });
  }
}

export async function getBookmark(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const bookmark = await prisma.bookmark.findFirst({
      where: { id, userId },
      include: {
        collections: {
          include: { collection: true }
        },
        tags: {
          include: { tag: true }
        }
      }
    });

    if (!bookmark) {
      throw new NotFoundError('Bookmark');
    }

    res.json({
      success: true,
      data: { bookmark }
    });
  } catch (error) {
    logger.error('Get bookmark error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bookmark'
    });
  }
}

export async function updateBookmark(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { title, description, collectionIds, tagIds, isFavorite, isArchived } = req.body;

    const existingBookmark = await prisma.bookmark.findFirst({
      where: { id, userId }
    });

    if (!existingBookmark) {
      throw new NotFoundError('Bookmark');
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = sanitizeText(title);
    if (description !== undefined) updateData.description = sanitizeText(description);
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const bookmark = await prisma.$transaction(async (tx) => {
      if (collectionIds) {
        await tx.bookmarkCollection.deleteMany({
          where: { bookmarkId: id }
        });
        
        if (collectionIds.length > 0) {
          await tx.bookmarkCollection.createMany({
            data: collectionIds.map((collectionId: string) => ({
              bookmarkId: id,
              collectionId
            }))
          });
        }
      }

      if (tagIds) {
        await tx.bookmarkTag.deleteMany({
          where: { bookmarkId: id }
        });
        
        if (tagIds.length > 0) {
          await tx.bookmarkTag.createMany({
            data: tagIds.map((tagId: string) => ({
              bookmarkId: id,
              tagId
            }))
          });
        }
      }

      return await tx.bookmark.update({
        where: { id },
        data: updateData,
        include: {
          collections: {
            include: { collection: true }
          },
          tags: {
            include: { tag: true }
          }
        }
      });
    });

    const io = req.app.get('io');
    io.to(`user:${userId}`).emit('bookmark:updated', bookmark);

    res.json({
      success: true,
      data: { bookmark }
    });
  } catch (error) {
    logger.error('Update bookmark error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update bookmark'
    });
  }
}

export async function deleteBookmark(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const bookmark = await prisma.bookmark.findFirst({
      where: { id, userId }
    });

    if (!bookmark) {
      throw new NotFoundError('Bookmark');
    }

    await prisma.bookmark.delete({
      where: { id }
    });

    const io = req.app.get('io');
    io.to(`user:${userId}`).emit('bookmark:deleted', { id });

    res.json({
      success: true,
      message: 'Bookmark deleted successfully'
    });
  } catch (error) {
    logger.error('Delete bookmark error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete bookmark'
    });
  }
}

export async function searchBookmarks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { q: query, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      userId,
      OR: [
        { title: { contains: query as string, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: query as string, mode: Prisma.QueryMode.insensitive } },
        { url: { contains: query as string, mode: Prisma.QueryMode.insensitive } },
        { content: { contains: query as string, mode: Prisma.QueryMode.insensitive } }
      ]
    };

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        include: {
          collections: {
            include: { collection: true }
          },
          tags: {
            include: { tag: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.bookmark.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        bookmarks,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Search bookmarks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search bookmarks'
    });
  }
}

export async function bulkImport(req: AuthRequest, res: Response) {
  try {
    const { bookmarks } = req.body;
    const userId = req.user!.id;

    if (!Array.isArray(bookmarks)) {
      return res.status(400).json({
        success: false,
        error: 'Bookmarks must be an array'
      });
    }

    const results = [];
    
    for (const bookmarkData of bookmarks) {
      try {
        const { url, title, description } = bookmarkData;
        
        const existingBookmark = await prisma.bookmark.findFirst({
          where: { userId, url }
        });

        if (existingBookmark) {
          results.push({ url, status: 'skipped', reason: 'already exists' });
          continue;
        }

        const domain = new URL(url).hostname;

        const bookmark = await prisma.bookmark.create({
          data: {
            userId,
            url,
            title: sanitizeText(title || url),
            description: sanitizeText(description || ''),
            domain
          }
        });

        results.push({ url, status: 'imported', id: bookmark.id });
      } catch (error) {
        results.push({ url: bookmarkData.url, status: 'failed', error: (error as Error).message });
      }
    }

    res.json({
      success: true,
      data: {
        total: bookmarks.length,
        imported: results.filter(r => r.status === 'imported').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        failed: results.filter(r => r.status === 'failed').length,
        results
      }
    });
  } catch (error) {
    logger.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import bookmarks'
    });
  }
}

export async function extractMetadata(req: AuthRequest, res: Response) {
  try {
    const { url } = req.body;
    
    // Extract metadata using the service
    const metadata = await extractMetadataService(url);
    
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    logger.error('Extract metadata error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract metadata'
    });
  }
}