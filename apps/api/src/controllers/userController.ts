import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { name, avatar } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        preferences: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
}

export async function updatePreferences(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { theme, defaultView, itemsPerPage, autoSaveBookmarks, enableNotifications } = req.body;

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const currentPreferences = currentUser.preferences as any;
    const newPreferences = { ...currentPreferences };

    if (theme !== undefined) newPreferences.theme = theme;
    if (defaultView !== undefined) newPreferences.defaultView = defaultView;
    if (itemsPerPage !== undefined) newPreferences.itemsPerPage = itemsPerPage;
    if (autoSaveBookmarks !== undefined) newPreferences.autoSaveBookmarks = autoSaveBookmarks;
    if (enableNotifications !== undefined) newPreferences.enableNotifications = enableNotifications;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { preferences: newPreferences },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        preferences: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
}

export async function deleteAccount(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    await prisma.$transaction(async (tx) => {
      await tx.bookmarkCollection.deleteMany({
        where: { bookmark: { userId } }
      });
      
      await tx.bookmarkTag.deleteMany({
        where: { bookmark: { userId } }
      });
      
      await tx.bookmark.deleteMany({
        where: { userId }
      });
      
      await tx.tag.deleteMany({
        where: { userId }
      });
      
      await tx.share.deleteMany({
        where: { sharedBy: userId }
      });
      
      await tx.collection.deleteMany({
        where: { userId }
      });
      
      await tx.userSession.deleteMany({
        where: { userId }
      });
      
      await tx.user.delete({
        where: { id: userId }
      });
    });

    logger.info(`User account deleted: ${userId}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
}