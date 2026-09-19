import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAtsMatch, getRecommendedJobs } from '../services/jobSearchService.js';

test('Job Recommendations & ATS Match Service Tests', async (t) => {
  const sampleResume = {
    originalFileName: 'Alex_Rivera_Hardware_Resume.pdf',
    targetRole: 'RTL Design Engineer',
    extractedData: {
      skills: ['Verilog', 'SystemVerilog', 'RTL Design', 'CDC', 'Static Timing Analysis (STA)', 'ModelSim', 'C/C++'],
      experience: ['3 years digital design at Silicon Labs'],
      projects: ['RISC-V 5-stage pipelined processor with AXI bus interface']
    },
    rawText: 'Experienced RTL Design Engineer with SystemVerilog, Verilog, CDC clock domain crossing, STA static timing analysis, AXI bus protocols, and FPGA bringup.'
  };

  await t.test('1. calculateAtsMatch calculates accurate match scores and separates matched/missing skills', () => {
    const job = {
      jobTitle: 'Senior RTL Design Engineer',
      company: 'Qualcomm India',
      category: 'RTL Design Engineer',
      requiredSkills: ['SystemVerilog', 'Verilog', 'RTL Design', 'UVM', 'CDC', 'Static Timing Analysis (STA)', 'AXI Protocols'],
      preferredSkills: ['SpyGlass', 'Synthesis']
    };

    const match = calculateAtsMatch(job, sampleResume, 'RTL Design Engineer');

    assert.ok(match.atsMatchScore >= 70, `Score ${match.atsMatchScore} should be >= 70`);
    assert.ok(match.matchedSkills.includes('SystemVerilog'), 'Should match SystemVerilog');
    assert.ok(match.matchedSkills.includes('Verilog'), 'Should match Verilog');
    assert.ok(match.matchedSkills.includes('RTL Design'), 'Should match RTL Design');
    assert.ok(match.matchedSkills.includes('CDC'), 'Should match CDC');
    assert.ok(match.missingSkills.includes('UVM'), 'Should detect UVM as missing');
    assert.ok(match.missingSkills.includes('SpyGlass'), 'Should detect SpyGlass as missing');
  });

  await t.test('2. getRecommendedJobs filters accurately by Location (Bengaluru, Hyderabad, Pune, Remote)', async () => {
    const blrResult = await getRecommendedJobs({ location: 'Bengaluru', resume: sampleResume });
    assert.ok(blrResult.jobs.length > 0, 'Should find jobs in Bengaluru');
    blrResult.jobs.forEach((j) => {
      assert.ok(
        j.location.toLowerCase().includes('bengaluru') || j.location.toLowerCase().includes('bangalore'),
        `Job ${j.jobTitle} at ${j.company} should be in Bengaluru, got ${j.location}`
      );
    });

    const hydResult = await getRecommendedJobs({ location: 'Hyderabad', resume: sampleResume });
    assert.ok(hydResult.jobs.length > 0, 'Should find jobs in Hyderabad');
    hydResult.jobs.forEach((j) => {
      assert.ok(
        j.location.toLowerCase().includes('hyderabad'),
        `Job ${j.jobTitle} at ${j.company} should be in Hyderabad, got ${j.location}`
      );
    });

    const remoteResult = await getRecommendedJobs({ location: 'Remote', resume: sampleResume });
    assert.ok(remoteResult.jobs.length > 0, 'Should find Remote jobs');
    remoteResult.jobs.forEach((j) => {
      assert.ok(
        j.workMode === 'Remote' || j.location.toLowerCase().includes('remote'),
        `Job ${j.jobTitle} at ${j.company} should be Remote, got ${j.workMode}/${j.location}`
      );
    });
  });

  await t.test('3. getRecommendedJobs filters accurately by Role track', async () => {
    const rtlResult = await getRecommendedJobs({ role: 'RTL Design Engineer', resume: sampleResume });
    assert.ok(rtlResult.jobs.length > 0, 'Should find RTL jobs');
    rtlResult.jobs.forEach((j) => {
      assert.ok(
        j.jobTitle.toLowerCase().includes('rtl') || j.category.toLowerCase().includes('rtl'),
        `Job ${j.jobTitle} should be RTL, got ${j.category}`
      );
    });

    const embResult = await getRecommendedJobs({ role: 'Embedded Systems Engineer' });
    assert.ok(embResult.jobs.length > 0, 'Should find Embedded jobs');
    embResult.jobs.forEach((j) => {
      assert.ok(
        j.jobTitle.toLowerCase().includes('embedded') || j.jobTitle.toLowerCase().includes('firmware') || j.category.toLowerCase().includes('embedded'),
        `Job ${j.jobTitle} should be Embedded, got ${j.category}`
      );
    });
  });

  await t.test('4. All jobs include required fields: company, applyUrl, salaryRange, requiredSkills, workMode', async () => {
    const allResult = await getRecommendedJobs({ location: 'All', role: 'All' });
    assert.ok(allResult.jobs.length >= 10, 'Should have comprehensive vacancy listings');

    allResult.jobs.forEach((j) => {
      assert.ok(j.company, `Job ${j.id} missing company`);
      assert.ok(j.jobTitle, `Job ${j.id} missing jobTitle`);
      assert.ok(j.location, `Job ${j.id} missing location`);
      assert.ok(j.salaryRange, `Job ${j.id} missing salaryRange`);
      assert.ok(j.applyUrl && j.applyUrl.startsWith('http'), `Job ${j.id} missing valid applyUrl`);
      assert.ok(Array.isArray(j.requiredSkills) && j.requiredSkills.length > 0, `Job ${j.id} missing requiredSkills`);
      assert.ok(['On-site', 'Hybrid', 'Remote'].includes(j.workMode), `Job ${j.id} has invalid workMode: ${j.workMode}`);
      assert.ok(typeof j.atsMatchScore === 'number' && j.atsMatchScore >= 0 && j.atsMatchScore <= 100, `Job ${j.id} has invalid atsMatchScore: ${j.atsMatchScore}`);
    });
  });
});
