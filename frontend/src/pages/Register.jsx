import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDrive } from '../context/DriveContext';
import { 
  Cloud, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

export const Register = () => {
  const { signUp, addToast } = useDrive();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Password Validation Criteria
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!fullName || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!hasMinLength) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const { user, session, error } = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);

    if (error) {
      if (error.message.includes('User already registered')) {
        setErrorMsg('An account with this email already exists. Try signing in instead.');
      } else {
        setErrorMsg(error.message || 'Registration failed. Please try again.');
      }
    } else {
      if (session) {
        addToast(`Welcome to CloudDrive, ${fullName}!`);
        navigate('/drive');
      } else if (user) {
        setInfoMsg(
          'Account created! Please check your email inbox to confirm your registration before signing in.'
        );
        addToast('Verification email sent!', 'info');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#18191b] text-white flex flex-col justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#316d7a] selection:text-white">
      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2 bg-[#222428] border border-[#34373d] rounded-2xl shadow-md">
            <Cloud className="w-6 h-6 text-[#316d7a] fill-[#316d7a] stroke-[1.5]" />
            <span className="text-xl font-bold tracking-tight text-white">
              CloudDrive
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Create Your Account
          </h1>
          <p className="text-xs text-gray-300 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#316d7a] hover:text-[#275863] underline">
              Sign in instead
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

          {infoMsg && (
            <div className="p-3.5 bg-emerald-900/40 border border-emerald-700/60 rounded-xl text-xs text-emerald-200 font-medium flex items-start gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">{infoMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                Full Name
              </label>
              <div className="relative group">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-white" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Krish Bangade"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#1d1e21] border border-[#34373d] rounded-xl text-white placeholder-gray-400 focus:bg-[#18191b] focus:outline-none focus:border-[#316d7a] focus:ring-1 focus:ring-[#316d7a] transition-all"
                />
              </div>
            </div>

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
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                Password
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-white" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

              {/* Dynamic Password Feedback */}
              {password && (
                <div className="mt-2 p-2.5 bg-[#1d1e21] border border-[#34373d] rounded-xl space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-400" />
                    )}
                    <span className={hasMinLength ? 'text-white font-medium' : 'text-gray-300'}>
                      At least 6 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-400" />
                    )}
                    <span className={hasNumber ? 'text-white font-medium' : 'text-gray-300'}>
                      Includes a number
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-white" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#1d1e21] border border-[#34373d] rounded-xl text-white placeholder-gray-400 focus:bg-[#18191b] focus:outline-none focus:border-[#316d7a] focus:ring-1 focus:ring-[#316d7a] transition-all"
                />
              </div>

              {confirmPassword && (
                <p className={`text-[11px] mt-1.5 font-semibold ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-2 bg-[#316d7a] hover:bg-[#275863] text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Footer badge */}
          <div className="pt-4 border-t border-[#34373d] text-center flex items-center justify-center gap-1.5 text-[11px] text-gray-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#316d7a]" />
            <span>Encrypted & Powered by Supabase Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
