import { callGeminiWithFallback } from './geminiService.js';

const ROLE_TECHNICAL_QUESTION_POOL = {
  'RTL Design Engineer': [
    { questionText: 'Explain the difference between blocking (=) and non-blocking (<=) assignments in Verilog. What hardware behavior does each model?', category: 'Verilog / RTL Design', difficulty: 'Medium' },
    { questionText: 'What are setup time and hold time? What causes setup or hold violations, and how would you fix each during physical synthesis?', category: 'Static Timing Analysis (STA)', difficulty: 'Medium' },
    { questionText: 'Describe how you would design a Clock Domain Crossing (CDC) synchronizer for single-bit signals versus multi-bit data buses.', category: 'CDC & Timing', difficulty: 'Hard' },
    { questionText: 'Compare a Mealy state machine with a Moore state machine. Under what circumstances would you choose one over the other in an RTL pipeline?', category: 'Finite State Machines (FSM)', difficulty: 'Medium' },
    { questionText: 'How does an asynchronous FIFO prevent data corruption between differing clock frequencies? Explain the role of Gray code pointers.', category: 'FIFO / Hardware Architecture', difficulty: 'Hard' }
  ],
  'FPGA Design Engineer': [
    { questionText: 'What is the internal architecture of an FPGA? Explain the roles of LUTs, Flip-Flops, BRAM, and DSP slices.', category: 'FPGA Architecture', difficulty: 'Medium' },
    { questionText: 'Walk through your typical Vivado or Quartus design flow from RTL synthesis to bitstream generation and timing closure.', category: 'Tool Flow & Constraints', difficulty: 'Medium' },
    { questionText: 'How do you handle timing closure when your design fails setup time on a high-fanout net in an FPGA?', category: 'Timing Closure', difficulty: 'Hard' },
    { questionText: 'Explain how you interface high-speed protocols like PCIe, Ethernet, or DDR memory on an FPGA board.', category: 'High-Speed Interfaces', difficulty: 'Hard' },
    { questionText: 'What are the benefits of using DSP blocks over standard slice logic for arithmetic operations such as digital filters (FIR/IIR)?', category: 'DSP Implementation', difficulty: 'Medium' }
  ],
  'Embedded Systems Engineer': [
    { questionText: 'Explain what the "volatile" keyword does in C and give three realistic embedded firmware scenarios where it is mandatory.', category: 'C / Memory Model', difficulty: 'Medium' },
    { questionText: 'Compare UART, SPI, and I2C protocols in terms of speed, bus topology, wire count, and synchronization.', category: 'Serial Protocols', difficulty: 'Medium' },
    { questionText: 'What happens during an Interrupt Service Routine (ISR)? Why must an ISR be kept short and non-blocking?', category: 'Interrupts & CPU Control', difficulty: 'Medium' },
    { questionText: 'Explain priority inversion in real-time operating systems (RTOS) and how priority inheritance or priority ceiling resolves it.', category: 'RTOS Concepts', difficulty: 'Hard' },
    { questionText: 'How do you prevent race conditions when sharing a memory buffer between an interrupt handler and a main loop thread?', category: 'Concurrency & Safety', difficulty: 'Hard' }
  ],
  'Software Engineer': [
    { questionText: 'Explain how a hash map functions internally, including bucket hashing, load factors, collision resolution, and amortized time complexity.', category: 'Data Structures', difficulty: 'Medium' },
    { questionText: 'How would you design a distributed rate limiter that handles 100,000 requests per second across multiple API gateway nodes?', category: 'System Design', difficulty: 'Hard' },
    { questionText: 'Explain the difference between optimistic and pessimistic locking in relational and distributed databases.', category: 'Databases & Concurrency', difficulty: 'Medium' },
    { questionText: 'Walk through what happens from the moment a user enters a URL into a browser until the rendered page appears.', category: 'Web Architecture', difficulty: 'Medium' },
    { questionText: 'How do microservices maintain eventual consistency when processing a multi-step financial transaction? Mention the Saga pattern.', category: 'Distributed Systems', difficulty: 'Hard' }
  ]
};

