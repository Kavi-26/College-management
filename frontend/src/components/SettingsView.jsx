import React, { useState } from 'react';

const SettingsView = ({ theme, toggleTheme }) => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [msg, setMsg] = useState({ text: '', type: '' });
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
                setMsg({ text: 'Password changed successfully', type: 'success' });
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
        <div className="settings-view">
            <h2>⚙️ Settings</h2>

            {/* Appearance */}
            <div className="section">
                <h3>Appearance</h3>
                <div className="setting-item">
                    <span>Dark Mode</span>
                    <button className={`toggle-btn ${theme === 'dark' ? 'active' : ''}`} onClick={toggleTheme}>
                        <div className="thumb"></div>
                    </button>
                </div>
            </div>

            <div className="divider"></div>

            {/* Security */}
            <div className="section">
                <h3>Security</h3>
                <form onSubmit={handleChangePassword} className="security-form">
                    <h4>Change Password</h4>
                    <input
                        type="password"
                        placeholder="Current Password"
                        value={passwords.current}
                        onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={passwords.new}
                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={passwords.confirm}
                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        required
                    />
                    <button type="submit" className="primary-btn">Update Password</button>
                    {msg.text && <div className={`msg ${msg.type}`}>{msg.text}</div>}
                </form>
            </div>

            <div className="divider"></div>

            {/* About */}
            <div className="section about">
                <h3>About</h3>
                <p>Smart College Companion v1.0.0</p>
                <p className="sub">© 2026 University of Tech</p>
            </div>

            <style>{`
                .settings-view { padding: 1rem; max-width: 600px; margin: 0 auto; }
                .section { background: var(--bg-card, white); padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .setting-item { display: flex; justify-content: space-between; align-items: center; }
                
                .toggle-btn { 
                    width: 50px; height: 26px; background: #e5e7eb; border-radius: 13px; 
                    position: relative; border: none; cursor: pointer; transition: background 0.3s;
                }
                .toggle-btn.active { background: var(--primary-color); }
                .thumb { 
                    width: 20px; height: 20px; background: white; border-radius: 50%; 
                    position: absolute; top: 3px; left: 3px; transition: transform 0.3s;
                }
                .toggle-btn.active .thumb { transform: translateX(24px); }

                .divider { margin: 2rem 0; height: 1px; }

                .security-form { display: flex; flex-direction: column; gap: 1rem; }
                .security-form input { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 4px; background: var(--bg-input, white); color: var(--text-color); }
                
                .msg { padding: 0.5rem; border-radius: 4px; font-size: 0.9rem; text-align: center; }
                .msg.success { background: #d1fae5; color: #065f46; }
                .msg.error { background: #fee2e2; color: #991b1b; }

                .about { text-align: center; color: #6b7280; }
                .sub { font-size: 0.8rem; margin-top: 0.5rem; }
            `}</style>
        </div>
    );
};

export default SettingsView;
