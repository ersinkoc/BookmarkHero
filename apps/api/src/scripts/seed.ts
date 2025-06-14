import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('Demo123!Pass', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@bookmark-hero.com' },
    update: {},
    create: {
      email: 'demo@bookmark-hero.com',
      name: 'Demo User',
      password: hashedPassword,
      isVerified: true,
      preferences: {
        theme: 'system',
        defaultView: 'grid',
        itemsPerPage: 20,
        autoSaveBookmarks: true,
        enableNotifications: true
      }
    }
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create collections
  const collections = await Promise.all([
    prisma.collection.upsert({
      where: { id: 'demo-collection-dev' },
      update: {},
      create: {
        id: 'demo-collection-dev',
        userId: demoUser.id,
        name: 'Development',
        description: 'Resources for web development',
        color: '#3B82F6',
        isPublic: false
      }
    }),
    prisma.collection.upsert({
      where: { id: 'demo-collection-design' },
      update: {},
      create: {
        id: 'demo-collection-design',
        userId: demoUser.id,
        name: 'Design',
        description: 'UI/UX design inspiration and tools',
        color: '#8B5CF6',
        isPublic: false
      }
    }),
    prisma.collection.upsert({
      where: { id: 'demo-collection-news' },
      update: {},
      create: {
        id: 'demo-collection-news',
        userId: demoUser.id,
        name: 'Tech News',
        description: 'Latest technology news and updates',
        color: '#EF4444',
        isPublic: true
      }
    })
  ]);

  console.log('✅ Created collections:', collections.map(c => c.name).join(', '));

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { userId_name: { userId: demoUser.id, name: 'javascript' } },
      update: {},
      create: {
        userId: demoUser.id,
        name: 'javascript',
        color: '#F7DF1E'
      }
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: demoUser.id, name: 'react' } },
      update: {},
      create: {
        userId: demoUser.id,
        name: 'react',
        color: '#61DAFB'
      }
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: demoUser.id, name: 'design' } },
      update: {},
      create: {
        userId: demoUser.id,
        name: 'design',
        color: '#FF6B6B'
      }
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: demoUser.id, name: 'tutorial' } },
      update: {},
      create: {
        userId: demoUser.id,
        name: 'tutorial',
        color: '#4ECDC4'
      }
    }),
    prisma.tag.upsert({
      where: { userId_name: { userId: demoUser.id, name: 'tool' } },
      update: {},
      create: {
        userId: demoUser.id,
        name: 'tool',
        color: '#45B7D1'
      }
    })
  ]);

  console.log('✅ Created tags:', tags.map(t => t.name).join(', '));

  // Create sample bookmarks
  const bookmarks = [
    {
      url: 'https://react.dev',
      title: 'React - The Library for Web and Native User Interfaces',
      description: 'The official React documentation and learning resources',
      domain: 'react.dev',
      collectionId: collections[0].id, // Development
      tagNames: ['react', 'javascript', 'tutorial']
    },
    {
      url: 'https://nextjs.org',
      title: 'Next.js by Vercel - The React Framework',
      description: 'Production-ready React framework with hybrid static & server rendering',
      domain: 'nextjs.org',
      collectionId: collections[0].id, // Development
      tagNames: ['react', 'javascript']
    },
    {
      url: 'https://tailwindcss.com',
      title: 'Tailwind CSS - Rapidly build modern websites',
      description: 'A utility-first CSS framework for rapidly building custom user interfaces',
      domain: 'tailwindcss.com',
      collectionId: collections[1].id, // Design
      tagNames: ['design', 'tool']
    },
    {
      url: 'https://figma.com',
      title: 'Figma: The Collaborative Interface Design Tool',
      description: 'Design, prototype, and collaborate with Figma',
      domain: 'figma.com',
      collectionId: collections[1].id, // Design
      tagNames: ['design', 'tool']
    },
    {
      url: 'https://github.com',
      title: 'GitHub: Where the world builds software',
      description: 'The worlds leading software development platform',
      domain: 'github.com',
      collectionId: collections[0].id, // Development
      tagNames: ['tool']
    },
    {
      url: 'https://vercel.com/blog',
      title: 'Vercel Blog - Frontend Cloud',
      description: 'The latest news and updates from the Vercel team',
      domain: 'vercel.com',
      collectionId: collections[2].id, // Tech News
      tagNames: ['javascript']
    }
  ];

  for (const bookmarkData of bookmarks) {
    const { tagNames, collectionId, ...bookmarkProps } = bookmarkData;
    
    // Check if bookmark exists for this user
    const existingBookmark = await prisma.bookmark.findFirst({
      where: { userId: demoUser.id, url: bookmarkData.url }
    });

    const bookmark = existingBookmark || await prisma.bookmark.create({
      data: {
        ...bookmarkProps,
        userId: demoUser.id,
        isFavorite: Math.random() > 0.7, // 30% chance of being favorite
      }
    });

    // Connect to collection
    await prisma.bookmarkCollection.upsert({
      where: { bookmarkId_collectionId: { bookmarkId: bookmark.id, collectionId } },
      update: {},
      create: {
        bookmarkId: bookmark.id,
        collectionId
      }
    });

    // Connect to tags
    for (const tagName of tagNames) {
      const tag = tags.find(t => t.name === tagName);
      if (tag) {
        await prisma.bookmarkTag.upsert({
          where: { bookmarkId_tagId: { bookmarkId: bookmark.id, tagId: tag.id } },
          update: {},
          create: {
            bookmarkId: bookmark.id,
            tagId: tag.id
          }
        });
      }
    }
  }

  console.log('✅ Created sample bookmarks:', bookmarks.length);

  // Create a public share for the Tech News collection
  const publicShare = await prisma.share.upsert({
    where: { id: 'demo-public-share' },
    update: {},
    create: {
      id: 'demo-public-share',
      collectionId: collections[2].id, // Tech News
      sharedBy: demoUser.id,
      permissions: 'read'
    }
  });

  console.log('✅ Created public share for Tech News collection');

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Demo account details:');
  console.log('Email: demo@bookmark-hero.com');
  console.log('Password: Demo123!Pass');
  console.log('');
  console.log('Public collection share token:', publicShare.id);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });