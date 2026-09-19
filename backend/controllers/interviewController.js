import InterviewSession from '../models/InterviewSession.js';
import Resume from '../models/Resume.js';
import JobDescription from '../models/JobDescription.js';
import {
  generateInterviewQuestions,
  evaluateAnswer,
  summarizeInterviewSession
} from '../services/interviewService.js';

export const startInterview = async (req, res, next) => {
  try {
    const {
      interviewType = 'technical',
      questionSource = 'role',
      totalQuestions = 5,
      resumeId,
      jobDescriptionId
    } = req.body;

    let resume = null;
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    } else if (questionSource === 'resume' || questionSource === 'mixed') {
      resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    let jobDescription = null;
    if (jobDescriptionId) {
      jobDescription = await JobDescription.findOne({ _id: jobDescriptionId, userId: req.user._id });
    } else if (questionSource === 'job' || questionSource === 'mixed') {
      jobDescription = await JobDescription.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    const targetRole = req.user.targetRole || jobDescription?.targetRole || 'Software Engineer';

    // Generate questions
    const questions = await generateInterviewQuestions({
      targetRole,
      interviewType,
      questionSource,
      totalQuestions: Number(totalQuestions) || 5,
      resume,
      jobDescription
    });

    const session = await InterviewSession.create({
      userId: req.user._id,
      resumeId: resume?._id || null,
      jobDescriptionId: jobDescription?._id || null,
      targetRole,
      interviewType,
      questionSource,
      totalQuestions: questions.length,
      currentQuestionIndex: 0,
      questions,
      isCompleted: false
    });

    res.status(201).json({
      success: true,
      message: 'Interview session created.',
      session
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionNumber, userAnswer } = req.body;

    const session = await InterviewSession.findOne({ _id: id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    const question = session.questions.find((q) => q.questionNumber === Number(questionNumber));
    if (!question) {
      return res.status(400).json({
        success: false,
        message: `Question number ${questionNumber} not found in this session.`
      });
    }

    // Evaluate answer with Gemini or heuristic fallback
    const evaluation = await evaluateAnswer(
      question.questionText,
      question.category,
      userAnswer,
      session.targetRole
    );

    question.userAnswer = userAnswer;
    question.answeredAt = new Date();
    question.evaluation = evaluation;

    // Advance question index if not at the end
    if (session.currentQuestionIndex < session.questions.length - 1) {
      session.currentQuestionIndex += 1;
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Answer evaluated.',
      evaluation,
      currentQuestionIndex: session.currentQuestionIndex,
      isLastQuestion: question.questionNumber === session.totalQuestions
    });
  } catch (error) {
    next(error);
  }
};

export const completeInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await InterviewSession.findOne({ _id: id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    const summary = summarizeInterviewSession(session.questions);

    session.overallInterviewScore = summary.overallInterviewScore;
    session.categoryPerformance = summary.categoryPerformance;
    session.strongAreas = summary.strongAreas;
    session.weakAreas = summary.weakAreas;
    session.recommendedTopics = summary.recommendedTopics;
    session.summaryFeedback = summary.summaryFeedback;
    session.isCompleted = true;

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Interview completed and scored successfully.',
      session
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewHistory = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user._id })
      .select('-questions.evaluation.betterAnswerExample')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewById = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('resumeId', 'originalFileName')
      .populate('jobDescriptionId', 'company title');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    next(error);
  }
};
