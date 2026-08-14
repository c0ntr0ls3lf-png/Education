const mongoose = require('mongoose');
require('dotenv').config();

async function checkMcqs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bdpathsala');
    
    // Define a simple schema
    const mcqSchema = new mongoose.Schema({
      question: String,
      chapterId: String,
      _id: String
    }, { strict: false });
    
    const McqQuestion = mongoose.model('McqQuestion', mcqSchema);
    
    const questions = await McqQuestion.find({}, { question: 1, chapterId: 1, _id: 1 }).lean();
    
    console.log('Total MCQ questions:', questions.length);
    console.log('\nQuestions by chapter:');
    
    const byChapter = {};
    questions.forEach(q => {
      if (!byChapter[q.chapterId]) {
        byChapter[q.chapterId] = [];
      }
      byChapter[q.chapterId].push({
        id: q._id,
        question: q.question.substring(0, 50) + '...'
      });
    });
    
    Object.keys(byChapter).forEach(chapterId => {
      console.log(`\nChapter ID: ${chapterId} (${byChapter[chapterId].length} questions)`);
      byChapter[chapterId].forEach(q => {
        console.log(`  - ${q.id}: ${q.question}`);
      });
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkMcqs();
