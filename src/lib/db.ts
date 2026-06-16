import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Connection state for Next.js hot-reload caching
const globalForDb = globalThis as unknown as {
  mongooseConnected?: boolean;
  connectPromise?: Promise<typeof mongoose>;
  mongodPromise?: Promise<MongoMemoryServer>;
  seedingPromise?: Promise<void>;
};

async function getMongoMemoryServer() {
  if (globalForDb.mongodPromise) return globalForDb.mongodPromise;
  
  globalForDb.mongodPromise = MongoMemoryServer.create().then(server => {
    const uri = server.getUri();
    console.log(`🐘 MongoDB Memory Server started at: ${uri}`);
    return server;
  });
  
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

  const uri = await getMongoURI();

  const promise = mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  globalForDb.connectPromise = promise;

  try {
    const conn = await promise;
    globalForDb.mongooseConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Auto-seed if using memory server and it's empty
    const envUri = process.env.MONGODB_URI?.trim();
    if (!envUri || envUri.length === 0) {
      if (!globalForDb.seedingPromise) {
        globalForDb.seedingPromise = (async () => {
          const ClassModel = conn.models.Class || conn.model('Class');
          const count = await ClassModel.countDocuments();
          if (count === 0) {
            console.log('🌱 In-memory database detected and empty. Auto-seeding...');
            try {
              const { seedDatabase } = await import('./seed');
              await seedDatabase();
              console.log('✅ Auto-seeding completed!');
            } catch (seedErr) {
              console.error('❌ Auto-seeding failed:', seedErr);
              globalForDb.seedingPromise = undefined; // Reset on failure so it can retry
              throw seedErr;
            }
          }
        })();
      }
      
      // Wait for seeding to complete before returning
      await globalForDb.seedingPromise;
    }

    return conn;
  } catch (error) {
    globalForDb.connectPromise = undefined;
    console.error('❌ MongoDB connection failed:', error instanceof Error ? error.message : error);
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

  if (data !== null && data !== undefined && typeof data === 'object' && !(data instanceof Date)) {
    const obj = data as Record<string, unknown>;

    // If this object has an _id, transform it to id
    if ('_id' in obj) {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === '_id') {
          result.id = value;
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
} from '@/models';
