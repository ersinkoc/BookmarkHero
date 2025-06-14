import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function createShare(req: AuthRequest, res: Response) {
  try {
    const { collectionId, permissions, expiresAt } = req.body;
    const userId = req.user!.id;

    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    if (!collection.isPublic) {
      await prisma.collection.update({
        where: { id: collectionId },
        data: { isPublic: true }
      });
    }

    const share = await prisma.share.create({
      data: {
        collectionId,
        sharedBy: userId,
        permissions,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: { share }
    });
  } catch (error) {
    logger.error('Create share error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create share'
    });
  }
}

export async function getShares(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const shares = await prisma.share.findMany({
      where: { sharedBy: userId },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            description: true,
            _count: {
              select: { bookmarks: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { shares }
    });
  } catch (error) {
    logger.error('Get shares error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get shares'
    });
  }
}

export async function getPublicCollection(req: AuthRequest, res: Response) {
  try {
    const { shareToken } = req.params;

    const share = await prisma.share.findUnique({
      where: { id: shareToken },
      include: {
        collection: {
          include: {
            bookmarks: {
              include: {
                bookmark: {
                  include: {
                    tags: {
                      include: { tag: true }
                    }
                  }
                }
              }
            },
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: 'Shared collection not found'
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'Shared collection has expired'
      });
    }

    const collection = {
      ...share.collection,
      bookmarks: share.collection.bookmarks.map(bc => bc.bookmark),
      shareInfo: {
        permissions: share.permissions,
        sharedBy: share.collection.user,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt
      }
    };

    res.json({
      success: true,
      data: { collection }
    });
  } catch (error) {
    logger.error('Get public collection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get public collection'
    });
  }
}

export async function deleteShare(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const share = await prisma.share.findFirst({
      where: { id, sharedBy: userId }
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: 'Share not found'
      });
    }

    await prisma.share.delete({
      where: { id }
    });

    const remainingShares = await prisma.share.count({
      where: { collectionId: share.collectionId }
    });

    if (remainingShares === 0) {
      await prisma.collection.update({
        where: { id: share.collectionId },
        data: { isPublic: false }
      });
    }

    res.json({
      success: true,
      message: 'Share deleted successfully'
    });
  } catch (error) {
    logger.error('Delete share error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete share'
    });
  }
}