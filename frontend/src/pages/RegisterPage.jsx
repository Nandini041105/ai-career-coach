import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Briefcase, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TARGET_ROLES = [
  'RTL Design Engineer',
  'FPGA Design Engineer',
  'VLSI Engineer',
  'Physical Design Engineer',
  'Embedded Systems Engineer',
  'Software Engineer',
  'Data/AI Engineer',
  'Other'
];

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('RTL Design Engineer');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password, targetRole);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoFill = () => {
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
    setName('Alex Rivera');
    setEmail(`alex.rivera${randomSuffix}@example.com`);
    setPassword('password123');
    setTargetRole('RTL Design Engineer');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="glow-primary w-48 h-48 -top-10 -right-10 bg-brand-secondary" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary shadow-lg shadow-brand-primary/25 mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create Your Account</h2>
          <p className="text-xs text-slate-400">Join thousands of engineers accelerating their career growth</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Career Role</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700/80 text-sm text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary appearance-none cursor-pointer"
              >
                {TARGET_ROLES.map((role) => (
                  <option key={role} value={role} className="bg-dark-850 text-white">
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500">You can adjust this anytime in your profile.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-brand-primary/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center space-y-3">
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="text-xs text-brand-accent hover:underline font-medium"
          >
            Auto-Fill Sample Credentials
          </button>
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
