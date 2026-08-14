import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { FaUserLock, FaEnvelope, FaKey, FaShieldAlt } from 'react-icons/fa';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showForgotInfo, setShowForgotInfo] = useState(false);

  // If already authenticated, redirect immediately to Dashboard
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setIsLoggingIn(true);
    setErrorMsg('');
    const result = await login(data.email, data.password);
    if (!result.success) {
      setErrorMsg(result.error);
      setIsLoggingIn(false);
    } else {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-[85vh] bg-white dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/35 p-8 sm:p-10 shadow-lg text-left relative glass">
        
        {/* Decorative Badge */}
        <div className="w-12 h-12 bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary rounded-2xl flex items-center justify-center mb-6 shadow-sm mx-auto">
          <FaUserLock size={20} />
        </div>

        <h2 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2 leading-none">
          Admin Portal Login
        </h2>
        <p className="text-slate-400 text-[11px] text-center mb-8 uppercase tracking-widest font-semibold">
          SN Infra CMS Portal
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <FaEnvelope size={10} /> Email Address
            </label>
            <input
              type="email"
              placeholder="admin@sninfra.com"
              className={`p-3.5 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none focus:ring-1 focus:ring-secondary border ${
                errors.email ? 'border-red-500' : 'border-transparent dark:border-slate-800'
              }`}
              {...register('email', { 
                required: 'Email address is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
              })}
            />
            {errors.email && <span className="text-[10px] text-red-500">{errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <FaKey size={10} /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              className={`p-3.5 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none focus:ring-1 focus:ring-secondary border ${
                errors.password ? 'border-red-500' : 'border-transparent dark:border-slate-800'
              }`}
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span className="text-[10px] text-red-500">{errors.password.message}</span>}
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 text-red-500 p-3.5 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-secondary hover:bg-secondary-light text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2"
          >
            <FaShieldAlt size={12} />
            {isLoggingIn ? 'Verifying Credentials...' : 'Sign In Securely'}
          </button>
        </form>

        {/* Forgot credentials trigger */}
        <div className="text-center mt-6">
          <button 
            onClick={() => setShowForgotInfo(!showForgotInfo)}
            className="text-[10px] font-semibold text-slate-400 hover:text-secondary"
          >
            Forgot your password?
          </button>
        </div>

        {showForgotInfo && (
          <div className="mt-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed text-left flex gap-2 items-start animate-fade-in">
            <span className="text-blue-500 shrink-0 font-extrabold">ℹ</span>
            <span>
              Default credentials are seeded on first launch: <br />
              <strong>Email:</strong> admin@sninfra.com <br />
              <strong>Password:</strong> SNInfraAdmin2026! <br />
              To change or reset, contact your system administrator or modify database settings.
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
