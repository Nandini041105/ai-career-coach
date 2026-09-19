import Resume from '../models/Resume.js';
import JobDescription from '../models/JobDescription.js';
import JobMatch from '../models/JobMatch.js';
import SkillGap from '../models/SkillGap.js';
import { calculateJobMatch } from '../services/matchingService.js';
import { analyzeSkillGaps } from '../services/skillGapService.js';

export const matchResumeToJob = async (req, res, next) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;

    let resume;
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    } else {
      resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'No resume found. Please upload a resume first.'
      });
    }

    let job;
    if (jobDescriptionId) {
      job = await JobDescription.findOne({ _id: jobDescriptionId, userId: req.user._id });
    } else {
      job = await JobDescription.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    if (!job) {
      return res.status(400).json({
        success: false,
        message: 'No job description found. Please paste and save a job description first.'
      });
    }

    // Run matching calculation
    const matchResult = await calculateJobMatch(resume, job);

    // Save or update JobMatch
    const jobMatch = await JobMatch.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobDescriptionId: job._id,
      overallMatchScore: matchResult.overallMatchScore,
      categoryScores: matchResult.categoryScores,
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      summaryFeedback: matchResult.summaryFeedback
    });

    // Run skill gaps analysis
    const skillGapItems = await analyzeSkillGaps(matchResult.missingSkills, req.user.targetRole || job.targetRole);

    const skillGapDoc = await SkillGap.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobDescriptionId: job._id,
      targetRole: req.user.targetRole || job.targetRole,
      matchedSkills: matchResult.matchedSkills,
      skillGaps: skillGapItems
    });

    res.status(200).json({
      success: true,
      message: 'Match analysis completed successfully.',
      match: jobMatch,
      skillGap: skillGapDoc
    });
  } catch (error) {
    next(error);
  }
};

export const getMatches = async (req, res, next) => {
  try {
    const matches = await JobMatch.find({ userId: req.user._id })
      .populate('jobDescriptionId', 'company title targetRole')
      .populate('resumeId', 'originalFileName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      matches
    });
  } catch (error) {
    next(error);
  }
};

export const getMatchById = async (req, res, next) => {
  try {
    const match = await JobMatch.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('jobDescriptionId')
      .populate('resumeId');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Job match analysis not found.'
      });
    }

    const skillGap = await SkillGap.findOne({
      userId: req.user._id,
      jobDescriptionId: match.jobDescriptionId._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      match,
      skillGap
    });
  } catch (error) {
    next(error);
  }
};
