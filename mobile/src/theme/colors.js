// Design Tokens: Color Palette
// Tailored for an elite, high-tech AI career platform

export const colors = {
  // Backgrounds
  background: '#0B0F19', // Deep obsidian dark
  surface: '#111827',    // Card background
  surfaceElevated: '#1F2937', // Elevated card / modal
  surfaceHighlight: '#374151',
  border: '#1F2937',
  borderLight: '#374151',
  borderFocused: '#6366F1',

  // Primary brand colors
  primary: '#6366F1',       // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryGlow: 'rgba(99, 102, 241, 0.15)',

  // Secondary brand colors
  secondary: '#EC4899',     // Pink
  accent: '#8B5CF6',        // Purple

  // Status colors
  success: '#10B981',       // Emerald
  successGlow: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',       // Amber
  warningGlow: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',        // Rose / Red
  dangerGlow: 'rgba(239, 68, 68, 0.15)',
  info: '#3B82F6',          // Sky Blue
  infoGlow: 'rgba(59, 130, 246, 0.15)',

  // Typography
  text: '#F9FAFB',          // Main light text
  textSecondary: '#9CA3AF', // Muted text
  textTertiary: '#6B7280',  // Darker muted
  textInverse: '#111827',

  // Engineering Tracks
  tracks: {
    rtl: '#6366F1',
    fpga: '#8B5CF6',
    vlsi: '#06B6D4',
    physical: '#3B82F6',
    embedded: '#10B981',
    software: '#EC4899',
    ai: '#F59E0B',
    other: '#9CA3AF'
  },

  // Category scores
  scoreExcellent: '#10B981', // 85-100
  scoreGood: '#3B82F6',      // 70-84
  scoreFair: '#F59E0B',      // 50-69
  scorePoor: '#EF4444'       // <50
};

export const getScoreColor = (score) => {
  if (score >= 85) return colors.scoreExcellent;
  if (score >= 70) return colors.scoreGood;
  if (score >= 50) return colors.scoreFair;
  return colors.scorePoor;
};
