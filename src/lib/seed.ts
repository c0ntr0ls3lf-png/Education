import { connectDB, Class, Subject, Chapter, Explanation, CreativeQuestion, McqQuestion, Testimonial, FAQ, AdZone, User, Setting, Category, Subcategory } from './db';
import { seedQuotes } from './seed-quotes';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'edulms_salt').digest('hex');
}

const classSubjects: Record<number, { name: string; icon: string; color: string }[]> = {
  1: [
    { name: 'Mathematics', icon: 'calculator', color: '#10B981' },
    { name: 'English', icon: 'book-open', color: '#6366F1' },
    { name: 'EVS', icon: 'leaf', color: '#22C55E' },
  ],
  2: [
    { name: 'Mathematics', icon: 'calculator', color: '#10B981' },
    { name: 'English', icon: 'book-open', color: '#6366F1' },
    { name: 'EVS', icon: 'leaf', color: '#22C55E' },
  ],
  3: [
    { name: 'Mathematics', icon: 'calculator', color: '#10B981' },
    { name: 'English', icon: 'book-open', color: '#6366F1' },
    { name: 'EVS', icon: 'leaf', color: '#22C55E' },
    { name: 'Science', icon: 'flask-conical', color: '#F59E0B' },
  ],
  4: [
    { name: 'Mathematics', icon: 'calculator', color: '#10B981' },
    { name: 'English', icon: 'book-open', color: '#6366F1' },
    { name: 'EVS', icon: 'leaf', color: '#22C55E' },
    { name: 'Science', icon: 'flask-conical', color: '#F59E0B' },
  ],
  5: [
    { name: 'Mathematics', icon: 'calculator', color: '#10B981' },
    { name: 'English', icon: 'book-open', color: '#6366F1' },
    { name: 'EVS', icon: 'leaf', color: '#22C55E' },
    { name: 'Science', icon: 'flask-conical', color: '#F59E0B' },
  ],
  6: [
    { name: 'Mathematics', icon: 'calculator', color: '#10B981' },
    { name: 'English', icon: 'book-open', color: '#6366F1' },
    { name: 'Science', icon: 'flask-conical', color: '#F59E0B' },
    { name: 'Social Science', icon: 'globe', color: '#8B5CF6' },
    { name: 'Hindi', icon: 'languages', color: '#EF4444' },
  ],
  7: [
    { name: 'Mathematics', icon: 'calculator', color: '#10B981' },
    { name: 'English', icon: 'book-open', color: '#6366F1' },
    { name: 'Science', icon: 'flask-conical', color: '#F59E0B' },
    { name: 'Social Science', icon: 'globe', color: '#8B5CF6' },
    { name: 'Hindi', icon: 'languages', color: '#EF4444' },
  ],
  8: [
    { name: 'Mathematics', icon: 'calculator', color: '#10B981' },
    { name: 'English', icon: 'book-open', color: '#6366F1' },
    { name: 'Science', icon: 'flask-conical', color: '#F59E0B' },
    { name: 'Social Science', icon: 'globe', color: '#8B5CF6' },
    { name: 'Hindi', icon: 'languages', color: '#EF4444' },
  ],
  9: [
    { name: 'Mathematics', icon: 'calculator', color: '#10B981' },
    { name: 'English', icon: 'book-open', color: '#6366F1' },
    { name: 'Science', icon: 'flask-conical', color: '#F59E0B' },
    { name: 'Social Science', icon: 'globe', color: '#8B5CF6' },
    { name: 'Hindi', icon: 'languages', color: '#EF4444' },
  ],
  10: [
    { name: 'Physics', icon: 'atom', color: '#3B82F6' },
    { name: 'Chemistry', icon: 'flask-conical', color: '#F59E0B' },
    { name: 'Mathematics', icon: 'calculator', color: '#10B981' },
    { name: 'English', icon: 'book-open', color: '#6366F1' },
    { name: 'Biology', icon: 'dna', color: '#22C55E' },
  ],
  11: [
    { name: 'Physics', icon: 'atom', color: '#3B82F6' },
    { name: 'Chemistry', icon: 'flask-conical', color: '#F59E0B' },
    { name: 'Mathematics', icon: 'calculator', color: '#10B981' },
    { name: 'English', icon: 'book-open', color: '#6366F1' },
    { name: 'Biology', icon: 'dna', color: '#22C55E' },
    { name: 'Computer Science', icon: 'monitor', color: '#EC4899' },
  ],
  12: [
    { name: 'Physics', icon: 'atom', color: '#3B82F6' },
    { name: 'Chemistry', icon: 'flask-conical', color: '#F59E0B' },
    { name: 'Mathematics', icon: 'calculator', color: '#10B981' },
    { name: 'English', icon: 'book-open', color: '#6366F1' },
    { name: 'Biology', icon: 'dna', color: '#22C55E' },
    { name: 'Computer Science', icon: 'monitor', color: '#EC4899' },
  ],
};

const classColors = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
  '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
  '#A855F7', '#EC4899',
];

const classIcons = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
];

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seedClasses() {
  const existing = await Class.countDocuments();
  if (existing > 0) {
    console.log('Classes already exist, skipping...');
    return;
  }

  const academicCategory = await Category.findOne({ slug: 'academic-curriculum' }).lean();
  const primarySub = await Subcategory.findOne({ name: 'Primary Education' }).lean();
  const secondarySub = await Subcategory.findOne({ name: 'Secondary Education' }).lean();
  const higherSecondarySub = await Subcategory.findOne({ name: 'Higher Secondary Education' }).lean();

  const categoryId = academicCategory ? String(academicCategory._id) : null;

  for (let i = 1; i <= 12; i++) {
    let subcategoryId: string | null = null;
    if (i <= 5) {
      subcategoryId = primarySub ? String(primarySub._id) : null;
    } else if (i <= 10) {
      subcategoryId = secondarySub ? String(secondarySub._id) : null;
    } else {
      subcategoryId = higherSecondarySub ? String(higherSecondarySub._id) : null;
    }

    await Class.create({
      name: `Class ${i}`,
      slug: `class-${i}`,
      number: i,
      description: `Educational content for Class ${i} students`,
      icon: classIcons[i - 1],
      color: classColors[i - 1],
      order: i,
      isActive: true,
      categoryId,
      subcategoryId,
    });
  }
  console.log('✅ 12 classes created');
}

async function seedSubjects() {
  const existing = await Subject.countDocuments();
  if (existing > 0) {
    console.log('Subjects already exist, skipping...');
    return;
  }

  for (let i = 1; i <= 12; i++) {
    const classRecord = await Class.findOne({ number: i }).lean();
    if (!classRecord) continue;

    const subjects = classSubjects[i] || [];
    for (let j = 0; j < subjects.length; j++) {
      const subj = subjects[j];
      await Subject.create({
          name: subj.name,
          slug: `${subj.name.toLowerCase().replace(/\s+/g, '-')}-class-${i}`,
          classId: classRecord._id,
          description: `${subj.name} for Class ${i}`,
          icon: subj.icon,
          color: subj.color,
          order: j + 1,
          isActive: true,
  });
    }
  }
  console.log('✅ Subjects created');
}

async function seedChapters() {
  const existing = await Chapter.countDocuments();
  if (existing > 0) {
    console.log('Chapters already exist, skipping...');
    return;
  }

  // Get Class 10 Physics subject
  const class10 = await Class.findOne({ number: 10 }).lean();
  if (!class10) return;

  const physicsSubject = await Subject.findOne({ classId: class10._id, name: 'Physics' }).lean();
  if (!physicsSubject) return;

  const chapters = [
    {
      name: 'Motion',
      slug: 'motion',
      description: 'Study of motion, velocity, acceleration, and equations of motion',
      icon: 'move',
      color: '#3B82F6',
      sidebarContent: '<h3>📌 Key Formulas</h3><p><strong>1st Equation:</strong> v = u + at</p><p><strong>2nd Equation:</strong> s = ut + ½at²</p><p><strong>3rd Equation:</strong> v² = u² + 2as</p><h3>📝 Important Points</h3><ul><li>Uniform motion → constant velocity</li><li>Non-uniform → changing velocity</li><li>Acceleration due to gravity: g = 9.8 m/s²</li></ul>',
    },
    {
      name: 'Electricity',
      slug: 'electricity',
      description: 'Electric current, resistance, Ohm\'s law, and electrical circuits',
      icon: 'zap',
      color: '#F59E0B',
      sidebarContent: '<h3>📌 Key Formulas</h3><p><strong>Ohm\'s Law:</strong> V = IR</p><p><strong>Power:</strong> P = VI = I²R</p><p><strong>Series:</strong> R = R₁ + R₂</p><p><strong>Parallel:</strong> 1/R = 1/R₁ + 1/R₂</p>',
    },
    {
      name: 'Light',
      slug: 'light',
      description: 'Reflection, refraction, lenses, and optical phenomena',
      icon: 'sun',
      color: '#22C55E',
      sidebarContent: '<h3>📌 Key Formulas</h3><p><strong>Mirror Formula:</strong> 1/f = 1/v + 1/u</p><p><strong>Lens Formula:</strong> 1/f = 1/v - 1/u</p><p><strong>Snell\'s Law:</strong> n₁sinθ₁ = n₂sinθ₂</p>',
    },
    {
      name: 'Sound',
      slug: 'sound',
      description: 'Sound waves, frequency, amplitude, and acoustic phenomena',
      icon: 'volume-2',
      color: '#8B5CF6',
      sidebarContent: '<h3>📌 Key Facts</h3><p>Speed of sound in air: 340 m/s</p><p><strong>Echo:</strong> min distance = 17 m</p><p><strong>Frequency range:</strong> 20 Hz – 20,000 Hz</p>',
    },
    {
      name: 'Magnetism',
      slug: 'magnetism',
      description: 'Magnetic fields, electromagnetic induction, and applications',
      icon: 'magnet',
      color: '#EF4444',
      sidebarContent: '<h3>📌 Key Laws</h3><p><strong>Fleming\'s Left Hand Rule:</strong> Force on conductor</p><p><strong>Faraday\'s Law:</strong> EMF = -dΦ/dt</p>',
    },
  ];

  for (let i = 0; i < chapters.length; i++) {
    await Chapter.create({
        name: chapters[i].name,
        slug: chapters[i].slug,
        subjectId: physicsSubject._id,
        description: chapters[i].description,
        icon: chapters[i].icon,
        color: chapters[i].color,
        order: i + 1,
        isActive: true,
  });
  }
  console.log('✅ Chapters created for Class 10 Physics');
}

