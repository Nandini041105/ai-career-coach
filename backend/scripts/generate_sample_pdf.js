import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function generateSamplePdf() {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  let y = height - 50;

  // Header: Name & Contact
  page.drawText('Alex Rivera', { x: 50, y, size: 20, font: timesBoldFont, color: rgb(0.1, 0.1, 0.2) });
  y -= 18;
  page.drawText('alex.rivera@example.com  |  (555) 123-4567  |  linkedin.com/in/alexrivera-rtl', {
    x: 50,
    y,
    size: 10,
    font: timesRomanFont,
    color: rgb(0.3, 0.3, 0.3)
  });
  y -= 14;
  page.drawText('Target Role: RTL Design Engineer', {
    x: 50,
    y,
    size: 10,
    font: timesBoldFont,
    color: rgb(0.35, 0.35, 0.8)
  });
  y -= 25;

  // Section 1: Skills
  page.drawText('TECHNICAL SKILLS', { x: 50, y, size: 12, font: timesBoldFont, color: rgb(0.1, 0.1, 0.2) });
  y -= 16;
  page.drawText('Languages: Verilog, SystemVerilog, C, Python, Tcl, Bash', { x: 50, y, size: 10, font: timesRomanFont });
  y -= 14;
  page.drawText('Hardware & EDA Tools: Vivado, Quartus, ModelSim, Synopsys Design Compiler, Cadence Genus', { x: 50, y, size: 10, font: timesRomanFont });
  y -= 14;
  page.drawText('Protocols & Architectures: AXI4, APB, UART, SPI, I2C, Clock Domain Crossing (CDC), FSM, FIFOs, Static Timing Analysis (STA)', { x: 50, y, size: 10, font: timesRomanFont });
  y -= 24;

  // Section 2: Education
  page.drawText('EDUCATION', { x: 50, y, size: 12, font: timesBoldFont, color: rgb(0.1, 0.1, 0.2) });
  y -= 16;
  page.drawText('Bachelor of Science in Electrical and Computer Engineering  |  GPA: 3.85 / 4.0', { x: 50, y, size: 10, font: timesBoldFont });
  y -= 14;
  page.drawText('State University  |  Graduated May 2024', { x: 50, y, size: 10, font: timesRomanFont, color: rgb(0.4, 0.4, 0.4) });
  y -= 24;

  // Section 3: Experience
  page.drawText('PROFESSIONAL EXPERIENCE', { x: 50, y, size: 12, font: timesBoldFont, color: rgb(0.1, 0.1, 0.2) });
  y -= 16;
  page.drawText('Silicon RTL Design Intern  |  Apex Microelectronics Inc.  (June 2023 - Dec 2023)', { x: 50, y, size: 10, font: timesBoldFont });
  y -= 14;
  page.drawText('- Architected synthesizable Verilog modules for a multi-master SPI bus controller.', { x: 60, y, size: 9.5, font: timesRomanFont });
  y -= 14;
  page.drawText('- Optimized Finite State Machine (FSM) transitions, reducing critical path latency by 32%.', { x: 60, y, size: 9.5, font: timesRomanFont });
  y -= 14;
  page.drawText('- Resolved multi-bit Clock Domain Crossing (CDC) metastability violations using dual-clock Gray code FIFOs.', { x: 60, y, size: 9.5, font: timesRomanFont });
  y -= 14;
  page.drawText('- Wrote automated regression testbenches in Python/ModelSim, increasing code coverage to 96.5%.', { x: 60, y, size: 9.5, font: timesRomanFont });
  y -= 24;

  // Section 4: Projects
  page.drawText('ACADEMIC & TECHNICAL PROJECTS', { x: 50, y, size: 12, font: timesBoldFont, color: rgb(0.1, 0.1, 0.2) });
  y -= 16;
  page.drawText('Hardware-Accelerated Neural Network Core on Xilinx Artix-7 FPGA', { x: 50, y, size: 10, font: timesBoldFont });
  y -= 14;
  page.drawText('- Designed pipelined 8-bit MAC units in Verilog capable of 120 MHz peak operating frequency.', { x: 60, y, size: 9.5, font: timesRomanFont });
  y -= 14;
  page.drawText('- Achieved complete timing closure and reduced BRAM utilization by 22% using custom memory banking.', { x: 60, y, size: 9.5, font: timesRomanFont });
  y -= 16;
  page.drawText('Full-Duplex UART Communication Engine with Parity Generator', { x: 50, y, size: 10, font: timesBoldFont });
  y -= 14;
  page.drawText('- Implemented baud rate generator with configurable oversampling (16x) and framing error detection.', { x: 60, y, size: 9.5, font: timesRomanFont });
  y -= 24;

  // Section 5: Achievements
  page.drawText('ACHIEVEMENTS & CERTIFICATIONS', { x: 50, y, size: 12, font: timesBoldFont, color: rgb(0.1, 0.1, 0.2) });
  y -= 16;
  page.drawText('- First Place Winner, Annual IEEE Digital VLSI Circuit Design Hackathon', { x: 50, y, size: 9.5, font: timesRomanFont });
  y -= 14;
  page.drawText('- Certified in Advanced SystemVerilog Verification and Static Timing Analysis (STA)', { x: 50, y, size: 9.5, font: timesRomanFont });

  const pdfBytes = await pdfDoc.save();

  fs.writeFileSync(path.join(process.cwd(), 'sample_resume.pdf'), pdfBytes);
  fs.writeFileSync(path.join('..', 'sample_resume.pdf'), pdfBytes);
  console.log('Successfully generated 100% valid sample_resume.pdf using pdf-lib');
}

generateSamplePdf().catch(console.error);
