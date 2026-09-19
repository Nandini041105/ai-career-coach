import mongoose from 'mongoose';

const skillGapSchema = new mongoose.Schema(
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
    targetRole: {
      type: String,
      default: 'Software Engineer'
    },
    matchedSkills: {
      type: [String],
      default: []
    },
    skillGaps: [
      {
        skill: { type: String, required: true },
        priority: {
          type: String,
          enum: ['High', 'Medium', 'Low'],
          default: 'Medium'
        },
        recommendedLevel: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced'],
          default: 'Intermediate'
        },
        whyItMatters: { type: String, default: '' },
        learningTopics: { type: [String], default: [] }
      }
    ]
  },
  {
    timestamps: true
  }
);

const SkillGap = mongoose.model('SkillGap', skillGapSchema);
export default SkillGap;
