import mongoose from 'mongoose';

const jobMatchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true
    },
    jobDescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
      required: true
    },
    overallMatchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    categoryScores: {
      technicalSkills: { type: Number, default: 0 },
      keywords: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      education: { type: Number, default: 0 }
    },
    categoryWeights: {
      technicalSkills: { type: Number, default: 40 },
      keywords: { type: Number, default: 20 },
      experience: { type: Number, default: 15 },
      projects: { type: Number, default: 15 },
      education: { type: Number, default: 10 }
    },
    matchedSkills: {
      type: [String],
      default: []
    },
    missingSkills: {
      type: [String],
      default: []
    },
    summaryFeedback: {
      type: String,
      default: ''
    },
    disclaimer: {
      type: String,
      default:
        'This score is an AI-based compatibility estimate intended to help optimize your resume. Actual ATS systems and recruiter evaluations may use different criteria.'
    }
  },
  {
    timestamps: true
  }
);

const JobMatch = mongoose.model('JobMatch', jobMatchSchema);
export default JobMatch;