const HR_QUESTION_POOL = [
  { questionText: 'Tell me about yourself, your technical background, and what drives your passion for this engineering role.', category: 'Introduction', difficulty: 'Easy' },
  { questionText: 'Describe a situation where you had a disagreement with a teammate or project lead on a technical approach. How did you handle it?', category: 'Conflict Resolution', difficulty: 'Medium' },
  { questionText: 'Why are you specifically interested in this role and what unique value do you bring to our engineering team?', category: 'Motivation & Fit', difficulty: 'Medium' },
  { questionText: 'Tell me about a technical project where things did not go as planned. What was the failure, and how did you recover?', category: 'Resilience & Learning', difficulty: 'Medium' },
  { questionText: 'Where do you see yourself technically and professionally in the next 3 to 5 years?', category: 'Career Vision', difficulty: 'Easy' }
];

const PROJECT_QUESTION_POOL = [
  { questionText: 'Walk me through the end-to-end architecture of the most challenging project listed on your resume.', category: 'Architecture & System Design', difficulty: 'Medium' },
  { questionText: 'What was your individual contribution versus your team members in this project? What specific modules did you write or debug?', category: 'Individual Contribution', difficulty: 'Medium' },
  { questionText: 'What was the toughest technical obstacle or bug you encountered during this project, and what systematic steps did you take to resolve it?', category: 'Debugging & Problem Solving', difficulty: 'Hard' },
  { questionText: 'How did you verify and test your implementation? What metrics did you track to ensure performance and correctness?', category: 'Verification & Testing', difficulty: 'Medium' },
  { questionText: 'If you had another month and more resources to iterate on this project, what architectural decisions would you change?', category: 'Design Reflection', difficulty: 'Medium' }
];

/**
 * Generates tailored interview questions based on role, type, and source
 */
export const generateInterviewQuestions = async ({
  targetRole = 'Software Engineer',
  interviewType = 'technical',
  questionSource = 'role',
  totalQuestions = 5,
  resume = null,
  jobDescription = null
}) => {
  const prompt = `
You are an expert technical interviewer conducting an interview for the role: "${targetRole}".
Interview Type: ${interviewType} (options: technical, hr, project, mixed)
Question Source: ${questionSource} (options: role, resume, job, mixed)
Total Questions needed: ${totalQuestions}

${resume ? `CANDIDATE RESUME SUMMARY:\nSkills: ${(resume.extractedData?.skills || []).join(', ')}\nProjects: ${(resume.extractedData?.projects || []).join('\n')}\n` : ''}
${jobDescription ? `JOB DESCRIPTION REQUIREMENTS:\nTitle: ${jobDescription.title}\nRequired: ${(jobDescription.extractedData?.requiredSkills || []).join(', ')}\n` : ''}

Generate exactly ${totalQuestions} high-quality interview questions.
Return a valid JSON array of objects strictly matching this structure without markdown:
[
  {
    "questionNumber": 1,
    "questionText": "string",
    "category": "string",
    "difficulty": "Easy" | "Medium" | "Hard"
  },
  ...
]
`;

  return await callGeminiWithFallback(prompt, () =>
    fallbackInterviewQuestions(targetRole, interviewType, questionSource, totalQuestions, resume, jobDescription)
  );
};

