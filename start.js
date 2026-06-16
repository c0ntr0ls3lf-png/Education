const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple .env parser (no dependency)
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const eqIndex = trimmed.indexOf('=');
          let key = trimmed.slice(0, eqIndex).trim();
          let value = trimmed.slice(eqIndex + 1).trim();
          // Remove surrounding quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          process.env[key] = value;
        }
      }
    }
  } catch (e) {
    console.warn('Warning: Could not load .env file');
  }
}

loadEnv();

async function main() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.log('❌ MONGODB_URI not found in environment or .env file.');
    console.log('');
    console.log('   Please set your MongoDB connection string in .env:');
    console.log('   MONGODB_URI="mongodb://localhost:27017/education"');
    console.log('');
    console.log('   Or for MongoDB Atlas:');
    console.log('   MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/education"');
    console.log('');
    process.exit(1);
  }

  console.log(`🔗 Connecting to persistent MongoDB...`);

  // Seed admin user
  const mongoose = require('mongoose');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  const userSchema = new mongoose.Schema({
    _id: String,
    email: String,
    name: String,
    role: String,
    password: String,
    emailVerified: Boolean,
    provider: String,
    image: String,
    bio: String,
    phone: String,
    classId: String,
    providerId: String,
  }, { timestamps: true, versionKey: false });

  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const { createHash } = require('crypto');
  const hashPassword = (pw) => createHash('sha256').update(pw + 'edulms_salt').digest('hex');

  const existing = await User.findOne({ email: 'admin@edu.com' });
  if (!existing) {
    await User.create({
      _id: new mongoose.Types.ObjectId().toString(),
      email: 'admin@edu.com',
      name: 'Admin User',
      role: 'admin',
      password: hashPassword('admin'),
      emailVerified: true,
      provider: 'credentials',
    });
    console.log('✅ Admin user seeded: admin@edu.com / admin');
  }

  // Seed classes, subjects, chapters
  const classSchema = new mongoose.Schema({
    _id: String, name: String, slug: String, number: Number,
    description: String, icon: String, color: String,
    order: Number, isActive: Boolean,
  }, { timestamps: true, versionKey: false });
  const Class = mongoose.models.Class || mongoose.model('Class', classSchema);

  const subjectSchema = new mongoose.Schema({
    _id: String, name: String, slug: String, classId: String,
    description: String, icon: String, color: String,
    order: Number, isActive: Boolean,
  }, { timestamps: true, versionKey: false });
  const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);

  const chapterSchema = new mongoose.Schema({
    _id: String, name: String, slug: String, subjectId: String,
    description: String, icon: String, color: String,
    order: Number, isActive: Boolean,
  }, { timestamps: true, versionKey: false });
  const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', chapterSchema);

  const classCount = await Class.countDocuments();
  if (classCount === 0) {
    console.log('🌱 Seeding classes, subjects, chapters...');
    const colors = ['#EF4444','#F97316','#F59E0B','#84CC16','#22C55E','#14B8A6','#06B6D4','#3B82F6','#6366F1','#8B5CF6','#A855F7','#EC4899'];
    const subjectMap = {
      1: ['Mathematics','English','EVS'],
      5: ['Mathematics','English','EVS','Science'],
      6: ['Mathematics','English','Science','Social Science','Hindi'],
      8: ['Mathematics','English','Science','Social Science','Hindi'],
      9: ['Mathematics','English','Science','Social Science','Hindi'],
      10: ['Physics','Chemistry','Mathematics','English','Biology'],
      11: ['Physics','Chemistry','Mathematics','English','Biology','Computer Science'],
      12: ['Physics','Chemistry','Mathematics','English','Biology','Computer Science'],
    };
    const chapterMap = {
      'Physics-10': [
        { name: 'Motion', slug: 'motion', desc: 'Study of motion, velocity, acceleration' },
        { name: 'Electricity', slug: 'electricity', desc: 'Electric current, resistance, Ohm\'s law' },
        { name: 'Light', slug: 'light', desc: 'Reflection, refraction, lenses' },
        { name: 'Sound', slug: 'sound', desc: 'Sound waves, frequency, amplitude' },
        { name: 'Magnetism', slug: 'magnetism', desc: 'Magnetic fields, electromagnetic induction' },
      ],
      'Mathematics-10': [
        { name: 'Real Numbers', slug: 'real-numbers', desc: 'Euclid\'s lemma, fundamental theorem' },
        { name: 'Polynomials', slug: 'polynomials', desc: 'Zeros, coefficients, division' },
        { name: 'Linear Equations', slug: 'linear-equations', desc: 'Pair of linear equations in two variables' },
        { name: 'Quadratic Equations', slug: 'quadratic-equations', desc: 'Standard form, factorization, formula' },
      ],
      'Chemistry-10': [
        { name: 'Chemical Reactions', slug: 'chemical-reactions', desc: 'Types of reactions, balancing equations' },
        { name: 'Acids, Bases and Salts', slug: 'acids-bases-salts', desc: 'pH scale, indicators, neutralization' },
        { name: 'Metals and Non-metals', slug: 'metals-nonmetals', desc: 'Properties, reactivity series' },
      ],
    };

    for (let i = 1; i <= 12; i++) {
      const classId = new mongoose.Types.ObjectId().toString();
      await Class.create({
        _id: classId,
        name: `Class ${i}`,
        slug: `class-${i}`,
        number: i,
        description: `Educational content for Class ${i}`,
        icon: String(i),
        color: colors[i - 1],
        order: i,
        isActive: true,
      });

      const subjects = subjectMap[i] || [];
      for (let j = 0; j < subjects.length; j++) {
        const subjectId = new mongoose.Types.ObjectId().toString();
        const slug = subjects[j].toLowerCase().replace(/\s+/g, '-') + `-class-${i}`;
        await Subject.create({
          _id: subjectId,
          name: subjects[j],
          slug,
          classId,
          description: `${subjects[j]} for Class ${i}`,
          icon: 'book-open',
          color: colors[(i + j) % 12],
          order: j + 1,
          isActive: true,
        });

        const key = `${subjects[j]}-${i}`;
        const chapters = chapterMap[key] || [];
        for (let k = 0; k < chapters.length; k++) {
          await Chapter.create({
            _id: new mongoose.Types.ObjectId().toString(),
            name: chapters[k].name,
            slug: chapters[k].slug,
            subjectId,
            description: chapters[k].desc,
            icon: 'file-text',
            color: colors[(i + j + k) % 12],
            order: k + 1,
            isActive: true,
          });
        }
      }
    }
    console.log('✅ Classes, subjects, chapters seeded!');
  }

  await mongoose.disconnect();

  // Start Next.js dev server
  const PORT = process.env.PORT || '3000';
  process.env.PORT = PORT;
  console.log(`\n🚀 Starting Next.js dev server on port ${PORT}...`);
  const next = spawn('npx', ['next', 'dev', '-p', PORT, '--no-turbopack'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, PORT },
    shell: true,
  });

  next.on('close', (code) => {
    console.log(`\nNext.js exited with code ${code}.`);
    process.exit(code || 0);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    next.kill();
    process.exit(0);
  });
}

main().catch(err => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});