async function seedExplanations() {
  const existing = await Explanation.countDocuments();
  if (existing > 0) {
    console.log('Explanations already exist, skipping...');
    return;
  }

  const class10 = await Class.findOne({ number: 10 }).lean();
  if (!class10) return;
  const physicsSubject = await Subject.findOne({ classId: class10._id, name: 'Physics' }).lean();
  if (!physicsSubject) return;

  const chapters = await Chapter.find({ subjectId: physicsSubject._id }).sort({ order: 1 }).lean();

  const explanationsData: Record<string, { question: string; solution: string; videoUrl: string; difficulty: string; tags: string }[]> = {
    Motion: [
      {
        question: 'গতির প্রথম সমীকরণটি কী এবং এটি কীভাবে কাজ করে?',
        solution: 'গতির প্রথম সমীকরণটি হলো আদিবেগ, সুষম ত্বরণ, সময় এবং শেষ বেগের মধ্যকার সম্পর্ক:\n\n$$v = u + at$$\n\nএখানে:\n- $v$ = শেষ বেগ ($\\text{m/s}$)\n- $u$ = আদিবেগ ($\\text{m/s}$)\n- $a$ = সুষম ত্বরণ ($\\text{m/s}^2$)\n- $t$ = সময় ($\\text{s}$)\n\nযদি বস্তুটি স্থির অবস্থান থেকে চলা শুরু করে, তবে আদিবেগ $u = 0$, ফলে সমীকরণটি দাঁড়ায় $v = at$।',
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        difficulty: 'easy',
        tags: 'গতির সমীকরণ,গতিবিদ্যা',
      },
      {
        question: 'গতির দ্বিতীয় সমীকরণটি ($s = ut + \\frac{1}{2}at^2$) প্রতিপাদন করো।',
        solution: 'গতির দ্বিতীয় সমীকরণটি হলো সরণের সমীকরণ:\n\n$$s = ut + \\frac{1}{2}at^2$$\n\n**প্রতিপাদন:**\nআমরা জানি, অতিক্রান্ত দূরত্ব = গড় বেগ × সময়।\n\n$$s = \\frac{u + v}{2} \\times t$$\n\nআবার, গতির প্রথম সমীকরণ থেকে পাই, $v = u + at$। $v$-এর মান উপরে বসিয়ে পাই:\n\n$$s = \\frac{u + (u + at)}{2} \\times t$$\n\n$$s = \\frac{2u + at}{2} \\times t$$\n\n$$s = \\left(u + \\frac{1}{2}at\\right) \\times t$$\n\n$$s = ut + \\frac{1}{2}at^2$$',
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        difficulty: 'medium',
        tags: 'গতির সমীকরণ,প্রতিপাদন',
      },
      {
        question: 'গতির তৃতীয় সমীকরণটি কী এবং এর গুরুত্ব কী?',
        solution: 'গতির তৃতীয় সমীকরণটি হলো:\n\n$$v^2 = u^2 + 2as$$\n\nএই সমীকরণটিতে সময়ের ($t$) কোনো উল্লেখ নেই। যখন কোনো গাণিতিক সমস্যায় সময় দেওয়া থাকে না, তখন আদিবেগ, শেষ বেগ, ত্বরণ বা সরণ নির্ণয় করতে এটি অত্যন্ত কার্যকর।',
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        difficulty: 'medium',
        tags: 'গতির সমীকরণ,গতিবিদ্যা',
      },
      {
        question: 'একটি গাড়ি স্থির অবস্থান থেকে যাত্রা শুরু করে $2\\,\\text{m/s}^2$ সুষম ত্বরণে ১০ সেকেন্ড চলে। গাড়িটির অতিক্রান্ত দূরত্ব কত?',
        solution: 'দেওয়া আছে:\n- আদিবেগ, $u = 0$ (স্থির অবস্থান)\n- ত্বরণ, $a = 2\\,\\text{m/s}^2$\n- সময়, $t = 10\\,\\text{s}$\n\nআমরা জানি,\n$$s = ut + \\frac{1}{2}at^2$$\n\n$$s = 0 \\times 10 + \\frac{1}{2} \\times 2 \\times (10)^2$$\n\n$$s = 0 + 100 = 100\\,\\text{m}$$\n\nঅর্থাৎ, গাড়িটি ১০০ মিটার দূরত্ব অতিক্রম করবে।',
        videoUrl: 'https://www.youtube.com/watch?v=example4',
        difficulty: 'easy',
        tags: 'গাণিতিক সমাধান,গতির সমীকরণ',
      },
      {
        question: 'দূরত্ব ও সরণের মধ্যে পার্থক্য কী?',
        solution: '**দূরত্ব (Distance):** পারিপার্শ্বিকের সাপেক্ষে কোনো বস্তুর অবস্থানের পরিবর্তনের মোট দৈর্ঘ্যকে দূরত্ব বলে। এটি একটি স্কেলার রাশি। এর কোনো নির্দিষ্ট দিক নেই।\n\n**সরণ (Displacement):** পারিপার্শ্বিকের সাপেক্ষে কোনো বস্তুর আদি অবস্থান এবং শেষ অবস্থানের মধ্যবর্তী সর্বনিম্ন সরলরৈখিক দূরত্বকে সরণ বলে। এটি একটি ভেক্টর রাশি এবং এর একটি নির্দিষ্ট দিক রয়েছে।\n\nযেমন, কোনো বৃত্তাকার পথে পুরো এক চক্কর ঘুরে আসলে অতিক্রান্ত দূরত্ব হবে বৃত্তের পরিধি, কিন্তু সরণ হবে শূন্য।\n\n$$|\\vec{d}| \\leq \\text{দূরত্ব}$$',
        videoUrl: 'https://www.youtube.com/watch?v=example5',
        difficulty: 'easy',
        tags: 'দূরত্ব,সরণ,ভেক্টর',
      }
    ],
    Electricity: [
      {
        question: 'ওহমের সূত্রটি ব্যাখ্যা করো।',
        solution: '**ওহমের সূত্র (Ohm\'s Law):** তাপমাত্রা স্থির থাকলে কোনো পরিবাহীর মধ্য দিয়ে যে তড়িৎ প্রবাহ চলে, তা পরিবাহীর দুই প্রান্তের বিভব পার্থক্যের সমানুপাতিক।\n\n$$V = IR$$\n\nএখানে:\n- $V$ = বিভব পার্থক্য (ভোল্ট, $\\text{V}$)\n- $I$ = তড়িৎ প্রবাহ (অ্যাম্পিয়ার, $\\text{A}$)\n- $R$ = পরিবাহীর রোধ (ওহম, $\\Omega$)',
        videoUrl: 'https://www.youtube.com/watch?v=elec1',
        difficulty: 'easy',
        tags: 'ওহমের সূত্র,রোধ',
      },
      {
        question: 'শ্রেণি সংযোগে রোধের তুল্য রোধের সমীকরণ প্রতিপাদন করো।',
        solution: 'রোধের **শ্রেণি সংযোগ (Series Combination)**-এর ক্ষেত্রে প্রতিটি রোধের মধ্য দিয়ে একই তড়িৎ প্রবাহ প্রবাহিত হয়, এবং মোট বিভব পার্থক্য প্রতিটি রোধের বিভব পার্থক্যের সমষ্টির সমান হয়।\n\n$$V = V_1 + V_2 + V_3$$\n\nওহমের সূত্রানুযায়ী ($V = IR$):\n\n$$IR_s = IR_1 + IR_2 + IR_3$$\n\n$$R_s = R_1 + R_2 + R_3$$\n\n$n$ সংখ্যক রোধের ক্ষেত্রে:\n\n$$R_s = \\sum_{i=1}^{n} R_i$$',
        videoUrl: 'https://www.youtube.com/watch?v=elec2',
        difficulty: 'medium',
        tags: 'শ্রেণি সংযোগ,রোধ,বর্তনী',
      },
      {
        question: 'সমান্তরাল সংযোগে রোধের তুল্য রোধের সমীকরণ প্রতিপাদন করো।',
        solution: 'রোধের **সমান্তরাল সংযোগ (Parallel Combination)**-এর ক্ষেত্রে প্রতিটি রোধের দুই প্রান্তের বিভব পার্থক্য একই থাকে, এবং মোট তড়িৎ প্রবাহ প্রতিটি রোধের মধ্য দিয়ে প্রবাহিত তড়িৎ প্রবাহের সমষ্টির সমান হয়।\n\n$$I = I_1 + I_2 + I_3$$\n\nওহমের সূত্রানুযায়ী ($I = V/R$):\n\n$$\\frac{V}{R_p} = \\frac{V}{R_1} + \\frac{V}{R_2} + \\frac{V}{R_3}$$\n\n$$\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$$\n\n$n$ সংখ্যক রোধের ক্ষেত্রে:\n\n$$\\frac{1}{R_p} = \\sum_{i=1}^{n} \\frac{1}{R_i}$$',
        videoUrl: 'https://www.youtube.com/watch?v=elec3',
        difficulty: 'medium',
        tags: 'সমান্তরাল সংযোগ,রোধ,বর্তনী',
      }
    ],
    Light: [
      {
        question: 'আলোর প্রতিসরণের সূত্র দুটি কী কী?',
        solution: '**প্রথম সূত্র:** আপতিত রশ্মি, প্রতিসরিত রশ্মি এবং আপতন বিন্দুতে বিভেদতলের ওপর অঙ্কিত অভিলম্ব একই সমতলে থাকে।\n\n**দ্বিতীয় সূত্র (স্নেলের সূত্র):** একজোড়া নির্দিষ্ট মাধ্যম এবং নির্দিষ্ট রঙের আলোর জন্য আপতন কোণের সাইন ($\\sin i$) এবং প্রতিসরণ কোণের সাইনের ($\\sin r$) অনুপাত সর্বদা একটি ধ্রুবক থাকে।\n\n$$\\frac{\\sin i}{\\sin r} = \\eta$$',
        videoUrl: 'https://www.youtube.com/watch?v=light1',
        difficulty: 'easy',
        tags: 'প্রতিসরণ,আলোকবিজ্ঞান',
      },
      {
        question: 'আলোর পূর্ণ অভ্যন্তরীণ প্রতিফলন কী এবং এর শর্তাবলি লেখো।',
        solution: 'আলো যখন ঘন মাধ্যম থেকে হালকা মাধ্যমে প্রবেশ করার সময় আপতন কোণ সংকট কোণের চেয়ে বড় হয়, তখন প্রতিসরণের পরিবর্তে রশ্মিটি সম্পূর্ণভাবে ঘন মাধ্যমে প্রতিফলিত হয়। এই ঘটনাকে **পূর্ণ অভ্যন্তরীণ প্রতিফলন** বলে।\n\n**শর্তাবলি:**\n১. আলোকে অবশ্যই ঘন মাধ্যম থেকে হালকা মাধ্যমে যেতে হবে。\n২. ঘন মাধ্যমে আপতন কোণের মান সংকট কোণের (Critical Angle) চেয়ে বড় হতে হবে।',
        videoUrl: 'https://www.youtube.com/watch?v=light5',
        difficulty: 'medium',
        tags: 'প্রতিফলন,সংকট কোণ',
      }
    ],
    Sound: [
      {
        question: 'শব্দ তরঙ্গ কী এবং এটি কীভাবে সঞ্চালিত হয়?',
        solution: 'শব্দ এক প্রকার অনুদৈর্ঘ্য স্থিতিস্থাপক তরঙ্গ যা সঞ্চালনের জন্য জড় মাধ্যমের প্রয়োজন হয়। শব্দ তরঙ্গ মাধ্যমের সংকোচন ও প্রসারণের মাধ্যমে অগ্রসর হয়।\n\nশব্দের বেগ, কম্পাঙ্ক ও তরঙ্গদৈর্ঘ্যের সম্পর্ক:\n$$v = f\\lambda$$\n\nএখানে:\n- $v$ = শব্দের বেগ ($\\text{m/s}$)\n- $f$ = কম্পাঙ্ক ($\\text{Hz}$)\n- $\\lambda$ = তরঙ্গদৈর্ঘ্য ($\\text{m}$)\n\nশব্দ শুন্য মাধ্যমে চলতে পারে না।',
        videoUrl: 'https://www.youtube.com/watch?v=sound1',
        difficulty: 'easy',
        tags: 'শব্দ,তরঙ্গ,মাধ্যমিক',
      }
    ],
    Magnetism: [
      {
        question: 'তড়িৎ চৌম্বক আবেশ কাকে বলে?',
        solution: 'একটি গতিশীল চৌম্বক বা তড়িৎবাহী কুণ্ডলীর প্রভাবে অন্য একটি কুণ্ডলীতে ক্ষণস্থায়ী তড়িৎচালক বল বা তড়িৎ প্রবাহ উৎপন্ন হওয়ার ঘটনাকে **তড়িৎ চৌম্বক আবেশ** বলে। উৎপন্ন তড়িৎচালক বলকে আবিষ্ট তড়িৎচালক বল এবং তড়িৎ প্রবাহকে আবিষ্ট তড়িৎ প্রবাহ বলে।',
        videoUrl: 'https://www.youtube.com/watch?v=mag1',
        difficulty: 'easy',
        tags: 'তড়িৎ চৌম্বক আবেশ,চৌম্বকত্ব',
      }
    ]
  };

  for (const chapter of chapters) {
    const chapterExplanations = explanationsData[chapter.name] || [];
    for (let i = 0; i < chapterExplanations.length; i++) {
      const exp = chapterExplanations[i];
      await Explanation.create({
          chapterId: chapter._id,
          question: exp.question,
          solution: exp.solution,
          videoUrl: exp.videoUrl,
          order: i + 1,
          difficulty: exp.difficulty,
          tags: exp.tags,
          isActive: true,
      });
    }
  }
  console.log('✅ Explanations created');
}

