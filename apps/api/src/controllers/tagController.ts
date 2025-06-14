import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function createTag(req: AuthRequest, res: Response) {
  try {
    const { name, color } = req.body;
    const userId = req.user!.id;

    const existingTag = await prisma.tag.findFirst({
      where: { userId, name }
    });

    if (existingTag) {
      return res.status(409).json({
        success: false,
        error: 'Tag already exists'
      });
    }

    const tag = await prisma.tag.create({
      data: {
        userId,
        name,
        color
      }
    });

    res.status(201).json({
      success: true,
      data: { tag }
    });
  } catch (error) {
    logger.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create tag'
    });
  }
}

export async function getTags(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: { bookmarks: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    logger.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tags'
    });
  }
}

export async function updateTag(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { name, color } = req.body;

    const existingTag = await prisma.tag.findFirst({
      where: { id, userId }
    });

    if (!existingTag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    if (name && name !== existingTag.name) {
      const duplicateTag = await prisma.tag.findFirst({
        where: { userId, name, id: { not: id } }
      });

      if (duplicateTag) {
        return res.status(409).json({
          success: false,
          error: 'Tag name already exists'
        });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    const tag = await prisma.tag.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { bookmarks: true }
        }
      }
    });

    res.json({
      success: true,
      data: { tag }
    });
  } catch (error) {
    logger.error('Update tag error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tag'
    });
  }
}

export async function deleteTag(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const tag = await prisma.tag.findFirst({
      where: { id, userId }
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    await prisma.tag.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    logger.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete tag'
    });
  }
}