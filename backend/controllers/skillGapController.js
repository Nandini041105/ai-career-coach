import SkillGap from '../models/SkillGap.js';

export const getLatestSkillGaps = async (req, res, next) => {
  try {
    const skillGap = await SkillGap.findOne({ userId: req.user._id })
      .populate('jobDescriptionId', 'company title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      skillGap
    });
  } catch (error) {
    next(error);
  }
};

export const getSkillGapById = async (req, res, next) => {
  try {
    const skillGap = await SkillGap.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('jobDescriptionId', 'company title');

    if (!skillGap) {
      return res.status(404).json({
        success: false,
        message: 'Skill gap record not found.'
      });
    }

    res.status(200).json({
      success: true,
      skillGap
    });
  } catch (error) {
    next(error);
  }
};
