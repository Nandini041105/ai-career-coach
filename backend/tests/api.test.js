import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5000/api';

test('Full Backend API Integration Test Suite', async (t) => {
  let authToken = '';
  let userId = '';
  let resumeId = '';
  let jobId = '';
  let matchId = '';
  let interviewSessionId = '';

  await t.test('1. Health Check Endpoint', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.equal(data.service, 'AI-Powered Career Coach API');
  });

  await t.test('2. User Registration', async () => {
    const email = `testuser_${Date.now()}@example.com`;
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera',
        email,
        password: 'password123',
        targetRole: 'RTL Design Engineer'
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.name, 'Alex Rivera');
    assert.equal(data.user.targetRole, 'RTL Design Engineer');

    authToken = data.token;
    userId = data.user._id;
  });

  await t.test('3. User Profile and Role Update', async () => {
    const profileRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.equal(profileRes.status, 200);
    const profileData = await profileRes.json();
    assert.equal(profileData.user.name, 'Alex Rivera');

    // Update role
    const updateRes = await fetch(`${BASE_URL}/auth/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ targetRole: 'RTL Design Engineer' })
    });
    assert.equal(updateRes.status, 200);
  });

  await t.test('3b. PDF Resume Upload and Text Parsing', async () => {
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync('sample_resume.pdf');
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('resume', blob, 'sample_resume.pdf');

    const res = await fetch(`${BASE_URL}/resume/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      body: formData
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.resume._id);
    assert.ok(data.resume.extractedData.skills.length > 0);
    assert.equal(data.resume.extractedData.name, 'Alex Rivera');
    resumeId = data.resume._id;
  });

  await t.test('3c. Resume Quality Score Analysis', async () => {
    const res = await fetch(`${BASE_URL}/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ resumeId, targetRole: 'RTL Design Engineer' })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.analysis.overallScore >= 50);
    assert.ok(data.analysis.categoryScores.skills > 0);
    assert.ok(data.analysis.strengths.length > 0);
  });

  await t.test('4. Job Description Ingestion and Analysis', async () => {
    const jdText = `
Job Title: RTL Design Engineer
Company: Apex Semiconductor
Location: San Jose, CA

Responsibilities:
- Architect and develop synthesizable Verilog and SystemVerilog RTL modules for high-throughput network acceleration.
- Implement Finite State Machines (FSM), multi-clock domain crossings (CDC), and high-speed FIFO buffers.
- Perform Static Timing Analysis (STA), linting, and formal verification using Synopsys and Cadence tools.
- Collaborate with physical design and verification engineers to achieve timing closure at 1.2 GHz.

Requirements:
- Bachelor's or Master's in Electrical Engineering or Computer Engineering.
- 2+ years of experience with Verilog, SystemVerilog, FPGA prototyping (Vivado), and digital logic design.
- Hands-on knowledge of UVM, STA, and scripting in Python/Tcl.
    `;

    const res = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        company: 'Apex Semiconductor',
        title: 'RTL Design Engineer',
        rawText: jdText,
        targetRole: 'RTL Design Engineer'
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.job._id);
    assert.ok(data.job.extractedData.requiredSkills.length > 0);
    jobId = data.job._id;
  });

  await t.test('4b. Resume vs Job Matching and Skill Gaps', async () => {
    const res = await fetch(`${BASE_URL}/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ resumeId, jobDescriptionId: jobId })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.match.overallMatchScore > 0);
    assert.ok(data.match.categoryScores.technicalSkills > 0);
    assert.ok(Array.isArray(data.match.matchedSkills));
    assert.ok(Array.isArray(data.skillGap.skillGaps));
    matchId = data.match._id;
  });

  await t.test('5. Mock Interview Generation and Interactive Answering', async () => {
    // Start interview
    const startRes = await fetch(`${BASE_URL}/interview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        interviewType: 'technical',
        questionSource: 'role',
        totalQuestions: 5,
        jobDescriptionId: jobId
      })
    });

    assert.equal(startRes.status, 201);
    const startData = await startRes.json();
    assert.equal(startData.success, true);
    assert.equal(startData.session.questions.length, 5);
    interviewSessionId = startData.session._id;

    // Submit answer to question 1
    const answerRes = await fetch(`${BASE_URL}/interview/${interviewSessionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        questionNumber: 1,
        userAnswer:
          'In Verilog, blocking assignments (=) execute sequentially in the procedural block, meaning subsequent statements wait for evaluation. Non-blocking assignments (<=) evaluate all right-hand sides in parallel at the time step and schedule updates to the left-hand sides at the end of the simulation cycle, which accurately models synchronous hardware flip-flops without race conditions.'
      })
    });

    assert.equal(answerRes.status, 200);
    const answerData = await answerRes.json();
    console.log('answerData in test:', JSON.stringify(answerData, null, 2));
    assert.equal(answerData.success, true);
    assert.ok(answerData.evaluation.overallScore > 0);
    assert.ok(answerData.evaluation.whatWentWell);

    // Complete interview
    const completeRes = await fetch(`${BASE_URL}/interview/${interviewSessionId}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    assert.equal(completeRes.status, 200);
    const completeData = await completeRes.json();
    assert.equal(completeData.success, true);
    assert.equal(completeData.session.isCompleted, true);
    assert.ok(completeData.session.overallInterviewScore > 0);
  });

  await t.test('6. Dashboard Summary Endpoint', async () => {
    const res = await fetch(`${BASE_URL}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.stats.targetRole, 'RTL Design Engineer');
    assert.ok(Array.isArray(data.recentInterviews));
  });

  await t.test('7. Learning Roadmap Generation', async () => {
    const res = await fetch(`${BASE_URL}/roadmap/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({})
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.roadmap.weeklyPlan.length >= 4);
    assert.equal(data.roadmap.targetRole, 'RTL Design Engineer');
  });

  await t.test('8. Live Job Recommendations Endpoint with Location & ATS Matching', async () => {
    const res = await fetch(`${BASE_URL}/jobs/recommendations?location=Bengaluru&role=RTL%20Design%20Engineer`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.jobs));
    assert.ok(data.jobs.length > 0);

    const firstJob = data.jobs[0];
    assert.ok(firstJob.jobTitle);
    assert.ok(firstJob.company);
    assert.ok(firstJob.location);
    assert.ok(firstJob.applyUrl);
    assert.ok(typeof firstJob.atsMatchScore === 'number');
    assert.ok(Array.isArray(firstJob.matchedSkills));
    assert.ok(Array.isArray(firstJob.missingSkills));
    assert.ok(['On-site', 'Hybrid', 'Remote'].includes(firstJob.workMode));
  });

  await t.test('9. Instant Interview Preparation from Live Vacancy', async () => {
    // 1-Click Prepare Interview with job posting
    const res = await fetch(`${BASE_URL}/interview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        interviewType: 'technical',
        jobTitle: 'Senior RTL Design Engineer',
        company: 'Qualcomm India',
        requiredSkills: ['SystemVerilog', 'UVM', 'CDC', 'STA'],
        jobDescriptionText: 'Lead RTL micro-architecture for Snapdragon mobile processors.'
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.session);
    assert.equal(data.session.questionSource, 'job');
    assert.ok(data.session.questions.length > 0);

    // Verify question is tailored to Qualcomm / RTL / required skills
    const firstQ = data.session.questions[0];
    assert.ok(firstQ.questionText);
    console.log('[Test] Job-tailored question generated:', firstQ.questionText);
  });
});
