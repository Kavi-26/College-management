import React, { useState, useEffect } from 'react';

const ResourceBrowser = () => {
    const [resources, setResources] = useState([]);
    const [uploadMode, setUploadMode] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', subject_code: '', department: 'Computer Science', year: 'I' }); // Basic defaults
    const [file, setFile] = useState(null);
    const [filters, setFilters] = useState({ department: '', year: '', subject_code: '' });

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchResources();
    }, [filters]);

    const fetchResources = async () => {
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`http://localhost:5000/api/resources?${query}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setResources(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newItem.title);
        formData.append('subject_code', newItem.subject_code);
        formData.append('department', newItem.department);
        formData.append('year', newItem.year);
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:5000/api/resources/upload', {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData
            });

            if (res.ok) {
                alert('Uploaded Successfully');
                setUploadMode(false);
                fetchResources();
            } else {
                alert('Upload failed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await fetch(`http://localhost:5000/api/resources/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            setResources(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="resource-browser">
            <div className="header-actions">
                <h2>📚 Academic Resources</h2>
                {user.role === 'faculty' && (
                    <button className="primary-btn" onClick={() => setUploadMode(true)}>+ Upload New</button>
                )}
            </div>

            {/* Filters */}
            <div className="filters">
                <select onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
                    <option value="">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                </select>
                <select onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
                    <option value="">All Years</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                </select>
            </div>

            {/* List */}
            <div className="resource-grid">
                {resources.map(res => (
                    <div key={res.id} className="resource-card">
                        <div className="icon">📄</div>
                        <div className="details">
                            <h4>{res.title}</h4>
                            <p>{res.subject_code} • {res.department} - {res.year}</p>
                            <span className="meta">By {res.faculty_name} on {new Date(res.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="actions">
                            <a href={`http://localhost:5000${res.file_path}`} target="_blank" rel="noopener noreferrer" className="download-btn">⬇ Download</a>
                            {user.role === 'faculty' && user.id === res.uploaded_by && (
                                <button onClick={() => handleDelete(res.id)} className="delete-btn">🗑</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Upload Modal */}
            {uploadMode && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Upload Resource</h3>
                        <form onSubmit={handleUpload}>
                            <input type="text" placeholder="Title" required
                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                            <input type="text" placeholder="Subject Code" required
                                onChange={(e) => setNewItem({ ...newItem, subject_code: e.target.value })} />

                            <div className="row">
                                <select onChange={(e) => setNewItem({ ...newItem, department: e.target.value })}>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Electronics">Electronics</option>
                                </select>
                                <select onChange={(e) => setNewItem({ ...newItem, year: e.target.value })}>
                                    <option value="I">I</option>
                                    <option value="II">II</option>
                                    <option value="III">III</option>
                                </select>
                            </div>

                            <input type="file" required onChange={handleFileChange} />

                            <div className="modal-actions">
                                <button type="button" onClick={() => setUploadMode(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .resource-browser { padding: 1rem; }
                .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .primary-btn { background: var(--primary-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
                
                .filters { display: flex; gap: 1rem; margin-bottom: 2rem; }
                .filters select { padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
                
                .resource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
                .resource-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; gap: 1rem; align-items: flex-start; }
                .icon { font-size: 2rem; background: #f3f4f6; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
                .details { flex: 1; }
                .details h4 { margin: 0 0 0.5rem; }
                .details p { margin: 0; color: #6b7280; font-size: 0.9rem; }
                .meta { font-size: 0.8rem; color: #9ca3af; display: block; margin-top: 0.5rem; }
                
                .actions { display: flex; flex-direction: column; gap: 0.5rem; }
                .download-btn { text-decoration: none; color: var(--primary-color); font-weight: 500; font-size: 0.9rem; }
                .delete-btn { background: none; border: none; cursor: pointer; color: #ef4444; }

                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { background: white; padding: 2rem; border-radius: 8px; width: 400px; }
                .modal-content input, .modal-content select { width: 100%; margin-bottom: 1rem; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
                .row { display: flex; gap: 1rem; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
            `}</style>
        </div>
    );
};

export default ResourceBrowser;
