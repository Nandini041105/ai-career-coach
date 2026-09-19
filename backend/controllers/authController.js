import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { TARGET_ROLES } from '../models/User.js';

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'ai_career_coach_dev_jwt_secret_key_super_secure_987654321';
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const validatedRole = TARGET_ROLES.includes(targetRole) ? targetRole : 'Software Engineer';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      targetRole: validatedRole
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    if (!TARGET_ROLES.includes(targetRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${TARGET_ROLES.join(', ')}`
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { targetRole },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Target role updated successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
};