async function seedCreativeQuestions() {
  const existing = await CreativeQuestion.countDocuments();
  if (existing > 0) {
    console.log('Creative questions already exist, skipping...');
    return;
  }

  const class10 = await Class.findOne({ number: 10 }).lean();
  if (!class10) return;
  const physicsSubject = await Subject.findOne({ classId: class10._id, name: 'Physics' }).lean();
  if (!physicsSubject) return;

  const chapters = await Chapter.find({ subjectId: physicsSubject._id }).sort({ order: 1 }).lean();

  const creativeData: Record<string, { label: string; question: string; answer: string; marks: number; difficulty: string; explanation: string }[]> = {
    Motion: [
      {
        label: 'ক',
        question: 'বেগ ও ত্বরণ কাকে বলে?',
        answer: 'একটি বস্তু প্রতি একক সময়ে যে পরিমাণ সরণ ঘটায় তাকে বেগ বলে।\n$$v = \\frac{s}{t}$$\n\nবেগের পরিবর্তনের হারকে ত্বরণ বলে।\n$$a = \\frac{v - u}{t}$$',
        marks: 2,
        difficulty: 'easy',
        explanation: 'বেগ হলো ভেক্টর রাশি এবং ত্বরণও একটি ভেক্টর রাশি।'
      },
      {
        label: 'খ',
        question: 'সমবেগ ও সুষম ত্বরণ গতির মধ্যে পার্থক্য লেখো।',
        answer: 'সমবেগ গতিতে বস্তুর বেগ সময়ের সাথে পরিবর্তিত হয় না, অর্থাৎ ত্বরণ শূন্য।\n\nসুষম ত্বরণ গতিতে বস্তুর বেগ সময়ের সাথে সমানভাবে বাড়ে বা কমে, অর্থাৎ ত্বরণ ধ্রুবক।',
        marks: 4,
        difficulty: 'medium',
        explanation: 'সমবেগে v-t গ্রাফ x-অক্ষের সমান্তরাল এবং সুষম ত্বরণে v-t গ্রাফ একটি সরলরেখা।'
      },
      {
        label: 'গ',
        question: 'একটি ট্রেন স্থির অবস্থান থেকে ছেড়ে $5\\,\\text{m/s}^2$ ত্বরণে চলতে শুরু করে। ১০ সেকেন্ড পর ট্রেনটির বেগ ও অতিক্রান্ত দূরত্ব নির্ণয় করো।',
        answer: 'দেওয়া আছে: আদিবেগ $u = 0$, ত্বরণ $a = 5\\,\\text{m/s}^2$, সময় $t = 10\\,\\text{s}$\n\nবেগ নির্ণয়:\n$$v = u + at = 0 + 5 \\times 10 = 50\\,\\text{m/s}$$\n\nঅতিক্রান্ত দূরত্ব নির্ণয়:\n$$s = ut + \\frac{1}{2}at^2 = 0 + \\frac{1}{2} \\times 5 \\times (10)^2 = 250\\,\\text{m}$$',
        marks: 4,
        difficulty: 'medium',
        explanation: 'গতির সমীকরণ প্রয়োগ করে বেগ ও দূরত্ব নির্ণয় করা হয়।'
      },
      {
        label: 'ঘ',
        question: 'গতির তিনটি সমীকরণ প্রতিপাদন করো এবং একটি পাথর $80\\,\\text{m}$ উঁচু থেকে ফেলা হলে মাটিতে পৌঁছাতে কত সময় লাগবে তা নির্ণয় করো। ($g = 10\\,\\text{m/s}^2$)',
        answer: '**গতির তিনটি সমীকরণ:**\n$$v = u + at \\quad \\cdots (i)$$\n$$s = ut + \\frac{1}{2}at^2 \\quad \\cdots (ii)$$\n$$v^2 = u^2 + 2as \\quad \\cdots (iii)$$\n\n**সমাধান:**\nপাথরটি স্থির অবস্থান থেকে পড়ছে, তাই $u = 0$\n$s = 80\\,\\text{m}$, $a = g = 10\\,\\text{m/s}^2$\n\nসমীকরণ (ii) থেকে:\n$$80 = 0 + \\frac{1}{2} \\times 10 \\times t^2$$\n$$80 = 5t^2$$\n$$t^2 = 16$$\n$$t = 4\\,\\text{s}$$',
        marks: 5,
        difficulty: 'hard',
        explanation: 'মুক্তভাবে পড়ন্ত বস্তুর ক্ষেত্রে আদিবেগ শূন্য এবং ত্বরণ হলো অভিকর্ষজ ত্বরণ।'
      }
    ],
    Electricity: [
      {
        label: 'ক',
        question: 'ওহমের সূত্রটি বিবৃত করো।',
        answer: 'তাপমাত্রা স্থির থাকলে কোনো পরিবাহীর মধ্য দিয়ে যে তড়িৎ প্রবাহ চলে, তা পরিবাহীর দুই প্রান্তের বিভব পার্থক্যের সমানুপাতিক। অর্থাৎ, $V \\propto I$, বা $V = IR$, যেখানে $R$ হলো রোধ।',
        marks: 2,
        difficulty: 'easy',
        explanation: 'ওহমের সূত্রের সাহায্যে যেকোনো সহজ বর্তনী বিশ্লেষণ করা যায়।'
      },
      {
        label: 'খ',
        question: 'শ্রেণি ও সমান্তরাল সংযোগের মধ্যে পার্থক্য লেখো।',
        answer: '**শ্রেণি সংযোগে:**\n- সব রোধে একই তড়িৎ প্রবাহিত হয়।\n- তুল্য রোধ, $R_s = R_1 + R_2 + R_3$ (বৃদ্ধি পায়)।\n\n**সমান্তরাল সংযোগে:**\n- সব রোধে একই বিভব পার্থক্য থাকে।\n- তুল্য রোধ, $\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$ (হ্রাস পায়)।',
        marks: 4,
        difficulty: 'medium',
        explanation: 'ঘরবাড়ির বৈদ্যুতিক সংযোগ সাধারণত সমান্তরালে করা হয়।'
      },
      {
        label: 'গ',
        question: '$4\\,\\Omega$, $6\\,\\Omega$ এবং $12\\,\\Omega$ এর তিনটি রোধ সমান্তরালে $6\\,\\text{V}$ একটি ব্যাটারিতে সংযুক্ত করা হলো। তুল্য রোধ ও মোট তড়িৎ প্রবাহ নির্ণয় করো।',
        answer: 'তুল্য রোধ নির্ণয়:\n$$\\frac{1}{R_p} = \\frac{1}{4} + \\frac{1}{6} + \\frac{1}{12} = \\frac{3+2+1}{12} = \\frac{6}{12} = \\frac{1}{2}$$\n$$R_p = 2\\,\\Omega$$\n\nমোট তড়িৎ প্রবাহ:\n$$I = \\frac{V}{R_p} = \\frac{6}{2} = 3\\,\\text{A}$$',
        marks: 4,
        difficulty: 'medium',
        explanation: 'সমান্তরাল সংযোগে তুল্য রোধ সবচেয়ে ছোট রোধের চেয়েও ছোট হয়।'
      },
      {
        label: 'ঘ',
        question: 'তড়িৎ ক্ষমতা ও তড়িৎ শক্তির সম্পর্ক ব্যাখ্যা করো এবং একটি বাড়িতে ১০টি ১০০ ওয়াটের বাল্ব প্রতিদিন ৬ ঘণ্টা ব্যবহার করলে প্রতি মাসে (৩০ দিনে) কত ইউনিট বিদ্যুৎ খরচ হবে তা নির্ণয় করো।',
        answer: '**তড়িৎ ক্ষমতা:** $P = VI = I^2R = \\frac{V^2}{R}$, একক: ওয়াট (W)\n\n**তড়িৎ শক্তি:** $E = Pt$, একক: জুল (J) বা ওয়াট-ঘণ্টা (Wh)\n\n**সমাধান:**\nমোট ক্ষমতা = $10 \\times 100 = 1000\\,\\text{W} = 1\\,\\text{kW}$\n\nএক মাসে মোট সময় = $6 \\times 30 = 180\\,\\text{ঘণ্টা}$\n\nমোট বিদ্যুৎ শক্তি = $1\\,\\text{kW} \\times 180\\,\\text{h} = 180\\,\\text{kWh} = 180$ ইউনিট',
        marks: 5,
        difficulty: 'hard',
        explanation: '১ ইউনিট = ১ কিলোওয়াট-ঘণ্টা (kWh)।'
      }
    ],
    Light: [
      {
        label: 'ক',
        question: 'প্রতিসরণাঙ্ক কাকে বলে?',
        answer: 'দুটি মাধ্যমের বিভেদতলে আলো প্রতিসৃত হওয়ার সময় আপতন কোণের সাইন ও প্রতিসরণ কোণের সাইনের অনুপাতকে প্রথম মাধ্যমের সাপেক্ষে দ্বিতীয় মাধ্যমের প্রতিসরণাঙ্ক বলে।\n$$n = \\frac{\\sin i}{\\sin r}$$',
        marks: 2,
        difficulty: 'easy',
        explanation: 'প্রতিসরণাঙ্ক একটি অনুপাত, তাই এটি একটি মাত্রাহীন রাশি।'
      },
      {
        label: 'খ',
        question: 'পূর্ণ অভ্যন্তরীণ প্রতিফলনের শর্ত দুটি কী কী এবং এই ঘটনার দুটি ব্যবহারিক প্রয়োগ লেখো।',
        answer: '**শর্ত:**\n১. আলোকে ঘন মাধ্যম থেকে হালকা মাধ্যমে যেতে হবে।\n২. ঘন মাধ্যমে আপতন কোণকে সংকট কোণের চেয়ে বড় হতে হবে।\n\n**ব্যবহারিক প্রয়োগ:**\n১. অপটিক্যাল ফাইবার — ইন্টারনেট ও টেলিযোগাযোগে ব্যবহৃত হয়।\n২. হীরার দীপ্তি — হীরার কাটা এমনভাবে করা হয় যাতে আলো বারবার পূর্ণ অভ্যন্তরীণ প্রতিফলন হয়ে ঝলমলে দেখায়।',
        marks: 4,
        difficulty: 'medium',
        explanation: 'পূর্ণ অভ্যন্তরীণ প্রতিফলনে কোনো শক্তির অপচয় হয় না।'
      },
      {
        label: 'গ',
        question: 'একটি বস্তু উত্তল লেন্সের সামনে $30\\,\\text{cm}$ দূরে রাখা হলো। লেন্সটির ফোকাস দূরত্ব $20\\,\\text{cm}$ হলে প্রতিবিম্বের অবস্থান, প্রকৃতি ও বিবর্ধন নির্ণয় করো।',
        answer: 'দেওয়া আছে: $u = -30\\,\\text{cm}$, $f = +20\\,\\text{cm}$\n\nলেন্স সূত্র: $\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}$\n$$\\frac{1}{v} = \\frac{1}{f} + \\frac{1}{u} = \\frac{1}{20} + \\frac{1}{-30} = \\frac{3-2}{60} = \\frac{1}{60}$$\n$$v = +60\\,\\text{cm}$$\n\nপ্রতিবিম্ব লেন্সের অপর পাশে $60\\,\\text{cm}$ দূরে গঠিত হবে (বাস্তব ও উল্টো)।\n\nবিবর্ধন: $m = \\frac{v}{u} = \\frac{60}{-30} = -2$ (উল্টো ও বিবর্ধিত)',
        marks: 4,
        difficulty: 'medium',
        explanation: 'উত্তল লেন্সে আলোকবস্তু ফোকাসের বাইরে থাকলে বাস্তব প্রতিবিম্ব গঠিত হয়।'
      },
      {
        label: 'ঘ',
        question: 'আলোর বিচ্ছুরণ ব্যাখ্যা করো এবং রামধনু সৃষ্টির কারণ বিশ্লেষণ করো।',
        answer: '**আলোর বিচ্ছুরণ:** যখন সাদা আলো কাচের প্রিজমের মধ্য দিয়ে যায়, তখন এটি সাতটি বর্ণে বিভক্ত হয় (বেনীআসহকলা)। এই ঘটনাকে আলোর বিচ্ছুরণ বলে।\n\nভিন্ন বর্ণের আলোর প্রতিসরণাঙ্ক ভিন্ন বলে বিচ্ছুরণ ঘটে:\n- বেগুনি আলো: প্রতিসরণাঙ্ক বেশি, বিচ্যুতি বেশি\n- লাল আলো: প্রতিসরণাঙ্ক কম, বিচ্যুতি কম\n\n**রামধনু:** বৃষ্টির পর বায়ুমণ্ডলে থাকা ক্ষুদ্র জলকণাগুলো প্রিজমের মতো কাজ করে সূর্যের সাদা আলোকে বিচ্ছুরিত করে রামধনু তৈরি করে।',
        marks: 5,
        difficulty: 'hard',
        explanation: 'বিচ্ছুরণের ফলে VIBGYOR বা বেনীআসহকলা (বেগুনি, নীল, আকাশি, সবুজ, হলুদ, কমলা, লাল) রং পাওয়া যায়।'
      }
    ],
    Sound: [
      {
        label: 'ক',
        question: 'শ্রাব্যতার সীমা কাকে বলে?',
        answer: 'মানুষের কান যে কম্পাঙ্ক পরিসরের শব্দ শুনতে পায় তাকে শ্রাব্যতার সীমা বলে। মানুষের কানের শ্রাব্যতার সীমা $20\\,\\text{Hz}$ থেকে $20{,}000\\,\\text{Hz}$ পর্যন্ত।',
        marks: 2,
        difficulty: 'easy',
        explanation: 'এই সীমার বাইরের শব্দ ইনফ্রাসনিক বা আলট্রাসনিক।'
      },
      {
        label: 'খ',
        question: 'প্রতিধ্বনি ও অনুরণন কী? প্রতিধ্বনি শুনতে হলে প্রতিফলক পৃষ্ঠের ন্যূনতম দূরত্ব কত হতে হবে?',
        answer: '**প্রতিধ্বনি (Echo):** মূল শব্দ থামার পর কোনো বাধা থেকে প্রতিফলিত হয়ে যে শব্দ শোনা যায় তাকে প্রতিধ্বনি বলে।\n\n**অনুরণন (Reverberation):** একটি বদ্ধ স্থানে শব্দের বারবার প্রতিফলনের ফলে শব্দ দীর্ঘস্থায়ী হওয়ার ঘটনাকে অনুরণন বলে।\n\n**ন্যূনতম দূরত্ব:**\nশ্রবণের স্থায়িত্ব $= 0.1\\,\\text{s}$, শব্দের বেগ $= 340\\,\\text{m/s}$\n$$d = \\frac{v \\times t}{2} = \\frac{340 \\times 0.1}{2} = 17\\,\\text{m}$$',
        marks: 4,
        difficulty: 'medium',
        explanation: 'শব্দকে প্রতিফলক পৃষ্ঠে পৌঁছে ফিরে আসতে মোট ০.১ সেকেন্ড বা বেশি সময় লাগতে হয়।'
      },
      {
        label: 'গ',
        question: 'একটি শব্দ তরঙ্গের কম্পাঙ্ক $500\\,\\text{Hz}$ এবং তরঙ্গদৈর্ঘ্য $0.68\\,\\text{m}$। শব্দের বেগ ও পর্যায়কাল নির্ণয় করো।',
        answer: 'দেওয়া আছে: $f = 500\\,\\text{Hz}$, $\\lambda = 0.68\\,\\text{m}$\n\nশব্দের বেগ:\n$$v = f \\times \\lambda = 500 \\times 0.68 = 340\\,\\text{m/s}$$\n\nপর্যায়কাল:\n$$T = \\frac{1}{f} = \\frac{1}{500} = 0.002\\,\\text{s} = 2\\,\\text{ms}$$',
        marks: 4,
        difficulty: 'medium',
        explanation: 'কম্পাঙ্ক ও তরঙ্গদৈর্ঘ্যের গুণফল সবসময় শব্দের বেগের সমান।'
      },
      {
        label: 'ঘ',
        question: 'আলট্রাসনিক ও ইনফ্রাসনিক তরঙ্গের পার্থক্য এবং আলট্রাসনিক তরঙ্গের ব্যবহারিক প্রয়োগ ব্যাখ্যা করো।',
        answer: '| বৈশিষ্ট্য | আলট্রাসনিক | ইনফ্রাসনিক |\n|---|---|---|\n| কম্পাঙ্ক | $> 20{,}000\\,\\text{Hz}$ | $< 20\\,\\text{Hz}$ |\n| শ্রাব্যতা | মানুষ শুনতে পায় না | মানুষ শুনতে পায় না |\n| উদাহরণ | বাদুড়, ডলফিন | হাতি, তিমি |\n\n**আলট্রাসনিকের প্রয়োগ:**\n- চিকিৎসায় আলট্রাসাউন্ড স্ক্যান\n- SONAR (সমুদ্রের গভীরতা মাপা)\n- শিল্পে ধাতু পরিষ্কার করা\n- মাছ ধরায় (মাছের অবস্থান নির্ণয়)',
        marks: 5,
        difficulty: 'hard',
        explanation: 'আলট্রাসনিক তরঙ্গ চিকিৎসা ক্ষেত্রে বিশেষভাবে গুরুত্বপূর্ণ।'
      }
    ],
    Magnetism: [
      {
        label: 'ক',
        question: 'তড়িৎ চৌম্বক আবেশ কী?',
        answer: 'চৌম্বক ক্ষেত্রের পরিবর্তনের কারণে কোনো পরিবাহী কুণ্ডলীতে তড়িৎচালক বল বা তড়িৎ প্রবাহ আবিষ্টিত হওয়ার ঘটনাকে তড়িৎ চৌম্বক আবেশ বলে।',
        marks: 2,
        difficulty: 'easy',
        explanation: 'ফ্যারাডে এই ঘটনা আবিষ্কার করেন।'
      },
      {
        label: 'খ',
        question: 'ফ্যারাডের তড়িৎ চৌম্বক আবেশের সূত্র দুটি লেখো।',
        answer: '**ফ্যারাডের প্রথম সূত্র:** চৌম্বক ফ্লাক্সের পরিবর্তন হলে পরিবাহী কুণ্ডলীতে তড়িৎচালক বল আবিষ্ট হয়।\n\n**ফ্যারাডের দ্বিতীয় সূত্র:** কুণ্ডলীতে আবিষ্ট তড়িৎচালক বলের মান চৌম্বক ফ্লাক্সের পরিবর্তনের হারের সমানুপাতিক।\n$$\\varepsilon = -N\\frac{\\Delta\\phi}{\\Delta t}$$',
        marks: 4,
        difficulty: 'medium',
        explanation: 'ঋণাত্মক চিহ্নটি লেঞ্জের সূত্র নির্দেশ করে।'
      },
      {
        label: 'গ',
        question: 'একটি ট্রান্সফর্মারের প্রাথমিক কুণ্ডলীতে ৫০০ পাক ও দ্বিতীয়ক কুণ্ডলীতে ২০০০ পাক আছে। প্রাথমিক কুণ্ডলীতে $220\\,\\text{V}$ প্রয়োগ করলে দ্বিতীয়ক কুণ্ডলীতে কত ভোল্ট পাওয়া যাবে?',
        answer: 'দেওয়া আছে:\n$N_p = 500$, $N_s = 2000$, $V_p = 220\\,\\text{V}$\n\nট্রান্সফর্মার সমীকরণ:\n$$\\frac{V_s}{V_p} = \\frac{N_s}{N_p}$$\n\n$$V_s = V_p \\times \\frac{N_s}{N_p} = 220 \\times \\frac{2000}{500} = 220 \\times 4 = 880\\,\\text{V}$$\n\nযেহেতু $N_s > N_p$, এটি একটি স্টেপ-আপ ট্রান্সফর্মার।',
        marks: 4,
        difficulty: 'medium',
        explanation: 'স্টেপ-আপ ট্রান্সফর্মারে ভোল্টেজ বৃদ্ধি পায় কিন্তু তড়িৎ প্রবাহ কমে যায়।'
      },
      {
        label: 'ঘ',
        question: 'তড়িৎ জেনারেটরের নীতি বর্ণনা করো এবং AC ও DC জেনারেটরের মধ্যে পার্থক্য আলোচনা করো।',
        answer: '**নীতি:** তড়িৎ চৌম্বক আবেশের নীতির উপর ভিত্তি করে জেনারেটর কাজ করে। চৌম্বক ক্ষেত্রে পরিবাহী কুণ্ডলী ঘুরলে কুণ্ডলীতে তড়িৎচালক বল আবিষ্ট হয়।\n\n| বৈশিষ্ট্য | AC জেনারেটর | DC জেনারেটর |\n|---|---|---|\n| আউটপুট | পরিবর্তী তড়িৎ | একমুখী তড়িৎ |\n| রিং | স্লিপ রিং | কম্যুটেটর |\n| ব্যবহার | বিদ্যুৎকেন্দ্র | গাড়ির ডায়নামো |',
        marks: 5,
        difficulty: 'hard',
        explanation: 'লেঞ্জের সূত্র অনুযায়ী আবিষ্ট তড়িৎ প্রবাহ সবসময় কারণের বিরুদ্ধে কাজ করে।'
      }
    ]
  };

  for (const chapter of chapters) {
    const questions = creativeData[chapter.name] || [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const testBoards = ['Dhaka Board', 'Rajshahi Board', 'Cumilla Board', 'Chittagong Board', 'Barisal Board'];
      const testYears = [2025, 2024, 2023, 2022];
      
      const board_name = testBoards[i % testBoards.length];
      const exam_year = testYears[i % testYears.length];

      await CreativeQuestion.create({
          chapterId: chapter._id,
          label: q.label,
          question: q.question,
          answer: q.answer,
          marks: q.marks,
          difficulty: q.difficulty,
          explanation: q.explanation,
          order: i + 1,
          isActive: true,
          board_name,
          exam_year,
          sourceType: 'board',
  });
    }
  }
  console.log('✅ Creative questions created');
}

