import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    targetRole: {
      type: String,
      default: 'Software Engineer'
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    categoryScores: {
      skills: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      keywords: { type: Number, default: 0 },
      achievements: { type: Number, default: 0 },
      structure: { type: Number, default: 0 },
      relevance: { type: Number, default: 0 }
    },
    strengths: {
      type: [String],
      default: []
    },
    weaknesses: {
      type: [String],
      default: []
    },
    actionVerbs: {
      strong: { type: [String], default: [] },
      missingOrWeak: { type: [String], default: [] },
      feedback: { type: String, default: '' }
    },
    quantifiableAchievements: {
      count: { type: Number, default: 0 },
      examples: { type: [String], default: [] },
      feedback: { type: String, default: '' }
    },
    formattingIssues: {
      type: [String],
      default: []
    },
    keywordRelevance: {
      present: { type: [String], default: [] },
      recommended: { type: [String], default: [] }
    },
    suggestions: {
      type: [String],
      default: []
    },
    bulletImprovements: [
      {
        original: String,
        suggested: String,
        reason: String
      }
    ],
    disclaimer: {
      type: String,
      default:
        'This score is an AI-based estimate intended to help optimize your resume. Actual ATS systems and recruiter evaluations may use different criteria.'
    }
  },
  {
    timestamps: true
  }
);

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
export default ResumeAnalysis;
