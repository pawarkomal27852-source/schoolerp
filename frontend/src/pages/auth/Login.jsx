import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Input } from '../../components/common/Button';

export const Login = () => {
  const [email, setEmail] = useState('admin@schoolerp.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back, Principal Sharma!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@schoolerp.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle institutional background motifs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#dde1ff]/40 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#86f2e4]/20 blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        {/* Brand Crest */}
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-[#061449] text-white items-center justify-center shadow-lg shadow-[#061449]/15 mb-3">
            <span className="material-symbols-outlined text-[36px]">school</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#061449] tracking-tight font-headline">
            Greenwood Academy
          </h1>
          <p className="text-xs sm:text-sm text-[#45464f] mt-1 font-medium">
            Institutional Administration & Academic Operations Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-sm border border-[#d3e4fe]">
          <div className="mb-5 pb-4 border-b border-[#e5eeff]">
            <h2 className="text-lg font-bold text-[#0b1c30] font-headline">
              Administrator Sign In
            </h2>
            <p className="text-xs text-[#767680] mt-0.5">
              Enter your authorized school credentials to access the console
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs font-semibold flex items-center gap-2 border border-[#ba1a1a]/20">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@schoolerp.com"
              icon="mail"
              required
            />

            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon="lock"
              required
            />

            <div className="flex items-center justify-between text-xs text-[#45464f] pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-[#061449] focus:ring-0 w-4 h-4"
                />
                <span>Remember session</span>
              </label>
              <span className="text-xs font-semibold text-[#006a61]">
                Audit Mode Active
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              icon="login"
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* 1-Click Demo Shortcut */}
          <div className="mt-6 pt-5 border-t border-[#e5eeff] text-center">
            <button
              type="button"
              onClick={fillDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#d3e4fe] text-[#061449] text-xs font-semibold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">key</span>
              <span>Auto-fill Demo Credentials (admin@schoolerp.com)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-[#767680] mt-6">
          SchoolERP v1.4 • Single-Window School Management Platform
        </p>
      </div>
    </div>
  );
};

export default Login;