async function seedMcqQuestions() {
  const existing = await McqQuestion.countDocuments();
  if (existing > 0) {
    console.log('MCQ questions already exist, skipping...');
    return;
  }

  const class10 = await Class.findOne({ number: 10 }).lean();
  if (!class10) return;
  const physicsSubject = await Subject.findOne({ classId: class10._id, name: 'Physics' }).lean();
  if (!physicsSubject) return;

  const chapters = await Chapter.find({ subjectId: physicsSubject._id }).sort({ order: 1 }).lean();

  const mcqData: Record<string, { question: string; optionA: string; optionB: string; optionC: string; optionD: string; correctAnswer: string; explanation: string; difficulty: string }[]> = {
    Motion: [
      { question: '\u09a4\u09cd\u09ac\u09b0\u09a3\u09c7\u09b0 SI \u098f\u0995\u0995 \u0995\u09cb\u09a8\u099f\u09bf?', optionA: '$\\text{m/s}$', optionB: '$\\text{m/s}^2$', optionC: '$\\text{m}^2/\\text{s}$', optionD: '$\\text{kg}\\cdot\\text{m/s}$', correctAnswer: 'B', explanation: '\u09a4\u09cd\u09ac\u09b0\u09a3 = \u09ac\u09c7\u0997\u09c7\u09b0 \u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8\u09c7\u09b0 \u09b9\u09be\u09b0 = $\\frac{\\Delta v}{\\Delta t}$, \u098f\u0995\u0995 $\\text{m/s}^2$', difficulty: 'easy' },
      { question: '\u09b8\u09ae\u09ac\u09c7\u0997\u09c7 \u099a\u09b2\u09a4\u09c7 \u09a5\u09be\u0995\u09be \u098f\u0995\u099f\u09bf \u09ac\u09b8\u09cd\u09a4\u09c1\u09b0 \u09a4\u09cd\u09ac\u09b0\u09a3 \u0995\u09a4?', optionA: '\u09a7\u09a8\u09be\u09a4\u09cd\u09ae\u0995', optionB: '\u09b0\u09c0\u09a3\u09be\u09a4\u09cd\u09ae\u0995', optionC: '\u09b6\u09c2\u09a8\u09cd\u09af', optionD: '\u09ac\u09b2\u09be \u09af\u09be\u09af\u09bc \u09a8\u09be', correctAnswer: 'C', explanation: '\u09b8\u09ae\u09ac\u09c7\u0997\u09c7 \u09ac\u09c7\u0997 \u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8 \u09b9\u09af\u09bc \u09a8\u09be, \u09a4\u09be\u0987 \u09a4\u09cd\u09ac\u09b0\u09a3 = \u09b6\u09c2\u09a8\u09cd\u09af', difficulty: 'easy' },
      { question: '\u09ac\u09c7\u0997-\u09b8\u09ae\u09af\u09bc \u0997\u09cd\u09b0\u09be\u09ab\u09c7\u09b0 \u09a8\u09bf\u099a\u09c7\u09b0 \u0995\u09cd\u09b7\u09c7\u09a4\u09cd\u09b0\u09ab\u09b2 \u09a6\u09bf\u09af\u09bc\u09c7 \u09aa\u09be\u0993\u09af\u09bc\u09be \u09af\u09be\u09af\u09bc?', optionA: '\u09a4\u09cd\u09ac\u09b0\u09a3', optionB: '\u09ac\u09c7\u0997', optionC: '\u09b8\u09b0\u09a3', optionD: '\u09ac\u09b2', correctAnswer: 'C', explanation: 'v-t \u0997\u09cd\u09b0\u09be\u09ab\u09c7\u09b0 \u09a8\u09bf\u099a\u09c7\u09b0 \u0995\u09cd\u09b7\u09c7\u09a4\u09cd\u09b0\u09ab\u09b2 = $\\int v\\,dt = s$ (\u09b8\u09b0\u09a3)', difficulty: 'easy' },
      { question: '\u098f\u0995\u099f\u09bf \u0997\u09be\u09dc\u09bf $5\\,\\text{m/s}$ \u09a5\u09c7\u0995\u09c7 $25\\,\\text{m/s}$ \u09ac\u09c7\u0997\u09c7 $4\\,\\text{s}$-\u098f \u09aa\u09cc\u0981\u099b\u09be\u09af\u09bc\u0964 \u09a4\u09cd\u09ac\u09b0\u09a3 \u0995\u09a4?', optionA: '$5\\,\\text{m/s}^2$', optionB: '$10\\,\\text{m/s}^2$', optionC: '$2.5\\,\\text{m/s}^2$', optionD: '$7.5\\,\\text{m/s}^2$', correctAnswer: 'A', explanation: '$a = \\frac{v - u}{t} = \\frac{25 - 5}{4} = 5\\,\\text{m/s}^2$', difficulty: 'easy' },
      { question: '\u09a6\u09c2\u09b0\u09a4\u09cd\u09ac-\u09b8\u09ae\u09af\u09bc \u0997\u09cd\u09b0\u09be\u09ab\u09c7\u09b0 \u09a2\u09be\u09b2 \u09a6\u09bf\u09af\u09bc\u09c7 \u09aa\u09be\u0993\u09af\u09bc\u09be \u09af\u09be\u09af\u09bc?', optionA: '\u09a4\u09cd\u09ac\u09b0\u09a3', optionB: '\u09b8\u09b0\u09a3', optionC: '\u09ac\u09c7\u0997', optionD: '\u09ac\u09b2', correctAnswer: 'C', explanation: 'd-t \u0997\u09cd\u09b0\u09be\u09ab\u09c7\u09b0 \u09a2\u09be\u09b2 = $\\frac{ds}{dt} = v$ (\u09ac\u09c7\u0997)', difficulty: 'easy' },
      { question: '\u0997\u09a4\u09bf\u09b0 \u0995\u09cb\u09a8 \u09b8\u09ae\u09c0\u0995\u09b0\u09a3\u09c7 \u09b8\u09ae\u09af\u09bc ($t$) \u09a8\u09c7\u0987?', optionA: '$v = u + at$', optionB: '$s = ut + \\frac{1}{2}at^2$', optionC: '$v^2 = u^2 + 2as$', optionD: '$s = \\frac{u+v}{2} \\times t$', correctAnswer: 'C', explanation: '$v^2 = u^2 + 2as$ \u09b8\u09ae\u09c0\u0995\u09b0\u09a3\u09c7 \u09b8\u09ae\u09af\u09bc ($t$) \u09a8\u09c7\u0987', difficulty: 'medium' },
      { question: '\u09ae\u09a8\u09cd\u09a6\u09a8 (\u09b0\u09bf\u099f\u09be\u09b0\u09cd\u09a1\u09c7\u09b6\u09a8) \u09ae\u09be\u09a8\u09c7 \u0995\u09c0?', optionA: '\u09a7\u09a8\u09be\u09a4\u09cd\u09ae\u0995 \u09a4\u09cd\u09ac\u09b0\u09a3', optionB: '\u09b0\u09c0\u09a3\u09be\u09a4\u09cd\u09ae\u0995 \u09a4\u09cd\u09ac\u09b0\u09a3', optionC: '\u09b6\u09c2\u09a8\u09cd\u09af \u09a4\u09cd\u09ac\u09b0\u09a3', optionD: '\u09b8\u09ae\u09ac\u09c7\u0997', correctAnswer: 'B', explanation: '\u09ae\u09a8\u09cd\u09a6\u09a8 \u09ae\u09be\u09a8\u09c7 \u09ac\u09c7\u0997 \u0995\u09ae\u099b\u09c7, \u09a4\u09be\u0987 \u09a4\u09cd\u09ac\u09b0\u09a3 \u09b0\u09c0\u09a3\u09be\u09a4\u09cd\u09ae\u0995: $a < 0$', difficulty: 'easy' },
      { question: '\u09b8\u09b0\u09a3 \u0993 \u09a6\u09c2\u09b0\u09a4\u09cd\u09ac\u09c7\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u0995\u09cb\u09a8\u099f\u09bf \u09b8\u09a0\u09bf\u0995?', optionA: '\u09a6\u09c2\u09b0\u09a4\u09cd\u09ac \u2265 \u09b8\u09b0\u09a3', optionB: '\u09b8\u09b0\u09a3 \u2265 \u09a6\u09c2\u09b0\u09a4\u09cd\u09ac', optionC: '\u09b8\u09b0\u09a3 = \u09a6\u09c2\u09b0\u09a4\u09cd\u09ac', optionD: '\u09a6\u09c2\u09b0\u09a4\u09cd\u09ac = 0', correctAnswer: 'A', explanation: '\u09b8\u09b0\u09a3 \u09b8\u09b0\u09cd\u09ac\u09a6\u09be \u09a6\u09c2\u09b0\u09a4\u09cd\u09ac\u09c7\u09b0 \u099a\u09c7\u09af\u09bc\u09c7 \u09ac\u09c7\u09b6\u09bf \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7 \u09a8\u09be, \u09a4\u09be\u0987 $|\\vec{s}| \\leq d$', difficulty: 'medium' },
    ],
    Electricity: [
      { question: '\u09a4\u09a1\u09bc\u09bf\u09ce \u09aa\u09cd\u09b0\u09ac\u09be\u09b9\u09c7\u09b0 SI \u098f\u0995\u0995 \u09b9\u09b2\u09cb:', optionA: '\u09ad\u09cb\u09b2\u09cd\u099f', optionB: '\u0993\u09b9\u09ae', optionC: '\u0985\u09cd\u09af\u09be\u09ae\u09cd\u09aa\u09bf\u09af\u09bc\u09be\u09b0', optionD: '\u0993\u09af\u09bc\u09be\u099f', correctAnswer: 'C', explanation: '\u09a4\u09a1\u09bc\u09bf\u09ce \u09aa\u09cd\u09b0\u09ac\u09be\u09b9 $I = \\frac{Q}{t}$, \u098f\u0995\u0995 \u09b9\u09b2\u09cb \u0985\u09cd\u09af\u09be\u09ae\u09cd\u09aa\u09bf\u09af\u09bc\u09be\u09b0 (A)', difficulty: 'easy' },
      { question: '\u0993\u09b9\u09ae\u09c7\u09b0 \u09b8\u09c2\u09a4\u09cd\u09b0 \u0985\u09a8\u09c1\u09af\u09be\u09af\u09bc\u09c0:', optionA: '$V = IR$', optionB: '$V = I/R$', optionC: '$V = R/I$', optionD: '$V = I^2R$', correctAnswer: 'A', explanation: '\u0993\u09b9\u09ae\u09c7\u09b0 \u09b8\u09c2\u09a4\u09cd\u09b0: $V = IR$', difficulty: 'easy' },
      { question: '$4\\,\\Omega$ \u0993 $6\\,\\Omega$ \u09b0\u09cb\u09a7 \u09b6\u09cd\u09b0\u09c7\u09a3\u09bf\u09a4\u09c7 \u09b8\u0982\u09af\u09c1\u0995\u09cd\u09a4 \u09b9\u09b2\u09c7 \u09a4\u09c1\u09b2\u09cd\u09af \u09b0\u09cb\u09a7 \u09b9\u09b2\u09cb:', optionA: '$2.4\\,\\Omega$', optionB: '$10\\,\\Omega$', optionC: '$2\\,\\Omega$', optionD: '$24\\,\\Omega$', correctAnswer: 'B', explanation: '\u09b6\u09cd\u09b0\u09c7\u09a3\u09bf \u09b8\u0982\u09af\u09cb\u0997\u09c7: $R_s = 4 + 6 = 10\\,\\Omega$', difficulty: 'easy' },
      { question: '\u09a4\u09a1\u09bc\u09bf\u09ce \u09b6\u0995\u09cd\u09a4\u09bf\u09b0 \u09ac\u09be\u09a3\u09bf\u099c\u09cd\u09af\u09bf\u0995 \u098f\u0995\u0995 \u09b9\u09b2\u09cb:', optionA: '\u099c\u09c1\u09b2', optionB: '\u0993\u09af\u09bc\u09be\u099f', optionC: '\u0995\u09bf\u09b2\u09cb\u0993\u09af\u09bc\u09be\u099f-\u0998\u09a3\u09cd\u099f\u09be (kWh)', optionD: '\u09ad\u09cb\u09b2\u09cd\u099f-\u0985\u09cd\u09af\u09be\u09ae\u09cd\u09aa\u09bf\u09af\u09bc\u09be\u09b0', correctAnswer: 'C', explanation: '1 kWh = $3.6 \\times 10^6$ J. \u09e7 \u0987\u0989\u09a8\u09bf\u099f = \u09e7 \u0995\u09bf\u09b2\u09cb\u0993\u09af\u09bc\u09be\u099f \u09af\u09a8\u09cd\u09a4\u09cd\u09b0 \u09e7 \u0998\u09a3\u09cd\u099f\u09be\u09df \u09ac\u09cd\u09af\u09af\u09bc\u09bf\u09a4 \u09b6\u0995\u09cd\u09a4\u09bf', difficulty: 'easy' },
      { question: '\u09b8\u09ae\u09be\u09a8\u09cd\u09a4\u09b0\u09be\u09b2 \u09b8\u0982\u09af\u09cb\u0997\u09c7 \u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u09b0\u09cb\u09a7\u09c7 \u09ac\u09bf\u09ad\u09ac \u09aa\u09be\u09b0\u09cd\u09a5\u0995\u09cd\u09af:', optionA: '\u09ad\u09bf\u09a8\u09cd\u09a8', optionB: '\u098f\u0995\u0987', optionC: '\u09b6\u09c2\u09a8\u09cd\u09af', optionD: '\u09ac\u09bf\u09ad\u09ac\u09c7\u09b0 \u09af\u09cb\u0997\u09ab\u09b2', correctAnswer: 'B', explanation: '\u09b8\u09ae\u09be\u09a8\u09cd\u09a4\u09b0\u09be\u09b2\u09c7 \u09b8\u09ac \u09b0\u09cb\u09a7 \u098f\u0995\u0987 \u09a6\u09c1\u099f\u09bf \u09ac\u09bf\u09a8\u09cd\u09a6\u09c1\u09b0 \u09b8\u0982\u0997\u09c7 \u09af\u09c1\u0995\u09cd\u09a4, \u09a4\u09be\u0987 $V_1 = V_2 = V_3$', difficulty: 'easy' },
      { question: '$P = I^2R$ \u09b9\u09b2\u09c7 \u09a4\u09a1\u09bc\u09bf\u09ce \u09aa\u09cd\u09b0\u09ac\u09be\u09b9 \u09a6\u09cd\u09ac\u09bf\u0997\u09c1\u09a3 \u09b9\u09b2\u09c7 \u0995\u09cd\u09b7\u09ae\u09a4\u09be \u09b9\u09ac\u09c7:', optionA: '$2P$', optionB: '$4P$', optionC: '$8P$', optionD: '$16P$', correctAnswer: 'B', explanation: "$P = I^2R$. $I' = 2I$ \u09b9\u09b2\u09c7, $P' = (2I)^2R = 4I^2R = 4P$", difficulty: 'medium' },
      { question: '\u098f\u0995\u099f\u09bf \u09ac\u09be\u09b2\u09cd\u09ac\u09c7\u09b0 \u0997\u09be\u09df\u09c7 $100\\,\\text{W}$, $220\\,\\text{V}$ \u09b2\u09c7\u0996\u09be \u0986\u099b\u09c7\u0964 \u09ac\u09be\u09b2\u09cd\u09ac\u09c7\u09b0 \u09b0\u09cb\u09a7 \u09b9\u09b2\u09cb:', optionA: '$484\\,\\Omega$', optionB: '$2.2\\,\\Omega$', optionC: '$220\\,\\Omega$', optionD: '$100\\,\\Omega$', correctAnswer: 'A', explanation: '$R = \\frac{V^2}{P} = \\frac{220^2}{100} = 484\\,\\Omega$', difficulty: 'medium' },
      { question: '\u09b0\u09cb\u09a7\u0995\u09a4\u09cd\u09ac\u09be\u0999\u09cd\u0995 \u09a8\u09bf\u09b0\u09cd\u09ad\u09b0 \u0995\u09b0\u09c7:', optionA: '\u09a6\u09c8\u09b0\u09cd\u0998\u09cd\u09af\u09c7\u09b0 \u0989\u09aa\u09b0', optionB: '\u09aa\u09cd\u09b0\u09b8\u09cd\u09a5\u099a\u09cd\u099b\u09c7\u09a6\u09c7\u09b0 \u0989\u09aa\u09b0', optionC: '\u0989\u09aa\u09be\u09a6\u09be\u09a8\u09c7\u09b0 \u0989\u09aa\u09b0', optionD: '\u09b8\u09ac\u0995\u09bf\u099b\u09c1\u09b0 \u0989\u09aa\u09b0', correctAnswer: 'C', explanation: '\u09b0\u09cb\u09a7\u0995\u09a4\u09cd\u09ac\u09be\u0999\u09cd\u0995 ($\\rho$) \u09aa\u09a6\u09be\u09b0\u09cd\u09a5\u09c7\u09b0 \u09ac\u09bf\u09b6\u09c7\u09b7 \u09a7\u09b0\u09cd\u09ae, \u09b6\u09c1\u09a7\u09c1 \u0989\u09aa\u09be\u09a6\u09be\u09a8\u09c7\u09b0 \u0989\u09aa\u09b0 \u09a8\u09bf\u09b0\u09cd\u09ad\u09b0 \u0995\u09b0\u09c7', difficulty: 'medium' },
    ],
    Light: [
      { question: '\u09b6\u09c2\u09a8\u09cd\u09af\u09a4\u09be\u09af\u09bc \u0986\u09b2\u09cb\u09b0 \u09ac\u09c7\u0997 \u09aa\u09cd\u09b0\u09be\u09af\u09bc:', optionA: '$3 \\times 10^6\\,\\text{m/s}$', optionB: '$3 \\times 10^8\\,\\text{m/s}$', optionC: '$3 \\times 10^{10}\\,\\text{m/s}$', optionD: '$3 \\times 10^4\\,\\text{m/s}$', correctAnswer: 'B', explanation: '\u0986\u09b2\u09cb\u09b0 \u09ac\u09c7\u0997 $c = 3 \\times 10^8\\,\\text{m/s}$ \u09b6\u09c2\u09a8\u09cd\u09af\u09a4\u09be\u09df', difficulty: 'easy' },
      { question: '\u0989\u09a4\u09cd\u09a4\u09b2 \u09b2\u09c7\u09a8\u09cd\u09b8\u09c7\u09b0 \u09ab\u09cb\u0995\u09be\u09b8 \u09a6\u09c2\u09b0\u09a4\u09cd\u09ac $50\\,\\text{cm}$ \u09b9\u09b2\u09c7 \u09b2\u09c7\u09a8\u09cd\u09b8\u09c7\u09b0 \u0995\u09cd\u09b7\u09ae\u09a4\u09be \u0995\u09a4?', optionA: '$+2\\,D$', optionB: '$-2\\,D$', optionC: '$+0.5\\,D$', optionD: '$+50\\,D$', correctAnswer: 'A', explanation: '$P = \\frac{1}{0.5} = +2\\,D$. \u0989\u09a4\u09cd\u09a4\u09b2 \u09b2\u09c7\u09a8\u09cd\u09b8\u09c7\u09b0 \u0995\u09cd\u09b7\u09ae\u09a4\u09be \u09a7\u09a8\u09be\u09a4\u09cd\u09ae\u0995', difficulty: 'easy' },
      { question: '\u0998\u09a8 \u09ae\u09be\u09a7\u09cd\u09af\u09ae \u09a5\u09c7\u0995\u09c7 \u09b9\u09be\u09b2\u0995\u09be \u09ae\u09be\u09a7\u09cd\u09af\u09ae\u09c7 \u09af\u09be\u0993\u09df\u09be \u0986\u09b2\u09cb \u09a8\u09b0\u09cd\u09ae\u09be\u09b2 \u09a5\u09c7\u0995\u09c7:', optionA: '\u09a8\u09b0\u09cd\u09ae\u09be\u09b2\u09c7\u09b0 \u09a6\u09bf\u0995\u09c7 \u09ac\u09be\u0981\u0995\u09c7', optionB: '\u09a8\u09b0\u09cd\u09ae\u09be\u09b2 \u09a5\u09c7\u0995\u09c7 \u09a6\u09c2\u09b0\u09c7 \u09ac\u09be\u0981\u0995\u09c7', optionC: '\u09b8\u09cb\u099c\u09be \u09af\u09be\u09df', optionD: '\u09ac\u09be\u0981\u0995\u09c7 \u09a8\u09be', correctAnswer: 'B', explanation: '\u09b9\u09be\u09b2\u0995\u09be \u09ae\u09be\u09a7\u09cd\u09af\u09ae\u09c7 \u09b8\u09bf\u09a8 \u09ac\u09c7\u09b6\u09bf, \u09a4\u09be\u0987 $r > i$, \u0986\u09b2\u09cb \u09a8\u09b0\u09cd\u09ae\u09be\u09b2 \u09a5\u09c7\u0995\u09c7 \u09a6\u09c2\u09b0\u09c7 \u09ac\u09be\u0981\u0995\u09c7', difficulty: 'medium' },
      { question: '\u09aa\u09c2\u09b0\u09cd\u09a3 \u0985\u09ad\u09cd\u09af\u09a8\u09cd\u09a4\u09b0\u09c0\u09a3 \u09aa\u09cd\u09b0\u09a4\u09bf\u09ab\u09b2\u09a8 \u09b9\u09df \u09af\u0996\u09a8 \u0986\u09b2\u09cb \u09af\u09be\u09df:', optionA: '\u09b9\u09be\u09b2\u0995\u09be \u09a5\u09c7\u0995\u09c7 \u0998\u09a8 \u09ae\u09be\u09a7\u09cd\u09af\u09ae\u09c7', optionB: '\u0998\u09a8 \u09a5\u09c7\u0995\u09c7 \u09b9\u09be\u09b2\u0995\u09be \u09ae\u09be\u09a7\u09cd\u09af\u09ae\u09c7', optionC: '\u09b6\u09c2\u09a8\u09cd\u09af \u09a5\u09c7\u0995\u09c7 \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09ae\u09be\u09a7\u09cd\u09af\u09ae\u09c7', optionD: '\u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09ae\u09be\u09a7\u09cd\u09af\u09ae \u09a5\u09c7\u0995\u09c7 \u09b6\u09c2\u09a8\u09cd\u09af\u09a4\u09be\u09df', correctAnswer: 'B', explanation: '\u09aa\u09c2\u09b0\u09cd\u09a3 \u0985\u09ad\u09cd\u09af\u09a8\u09cd\u09a4\u09b0\u09c0\u09a3 \u09aa\u09cd\u09b0\u09a4\u09bf\u09ab\u09b2\u09a8\u09c7\u09b0 \u09b6\u09b0\u09cd\u09a4: (1) \u0998\u09a8 \u09a5\u09c7\u0995\u09c7 \u09b9\u09be\u09b2\u0995\u09be, (2) \u0986\u09aa\u09a4\u09a8 \u0995\u09cb\u09a3 > \u09b8\u0982\u0995\u099f \u0995\u09cb\u09a3', difficulty: 'medium' },
      { question: '\u0995\u09be\u099a\u09c7\u09b0 \u09aa\u09cd\u09b0\u09a4\u09bf\u09b8\u09b0\u09a3\u09be\u0999\u09cd\u0995 $1.5$ \u09b9\u09b2\u09c7 \u0995\u09be\u099a\u09c7 \u0986\u09b2\u09cb\u09b0 \u09ac\u09c7\u0997 \u0995\u09a4?', optionA: '$2 \\times 10^8\\,\\text{m/s}$', optionB: '$4.5 \\times 10^8\\,\\text{m/s}$', optionC: '$1.5 \\times 10^8\\,\\text{m/s}$', optionD: '$3 \\times 10^8\\,\\text{m/s}$', correctAnswer: 'A', explanation: '$v = \\frac{c}{n} = \\frac{3 \\times 10^8}{1.5} = 2 \\times 10^8\\,\\text{m/s}$', difficulty: 'medium' },
      { question: '\u09ac\u09bf\u099a\u09cd\u099b\u09c1\u09b0\u09a3\u09c7 \u09b8\u09ac\u099a\u09c7\u09df\u09c7 \u09ac\u09c7\u09b6\u09bf \u09ac\u09bf\u099a\u09cd\u09af\u09c1\u09a4 \u09b9\u09df:', optionA: '\u09b2\u09be\u09b2 \u0986\u09b2\u09cb', optionB: '\u09b9\u09b2\u09c1\u09a6 \u0986\u09b2\u09cb', optionC: '\u09b8\u09ac\u09c1\u099c \u0986\u09b2\u09cb', optionD: '\u09ac\u09c7\u0997\u09c1\u09a8\u09bf \u0986\u09b2\u09cb', correctAnswer: 'D', explanation: '\u09ac\u09c7\u0997\u09c1\u09a8\u09bf \u0986\u09b2\u09cb\u09b0 \u09a4\u09b0\u0999\u09cd\u0997\u09a6\u09c8\u09b0\u09cd\u0998\u09cd\u09af \u09b8\u09ac\u09cb\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09a8\u09df, \u09a4\u09be\u0987 \u09b8\u09b0\u09cd\u09ac\u09be\u09a7\u09bf\u0995 \u09ac\u09bf\u09a8\u09cd\u09a6\u09c1\u09a4 \u09b9\u09df', difficulty: 'easy' },
      { question: '\u0986\u09b2\u09cb\u0995\u09ac\u09b8\u09cd\u09a4\u09c1 \u0989\u09a4\u09cd\u09a4\u09b2 \u09b2\u09c7\u09a8\u09cd\u09b8\u09c7\u09b0 \u09ab\u09cb\u0995\u09be\u09b8 \u09ac\u09bf\u09a8\u09cd\u09a6\u09c1\u09a4\u09c7 \u09a5\u09be\u0995\u09b2\u09c7 \u09aa\u09cd\u09b0\u09a4\u09bf\u09ac\u09bf\u09ae\u09cd\u09ac \u0997\u09a0\u09bf\u09a4 \u09b9\u09df:', optionA: '\u09ab\u09cb\u0995\u09be\u09b8\u09c7', optionB: '$2f$-\u098f', optionC: '\u0985\u09aa\u09cd\u099f\u09bf\u0995\u09cd\u09af\u09be\u09b2 \u0995\u09c7\u09a8\u09cd\u09a6\u09cd\u09b0\u09c7', optionD: '\u0985\u09b8\u09c0\u09ae\u09a4\u09c7', correctAnswer: 'D', explanation: '$u = f$ \u09b9\u09b2\u09c7: $\\frac{1}{v} = \\frac{1}{f} - \\frac{1}{f} = 0$, \u09a4\u09be\u0987 $v \\to \\infty$', difficulty: 'medium' },
    ],
    Sound: [
      { question: '\u09b6\u09ac\u09cd\u09a6 \u09a4\u09b0\u0999\u09cd\u0997 \u09b9\u09b2\u09cb:', optionA: '\u0985\u09a8\u09c1\u09aa\u09cd\u09b0\u09b8\u09cd\u09a5 \u09a4\u09b0\u0999\u09cd\u0997', optionB: '\u0985\u09a8\u09c1\u09a6\u09c8\u09b0\u09cd\u0998\u09cd\u09af \u09a4\u09b0\u0999\u09cd\u0997', optionC: '\u09a4\u09a1\u09bc\u09bf\u09ce\u099a\u09c1\u09ae\u09cd\u09ac\u0995\u09c0\u09df \u09a4\u09b0\u0999\u09cd\u0997', optionD: '\u0995\u09cb\u09a8\u09cb\u099f\u09bf\u0987 \u09a8\u09df', correctAnswer: 'B', explanation: '\u09b6\u09ac\u09cd\u09a6 \u09a4\u09b0\u0999\u09cd\u0997 \u09b9\u09b2\u09cb \u0985\u09a8\u09c1\u09a6\u09c8\u09b0\u09cd\u0998\u09cd\u09af \u09af\u09be\u09a8\u09cd\u09a4\u09cd\u09b0\u09bf\u0995 \u09a4\u09b0\u0999\u09cd\u0997\u0964 \u0995\u09a3\u09be\u0997\u09c1\u09b2\u09cb \u09a4\u09b0\u0999\u09cd\u0997 \u09aa\u09cd\u09b0\u099a\u09be\u09b0\u09c7\u09b0 \u09b8\u09ae\u09be\u09a8\u09cd\u09a4\u09b0\u09be\u09b2\u09c7 \u0995\u09be\u0981\u09aa\u09c7', difficulty: 'easy' },
      { question: '\u09ae\u09be\u09a8\u09c1\u09b7\u09c7\u09b0 \u09b6\u09cd\u09b0\u09be\u09ac\u09cd\u09af\u09a4\u09be\u09b0 \u09b8\u09c0\u09ae\u09be \u09b9\u09b2\u09cb:', optionA: '$20\\,\\text{Hz}$ \u09a5\u09c7\u0995\u09c7 $20{,}000\\,\\text{Hz}$', optionB: '$20\\,\\text{Hz}$ \u09a5\u09c7\u0995\u09c7 $200{,}000\\,\\text{Hz}$', optionC: '$200\\,\\text{Hz}$ \u09a5\u09c7\u0995\u09c7 $20{,}000\\,\\text{Hz}$', optionD: '$2\\,\\text{Hz}$ \u09a5\u09c7\u0995\u09c7 $2{,}000\\,\\text{Hz}$', correctAnswer: 'A', explanation: '\u09ae\u09be\u09a8\u09c1\u09b7\u09c7\u09b0 \u09b6\u09cd\u09b0\u09ac\u09a3\u09b8\u09c0\u09ae\u09be: $20\\,\\text{Hz}$ \u09a5\u09c7\u0995\u09c7 $20{,}000\\,\\text{Hz}$', difficulty: 'easy' },
      { question: '$0°C$-\u098f \u09ac\u09be\u09af\u09bc\u09c1\u09a4\u09c7 \u09b6\u09ac\u09cd\u09a6\u09c7\u09b0 \u09ac\u09c7\u0997 \u09aa\u09cd\u09b0\u09be\u09df:', optionA: '$332\\,\\text{m/s}$', optionB: '$340\\,\\text{m/s}$', optionC: '$300\\,\\text{m/s}$', optionD: '$380\\,\\text{m/s}$', correctAnswer: 'A', explanation: '$0°C$-\u098f \u09ac\u09be\u09df\u09c1\u09a4\u09c7 \u09b6\u09ac\u09cd\u09a6\u09c7\u09b0 \u09ac\u09c7\u0997 $\\approx 332\\,\\text{m/s}$', difficulty: 'easy' },
      { question: '\u09b6\u09ac\u09cd\u09a6\u09c7\u09b0 \u09aa\u09bf\u099a (\u09a4\u09be\u09b0\u09a4\u09cd\u09ac) \u09a8\u09bf\u09b0\u09cd\u09ad\u09b0 \u0995\u09b0\u09c7:', optionA: '\u09ac\u09bf\u09b8\u09cd\u09a4\u09be\u09b0\u09c7\u09b0 \u0989\u09aa\u09b0', optionB: '\u0995\u09ae\u09cd\u09aa\u09be\u0999\u09cd\u0995\u09c7\u09b0 \u0989\u09aa\u09b0', optionC: '\u09a4\u09b0\u0999\u09cd\u0997\u09a6\u09c8\u09b0\u09cd\u0998\u09cd\u09af\u09c7\u09b0 \u0989\u09aa\u09b0', optionD: '\u09ac\u09c7\u0997\u09c7\u09b0 \u0989\u09aa\u09b0', correctAnswer: 'B', explanation: '\u09aa\u09bf\u099a \u09b9\u09b2\u09cb \u0995\u09ae\u09cd\u09aa\u09be\u0999\u09cd\u0995\u09c7\u09b0 \u0985\u09a8\u09c1\u09ad\u09ac\u0964 \u09ac\u09c7\u09b6\u09bf \u0995\u09ae\u09cd\u09aa\u09be\u0999\u09cd\u0995 = \u09ac\u09c7\u09b6\u09bf \u09aa\u09bf\u099a', difficulty: 'easy' },
      { question: '\u09aa\u09cd\u09b0\u09a4\u09bf\u09a7\u09cd\u09ac\u09a8\u09bf \u09b9\u09df \u09b6\u09ac\u09cd\u09a6\u09c7\u09b0 \u0995\u09be\u09b0\u09a3\u09c7:', optionA: '\u09aa\u09cd\u09b0\u09a4\u09bf\u09b8\u09b0\u09a3', optionB: '\u09aa\u09cd\u09b0\u09a4\u09bf\u09ab\u09b2\u09a8', optionC: '\u09ac\u09bf\u0995\u09cd\u09b0\u09be\u09b6\u09a8', optionD: '\u0987\u09a8\u09cd\u099f\u09be\u09b0\u09ab\u09bf\u09df\u09be\u09b0\u09c7\u09a8\u09cd\u09b8', correctAnswer: 'B', explanation: '\u09aa\u09cd\u09b0\u09a4\u09bf\u09a7\u09cd\u09ac\u09a8\u09bf = \u09b6\u09ac\u09cd\u09a6\u09c7\u09b0 \u09aa\u09cd\u09b0\u09a4\u09bf\u09ab\u09b2\u09a8\u09c7\u09b0 \u09ab\u09b2\u09c7 \u09ae\u09c2\u09b2 \u09b6\u09ac\u09cd\u09a6 \u09a5\u09be\u09ae\u09be\u09b0 \u09aa\u09b0 \u09aa\u09c1\u09a8\u09b0\u09be\u09df \u09b6\u09cb\u09a8\u09be \u09af\u09be\u09df', difficulty: 'easy' },
      { question: '\u0995\u09ae\u09cd\u09aa\u09be\u0999\u09cd\u0995 ($f$) \u0993 \u09aa\u09b0\u09cd\u09af\u09be\u09df\u0995\u09be\u09b2 ($T$)-\u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b8\u09ae\u09cd\u09aa\u09b0\u09cd\u0995 \u09b9\u09b2\u09cb:', optionA: '$f = T$', optionB: '$f = \\frac{1}{T}$', optionC: '$f = T^2$', optionD: '$f = 2\\pi T$', correctAnswer: 'B', explanation: '\u0995\u09ae\u09cd\u09aa\u09be\u0999\u09cd\u0995 \u0993 \u09aa\u09b0\u09cd\u09af\u09be\u09df\u0995\u09be\u09b2 \u09ac\u09bf\u09aa\u09b0\u09c0\u09a4 \u09b8\u09ae\u09cd\u09aa\u09b0\u09cd\u0995\u09bf\u09a4: $f = \\frac{1}{T}$', difficulty: 'easy' },
      { question: '\u0986\u09b2\u099f\u09cd\u09b0\u09be\u09b8\u09a8\u09bf\u0995 \u09a4\u09b0\u0999\u09cd\u0997\u09c7\u09b0 \u0995\u09ae\u09cd\u09aa\u09be\u0999\u09cd\u0995:', optionA: '$20\\,\\text{Hz}$-\u098f\u09b0 \u09a8\u09bf\u099a\u09c7', optionB: '$20$ \u09a5\u09c7\u0995\u09c7 $20{,}000\\,\\text{Hz}$', optionC: '$20{,}000\\,\\text{Hz}$-\u098f\u09b0 \u0989\u09aa\u09b0\u09c7', optionD: '$1\\,\\text{Hz}$-\u098f\u09b0 \u09a8\u09bf\u099a\u09c7', correctAnswer: 'C', explanation: '\u0986\u09b2\u099f\u09cd\u09b0\u09be\u09b8\u09a8\u09bf\u0995: $f > 20{,}000\\,\\text{Hz}$. \u099a\u09bf\u0995\u09bf\u09ce\u09b8\u09be, SONAR-\u098f \u09ac\u09cd\u09af\u09ac\u09b9\u09c3\u09a4', difficulty: 'easy' },
      { question: '\u09b6\u09ac\u09cd\u09a6 \u09b8\u09ac\u09c7\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09ac\u09c7\u0997\u09c7 \u099a\u09b2\u09c7:', optionA: '\u09ac\u09be\u09df\u09c1\u09a4\u09c7', optionB: '\u09aa\u09be\u09a8\u09bf\u09a4\u09c7', optionC: '\u09b8\u09cd\u099f\u09bf\u09b2\u09c7', optionD: '\u09b6\u09c2\u09a8\u09cd\u09af\u09a4\u09be\u09df', correctAnswer: 'C', explanation: '\u09b6\u09ac\u09cd\u09a6\u09c7\u09b0 \u09ac\u09c7\u0997: \u09b8\u09cd\u099f\u09bf\u09b2 ($\\sim 5960\\,\\text{m/s}$) > \u09aa\u09be\u09a8\u09bf > \u09ac\u09be\u09df\u09c1. \u09b6\u09c2\u09a8\u09cd\u09af\u09a4\u09be\u09df \u09af\u09be\u09df \u09a8\u09be', difficulty: 'medium' },
    ],
    Magnetism: [
      { question: '\u099a\u09cc\u09ae\u09cd\u09ac\u0995 \u09ab\u09cd\u09b2\u09be\u0995\u09cd\u09b8\u09c7\u09b0 SI \u098f\u0995\u0995 \u09b9\u09b2\u09cb:', optionA: '\u09a4\u09c7\u09b8\u09b2\u09be', optionB: '\u0993\u09df\u09c7\u09ac\u09be\u09b0', optionC: '\u09b9\u09c7\u09a8\u09b0\u09bf', optionD: '\u0997\u09cd\u09af\u09be\u0989\u09b8', correctAnswer: 'B', explanation: '\u099a\u09cc\u09ae\u09cd\u09ac\u0995 \u09ab\u09cd\u09b2\u09be\u0995\u09cd\u09b8 $\\phi_B = BA\\cos\\theta$, \u098f\u0995\u0995: \u0993\u09df\u09c7\u09ac\u09be\u09b0 (Wb)', difficulty: 'easy' },
      { question: '\u09ab\u09cd\u09af\u09be\u09b0\u09be\u09a1\u09c7\u09b0 \u09b8\u09c2\u09a4\u09cd\u09b0 \u0985\u09a8\u09c1\u09af\u09be\u09df\u09c0 \u0986\u09ac\u09bf\u09b7\u09cd\u099f EMF \u09b8\u09ae\u09be\u09a8:', optionA: '$-\\frac{dI}{dt}$', optionB: '$-N\\frac{d\\phi_B}{dt}$', optionC: '$-\\frac{dV}{dt}$', optionD: '$-\\frac{dB}{dt}$', correctAnswer: 'B', explanation: '\u09ab\u09cd\u09af\u09be\u09b0\u09be\u09a1\u09c7\u09b0 \u09b8\u09c2\u09a4\u09cd\u09b0: $\\varepsilon = -N\\frac{d\\phi_B}{dt}$', difficulty: 'easy' },
      { question: '\u09b2\u09c7\u099e\u09cd\u099c\u09c7\u09b0 \u09b8\u09c2\u09a4\u09cd\u09b0 \u0995\u09cb\u09a8 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u09b8\u09c2\u09a4\u09cd\u09b0\u09c7\u09b0 \u09ab\u09b2\u09be\u09ab\u09b2?', optionA: '\u099a\u09be\u09b0\u09cd\u099c \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3', optionB: '\u09ad\u09b0\u09ac\u09c7\u0997 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3', optionC: '\u09b6\u0995\u09cd\u09a4\u09bf \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3', optionD: '\u09ac\u09b8\u09cd\u09a4\u09c1 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3', correctAnswer: 'C', explanation: '\u09b2\u09c7\u099e\u09cd\u099c\u09c7\u09b0 \u09b8\u09c2\u09a4\u09cd\u09b0 \u09b6\u0995\u09cd\u09a4\u09bf \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4 \u0995\u09b0\u09c7', difficulty: 'medium' },
      { question: '\u099f\u09cd\u09b0\u09be\u09a8\u09cd\u09b8\u09ab\u09b0\u09cd\u09ae\u09be\u09b0 \u0995\u09be\u099c \u0995\u09b0\u09c7 \u09af\u09c7 \u09a8\u09c0\u09a4\u09bf\u09a4\u09c7:', optionA: '\u09b8\u09cd\u09ac-\u0986\u09ac\u09c7\u09b6', optionB: '\u09aa\u09be\u09b0\u09b8\u09cd\u09aa\u09b0\u09bf\u0995 \u0986\u09ac\u09c7\u09b6', optionC: '\u09a4\u09a1\u09bc\u09bf\u09ce\u099a\u09c1\u09ae\u09cd\u09ac\u0995 \u09ac\u09bf\u0995\u09bf\u09b0\u09a3', optionD: '\u098f\u09a1\u09bf \u0995\u09be\u09b0\u09c7\u09a8\u09cd\u099f', correctAnswer: 'B', explanation: '\u099f\u09cd\u09b0\u09be\u09a8\u09cd\u09b8\u09ab\u09b0\u09cd\u09ae\u09be\u09b0 \u09aa\u09be\u09b0\u09b8\u09cd\u09aa\u09b0\u09bf\u0995 \u0986\u09ac\u09c7\u09b6\u09c7\u09b0 \u09a8\u09c0\u09a4\u09bf\u09a4\u09c7 \u0995\u09be\u099c \u0995\u09b0\u09c7\u0964 $\\frac{V_s}{V_p} = \\frac{N_s}{N_p}$', difficulty: 'easy' },
      { question: '\u099a\u09cc\u09ae\u09cd\u09ac\u0995 \u0995\u09cd\u09b7\u09c7\u09a4\u09cd\u09b0\u09c7 \u09a4\u09a1\u09bc\u09bf\u09ce\u09ac\u09be\u09b9\u09c0 \u09aa\u09b0\u09bf\u09ac\u09be\u09b9\u09c0\u09a4\u09c7 \u09ac\u09b2\u09c7\u09b0 \u09b8\u09c2\u09a4\u09cd\u09b0 \u0995\u09cb\u09a8\u099f\u09bf?', optionA: '$F = qvB$', optionB: '$F = IlB\\sin\\theta$', optionC: '$F = \\frac{kq_1q_2}{r^2}$', optionD: '$F = ma$', correctAnswer: 'B', explanation: '$F = IlB\\sin\\theta$ \u09af\u09c7\u0996\u09be\u09a8\u09c7 $I$ = \u09a4\u09a1\u09bc\u09bf\u09ce, $l$ = \u09a6\u09c8\u09b0\u09cd\u0998\u09cd\u09af, $B$ = \u099a\u09cc\u09ae\u09cd\u09ac\u0995 \u0995\u09cd\u09b7\u09c7\u09a4\u09cd\u09b0', difficulty: 'easy' },
      { question: '\u09b8\u09cd\u099f\u09c7\u09aa-\u0986\u09aa \u099f\u09cd\u09b0\u09be\u09a8\u09cd\u09b8\u09ab\u09b0\u09cd\u09ae\u09be\u09b0\u09c7:', optionA: '$V_s > V_p$, $I_s < I_p$', optionB: '$V_s < V_p$, $I_s > I_p$', optionC: '$V_s > V_p$, $I_s > I_p$', optionD: '$V_s = V_p$, $I_s = I_p$', correctAnswer: 'A', explanation: '\u09b8\u09cd\u099f\u09c7\u09aa-\u0986\u09aa: $V_s > V_p$. \u09b6\u0995\u09cd\u09a4\u09bf \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3\u09c7 $V_sI_s \\approx V_pI_p$, \u09a4\u09be\u0987 $I_s < I_p$', difficulty: 'medium' },
      { question: '\u0986\u09ac\u09bf\u09b7\u09cd\u099f \u09a4\u09a1\u09bc\u09bf\u09ce\u09aa\u09cd\u09b0\u09ac\u09be\u09b9\u09c7\u09b0 \u09a6\u09bf\u0995 \u09a8\u09bf\u09b0\u09cd\u09a3\u09df\u09c7 \u09b2\u09c7\u099e\u09cd\u099c\u09c7\u09b0 \u09b8\u09c2\u09a4\u09cd\u09b0 \u09ac\u09b2\u09c7:', optionA: '\u0986\u09ac\u09bf\u09b7\u09cd\u099f \u09aa\u09cd\u09b0\u09ac\u09be\u09b9 \u0995\u09be\u09b0\u09a3\u09c7\u09b0 \u09b8\u09b9\u09be\u09df\u09a4\u09be \u0995\u09b0\u09c7', optionB: '\u0986\u09ac\u09bf\u09b7\u09cd\u099f \u09aa\u09cd\u09b0\u09ac\u09be\u09b9 \u0995\u09be\u09b0\u09a3\u09c7\u09b0 \u09ac\u09bf\u09b0\u09c1\u09a6\u09cd\u09a7\u09c7 \u0995\u09be\u099c \u0995\u09b0\u09c7', optionC: '\u0986\u09ac\u09bf\u09b7\u09cd\u099f \u09aa\u09cd\u09b0\u09ac\u09be\u09b9 \u09b6\u09c2\u09a8\u09cd\u09af', optionD: '\u0986\u09ac\u09bf\u09b7\u09cd\u099f \u09aa\u09cd\u09b0\u09ac\u09be\u09b9 \u0985\u09b8\u09c0\u09ae', correctAnswer: 'B', explanation: '\u09b2\u09c7\u099e\u09cd\u099c\u09c7\u09b0 \u09b8\u09c2\u09a4\u09cd\u09b0: \u0986\u09ac\u09bf\u09b7\u09cd\u099f \u09a4\u09a1\u09bc\u09bf\u09ce\u09aa\u09cd\u09b0\u09ac\u09be\u09b9 \u09b8\u09ac\u09b8\u09ae\u09df \u0995\u09be\u09b0\u09a3\u09c7\u09b0 \u09ac\u09bf\u09b0\u09c1\u09a6\u09cd\u09a7\u09c7 \u0995\u09be\u099c \u0995\u09b0\u09c7 (\u09b6\u0995\u09cd\u09a4\u09bf \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3)', difficulty: 'medium' },
    ]
  };


  for (const chapter of chapters) {
    const questions = mcqData[chapter.name] || [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const testBoards = ['Dhaka Board', 'Rajshahi Board', 'Cumilla Board', 'Chittagong Board', 'Barisal Board', 'Sylhet Board', 'Dinajpur Board', 'Jessore Board', 'Mymensingh Board'];
      const testYears = [2025, 2024, 2023, 2022, 2021];
      
      const board_name = testBoards[i % testBoards.length];
      const exam_year = testYears[i % testYears.length];

      await McqQuestion.create({
          chapterId: chapter._id,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          marks: 1,
          difficulty: q.difficulty,
          order: i + 1,
          isActive: true,
          board_name,
          exam_year,
          sourceType: 'board',
  });
    }
  }
  console.log('✅ MCQ questions created');
}

