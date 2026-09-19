import mongoose from 'mongoose';

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    company: {
      type: String,
      default: 'Target Company'
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    targetRole: {
      type: String,
      default: 'Software Engineer'
    },
    rawText: {
      type: String,
      required: [true, 'Job description text is required']
    },
    extractedData: {
      requiredSkills: { type: [String], default: [] },
      preferredSkills: { type: [String], default: [] },
      education: { type: [String], default: [] },
      experience: { type: [String], default: [] },
      tools: { type: [String], default: [] },
      softSkills: { type: [String], default: [] },
      responsibilities: { type: [String], default: [] },
      keywords: { type: [String], default: [] }
    }
  },
  {
    timestamps: true
  }
);

const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);
export default JobDescription;
