import { callGeminiWithFallback } from './geminiService.js';

/**
 * Parses job description text to extract structured requirements
 */
export const extractJobDescriptionDetails = async (jobText, company = 'Target Company', title = 'Target Role') => {
  const prompt = `
Extract key technical and operational requirements from the following job description.
Company: ${company}
Job Title: ${title}

JOB DESCRIPTION TEXT:
${jobText.slice(0, 4000)}

Return strict JSON matching this structure without markdown:
{
  "title": "string",
  "company": "string",
  "requiredSkills": ["string", ...],
  "preferredSkills": ["string", ...],
  "education": ["string", ...],
  "experience": ["string", ...],
  "tools": ["string", ...],
  "softSkills": ["string", ...],
  "responsibilities": ["string", ...],
  "keywords": ["string", ...]
}
`;

  return await callGeminiWithFallback(prompt, () => fallbackJobExtraction(jobText, company, title));
};

export const fallbackJobExtraction = (jobText, company, title) => {
  const commonTech = [
    'Verilog', 'SystemVerilog', 'VHDL', 'FPGA', 'RTL', 'VLSI', 'ASIC', 'UVM', 'STA',
    'Synthesis', 'Vivado', 'Quartus', 'ModelSim', 'C', 'C++', 'Python', 'Java', 'JavaScript',
    'TypeScript', 'Embedded C', 'RTOS', 'Linux', 'ARM', 'Microcontrollers', 'STM32',
    'UART', 'SPI', 'I2C', 'PCB', 'React', 'Node.js', 'Express', 'MongoDB', 'SQL',
    'PostgreSQL', 'Docker', 'Kubernetes', 'Git', 'AWS', 'GCP', 'Machine Learning', 'PyTorch'
  ];

  const lower = jobText.toLowerCase();
  const matched = commonTech.filter((t) => lower.includes(t.toLowerCase()));

  const requiredSkills = matched.slice(0, Math.min(matched.length, 6));
  const preferredSkills = matched.slice(6, 12);
  const keywords = [...new Set([...matched, title, company])];

  return {
    title: title || 'Engineering Position',
    company: company || 'Target Company',
    requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['Problem Solving', 'Engineering Fundamentals', 'Git'],
    preferredSkills: preferredSkills.length > 0 ? preferredSkills : ['Agile Methodologies', 'System Design'],
    education: ['Bachelor\'s degree in Electrical/Computer Engineering or related technical field'],
    experience: ['1-3 years of relevant experience or project coursework'],
    tools: matched.slice(0, 4),
    softSkills: ['Communication', 'Collaboration', 'Problem Solving'],
    responsibilities: [
      'Design, implement, and verify high-reliability engineering modules.',
      'Collaborate with cross-functional technical teams.',
      'Perform testing, debugging, and continuous improvement.'
    ],
    keywords
  };
};

/**
 * Calculates match score between resume and job description
 */
export const calculateJobMatch = async (resume, jobDescription) => {
  const prompt = `
Compare this candidate's resume with the job description.
TARGET ROLE: ${jobDescription.title}
COMPANY: ${jobDescription.company}

RESUME SUMMARY:
Skills: ${(resume.extractedData?.skills || []).join(', ')}
Experience: ${(resume.extractedData?.experience || []).join('\n')}
Projects: ${(resume.extractedData?.projects || []).join('\n')}
Education: ${(resume.extractedData?.education || []).join('\n')}

JOB REQUIREMENTS:
Required Skills: ${(jobDescription.extractedData?.requiredSkills || []).join(', ')}
Preferred Skills: ${(jobDescription.extractedData?.preferredSkills || []).join(', ')}
Education: ${(jobDescription.extractedData?.education || []).join('\n')}
Responsibilities: ${(jobDescription.extractedData?.responsibilities || []).join('\n')}

Return strict JSON matching this structure without markdown:
{
  "overallMatchScore": number (0-100),
  "categoryScores": {
    "technicalSkills": number (0-100),
    "keywords": number (0-100),
    "experience": number (0-100),
    "projects": number (0-100),
    "education": number (0-100)
  },
  "matchedSkills": ["string", ...],
  "missingSkills": ["string", ...],
  "summaryFeedback": "string"
}
`;

  return await callGeminiWithFallback(prompt, () => fallbackJobMatch(resume, jobDescription));
};

export const fallbackJobMatch = (resume, jobDescription) => {
  const resumeText = resume.rawText ? resume.rawText.toLowerCase() : '';
  const resumeSkills = (resume.extractedData?.skills || []).map((s) => s.toLowerCase());

  const jobRequired = (jobDescription.extractedData?.requiredSkills || []).map((s) => s.trim());
  const jobPreferred = (jobDescription.extractedData?.preferredSkills || []).map((s) => s.trim());
  const allJobSkills = [...new Set([...jobRequired, ...jobPreferred])];

  const matchedSkills = [];
  const missingSkills = [];

  allJobSkills.forEach((skill) => {
    const sLower = skill.toLowerCase();
    const hasSkill = resumeSkills.some((rs) => rs.includes(sLower) || sLower.includes(rs)) || resumeText.includes(sLower);
    if (hasSkill) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const totalSkills = Math.max(allJobSkills.length, 1);
  const technicalScore = Math.min(100, Math.round((matchedSkills.length / totalSkills) * 100));

  const jobKeywords = (jobDescription.extractedData?.keywords || []).map((k) => k.toLowerCase());
  const matchedKeywords = jobKeywords.filter((k) => resumeText.includes(k));
  const keywordScore = Math.min(100, Math.round((matchedKeywords.length / Math.max(jobKeywords.length, 1)) * 100));

  const experienceScore = resume.extractedData?.experience?.length > 0 ? 80 : 55;
  const projectsScore = resume.extractedData?.projects?.length > 0 ? 85 : 60;
  const educationScore = 85;

  // Transparent weights:
  // Technical Skills: 40%, Keywords: 20%, Experience: 15%, Projects: 15%, Education: 10%
  const overallMatchScore = Math.round(
    technicalScore * 0.4 +
    keywordScore * 0.2 +
    experienceScore * 0.15 +
    projectsScore * 0.15 +
    educationScore * 0.1
  );

  return {
    overallMatchScore,
    categoryScores: {
      technicalSkills: technicalScore,
      keywords: keywordScore,
      experience: experienceScore,
      projects: projectsScore,
      education: educationScore
    },
    matchedSkills,
    missingSkills,
    summaryFeedback: `Candidate matches ${matchedSkills.length} of ${allJobSkills.length} key required/preferred skills for this position. Bridging the gap in ${missingSkills.slice(0, 3).join(', ')} will significantly boost competitiveness.`
  };
};