async function seedTestimonials() {
  const existing = await Testimonial.countDocuments();
  if (existing > 0) {
    console.log('Testimonials already exist, skipping...');
    return;
  }

  const testimonials = [
    {
      name: '\u09b0\u09be\u09ab\u09bf \u0986\u09b9\u09ae\u09c7\u09a6',
      role: 'SSC \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0\u09cd\u09a5\u09c0, \u09a2\u09be\u0995\u09be',
      content: '\u09ac\u09bf\u09a1\u09bf \u09aa\u09be\u09a0\u09b6\u09be\u09b2\u09be\u09b0 \u09a7\u09a8\u09cd\u09af\u09ac\u09be\u09a6! \u09b8\u09c3\u099c\u09a8\u09b6\u09c0\u09b2 \u09aa\u09cd\u09b0\u09b6\u09cd\u09a8\u0997\u09c1\u09b2\u09cb \u098f\u0995\u09a6\u09ae \u09ac\u09cb\u09b0\u09cd\u09a1 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0 \u09ae\u09a4\u09cb\u0964 \u09aa\u09a6\u09be\u09b0\u09cd\u09a5\u09ac\u09bf\u09a6\u09cd\u09af\u09be\u09b0 \u09b8\u09ae\u09c0\u0995\u09b0\u09a3\u0997\u09c1\u09b2\u09cb \u09b8\u09cd\u099f\u09c7\u09aa-\u09ac\u09be\u09dc\u09bf \u09ac\u09cb\u099d\u09be\u09a8\u09cb \u0986\u09ae\u09be\u09b0 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0 \u09aa\u09cd\u09b0\u09b8\u09cd\u09a4\u09c1\u09a4\u09bf \u09a8\u09bf\u09a4\u09c7 \u0985\u09a8\u09c7\u0995 \u09b8\u09be\u09b9\u09be\u09af\u09cd\u09af \u0995\u09b0\u09c7\u099b\u09c7\u0964',
      rating: 5,
      order: 1,
    },
    {
      name: '\u09a4\u09be\u09b9\u09ae\u09bf\u09a6 \u09b9\u09be\u09b8\u09be\u09a8',
      role: 'SSC \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0\u09cd\u09a5\u09c0, \u099a\u099f\u09cd\u099f\u0997\u09cd\u09b0\u09be\u09ae',
      content: '\u098f\u09ae\u09b8\u09bf\u0995\u09bf\u0989 \u09aa\u09cd\u09b0\u09cd\u09af\u09be\u0995\u099f\u09bf\u09b8 \u09b8\u09c7\u0995\u09b6\u09a8\u099f\u09be \u0985\u09b8\u09be\u09a7\u09be\u09b0\u09a3! \u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u09aa\u09cd\u09b0\u09b6\u09cd\u09a8\u09c7\u09b0 \u09ac\u09bf\u09b6\u09a6 \u09ac\u09cd\u09af\u09be\u0996\u09cd\u09af\u09be \u09a6\u09bf\u09df\u09c7 \u0986\u09ae\u09be\u09b0 \u09ad\u09c1\u09b2\u09c7\u09b0 \u099c\u09be\u09df\u0997\u09be\u0997\u09c1\u09b2\u09cb \u099c\u09be\u09a8\u09a4\u09c7 \u09aa\u09be\u09b0\u09b2\u09be\u09ae\u0964 \u09a4\u09bf\u09a8 \u09ae\u09be\u09b8\u09c7 \u09ad\u09cc\u09a4\u09bf\u0995 \u09ac\u09bf\u099c\u09cd\u099e\u09be\u09a8\u09c7 A+ \u09aa\u09c7\u09df\u09c7\u099b\u09bf\u0964',
      rating: 5,
      order: 2,
    },
    {
      name: '\u09b8\u09be\u09a6\u09bf\u09df\u09be \u0987\u09b8\u09b2\u09be\u09ae',
      role: '\u0985\u09ad\u09bf\u09ad\u09be\u09ac\u0995, \u09b0\u09be\u099c\u09b6\u09be\u09b9\u09c0',
      content: '\u0986\u09ae\u09be\u09b0 \u09ae\u09c7\u09df\u09c7\u09b0 \u09aa\u09a6\u09be\u09b0\u09cd\u09a5\u09ac\u09bf\u09a6\u09cd\u09af\u09be\u09a4\u09c7 \u0985\u09a8\u09c7\u0995 \u09ad\u09df \u099b\u09bf\u09b2\u0964 \u09ac\u09bf\u09a1\u09bf \u09aa\u09be\u09a0\u09b6\u09be\u09b2\u09be\u09b0 \u09b8\u09cd\u09a4\u09b0\u09c7 \u09b8\u09cd\u09a4\u09b0\u09c7 \u09b8\u09ae\u09be\u09a7\u09be\u09a8 \u09a6\u09c7\u0993\u09df\u09be\u09b0 \u09aa\u09a6\u09cd\u09a7\u09a4\u09bf \u09a6\u09c7\u0996\u09c7 \u09b8\u09c7 \u09a8\u09bf\u099c\u09c7\u0987 \u09a8\u09bf\u09df\u09ae\u09bf\u09a4 \u09aa\u09dc\u09be\u09b6\u09cb\u09a8\u09be \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c7\u099b\u09c7\u0964 \u09a4\u09be\u09b0 \u09ab\u09b2\u09be\u09ab\u09b2\u0993 \u09b0\u09c7\u099c\u09be\u09b2\u09cd\u099f\u09c7 \u09a6\u09c7\u0996\u09a4\u09c7 \u09aa\u09be\u099a\u09cd\u099b\u09bf\u0964',
      rating: 4,
      order: 3,
    },
    {
      name: '\u09b8\u09c1\u09ae\u09a8 \u0995\u09c1\u09ae\u09be\u09b0 \u09ac\u09bf\u09b6\u09cd\u09ac\u09be\u09b8',
      role: '\u09b6\u09bf\u0995\u09cd\u09b7\u0995, \u0995\u09c1\u09ae\u09bf\u09b2\u09cd\u09b2\u09be',
      content: '\u09b6\u09bf\u0995\u09cd\u09b7\u0995 \u09b9\u09bf\u09b8\u09c7\u09ac\u09c7 \u0986\u09ae\u09bf \u0986\u09ae\u09be\u09b0 \u09b8\u09ac \u09b6\u09bf\u0995\u09cd\u09b7\u09be\u09b0\u09cd\u09a5\u09c0\u09a6\u09c7\u09b0 \u09ac\u09bf\u09a1\u09bf \u09aa\u09be\u09a0\u09b6\u09be\u09b2\u09be \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0 \u0995\u09b0\u09a4\u09c7 \u09ac\u09b2\u09bf\u0964 \u09ac\u09be\u0982\u09b2\u09be\u09a6\u09c7\u09b6\u09c7\u09b0 \u09ac\u09cb\u09b0\u09cd\u09a1 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0 \u09b8\u09bf\u09b2\u09c7\u09ac\u09be\u09b8 \u0985\u09a8\u09c1\u09af\u09be\u09df\u09c0 \u09b8\u09be\u099c\u09be\u09a8\u09cb \u09b8\u09c3\u099c\u09a8\u09b6\u09c0\u09b2 \u09aa\u09cd\u09b0\u09b6\u09cd\u09a8 \u09aa\u09be\u0993\u09df\u09be \u09b8\u09a4\u09cd\u09af\u09bf\u0987 \u09ac\u09bf\u09b0\u09b2\u0964',
      rating: 5,
      order: 4,
    },
    {
      name: '\u09ab\u09be\u09b0\u09bf\u09df\u09be \u09a8\u09be\u099c\u09a8\u09bf\u09a8',
      role: 'SSC \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0\u09cd\u09a5\u09c0, \u09af\u09b6\u09cb\u09b0',
      content: '\u0985\u09a7\u09cd\u09af\u09be\u09df\u09ad\u09bf\u09a4\u09cd\u09a4\u09bf\u0995 \u09b8\u09be\u099c\u09be\u09a8\u09cb \u09ac\u09bf\u09b7\u09df\u09ac\u09b8\u09cd\u09a4\u09c1 \u09aa\u09dc\u09be\u09b6\u09cb\u09a8\u09be\u0995\u09c7 \u0985\u09a8\u09c7\u0995 \u09b8\u09b9\u099c \u0995\u09b0\u09c7 \u09a6\u09bf\u09df\u09c7\u099b\u09c7\u0964 \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0 \u09ab\u09bf\u099a\u09be\u09b0\u099f\u09be \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be\u09b0 \u0986\u0997\u09c7 \u09b0\u09bf\u09ad\u09bf\u09b6\u09a8\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u0985\u09b8\u09be\u09a7\u09be\u09b0\u09a3!',
      rating: 4,
      order: 5,
    },
  ];


  for (const t of testimonials) {
    await Testimonial.create({
        name: t.name,
        role: t.role,
        content: t.content,
        rating: t.rating,
        order: t.order,
        isActive: true,
  });
  }
  console.log('✅ Testimonials created');
}

