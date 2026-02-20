import React, { useState } from 'react';
import { Settings, Moon, Sun, Lock, Eye, EyeOff, Shield, CheckCircle2, XCircle, Info, Palette, KeyRound, Sparkles } from 'lucide-react';

const SettingsView = ({ theme, toggleTheme }) => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const user = JSON.parse(localStorage.getItem('user'));

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMsg({ text: 'New passwords do not match', type: 'error' });
            return;
        }
        try {
            const res = await fetch('http://localhost:5000/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMsg({ text: 'Password changed successfully!', type: 'success' });
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                setMsg({ text: data.message, type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setMsg({ text: 'Server error', type: 'error' });
        }
    };

    return (
        <div className="settings-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-icon">
                    <Settings size={24} />
                </div>
                <div>
                    <h2>Settings</h2>
                    <p className="header-subtitle">Manage your preferences and security</p>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="settings-card" style={{ animationDelay: '0.1s' }}>
                <div className="card-header">
                    <div className="card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <Palette size={20} />
                    </div>
                    <div>
                        <h3>Appearance</h3>
                        <p>Customize the look and feel</p>
                    </div>
                </div>
                <div className="card-body">
                    <div className="setting-row">
                        <div className="setting-info">
                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            <div>
                                <span className="setting-title">Dark Mode</span>
                                <span className="setting-desc">
                                    {theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
                                </span>
                            </div>
                        </div>
                        <button
                            className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}
                            onClick={toggleTheme}
                            aria-label="Toggle dark mode"
                        >
                            <div className="switch-thumb">
                                {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="settings-card" style={{ animationDelay: '0.2s' }}>
                <div className="card-header">
                    <div className="card-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                        <KeyRound size={20} />
                    </div>
                    <div>
                        <h3>Security</h3>
                        <p>Manage your password and account security</p>
                    </div>
                </div>
                <div className="card-body">
                    {msg.text && (
                        <div className={`alert-msg ${msg.type}`}>
                            {msg.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                            <span>{msg.text}</span>
                            <button className="dismiss-btn" onClick={() => setMsg({ text: '', type: '' })}>×</button>
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} className="password-form">
                        {[
                            { key: 'current', label: 'Current Password', placeholder: 'Enter your current password' },
                            { key: 'new', label: 'New Password', placeholder: 'Enter a new password' },
                            { key: 'confirm', label: 'Confirm New Password', placeholder: 'Confirm your new password' },
                        ].map((field) => (
                            <div className="form-field" key={field.key}>
                                <label>{field.label}</label>
                                <div className="field-wrapper">
                                    <Lock size={16} className="field-icon" />
                                    <input
                                        type={showPasswords[field.key] ? 'text' : 'password'}
                                        placeholder={field.placeholder}
                                        value={passwords[field.key]}
                                        onChange={e => setPasswords({ ...passwords, [field.key]: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="eye-btn"
                                        onClick={() => setShowPasswords({ ...showPasswords, [field.key]: !showPasswords[field.key] })}
                                    >
                                        {showPasswords[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button type="submit" className="save-btn">
                            <Shield size={18} />
                            Update Password
                        </button>
                    </form>
                </div>
            </div>

            {/* About Section */}
            <div className="settings-card about-card" style={{ animationDelay: '0.3s' }}>
                <div className="card-header">
                    <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <Info size={20} />
                    </div>
                    <div>
                        <h3>About</h3>
                        <p>Application information</p>
                    </div>
                </div>
                <div className="card-body about-body">
                    <div className="about-logo">
                        <Sparkles size={28} />
                    </div>
                    <h4>Smart College Companion</h4>
                    <span className="version-badge">v1.0.0</span>
                    <p className="copyright">© 2026 SmartCollege. All rights reserved.</p>
                </div>
            </div>

            <style>{`
                .settings-page {
                    max-width: 640px;
                    margin: 0 auto;
                    padding: 0.5rem 0;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                /* Page Header */
                .page-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 0.5rem;
                }
                .header-icon {
                    width: 48px; height: 48px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    color: white;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                .page-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                }
                .header-subtitle {
                    margin: 0.15rem 0 0;
                    font-size: 0.85rem;
                    color: #94a3b8;
                }

                /* Settings Card */
                .settings-card {
                    background: white;
                    border-radius: 18px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                    overflow: hidden;
                    animation: cardSlide 0.4s ease both;
                    transition: box-shadow 0.3s;
                }
                .settings-card:hover {
                    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                }
                @keyframes cardSlide {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .card-icon {
                    width: 42px; height: 42px;
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #1e293b;
                }
                .card-header p {
                    margin: 0.1rem 0 0;
                    font-size: 0.8rem;
                    color: #94a3b8;
                }
                .card-body {
                    padding: 1.5rem;
                }

                /* Setting Row (Toggle) */
                .setting-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .setting-info {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                }
                .setting-info > svg {
                    color: #f59e0b;
                }
                .setting-title {
                    display: block;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #1e293b;
                }
                .setting-desc {
                    display: block;
                    font-size: 0.8rem;
                    color: #94a3b8;
                    margin-top: 0.1rem;
                }

                /* Toggle Switch */
                .toggle-switch {
                    width: 52px; height: 28px;
                    background: #e2e8f0;
                    border-radius: 14px;
                    border: none;
                    cursor: pointer;
                    position: relative;
                    transition: background 0.3s;
                    padding: 0;
                }
                .toggle-switch.active {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                }
                .switch-thumb {
                    width: 22px; height: 22px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 3px; left: 3px;
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                }
                .switch-thumb svg { color: #94a3b8; }
                .toggle-switch.active .switch-thumb {
                    transform: translateX(24px);
                }
                .toggle-switch.active .switch-thumb svg { color: #6366f1; }

                /* Alert Message */
                .alert-msg {
                    display: flex; align-items: center; gap: 0.6rem;
                    padding: 0.85rem 1rem;
                    border-radius: 12px;
                    margin-bottom: 1.25rem;
                    font-size: 0.85rem;
                    font-weight: 500;
                    animation: fadeSlide 0.3s ease;
                }
                @keyframes fadeSlide { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: translateY(0); } }
                .alert-msg.success {
                    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
                    color: #065f46;
                    border: 1px solid #a7f3d0;
                }
                .alert-msg.error {
                    background: linear-gradient(135deg, #fef2f2, #fee2e2);
                    color: #991b1b;
                    border: 1px solid #fecaca;
                }
                .dismiss-btn {
                    margin-left: auto;
                    background: none; border: none;
                    font-size: 1.2rem; cursor: pointer;
                    color: inherit; opacity: 0.5;
                    line-height: 1;
                }

                /* Password Form */
                .password-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.15rem;
                }
                .form-field label {
                    display: block;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.35rem;
                }
                .field-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .field-icon {
                    position: absolute;
                    left: 0.9rem;
                    color: #94a3b8;
                    pointer-events: none;
                    z-index: 1;
                }
                .field-wrapper input {
                    width: 100%;
                    padding: 0.78rem 2.75rem 0.78rem 2.5rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 11px;
                    font-size: 0.88rem;
                    background: #f8fafc;
                    color: #1e293b;
                    transition: all 0.3s;
                }
                .field-wrapper input:focus {
                    outline: none;
                    border-color: #6366f1;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }
                .eye-btn {
                    position: absolute; right: 0.7rem;
                    background: none; border: none;
                    color: #94a3b8; cursor: pointer;
                    padding: 0.2rem;
                    display: flex;
                }
                .eye-btn:hover { color: #6366f1; }

                .save-btn {
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                    border: none;
                    padding: 0.85rem;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
                    margin-top: 0.25rem;
                }
                .save-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
                }
                .save-btn:active {
                    transform: translateY(0);
                }

                /* About */
                .about-body {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 2rem 1.5rem;
                    gap: 0.5rem;
                }
                .about-logo {
                    width: 56px; height: 56px;
                    background: linear-gradient(135deg, #10b981, #059669);
                    border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                    color: white;
                    margin-bottom: 0.25rem;
                    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
                }
                .about-body h4 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1e293b;
                }
                .version-badge {
                    background: #f1f5f9;
                    color: #64748b;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .copyright {
                    margin: 0.5rem 0 0;
                    font-size: 0.8rem;
                    color: #94a3b8;
                }

                /* Responsive */
                @media (max-width: 640px) {
                    .settings-page { padding: 0; }
                    .card-body { padding: 1.25rem; }
                }
            `}</style>
        </div>
    );
};

export default SettingsView;
