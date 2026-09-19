import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import JobMatcherPage from './pages/JobMatcherPage';
import JobMatchesDashboardPage from './pages/JobMatchesDashboardPage';
import SkillGapPage from './pages/SkillGapPage';
import LearningRoadmapPage from './pages/LearningRoadmapPage';
import InterviewHubPage from './pages/InterviewHubPage';
import MockInterviewPage from './pages/MockInterviewPage';
import InterviewResultsPage from './pages/InterviewResultsPage';
import InterviewHistoryPage from './pages/InterviewHistoryPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-slate-100 selection:bg-brand-primary/30 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <ResumeUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-analysis"
            element={
              <ProtectedRoute>
                <ResumeAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobMatcherPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-matches"
            element={
              <ProtectedRoute>
                <JobMatchesDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skill-gaps"
            element={
              <ProtectedRoute>
                <SkillGapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <LearningRoadmapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <InterviewHubPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/:id"
            element={
              <ProtectedRoute>
                <MockInterviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/:id/results"
            element={
              <ProtectedRoute>
                <InterviewResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-history"
            element={
              <ProtectedRoute>
                <InterviewHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