async function seedFaqs() {
  const existing = await FAQ.countDocuments();
  if (existing > 0) {
    console.log('FAQs already exist, skipping...');
    return;
  }

  const faqs = [
    {
      question: 'Is the content on this platform free?',
      answer: 'Yes, all the educational content including explanations, creative questions, and MCQ practice is completely free for students. We believe in making quality education accessible to everyone.',
      category: 'general',
      order: 1,
    },
    {
      question: 'Which classes and subjects are covered?',
      answer: 'We cover Classes 1 through 12 with subjects including Mathematics, Science, Physics, Chemistry, Biology, English, Social Science, Hindi, and Computer Science. Content is aligned with the CBSE/State board curriculum.',
      category: 'general',
      order: 2,
    },
    {
      question: 'How do I practice MCQ questions?',
      answer: 'Navigate to your class and subject, select a chapter, and you\'ll find MCQ questions. You can also take timed exams that generate MCQs from selected chapters. Each question comes with an explanation.',
      category: 'exams',
      order: 3,
    },
    {
      question: 'Can I track my exam performance?',
      answer: 'Yes! After completing any exam, you\'ll see your score, time taken, and detailed analysis of correct and incorrect answers. You can also view your performance history and track improvement over time.',
      category: 'exams',
      order: 4,
    },
    {
      question: 'Are the explanations available in Hindi?',
      answer: 'Currently, all content is available in English. We are working on adding Hindi medium support. Stay tuned for updates!',
      category: 'content',
      order: 5,
    },
    {
      question: 'How are creative questions different from MCQs?',
      answer: 'Creative questions (labeled A, B, C, D) are subjective/descriptive questions that require detailed written answers, often involving derivations and explanations. MCQs are objective questions with four options where you select the correct answer.',
      category: 'content',
      order: 6,
    },
    {
      question: 'Can teachers use this platform for their students?',
      answer: 'Absolutely! Teachers can use our platform to assign practice exams, track student performance, and use our content as teaching aids. Contact us for bulk student registration.',
      category: 'teachers',
      order: 7,
    },
    {
      question: 'How often is new content added?',
      answer: 'We add new chapters and questions regularly. Our team of experienced educators reviews and updates content weekly to ensure it stays current with the latest curriculum changes.',
      category: 'content',
      order: 8,
    },
  ];

  for (const f of faqs) {
    await FAQ.create({
        question: f.question,
        answer: f.answer,
        category: f.category,
        order: f.order,
        isActive: true,
  });
  }
  console.log('✅ FAQs created');
}

