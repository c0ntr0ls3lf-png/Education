import mongoose, { Schema, Document, Model } from 'mongoose';

// ─── User ─────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: string;
  emailVerified: boolean;
  password?: string | null;
  provider: string;
  providerId?: string | null;
  bio?: string | null;
  phone?: string | null;
  classId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    email: { type: String, required: true, unique: true },
    name: { type: String, default: null },
    image: { type: String, default: null },
    role: { type: String, default: 'student' },
    emailVerified: { type: Boolean, default: false },
    password: { type: String, default: null },
    provider: { type: String, default: 'credentials' },
    providerId: { type: String, default: null },
    bio: { type: String, default: null },
    phone: { type: String, default: null },
    classId: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
);
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ─── Class ────────────────────────────────────────────────────────────────
export interface IClass extends Document {
  _id: string;
  name: string;
  slug: string;
  number: number;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    number: { type: Number, required: true, unique: true },
    description: { type: String, default: null },
    icon: { type: String, default: null },
    color: { type: String, default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);
classSchema.index({ slug: 1 });
classSchema.index({ number: 1 });

// Virtual for subjects (reverse relation)
classSchema.virtual('subjects', {
  ref: 'Subject',
  localField: '_id',
  foreignField: 'classId',
});

// ─── Subject ──────────────────────────────────────────────────────────────
export interface ISubject extends Document {
  _id: string;
  name: string;
  slug: string;
  classId: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    classId: { type: String, required: true, ref: 'Class' },
    description: { type: String, default: null },
    icon: { type: String, default: null },
    color: { type: String, default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);
subjectSchema.index({ classId: 1, slug: 1 }, { unique: true });
subjectSchema.index({ slug: 1 });
subjectSchema.index({ classId: 1 });

// Virtuals for reverse relations
subjectSchema.virtual('class', {
  ref: 'Class',
  localField: 'classId',
  foreignField: '_id',
  justOne: true,
});
subjectSchema.virtual('chapters', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'subjectId',
});

// ─── Chapter ──────────────────────────────────────────────────────────────
export interface IChapter extends Document {
  _id: string;
  name: string;
  slug: string;
  subjectId: string;
  description?: string | null;
  sidebarContent?: string | null;
  icon?: string | null;
  color?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chapterSchema = new Schema<IChapter>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    subjectId: { type: String, required: true, ref: 'Subject' },
    description: { type: String, default: null },
    sidebarContent: { type: String, default: null },
    icon: { type: String, default: null },
    color: { type: String, default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);
chapterSchema.index({ subjectId: 1, slug: 1 }, { unique: true });
chapterSchema.index({ slug: 1 });
chapterSchema.index({ subjectId: 1 });

// Virtuals
chapterSchema.virtual('subject', {
  ref: 'Subject',
  localField: 'subjectId',
  foreignField: '_id',
  justOne: true,
});
chapterSchema.virtual('explanations', {
  ref: 'Explanation',
  localField: '_id',
  foreignField: 'chapterId',
});
chapterSchema.virtual('creativeQuestions', {
  ref: 'CreativeQuestion',
  localField: '_id',
  foreignField: 'chapterId',
});
chapterSchema.virtual('mcqQuestions', {
  ref: 'McqQuestion',
  localField: '_id',
  foreignField: 'chapterId',
});
chapterSchema.virtual('videos', {
  ref: 'Video',
  localField: '_id',
  foreignField: 'chapterId',
});

// ─── Explanation ──────────────────────────────────────────────────────────
export interface IExplanation extends Document {
  _id: string;
  chapterId: string;
  question: string;
  solution?: string | null;
  videoUrl?: string | null;
  order: number;
  difficulty: string;
  tags?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const explanationSchema = new Schema<IExplanation>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    chapterId: { type: String, required: true, ref: 'Chapter' },
    question: { type: String, required: true },
    solution: { type: String, default: null },
    videoUrl: { type: String, default: null },
    order: { type: Number, default: 0 },
    difficulty: { type: String, default: 'medium' },
    tags: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);
explanationSchema.index({ chapterId: 1 });
explanationSchema.index({ difficulty: 1 });

// ─── Creative Question ────────────────────────────────────────────────────
export interface ICreativeQuestion extends Document {
  _id: string;
  chapterId: string;
  label: string;
  question: string;
  answer?: string | null;
  marks: number;
  difficulty: string;
  explanation?: string | null;
  subQuestionA?: string | null;
  subQuestionB?: string | null;
  subQuestionC?: string | null;
  subQuestions?: string | null;
  tags?: string | null;
  order: number;
  isActive: boolean;
  // Board / Source metadata
  board_name?: string | null;
  exam_year?: number | null;
  sourceType?: 'board' | 'school' | 'model_test' | 'custom';
  createdAt: Date;
  updatedAt: Date;
}

const creativeQuestionSchema = new Schema<ICreativeQuestion>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    chapterId: { type: String, required: true, ref: 'Chapter' },
    label: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, default: null },
    marks: { type: Number, default: 10 },
    difficulty: { type: String, default: 'medium' },
    explanation: { type: String, default: null },
    subQuestionA: { type: String, default: null },
    subQuestionB: { type: String, default: null },
    subQuestionC: { type: String, default: null },
    subQuestions: { type: String, default: null },
    tags: { type: String, default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    board_name: { type: String, default: null },
    exam_year: { type: Number, default: null },
    sourceType: { type: String, default: 'custom', enum: ['board', 'school', 'model_test', 'custom'] },
  },
  { timestamps: true, versionKey: false }
);
creativeQuestionSchema.index({ chapterId: 1 });
creativeQuestionSchema.index({ label: 1 });
creativeQuestionSchema.index({ difficulty: 1 });
  creativeQuestionSchema.index({ board_name: 1 });
  creativeQuestionSchema.index({ exam_year: 1 });
  creativeQuestionSchema.index({ board_name: 1, exam_year: 1 });
