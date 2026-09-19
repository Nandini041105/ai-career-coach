import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    originalFileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    rawText: {
      type: String,
      required: true
    },
    extractedData: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      education: { type: [String], default: [] },
      experience: { type: [String], default: [] },
      skills: { type: [String], default: [] },
      projects: { type: [String], default: [] },
      certifications: { type: [String], default: [] },
      achievements: { type: [String], default: [] },
      languages: { type: [String], default: [] },
      summary: { type: String, default: '' }
    },
    targetRole: {
      type: String,
      default: 'Software Engineer'
    }
  },
  {
    timestamps: true
  }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
