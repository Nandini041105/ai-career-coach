import { callGeminiWithFallback } from './geminiService.js';

const ROLE_KEYWORDS_MAP = {
  'RTL Design Engineer': ['verilog', 'systemverilog', 'rtl', 'fsm', 'fpga', 'timing', 'cdc', 'clock domain crossing', 'synthesis', 'simulation', 'vivado', 'modelsim', 'asic'],
  'FPGA Design Engineer': ['fpga', 'xilinx', 'altera', 'vivado', 'quartus', 'verilog', 'vhdl', 'timing closure', 'dsp', 'pcie', 'ethernet', 'ddr'],
  'VLSI Engineer': ['vlsi', 'cmos', 'spice', 'cadence', 'synopsys', 'layout', 'drc', 'lvs', 'setup hold', 'sta', 'verilog'],
  'Physical Design Engineer': ['physical design', 'floorplanning', 'placement', 'cts', 'clock tree synthesis', 'routing', 'sta', 'drc', 'lvs', 'innovus', 'icc2'],
  'Embedded Systems Engineer': ['c', 'c++', 'embedded c', 'rtos', 'arm', 'microcontroller', 'gpio', 'uart', 'spi', 'i2c', 'interrupts', 'timers', 'stm32', 'firmware'],
  'Software Engineer': ['javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'c++', 'data structures', 'algorithms', 'git', 'rest api', 'sql', 'docker'],
  'Data/AI Engineer': ['python', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'pandas', 'numpy', 'sql', 'data pipeline', 'spark', 'docker'],
  'Other': ['problem solving', 'teamwork', 'communication', 'git', 'agile', 'project management']
};

const ACTION_VERBS = [
  'developed', 'designed', 'architected', 'implemented', 'optimized', 'engineered',
  'accelerated', 'debugged', 'synthesized', 'simulated', 'built', 'reduced', 'increased',
  'automated', 'spearheaded', 'analyzed', 'configured', 'integrated', 'streamlined'
];

/**
 * Analyzes resume content using Gemini or rule-based heuristics
 */
export const analyzeResume = async (rawText, extractedData, targetRole = 'Software Engineer') => {
  const prompt = `
You are an expert technical recruiter and resume auditor specializing in ${targetRole}.
Analyze the following resume text specifically for the target role: "${targetRole}".

RESUME TEXT:
${rawText.slice(0, 4000)}

Please return a valid JSON object strictly matching this schema without markdown or commentary:
{
  "overallScore": number (0-100),
  "categoryScores": {
    "skills": number (0-100),
    "projects": number (0-100),
    "experience": number (0-100),
    "education": number (0-100),
    "keywords": number (0-100),
    "achievements": number (0-100),
    "structure": number (0-100),
    "relevance": number (0-100)
  },
  "strengths": [ "string", "string", ... ],
  "weaknesses": [ "string", "string", ... ],
  "actionVerbs": {
    "strong": [ "string", ... ],
    "missingOrWeak": [ "string", ... ],
    "feedback": "string"
  },
  "quantifiableAchievements": {
    "count": number,
    "examples": [ "string", ... ],
    "feedback": "string"
  },
  "formattingIssues": [ "string", ... ],
  "keywordRelevance": {
    "present": [ "string", ... ],
    "recommended": [ "string", ... ]
  },
  "suggestions": [ "string", ... ],
  "bulletImprovements": [
    {
      "original": "string",
      "suggested": "string",
      "reason": "string"
    }
  ]
}

Important Rules:
1. Do not invent facts or metrics not in the resume.
2. In bulletImprovements, pick 2-4 actual weak bullet points from the resume and rewrite them with strong action verbs and impact metrics.
3. Be fair, rigorous, and constructive.
`;

  return await callGeminiWithFallback(prompt, () => fallbackResumeAnalysis(rawText, extractedData, targetRole));
};

/**
 * Heuristic analyzer based on actual NLP metrics, verb density, quantifiable impacts, and role keywords
 */
export const fallbackResumeAnalysis = (rawText, extractedData, targetRole) => {
  const lower = rawText.toLowerCase();
  const targetKeywords = ROLE_KEYWORDS_MAP[targetRole] || ROLE_KEYWORDS_MAP['Other'];

  // 1. Keywords analysis
  const presentKeywords = targetKeywords.filter((kw) => lower.includes(kw));
  const recommendedKeywords = targetKeywords.filter((kw) => !lower.includes(kw));
  const keywordScore = Math.min(100, Math.round((presentKeywords.length / Math.max(targetKeywords.length, 1)) * 100));

  // 2. Action verbs analysis
  const foundActionVerbs = ACTION_VERBS.filter((verb) => lower.includes(verb));
  const missingVerbs = ACTION_VERBS.filter((verb) => !lower.includes(verb)).slice(0, 5);
  const actionVerbScore = Math.min(100, Math.round((foundActionVerbs.length / 8) * 100));

  // 3. Quantifiable achievements detection (% or numbers with units)
  const metricRegex = /\b(?:\d+%\b|\d+\s*(?:ms|us|ns|mb|gb|mhz|ghz|users|requests|x|k|m)\b|\$\d+)/gi;
  const metricsFound = rawText.match(metricRegex) || [];
  const achievementsScore = Math.min(100, 40 + metricsFound.length * 15);

  // 4. Section completeness
  const hasEducation = (extractedData.education && extractedData.education.length > 0) || lower.includes('bachelor') || lower.includes('b.tech') || lower.includes('university') || lower.includes('degree');
  const hasExperience = (extractedData.experience && extractedData.experience.length > 0) || lower.includes('experience') || lower.includes('intern');
  const hasProjects = (extractedData.projects && extractedData.projects.length > 0) || lower.includes('project');
  const hasSkills = (extractedData.skills && extractedData.skills.length > 0) || lower.includes('skills');

  const educationScore = hasEducation ? 85 : 45;
  const experienceScore = hasExperience ? 80 : 50;
  const projectsScore = hasProjects ? 85 : 55;
  const skillsScore = Math.min(100, 50 + (extractedData.skills?.length || 0) * 4);
  const structureScore = hasEducation && hasSkills && (hasProjects || hasExperience) ? 88 : 60;
  const relevanceScore = Math.min(100, Math.round((keywordScore * 0.7) + (skillsScore * 0.3)));

  // Weighted overall score
  const overallScore = Math.round(
    skillsScore * 0.2 +
    projectsScore * 0.15 +
    experienceScore * 0.15 +
    educationScore * 0.1 +
    keywordScore * 0.15 +
    achievementsScore * 0.1 +
    structureScore * 0.05 +
    relevanceScore * 0.1
  );

  // Strengths & Weaknesses
  const strengths = [];
  if (presentKeywords.length >= 4) strengths.push(`Strong alignment with target role keywords: ${presentKeywords.slice(0, 4).join(', ')}.`);
  if (foundActionVerbs.length >= 4) strengths.push(`Uses active technical vocabulary (${foundActionVerbs.slice(0, 3).join(', ')}).`);
  if (hasProjects) strengths.push('Has dedicated technical projects showcasing hands-on application.');
  if (metricsFound.length > 0) strengths.push('Contains quantifiable impact measurements and technical metrics.');
  if (strengths.length === 0) strengths.push('Clear educational foundation and technical aspiration.');

  const weaknesses = [];
  if (recommendedKeywords.length > 3) weaknesses.push(`Missing important ${targetRole} domain keywords: ${recommendedKeywords.slice(0, 4).join(', ')}.`);
  if (metricsFound.length < 2) weaknesses.push('Lacks sufficient quantifiable results (e.g. latency reduced by X%, throughput increased, power saved).');
  if (foundActionVerbs.length < 3) weaknesses.push('Overuse of passive phrases like "responsible for" or "worked on".');
  if (!hasExperience) weaknesses.push('Limited documented industry or internship experience; strengthen project descriptions to compensate.');

  // Find candidate bullet points to improve
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 25 && l.length < 120);
  const candidateBullets = lines.filter((l) =>
    l.toLowerCase().startsWith('worked on') ||
    l.toLowerCase().startsWith('responsible for') ||
    l.toLowerCase().startsWith('helped') ||
    l.toLowerCase().includes('using')
  ).slice(0, 3);

  const bulletImprovements = candidateBullets.map((bullet) => ({
    original: bullet,
    suggested: `Architected and implemented an optimized ${targetRole.toLowerCase()} solution to enhance system throughput and reliability.`,
    reason: 'Replaces passive wording with high-impact action verbs and emphasizes end outcome.'
  }));

  if (bulletImprovements.length === 0 && lines.length > 0) {
    bulletImprovements.push({
      original: lines[0],
      suggested: `Spearheaded development of ${lines[0].slice(0, 40)}, achieving improved execution latency and test coverage.`,
      reason: 'Adds measurable accomplishment and demonstrates ownership.'
    });
  }

  return {
    overallScore,
    categoryScores: {
      skills: skillsScore,
      projects: projectsScore,
      experience: experienceScore,
      education: educationScore,
      keywords: keywordScore,
      achievements: achievementsScore,
      structure: structureScore,
      relevance: relevanceScore
    },
    strengths,
    weaknesses,
    actionVerbs: {
      strong: foundActionVerbs,
      missingOrWeak: missingVerbs,
      feedback: foundActionVerbs.length >= 4 ? 'Good active verb usage.' : 'Consider replacing passive voice with dynamic verbs.'
    },
    quantifiableAchievements: {
      count: metricsFound.length,
      examples: metricsFound.slice(0, 5),
      feedback: metricsFound.length >= 3 ? 'Strong use of quantitative metrics.' : 'Include more specific percentages, benchmarks, or numbers.'
    },
    formattingIssues: [
      'Ensure standard 1-inch margins and uniform font hierarchy.',
      'Check that bullet points are cleanly aligned.'
    ],
    keywordRelevance: {
      present: presentKeywords,
      recommended: recommendedKeywords.slice(0, 6)
    },
    suggestions: [
      `Incorporate recommended keywords for ${targetRole} such as ${recommendedKeywords.slice(0, 3).join(', ')}.`,
      'Add quantitative results for each major project or work entry.',
      'Ensure each bullet begins with an active engineering verb.'
    ],
    bulletImprovements
  };
};