creativeQuestionSchema.index({ sourceType: 1 });

// ─── MCQ Question ─────────────────────────────────────────────────────────
export interface IMcqQuestion extends Document {
  _id: string;
  chapterId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC?: string | null;
  optionD?: string | null;
  options?: string | null;
  correctAnswer: string;
  explanation?: string | null;
  videoUrl?: string | null;
  marks: number;
  difficulty: string;
  tags?: string | null;
  order: number;
  isActive: boolean;
  // Board / Source metadata
  board_name?: string | null;
  exam_year?: number | null;
  sourceType?: 'board' | 'school' | 'model_test' | 'custom';
  createdAt: Date;
  updatedAt: Date;
}

const mcqQuestionSchema = new Schema<IMcqQuestion>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    chapterId: { type: String, required: true, ref: 'Chapter' },
    question: { type: String, required: true },
    optionA: { type: String, required: true },
    optionB: { type: String, required: true },
    optionC: { type: String, default: null },
    optionD: { type: String, default: null },
    options: { type: String, default: null },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: null },
    videoUrl: { type: String, default: null },
    marks: { type: Number, default: 1 },
    difficulty: { type: String, default: 'medium' },
    tags: { type: String, default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    board_name: { type: String, default: null },
    exam_year: { type: Number, default: null },
    sourceType: { type: String, default: 'custom', enum: ['board', 'school', 'model_test', 'custom'] },
  },
  { timestamps: true, versionKey: false }
);
mcqQuestionSchema.index({ chapterId: 1 });
mcqQuestionSchema.index({ difficulty: 1 });
  mcqQuestionSchema.index({ board_name: 1 });
  mcqQuestionSchema.index({ exam_year: 1 });
  mcqQuestionSchema.index({ board_name: 1, exam_year: 1 });
mcqQuestionSchema.index({ sourceType: 1 });

