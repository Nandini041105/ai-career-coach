import Resume from '../models/Resume.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import JobMatch from '../models/JobMatch.js';
import { parseResumePdf } from '../services/resumeParserService.js';

export const uploadResumeDoc = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file was uploaded. Please select a valid PDF resume.'
      });
    }

    const { originalname, size, buffer } = req.file;

    // Parse PDF buffer
    const { rawText, extractedData } = await parseResumePdf(buffer);

    // Save resume document to database
    const resume = await Resume.create({
      userId: req.user._id,
      originalFileName: originalname,
      fileSize: size,
      rawText,
      extractedData,
      targetRole: req.user.targetRole || 'Software Engineer'
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully.',
      resume
    });
  } catch (error) {
    next(error);
  }
};

export const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      resumes
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or access denied.'
      });
    }
    res.status(200).json({
      success: true,
      resume
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or access denied.'
      });
    }

    // Clean up associated analyses & matches
    await ResumeAnalysis.deleteMany({ resumeId: resume._id });
    await JobMatch.deleteMany({ resumeId: resume._id });

    res.status(200).json({
      success: true,
      message: 'Resume and associated analyses deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
