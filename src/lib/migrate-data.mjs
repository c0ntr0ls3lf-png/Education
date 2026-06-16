/**
 * Data Migration Script: SQLite -> MongoDB
 * 
 * Reads all data from the existing SQLite database (prisma/dev.db)
 * and inserts it into MongoDB.
 * 
 * Usage: node src/lib/migrate-data.mjs
 * 
 * Requires: better-sqlite3 (install with: npm install better-sqlite3)
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function main() {
  let Database;
  try {
    Database = require('better-sqlite3');
  } catch {
    console.error('Please install better-sqlite3 first: npm install better-sqlite3');
    process.exit(1);
  }

  const mongoose = require('mongoose');
  const path = require('path');
  const fs = require('fs');

  const DB_PATH = path.resolve('prisma/dev.db');
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/education';

  if (!fs.existsSync(DB_PATH)) {
    console.error(`SQLite database not found at: ${DB_PATH}`);
    process.exit(1);
  }

  console.log('📦 Starting migration from SQLite to MongoDB...\n');

  // Connect to SQLite
  const sqlite = new Database(DB_PATH, { readonly: true });

  // Connect to MongoDB
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Get all table names from SQLite
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'").all();

  const tableNames = tables.map(t => t.name);
  console.log(`Found ${tableNames.length} tables: ${tableNames.join(', ')}\n`);

  // Model name mapping (SQLite table name -> Mongoose model name)
  const modelMap = {
    'User': 'User',
    'Class': 'Class',
    'Subject': 'Subject',
    'Chapter': 'Chapter',
    'Explanation': 'Explanation',
    'CreativeQuestion': 'CreativeQuestion',
    'McqQuestion': 'McqQuestion',
    'Video': 'Video',
    'Exam': 'Exam',
    'ExamAttempt': 'ExamAttempt',
    'Bookmark': 'Bookmark',
    'UserAchievement': 'UserAchievement',
    'Leaderboard': 'Leaderboard',
    'Notification': 'Notification',
    'AdZone': 'AdZone',
    'SEO': 'SEO',
    'Setting': 'Setting',
    'Analytics': 'Analytics',
    'Testimonial': 'Testimonial',
    'FAQ': 'FAQ',
    'Quote': 'Quote',
  };

  let totalMigrated = 0;

  for (const tableName of tableNames) {
    const modelName = modelMap[tableName];
    if (!modelName) {
      console.log(`⏭️  Skipping unknown table: ${tableName}`);
      continue;
    }

    // Get all rows from SQLite
    const rows = sqlite.prepare(`SELECT * FROM "${tableName}"`).all();
    if (rows.length === 0) {
      console.log(`⏭️  ${tableName}: 0 rows (empty)`);
      continue;
    }

    // Get the Mongoose model
    const Model = mongoose.models[modelName] || mongoose.model(modelName);

    // Drop existing collection to avoid duplicates
    try {
      await Model.deleteMany({});
    } catch {
      // Collection might not exist
    }

    // Insert all rows
    const docs = rows.map(row => {
      const doc = { _id: row.id, ...row };
      delete doc.id; // Remove the SQLite id column since we use _id
      // Convert date strings to Date objects where applicable
      for (const [key, value] of Object.entries(doc)) {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
          doc[key] = new Date(value);
        }
        // Convert integer booleans (SQLite stores booleans as 0/1)
        if (typeof value === 'number' && (key === 'isActive' || key === 'isRead' || key === 'isPublic' || key === 'emailVerified')) {
          doc[key] = value === 1;
        }
      }
      return doc;
    });

    try {
      await Model.insertMany(docs, { ordered: false });
      console.log(`✅ ${tableName}: ${rows.length} rows migrated`);
      totalMigrated += rows.length;
    } catch (err) {
      console.error(`❌ ${tableName}: Error - ${err.message}`);
      // Try one-by-one for better error reporting
      let success = 0;
      for (const doc of docs) {
        try {
          await Model.create(doc);
          success++;
        } catch (e) {
          console.error(`   Failed row ${doc._id}: ${e.message}`);
        }
      }
      console.log(`   Partially migrated: ${success}/${rows.length}`);
      totalMigrated += success;
    }
  }

  // Verify counts
  console.log('\n📊 Verification:');
  for (const tableName of tableNames) {
    const modelName = modelMap[tableName];
    if (!modelName) continue;
    const sqliteCount = sqlite.prepare(`SELECT COUNT(*) as cnt FROM "${tableName}"`).get().cnt;
    const Model = mongoose.models[modelName] || mongoose.model(modelName);
    const mongoCount = await Model.countDocuments();
    const match = sqliteCount === mongoCount ? '✅' : '⚠️';
    console.log(`  ${match} ${tableName}: SQLite=${sqliteCount}, MongoDB=${mongoCount}`);
  }

  console.log(`\n🎉 Migration complete! Total rows migrated: ${totalMigrated}`);

  sqlite.close();
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
