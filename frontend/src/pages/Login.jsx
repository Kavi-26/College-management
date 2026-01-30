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
    const navigate = useNavigate();

    const { email, password, role } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card card">
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Sign in to Smart College Companion</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Role</label>
                        <div className="role-selector">
                            {['student', 'faculty', 'admin'].map((r) => (
                                <button
                                    type="button"
                                    key={r}
                                    className={`role-btn ${role === r ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, role: r })}
                                >
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            className="input-field"
                            placeholder="name@college.edu"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Sign In
                    </button>
                </form>
            </div>

            <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1rem;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }
        .login-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--text-color);
          text-align: center;
          margin-bottom: 0.5rem;
        }
        .login-subtitle {
          text-align: center;
          color: var(--text-light);
          margin-bottom: 2rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-color);
        }
        .role-selector {
          display: flex;
          gap: 0.5rem;
          background: #f3f4f6;
          padding: 0.25rem;
          border-radius: var(--radius);
        }
        .role-btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          background: transparent;
          border-radius: var(--radius);
          cursor: pointer;
          font-weight: 500;
          color: var(--text-light);
          transition: all 0.2s;
        }
        .role-btn.active {
          background: white;
          color: var(--primary-color);
          box-shadow: var(--shadow-sm);
        }
        .btn-block {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
        }
        .error-msg {
          background-color: #fee2e2;
          color: #ef4444;
          padding: 0.75rem;
          border-radius: var(--radius);
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          text-align: center;
        }
      `}</style>
        </div>
    );
};

export default Login;
