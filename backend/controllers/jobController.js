import JobDescription from '../models/JobDescription.js';
import JobMatch from '../models/JobMatch.js';
import { extractJobDescriptionDetails } from '../services/matchingService.js';

export const createJobDescription = async (req, res, next) => {
  try {
    const { company, title, rawText, targetRole } = req.body;

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete job description (at least 20 characters).'
      });
    }

    const jobTitle = title?.trim() || 'Target Position';
    const companyName = company?.trim() || 'Hiring Company';
    const role = targetRole || req.user.targetRole || 'Software Engineer';

    // Extract structured requirements
    const extractedData = await extractJobDescriptionDetails(rawText, companyName, jobTitle);

    const job = await JobDescription.create({
      userId: req.user._id,
      company: companyName,
      title: jobTitle,
      targetRole: role,
      rawText,
      extractedData
    });

    res.status(201).json({
      success: true,
      message: 'Job description saved and parsed successfully.',
      job
    });
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const jobs = await JobDescription.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await JobDescription.findOne({ _id: req.params.id, userId: req.user._id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found.'
      });
    }
    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await JobDescription.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found.'
      });
    }

    await JobMatch.deleteMany({ jobDescriptionId: job._id });

    res.status(200).json({
      success: true,
      message: 'Job description deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