async function seedAdZones() {
  const existing = await AdZone.countDocuments();
  if (existing > 0) {
    console.log('Ad zones already exist, skipping...');
    return;
  }

  const adZones = [
    {
      name: 'Header Banner',
      slug: 'header-banner',
      location: 'header',
      type: 'banner',
      code: '<div class="ad-header">Header Ad Space</div>',
      provider: 'google-adsense',
      isActive: true,
    },
    {
      name: 'Sidebar Ad',
      slug: 'sidebar-ad',
      location: 'sidebar',
      type: 'rectangle',
      code: '<div class="ad-sidebar">Sidebar Ad Space</div>',
      provider: 'google-adsense',
      isActive: true,
    },
    {
      name: 'Content Inline Ad',
      slug: 'content-inline-ad',
      location: 'content',
      type: 'inline',
      code: '<div class="ad-content">Content Ad Space</div>',
      provider: 'google-adsense',
      isActive: true,
    },
    {
      name: 'Footer Banner',
      slug: 'footer-banner',
      location: 'footer',
      type: 'banner',
      code: '<div class="ad-footer">Footer Ad Space</div>',
      provider: 'google-adsense',
      isActive: true,
    },
    {
      name: 'Exam Page Ad',
      slug: 'exam-page-ad',
      location: 'exam_page',
      type: 'rectangle',
      code: '<div class="ad-exam">Exam Page Ad Space</div>',
      provider: 'google-adsense',
      isActive: true,
    },
    {
      name: 'Mobile Sticky Ad',
      slug: 'mobile-sticky-ad',
      location: 'mobile',
      type: 'sticky',
      code: '<div class="ad-mobile">Mobile Ad Space</div>',
      provider: 'google-adsense',
      isActive: true,
    },
  ];

  for (const ad of adZones) {
    await AdZone.create({
        name: ad.name,
        slug: ad.slug,
        location: ad.location,
        type: ad.type,
        code: ad.code,
        provider: ad.provider,
        isActive: ad.isActive,
  });
  }
  console.log('✅ Ad zones created');
}

