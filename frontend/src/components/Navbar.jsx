import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  FileText,
  Briefcase,
  Layers,
  Map,
  MessageSquare,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

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

const Navbar = () => {
  const { user, isAuthenticated, logout, updateRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleChange = async (newRole) => {
    try {
      await updateRole(newRole);
      setRoleDropdownOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Resume', path: '/resume', icon: FileText },
    { name: 'Job Matcher', path: '/jobs', icon: Briefcase },
    { name: 'Skill Gaps', path: '/skill-gaps', icon: Layers },
    { name: 'Roadmap', path: '/roadmap', icon: Map },
    { name: 'Interview Coach', path: '/interview', icon: MessageSquare }
  ];

  return (
    <header className="sticky top-0 z-40 bg-dark-900/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              CareerCoach<span className="text-brand-accent">.AI</span>
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Resume • Match • Interview
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-brand-primary/15 text-indigo-300 font-semibold border border-brand-primary/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Section: Role Badge & User Account */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Role Switcher Pill */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors shadow-sm"
                  title="Click to switch your career target role"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                  <span className="max-w-[140px] truncate">{user?.targetRole || 'Select Role'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-dark-850 border border-slate-700/80 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
                      Target Career Role
                    </div>
                    {TARGET_ROLES.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleRoleChange(role)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                          user?.targetRole === role ? 'text-brand-accent font-semibold bg-brand-accent/10' : 'text-slate-300'
                        }`}
                      >
                        {role}
                        {user?.targetRole === role && <span className="text-brand-accent">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-9 h-9 rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-sm font-bold text-indigo-300 hover:bg-brand-primary/30 transition-colors"
                >
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-dark-850 border border-slate-700/80 shadow-2xl py-1 z-50">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-primary/25 hover:opacity-95 transition-opacity"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          {isAuthenticated && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-accent/15 text-brand-accent font-medium border border-brand-accent/25">
              {user?.targetRole?.split(' ')[0]}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-dark-850 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="py-2 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-brand-accent">{user?.targetRole}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="text-xs text-rose-400 font-medium px-2 py-1 rounded bg-rose-500/10"
                >
                  Logout
                </button>
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
                  >
                    <Icon className="w-4 h-4 text-brand-primary" />
                    {link.name}
                  </Link>
                );
              })}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                <User className="w-4 h-4 text-brand-accent" />
                Account Settings
              </Link>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 rounded-lg bg-slate-800 text-sm font-medium text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 rounded-lg bg-brand-primary text-sm font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
