import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [msg, setMsg] = useState({ type: '', content: '' });
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
            setMsg({ type: 'success', content: 'Password updated successfully' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMsg({ type: 'error', content: err.response?.data?.message || 'Failed to update password' });
        }
    };

    if (!user) return <div className="loading">Loading...</div>;

    return (
        <div className="profile-container container">
            <div className="card profile-card">
                <div className="profile-header">
                    <div className="avatar-large">{user.name.charAt(0)}</div>
                    <h2>{user.name}</h2>
                    <span className="badge">{user.role}</span>
                </div>

                <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Personal Details</button>
                    <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Security Settings</button>
                </div>

                <div className="tab-content">
                    {msg.content && <div className={`alert ${msg.type}`}>{msg.content}</div>}

                    {activeTab === 'details' ? (
                        <div className="details-grid">
                            <div className="detail-item"><label>Email</label><p>{user.email}</p></div>
                            <div className="detail-item"><label>Department</label><p>{user.department || 'N/A'}</p></div>
                            <div className="detail-item"><label>Register No</label><p>{user.reg_no || 'N/A'}</p></div>
                            <div className="detail-item"><label>Year/Section</label><p>{user.year || ''} / {user.section || ''}</p></div>
                            <div className="detail-item"><label>Joined</label><p>{new Date(user.created_at).toLocaleDateString()}</p></div>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordChange} className="password-form">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} className="input-field" required />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} className="input-field" required />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="input-field" required />
                            </div>
                            <button type="submit" className="btn btn-primary">Update Password</button>
                        </form>
                    )}
                </div>
            </div>
            <button className="btn back-btn" onClick={() => navigate('/dashboard')}>&larr; Back to Dashboard</button>

            <style>{`
        .profile-container { padding: 2rem 1rem; max-width: 800px; }
        .profile-card { padding: 2rem; }
        .profile-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 2rem; }
        .avatar-large { width: 80px; height: 80px; background: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
        .badge { background: #e0e7ff; color: var(--primary-color); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; margin-top: 0.5rem; text-transform: capitalize; }
        .tabs { display: flex; border-bottom: 1px solid #e5e7eb; margin-bottom: 2rem; }
        .tab-btn { flex: 1; padding: 1rem; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-weight: 500; color: var(--text-light); transition: all 0.2s; }
        .tab-btn.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
        .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .detail-item label { display: block; font-size: 0.875rem; color: var(--text-light); margin-bottom: 0.25rem; }
        .detail-item p { font-weight: 500; }
        .alert { padding: 1rem; border-radius: var(--radius); margin-bottom: 1rem; }
        .alert.success { background: #d1fae5; color: #065f46; }
        .alert.error { background: #fee2e2; color: #991b1b; }
        .password-form { max-width: 400px; margin: 0 auto; }
        .form-group { margin-bottom: 1rem; }
        .back-btn { margin-top: 1rem; color: var(--text-light); background: transparent; }
      `}</style>
        </div>
    );
};

export default Profile;