async function seedUsers() {
  const existingAdmin = await User.findOne({ email: 'admin@edu.com' }).lean();
  if (existingAdmin) {
    console.log('Admin user already exists, skipping...');
  } else {
    await User.create({
        email: 'admin@edu.com',
        name: 'Admin User',
        role: 'admin',
        password: hashPassword('admin'), // Demo: login with 'admin'
        emailVerified: true,
        provider: 'credentials',
  });
    console.log('✅ Admin user created');
  }

  const existingStudent = await User.findOne({ email: 'student@edu.com' }).lean();
  if (existingStudent) {
    console.log('Student user already exists, skipping...');
  } else {
    await User.create({
        email: 'student@edu.com',
        name: 'Demo Student',
        role: 'student',
        password: hashPassword('demo'), // Demo: login with 'demo'
        emailVerified: true,
        provider: 'credentials',
  });
    console.log('✅ Student user created');
  }
}

async function seedSettings() {
  const existing = await Setting.countDocuments();
  if (existing > 0) {
    console.log('Settings already exist, skipping...');
    return;
  }

  const settings = [
    { key: 'site_name', value: 'EduLearn Platform', type: 'string', group: 'general' },
    { key: 'site_description', value: 'Comprehensive educational learning platform for Class 1-12 students with detailed explanations, MCQ practice, and exam preparation.', type: 'string', group: 'general' },
    { key: 'site_url', value: 'https://edulearn.example.com', type: 'string', group: 'general' },
    { key: 'site_logo', value: '/logo.png', type: 'string', group: 'general' },
    { key: 'contact_email', value: 'support@edulearn.example.com', type: 'string', group: 'contact' },
    { key: 'contact_phone', value: '+91-1234567890', type: 'string', group: 'contact' },
    { key: 'enable_exams', value: 'true', type: 'boolean', group: 'features' },
    { key: 'enable_leaderboard', value: 'true', type: 'boolean', group: 'features' },
    { key: 'enable_ads', value: 'true', type: 'boolean', group: 'features' },
    { key: 'max_exam_attempts', value: '3', type: 'number', group: 'exam' },
    { key: 'exam_timer_default', value: '30', type: 'number', group: 'exam' },
    { key: 'google_analytics_id', value: 'none', type: 'string', group: 'analytics' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', group: 'system' },
    { key: 'default_language', value: 'en', type: 'string', group: 'system' },
  ];

  for (const s of settings) {
    await Setting.create({
        key: s.key,
        value: s.value,
        type: s.type,
        group: s.group,
  });
  }
  console.log('✅ Settings created');
}

async function seedCategories() {
  const existing = await Category.countDocuments();
  if (existing > 0) {
    console.log('Categories already exist, skipping...');
    return;
  }

  const categories = [
    {
      name: 'Academic Curriculum',
      slug: 'academic-curriculum',
      description: 'Class 1-12 regular curriculum with subjects, chapters, and study materials',
      icon: 'GraduationCap',
      color: 'from-emerald-500 to-teal-600',
      order: 1,
      isActive: true,
    },
    {
      name: 'Admission Test Preparation',
      slug: 'admission-test-preparation',
      description: 'Prepare for university and medical admission tests',
      icon: 'University',
      color: 'from-blue-500 to-indigo-600',
      order: 2,
      isActive: true,
    },
    {
      name: 'Job Preparation',
      slug: 'job-preparation',
      description: 'Government and private job exam preparation',
      icon: 'Briefcase',
      color: 'from-orange-500 to-red-600',
      order: 3,
      isActive: true,
    },
    {
      name: 'Free Resources / Library',
      slug: 'free-resources-library',
      description: 'মুক্ত রিসোর্স - E-books, notes, question banks, and educational blogs',
      icon: 'Library',
      color: 'from-purple-500 to-pink-600',
      order: 4,
      isActive: true,
    },
  ];

  for (const cat of categories) {
    await Category.create(cat);
  }
  console.log('✅ Categories created');
}

async function seedSubcategories() {
  const existing = await Subcategory.countDocuments();
  if (existing > 0) {
    console.log('Subcategories already exist, skipping...');
    return;
  }

  const academicCategory = await Category.findOne({ slug: 'academic-curriculum' }).lean();
  const admissionCategory = await Category.findOne({ slug: 'admission-test-preparation' }).lean();
  const jobCategory = await Category.findOne({ slug: 'job-preparation' }).lean();
  const resourcesCategory = await Category.findOne({ slug: 'free-resources-library' }).lean();

  if (!academicCategory || !admissionCategory || !jobCategory || !resourcesCategory) {
    console.log('Categories not found, skipping subcategories...');
    return;
  }

  const subcategories = [
    // Academic subcategories
    {
      categoryId: academicCategory._id,
      name: 'Primary Education',
      description: 'Class 1 to 5',
      order: 1,
      isActive: true,
    },
    {
      categoryId: academicCategory._id,
      name: 'Secondary Education',
      description: 'Class 6 to 10',
      order: 2,
      isActive: true,
    },
    {
      categoryId: academicCategory._id,
      name: 'Higher Secondary Education',
      description: 'Class 11 to 12',
      order: 3,
      isActive: true,
    },
    // Admission subcategories
    {
      categoryId: admissionCategory._id,
      name: 'University Admission',
      description: 'General university admission preparation',
      order: 1,
      isActive: true,
    },
    {
      categoryId: admissionCategory._id,
      name: 'Engineering Admission',
      description: 'BUET, RUET, KUET, CUET-এর প্রস্তুতি',
      order: 2,
      isActive: true,
    },
    {
      categoryId: admissionCategory._id,
      name: 'Medical Admission',
      description: 'Medical college admission preparation',
      order: 3,
      isActive: true,
    },
    // Job subcategories
    {
      categoryId: jobCategory._id,
      name: 'BCS Preparation',
      description: 'বিসিএস প্রিলিমিনারি ও লিখিত পরীক্ষার কোর্স',
      order: 1,
      isActive: true,
    },
    {
      categoryId: jobCategory._id,
      name: 'Bank Job',
      description: 'সরকারি ও বেসরকারি ব্যাংকের চাকরি প্রস্তুতি',
      order: 2,
      isActive: true,
    },
    {
      categoryId: jobCategory._id,
      name: 'Primary & NTRCA',
      description: 'প্রাথমিক শিক্ষক নিয়োগ এবং শিক্ষক নিবন্ধন পরীক্ষা',
      order: 3,
      isActive: true,
    },
    // Resources subcategories
    {
      categoryId: resourcesCategory._id,
      name: 'E-Books & Notes',
      description: 'ক্লাসের অধ্যায়ভিত্তিক হ্যান্ডনোট বা সাজেশন',
      order: 1,
      isActive: true,
    },
    {
      categoryId: resourcesCategory._id,
      name: 'Question Bank',
      description: 'বিগত বছরের বোর্ড পরীক্ষা ও ভর্তি পরীক্ষার প্রশ্ন ও সমাধান',
      order: 2,
      isActive: true,
    },
    {
      categoryId: resourcesCategory._id,
      name: 'Educational Blogs',
      description: 'পড়াশোনার টিপস, ক্যারিয়ার গাইডলাইন এবং অনুপ্রেরণামূলক লেখা',
      order: 3,
      isActive: true,
    },
  ];

  for (const sub of subcategories) {
    await Subcategory.create(sub);
  }
  console.log('✅ Subcategories created');
}

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  await connectDB();

  try {
    await seedCategories();
    await seedSubcategories();
    await seedClasses();
    await seedSubjects();
    await seedChapters();
    await seedExplanations();
    await seedCreativeQuestions();
    await seedMcqQuestions();
    await seedTestimonials();
    await seedFaqs();
    await seedAdZones();
    await seedUsers();
    await seedSettings();
    await seedQuotes();

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    // MongoDB connection managed by connectDB
  }
}