export const fallbackInterviewQuestions = (targetRole, interviewType, questionSource, totalQuestions, resume, jobDescription) => {
  const rolePool = ROLE_TECHNICAL_QUESTION_POOL[targetRole] || ROLE_TECHNICAL_QUESTION_POOL['Software Engineer'];
  let pool = [];

  if (interviewType === 'hr') {
    pool = [...HR_QUESTION_POOL];
  } else if (interviewType === 'project') {
    pool = [...PROJECT_QUESTION_POOL];
  } else if (interviewType === 'mixed') {
    pool = [
      HR_QUESTION_POOL[0],
      rolePool[0],
      PROJECT_QUESTION_POOL[0],
      rolePool[1],
      HR_QUESTION_POOL[1],
      rolePool[2],
      PROJECT_QUESTION_POOL[2]
    ];
  } else {
    // technical
    pool = [...rolePool];
  }

  // Resume based customizations if available
  if ((questionSource === 'resume' || questionSource === 'mixed') && resume?.extractedData?.projects?.length > 0) {
    const projName = resume.extractedData.projects[0].slice(0, 45);
    pool.unshift({
      questionText: `On your resume, you highlighted: "${projName}". Can you explain the core design decisions, your specific contribution, and the testing methodologies you used?`,
      category: 'Resume Project Deep Dive',
      difficulty: 'Medium'
    });
  }

  // Resume based customizations if available
  if ((questionSource === 'resume' || questionSource === 'mixed') && resume?.extractedData?.projects?.length > 0) {
    const projName = resume.extractedData.projects[0].slice(0, 45);
    pool.unshift({
      questionText: `On your resume, you highlighted: "${projName}". Can you explain the core design decisions, your specific contribution, and the testing methodologies you used?`,
      category: 'Resume Project Deep Dive',
      difficulty: 'Medium'
    });
  }

  // Job description based customizations if available
  if (questionSource === 'job' && jobDescription?.extractedData?.requiredSkills?.length > 0) {
    const skills = jobDescription.extractedData.requiredSkills;
    const company = jobDescription.company && jobDescription.company !== 'Target Employer' ? jobDescription.company : 'the hiring company';
    const title = jobDescription.title || 'role';
    const jobSpecificQuestions = skills.map((skill, idx) => ({
      questionText: `For the ${title} opportunity at ${company}, deep expertise in "${skill}" is essential. How have you implemented or applied ${skill} in past projects, and what technical challenges or trade-offs did you encounter?`,
      category: `${skill} / Job Requirement`,
      difficulty: idx >= 2 ? 'Hard' : 'Medium'
    }));
    // Place job-specific questions at the front
    pool = [...jobSpecificQuestions, ...rolePool];
  } else if ((questionSource === 'mixed' || questionSource === 'job') && jobDescription?.extractedData?.requiredSkills?.length > 0) {
    const topSkill = jobDescription.extractedData.requiredSkills[0];
    pool.splice(1, 0, {
      questionText: `This position heavily relies on ${topSkill}. Can you detail your hands-on experience with ${topSkill} and describe a real-world scenario where you applied it?`,
      category: 'Job Requirement Focus',
      difficulty: 'Medium'
    });
  }

  // Slice to required count and assign question numbers
  const questions = pool.slice(0, totalQuestions).map((q, idx) => ({
    questionNumber: idx + 1,
    questionText: q.questionText,
    category: q.category || 'Technical',
    difficulty: q.difficulty || 'Medium'
  }));

  return questions;
};

/**
 * Checks if candidate's answer is invalid, gibberish, punctuation only, or too brief
 */
export const isInvalidOrTrivialAnswer = (text) => {
  if (!text) return true;
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  // If only punctuation, dots, spaces, or symbols (e.g. "..", "...", "---", "?")
  if (/^[^a-zA-Z0-9]+$/.test(trimmed)) return true;
  // Count meaningful words (at least 2 letters)
  const meaningfulWords = trimmed
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  return meaningfulWords.length < 4;
};

/**
 * Evaluates a single answer using 4 rubric dimensions (1-10) and feedback
 */
