import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function createCollection(req: AuthRequest, res: Response) {
  try {
    const { name, description, color, parentId, isPublic = false } = req.body;
    const userId = req.user!.id;

    if (parentId) {
      const parentCollection = await prisma.collection.findFirst({
        where: { id: parentId, userId }
      });

      if (!parentCollection) {
        return res.status(404).json({
          success: false,
          error: 'Parent collection not found'
        });
      }
    }

    const collection = await prisma.collection.create({
      data: {
        userId,
        name,
        description,
        color,
        parentId,
        isPublic
      },
      include: {
        children: true,
        _count: {
          select: { bookmarks: true }
        }
      }
    });

    const io = req.app.get('io');
    io.to(`user:${userId}`).emit('collection:created', collection);

    res.status(201).json({
      success: true,
      data: { collection }
    });
  } catch (error) {
    logger.error('Create collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create collection'
    });
  }
}

export async function getCollections(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const collections = await prisma.collection.findMany({
      where: { userId },
      include: {
        children: {
          include: {
            _count: {
              select: { bookmarks: true }
            }
          }
        },
        _count: {
          select: { bookmarks: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const buildHierarchy = (collections: any[], parentId: string | null = null): any[] => {
      return collections
        .filter(collection => collection.parentId === parentId)
        .map(collection => ({
          ...collection,
          children: buildHierarchy(collections, collection.id)
        }));
    };

    const hierarchicalCollections = buildHierarchy(collections);

    res.json({
      success: true,
      data: { collections: hierarchicalCollections }
    });
  } catch (error) {
    logger.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get collections'
    });
  }
}

export async function getCollection(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const collection = await prisma.collection.findFirst({
      where: { id, userId },
      include: {
        children: true,
        parent: true,
        _count: {
          select: { bookmarks: true }
        }
      }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    res.json({
      success: true,
      data: { collection }
    });
  } catch (error) {
    logger.error('Get collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get collection'
    });
  }
}

export async function getCollectionBookmarks(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const collection = await prisma.collection.findFirst({
      where: { id, userId }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: {
          userId,
          collections: {
            some: { collectionId: id }
          }
        },
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
      prisma.bookmark.count({
        where: {
          userId,
          collections: {
            some: { collectionId: id }
          }
        }
      })
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
    logger.error('Get collection bookmarks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get collection bookmarks'
    });
  }
}

export async function updateCollection(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { name, description, color, parentId, isPublic } = req.body;

    const existingCollection = await prisma.collection.findFirst({
      where: { id, userId }
    });

    if (!existingCollection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    if (parentId && parentId !== existingCollection.parentId) {
      const parentCollection = await prisma.collection.findFirst({
        where: { id: parentId, userId }
      });

      if (!parentCollection) {
        return res.status(404).json({
          success: false,
          error: 'Parent collection not found'
        });
      }

      if (parentId === id) {
        return res.status(400).json({
          success: false,
          error: 'Collection cannot be its own parent'
        });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const collection = await prisma.collection.update({
      where: { id },
      data: updateData,
      include: {
        children: true,
        parent: true,
        _count: {
          select: { bookmarks: true }
        }
      }
    });

    const io = req.app.get('io');
    io.to(`user:${userId}`).emit('collection:updated', collection);

    res.json({
      success: true,
      data: { collection }
    });
  } catch (error) {
    logger.error('Update collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update collection'
    });
  }
}

export async function deleteCollection(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const collection = await prisma.collection.findFirst({
      where: { id, userId },
      include: { children: true }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    if (collection.children.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete collection with child collections'
      });
    }

    await prisma.collection.delete({
      where: { id }
    });

    const io = req.app.get('io');
    io.to(`user:${userId}`).emit('collection:deleted', { id });

    res.json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    logger.error('Delete collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete collection'
    });
  }
}