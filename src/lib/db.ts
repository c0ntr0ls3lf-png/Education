import mongoose from 'mongoose';

// Connection state for Next.js hot-reload caching
const globalForDb = globalThis as unknown as {
  mongooseConnected?: boolean;
  connectPromise?: Promise<typeof mongoose>;
  mongodPromise?: Promise<any>;
  seedingPromise?: Promise<void>;
};

/** Wait for the initial seed to finish (only relevant for in-memory MongoDB fallback) */
export async function waitForSeed(): Promise<void> {
  // No-op when using a real MongoDB URI — seeding only applies to in-memory server
  if (process.env.MONGODB_URI?.trim()) return
  if (globalForDb.seedingPromise) {
    await globalForDb.seedingPromise
  }
}

async function getMongoMemoryServer() {
  if (globalForDb.mongodPromise) return globalForDb.mongodPromise;
  
  globalForDb.mongodPromise = (async () => {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const server = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 60000, // 60 seconds to prevent timeout on slow startup/downloads
      }
    });
    const uri = server.getUri();
    console.log(`🐘 MongoDB Memory Server started at: ${uri}`);
    return server;
  })();
  
  return globalForDb.mongodPromise;
}

/**
 * Get the MongoDB URI from environment or fall back to in-memory server.
 * Only starts a memory server if MONGODB_URI is not set.
 */
async function getMongoURI(): Promise<string> {
  const envUri = process.env.MONGODB_URI?.trim();
  if (envUri && envUri.length > 0) {
    console.log(`🔗 Using persistent MongoDB: ${envUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    return envUri;
  }
  
  console.log('⚠️  No MONGODB_URI set, falling back to in-memory MongoDB (data will be lost on restart)');
  const server = await getMongoMemoryServer();
  return server.getUri();
}

/**
 * Connect to MongoDB with caching for Next.js hot-reload.
 * Safe to call multiple times - returns cached promise if already connecting.
 * 
 * Uses MONGODB_URI from env if set, otherwise falls back to mongodb-memory-server.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (mongoose.connection.readyState === 2) {
    // Already connecting, wait for it
    await mongoose.connection.asPromise();
    return mongoose;
  }

  if (globalForDb.connectPromise) {
    return globalForDb.connectPromise;
  }

  const tryConnect = async (uri: string, isFallback: boolean = false): Promise<typeof mongoose> => {
    const promise = mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000, // 8 seconds timeout
      socketTimeoutMS: 45000,
    });

    globalForDb.connectPromise = promise;
    const conn = await promise;
    globalForDb.mongooseConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Auto-seed if it's in-memory MongoDB
    const isMemoryDb = uri.includes('127.0.0.1') || uri.includes('localhost') || !process.env.MONGODB_URI?.trim() || isFallback;
    if (isMemoryDb) {
      if (!globalForDb.seedingPromise) {
        globalForDb.seedingPromise = (async () => {
          const ClassModel = conn.models.Class || conn.model('Class');
          const count = await ClassModel.countDocuments();
          if (count === 0) {
            console.log('🌱 In-memory / Fallback database detected and empty. Auto-seeding...');
            try {
              const { seedDatabase } = await import('./seed');
              await seedDatabase();
              console.log('✅ Auto-seeding completed!');
            } catch (seedErr) {
              console.error('❌ Auto-seeding failed:', seedErr);
              globalForDb.seedingPromise = undefined;
              throw seedErr;
            }
          }
        })();
      }
      // Wait for seeding
      await globalForDb.seedingPromise;
    }

    return conn;
  };

  const primaryUri = process.env.MONGODB_URI?.trim();
  if (primaryUri && primaryUri.length > 0) {
    try {
      return await tryConnect(primaryUri);
    } catch (error) {
      console.warn(`⚠️ Failed to connect to persistent MongoDB: ${error instanceof Error ? error.message : error}`);
      console.log('🔄 Falling back to in-memory MongoDB...');
      globalForDb.connectPromise = undefined;
      try {
        await mongoose.disconnect();
      } catch (disErr) {
        console.error('Error during mongoose disconnect:', disErr);
      }
    }
  }

  // Fallback to in-memory MongoDB
  const memoryServer = await getMongoMemoryServer();
  const fallbackUri = memoryServer.getUri();
  try {
    return await tryConnect(fallbackUri, true);
  } catch (error) {
    globalForDb.connectPromise = undefined;
    console.error('❌ Failed to connect to fallback in-memory MongoDB:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// ─── Response Helper ───────────────────────────────────────────────────────

/**
 * Recursively transforms MongoDB lean documents to match the Prisma response shape.
 * - Replaces `_id` with `id` on all nested objects
 * - Strips `__v` version keys
 */
export function toDoc<T = Record<string, unknown>>(data: unknown): T {
  if (Array.isArray(data)) {
    return data.map(item => toDoc(item)) as T;
  }

  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }

  if (data !== null && data !== undefined && typeof data === 'object') {
    // If it's a Mongoose/MongoDB ObjectId, convert it to a string
    if (
      data.constructor?.name === 'ObjectID' ||
      data.constructor?.name === 'ObjectId' ||
      (data as any)._bsontype === 'ObjectID'
    ) {
      return String(data) as unknown as T;
    }

    const obj = data as Record<string, unknown>;

    // If this object has an _id, transform it to id
    if ('_id' in obj) {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === '_id') {
          result.id = toDoc(value);
        } else if (key === '__v') {
          // Skip version key
        } else {
          result[key] = toDoc(value);
        }
      }
      return result as T;
    }

    // Regular object without _id - recurse into values
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '__v') continue;
      result[key] = toDoc(value);
    }
    return result as T;
  }

  return data as T;
}

// ─── Re-export all models ─────────────────────────────────────────────────
export {
  User,
  Class,
  Subject,
  Chapter,
  Explanation,
  CreativeQuestion,
  McqQuestion,
  Video,
  Exam,
  ExamAttempt,
  Bookmark,
  UserAchievement,
  Leaderboard,
  Notification,
  AdZone,
  SEO,
  Setting,
  Analytics,
  Testimonial,
  FAQ,
  Quote,
  Category,
  Subcategory,
  PendingChange,
  ActivityLog,
  BlogPost,
  Notice,
} from '@/models';

export type { IBlogPost, INotice } from '@/models';

