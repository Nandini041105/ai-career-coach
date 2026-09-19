import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  ArrowRight,
  AlertCircle,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { resumeApi, analysisApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AiThinkingState } from '../components/LoadingSkeleton';

const ResumeUploadPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await resumeApi.getAll();
      setResumes(res.data.resumes || []);
      if (res.data.resumes && res.data.resumes.length > 0) {
        setActiveResume(res.data.resumes[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file) => {
    setErrorMessage('');
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF files are supported. Please upload a .pdf document.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10 MB limit. Please select a smaller file.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setErrorMessage('');
    setStatusMessage('Uploading and extracting text from PDF...');

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const res = await resumeApi.upload(formData);
      setActiveResume(res.data.resume);
      setResumes((prev) => [res.data.resume, ...prev]);
      setSelectedFile(null);
      setStatusMessage('Resume uploaded and parsed successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload or parse resume PDF.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await resumeApi.delete(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
      if (activeResume?._id === id) {
        setActiveResume(null);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete resume');
    }
  };

  const handleAnalyzeNow = async () => {
    if (!activeResume) return;
    setAnalyzing(true);
    setErrorMessage('');
    try {
      const res = await analysisApi.analyze({
        resumeId: activeResume._id,
        targetRole: user?.targetRole
      });
      navigate('/resume-analysis', { state: { analysis: res.data.analysis } });
    } catch (err) {
      setErrorMessage(err.message || 'Analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <AiThinkingState message="Analyzing Resume Structure, Verbs, Metrics & Target Role Alignment..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <FileText className="w-7 h-7 text-brand-primary" />
          Resume Management & Text Extraction
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Upload your PDF resume to extract structured sections, calculate quality metrics, and run job matching.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      {/* Drag & Drop Upload Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all flex flex-col items-center justify-center space-y-4 ${
            dragActive
              ? 'border-brand-primary bg-brand-primary/10'
              : 'border-slate-700/80 hover:border-brand-primary/50 bg-dark-850/50'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center">
            <UploadCloud className="w-8 h-8 text-brand-primary" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-white">
              {selectedFile ? selectedFile.name : 'Drag & drop your PDF resume here'}
            </p>
            <p className="text-xs text-slate-400">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB selected`
                : 'Supports PDF files up to 10MB'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-colors shadow-sm">
              Browse Computer
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shadow-lg shadow-brand-primary/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {uploading ? 'Processing...' : 'Upload & Extract'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Resume Extracted Details */}
      {activeResume ? (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{activeResume.originalFileName}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                  Parsed Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Uploaded on {new Date(activeResume.createdAt).toLocaleDateString()} • {(activeResume.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDelete(activeResume._id)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>

              <button
                onClick={handleAnalyzeNow}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 shadow-lg shadow-brand-primary/25 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze Quality Score
              </button>
            </div>
          </div>

          {/* Extracted Sections Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-accent flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Extracted Skills ({activeResume.extractedData?.skills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeResume.extractedData?.skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-200 border border-slate-700/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Candidate Overview
              </h4>
              <div className="space-y-1 text-xs text-slate-300">
                <p><span className="text-slate-500">Name:</span> {activeResume.extractedData?.name || 'Applicant'}</p>
                <p><span className="text-slate-500">Email:</span> {activeResume.extractedData?.email || 'N/A'}</p>
                <p><span className="text-slate-500">Phone:</span> {activeResume.extractedData?.phone || 'N/A'}</p>
                <p><span className="text-slate-500">Target Role:</span> {activeResume.targetRole}</p>
              </div>
            </div>

            {activeResume.extractedData?.projects?.length > 0 && (
              <div className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-2 md:col-span-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Extracted Projects ({activeResume.extractedData.projects.length})
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {activeResume.extractedData.projects.slice(0, 5).map((proj, idx) => (
                    <li key={idx} className="leading-relaxed">{proj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-10 glass-card rounded-2xl text-center space-y-2 border border-dashed border-slate-800">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No active resume found</p>
          <p className="text-xs text-slate-500">Upload a PDF above to inspect parsed sections and run analysis.</p>
        </div>
      )}
    </div>
  );
};

export default ResumeUploadPage;
