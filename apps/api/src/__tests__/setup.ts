import { prisma } from '../config/database';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-32chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-32chars';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/bookmarkhero_clone_test?schema=public';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.NODE_ENV = 'test';

// Clean up database after each test
afterEach(async () => {
  const deleteBookmarkTags = prisma.bookmarkTag.deleteMany();
  const deleteBookmarkCollections = prisma.bookmarkCollection.deleteMany();
  const deleteBookmarks = prisma.bookmark.deleteMany();
  const deleteCollections = prisma.collection.deleteMany();
  const deleteTags = prisma.tag.deleteMany();
  const deleteShares = prisma.share.deleteMany();
  const deletePasswordResets = prisma.passwordReset.deleteMany();
  const deleteEmailVerifications = prisma.emailVerification.deleteMany();
  const deleteSessions = prisma.userSession.deleteMany();
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([
    deleteBookmarkTags,
    deleteBookmarkCollections,
    deleteBookmarks,
    deleteCollections,
    deleteTags,
    deleteShares,
    deletePasswordResets,
    deleteEmailVerifications,
    deleteSessions,
    deleteUsers,
  ]);
});

// Close database connection after all tests
afterAll(async () => {
  await prisma.$disconnect();
});