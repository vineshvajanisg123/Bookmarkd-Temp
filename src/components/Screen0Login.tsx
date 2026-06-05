import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Eye, EyeOff, Lock, Mail, User, ShieldAlert, CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface Screen0LoginProps {
  onSuccess: (userData: { email: string; displayName: string; uid: string }) => void;
}

export default function Screen0Login({ onSuccess }: Screen0LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  
  // Fields state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visual eye toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status and error handles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetState = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setSuccessMsg(null);
  };

  const handleActionToggle = () => {
    setIsRegister(!isRegister);
    setError(null);
    setSuccessMsg(null);
  };

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError("Please enter your User Email ID.");
      return;
    }
    if (!password) {
      setError("Please enter your Password.");
      return;
    }
    if (!validateEmail(emailTrimmed)) {
      setError("Please enter a valid format for User Email ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setSuccessMsg("Welcome back to your reading sanctuary!");
      setTimeout(() => {
        onSuccess(data.user);
        resetState();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const nameTrimmed = fullName.trim();
    const emailTrimmed = email.trim();

    if (!nameTrimmed) {
      setError("Full name is required to register.");
      return;
    }
    if (!emailTrimmed) {
      setError("Email ID is required to register.");
      return;
    }
    if (!validateEmail(emailTrimmed)) {
      setError("Please specify a valid Email ID.");
      return;
    }
    if (!password) {
      setError("Please specify a password.");
      return;
    }
    if (password.length < 4) {
      setError("Password is too short (minimum 4 characters).");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and Confirm Password fields must match exactly.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: nameTrimmed,
          email: emailTrimmed,
          password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setSuccessMsg("Your account was successfully registered! Access granted.");
      setTimeout(() => {
        onSuccess(data.user);
        resetState();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] flex flex-col md:flex-row text-[#1E1E1B]">
      
      {/* Decorative Brand Panel on Left (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-[#365947] relative overflow-hidden flex-col justify-between p-12 lg:p-16 select-none">
        {/* Subtle leaf/book geometric elements in background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full border border-white" />
          <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full border border-white" />
          <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full border border-white" />
        </div>

        {/* Top brand signature */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
            <BookOpen className="text-[#365947] w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-white tracking-tight leading-none">
              Bookmarkd
            </h1>
            <span className="block text-[8px] uppercase tracking-widest text-[#E8E2D8] font-mono leading-none mt-1">
              SANCTUARY SYSTEM
            </span>
          </div>
        </div>

        {/* Beautiful atmospheric editorial header */}
        <div className="my-auto py-12 max-w-md relative z-10 space-y-6">
          <span className="inline-block text-[10px] font-mono uppercase tracking-widest bg-white/10 text-white/90 px-3 py-1 rounded-full border border-white/20">
            Now Entering
          </span>
          <h2 className="font-serif text-3xl lg:text-4xl text-white font-semibold leading-tight tracking-tight">
            “The reading of all good books is like normal conversation with the finest minds.”
          </h2>
          <div className="h-px bg-white/20 w-16" />
          <p className="text-sm font-serif text-[#EAE6DF] leading-relaxed italic">
            Identify your structural literary DNA, map your cognitive blueprints, and wander the custom-tailored stacks of our catalog. Your secure sanctuary retreats await.
          </p>
        </div>

        {/* Bottom meta stats */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#FAF6F0]/80 uppercase tracking-wider">
          <span>PORT 3000 INGRESS</span>
          <span>© BOOKMARKD INTERNAL</span>
        </div>
      </div>

      {/* Main Form Panel on Right */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-24 overflow-y-auto">
        
        {/* Mobile Header Logo (Visible only on mobile) */}
        <div className="md:hidden flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-[#365947] flex items-center justify-center shadow-xs">
            <BookOpen className="text-white w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-md text-[#1E1E1B] tracking-tight leading-none">
              Bookmarkd
            </h1>
            <span className="block text-[7px] uppercase tracking-widest text-[#5E5A55] font-mono leading-none mt-0.5">
              SANCTUARY SYSTEM
            </span>
          </div>
        </div>

        {/* Outer Form Workspace centered */}
        <div className="my-auto max-w-md w-full mx-auto space-y-8">
          
          <div className="space-y-2">
            <h3 className="font-serif font-semibold text-2xl sm:text-3xl tracking-tight text-[#1E1E1B]">
              {isRegister ? "Create reading passport" : "Unlock your sanctuary"}
            </h3>
            <p className="text-xs sm:text-sm text-[#5E5A55] font-serif leading-relaxed">
              {isRegister
                ? "Prepare a persistent virtual reading profile to track your analyzed DNA blueprints."
                : "Enter your registered credentials to step back into your custom library refuge."}
            </p>
          </div>

          {/* Validation Feedbacks */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-xs text-red-700 font-sans"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-normal">{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 bg-[#365947]/10 border border-[#365947]/30 rounded-lg flex items-start gap-3 text-xs text-[#365947] font-sans"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-normal">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Interactive Forms switches */}
          {!isRegister ? (
            // ================= LOGIN FORM =================
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* User Email ID */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5E5A55] font-bold">
                  User Email ID
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A29E99]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="login-email-input"
                    type="text"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E2D8] rounded-xl text-sm text-[#1E1E1B] placeholder-[#A19D98] focus:outline-hidden focus:border-[#E07A5F] transition-all font-sans"
                    required
                  />
                </div>
              </div>

              {/* Password Container */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5E5A55] font-bold font-sans">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A29E99]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="login-password-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-3 bg-white border border-[#E8E2D8] rounded-xl text-sm text-[#1E1E1B] placeholder-[#A19D98] focus:outline-hidden focus:border-[#E07A5F] transition-all font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A29E99] hover:text-[#5E5A55] p-1 rounded-sm cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#E07A5F] hover:bg-[#D0694D] text-white rounded-full font-serif font-semibold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          ) : (
            // ================= REGISTRATION FORM =================
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              {/* Full Name field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5E5A55] font-bold">
                  Full name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A29E99]">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="register-fullname"
                    type="text"
                    placeholder="Aurelius Logan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E2D8] rounded-xl text-sm text-[#1E1E1B] placeholder-[#A19D98] focus:outline-hidden focus:border-[#E07A5F] transition-all font-sans"
                    required
                  />
                </div>
              </div>

              {/* Email ID field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5E5A55] font-bold">
                  Email ID
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A29E99]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="register-email"
                    type="text"
                    placeholder="your.email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E2D8] rounded-xl text-sm text-[#1E1E1B] placeholder-[#A19D98] focus:outline-hidden focus:border-[#E07A5F] transition-all font-sans"
                    required
                  />
                </div>
              </div>

              {/* Password encrypted & hidden field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5E5A55] font-bold">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A29E99]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Make it secure"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-3 bg-white border border-[#E8E2D8] rounded-xl text-sm text-[#1E1E1B] placeholder-[#A19D98] focus:outline-hidden focus:border-[#E07A5F] transition-all font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A29E99] hover:text-[#5E5A55] p-1 rounded-sm cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password encrypted & hidden field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-[#5E5A55] font-bold">
                  Confirm password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A29E99]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-11 py-3 bg-white border border-[#E8E2D8] rounded-xl text-sm text-[#1E1E1B] placeholder-[#A19D98] focus:outline-hidden focus:border-[#E07A5F] transition-all font-sans"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A29E99] hover:text-[#5E5A55] p-1 rounded-sm cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Register Action CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#365947] hover:bg-[#2A4738] text-white rounded-full font-serif font-semibold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing code...
                  </>
                ) : (
                  "Register"
                )}
              </button>
            </form>
          )}

          {/* Form switcher footer toggle */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#5E5A55] font-serif">
              {isRegister ? "Already have a passport? " : "New literary traveler? "}
              <button
                id="auth-toggle-button"
                onClick={handleActionToggle}
                disabled={loading}
                className="font-bold text-[#E07A5F] hover:text-[#D0694D] hover:underline bg-transparent border-none p-0 cursor-pointer transition-colors"
              >
                {isRegister ? "Sign In" : "Register here"}
              </button>
            </p>
          </div>
        </div>

        {/* Backdoor indicator for standard user testing fallback */}
        <div className="pt-8 border-t border-[#E8E2D8]/85 text-center mt-8">
          <p className="text-[10px] font-mono text-[#A29E99] uppercase tracking-widest leading-relaxed">
            🌿 Sandbox Testing Doorway Credentials
          </p>
          <div className="mt-1 inline-flex items-center gap-1.5 bg-[#365947]/5 border border-[#365947]/10 rounded-md px-3 py-1 font-mono text-[9px] text-[#2C483A]">
            <span className="text-[#5E5A55] font-sans">User Email ID:</span>
            <span className="font-bold text-[#E07A5F]">test@test.com</span>
            <span className="text-[#A29E99]/60 px-0.5">|</span>
            <span className="text-[#5E5A55] font-sans">Password:</span>
            <span className="font-bold text-[#E07A5F]">test</span>
          </div>
        </div>

      </div>

    </div>
  );
}
