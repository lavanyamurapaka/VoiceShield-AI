import React, { useState } from 'react';
import { 
  Shield, Lock, Mail, User, Phone, Building2, Briefcase, 
  Eye, EyeOff, Check, AlertCircle, ArrowRight, CheckCircle2,
  ShieldCheck, Radio, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AccountRole } from '../types';

export function AuthScreen() {
  const { login, loginWithGoogle, register, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [organization, setOrganization] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [accountRole, setAccountRole] = useState<'USER' | 'ANALYST'>('USER');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');

  // Password strength validation
  const hasMinLength = regPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(regPassword);
  const hasLowercase = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const strengthScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber].filter(Boolean).length;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail, loginPassword, rememberMe);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    const phoneClean = phoneNumber.replace(/[\s-]/g, '');
    if (phoneClean.length < 7 || phoneClean.length > 15) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setErrorMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }
    if (regPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const fullPhoneNumber = `${countryCode} ${phoneNumber.trim()}`;
      await register({
        fullName,
        email: regEmail,
        phoneNumber: fullPhoneNumber,
        organization,
        jobRole,
        accountRole,
        password: regPassword
      });
      setSuccessMessage('Account created successfully. Welcome to VoiceShield AI.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(forgotEmail);
      setSuccessMessage('If an account exists for this email, password reset instructions have been sent.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to process reset request.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for reviewers
  const quickFill = (email: string, roleName: string) => {
    setLoginEmail(email);
    setLoginPassword('VoiceShield#2026');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-blue-600/30 selection:text-blue-300 relative overflow-hidden">
      {/* Background Decorative Tech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl text-white font-bold text-xl shadow-xl shadow-blue-600/30 mb-4 border border-blue-400/30">
            VS
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            VoiceShield AI
          </h1>
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mt-1">
            AI-Powered Voice Impersonation Protection
          </p>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Detect. Verify. Protect.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-zinc-100">Welcome back</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Sign in to your VoiceShield cybersecurity workspace.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 transition">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 transition">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs text-zinc-400">Remember me</span>
                  </label>
                </div>

                <button
                  id="btn-sign-in"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                  {loading ? 'Authenticating...' : 'Sign In'}
                  {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <span className="relative bg-[#111114] px-3 text-[11px] uppercase tracking-wider text-zinc-500 font-mono">
                  or
                </span>
              </div>

              {/* Google Sign-in */}
              <button
                id="btn-google-sign-in"
                type="button"
                onClick={handleGoogleSubmit}
                disabled={loading}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.4 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16C3.7 19.8 7.5 23 12 23z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Pre-seeded credentials chips for easy testing */}
              <div className="mt-6 pt-5 border-t border-zinc-800/80">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2 font-bold">
                  Quick Access Profiles (Password: VoiceShield#2026):
                </span>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => quickFill('user@voiceshield.ai', 'USER')}
                    className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-center transition">
                    <span className="font-bold text-blue-400 block text-[10px]">USER</span>
                    <span className="text-[9px] text-zinc-500 truncate block">user@...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFill('analyst@voiceshield.ai', 'ANALYST')}
                    className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-center transition">
                    <span className="font-bold text-amber-400 block text-[10px]">ANALYST</span>
                    <span className="text-[9px] text-zinc-500 truncate block">analyst@...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickFill('admin@voiceshield.ai', 'ADMIN')}
                    className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-center transition">
                    <span className="font-bold text-emerald-400 block text-[10px]">ADMIN</span>
                    <span className="text-[9px] text-zinc-500 truncate block">admin@...</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <span className="text-xs text-zinc-400">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition">
                  Create account
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: REGISTRATION */}
          {mode === 'register' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-zinc-100">Create your VoiceShield account</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Register enterprise credentials for biometric defense.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      id="reg-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      id="reg-email"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 outline-none focus:border-blue-500 font-mono">
                      <option value="+91">India (+91)</option>
                      <option value="+1">USA (+1)</option>
                      <option value="+44">UK (+44)</option>
                      <option value="+65">Singapore (+65)</option>
                      <option value="+971">UAE (+971)</option>
                    </select>
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        id="reg-phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 transition font-mono"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    Phone number is stored securely in your user profile.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Organization <span className="text-zinc-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="reg-org"
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Apex Cyber"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Job Role <span className="text-zinc-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="reg-jobrole"
                      type="text"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      placeholder="e.g. Threat Analyst"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Role selection: User or Analyst (Admin cannot self register) */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Account Role Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountRole('USER')}
                      className={`p-2.5 rounded-lg border text-left transition ${
                        accountRole === 'USER'
                          ? 'bg-blue-600/10 border-blue-500/50 text-blue-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}>
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>User</span>
                        {accountRole === 'USER' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Live Protection & Detection</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountRole('ANALYST')}
                      className={`p-2.5 rounded-lg border text-left transition ${
                        accountRole === 'ANALYST'
                          ? 'bg-blue-600/10 border-blue-500/50 text-blue-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}>
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>Analyst</span>
                        {accountRole === 'ANALYST' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">SOC Alerts & Forensic Triage</div>
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Admin accounts must be provisioned by a system administrator.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-10 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-zinc-300 transition">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {regPassword.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`flex-1 rounded-full transition-all ${
                              strengthScore >= step
                                ? strengthScore >= 4
                                  ? 'bg-emerald-500'
                                  : strengthScore >= 3
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                                : 'bg-zinc-800'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 text-[10px] text-zinc-400">
                        <span className={hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}>
                          ✓ Min 8 characters
                        </span>
                        <span className={hasUppercase ? 'text-emerald-400' : 'text-zinc-500'}>
                          ✓ Uppercase letter
                        </span>
                        <span className={hasLowercase ? 'text-emerald-400' : 'text-zinc-500'}>
                          ✓ Lowercase letter
                        </span>
                        <span className={hasNumber ? 'text-emerald-400' : 'text-zinc-500'}>
                          ✓ Number included
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
                    <input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-10 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-zinc-300 transition">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-create-account"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <span className="text-xs text-zinc-400">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition">
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {mode === 'forgot-password' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-zinc-100">Reset your password</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Enter your verified account email to receive secure recovery instructions.
                </p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <button
                  id="btn-send-reset"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                  {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition">
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Assurance Footer */}
        <div className="mt-6 text-center text-[11px] font-mono text-zinc-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span>AES-256 Cloud Firestore Encryption • Zero-Trust Biometrics</span>
        </div>
      </div>
    </div>
  );
}
