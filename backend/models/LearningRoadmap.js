import mongoose from 'mongoose';

const learningRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    targetRole: {
      type: String,
      required: true
    },
    jobMatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobMatch'
    },
    totalWeeks: {
      type: Number,
      default: 4
    },
    weeklyPlan: [
      {
        week: { type: Number, required: true },
        title: { type: String, required: true },
        skill: { type: String, required: true },
        priority: {
          type: String,
          enum: ['High', 'Medium', 'Low'],
          default: 'Medium'
        },
        difficulty: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced'],
          default: 'Intermediate'
        },
        prerequisites: { type: [String], default: [] },
        topics: { type: [String], default: [] },
        suggestedPractice: { type: [String], default: [] },
        estimatedHours: { type: Number, default: 10 }
      }
    ]
  },
  {
    timestamps: true
  }
);

const LearningRoadmap = mongoose.model('LearningRoadmap', learningRoadmapSchema);
export default LearningRoadmap;
