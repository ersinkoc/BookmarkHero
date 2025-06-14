import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { exportService } from '../services/exportService';
import { ValidationError } from '../utils/errors';

export async function exportBookmarks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { format = 'json', collectionId, tagId } = req.query;

    // Build query filters
    const where: any = { userId };
    
    if (collectionId) {
      where.collections = {
        some: { collectionId: collectionId as string }
      };
    }
    
    if (tagId) {
      where.tags = {
        some: { tagId: tagId as string }
      };
    }

    // Fetch bookmarks with related data
    const bookmarks = await prisma.bookmark.findMany({
      where,
      include: {
        collections: {
          include: { collection: true }
        },
        tags: {
          include: { tag: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get user info for export
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    let exportData: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'json':
        exportData = exportService.exportToJSON(bookmarks);
        contentType = 'application/json';
        filename = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
        break;

      case 'csv':
        exportData = exportService.exportToCSV(bookmarks);
        contentType = 'text/csv';
        filename = `bookmarks-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'html':
        exportData = exportService.exportToHTML(bookmarks, user?.name || user?.email);
        contentType = 'text/html';
        filename = `bookmarks-${new Date().toISOString().split('T')[0]}.html`;
        break;

      case 'netscape':
        exportData = exportService.exportToNetscapeHTML(bookmarks);
        contentType = 'text/html';
        filename = `bookmarks-${new Date().toISOString().split('T')[0]}.html`;
        break;

      default:
        throw new ValidationError('Invalid export format. Supported formats: json, csv, html, netscape');
    }

    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send the export data
    res.send(exportData);

    logger.info(`Bookmarks exported for user ${userId} in ${format} format`);
  } catch (error) {
    logger.error('Export bookmarks error:', error);
    throw error;
  }
}

export async function getExportFormats(req: AuthRequest, res: Response) {
  res.json({
    success: true,
    data: {
      formats: [
        {
          id: 'json',
          name: 'JSON',
          description: 'JavaScript Object Notation - ideal for backups and data transfer',
          extension: '.json',
          mimeType: 'application/json'
        },
        {
          id: 'csv',
          name: 'CSV',
          description: 'Comma-separated values - compatible with spreadsheet applications',
          extension: '.csv',
          mimeType: 'text/csv'
        },
        {
          id: 'html',
          name: 'HTML',
          description: 'Web page format - viewable in any browser with styling',
          extension: '.html',
          mimeType: 'text/html'
        },
        {
          id: 'netscape',
          name: 'Netscape HTML',
          description: 'Browser bookmark format - importable in Chrome, Firefox, etc.',
          extension: '.html',
          mimeType: 'text/html'
        }
      ]
    }
  });
}