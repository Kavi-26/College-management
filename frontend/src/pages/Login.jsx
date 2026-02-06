import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, Users, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const { email, password, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'student', icon: GraduationCap, label: 'Student', color: '#6366f1' },
    { value: 'faculty', icon: Users, label: 'Faculty', color: '#ec4899' },
    { value: 'admin', icon: Shield, label: 'Admin', color: '#8b5cf6' }
  ];

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-pattern"></div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Header Section */}
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-box">
              <div className="logo-inner"></div>
            </div>
            <h1 className="brand-title">SmartCollege</h1>
          </div>
          <p className="subtitle">Access your academic portal</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={onSubmit} className="login-form">
          {/* Role Selection */}
          <div className="form-group">
            <label className="section-label">Select Your Role</label>
            <div className="role-selector">
              {roleOptions.map((r) => {
                const IconComponent = r.icon;
                return (
                  <button
                    type="button"
                    key={r.value}
                    className={`role-option ${role === r.value ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, role: r.value })}
                    style={{ '--role-color': r.color }}
                  >
                    <div className="role-icon-wrapper">
                      <IconComponent size={24} />
                    </div>
                    <span className="role-text">{r.label}</span>
                    <div className="selection-indicator"></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Input */}
          <div className="form-group">
            <div className={`input-wrapper ${focusedField === 'email' || email ? 'active' : ''}`}>
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="styled-input"
                required
                disabled={loading}
                autoComplete="email"
                placeholder=" "
              />
              <label htmlFor="email" className="floating-label">
                Email Address
              </label>
              <div className="input-underline"></div>
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <div className={`input-wrapper ${focusedField === 'password' || password ? 'active' : ''}`}>
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="styled-input"
                required
                disabled={loading}
                autoComplete="current-password"
                placeholder=" "
              />
              <label htmlFor="password" className="floating-label">
                Password
              </label>
              <div className="input-underline"></div>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="card-footer">
          <p>Secure access to your academic resources</p>
        </div>
      </div>

      <style>{`
        * { 
          box-sizing: border-box; 
          margin: 0;
          padding: 0;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          position: relative;
          overflow: hidden;
          padding: 2rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Animated Background */
        .background-animation {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: float 20s infinite ease-in-out;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.4), transparent);
          bottom: -150px;
          right: -150px;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 14s;
        }

        .grid-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.3;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -50px) scale(1.1); }
          66% { transform: translate(-50px, 50px) scale(0.9); }
        }

        /* Login Card */
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
          padding: 3rem;
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 10;
          animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .logo-box {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
          animation: logoPulse 3s infinite ease-in-out;
        }

        .logo-inner {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 4px;
          animation: innerRotate 6s infinite linear;
        }

        @keyframes logoPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes innerRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .brand-title {
          font-size: 2.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .subtitle {
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
        }

        /* Error Banner */
        .error-banner {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          border-left: 4px solid #ef4444;
          color: #991b1b;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          animation: shake 0.4s;
          font-size: 0.9rem;
          font-weight: 500;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .section-label {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.9rem;
          letter-spacing: 0.01em;
        }

        /* Role Selection */
        .role-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .role-option {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.25rem 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .role-option::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--role-color), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .role-option:hover {
          border-color: var(--role-color);
          transform: translateY(-3px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .role-option.selected {
          background: linear-gradient(135deg, var(--role-color), color-mix(in srgb, var(--role-color) 80%, black));
          border-color: var(--role-color);
          color: white;
          box-shadow: 0 8px 20px color-mix(in srgb, var(--role-color) 40%, transparent);
          transform: translateY(-2px);
        }

        .role-icon-wrapper {
          position: relative;
          z-index: 1;
        }

        .role-text {
          font-size: 0.875rem;
          font-weight: 600;
          position: relative;
          z-index: 1;
        }

        .selection-indicator {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 80%;
          height: 3px;
          background: white;
          border-radius: 2px 2px 0 0;
          transition: transform 0.3s;
        }

        .role-option.selected .selection-indicator {
          transform: translateX(-50%) scaleX(1);
        }

        /* Input Wrapper */
        .input-wrapper {
          position: relative;
          margin-top: 0.5rem;
        }

        .input-icon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          z-index: 2;
          transition: color 0.3s;
        }

        /* Fix active state for icon when autofilled */
        .styled-input:focus ~ .input-icon,
        .styled-input:not(:placeholder-shown) ~ .input-icon {
           color: #6366f1;
        }

        .styled-input {
          width: 100%;
          padding: 1rem 1.25rem 1rem 3.5rem;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 1rem;
          background: #f8fafc;
          transition: all 0.3s;
          position: relative;
          z-index: 1;
          color: #1e293b;
        }

        .styled-input:focus {
          outline: none;
          background: white;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        /* Autofill Styles Fix */
        .styled-input:-webkit-autofill,
        .styled-input:-webkit-autofill:hover, 
        .styled-input:-webkit-autofill:focus, 
        .styled-input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #f8fafc inset !important;
            -webkit-text-fill-color: #1e293b !important;
            transition: background-color 5000s ease-in-out 0s;
        }

        /* When focused, match white background */
        .styled-input:focus:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 30px white inset !important;
        }

        .floating-label {
          position: absolute;
          left: 3.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 1rem;
          pointer-events: none;
          transition: all 0.3s;
          background: transparent;
          padding: 0 0.25rem;
          z-index: 2;
        }

        /* Float label when focused OR has content (using placeholder-shown trick) */
        .styled-input:focus ~ .floating-label,
        .styled-input:not(:placeholder-shown) ~ .floating-label {
          top: 0;
          left: 3rem;
          font-size: 0.75rem;
          color: #6366f1;
          background: white; /* Matches focused input bg */
          font-weight: 600;
        }

        /* Handling transparency for cleaner look with autofill background match */
        .styled-input:not(:focus):-webkit-autofill ~ .floating-label {
             background: #f8fafc; /* Match non-focused autofill bg */
        }

        .input-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transform: scaleX(0);
          transition: transform 0.3s;
          border-radius: 0 0 14px 14px;
        }

        .input-wrapper.active .input-underline,
        .styled-input:focus ~ .input-underline {
          transform: scaleX(1);
        }

        /* Submit Button */
        .submit-button {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 1.125rem;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          transition: all 0.3s;
          margin-top: 0.5rem;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
          position: relative;
          overflow: hidden;
        }

        .submit-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.2));
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        .submit-button:hover:not(:disabled)::before {
          transform: translateX(100%);
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .card-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }

        .card-footer p {
          color: #64748b;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .card-footer p::before {
          content: '🔒';
          font-size: 1rem;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .login-card {
            padding: 2rem 1.5rem;
          }

          .brand-title {
            font-size: 1.875rem;
          }

          .role-selector {
            grid-template-columns: 1fr;
          }

          .role-option {
            flex-direction: row;
            justify-content: flex-start;
            padding: 1rem 1.25rem;
          }

          .selection-indicator {
            left: 0;
            transform: translateX(0) scaleY(0);
            width: 4px;
            height: 80%;
            top: 50%;
            transform: translateY(-50%) scaleY(0);
          }

          .role-option.selected .selection-indicator {
            transform: translateY(-50%) scaleY(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
