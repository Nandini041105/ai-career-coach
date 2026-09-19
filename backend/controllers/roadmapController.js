import LearningRoadmap from '../models/LearningRoadmap.js';
import JobMatch from '../models/JobMatch.js';
import Resume from '../models/Resume.js';
import { generateLearningRoadmap } from '../services/roadmapService.js';

export const createRoadmap = async (req, res, next) => {
  try {
    const { jobMatchId } = req.body;
    const targetRole = req.user.targetRole || 'Software Engineer';

    let missingSkills = [];
    if (jobMatchId) {
      const match = await JobMatch.findOne({ _id: jobMatchId, userId: req.user._id });
      if (match) {
        missingSkills = match.missingSkills || [];
      }
    } else {
      // Find latest match if available
      const latestMatch = await JobMatch.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (latestMatch) {
        missingSkills = latestMatch.missingSkills || [];
      }
    }

    const latestResume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const resumeSkills = latestResume?.extractedData?.skills || [];

    const plan = await generateLearningRoadmap(targetRole, missingSkills, resumeSkills);

    const roadmap = await LearningRoadmap.create({
      userId: req.user._id,
      targetRole,
      jobMatchId: jobMatchId || null,
      totalWeeks: plan.totalWeeks || 4,
      weeklyPlan: plan.weeklyPlan
    });

    res.status(201).json({
      success: true,
      message: 'Personalized learning roadmap generated successfully.',
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestRoadmap = async (req, res, next) => {
  try {
    const roadmap = await LearningRoadmap.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      roadmap
    });
  } catch (error) {
    next(error);
  }
};
