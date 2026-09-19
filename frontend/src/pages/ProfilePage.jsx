import React, { useState } from 'react';
import { User, Mail, Briefcase, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';
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

const ProfilePage = () => {
  const { user, updateRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.targetRole || 'Software Engineer');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRoleSave = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMessage('');
    try {
      await updateRole(selectedRole);
      setSuccessMessage('Career target role updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Profile & Preferences</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your account credentials and target role specialization.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-brand-primary" />
          Personal Credentials
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5" /> Full Name
            </span>
            <p className="text-sm font-bold text-white">{user?.name}</p>
          </div>

          <div className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-1">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </span>
            <p className="text-sm font-bold text-white">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleRoleSave} className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-accent" />
            Target Career Role
          </h2>
          <p className="text-xs text-slate-400">
            Changing this updates the AI rubric, technical interview question bank, and roadmap curriculum.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TARGET_ROLES.map((role) => (
              <label
                key={role}
                className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                  selectedRole === role
                    ? 'bg-brand-primary/15 border-brand-primary text-white'
                    : 'bg-dark-850 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{role}</span>
                <input
                  type="radio"
                  name="targetRole"
                  value={role}
                  checked={selectedRole === role}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="hidden"
                />
                {selectedRole === role && <CheckCircle2 className="w-4 h-4 text-brand-accent" />}
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={isUpdating || selectedRole === user?.targetRole}
            className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer"
          >
            {isUpdating ? 'Saving...' : 'Update Target Role'}
          </button>
        </form>

        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Data Privacy: All resumes and mock interview records are isolated to your authenticated account.</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
