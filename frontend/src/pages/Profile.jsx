import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building2, Hash, CalendarDays, BookOpen, Shield, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, XCircle, Briefcase } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [msg, setMsg] = useState({ type: '', content: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/login');
                const res = await axios.get('http://localhost:5000/api/auth/user', {
                    headers: { 'x-auth-token': token }
                });
                setUser(res.data);
            } catch (err) {
                navigate('/login');
            }
        };
        fetchUser();
    }, [navigate]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMsg({ type: 'error', content: 'New passwords do not match' });
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/change-password',
                { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
                { headers: { 'x-auth-token': token } }
            );
            setMsg({ type: 'success', content: 'Password updated successfully!' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMsg({ type: 'error', content: err.response?.data?.message || 'Failed to update password' });
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', text: '#8b5cf6', light: '#ede9fe' };
            case 'faculty': return { bg: 'linear-gradient(135deg, #ec4899, #db2777)', text: '#ec4899', light: '#fce7f3' };
            default: return { bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', text: '#6366f1', light: '#e0e7ff' };
        }
    };

    if (!user) return (
        <div className="profile-loading">
            <div className="loading-pulse"></div>
            <p>Loading profile...</p>
            <style>{`
                .profile-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 1rem; }
                .loading-pulse { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); animation: pulse 1.5s infinite; }
                @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
            `}</style>
        </div>
    );

    const roleStyle = getRoleColor(user.role);

    const detailItems = [
        { icon: Mail, label: 'Email Address', value: user.email, color: '#3b82f6' },
        { icon: Building2, label: 'Department', value: user.department || 'N/A', color: '#8b5cf6' },
        { icon: Hash, label: 'Register No', value: user.reg_no || (user.role === 'faculty' ? user.employee_id : 'N/A'), color: '#f59e0b' },
        ...(user.role === 'student' ? [{ icon: BookOpen, label: 'Year / Section', value: `${user.year || ''} / ${user.section || ''}`, color: '#10b981' }] : []),
        ...(user.role === 'faculty' ? [
            { icon: Briefcase, label: 'Designation', value: user.designation || 'N/A', color: '#10b981' },
            { icon: BookOpen, label: 'Subject', value: user.subject_handled || 'N/A', color: '#ec4899' }
        ] : []),
        { icon: CalendarDays, label: 'Member Since', value: new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), color: '#6366f1' },
    ];

    return (
        <div className="profile-page">
            {/* Hero Header */}
            <div className="profile-hero">
                <div className="hero-bg-pattern"></div>
                <div className="hero-content">
                    <div className="avatar-ring">
                        <div className="avatar-inner">{user.name.charAt(0).toUpperCase()}</div>
                    </div>
                    <h1 className="profile-name">{user.name}</h1>
                    <span className="role-badge">
                        <Shield size={14} />
                        {user.role}
                    </span>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-item ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    <User size={18} />
                    <span>Personal Details</span>
                </button>
                <button
                    className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <Lock size={18} />
                    <span>Security</span>
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-body">
                {msg.content && (
                    <div className={`alert-banner ${msg.type}`}>
                        {msg.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                        <span>{msg.content}</span>
                        <button className="alert-close" onClick={() => setMsg({ type: '', content: '' })}>×</button>
                    </div>
                )}

                {activeTab === 'details' ? (
                    <div className="details-section">
                        {detailItems.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div className="detail-card" key={idx} style={{ '--accent': item.color, animationDelay: `${idx * 0.08}s` }}>
                                    <div className="detail-icon-wrapper">
                                        <Icon size={22} />
                                    </div>
                                    <div className="detail-text">
                                        <span className="detail-label">{item.label}</span>
                                        <span className="detail-value">{item.value}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="security-section">
                        <div className="security-card">
                            <div className="security-header">
                                <Lock size={24} />
                                <div>
                                    <h3>Change Password</h3>
                                    <p>Ensure your account uses a strong password</p>
                                </div>
                            </div>
                            <form onSubmit={handlePasswordChange} className="password-form">
                                {[
                                    { key: 'currentPassword', label: 'Current Password', show: 'current' },
                                    { key: 'newPassword', label: 'New Password', show: 'new' },
                                    { key: 'confirmPassword', label: 'Confirm New Password', show: 'confirm' },
                                ].map((field) => (
                                    <div className="input-group" key={field.key}>
                                        <label>{field.label}</label>
                                        <div className="input-wrapper">
                                            <Lock size={18} className="field-icon" />
                                            <input
                                                type={showPasswords[field.show] ? 'text' : 'password'}
                                                value={passwords[field.key]}
                                                onChange={e => setPasswords({ ...passwords, [field.key]: e.target.value })}
                                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="toggle-visibility"
                                                onClick={() => setShowPasswords({ ...showPasswords, [field.show]: !showPasswords[field.show] })}
                                            >
                                                {showPasswords[field.show] ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button type="submit" className="submit-btn">
                                    <Shield size={18} />
                                    Update Password
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Back Button */}
            <button className="back-button" onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={18} />
                Back to Dashboard
            </button>

            <style>{`
                .profile-page {
                    max-width: 720px;
                    margin: 0 auto;
                    padding: 1.5rem;
                    animation: fadeIn 0.5s ease;
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* Hero Header */
                .profile-hero {
                    background: ${roleStyle.bg};
                    border-radius: 20px;
                    padding: 2.5rem 2rem;
                    position: relative;
                    overflow: hidden;
                    margin-bottom: -2rem;
                    z-index: 1;
                }
                .hero-bg-pattern {
                    position: absolute; inset: 0;
                    background-image:
                        radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 40%);
                }
                .hero-content {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                }
                .avatar-ring {
                    width: 100px; height: 100px;
                    border-radius: 50%;
                    padding: 4px;
                    background: rgba(255,255,255,0.3);
                    backdrop-filter: blur(10px);
                }
                .avatar-inner {
                    width: 100%; height: 100%;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.95);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2.5rem; font-weight: 800;
                    color: ${roleStyle.text};
                    text-transform: uppercase;
                }
                .profile-name {
                    color: white;
                    font-size: 1.75rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin: 0;
                }
                .role-badge {
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(10px);
                    color: white;
                    padding: 0.35rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: capitalize;
                    border: 1px solid rgba(255,255,255,0.3);
                }

                /* Tabs */
                .tab-navigation {
                    display: flex;
                    gap: 0.5rem;
                    background: white;
                    border-radius: 16px;
                    padding: 0.4rem;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                    position: relative;
                    z-index: 2;
                    margin: 0 1rem 1.5rem;
                }
                .tab-item {
                    flex: 1;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    padding: 0.85rem 1rem;
                    border: none; border-radius: 12px;
                    background: transparent;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .tab-item.active {
                    background: ${roleStyle.bg};
                    color: white;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                .tab-item:hover:not(.active) {
                    background: #f1f5f9;
                    color: #334155;
                }

                /* Tab Body */
                .tab-body {
                    min-height: 200px;
                }

                /* Alert Banner */
                .alert-banner {
                    display: flex; align-items: center; gap: 0.75rem;
                    padding: 1rem 1.25rem;
                    border-radius: 14px;
                    margin-bottom: 1.5rem;
                    font-weight: 500;
                    font-size: 0.9rem;
                    animation: slideDown 0.3s ease;
                }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .alert-banner.success {
                    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
                    color: #065f46;
                    border: 1px solid #a7f3d0;
                }
                .alert-banner.error {
                    background: linear-gradient(135deg, #fef2f2, #fee2e2);
                    color: #991b1b;
                    border: 1px solid #fecaca;
                }
                .alert-close {
                    margin-left: auto;
                    background: none; border: none;
                    font-size: 1.25rem; cursor: pointer;
                    color: inherit; opacity: 0.6;
                }

                /* Details Section */
                .details-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .detail-card {
                    display: flex; align-items: center; gap: 1rem;
                    background: white;
                    padding: 1.25rem;
                    border-radius: 14px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: all 0.3s ease;
                    animation: cardIn 0.4s ease both;
                }
                @keyframes cardIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
                .detail-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                    border-color: var(--accent);
                }
                .detail-icon-wrapper {
                    width: 46px; height: 46px;
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    background: color-mix(in srgb, var(--accent) 12%, transparent);
                    color: var(--accent);
                    flex-shrink: 0;
                }
                .detail-text {
                    display: flex; flex-direction: column; gap: 0.2rem;
                }
                .detail-label {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .detail-value {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #1e293b;
                }

                /* Security Section */
                .security-section { max-width: 480px; margin: 0 auto; }
                .security-card {
                    background: white;
                    border-radius: 18px;
                    padding: 2rem;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
                    border: 1px solid #f1f5f9;
                }
                .security-header {
                    display: flex; align-items: flex-start; gap: 1rem;
                    margin-bottom: 1.75rem;
                    padding-bottom: 1.25rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .security-header svg { color: ${roleStyle.text}; margin-top: 2px; }
                .security-header h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
                .security-header p { margin: 0.25rem 0 0; font-size: 0.85rem; color: #94a3b8; }

                .password-form { display: flex; flex-direction: column; gap: 1.25rem; }
                .input-group { display: flex; flex-direction: column; gap: 0.4rem; }
                .input-group label {
                    font-size: 0.8rem; font-weight: 600;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .input-wrapper {
                    position: relative;
                    display: flex; align-items: center;
                }
                .field-icon {
                    position: absolute; left: 1rem;
                    color: #94a3b8;
                    pointer-events: none;
                    z-index: 1;
                }
                .input-wrapper input {
                    width: 100%;
                    padding: 0.85rem 3rem 0.85rem 2.75rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    background: #f8fafc;
                    color: #1e293b;
                    transition: all 0.3s;
                }
                .input-wrapper input:focus {
                    outline: none;
                    border-color: ${roleStyle.text};
                    background: white;
                    box-shadow: 0 0 0 4px ${roleStyle.light};
                }
                .toggle-visibility {
                    position: absolute; right: 0.75rem;
                    background: none; border: none;
                    color: #94a3b8; cursor: pointer;
                    padding: 0.25rem;
                    display: flex;
                }
                .toggle-visibility:hover { color: #64748b; }

                .submit-btn {
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    background: ${roleStyle.bg};
                    color: white;
                    border: none;
                    padding: 0.9rem;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
                    margin-top: 0.5rem;
                }
                .submit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
                }

                /* Back Button */
                .back-button {
                    display: inline-flex; align-items: center; gap: 0.5rem;
                    margin-top: 1.5rem;
                    padding: 0.6rem 1rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    color: #64748b;
                    font-weight: 500;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .back-button:hover {
                    background: #f8fafc;
                    color: #334155;
                    border-color: #cbd5e1;
                }

                /* Responsive */
                @media (max-width: 640px) {
                    .profile-page { padding: 1rem; }
                    .profile-hero { padding: 2rem 1.5rem; }
                    .details-section { grid-template-columns: 1fr; }
                    .tab-navigation { margin: 0 0 1.25rem; }
                    .security-card { padding: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Profile;
