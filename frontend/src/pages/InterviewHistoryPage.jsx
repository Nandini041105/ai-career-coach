import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, MessageSquare, ArrowRight, RotateCcw } from 'lucide-react';
import { interviewApi } from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';

const InterviewHistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await interviewApi.getHistory();
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <History className="w-7 h-7 text-brand-primary" />
            Interview Practice History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review past mock interview sessions, scores, and rubrics.
          </p>
        </div>

        <Link
          to="/interview"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New Interview
        </Link>
      </div>

      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session, idx) => (
            <div
              key={session._id}
              className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-white capitalize">
                    Attempt #{sessions.length - idx}: {session.interviewType} Interview
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
                    {session.totalQuestions} Questions
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Target Role: <strong className="text-slate-300">{session.targetRole}</strong> • {new Date(session.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Overall Score</span>
                  <span
                    className={`text-xl font-extrabold ${
                      session.overallInterviewScore >= 75
                        ? 'text-emerald-400'
                        : session.overallInterviewScore >= 50
                        ? 'text-brand-accent'
                        : 'text-amber-400'
                    }`}
                  >
                    {session.overallInterviewScore}/100
                  </span>
                </div>

                <Link
                  to={`/interview/${session._id}/results`}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  Review <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 glass-card rounded-2xl text-center space-y-3 border border-dashed border-slate-800">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Previous Interviews</h3>
          <p className="text-xs text-slate-500">Practice your first role-tailored mock interview today.</p>
          <Link
            to="/interview"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold"
          >
            Start Interview
          </Link>
        </div>
      )}
    </div>
  );
};

export default InterviewHistoryPage;
