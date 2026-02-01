import React, { useState, useEffect } from 'react';

const NoticeBoard = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'General',
        target_audience: 'All',
        attachment: null
    });

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const canPost = user.role === 'admin' || user.role === 'faculty';

    // Fetch Notices
    const fetchNotices = async () => {
        setLoading(true);
        try {
            let url = `http://localhost:5000/api/notices?type=${filterType}`;
            const res = await fetch(url, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setNotices(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, [filterType]);

    // Handle File Change
    const handleFileChange = (e) => {
        setFormData({ ...formData, attachment: e.target.files[0] });
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        data.append('type', formData.type);
        data.append('target_audience', formData.target_audience);
        if (formData.attachment) {
            data.append('attachment', formData.attachment);
        }

        try {
            const res = await fetch('http://localhost:5000/api/notices', {
                method: 'POST',
                headers: { 'x-auth-token': token }, // Do NOT set Content-Type for FormData, browser does it
                body: data
            });

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ title: '', content: '', type: 'General', target_audience: 'All', attachment: null });
                fetchNotices();
            } else {
                alert('Failed to post notice');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this notice?')) return;
        try {
            await fetch(`http://localhost:5000/api/notices/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            fetchNotices();
        } catch (err) {
            console.error(err);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Exam': return 'bg-red-100 text-red-800 border-red-200';
            case 'Holiday': return 'bg-green-100 text-green-800 border-green-200';
            case 'Event': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Emergency': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <div className="notice-board-container">
            <div className="header-row">
                <h2>📢 Notice Board</h2>
                {canPost && (
                    <button className="post-btn" onClick={() => setIsModalOpen(true)}>
                        + Post Notice
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="tabs">
                {['All', 'General', 'Exam', 'Holiday', 'Event', 'Emergency'].map(type => (
                    <button
                        key={type}
                        className={`tab-btn ${filterType === type ? 'active' : ''}`}
                        onClick={() => setFilterType(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? <div className="loading">Loading notices...</div> : (
                <div className="notices-grid">
                    {notices.length > 0 ? (
                        notices.map(notice => (
                            <div key={notice.id} className="notice-card">
                                <div className="notice-header">
                                    <span className={`notice-type ${getTypeColor(notice.type)}`}>
                                        {notice.type}
                                    </span>
                                    <span className="notice-date">
                                        {new Date(notice.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="notice-title">{notice.title}</h3>
                                <p className="notice-content">{notice.content}</p>

                                <div className="notice-footer">
                                    <div className="author-info">
                                        <span className="author-name">By: {notice.posted_by_name} ({notice.posted_by_role})</span>
                                        {notice.target_audience !== 'All' && (
                                            <span className="audience-tag">To: {notice.target_audience}</span>
                                        )}
                                    </div>

                                    <div className="actions">
                                        {notice.attachment_path && (
                                            <a
                                                href={`http://localhost:5000${notice.attachment_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="attachment-link"
                                            >
                                                📎 Attachment
                                            </a>
                                        )}
                                        {canPost && (user.role === 'admin' || user.id === notice.posted_by_id) && (
                                            <button className="delete-icon" onClick={() => handleDelete(notice.id)}>🗑️</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">No notices found.</div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Post New Notice</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    required
                                    rows="4"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="General">General</option>
                                        <option value="Exam">Exam</option>
                                        <option value="Holiday">Holiday</option>
                                        <option value="Event">Event</option>
                                        <option value="Emergency">Emergency</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Target Audience</label>
                                    <select
                                        value={formData.target_audience}
                                        onChange={e => setFormData({ ...formData, target_audience: e.target.value })}
                                    >
                                        <option value="All">All</option>
                                        <option value="Student">Students Only</option>
                                        <option value="Faculty">Faculty Only</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Attachment (Image/PDF)</label>
                                <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="save-btn">Post Notice</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .notice-board-container { padding: 1rem; }
                .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .header-row h2 { font-size: 1.8rem; color: #1f2937; margin: 0; }
                
                .post-btn {
                    background: var(--primary-color);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
                }
                .post-btn:hover { background: #4338ca; transform: translateY(-1px); }

                .tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 0.5rem; }
                .tab-btn {
                    padding: 0.5rem 1.25rem;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    color: #4b5563;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .tab-btn:hover { background: #f9fafb; border-color: #d1d5db; }
                .tab-btn.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }

                .notices-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
                
                .notice-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f3f4f6;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.2s;
                    position: relative;
                    overflow: hidden;
                }
                .notice-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
                .notice-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 4px;
                    height: 100%;
                    background: var(--primary-color);
                    opacity: 0.5;
                }

                .notice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
                
                /* Tailwind-like utility classes shim for badges */
                .bg-red-100 { background-color: #fee2e2; }
                .text-red-800 { color: #991b1b; }
                .bg-green-100 { background-color: #dcfce7; }
                .text-green-800 { color: #166534; }
                .bg-purple-100 { background-color: #f3e8ff; }
                .text-purple-800 { color: #6b21a8; }
                .bg-yellow-100 { background-color: #fef9c3; }
                .text-yellow-800 { color: #854d0e; }
                .bg-blue-100 { background-color: #dbeafe; }
                .text-blue-800 { color: #1e40af; }
                
                .notice-type {
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .notice-date { font-size: 0.85rem; color: #9ca3af; }

                .notice-title { margin: 0 0 0.75rem 0; font-size: 1.25rem; color: #111827; line-height: 1.4; }
                .notice-content { color: #4b5563; font-size: 0.95rem; line-height: 1.6; flex-grow: 1; margin-bottom: 1.5rem; white-space: pre-wrap; }

                .notice-footer {
                    border-top: 1px solid #f3f4f6;
                    padding-top: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.85rem;
                }
                .author-info { display: flex; flex-direction: column; gap: 0.25rem; }
                .author-name { font-weight: 600; color: #374151; }
                .audience-tag { color: #6b7280; font-style: italic; }

                .actions { display: flex; gap: 1rem; align-items: center; }
                .attachment-link {
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .attachment-link:hover { text-decoration: underline; }
                .delete-icon { background: none; border: none; cursor: pointer; font-size: 1.1rem; opacity: 0.6; transition: opacity 0.2s; }
                .delete-icon:hover { opacity: 1; color: red; }

                /* Modal Styles Reused/Refined */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;
                    z-index: 1000; backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white; padding: 2rem; border-radius: 12px;
                    width: 90%; max-width: 500px;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
                }
                .modal-content h3 { margin-top: 0; color: var(--primary-color); border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem; }
                .form-row { display: flex; gap: 1rem; }
                .form-group { margin-bottom: 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-weight: 600; color: #374151; font-size: 0.9rem; }
                .form-group input, .form-group select, .form-group textarea {
                    padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;
                    font-family: inherit; font-size: 1rem;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    outline: 2px solid var(--primary-color); border-color: transparent;
                }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
                .cancel-btn { background: #f3f4f6; color: #4b5563; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
                .save-btn { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; }

                .empty-state { grid-column: 1 / -1; text-align: center; padding: 3rem; color: #9ca3af; font-size: 1.1rem; border: 2px dashed #e5e7eb; border-radius: 12px; }
            `}</style>
        </div>
    );
};

export default NoticeBoard;
