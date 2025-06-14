import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { sanitizeText } from '../utils/sanitizer';

export interface WebsiteMetadata {
  title: string;
  description?: string;
  favicon?: string;
  previewImage?: string;
  siteName?: string;
  readingTime?: number;
}

export async function extractMetadata(url: string): Promise<WebsiteMetadata> {
  // Validate URL to prevent SSRF attacks
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname.toLowerCase();
  
  // Block internal IPs and localhost
  const blockedPatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^\[::1\]$/,
    /^\[fc00::/,
    /^\[fe80::/
  ];
  
  if (blockedPatterns.some(pattern => pattern.test(hostname))) {
    throw new Error('Access to internal resources is not allowed');
  }
  
  // Only allow http and https protocols
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Only HTTP and HTTPS protocols are allowed');
  }

  const cacheKey = `metadata:${url}`;
  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    logger.warn('Redis cache error:', error);
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const metadata: WebsiteMetadata = {
      title: sanitizeText(extractTitle($) || url),
      description: sanitizeText(extractDescription($)),
      favicon: extractFavicon($, url),
      previewImage: extractPreviewImage($, url),
      siteName: sanitizeText(extractSiteName($) || ''),
      readingTime: calculateReadingTime($)
    };

    try {
      await redis.setEx(cacheKey, 3600, JSON.stringify(metadata)); // Cache for 1 hour
    } catch (error) {
      logger.warn('Redis cache set error:', error);
    }

    return metadata;
  } catch (error) {
    logger.error('Metadata extraction error:', error);
    return {
      title: url,
      description: undefined,
      favicon: undefined,
      previewImage: undefined,
      siteName: undefined,
      readingTime: undefined
    };
  }
}

function extractTitle($: cheerio.CheerioAPI): string {
  return (
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() ||
    ''
  ).trim();
}

function extractDescription($: cheerio.CheerioAPI): string {
  return (
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    ''
  ).trim();
}

function extractFavicon($: cheerio.CheerioAPI, baseUrl: string): string | undefined {
  const favicon = 
    $('link[rel="apple-touch-icon"]').attr('href') ||
    $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href') ||
    '/favicon.ico';

  if (!favicon) return undefined;

  try {
    return new URL(favicon, baseUrl).href;
  } catch {
    return undefined;
  }
}

function extractPreviewImage($: cheerio.CheerioAPI, baseUrl: string): string | undefined {
  const image = 
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content');

  if (!image) return undefined;

  try {
    return new URL(image, baseUrl).href;
  } catch {
    return undefined;
  }
}

function extractSiteName($: cheerio.CheerioAPI): string | undefined {
  return (
    $('meta[property="og:site_name"]').attr('content') ||
    $('meta[name="application-name"]').attr('content') ||
    undefined
  );
}

function calculateReadingTime($: cheerio.CheerioAPI): number {
  const text = $('body').text();
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
  return readingTime;
}

export async function takeScreenshot(url: string): Promise<string | undefined> {
  // Validate URL to prevent SSRF attacks
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname.toLowerCase();
  
  // Block internal IPs and localhost
  const blockedPatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^\[::1\]$/,
    /^\[fc00::/,
    /^\[fe80::/
  ];
  
  if (blockedPatterns.some(pattern => pattern.test(hostname))) {
    throw new Error('Access to internal resources is not allowed');
  }
  
  // Only allow http and https protocols
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Only HTTP and HTTPS protocols are allowed');
  }

  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const screenshot = await page.screenshot({
      type: 'png',
      encoding: 'base64',
      fullPage: false
    });

    return `data:image/png;base64,${screenshot}`;
  } catch (error) {
    logger.error('Screenshot error:', error);
    return undefined;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}