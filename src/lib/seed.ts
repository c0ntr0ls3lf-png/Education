import { connectDB, Class, Subject, Chapter, Explanation, CreativeQuestion, McqQuestion, Testimonial, FAQ, AdZone, User, Setting } from './db';
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

  for (let i = 1; i <= 12; i++) {
    await Class.create({
        name: `Class ${i}`,
        slug: `class-${i}`,
        number: i,
        description: `Educational content for Class ${i} students`,
        icon: classIcons[i - 1],
        color: classColors[i - 1],
        order: i,
        isActive: true,
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
        question: 'What is the first equation of motion?',
        solution: 'The first equation of motion relates initial velocity, acceleration, and final velocity:\n\n$$v = u + at$$\n\nWhere:\n- $v$ = final velocity\n- $u$ = initial velocity\n- $a$ = acceleration\n- $t$ = time',
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        difficulty: 'easy',
        tags: 'equations of motion,kinematics',
      },
      {
        question: 'Derive the second equation of motion: $s = ut + \\frac{1}{2}at^2$',
        solution: 'The second equation of motion gives displacement:\n\n$$s = ut + \\frac{1}{2}at^2$$\n\n**Derivation:**\nSince displacement = average velocity × time\n\n$$s = \\frac{u + v}{2} \\times t$$\n\nSubstituting $v = u + at$:\n\n$$s = \\frac{u + (u + at)}{2} \\times t$$\n\n$$s = \\frac{2u + at}{2} \\times t$$\n\n$$s = ut + \\frac{1}{2}at^2$$',
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        difficulty: 'medium',
        tags: 'equations of motion,derivation',
      },
      {
        question: 'What is the third equation of motion?',
        solution: 'The third equation relates velocity, acceleration, and displacement:\n\n$$v^2 = u^2 + 2as$$\n\nThis eliminates time from the equation and is useful when time is not given.',
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        difficulty: 'medium',
        tags: 'equations of motion,kinematics',
      },
      {
        question: 'A car starts from rest and accelerates at $2\\,\\text{m/s}^2$ for 10 seconds. Find the distance covered.',
        solution: 'Given:\n- $u = 0$ (starts from rest)\n- $a = 2\\,\\text{m/s}^2$\n- $t = 10\\,\\text{s}$\n\nUsing $s = ut + \\frac{1}{2}at^2$:\n\n$$s = 0 \\times 10 + \\frac{1}{2} \\times 2 \\times (10)^2$$\n\n$$s = 0 + 100$$\n\n$$s = 100\\,\\text{m}$$',
        videoUrl: 'https://www.youtube.com/watch?v=example4',
        difficulty: 'easy',
        tags: 'numerical,equations of motion',
      },
      {
        question: 'Explain the difference between distance and displacement.',
        solution: '**Distance** is the total path length traveled. It is a scalar quantity.\n\n**Displacement** is the shortest distance between initial and final positions. It is a vector quantity.\n\nFor example, if you walk 5m east and then 5m west:\n- Distance = $5 + 5 = 10\\,\\text{m}$\n- Displacement = $5 - 5 = 0\\,\\text{m}$\n\n$$|\\vec{d}| \\leq \\text{Distance}$$',
        videoUrl: 'https://www.youtube.com/watch?v=example5',
        difficulty: 'easy',
        tags: 'distance,displacement,vectors',
      },
      {
        question: 'A ball is thrown vertically upward with a velocity of $20\\,\\text{m/s}$. How high does it go? ($g = 10\\,\\text{m/s}^2$)',
        solution: 'Given:\n- $u = 20\\,\\text{m/s}$\n- $v = 0$ (at highest point)\n- $a = -g = -10\\,\\text{m/s}^2$\n\nUsing $v^2 = u^2 + 2as$:\n\n$$0 = (20)^2 + 2(-10)s$$\n\n$$0 = 400 - 20s$$\n\n$$s = 20\\,\\text{m}$$\n\nThe ball reaches a maximum height of $20\\,\\text{m}$.',
        videoUrl: 'https://www.youtube.com/watch?v=example6',
        difficulty: 'medium',
        tags: 'vertical motion,gravity',
      },
      {
        question: 'What is uniform circular motion? Derive the expression for centripetal acceleration.',
        solution: 'When an object moves in a circle with constant speed, it is in uniform circular motion.\n\n**Centripetal acceleration:**\n\n$$a_c = \\frac{v^2}{r} = \\omega^2 r$$\n\nWhere:\n- $v$ = linear velocity\n- $r$ = radius\n- $\\omega$ = angular velocity\n\nThe acceleration is always directed toward the center of the circle.\n\n**Centripetal force:**\n\n$$F_c = \\frac{mv^2}{r}$$',
        videoUrl: 'https://www.youtube.com/watch?v=example7',
        difficulty: 'hard',
        tags: 'circular motion,centripetal',
      },
    ],
    Electricity: [
      {
        question: 'State and explain Ohm\'s Law.',
        solution: '**Ohm\'s Law** states that the current through a conductor is directly proportional to the voltage across it, provided the temperature remains constant.\n\n$$V = IR$$\n\nWhere:\n- $V$ = potential difference (volts)\n- $I$ = current (amperes)\n- $R$ = resistance (ohms, $\\Omega$)',
        videoUrl: 'https://www.youtube.com/watch?v=elec1',
        difficulty: 'easy',
        tags: 'ohms law,resistance',
      },
      {
        question: 'Derive the formula for equivalent resistance in series combination.',
        solution: 'For resistors in **series**:\n\nThe same current flows through each resistor, and the total voltage is the sum of individual voltages.\n\n$$V = V_1 + V_2 + V_3$$\n\n$$IR = IR_1 + IR_2 + IR_3$$\n\n$$R_{eq} = R_1 + R_2 + R_3$$\n\nFor $n$ resistors in series:\n\n$$R_{eq} = \\sum_{i=1}^{n} R_i$$',
        videoUrl: 'https://www.youtube.com/watch?v=elec2',
        difficulty: 'medium',
        tags: 'series,resistance,circuits',
      },
      {
        question: 'Derive the formula for equivalent resistance in parallel combination.',
        solution: 'For resistors in **parallel**:\n\nThe voltage across each resistor is the same, and the total current is the sum of individual currents.\n\n$$I = I_1 + I_2 + I_3$$\n\n$$\\frac{V}{R_{eq}} = \\frac{V}{R_1} + \\frac{V}{R_2} + \\frac{V}{R_3}$$\n\n$$\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$$\n\nFor $n$ resistors in parallel:\n\n$$\\frac{1}{R_{eq}} = \\sum_{i=1}^{n} \\frac{1}{R_i}$$',
        videoUrl: 'https://www.youtube.com/watch?v=elec3',
        difficulty: 'medium',
        tags: 'parallel,resistance,circuits',
      },
      {
        question: 'Calculate the current flowing through a $5\\,\\Omega$ resistor connected to a $10\\,\\text{V}$ battery.',
        solution: 'Using Ohm\'s Law:\n\n$$V = IR$$\n\n$$I = \\frac{V}{R}$$\n\n$$I = \\frac{10}{5} = 2\\,\\text{A}$$\n\nThe current flowing through the resistor is $2\\,\\text{A}$.',
        videoUrl: 'https://www.youtube.com/watch?v=elec4',
        difficulty: 'easy',
        tags: 'numerical,ohms law',
      },
      {
        question: 'What is electrical power? Derive its expressions.',
        solution: '**Electrical Power** is the rate at which electrical energy is consumed or produced.\n\n$$P = VI$$\n\nUsing Ohm\'s Law ($V = IR$):\n\n$$P = I^2R = \\frac{V^2}{R}$$\n\nThe SI unit of power is Watt ($W$).\n\n**Electrical Energy:**\n\n$$E = Pt = VIt$$\n\nCommercial unit: kWh (kilowatt-hour)',
        videoUrl: 'https://www.youtube.com/watch?v=elec5',
        difficulty: 'medium',
        tags: 'power,energy',
      },
      {
        question: 'Three resistors of $2\\,\\Omega$, $3\\,\\Omega$, and $6\\,\\Omega$ are connected in parallel. Find the equivalent resistance.',
        solution: 'Given: $R_1 = 2\\,\\Omega$, $R_2 = 3\\,\\Omega$, $R_3 = 6\\,\\Omega$\n\n$$\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$$\n\n$$\\frac{1}{R_{eq}} = \\frac{1}{2} + \\frac{1}{3} + \\frac{1}{6}$$\n\n$$\\frac{1}{R_{eq}} = \\frac{3 + 2 + 1}{6} = \\frac{6}{6} = 1$$\n\n$$R_{eq} = 1\\,\\Omega$$',
        videoUrl: 'https://www.youtube.com/watch?v=elec6',
        difficulty: 'medium',
        tags: 'numerical,parallel,circuits',
      },
    ],
    Light: [
      {
        question: 'State the laws of reflection.',
        solution: '**Laws of Reflection:**\n\n1. The angle of incidence equals the angle of reflection:\n$$\\angle i = \\angle r$$\n\n2. The incident ray, the reflected ray, and the normal all lie in the same plane.',
        videoUrl: 'https://www.youtube.com/watch?v=light1',
        difficulty: 'easy',
        tags: 'reflection,optics',
      },
      {
        question: 'What is Snell\'s Law of Refraction?',
        solution: '**Snell\'s Law** states that the ratio of the sine of the angle of incidence to the sine of the angle of refraction is constant:\n\n$$\\frac{\\sin i}{\\sin r} = n_{21} = \\frac{n_2}{n_1}$$\n\nWhere $n_{21}$ is the refractive index of the second medium with respect to the first.\n\nFor a medium with absolute refractive index $n$:\n\n$$n = \\frac{c}{v}$$\n\nWhere $c$ is the speed of light in vacuum and $v$ is the speed in the medium.',
        videoUrl: 'https://www.youtube.com/watch?v=light2',
        difficulty: 'medium',
        tags: 'refraction,snells law',
      },
      {
        question: 'Derive the lens formula for a convex lens.',
        solution: '**Lens Formula:**\n\n$$\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}$$\n\nWhere:\n- $u$ = object distance (negative by sign convention)\n- $v$ = image distance\n- $f$ = focal length\n\n**Magnification:**\n\n$$m = \\frac{v}{u} = \\frac{h_i}{h_o}$$\n\nWhere $h_i$ is image height and $h_o$ is object height.',
        videoUrl: 'https://www.youtube.com/watch?v=light3',
        difficulty: 'medium',
        tags: 'lens,optics,formula',
      },
      {
        question: 'An object is placed at $2f$ from a convex lens of focal length $20\\,\\text{cm}$. Find the image position and nature.',
        solution: 'Given:\n- $u = -40\\,\\text{cm}$ (object at $2f$)\n- $f = 20\\,\\text{cm}$\n\nUsing lens formula:\n\n$$\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}$$\n\n$$\\frac{1}{v} = \\frac{1}{f} + \\frac{1}{u} = \\frac{1}{20} + \\frac{1}{-40}$$\n\n$$\\frac{1}{v} = \\frac{2 - 1}{40} = \\frac{1}{40}$$\n\n$$v = 40\\,\\text{cm}$$\n\nThe image is formed at $40\\,\\text{cm}$ on the other side, real, inverted, and same size.',
        videoUrl: 'https://www.youtube.com/watch?v=light4',
        difficulty: 'medium',
        tags: 'numerical,lens,optics',
      },
      {
        question: 'Explain total internal reflection and derive the condition for it.',
        solution: '**Total Internal Reflection** occurs when light traveling from a denser medium to a rarer medium is reflected back entirely.\n\n**Conditions:**\n1. Light must travel from denser to rarer medium\n2. Angle of incidence must be greater than critical angle\n\n**Critical angle:**\n\n$$\\sin C = \\frac{n_2}{n_1}$$\n\nWhere $n_1 > n_2$ (denser to rarer).\n\nFor glass to air:\n$$\\sin C = \\frac{1}{n_{glass}}$$\n\nApplications: optical fibers, prisms, mirages.',
        videoUrl: 'https://www.youtube.com/watch?v=light5',
        difficulty: 'hard',
        tags: 'total internal reflection,critical angle',
      },
      {
        question: 'What is the power of a lens? A convex lens has focal length $25\\,\\text{cm}$. Find its power.',
        solution: '**Power of a lens** is the ability to converge or diverge light rays.\n\n$$P = \\frac{1}{f\\,\\text{(in meters)}}$$\n\nUnit: Dioptre ($D$)\n\nFor $f = 25\\,\\text{cm} = 0.25\\,\\text{m}$:\n\n$$P = \\frac{1}{0.25} = +4\\,D$$\n\nConvex lens has positive power, concave lens has negative power.',
        videoUrl: 'https://www.youtube.com/watch?v=light6',
        difficulty: 'easy',
        tags: 'power of lens,optics',
      },
    ],
    Sound: [
      {
        question: 'What is sound? How does it propagate?',
        solution: 'Sound is a longitudinal mechanical wave that requires a medium to propagate.\n\n**Speed of sound:**\n\n$$v = f \\times \\lambda$$\n\nWhere:\n- $v$ = speed of sound\n- $f$ = frequency\n- $\\lambda$ = wavelength\n\nSpeed of sound in air at $20°C \\approx 343\\,\\text{m/s}$\n\nSound cannot travel through vacuum.',
        videoUrl: 'https://www.youtube.com/watch?v=sound1',
        difficulty: 'easy',
        tags: 'sound,waves',
      },
      {
        question: 'Derive the relation between time period and frequency.',
        solution: 'Time period ($T$) is the time for one complete oscillation.\nFrequency ($f$) is the number of oscillations per second.\n\n$$f = \\frac{1}{T}$$\n\n$$T = \\frac{1}{f}$$\n\nSI unit of frequency: Hertz ($Hz$)\nSI unit of time period: second ($s$)\n\nAngular frequency:\n$$\\omega = 2\\pi f = \\frac{2\\pi}{T}$$',
        videoUrl: 'https://www.youtube.com/watch?v=sound2',
        difficulty: 'easy',
        tags: 'frequency,time period',
      },
      {
        question: 'Explain the Doppler Effect and derive the expression for apparent frequency.',
        solution: '**Doppler Effect:** The apparent change in frequency of a wave due to relative motion between source and observer.\n\nWhen source moves toward stationary observer:\n\n$$f_{app} = f \\left(\\frac{v}{v - v_s}\\right)$$\n\nWhen source moves away from stationary observer:\n\n$$f_{app} = f \\left(\\frac{v}{v + v_s}\\right)$$\n\nWhere:\n- $f_{app}$ = apparent frequency\n- $f$ = actual frequency\n- $v$ = speed of sound\n- $v_s$ = speed of source',
        videoUrl: 'https://www.youtube.com/watch?v=sound3',
        difficulty: 'hard',
        tags: 'doppler effect,frequency',
      },
      {
        question: 'A sound wave has frequency $440\\,\\text{Hz}$ and wavelength $0.78\\,\\text{m}$. Calculate the speed of sound.',
        solution: 'Given:\n- $f = 440\\,\\text{Hz}$\n- $\\lambda = 0.78\\,\\text{m}$\n\n$$v = f \\times \\lambda$$\n\n$$v = 440 \\times 0.78$$\n\n$$v = 343.2\\,\\text{m/s}$$\n\nThe speed of sound is approximately $343\\,\\text{m/s}$.',
        videoUrl: 'https://www.youtube.com/watch?v=sound4',
        difficulty: 'easy',
        tags: 'numerical,sound,speed',
      },
      {
        question: 'What are the characteristics of sound waves?',
        solution: 'Sound waves have three main characteristics:\n\n1. **Amplitude ($A$)**: Determines loudness\n   - Greater amplitude = louder sound\n   - Intensity $\\propto A^2$\n\n2. **Frequency ($f$)**: Determines pitch\n   - Higher frequency = higher pitch\n   - Audible range: $20\\,\\text{Hz}$ to $20{,}000\\,\\text{Hz}$\n\n3. **Timbre/Quality**: Distinguishes different sounds of same pitch and loudness\n\n**Intensity of sound:**\n$$I = \\frac{P}{4\\pi r^2}$$\n\nWhere $P$ is power and $r$ is distance from source.',
        videoUrl: 'https://www.youtube.com/watch?v=sound5',
        difficulty: 'medium',
        tags: 'amplitude,frequency,timbre',
      },
    ],
    Magnetism: [
      {
        question: 'What is a magnetic field? How is it represented?',
        solution: 'A **magnetic field** is the region around a magnet where magnetic force can be detected.\n\n**Magnetic field lines:**\n- Emerge from North pole, enter South pole\n- Never intersect\n- Closer lines = stronger field\n\n**Magnetic flux:**\n$$\\phi_B = \\vec{B} \\cdot \\vec{A} = BA\\cos\\theta$$\n\nUnit: Weber ($Wb$)\n\n**Magnetic flux density:**\n$$B = \\frac{\\phi_B}{A}$$\n\nUnit: Tesla ($T$)',
        videoUrl: 'https://www.youtube.com/watch?v=mag1',
        difficulty: 'easy',
        tags: 'magnetic field,flux',
      },
      {
        question: 'State and explain Faraday\'s Law of Electromagnetic Induction.',
        solution: '**Faraday\'s Law:** The induced EMF is equal to the negative rate of change of magnetic flux.\n\n$$\\varepsilon = -\\frac{d\\phi_B}{dt}$$\n\nFor $N$ turns:\n$$\\varepsilon = -N\\frac{d\\phi_B}{dt}$$\n\n**Lenz\'s Law:** The direction of induced current opposes the change causing it (the negative sign).\n\nThis is the principle behind generators, transformers, and induction cooktops.',
        videoUrl: 'https://www.youtube.com/watch?v=mag2',
        difficulty: 'medium',
        tags: 'electromagnetic induction,faraday',
      },
      {
        question: 'Derive the force on a current-carrying conductor in a magnetic field.',
        solution: '**Force on a current-carrying conductor:**\n\n$$\\vec{F} = I(\\vec{l} \\times \\vec{B})$$\n\nMagnitude:\n$$F = IlB\\sin\\theta$$\n\nWhere:\n- $I$ = current\n- $l$ = length of conductor\n- $B$ = magnetic field strength\n- $\\theta$ = angle between $\\vec{l}$ and $\\vec{B}$\n\n**Maximum force** when $\\theta = 90°$:\n$$F_{max} = IlB$$\n\n**Direction**: Given by Fleming\'s Left-Hand Rule.',
        videoUrl: 'https://www.youtube.com/watch?v=mag3',
        difficulty: 'medium',
        tags: 'force,magnetic field,current',
      },
      {
        question: 'A wire of length $0.5\\,\\text{m}$ carrying $2\\,\\text{A}$ current is placed perpendicular to a magnetic field of $0.3\\,\\text{T}$. Find the force.',
        solution: 'Given:\n- $l = 0.5\\,\\text{m}$\n- $I = 2\\,\\text{A}$\n- $B = 0.3\\,\\text{T}$\n- $\\theta = 90°$\n\n$$F = IlB\\sin\\theta$$\n\n$$F = 2 \\times 0.5 \\times 0.3 \\times \\sin 90°$$\n\n$$F = 2 \\times 0.5 \\times 0.3 \\times 1$$\n\n$$F = 0.3\\,\\text{N}$$\n\nThe force on the wire is $0.3\\,\\text{N}$.',
        videoUrl: 'https://www.youtube.com/watch?v=mag4',
        difficulty: 'easy',
        tags: 'numerical,force,current',
      },
      {
        question: 'Explain the working principle of an electric motor.',
        solution: 'An **electric motor** converts electrical energy to mechanical energy using the force on a current-carrying coil in a magnetic field.\n\n**Torque on a coil:**\n\n$$\\tau = nBIA\\sin\\theta$$\n\nWhere:\n- $n$ = number of turns\n- $B$ = magnetic field\n- $I$ = current\n- $A$ = area of coil\n- $\\theta$ = angle between normal and field\n\nThe commutator reverses current direction every half rotation, maintaining continuous rotation.\n\n**Back EMF:**\n$$\\varepsilon_{back} = NBA\\omega\\sin\\omega t$$',
        videoUrl: 'https://www.youtube.com/watch?v=mag5',
        difficulty: 'hard',
        tags: 'motor,torque,electromagnetic',
      },
      {
        question: 'What is electromagnetic induction? Explain with examples.',
        solution: '**Electromagnetic Induction** is the production of EMF in a conductor when the magnetic flux through it changes.\n\n**Induced EMF in a moving conductor:**\n\n$$\\varepsilon = Blv$$\n\nWhere:\n- $B$ = magnetic field\n- $l$ = length of conductor\n- $v$ = velocity of conductor\n\n**Self-inductance:**\n$$\\varepsilon = -L\\frac{dI}{dt}$$\n\n**Mutual inductance:**\n$$\\varepsilon = -M\\frac{dI}{dt}$$\n\nApplications: generators, transformers, induction stoves, wireless charging.',
        videoUrl: 'https://www.youtube.com/watch?v=mag6',
        difficulty: 'medium',
        tags: 'induction,emf,applications',
      },
    ],
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
      { label: 'A', question: 'Define velocity and acceleration. Derive the three equations of motion using velocity-time graph.', answer: 'Velocity is the rate of change of displacement. Acceleration is the rate of change of velocity.\n\nThree equations:\n$$v = u + at$$\n$$s = ut + \\frac{1}{2}at^2$$\n$$v^2 = u^2 + 2as$$', marks: 10, difficulty: 'medium', explanation: 'Use the slope and area of v-t graph to derive these equations.' },
      { label: 'B', question: 'A train starting from rest attains a velocity of $72\\,\\text{km/h}$ in 5 minutes. Find (i) acceleration (ii) distance traveled.', answer: '$u = 0$, $v = 72\\,\\text{km/h} = 20\\,\\text{m/s}$, $t = 300\\,\\text{s}$\n\n(i) $a = \\frac{v-u}{t} = \\frac{20-0}{300} = 0.067\\,\\text{m/s}^2$\n\n(ii) $s = ut + \\frac{1}{2}at^2 = 0 + \\frac{1}{2}(0.067)(300)^2 = 3000\\,\\text{m}$', marks: 8, difficulty: 'easy', explanation: 'Convert units properly before applying equations of motion.' },
      { label: 'C', question: 'Explain uniform and non-uniform motion with examples. What is the nature of the distance-time graph for each?', answer: 'Uniform motion: Equal distances in equal time intervals. d-t graph is a straight line.\nNon-uniform motion: Unequal distances in equal time intervals. d-t graph is curved.\n\nFor uniform: $s = vt$\nFor non-uniform with constant acceleration: $s = ut + \\frac{1}{2}at^2$', marks: 6, difficulty: 'easy', explanation: 'Graphical representation helps visualize the type of motion.' },
      { label: 'D', question: 'A stone is dropped from a height of $80\\,\\text{m}$. Find (i) time to reach ground (ii) velocity on reaching ground. ($g = 10\\,\\text{m/s}^2$)', answer: '$u = 0$, $s = 80\\,\\text{m}$, $a = g = 10\\,\\text{m/s}^2$\n\n(i) $s = ut + \\frac{1}{2}gt^2$\n$80 = 0 + 5t^2$\n$t = 4\\,\\text{s}$\n\n(ii) $v = u + gt = 0 + 10 \\times 4 = 40\\,\\text{m/s}$', marks: 8, difficulty: 'medium', explanation: 'Free fall under gravity is a case of uniformly accelerated motion.' },
    ],
    Electricity: [
      { label: 'A', question: 'State Ohm\'s law. How would you verify it experimentally? Draw the circuit diagram.', answer: 'Ohm\'s Law: $V = IR$\n\nThe potential difference across a conductor is directly proportional to the current through it, at constant temperature.\n\nCircuit: Battery, ammeter (in series), voltmeter (in parallel with resistor), rheostat.', marks: 10, difficulty: 'medium', explanation: 'V-I graph gives a straight line passing through origin, with slope = R.' },
      { label: 'B', question: 'Calculate the equivalent resistance and current for three resistors of $4\\,\\Omega$, $6\\,\\Omega$, and $12\\,\\Omega$ connected in parallel to a $6\\,\\text{V}$ battery.', answer: '$\\frac{1}{R_{eq}} = \\frac{1}{4} + \\frac{1}{6} + \\frac{1}{12} = \\frac{3+2+1}{12} = \\frac{6}{12}$\n\n$R_{eq} = 2\\,\\Omega$\n\n$I = \\frac{V}{R_{eq}} = \\frac{6}{2} = 3\\,\\text{A}$', marks: 8, difficulty: 'medium', explanation: 'In parallel, equivalent resistance is always less than the smallest resistance.' },
      { label: 'C', question: 'Define electric power. A $100\\,\\text{W}$ bulb and a $60\\,\\text{W}$ bulb are connected in series. Which bulb glows brighter?', answer: 'Electric power: $P = VI = I^2R = \\frac{V^2}{R}$\n\nIn series, current is same through both bulbs.\n$R = \\frac{V^2}{P}$\n\n$R_{100} = \\frac{V^2}{100}$, $R_{60} = \\frac{V^2}{60}$\n\n$R_{60} > R_{100}$, so $P_{60} = I^2R_{60} > I^2R_{100} = P_{100}$\n\nThe 60W bulb glows brighter in series.', marks: 8, difficulty: 'hard', explanation: 'In series, higher resistance dissipates more power. In parallel, lower resistance dissipates more power.' },
      { label: 'D', question: 'Explain Kirchhoff\'s laws with examples.', answer: 'Kirchhoff\'s Current Law (KCL): Sum of currents entering a junction = Sum leaving.\n$$\\sum I_{in} = \\sum I_{out}$$\n\nKirchhoff\'s Voltage Law (KVL): Sum of all potential differences in a closed loop = 0.\n$$\\sum V = 0$$\n\nThese laws are based on conservation of charge and energy respectively.', marks: 10, difficulty: 'hard', explanation: 'KCL and KVL are fundamental tools for analyzing complex circuits.' },
    ],
    Light: [
      { label: 'A', question: 'With the help of a ray diagram, explain image formation by a concave mirror when the object is placed between $f$ and $2f$. Write the characteristics of the image.', answer: 'When object is between $f$ and $2f$:\n- Image is real\n- Image is inverted\n- Image is magnified\n- Image is formed beyond $2f$\n\nUsing mirror formula: $\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}$\nMagnification: $m = -\\frac{v}{u}$', marks: 10, difficulty: 'medium', explanation: 'Ray diagrams help visualize image formation in mirrors.' },
      { label: 'B', question: 'An object is placed $30\\,\\text{cm}$ from a convex lens of focal length $20\\,\\text{cm}$. Find the position, nature, and size of the image if the object is $5\\,\\text{cm}$ tall.', answer: '$u = -30\\,\\text{cm}$, $f = 20\\,\\text{cm}$\n\n$\\frac{1}{v} = \\frac{1}{f} + \\frac{1}{u} = \\frac{1}{20} + \\frac{1}{-30} = \\frac{3-2}{60} = \\frac{1}{60}$\n\n$v = 60\\,\\text{cm}$ (real image)\n\n$m = \\frac{v}{u} = \\frac{60}{-30} = -2$\n\nImage height = $m \\times h = -2 \\times 5 = -10\\,\\text{cm}$ (inverted, magnified)', marks: 8, difficulty: 'medium', explanation: 'Apply sign convention carefully in lens formula calculations.' },
      { label: 'C', question: 'Explain the phenomenon of dispersion of light through a prism.', answer: 'Dispersion is the splitting of white light into its component colors.\n\n$$n = \\frac{\\sin i}{\\sin r}$$\n\nDifferent colors have different wavelengths, hence different refractive indices:\n- Violet: shortest $\\lambda$, highest $n$, most deviated\n- Red: longest $\\lambda$, lowest $n$, least deviated\n\nVIBGYOR: Violet, Indigo, Blue, Green, Yellow, Orange, Red', marks: 6, difficulty: 'easy', explanation: 'Dispersion occurs because refractive index depends on wavelength.' },
      { label: 'D', question: 'Derive the mirror formula for a concave mirror.', answer: 'Mirror Formula:\n$$\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}$$\n\nUsing similar triangles from ray diagram and sign convention:\n- Object distance $u$ is negative\n- Image distance $v$ is negative for real image\n- Focal length $f$ is negative for concave mirror\n\nMagnification:\n$$m = -\\frac{v}{u}$$', marks: 10, difficulty: 'hard', explanation: 'The mirror formula works for both concave and convex mirrors with proper sign convention.' },
    ],
    Sound: [
      { label: 'A', question: 'What is the Doppler effect? Derive the expression for apparent frequency when the source moves toward a stationary observer.', answer: 'Doppler Effect: Apparent change in frequency due to relative motion.\n\nWhen source moves toward observer:\n$$f\' = f \\cdot \\frac{v}{v - v_s}$$\n\nWhere:\n- $f\'$ = apparent frequency\n- $f$ = actual frequency\n- $v$ = speed of sound\n- $v_s$ = speed of source\n\nSince $v_s > 0$, $f\' > f$ (higher pitch)', marks: 10, difficulty: 'hard', explanation: 'Doppler effect explains why sirens sound different when approaching vs receding.' },
      { label: 'B', question: 'A sound wave has a frequency of $500\\,\\text{Hz}$ and speed $340\\,\\text{m/s}$. Calculate its wavelength and time period.', answer: '$v = 340\\,\\text{m/s}$, $f = 500\\,\\text{Hz}$\n\nWavelength:\n$$\\lambda = \\frac{v}{f} = \\frac{340}{500} = 0.68\\,\\text{m}$$\n\nTime period:\n$$T = \\frac{1}{f} = \\frac{1}{500} = 0.002\\,\\text{s} = 2\\,\\text{ms}$$', marks: 6, difficulty: 'easy', explanation: 'Frequency and wavelength are inversely related for constant wave speed.' },
      { label: 'C', question: 'Explain echo and reverberation. Calculate the minimum distance to hear an echo clearly.', answer: '**Echo**: Distinct repetition of sound due to reflection.\n**Reverberation**: Multiple reflections creating persistence of sound.\n\nMinimum distance for echo:\nTime to hear = $0.1\\,\\text{s}$ (persistence of hearing)\n\n$$d = \\frac{v \\times t}{2} = \\frac{340 \\times 0.1}{2} = 17\\,\\text{m}$$\n\nThe sound must travel to the reflecting surface and back.', marks: 8, difficulty: 'medium', explanation: 'Echoes require sufficient distance for the reflected sound to be distinct.' },
      { label: 'D', question: 'What are ultrasonic and infrasonic waves? List their applications.', answer: 'Ultrasonic: $f > 20{,}000\\,\\text{Hz}$ (above audible range)\n- Medical imaging (ultrasound)\n- SONAR\n- Cleaning\n- Welding\n\nInfrasonic: $f < 20\\,\\text{Hz}$ (below audible range)\n- Earthquake detection\n- Volcano monitoring\n- Animal communication (elephants, whales)\n\nSpeed remains: $v = f\\lambda$ regardless of frequency.', marks: 6, difficulty: 'easy', explanation: 'Both are sound waves but outside human hearing range.' },
    ],
    Magnetism: [
      { label: 'A', question: 'State Faraday\'s laws of electromagnetic induction. An EMF of $5\\,\\text{V}$ is induced in a coil when the magnetic flux changes from $0.1\\,\\text{Wb}$ to $0.5\\,\\text{Wb}$ in $0.1\\,\\text{s}$. Find the number of turns.', answer: 'Faraday\'s Law: $\\varepsilon = -N\\frac{\\Delta\\phi}{\\Delta t}$\n\nGiven: $\\varepsilon = 5\\,\\text{V}$, $\\Delta\\phi = 0.5 - 0.1 = 0.4\\,\\text{Wb}$, $\\Delta t = 0.1\\,\\text{s}$\n\n$$5 = N \\times \\frac{0.4}{0.1}$$\n\n$$5 = N \\times 4$$\n\n$$N = \\frac{5}{4} \\approx 1.25$$\n\n(So approximately 2 turns for practical purposes)', marks: 8, difficulty: 'medium', explanation: 'The negative sign in Faraday\'s law represents Lenz\'s law.' },
      { label: 'B', question: 'Explain the working of a transformer and derive the transformation ratio.', answer: 'A transformer changes AC voltage using mutual induction.\n\n**Transformer equation:**\n$$\\frac{V_s}{V_p} = \\frac{N_s}{N_p} = n$$\n\nWhere $n$ is the turns ratio.\n\nStep-up: $N_s > N_p$, $V_s > V_p$\nStep-down: $N_s < N_p$, $V_s < V_p$\n\n**Efficiency:**\n$$\\eta = \\frac{P_{out}}{P_{in}} = \\frac{V_s I_s}{V_p I_p}$$\n\nIdeal: $\\eta = 100\\%$, $V_p I_p = V_s I_s$', marks: 10, difficulty: 'hard', explanation: 'Transformers only work with AC, not DC.' },
      { label: 'C', question: 'Describe the magnetic field due to a current-carrying solenoid.', answer: 'A solenoid produces a nearly uniform magnetic field inside.\n\n**Field inside solenoid:**\n$$B = \\mu_0 n I$$\n\nWhere:\n- $\\mu_0 = 4\\pi \\times 10^{-7}\\,\\text{T·m/A}$\n- $n$ = number of turns per unit length\n- $I$ = current\n\nField lines inside are parallel (uniform). Outside, the field resembles a bar magnet.', marks: 8, difficulty: 'medium', explanation: 'Solenoids are used to create controlled magnetic fields in experiments.' },
      { label: 'D', question: 'A circular coil of 100 turns and radius $10\\,\\text{cm}$ carries a current of $1\\,\\text{A}$. Find the magnetic field at its center. ($\\mu_0 = 4\\pi \\times 10^{-7}\\,\\text{T·m/A}$)', answer: '$N = 100$, $r = 0.1\\,\\text{m}$, $I = 1\\,\\text{A}$\n\n$$B = \\frac{\\mu_0 N I}{2r}$$\n\n$$B = \\frac{4\\pi \\times 10^{-7} \\times 100 \\times 1}{2 \\times 0.1}$$\n\n$$B = \\frac{4\\pi \\times 10^{-5}}{0.2}$$\n\n$$B = 2\\pi \\times 10^{-4} \\approx 6.28 \\times 10^{-4}\\,\\text{T}$$', marks: 8, difficulty: 'medium', explanation: 'This formula applies to a flat circular coil at its center point.' },
    ],
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
      { question: 'The SI unit of acceleration is:', optionA: '$\\text{m/s}$', optionB: '$\\text{m/s}^2$', optionC: '$\\text{m}^2/\\text{s}$', optionD: '$\\text{m}^2/\\text{s}^2$', correctAnswer: 'B', explanation: 'Acceleration = rate of change of velocity = $\\frac{\\Delta v}{\\Delta t}$, unit is $\\text{m/s}^2$', difficulty: 'easy' },
      { question: 'A body moves with uniform velocity. Its acceleration is:', optionA: 'Positive', optionB: 'Negative', optionC: 'Zero', optionD: 'Cannot be determined', correctAnswer: 'C', explanation: 'Uniform velocity means $\\frac{dv}{dt} = 0$, so acceleration = 0', difficulty: 'easy' },
      { question: 'The area under a velocity-time graph gives:', optionA: 'Acceleration', optionB: 'Velocity', optionC: 'Displacement', optionD: 'Force', correctAnswer: 'C', explanation: 'Area under v-t graph = $\\int v\\,dt = s$ (displacement)', difficulty: 'easy' },
      { question: 'A car accelerates from $5\\,\\text{m/s}$ to $25\\,\\text{m/s}$ in $4\\,\\text{s}$. The acceleration is:', optionA: '$5\\,\\text{m/s}^2$', optionB: '$10\\,\\text{m/s}^2$', optionC: '$2.5\\,\\text{m/s}^2$', optionD: '$7.5\\,\\text{m/s}^2$', correctAnswer: 'A', explanation: '$a = \\frac{v - u}{t} = \\frac{25 - 5}{4} = 5\\,\\text{m/s}^2$', difficulty: 'easy' },
      { question: 'The slope of a distance-time graph gives:', optionA: 'Acceleration', optionB: 'Displacement', optionC: 'Velocity', optionD: 'Force', correctAnswer: 'C', explanation: 'Slope of d-t graph = $\\frac{ds}{dt} = v$', difficulty: 'easy' },
      { question: 'Which equation of motion does not involve time?', optionA: '$v = u + at$', optionB: '$s = ut + \\frac{1}{2}at^2$', optionC: '$v^2 = u^2 + 2as$', optionD: '$s = \\frac{u+v}{2} \\times t$', correctAnswer: 'C', explanation: '$v^2 = u^2 + 2as$ is derived by eliminating $t$ from the other equations.', difficulty: 'medium' },
      { question: 'A freely falling body covers ___ of the total distance in the last second of its fall from rest:', optionA: '$1/2$', optionB: '$1/3$', optionC: '$3/4$', optionD: '$9/25$', correctAnswer: 'D', explanation: 'For a body falling for $n$ seconds, distance in last second $= \\frac{2n-1}{n^2}$. For $n=5$: $\\frac{9}{25}$ of total.', difficulty: 'hard' },
      { question: 'If a body covers equal displacements in equal intervals of time, it moves with:', optionA: 'Uniform speed', optionB: 'Uniform velocity', optionC: 'Uniform acceleration', optionD: 'Variable acceleration', correctAnswer: 'B', explanation: 'Equal displacement in equal time means constant velocity (both speed and direction).', difficulty: 'medium' },
      { question: 'A ball is thrown up with velocity $u$. It returns to the thrower with velocity:', optionA: '$u$', optionB: '$-u$', optionC: '$2u$', optionD: '$u/2$', correctAnswer: 'A', explanation: 'By symmetry, $v^2 = u^2 - 2gH$ and on return $v^2 = 0 + 2gH = u^2$, so $|v| = |u|$', difficulty: 'medium' },
      { question: 'Retardation means:', optionA: 'Positive acceleration', optionB: 'Negative acceleration', optionC: 'Zero acceleration', optionD: 'Uniform velocity', correctAnswer: 'B', explanation: 'Retardation (deceleration) means velocity is decreasing, so acceleration is negative: $a < 0$', difficulty: 'easy' },
    ],
    Electricity: [
      { question: 'The SI unit of electric current is:', optionA: 'Volt', optionB: 'Ohm', optionC: 'Ampere', optionD: 'Watt', correctAnswer: 'C', explanation: 'Electric current $I = \\frac{Q}{t}$, SI unit is Ampere (A)', difficulty: 'easy' },
      { question: 'According to Ohm\'s law:', optionA: '$V = IR$', optionB: '$V = I/R$', optionC: '$V = R/I$', optionD: '$V = I^2R$', correctAnswer: 'A', explanation: 'Ohm\'s Law: $V = IR$, where V is voltage, I is current, R is resistance', difficulty: 'easy' },
      { question: 'Two resistors of $4\\,\\Omega$ and $6\\,\\Omega$ are connected in series. The equivalent resistance is:', optionA: '$2.4\\,\\Omega$', optionB: '$10\\,\\Omega$', optionC: '$2\\,\\Omega$', optionD: '$24\\,\\Omega$', correctAnswer: 'B', explanation: 'In series: $R_{eq} = R_1 + R_2 = 4 + 6 = 10\\,\\Omega$', difficulty: 'easy' },
      { question: 'The resistivity of a conductor depends on:', optionA: 'Length', optionB: 'Area of cross-section', optionC: 'Material', optionD: 'All of these', correctAnswer: 'C', explanation: 'Resistivity $\\rho$ is a material property. $R = \\rho\\frac{l}{A}$, but $\\rho$ itself depends only on material.', difficulty: 'medium' },
      { question: 'The commercial unit of electrical energy is:', optionA: 'Joule', optionB: 'Watt', optionC: 'kWh', optionD: 'Volt-ampere', correctAnswer: 'C', explanation: '1 kWh = $3.6 \\times 10^6$ J. It is the energy consumed by a 1kW device in 1 hour.', difficulty: 'easy' },
      { question: 'In a parallel combination of resistors, the voltage across each resistor is:', optionA: 'Different', optionB: 'Same', optionC: 'Zero', optionD: 'Equal to the sum of voltages', correctAnswer: 'B', explanation: 'In parallel, all resistors are connected across the same two points, so $V_1 = V_2 = V_3 = V$', difficulty: 'easy' },
      { question: 'A wire of resistance $R$ is stretched to double its length. Its new resistance will be:', optionA: '$R$', optionB: '$2R$', optionC: '$4R$', optionD: '$R/2$', correctAnswer: 'C', explanation: '$R = \\rho\\frac{l}{A}$. If $l$ doubles, $A$ halves (volume constant). New $R\' = \\rho\\frac{2l}{A/2} = 4R$', difficulty: 'medium' },
      { question: 'The power dissipated in a resistor is $P = I^2R$. If current is doubled, power becomes:', optionA: '$2P$', optionB: '$4P$', optionC: '$8P$', optionD: '$16P$', correctAnswer: 'B', explanation: '$P = I^2R$. If $I\' = 2I$, then $P\' = (2I)^2R = 4I^2R = 4P$', difficulty: 'medium' },
      { question: 'An electric bulb is rated $100\\,\\text{W}$, $220\\,\\text{V}$. The resistance of the bulb is:', optionA: '$484\\,\\Omega$', optionB: '$2.2\\,\\Omega$', optionC: '$220\\,\\Omega$', optionD: '$100\\,\\Omega$', correctAnswer: 'A', explanation: '$R = \\frac{V^2}{P} = \\frac{220^2}{100} = \\frac{48400}{100} = 484\\,\\Omega$', difficulty: 'medium' },
    ],
    Light: [
      { question: 'The speed of light in vacuum is approximately:', optionA: '$3 \\times 10^6\\,\\text{m/s}$', optionB: '$3 \\times 10^8\\,\\text{m/s}$', optionC: '$3 \\times 10^{10}\\,\\text{m/s}$', optionD: '$3 \\times 10^4\\,\\text{m/s}$', correctAnswer: 'B', explanation: 'Speed of light $c = 3 \\times 10^8\\,\\text{m/s}$ in vacuum', difficulty: 'easy' },
      { question: 'The focal length of a concave mirror is:', optionA: 'Positive', optionB: 'Negative', optionC: 'Zero', optionD: 'Infinity', correctAnswer: 'B', explanation: 'By sign convention, focal length of concave mirror is negative (focus is in front of mirror)', difficulty: 'easy' },
      { question: 'The power of a convex lens of focal length $50\\,\\text{cm}$ is:', optionA: '$+2\\,D$', optionB: '$-2\\,D$', optionC: '$+0.5\\,D$', optionD: '$+50\\,D$', correctAnswer: 'A', explanation: '$P = \\frac{1}{f(\\text{in m})} = \\frac{1}{0.5} = +2\\,D$. Convex lens has positive power.', difficulty: 'easy' },
      { question: 'A ray of light traveling from denser to rarer medium bends:', optionA: 'Toward the normal', optionB: 'Away from the normal', optionC: 'Along the normal', optionD: 'Does not bend', correctAnswer: 'B', explanation: 'When light goes from denser ($n_1$) to rarer ($n_2$) medium, it bends away from normal since $\\sin r > \\sin i$', difficulty: 'medium' },
      { question: 'Total internal reflection occurs when light travels from:', optionA: 'Rarer to denser medium', optionB: 'Denser to rarer medium', optionC: 'Vacuum to any medium', optionD: 'Any medium to vacuum', correctAnswer: 'B', explanation: 'TIR requires: (1) denser to rarer medium, (2) angle of incidence > critical angle. $\\sin C = \\frac{n_2}{n_1}$', difficulty: 'medium' },
      { question: 'The refractive index of glass is 1.5. The speed of light in glass is:', optionA: '$2 \\times 10^8\\,\\text{m/s}$', optionB: '$4.5 \\times 10^8\\,\\text{m/s}$', optionC: '$1.5 \\times 10^8\\,\\text{m/s}$', optionD: '$3 \\times 10^8\\,\\text{m/s}$', correctAnswer: 'A', explanation: '$n = \\frac{c}{v}$, so $v = \\frac{c}{n} = \\frac{3 \\times 10^8}{1.5} = 2 \\times 10^8\\,\\text{m/s}$', difficulty: 'medium' },
      { question: 'An object is placed at the focus of a convex lens. The image is formed at:', optionA: 'Focus', optionB: '$2f$', optionC: 'Optical center', optionD: 'Infinity', correctAnswer: 'D', explanation: 'When $u = f$: $\\frac{1}{v} = \\frac{1}{f} + \\frac{1}{-f} = 0$, so $v \\to \\infty$. Image at infinity, highly magnified.', difficulty: 'medium' },
      { question: 'Which color of light deviates the most during dispersion?', optionA: 'Red', optionB: 'Yellow', optionC: 'Green', optionD: 'Violet', correctAnswer: 'D', explanation: 'Violet has shortest wavelength, highest refractive index, hence maximum deviation. $n_{violet} > n_{red}$', difficulty: 'easy' },
    ],
    Sound: [
      { question: 'Sound waves are:', optionA: 'Transverse', optionB: 'Longitudinal', optionC: 'Electromagnetic', optionD: 'Neither longitudinal nor transverse', correctAnswer: 'B', explanation: 'Sound waves are longitudinal mechanical waves requiring a medium. Particles vibrate parallel to wave direction.', difficulty: 'easy' },
      { question: 'The audible range of frequency for humans is:', optionA: '$20\\,\\text{Hz}$ to $20{,}000\\,\\text{Hz}$', optionB: '$20\\,\\text{Hz}$ to $200{,}000\\,\\text{Hz}$', optionC: '$200\\,\\text{Hz}$ to $20{,}000\\,\\text{Hz}$', optionD: '$2\\,\\text{Hz}$ to $2{,}000\\,\\text{Hz}$', correctAnswer: 'A', explanation: 'Human hearing range: $20\\,\\text{Hz}$ to $20{,}000\\,\\text{Hz}$ (approximately)', difficulty: 'easy' },
      { question: 'The speed of sound in air at $0°C$ is approximately:', optionA: '$332\\,\\text{m/s}$', optionB: '$340\\,\\text{m/s}$', optionC: '$300\\,\\text{m/s}$', optionD: '$380\\,\\text{m/s}$', correctAnswer: 'A', explanation: 'Speed of sound at $0°C \\approx 332\\,\\text{m/s}$. At $20°C \\approx 343\\,\\text{m/s}$. $v \\propto \\sqrt{T}$', difficulty: 'easy' },
      { question: 'The pitch of sound depends on:', optionA: 'Amplitude', optionB: 'Frequency', optionC: 'Wavelength', optionD: 'Speed', correctAnswer: 'B', explanation: 'Pitch is the perception of frequency. Higher frequency = higher pitch. $f = \\frac{v}{\\lambda}$', difficulty: 'easy' },
      { question: 'Echo is produced due to:', optionA: 'Refraction of sound', optionB: 'Reflection of sound', optionC: 'Diffraction of sound', optionD: 'Interference of sound', correctAnswer: 'B', explanation: 'Echo is the repetition of sound due to reflection from a surface. Minimum distance = $\\frac{v \\times t}{2} = 17\\,\\text{m}$', difficulty: 'easy' },
      { question: 'The relation between frequency ($f$) and time period ($T$) is:', optionA: '$f = T$', optionB: '$f = \\frac{1}{T}$', optionC: '$f = T^2$', optionD: '$f = 2\\pi T$', correctAnswer: 'B', explanation: 'Frequency and time period are inversely related: $f = \\frac{1}{T}$, where $T$ is time for one oscillation', difficulty: 'easy' },
      { question: 'Sound travels fastest in:', optionA: 'Air', optionB: 'Water', optionC: 'Steel', optionD: 'Vacuum', correctAnswer: 'C', explanation: 'Speed of sound: Steel ($\\sim 5960\\,\\text{m/s}$) > Water ($\\sim 1500\\,\\text{m/s}$) > Air ($\\sim 343\\,\\text{m/s}$). Sound cannot travel in vacuum.', difficulty: 'medium' },
      { question: 'The intensity of sound is proportional to:', optionA: 'Amplitude', optionB: '$A^2$', optionC: 'Frequency', optionD: 'Wavelength', correctAnswer: 'B', explanation: 'Intensity $I \\propto A^2$. Doubling amplitude quadruples the intensity.', difficulty: 'medium' },
      { question: 'Ultrasound has frequency:', optionA: 'Below $20\\,\\text{Hz}$', optionB: '$20\\,\\text{Hz}$ to $20{,}000\\,\\text{Hz}$', optionC: 'Above $20{,}000\\,\\text{Hz}$', optionD: 'Below $1\\,\\text{Hz}$', correctAnswer: 'C', explanation: 'Ultrasound: $f > 20{,}000\\,\\text{Hz}$. Used in medical imaging, SONAR, etc.', difficulty: 'easy' },
    ],
    Magnetism: [
      { question: 'The SI unit of magnetic flux is:', optionA: 'Tesla', optionB: 'Weber', optionC: 'Henry', optionD: 'Gauss', correctAnswer: 'B', explanation: 'Magnetic flux $\\phi_B = \\vec{B} \\cdot \\vec{A} = BA\\cos\\theta$, unit: Weber ($Wb$). $1\\,Wb = 1\\,T \\cdot m^2$', difficulty: 'easy' },
      { question: 'The magnetic field inside a long solenoid is:', optionA: 'Zero', optionB: 'Non-uniform', optionC: 'Uniform', optionD: 'Infinite', correctAnswer: 'C', explanation: '$B = \\mu_0 nI$ inside a solenoid is uniform and parallel to axis.', difficulty: 'easy' },
      { question: 'Faraday\'s law of electromagnetic induction states that the induced EMF is equal to:', optionA: '$-\\frac{dI}{dt}$', optionB: '$-\\frac{d\\phi_B}{dt}$', optionC: '$-\\frac{dV}{dt}$', optionD: '$-\\frac{dB}{dt}$', correctAnswer: 'B', explanation: 'Faraday\'s Law: $\\varepsilon = -N\\frac{d\\phi_B}{dt}$. The induced EMF equals the negative rate of change of magnetic flux.', difficulty: 'easy' },
      { question: 'Lenz\'s law is a consequence of the law of conservation of:', optionA: 'Charge', optionB: 'Momentum', optionC: 'Energy', optionD: 'Mass', correctAnswer: 'C', explanation: 'Lenz\'s law (induced current opposes change) ensures energy conservation in electromagnetic induction.', difficulty: 'medium' },
      { question: 'The force on a current-carrying conductor in a magnetic field is given by:', optionA: '$F = qvB$', optionB: '$F = IlB\\sin\\theta$', optionC: '$F = \\frac{kq_1q_2}{r^2}$', optionD: '$F = ma$', correctAnswer: 'B', explanation: '$F = IlB\\sin\\theta$ where I = current, l = length, B = field, $\\theta$ = angle between $\\vec{l}$ and $\\vec{B}$', difficulty: 'easy' },
      { question: 'A transformer works on the principle of:', optionA: 'Self-induction', optionB: 'Mutual induction', optionC: 'Electromagnetic radiation', optionD: 'Eddy currents', correctAnswer: 'B', explanation: 'Transformers work on mutual induction: changing current in primary coil induces EMF in secondary coil. $\\frac{V_s}{V_p} = \\frac{N_s}{N_p}$', difficulty: 'easy' },
      { question: 'The direction of force on a current-carrying conductor in a magnetic field is given by:', optionA: 'Right-hand rule', optionB: 'Fleming\'s left-hand rule', optionC: 'Fleming\'s right-hand rule', optionD: 'Ampere\'s rule', correctAnswer: 'B', explanation: 'Fleming\'s Left-Hand Rule: Forefinger = Field, Middle finger = Current, Thumb = Force (for motor effect)', difficulty: 'easy' },
      { question: 'The self-inductance of a coil depends on:', optionA: 'Current through it', optionB: 'Voltage across it', optionC: 'Number of turns and core material', optionD: 'Resistance of the coil', correctAnswer: 'C', explanation: '$L = \\frac{\\mu_0 N^2 A}{l}$. Self-inductance depends on geometry (N, A, l) and core material ($\\mu$), not on current or voltage.', difficulty: 'medium' },
      { question: 'In a step-up transformer:', optionA: '$V_s > V_p$, $I_s < I_p$', optionB: '$V_s < V_p$, $I_s > I_p$', optionC: '$V_s > V_p$, $I_s > I_p$', optionD: '$V_s = V_p$, $I_s = I_p$', correctAnswer: 'A', explanation: 'Step-up: $V_s > V_p$ (more turns on secondary). Since $P_{in} \\approx P_{out}$, $V_s I_s \\approx V_p I_p$, so $I_s < I_p$', difficulty: 'medium' },
    ],
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
      name: 'Priya Sharma',
      role: 'Class 10 Student, Delhi',
      content: 'This platform helped me score 95% in my board exams! The physics explanations are incredibly clear, especially the step-by-step solutions with formulas.',
      rating: 5,
      order: 1,
    },
    {
      name: 'Rahul Verma',
      role: 'Class 12 Student, Mumbai',
      content: 'The MCQ practice section is amazing. I could track my progress and identify weak areas. The instant feedback with explanations made learning so much easier.',
      rating: 5,
      order: 2,
    },
    {
      name: 'Anjali Gupta',
      role: 'Parent, Bangalore',
      content: 'As a parent, I appreciate the structured approach. My daughter improved from 60% to 85% in just 3 months. The creative questions really helped her think critically.',
      rating: 4,
      order: 3,
    },
    {
      name: 'Vikram Singh',
      role: 'Teacher, Chennai',
      content: 'I recommend this platform to all my students. The content quality is excellent and aligned with the curriculum. The video explanations are a great addition.',
      rating: 5,
      order: 4,
    },
    {
      name: 'Meera Patel',
      role: 'Class 9 Student, Ahmedabad',
      content: 'The chapter-wise organization makes it so easy to study. I love how each concept builds on the previous one. The exam feature is great for revision!',
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

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  await connectDB();

  try {
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
