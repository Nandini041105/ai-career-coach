import Resume from '../models/Resume.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import { analyzeResume } from '../services/resumeAnalysisService.js';

export const analyzeResumeDoc = async (req, res, next) => {
  try {
    const { resumeId, targetRole } = req.body;

    let resume;
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    } else {
      // Find latest resume
      resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found to analyze. Please upload a resume first.'
      });
    }

    const roleToUse = targetRole || req.user.targetRole || resume.targetRole || 'Software Engineer';

    // Execute AI / heuristic analysis
    const analysisData = await analyzeResume(resume.rawText, resume.extractedData, roleToUse);

    // Save or update analysis
    const analysis = await ResumeAnalysis.create({
      resumeId: resume._id,
      userId: req.user._id,
      targetRole: roleToUse,
      overallScore: analysisData.overallScore,
      categoryScores: analysisData.categoryScores,
      strengths: analysisData.strengths,
      weaknesses: analysisData.weaknesses,
      actionVerbs: analysisData.actionVerbs,
      quantifiableAchievements: analysisData.quantifiableAchievements,
      formattingIssues: analysisData.formattingIssues,
      keywordRelevance: analysisData.keywordRelevance,
      suggestions: analysisData.suggestions,
      bulletImprovements: analysisData.bulletImprovements
    });

    res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully.',
      analysis
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalysisByResumeId = async (req, res, next) => {
  try {
    const analysis = await ResumeAnalysis.findOne({
      resumeId: req.params.resumeId,
      userId: req.user._id
    }).sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found for this resume.'
      });
    }

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestAnalysis = async (req, res, next) => {
  try {
    const analysis = await ResumeAnalysis.findOne({ userId: req.user._id })
      .populate('resumeId', 'originalFileName createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    next(error);
  }
};
