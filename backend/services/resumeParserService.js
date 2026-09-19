import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Common regex patterns for resume entity detection
 */
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

/**
 * Extracts raw text and structured sections from PDF buffer
 */
export const parseResumePdf = async (buffer) => {
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF file buffer is empty.');
  }

  let pdfData;
  try {
    pdfData = await pdf(buffer);
  } catch (err) {
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }

  const rawText = (pdfData.text || '').replace(/\r\n/g, '\n').trim();

  // Check for scanned or image-only PDF
  if (rawText.length < 50) {
    throw new Error(
      'Text extraction yielded insufficient content (less than 50 characters). The PDF may be a scanned image or non-selectable format. Please upload a text-based PDF resume.'
    );
  }

  // Heuristic section extraction
  const extractedData = extractSectionsHeuristically(rawText);

  return {
    rawText,
    extractedData,
    pageCount: pdfData.numpages || 1
  };
};

/**
 * Splits text into logical sections based on common headings
 */
export const extractSectionsHeuristically = (text) => {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Email extraction
  const emailMatches = text.match(EMAIL_REGEX);
  const email = emailMatches ? emailMatches[0] : '';

  // Phone extraction
  const phoneMatches = text.match(PHONE_REGEX);
  const phone = phoneMatches ? phoneMatches[0] : '';

  // Name extraction: usually in the first 3 lines
  let name = '';
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      line.length > 2 &&
      line.length < 40 &&
      !line.includes('@') &&
      !line.match(/\d{3}/) &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('curriculum')
    ) {
      name = line;
      break;
    }
  }

  // Section categories
  const sections = {
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: []
  };

  const sectionHeadings = {
    skills: /^(skills|technical skills|key skills|technologies|proficiencies|core competencies)/i,
    education: /^(education|academic background|academics|qualifications|degrees)/i,
    experience: /^(experience|work experience|employment history|professional experience|internships|work history)/i,
    projects: /^(projects|academic projects|key projects|personal projects|technical projects)/i,
    certifications: /^(certifications|licenses|courses|accreditations)/i,
    achievements: /^(achievements|honors|awards|accomplishments)/i,
    languages: /^(languages|spoken languages)/i
  };

  let currentSection = null;

  for (const line of lines) {
    let matchedHeading = false;

    for (const [secKey, regex] of Object.entries(sectionHeadings)) {
      if (regex.test(line) && line.length < 50) {
        currentSection = secKey;
        matchedHeading = true;
        break;
      }
    }

    if (!matchedHeading && currentSection) {
      // Append line to current section
      sections[currentSection].push(line);
    }
  }

  // Parse skill tokens
  let skillTokens = [];
  if (sections.skills.length > 0) {
    const skillsText = sections.skills.join(', ');
    skillTokens = skillsText
      .split(/[,•|/;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 35 && !s.includes(':'));
  } else {
    // Search general text for common tech skills
    skillTokens = extractKnownTechSkills(text);
  }

  return {
    name: name || 'Applicant',
    email,
    phone,
    skills: [...new Set(skillTokens)].slice(0, 30),
    education: sections.education.slice(0, 10),
    experience: sections.experience.slice(0, 20),
    projects: sections.projects.slice(0, 20),
    certifications: sections.certifications.slice(0, 10),
    achievements: sections.achievements.slice(0, 10),
    languages: sections.languages.slice(0, 10)
  };
};

/**
 * Keyword search for known skills if skills section is missing or unformatted
 */
const extractKnownTechSkills = (text) => {
  const commonTech = [
    'Verilog', 'SystemVerilog', 'VHDL', 'FPGA', 'RTL', 'VLSI', 'ASIC', 'UVM', 'STA',
    'Physical Design', 'Synthesis', 'Vivado', 'Quartus', 'ModelSim', 'Synopsys', 'Cadence',
    'C', 'C++', 'Python', 'Java', 'JavaScript', 'TypeScript', 'Embedded C', 'RTOS', 'Linux',
    'ARM', 'Microcontrollers', 'STM32', 'Arduino', 'ESP32', 'UART', 'SPI', 'I2C', 'CAN',
    'PCB Design', 'React', 'Node.js', 'Express', 'MongoDB', 'SQL', 'PostgreSQL', 'Docker',
    'Kubernetes', 'Git', 'AWS', 'GCP', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow'
  ];

  const found = [];
  const lower = text.toLowerCase();
  for (const tech of commonTech) {
    const regex = new RegExp(`\\b${tech.toLowerCase().replace('+', '\\+')}\\b`, 'i');
    if (regex.test(lower)) {
      found.push(tech);
    }
  }
  return found;
};