export const evaluateAnswer = async (questionText, category, userAnswer, targetRole = 'Software Engineer') => {
  if (isInvalidOrTrivialAnswer(userAnswer)) {
    return {
      technicalAccuracy: 0,
      relevance: 0,
      completeness: 0,
      communication: 0,
      overallScore: 0,
      score: 0,
      rating: 0,
      whatWentWell: 'Response received.',
      strengths: ['No substantive answer provided.'],
      howToImprove: 'Please provide a clear, structured technical explanation with architectural context and engineering reasoning.',
      improvements: ['Answer is too brief, punctuation only (e.g. dots), or contains no meaningful technical response.'],
      betterAnswerExample: `When addressing "${questionText.slice(0, 60)}...", state the primary mechanism clearly, explain the underlying engineering trade-offs, and provide a concrete practical example.`,
      modelAnswer: `A comprehensive answer should state the core principle, explain practical engineering trade-offs, and illustrate with a concrete implementation example.`
    };
  }

  const prompt = `
You are an expert interviewer evaluating a candidate for the role: "${targetRole}".
QUESTION: ${questionText}
CATEGORY: ${category}

CANDIDATE ANSWER:
"${userAnswer}"

CRITICAL EVALUATION RULES:
1. Strict Grading: If the answer is irrelevant, nonsensical, or fails to address the question, score 0-2 out of 10.
2. Only award 7-10 if the candidate provides technically sound, accurate explanations with proper domain terminology.
3. Be candid, constructive, and realistic.

Evaluate the candidate's answer across these 4 rubric dimensions on a scale of 0 to 10:
- technicalAccuracy: Correctness of concepts, terminology, and engineering reasoning (0-10)
- relevance: How directly and concisely it addresses the question asked (0-10)
- completeness: Coverage of edge cases, trade-offs, and necessary depth (0-10)
- communication: Clarity of structure, technical vocabulary, and professionalism (0-10)

Return strict JSON strictly matching this structure without markdown:
{
  "technicalAccuracy": number (0-10),
  "relevance": number (0-10),
  "completeness": number (0-10),
  "communication": number (0-10),
  "overallScore": number (0-10),
  "whatWentWell": "string (specific positive aspects of the answer)",
  "howToImprove": "string (actionable advice to elevate this answer)",
  "betterAnswerExample": "string (an ideal, concise, high-scoring model response)"
}
`;

  const rawResult = await callGeminiWithFallback(prompt, () =>
    fallbackEvaluateAnswer(questionText, category, userAnswer)
  );

  const overall = Number(rawResult.overallScore ?? rawResult.score ?? 0);
  return {
    ...rawResult,
    overallScore: overall,
    score: overall,
    rating: overall,
    strengths: rawResult.strengths || (rawResult.whatWentWell ? [rawResult.whatWentWell] : []),
    whatWentWell: rawResult.whatWentWell || (Array.isArray(rawResult.strengths) ? rawResult.strengths[0] : rawResult.strengths) || 'Answer noted.',
    improvements: rawResult.improvements || (rawResult.howToImprove ? [rawResult.howToImprove] : []),
    howToImprove: rawResult.howToImprove || (Array.isArray(rawResult.improvements) ? rawResult.improvements[0] : rawResult.improvements) || 'Elaborate with deeper technical detail.',
    modelAnswer: rawResult.modelAnswer || rawResult.betterAnswerExample || '',
    betterAnswerExample: rawResult.betterAnswerExample || rawResult.modelAnswer || ''
  };
};

export const fallbackEvaluateAnswer = (questionText, category, userAnswer) => {
  if (isInvalidOrTrivialAnswer(userAnswer)) {
    return {
      technicalAccuracy: 0,
      relevance: 0,
      completeness: 0,
      communication: 0,
      overallScore: 0,
      score: 0,
      rating: 0,
      whatWentWell: 'Response received.',
      strengths: ['No substantive answer provided.'],
      howToImprove: 'Provide a structured technical explanation detailing concepts and trade-offs.',
      improvements: ['Answer is too brief or contains no meaningful technical explanation.'],
      betterAnswerExample: `When addressing "${questionText.slice(0, 60)}...", define the primary concept, highlight trade-offs, and give an implementation example.`,
      modelAnswer: `A comprehensive answer should state the core principle, explain practical engineering trade-offs, and illustrate with a concrete implementation example.`
    };
  }

  const words = userAnswer.trim().replace(/[^a-zA-Z0-9]/g, ' ').split(/\s+/).filter((w) => w.length > 1);
  const wordCount = words.length;
  const lower = userAnswer.toLowerCase();

  // Strict rubric grading based on technical depth and quality cues
  let accuracy = 2;
  let relevance = 3;
  let completeness = 2;
  let communication = 3;

  if (wordCount >= 5 && wordCount < 15) {
    accuracy = 3;
    relevance = 4;
    completeness = 2;
    communication = 3;
  } else if (wordCount >= 15 && wordCount < 35) {
    accuracy = 5;
    relevance = 6;
    completeness = 4;
    communication = 5;
  } else if (wordCount >= 35 && wordCount < 60) {
    accuracy = 7;
    relevance = 7;
    completeness = 6;
    communication = 7;
  } else if (wordCount >= 60) {
    accuracy = 8;
    relevance = 8;
    completeness = 7;
    communication = 8;
  }

  // Bonus for active engineering keywords
  const techKeywords = ['because', 'trade-off', 'performance', 'latency', 'architecture', 'frequency', 'hardware', 'interface', 'verify', 'simulate', 'pipeline', 'throughput', 'protocol', 'synchronous', 'asynchronous'];
  const matchedKeywords = techKeywords.filter((k) => lower.includes(k));
  if (matchedKeywords.length >= 2 && wordCount >= 20) {
    accuracy = Math.min(10, accuracy + 1);
    completeness = Math.min(10, completeness + 1);
  }

  const overall = Number(((accuracy + relevance + completeness + communication) / 4).toFixed(1));

  return {
    technicalAccuracy: accuracy,
    relevance,
    completeness,
    communication,
    overallScore: overall,
    score: overall,
    rating: overall,
    whatWentWell: wordCount > 25
      ? 'Good technical phrasing and clear conceptual intent.'
      : 'Began addressing the question directly.',
    strengths: [wordCount > 25 ? 'Good technical vocabulary.' : 'Directly touched on the topic.'],
    howToImprove: 'Elaborate with specific architectural trade-offs, corner cases, and quantifiable performance impact.',
    improvements: ['Include deeper architectural trade-offs and concrete design examples.'],
    betterAnswerExample: `When addressing "${questionText.slice(0, 60)}...", state the primary mechanism clearly, explain the underlying engineering trade-offs (e.g. latency vs area/power), and illustrate with a practical implementation example from past projects.`,
    modelAnswer: `When addressing "${questionText.slice(0, 60)}...", state the primary mechanism clearly, explain the underlying engineering trade-offs (e.g. latency vs area/power), and illustrate with a practical implementation example from past projects.`
  };
};

