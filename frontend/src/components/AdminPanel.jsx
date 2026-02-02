import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
    const [stats, setStats] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [backupMsg, setBackupMsg] = useState('');
    const [newSubject, setNewSubject] = useState({
        code: '', name: '', type: 'Regular', department_code: 'BCA', year_code: 'III'
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchStats();
        fetchSubjects();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/stats', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setStats(data);
        } catch (err) { console.error(err); }
    };

    const fetchSubjects = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/subjects', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setSubjects(data);
        } catch (err) { console.error(err); }
    };

    const handleBackup = async () => {
        try {
            setBackupMsg('Backing up...');
            const res = await fetch('http://localhost:5000/api/admin/backup', {
                method: 'POST',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setBackupMsg(data.message);
            setTimeout(() => setBackupMsg(''), 3000);
        } catch (err) { console.error(err); }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/admin/subjects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(newSubject)
            });
            if (res.ok) {
                alert('Subject added');
                fetchSubjects();
                setNewSubject({ ...newSubject, code: '', name: '' });
            } else {
                const d = await res.json();
                alert(d.message);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteSubject = async (code) => {
        if (!window.confirm(`Delete subject ${code}?`)) return;
        try {
            await fetch(`http://localhost:5000/api/admin/subjects/${code}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            setSubjects(prev => prev.filter(s => s.code !== code));
        } catch (err) { console.error(err); }
    };

    return (
        <div className="admin-panel">
            <h2>🛡️ Admin Dashboard</h2>

            {/* Stats Grid */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card"><h3>👨‍🎓 Students</h3><p>{stats.students}</p></div>
                    <div className="stat-card"><h3>👨‍🏫 Faculty</h3><p>{stats.faculty}</p></div>
                    <div className="stat-card"><h3>📅 Events</h3><p>{stats.events}</p></div>
                    <div className="stat-card"><h3>📢 Notices</h3><p>{stats.notices}</p></div>
                    <div className="stat-card"><h3>📚 Resources</h3><p>{stats.resources}</p></div>
                </div>
            )}

            <div className="divider"></div>

            {/* System Actions */}
            <div className="section">
                <h3>System Actions</h3>
                <div className="action-row">
                    <button className="primary-btn" onClick={handleBackup}>💾 Trigger Database Backup</button>
                    {backupMsg && <span className="success-msg">{backupMsg}</span>}
                </div>
            </div>

            <div className="divider"></div>

            {/* Subject Management */}
            <div className="section two-col">
                <div className="col">
                    <h3>Add New Subject</h3>
                    <form onSubmit={handleAddSubject} className="admin-form">
                        <input type="text" placeholder="Subject Code (e.g., AI-101)" required
                            value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} />
                        <input type="text" placeholder="Subject Name" required
                            value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} />

                        <div className="row">
                            <select value={newSubject.department_code} disabled>
                                <option value="BCA">BCA</option>
                            </select>
                            <select value={newSubject.year_code} onChange={e => setNewSubject({ ...newSubject, year_code: e.target.value })}>
                                <option value="I">I</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                            </select>
                            <select value={newSubject.type} onChange={e => setNewSubject({ ...newSubject, type: e.target.value })}>
                                <option value="Regular">Regular</option>
                                <option value="Lab">Lab</option>
                            </select>
                        </div>
                        <button type="submit" className="secondary-btn">Add Subject</button>
                    </form>
                </div>

                <div className="col table-col">
                    <h3>Existing Subjects ({subjects.length})</h3>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Dept</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.code}</td>
                                        <td>{s.name}</td>
                                        <td>{s.department_code}-{s.year_code}</td>
                                        <td>
                                            <button className="delete-icon" onClick={() => handleDeleteSubject(s.code)}>🗑</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .admin-panel { padding: 1rem; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
                .stat-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center; }
                .stat-card h3 { margin: 0 0 0.5rem; font-size: 0.9rem; color: #6b7280; }
                .stat-card p { margin: 0; font-size: 1.5rem; font-weight: bold; color: var(--primary-color); }
                
                .divider { height: 1px; background: #e5e7eb; margin: 2rem 0; }
                .section h3 { margin-bottom: 1rem; }
                .action-row { display: flex; align-items: center; gap: 1rem; }
                .primary-btn { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-size: 1rem; }
                .secondary-btn { background: #4b5563; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
                .success-msg { color: #10b981; font-weight: bold; }
                
                .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .admin-form { display: flex; flex-direction: column; gap: 1rem; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                .admin-form input, .admin-form select { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; }
                .row { display: flex; gap: 1rem; }
                .row select { flex: 1; }
                
                .table-col { background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-height: 400px; overflow-y: auto; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: left; padding: 0.5rem; border-bottom: 1px solid #e5e7eb; font-size: 0.85rem; color: #6b7280; }
                td { padding: 0.5rem; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem; }
                .delete-icon { background: none; border: none; cursor: pointer; color: #ef4444; }
            `}</style>
        </div>
    );
};

export default AdminPanel;
