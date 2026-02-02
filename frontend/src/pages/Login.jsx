import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Header Section */}
        <div className="login-header">
          <div className="logo-wrapper">
            <div className="logo-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
            <h1 className="logo-title">SmartCollege</h1>
          </div>
          <p className="welcome-text">Welcome back! Sign in to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-alert">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={onSubmit} className="login-form">
          {/* Role Selection */}
          <div className="form-section">
            <label className="form-label">Select Your Role</label>
            <div className="role-grid">
              {[
                { value: 'student', icon: '👨‍🎓', label: 'Student' },
                { value: 'faculty', icon: '👨‍🏫', label: 'Faculty' },
                { value: 'admin', icon: '👔', label: 'Admin' }
              ].map((r) => (
                <button
                  type="button"
                  key={r.value}
                  className={`role-card ${role === r.value ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: r.value })}
                >
                  <span className="role-icon">{r.icon}</span>
                  <span className="role-label">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div className="form-section">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-group">
              <div className="input-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                className="form-input"
                required
                disabled={loading}
                autoComplete="email"
              />
              <div className={`input-border ${email ? 'active' : ''}`}></div>
            </div>
          </div>

          {/* Password Input */}
          <div className="form-section">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-group">
              <div className="input-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                className="form-input"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <div className={`input-border ${password ? 'active' : ''}`}></div>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
          padding: 1.5rem;
        }

        /* Animated Background */
        .background-animation {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 0.6;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          backdrop-filter: blur(10px);
        }

        .shape-1 {
          width: 300px;
          height: 300px;
          top: -100px;
          left: -100px;
          animation: float1 20s infinite ease-in-out;
        }

        .shape-2 {
          width: 200px;
          height: 200px;
          top: 50%;
          right: -50px;
          animation: float2 15s infinite ease-in-out;
        }

        .shape-3 {
          width: 250px;
          height: 250px;
          bottom: -80px;
          left: 30%;
          animation: float3 18s infinite ease-in-out;
        }

        .shape-4 {
          width: 150px;
          height: 150px;
          top: 20%;
          right: 20%;
          animation: float4 12s infinite ease-in-out;
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(50px, 50px) rotate(180deg); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-30px, -40px) rotate(-180deg); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.1); }
        }

        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, 30px) rotate(90deg); }
        }

        /* Login Card */
        .login-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          padding: 2.5rem;
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 10;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .logo-circle {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          animation: pulse 2s infinite;
        }

        .logo-circle svg {
          width: 28px;
          height: 28px;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .logo-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .welcome-text {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0;
        }

        /* Error Alert */
        .error-alert {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          border: 1px solid #fca5a5;
          color: #991b1b;
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          animation: shake 0.5s;
        }

        .error-alert svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          letter-spacing: 0.025em;
        }

        /* Role Selection */
        .role-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .role-card {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .role-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #667eea, #764ba2);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .role-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .role-card.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: #667eea;
          color: white;
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        }

        .role-icon {
          font-size: 1.75rem;
          position: relative;
          z-index: 1;
        }

        .role-label {
          font-size: 0.875rem;
          font-weight: 600;
          position: relative;
          z-index: 1;
        }

        /* Input Group */
        .input-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          z-index: 2;
          transition: color 0.3s;
        }

        .input-icon svg {
          width: 20px;
          height: 20px;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          background: #f9fafb;
          transition: all 0.3s;
          position: relative;
          z-index: 1;
        }

        .form-input:focus {
          outline: none;
          background: white;
          border-color: #667eea;
        }

        .form-input:focus + .input-border {
          transform: scaleX(1);
        }

        .form-input:focus ~ .input-icon {
          color: #667eea;
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-border {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transform: scaleX(0);
          transition: transform 0.3s;
          border-radius: 0 0 12px 12px;
        }

        /* Submit Button */
        .submit-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s;
          margin-top: 0.5rem;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .submit-btn svg {
          width: 20px;
          height: 20px;
        }

        .spinner {
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

        /* Demo Info */
        .demo-info {
          margin-top: 2rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 1px solid #fcd34d;
          border-radius: 12px;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .info-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
        }

        .info-content strong {
          display: block;
          color: #92400e;
          font-size: 0.875rem;
          margin-bottom: 0.375rem;
        }

        .info-content p {
          margin: 0;
          color: #78350f;
          font-size: 0.8125rem;
          line-height: 1.5;
        }

        .password-hint {
          margin-top: 0.25rem !important;
          font-weight: 600;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .login-card {
            padding: 2rem 1.5rem;
          }

          .logo-title {
            font-size: 1.75rem;
          }

          .role-grid {
            grid-template-columns: 1fr;
          }

          .role-card {
            flex-direction: row;
            justify-content: center;
            padding: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
