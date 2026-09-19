import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Mic,
  MicOff,
  BookOpen,
  Award,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { interviewApi } from '../services/api';
import ProgressBar from '../components/ProgressBar';
import { AiThinkingState } from '../components/LoadingSkeleton';

const MockInterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSession();
  }, [id]);

  const fetchSession = async () => {
    try {
      const res = await interviewApi.getById(id);
      const s = res.data.session;
      setSession(s);
      setCurrentIdx(s.currentQuestionIndex || 0);

      // If current question already has evaluation, restore it
      const currentQ = s.questions[s.currentQuestionIndex || 0];
      if (currentQ?.evaluation?.overallScore > 0) {
        setEvaluation(currentQ.evaluation);
        setUserAnswer(currentQ.userAnswer || '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load interview session.');
    }
  };

  // Web Speech API for voice dictation
  const handleToggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your answer directly.');
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setUserAnswer((prev) => `${prev} ${transcript}`.trim());
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setIsEvaluating(true);
    setError('');
    const currentQ = session.questions[currentIdx];

    try {
      const res = await interviewApi.submitAnswer(id, currentQ.questionNumber, userAnswer);
      setEvaluation(res.data.evaluation);
    } catch (err) {
      setError(err.message || 'Failed to evaluate answer.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIdx < session.questions.length - 1) {
      const nextIndex = currentIdx + 1;
      setCurrentIdx(nextIndex);
      setEvaluation(null);
      setUserAnswer('');
      setShowModelAnswer(false);
    } else {
      // Completed last question!
      handleCompleteSession();
    }
  };

  const handleCompleteSession = async () => {
    try {
      await interviewApi.complete(id);
      navigate(`/interview/${id}/results`);
    } catch (err) {
      setError(err.message || 'Failed to finalize interview scorecard.');
    }
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <AiThinkingState message="Loading your interactive mock interview session..." />
      </div>
    );
  }

  const currentQ = session.questions[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / session.questions.length) * 100);
  const isLast = currentIdx === session.questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Session Progress Header */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
              {session.targetRole}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-300 capitalize">{session.interviewType} Round</span>
          </div>
          <p className="text-sm font-extrabold text-white">
            Question {currentIdx + 1} of {session.questions.length}
          </p>
        </div>

        <div className="w-full sm:w-48 space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Current Question Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4 border border-brand-primary/30 relative overflow-hidden">
        <div className="glow-primary w-40 h-40 -top-10 -right-10 bg-brand-primary/15" />

        <div className="flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/20 text-indigo-300 border border-brand-primary/30">
            {currentQ.category || 'Engineering Question'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {currentQ.difficulty}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {currentQ.questionText}
        </h2>
      </div>

      {/* Answer Input Section */}
      {!evaluation ? (
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-accent" />
              Your Technical Response
            </label>

            <button
              type="button"
              onClick={handleToggleListening}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isListening
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Voice dictation (speech-to-text convenience)"
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isListening ? 'Stop Recording' : 'Speech-to-Text'}</span>
            </button>
          </div>

          <textarea
            rows={6}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Structure your answer with principles, technical trade-offs, and concrete implementation examples..."
            className="w-full px-4 py-3 rounded-xl bg-dark-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-500">
              Tip: Mention quantifiable trade-offs (e.g., latency, throughput, clock frequencies, power).
            </span>

            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={isEvaluating || !userAnswer.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-brand-primary/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit for AI Rubric Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Answer Feedback Section */
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-emerald-500/30 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-extrabold text-lg">
                {evaluation.overallScore}
                <span className="text-xs text-emerald-300">/10</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Answer Rubric Assessment</h3>
                <p className="text-xs text-slate-400">Evaluated across 4 engineering dimensions</p>
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>{isLast ? 'Complete & Score Interview' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Rubric Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Technical Accuracy</span>
              <p className="text-lg font-bold text-indigo-300">{evaluation.technicalAccuracy}/10</p>
            </div>
            <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Relevance</span>
              <p className="text-lg font-bold text-cyan-300">{evaluation.relevance}/10</p>
            </div>
            <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Completeness</span>
              <p className="text-lg font-bold text-emerald-300">{evaluation.completeness}/10</p>
            </div>
            <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Communication</span>
              <p className="text-lg font-bold text-amber-300">{evaluation.communication}/10</p>
            </div>
          </div>

          {/* Positive vs Constructive Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/25 space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                What You Did Well:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{evaluation.whatWentWell}</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/25 space-y-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                How to Elevate This Answer:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{evaluation.howToImprove}</p>
            </div>
          </div>

          {/* Collapsible Model Answer Drawer */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="w-full p-4 bg-dark-850 hover:bg-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-2 text-brand-accent">
                <BookOpen className="w-4 h-4" />
                {showModelAnswer ? 'Hide Exemplary Model Answer' : 'Reveal Ideal Model Answer Example'}
              </span>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  showModelAnswer ? 'rotate-90' : ''
                }`}
              />
            </button>

            {showModelAnswer && (
              <div className="p-4 bg-dark-900/90 border-t border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                <p className="text-slate-200 italic font-mono bg-dark-850 p-3 rounded-lg border border-slate-800">
                  "{evaluation.betterAnswerExample}"
                </p>
                <p className="text-[11px] text-slate-500">
                  Note: Strive to incorporate structured reasoning, trade-offs, and domain accuracy into future practice attempts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewPage;
