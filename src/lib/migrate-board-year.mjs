import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const eqIndex = trimmed.indexOf('=');
      let key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/education';
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const db = mongoose.connection.db;

  console.log('Renaming boardName -> board_name and questionYear -> exam_year...');
  
  const mcqResult = await db.collection('mcqquestions').updateMany(
    {},
    {
      $rename: {
        boardName: 'board_name',
        questionYear: 'exam_year'
      }
    }
  );
  console.log(`mcqquestions collection: matched ${mcqResult.matchedCount}, modified ${mcqResult.modifiedCount}`);

  const creativeResult = await db.collection('creativequestions').updateMany(
    {},
    {
      $rename: {
        boardName: 'board_name',
        questionYear: 'exam_year'
      }
    }
  );
  console.log(`creativequestions collection: matched ${creativeResult.matchedCount}, modified ${creativeResult.modifiedCount}`);

  // Create indexes manually to make sure they are created immediately
  console.log('Re-creating indexes...');
  try {
    await db.collection('mcqquestions').createIndex({ board_name: 1 });
    await db.collection('mcqquestions').createIndex({ exam_year: 1 });
    await db.collection('mcqquestions').createIndex({ board_name: 1, exam_year: 1 });
    console.log('mcqquestions indexes created successfully.');
  } catch (err) {
    console.error('Error creating mcqquestions indexes:', err.message);
  }

  try {
    await db.collection('creativequestions').createIndex({ board_name: 1 });
    await db.collection('creativequestions').createIndex({ exam_year: 1 });
    await db.collection('creativequestions').createIndex({ board_name: 1, exam_year: 1 });
    console.log('creativequestions indexes created successfully.');
  } catch (err) {
    console.error('Error creating creativequestions indexes:', err.message);
  }

  await mongoose.disconnect();
  console.log('Done migration!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
