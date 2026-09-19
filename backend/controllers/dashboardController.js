import Resume from '../models/Resume.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import JobMatch from '../models/JobMatch.js';
import SkillGap from '../models/SkillGap.js';
import InterviewSession from '../models/InterviewSession.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Latest resume & analysis
    const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    const latestAnalysis = await ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 });

    // 2. Highest and latest job match
    const highestMatch = await JobMatch.findOne({ userId }).sort({ overallMatchScore: -1 });
    const recentMatches = await JobMatch.find({ userId })
      .populate('jobDescriptionId', 'company title targetRole')
      .sort({ createdAt: -1 })
      .limit(5);

    // 3. Latest completed interview
    const completedInterviews = await InterviewSession.find({ userId, isCompleted: true })
      .sort({ createdAt: -1 })
      .limit(5);

    const latestInterview = completedInterviews[0] || null;

    // 4. Latest skill gaps
    const latestSkillGap = await SkillGap.findOne({ userId }).sort({ createdAt: -1 });
    const skillGapCount = latestSkillGap?.skillGaps?.length || 0;

    // 5. Historical trends for Recharts
    const interviewHistory = await InterviewSession.find({ userId, isCompleted: true })
      .sort({ createdAt: 1 })
      .limit(7);

    const interviewTrends = interviewHistory.map((session, idx) => ({
      name: `Attempt ${idx + 1}`,
      date: new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: session.overallInterviewScore
    }));

    const allAnalyses = await ResumeAnalysis.find({ userId })
      .sort({ createdAt: 1 })
      .limit(7);

    const resumeTrends = allAnalyses.map((a, idx) => ({
      name: `Scan ${idx + 1}`,
      date: new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: a.overallScore
    }));

    res.status(200).json({
      success: true,
      stats: {
        resumeScore: latestAnalysis?.overallScore || 0,
        bestJobMatch: highestMatch?.overallMatchScore || 0,
        interviewScore: latestInterview?.overallInterviewScore || 0,
        skillGapsCount: skillGapCount,
        targetRole: req.user.targetRole || 'Software Engineer',
        hasResume: !!latestResume,
        latestResumeFileName: latestResume?.originalFileName || null
      },
      recentMatches,
      recentInterviews: completedInterviews,
      trends: {
        interviews: interviewTrends,
        resumes: resumeTrends
      }
    });
  } catch (error) {
    next(error);
  }
};
