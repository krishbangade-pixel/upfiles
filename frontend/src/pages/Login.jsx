import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDrive } from '../context/DriveContext';
import { 
  Cloud, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  ShieldCheck,
  X
} from 'lucide-react';

export const Login = () => {
  const { signIn, resetPassword, addToast } = useDrive();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Reset Password State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState({ type: '', msg: '' });

  const from = location.state?.from?.pathname || '/drive';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const { user, error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('Invalid email or password. Please double-check your credentials.');
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Your email address has not been confirmed yet. Please check your inbox.');
      } else {
        setErrorMsg(error.message || 'Failed to sign in. Please try again.');
      }
    } else {
      const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
      addToast(`Welcome back, ${name}!`);
      navigate(from, { replace: true });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetStatus({ type: '', msg: '' });

    if (!resetEmail) {
      setResetStatus({ type: 'error', msg: 'Please enter your account email address.' });
      return;
    }

    setResetLoading(true);
    const { success, error } = await resetPassword(resetEmail.trim());
    setResetLoading(false);

    if (success) {
      setResetStatus({
        type: 'success',
        msg: 'Password reset link has been sent! Check your inbox for instructions.',
      });
    } else {
      setResetStatus({
        type: 'error',
        msg: error?.message || 'Failed to send reset link. Please verify the email address.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#18191b] text-white flex flex-col justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#316d7a] selection:text-white">
      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2 bg-[#222428] border border-[#34373d] rounded-2xl shadow-md">
            <Cloud className="w-6 h-6 text-[#0084ff] fill-[#0084ff] stroke-none" />
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              Up<span className="text-[#0084ff]">Files</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-gray-300 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-white underline hover:text-gray-200">
              Create an account
            </Link>
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#222428] py-8 px-6 sm:px-10 border border-[#34373d] rounded-2xl sm:rounded-3xl shadow-2xl space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-900/40 border border-rose-700/60 rounded-xl text-xs text-rose-200 font-medium flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
              <button 
                onClick={() => setErrorMsg('')}
                className="text-rose-300 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-white" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#1d1e21] border border-[#34373d] rounded-xl text-white placeholder-gray-400 focus:bg-[#18191b] focus:outline-none focus:border-[#316d7a] focus:ring-1 focus:ring-[#316d7a] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-200">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setIsResetModalOpen(true);
                  }}
                  className="text-xs font-semibold text-gray-200 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-white" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 text-xs bg-[#1d1e21] border border-[#34373d] rounded-xl text-white placeholder-gray-400 focus:bg-[#18191b] focus:outline-none focus:border-[#316d7a] focus:ring-1 focus:ring-[#316d7a] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#34373d] bg-[#1d1e21] text-[#316d7a] focus:ring-[#316d7a] cursor-pointer"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-[#316d7a] hover:bg-[#275863] text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Footer badge */}
          <div className="pt-4 border-t border-[#34373d] text-center flex items-center justify-center gap-1.5 text-[11px] text-gray-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#316d7a]" />
            <span>Secured by Supabase Authentication</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#222428] border border-[#34373d] w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl relative space-y-5 text-white">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-5 right-5 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#316d7a] text-white rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Password</h3>
                <p className="text-xs text-gray-300">We'll send a password recovery link to your email.</p>
              </div>
            </div>

            {resetStatus.msg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2.5 ${
                  resetStatus.type === 'success'
                    ? 'bg-emerald-900/40 border border-emerald-700/60 text-emerald-200'
                    : 'bg-rose-900/40 border border-rose-700/60 text-rose-200'
                }`}
              >
                {resetStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                )}
                <span>{resetStatus.msg}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2 text-xs bg-[#1d1e21] border border-[#34373d] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#316d7a]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 bg-[#316d7a] hover:bg-[#275863] text-white rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