// ─── Video ────────────────────────────────────────────────────────────────
export interface IVideo extends Document {
  _id: string;
  chapterId: string;
  title: string;
  url: string;
  thumbnail?: string | null;
  duration?: number | null;
  description?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    chapterId: { type: String, required: true, ref: 'Chapter' },
    title: { type: String, required: true },
    url: { type: String, required: true },
    thumbnail: { type: String, default: null },
    duration: { type: Number, default: null },
    description: { type: String, default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);
videoSchema.index({ chapterId: 1 });

// ─── Exam ─────────────────────────────────────────────────────────────────
export interface IExam extends Document {
  _id: string;
  title: string;
  slug: string;
  description?: string | null;
  type: string;
  sourceType: string;
  sourceIds: string;
  totalQuestions: number;
  marksPerQuestion: number;
  duration: number;
  timerPerQuestion?: number | null;
  difficulty: string;
  isPublic: boolean;
  createdBy?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<IExam>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    type: { type: String, required: true },
    sourceType: { type: String, required: true },
    sourceIds: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    marksPerQuestion: { type: Number, default: 1 },
    duration: { type: Number, required: true },
    timerPerQuestion: { type: Number, default: null },
    difficulty: { type: String, default: 'mixed' },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: String, default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);
examSchema.index({ slug: 1 });
examSchema.index({ type: 1 });
examSchema.index({ sourceType: 1 });

// Virtual for attempts
examSchema.virtual('attempts', {
  ref: 'ExamAttempt',
  localField: '_id',
  foreignField: 'examId',
});

// ─── Exam Attempt ─────────────────────────────────────────────────────────
export interface IExamAttempt extends Document {
  _id: string;
  examId: string;
  userId: string;
  answers: string;
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  timeTaken: number;
  rank?: number | null;
  status: string;
  startedAt: Date;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const examAttemptSchema = new Schema<IExamAttempt>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    examId: { type: String, required: true, ref: 'Exam' },
    userId: { type: String, required: true, ref: 'User' },
    answers: { type: String, required: true },
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
    rank: { type: Number, default: null },
    status: { type: String, default: 'in_progress' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);
examAttemptSchema.index({ examId: 1 });
examAttemptSchema.index({ userId: 1 });
examAttemptSchema.index({ status: 1 });

// Virtuals
examAttemptSchema.virtual('exam', {
  ref: 'Exam',
  localField: 'examId',
  foreignField: '_id',
  justOne: true,
});
examAttemptSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// ─── Bookmark ─────────────────────────────────────────────────────────────
const bookmarkSchema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: { type: String, required: true, ref: 'User' },
    type: { type: String, required: true },
    typeId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);
bookmarkSchema.index({ userId: 1, type: 1, typeId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1 });
bookmarkSchema.index({ type: 1 });

// ─── User Achievement ─────────────────────────────────────────────────────
const userAchievementSchema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: { type: String, required: true, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, default: null },
    icon: { type: String, default: null },
    type: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);
userAchievementSchema.index({ userId: 1 });
userAchievementSchema.index({ type: 1 });

// ─── Leaderboard ──────────────────────────────────────────────────────────
const leaderboardSchema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: { type: String, required: true },
    classId: { type: String, default: null },
    subjectId: { type: String, default: null },
    score: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    type: { type: String, required: true },
    period: { type: String, required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true }, versionKey: false }
);
leaderboardSchema.index({ userId: 1, type: 1, period: 1 }, { unique: true });
leaderboardSchema.index({ userId: 1 });
leaderboardSchema.index({ type: 1 });

// ─── Notification ─────────────────────────────────────────────────────────
const notificationSchema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: { type: String, required: true, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);
notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });

// ─── Ad Zone ──────────────────────────────────────────────────────────────
export interface IAdZone extends Document {
  _id: string;
  name: string;
  slug: string;
  location: string;
  type: string;
  code?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  provider?: string | null;
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const adZoneSchema = new Schema<IAdZone>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    code: { type: String, default: null },
    imageUrl: { type: String, default: null },
    linkUrl: { type: String, default: null },
    provider: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);
adZoneSchema.index({ slug: 1 });
adZoneSchema.index({ location: 1 });
adZoneSchema.index({ isActive: 1 });

// ─── SEO ──────────────────────────────────────────────────────────────────
const seoSchema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true, unique: true },
    metaTitle: { type: String, default: null },
    metaDescription: { type: String, default: null },
    canonicalUrl: { type: String, default: null },
    ogTitle: { type: String, default: null },
    ogDescription: { type: String, default: null },
    ogImage: { type: String, default: null },
    twitterCard: { type: String, default: 'summary_large_image' },
    twitterTitle: { type: String, default: null },
    twitterDescription: { type: String, default: null },
    twitterImage: { type: String, default: null },
    schemaMarkup: { type: String, default: null },
    keywords: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
);
seoSchema.index({ entityType: 1 });
seoSchema.index({ entityId: 1 });

