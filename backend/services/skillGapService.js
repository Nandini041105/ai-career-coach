import { callGeminiWithFallback } from './geminiService.js';

const SKILL_EXPLANATIONS = {
  'systemverilog': {
    whyItMatters: 'SystemVerilog is the industry standard for both advanced RTL design and modern verification methodologies.',
    recommendedLevel: 'Intermediate',
    priority: 'High',
    learningTopics: ['Interfaces & Modports', 'SystemVerilog Assertions (SVA)', 'OOP concepts in SV', 'Packages & Typedefs', 'Constrained Random Verification']
  },
  'uvm': {
    whyItMatters: 'Universal Verification Methodology is mandated across leading semiconductor and design verification teams.',
    recommendedLevel: 'Intermediate',
    priority: 'High',
    learningTopics: ['UVM Components (Driver, Monitor, Scoreboard)', 'TLM 1.0/2.0 Interfaces', 'Sequences & Sequencers', 'Factory Pattern & Overrides', 'Phase execution']
  },
  'verilog': {
    whyItMatters: 'Core foundation for digital circuit description and synthesizable hardware logic.',
    recommendedLevel: 'Intermediate',
    priority: 'High',
    learningTopics: ['Blocking vs Non-blocking assignments', 'Finite State Machines (Moore & Mealy)', 'Structural vs Behavioral modeling', 'Testbenches & Timescales']
  },
  'fpga': {
    whyItMatters: 'Enables rapid hardware prototyping, digital verification, and real-time high-throughput processing.',
    recommendedLevel: 'Intermediate',
    priority: 'High',
    learningTopics: ['Xilinx Vivado flow', 'Look-Up Tables (LUTs) & Flip-Flops', 'BRAM and DSP slices', 'Timing closure & Constraints (XDC)']
  },
  'c': {
    whyItMatters: 'Low-level programming language essential for firmware, drivers, and embedded systems.',
    recommendedLevel: 'Intermediate',
    priority: 'High',
    learningTopics: ['Pointers & Memory Management', 'Bitwise operations & Masks', 'Structures & Unions', 'Volatile keyword & Interrupt handling']
  },
  'rtos': {
    whyItMatters: 'Crucial for deterministic multi-tasking and real-time scheduling in mission-critical embedded devices.',
    recommendedLevel: 'Intermediate',
    priority: 'High',
    learningTopics: ['Task scheduling & Context switching', 'Semaphores & Mutexes', 'Message Queues', 'Priority Inversion & Solutions', 'FreeRTOS API']
  },
  'docker': {
    whyItMatters: 'Standardizes build and deployment environments across modern engineering teams.',
    recommendedLevel: 'Beginner',
    priority: 'Medium',
    learningTopics: ['Dockerfile syntax', 'Container lifecycle', 'Docker Compose', 'Multi-stage builds', 'Volume and Network mapping']
  },
  'python': {
    whyItMatters: 'Used universally for scripting, testbench automation, data analysis, and AI modeling.',
    recommendedLevel: 'Beginner',
    priority: 'Medium',
    learningTopics: ['File I/O & Regular Expressions', 'Automation scripts', 'PyTest framework', 'Data structures (lists, dicts, sets)']
  }
};

/**
 * Analyzes missing skills and produces deep educational explanations
 */
export const analyzeSkillGaps = async (missingSkills, targetRole = 'Software Engineer') => {
  if (!missingSkills || missingSkills.length === 0) {
    return [];
  }

  const prompt = `
For the target role "${targetRole}", analyze the following missing skills identified from a job match:
Skills: ${missingSkills.join(', ')}

Return a JSON array of objects strictly matching this schema without markdown:
[
  {
    "skill": "string",
    "priority": "High" | "Medium" | "Low",
    "recommendedLevel": "Beginner" | "Intermediate" | "Advanced",
    "whyItMatters": "string (concise explanation of why this matters for the role)",
    "learningTopics": ["string", "string", ...]
  }
]
`;

  return await callGeminiWithFallback(prompt, () => fallbackSkillGaps(missingSkills, targetRole));
};

export const fallbackSkillGaps = (missingSkills, targetRole) => {
  return missingSkills.slice(0, 8).map((skill, index) => {
    const sLower = skill.toLowerCase();
    const preset = SKILL_EXPLANATIONS[sLower];

    if (preset) {
      return {
        skill,
        priority: preset.priority,
        recommendedLevel: preset.recommendedLevel,
        whyItMatters: preset.whyItMatters,
        learningTopics: preset.learningTopics
      };
    }

    const priority = index < 3 ? 'High' : index < 6 ? 'Medium' : 'Low';
    return {
      skill,
      priority,
      recommendedLevel: 'Intermediate',
      whyItMatters: `Mastery of ${skill} is frequently required for modern ${targetRole} workflows to ensure product quality and technical synergy.`,
      learningTopics: [
        `${skill} core architecture and fundamentals`,
        `Hands-on implementation and best practices in ${skill}`,
        `Testing, debugging, and production integration with ${skill}`,
        `Industry standard patterns and optimization techniques`
      ]
    };
  });
};
