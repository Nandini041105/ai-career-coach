import { callGeminiWithFallback } from './geminiService.js';

/**
 * Generates a personalized week-by-week learning roadmap
 */
export const generateLearningRoadmap = async (targetRole, missingSkills = [], resumeSkills = []) => {
  const prompt = `
Generate a realistic 4-week personalized technical learning roadmap for an aspiring ${targetRole}.
Key skills missing from job requirements: ${missingSkills.join(', ') || 'Core role specializations'}
Existing candidate skills: ${resumeSkills.join(', ') || 'Foundational computer/electrical engineering'}

Return strict JSON matching this structure without markdown:
{
  "totalWeeks": 4,
  "weeklyPlan": [
    {
      "week": 1,
      "title": "string",
      "skill": "string",
      "priority": "High" | "Medium" | "Low",
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "prerequisites": ["string", ...],
      "topics": ["string", ...],
      "suggestedPractice": ["string", ...],
      "estimatedHours": number
    },
    ...
  ]
}
`;

  return await callGeminiWithFallback(prompt, () => fallbackRoadmap(targetRole, missingSkills));
};

export const fallbackRoadmap = (targetRole, missingSkills = []) => {
  const skillsToLearn = missingSkills.length > 0 ? missingSkills : ['Core Architecture', 'Design Verification', 'System Integration', 'Performance Tuning'];

  const defaultPlans = [
    {
      week: 1,
      title: `${skillsToLearn[0] || 'Foundations'} Core Principles & Architecture`,
      skill: skillsToLearn[0] || 'Domain Fundamentals',
      priority: 'High',
      difficulty: 'Beginner',
      prerequisites: ['Basic programming', 'Digital logic principles'],
      topics: ['Syntax and semantics', 'Memory and timing model', 'Execution lifecycle', 'Basic lab setup'],
      suggestedPractice: ['Build a hello-world demonstration module', 'Simulate timing behavior under test bench'],
      estimatedHours: 10
    },
    {
      week: 2,
      title: `${skillsToLearn[1] || 'Intermediate Design'} & Verification Workflows`,
      skill: skillsToLearn[1] || 'Design Verification',
      priority: 'High',
      difficulty: 'Intermediate',
      prerequisites: ['Week 1 core fundamentals'],
      topics: ['State machine design', 'Modular interface definitions', 'Corner case assertions', 'Automated regression testing'],
      suggestedPractice: ['Implement an FSM controller with edge-case test vectors', 'Measure simulation coverage'],
      estimatedHours: 12
    },
    {
      week: 3,
      title: `${skillsToLearn[2] || 'Advanced Protocol'} Integration & Optimization`,
      skill: skillsToLearn[2] || 'Bus Protocols & Interfaces',
      priority: 'Medium',
      difficulty: 'Intermediate',
      prerequisites: ['Week 1 & 2 design concepts'],
      topics: ['Handshake protocols', 'Clock domain handling / latency reduction', 'Hardware/software co-design', 'Resource utilization'],
      suggestedPractice: ['Connect two asynchronous modules through a dual-clock FIFO or protocol bridge', 'Analyze resource overhead'],
      estimatedHours: 14
    },
    {
      week: 4,
      title: 'Capstone Project & Interview Readiness',
      skill: `${targetRole} Capstone Implementation`,
      priority: 'High',
      difficulty: 'Advanced',
      prerequisites: ['All prior weekly milestones'],
      topics: ['End-to-end project architecture', 'Documentation and portfolio presentation', 'Mock technical interview problem walk-throughs', 'Design review defense'],
      suggestedPractice: ['Publish a clean GitHub repository with architecture diagram, README, and verification testbench', 'Practice verbal walkthroughs'],
      estimatedHours: 15
    }
  ];

  return {
    totalWeeks: 4,
    weeklyPlan: defaultPlans
  };
};
