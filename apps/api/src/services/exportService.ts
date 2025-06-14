import { Parser } from 'json2csv';
import { Bookmark, Collection, Tag } from '@prisma/client';

interface ExportBookmark extends Bookmark {
  collections: { collection: Collection }[];
  tags: { tag: Tag }[];
}

export class ExportService {
  exportToJSON(bookmarks: ExportBookmark[]): string {
    const exportData = bookmarks.map(bookmark => ({
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description,
      tags: bookmark.tags.map(t => t.tag.name),
      collections: bookmark.collections.map(c => c.collection.name),
      domain: bookmark.domain,
      createdAt: bookmark.createdAt,
      updatedAt: bookmark.updatedAt,
      isFavorite: bookmark.isFavorite,
      isArchived: bookmark.isArchived
    }));

    return JSON.stringify(exportData, null, 2);
  }

  exportToCSV(bookmarks: ExportBookmark[]): string {
    const exportData = bookmarks.map(bookmark => ({
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description || '',
      tags: bookmark.tags.map(t => t.tag.name).join(', '),
      collections: bookmark.collections.map(c => c.collection.name).join(', '),
      domain: bookmark.domain || '',
      createdAt: bookmark.createdAt.toISOString(),
      updatedAt: bookmark.updatedAt.toISOString(),
      isFavorite: bookmark.isFavorite,
      isArchived: bookmark.isArchived
    }));

    const fields = [
      'url',
      'title',
      'description',
      'tags',
      'collections',
      'domain',
      'createdAt',
      'updatedAt',
      'isFavorite',
      'isArchived'
    ];

    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(exportData);
  }

  exportToHTML(bookmarks: ExportBookmark[], userName?: string): string {
    const groupedByCollection = this.groupByCollection(bookmarks);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bookmarks Export${userName ? ` - ${userName}` : ''}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
        }
        h2 {
            color: #1e40af;
            margin-top: 30px;
        }
        .bookmark {
            background: white;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: box-shadow 0.3s;
        }
        .bookmark:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .bookmark-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .bookmark-title a {
            color: #2563eb;
            text-decoration: none;
        }
        .bookmark-title a:hover {
            text-decoration: underline;
        }
        .bookmark-url {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
        }
        .bookmark-description {
            color: #4b5563;
            margin-bottom: 8px;
        }
        .bookmark-meta {
            font-size: 12px;
            color: #9ca3af;
        }
        .tag {
            display: inline-block;
            background-color: #e5e7eb;
            color: #374151;
            padding: 2px 8px;
            border-radius: 4px;
            margin-right: 5px;
            font-size: 12px;
        }
        .favorite {
            color: #f59e0b;
        }
        .archived {
            opacity: 0.6;
        }
        .export-info {
            background-color: #e0e7ff;
            color: #3730a3;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <h1>📚 Bookmarks Export${userName ? ` - ${userName}` : ''}</h1>
    <div class="export-info">
        <strong>Exported on:</strong> ${new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })} at ${new Date().toLocaleTimeString()}<br>
        <strong>Total bookmarks:</strong> ${bookmarks.length}
    </div>
    
    ${Object.entries(groupedByCollection).map(([collectionName, bookmarks]) => `
        <h2>📁 ${collectionName}</h2>
        ${bookmarks.map(bookmark => `
            <div class="bookmark${bookmark.isArchived ? ' archived' : ''}">
                <div class="bookmark-title">
                    ${bookmark.isFavorite ? '<span class="favorite">⭐</span> ' : ''}
                    <a href="${bookmark.url}" target="_blank" rel="noopener noreferrer">${bookmark.title}</a>
                </div>
                <div class="bookmark-url">${bookmark.url}</div>
                ${bookmark.description ? `<div class="bookmark-description">${bookmark.description}</div>` : ''}
                <div class="bookmark-meta">
                    ${bookmark.tags.length > 0 ? bookmark.tags.map(t => `<span class="tag">#${t.tag.name}</span>`).join('') : ''}
                    <span style="float: right;">Added on ${new Date(bookmark.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('')}
    `).join('')}
</body>
</html>`;
  }

  exportToNetscapeHTML(bookmarks: ExportBookmark[]): string {
    const groupedByCollection = this.groupByCollection(bookmarks);
    
    return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${Object.entries(groupedByCollection).map(([collectionName, bookmarks]) => `
    <DT><H3>${collectionName}</H3>
    <DL><p>
${bookmarks.map(bookmark => `        <DT><A HREF="${bookmark.url}" ADD_DATE="${Math.floor(bookmark.createdAt.getTime() / 1000)}"${bookmark.tags.length > 0 ? ` TAGS="${bookmark.tags.map(t => t.tag.name).join(',')}"` : ''}>${bookmark.title}</A>`).join('\n')}
    </DL><p>`).join('\n')}
</DL><p>`;
  }

  private groupByCollection(bookmarks: ExportBookmark[]): Record<string, ExportBookmark[]> {
    const grouped: Record<string, ExportBookmark[]> = {
      'Uncategorized': []
    };

    bookmarks.forEach(bookmark => {
      if (bookmark.collections.length === 0) {
        grouped['Uncategorized'].push(bookmark);
      } else {
        bookmark.collections.forEach(({ collection }) => {
          if (!grouped[collection.name]) {
            grouped[collection.name] = [];
          }
          grouped[collection.name].push(bookmark);
        });
      }
    });

    // Remove empty collections
    if (grouped['Uncategorized'].length === 0) {
      delete grouped['Uncategorized'];
    }

    return grouped;
  }
}

export const exportService = new ExportService();