/**
 * Summarizes the entire interview session
 */
export const summarizeInterviewSession = (questions) => {
  const answered = questions.filter((q) => q.evaluation && q.evaluation.overallScore > 0);
  if (answered.length === 0) {
    return {
      overallInterviewScore: 0,
      categoryPerformance: { technicalAccuracy: 0, relevance: 0, completeness: 0, communication: 0 },
      strongAreas: [],
      weakAreas: ['No questions were answered.'],
      recommendedTopics: ['Attempt all mock interview questions to generate a performance assessment.'],
      summaryFeedback: 'Complete the interview questions to receive full AI analytics.'
    };
  }

  let totalAccuracy = 0;
  let totalRelevance = 0;
  let totalCompleteness = 0;
  let totalCommunication = 0;
  let totalOverall = 0;

  answered.forEach((q) => {
    totalAccuracy += q.evaluation.technicalAccuracy || 0;
    totalRelevance += q.evaluation.relevance || 0;
    totalCompleteness += q.evaluation.completeness || 0;
    totalCommunication += q.evaluation.communication || 0;
    totalOverall += q.evaluation.overallScore || 0;
  });

  const count = answered.length;
  const avgAccuracy = Math.round((totalAccuracy / count) * 10);
  const avgRelevance = Math.round((totalRelevance / count) * 10);
  const avgCompleteness = Math.round((totalCompleteness / count) * 10);
  const avgCommunication = Math.round((totalCommunication / count) * 10);

  // Overall score out of 100
  const overallInterviewScore = Math.round((totalOverall / count) * 10);

  const strongAreas = [];
  const weakAreas = [];

  if (avgAccuracy >= 75) strongAreas.push('Solid grasp of technical principles and domain concepts');
  else weakAreas.push('Technical depth and accuracy require revision');

  if (avgCommunication >= 75) strongAreas.push('Clear articulation and professional engineering delivery');
  else weakAreas.push('Communication clarity and structured responses (e.g. STAR method)');

  if (avgCompleteness >= 75) strongAreas.push('Thorough coverage of system trade-offs and edge cases');
  else weakAreas.push('Under-developed answers; provide more depth and concrete examples');

  return {
    overallInterviewScore,
    categoryPerformance: {
      technicalAccuracy: avgAccuracy,
      relevance: avgRelevance,
      completeness: avgCompleteness,
      communication: avgCommunication
    },
    strongAreas: strongAreas.length > 0 ? strongAreas : ['Consistent engagement across all prompts'],
    weakAreas: weakAreas.length > 0 ? weakAreas : ['Continue refining edge-case analysis'],
    recommendedTopics: [
      'Practice explaining design trade-offs and constraints out loud.',
      'Review fundamental timing, protocol, and architectural concepts for your target role.',
      'Structure behavioral answers with Situation, Task, Action, and Result.'
    ],
    summaryFeedback: `Candidate scored ${overallInterviewScore}/100 across ${count} answered questions. Demonstrated good domain familiarity with opportunities to add depth to technical trade-offs.`
  };
};
