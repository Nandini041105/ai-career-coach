import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume'
    },
    jobDescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription'
    },
    targetRole: {
      type: String,
      required: true
    },
    interviewType: {
      type: String,
      enum: ['technical', 'hr', 'project', 'mixed'],
      default: 'technical'
    },
    questionSource: {
      type: String,
      enum: ['role', 'resume', 'job', 'mixed'],
      default: 'role'
    },
    totalQuestions: {
      type: Number,
      enum: [5, 10, 15],
      default: 5
    },
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    questions: [
      {
        questionNumber: { type: Number, required: true },
        questionText: { type: String, required: true },
        category: { type: String, default: 'General' },
        difficulty: {
          type: String,
          enum: ['Easy', 'Medium', 'Hard'],
          default: 'Medium'
        },
        userAnswer: { type: String, default: '' },
        answeredAt: { type: Date },
        evaluation: {
          technicalAccuracy: { type: Number, min: 0, max: 10, default: 0 },
          relevance: { type: Number, min: 0, max: 10, default: 0 },
          completeness: { type: Number, min: 0, max: 10, default: 0 },
          communication: { type: Number, min: 0, max: 10, default: 0 },
          overallScore: { type: Number, min: 0, max: 10, default: 0 },
          whatWentWell: { type: String, default: '' },
          howToImprove: { type: String, default: '' },
          betterAnswerExample: { type: String, default: '' }
        }
      }
    ],
    overallInterviewScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    categoryPerformance: {
      technicalAccuracy: { type: Number, default: 0 },
      relevance: { type: Number, default: 0 },
      completeness: { type: Number, default: 0 },
      communication: { type: Number, default: 0 }
    },
    strongAreas: { type: [String], default: [] },
    weakAreas: { type: [String], default: [] },
    recommendedTopics: { type: [String], default: [] },
    summaryFeedback: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;