// ─── Setting ──────────────────────────────────────────────────────────────
export interface ISetting extends Document {
  _id: string;
  key: string;
  value: string;
  type: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    type: { type: String, required: true },
    group: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);
settingSchema.index({ key: 1 });
settingSchema.index({ group: 1 });

// ─── Analytics ────────────────────────────────────────────────────────────
const analyticsSchema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    eventType: { type: String, required: true },
    entityId: { type: String, default: null },
    entityType: { type: String, default: null },
    userId: { type: String, default: null },
    metadata: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);
analyticsSchema.index({ eventType: 1 });
analyticsSchema.index({ entityType: 1 });
analyticsSchema.index({ createdAt: 1 });

// ─── Testimonial ──────────────────────────────────────────────────────────
export interface ITestimonial extends Document {
  _id: string;
  name: string;
  role?: string | null;
  content: string;
  avatar?: string | null;
  rating: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true },
    role: { type: String, default: null },
    content: { type: String, required: true },
    avatar: { type: String, default: null },
    rating: { type: Number, default: 5 },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);
testimonialSchema.index({ isActive: 1 });

// ─── FAQ ──────────────────────────────────────────────────────────────────
export interface IFAQ extends Document {
  _id: string;
  question: string;
  answer: string;
  category?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFAQ>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);
faqSchema.index({ category: 1 });
faqSchema.index({ isActive: 1 });

// ─── Quote ────────────────────────────────────────────────────────────────
export interface IQuote extends Document {
  _id: string;
  text: string;
  author?: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const quoteSchema = new Schema<IQuote>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    text: { type: String, required: true },
    author: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);
quoteSchema.index({ isActive: 1 });

// ─── Export Models ────────────────────────────────────────────────────────
export const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);
export const Class = (mongoose.models.Class as Model<IClass>) || mongoose.model<IClass>('Class', classSchema);
export const Subject = (mongoose.models.Subject as Model<ISubject>) || mongoose.model<ISubject>('Subject', subjectSchema);
export const Chapter = (mongoose.models.Chapter as Model<IChapter>) || mongoose.model<IChapter>('Chapter', chapterSchema);
export const Explanation = (mongoose.models.Explanation as Model<IExplanation>) || mongoose.model<IExplanation>('Explanation', explanationSchema);
export const CreativeQuestion = (mongoose.models.CreativeQuestion as Model<ICreativeQuestion>) || mongoose.model<ICreativeQuestion>('CreativeQuestion', creativeQuestionSchema);
export const McqQuestion = (mongoose.models.McqQuestion as Model<IMcqQuestion>) || mongoose.model<IMcqQuestion>('McqQuestion', mcqQuestionSchema);
export const Video = (mongoose.models.Video as Model<IVideo>) || mongoose.model<IVideo>('Video', videoSchema);
export const Exam = (mongoose.models.Exam as Model<IExam>) || mongoose.model<IExam>('Exam', examSchema);
export const ExamAttempt = (mongoose.models.ExamAttempt as Model<IExamAttempt>) || mongoose.model<IExamAttempt>('ExamAttempt', examAttemptSchema);
export const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);
export const UserAchievement = mongoose.models.UserAchievement || mongoose.model('UserAchievement', userAchievementSchema);
export const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export const AdZone = (mongoose.models.AdZone as Model<IAdZone>) || mongoose.model<IAdZone>('AdZone', adZoneSchema);
export const SEO = mongoose.models.SEO || mongoose.model('SEO', seoSchema);
export const Setting = (mongoose.models.Setting as Model<ISetting>) || mongoose.model<ISetting>('Setting', settingSchema);
export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
export const Testimonial = (mongoose.models.Testimonial as Model<ITestimonial>) || mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
export const FAQ = (mongoose.models.FAQ as Model<IFAQ>) || mongoose.model<IFAQ>('FAQ', faqSchema);
export const Quote = (mongoose.models.Quote as Model<IQuote>) || mongoose.model<IQuote>('Quote', quoteSchema);
