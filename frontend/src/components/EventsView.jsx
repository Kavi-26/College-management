import React, { useState, useEffect } from 'react';

const EventsView = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [registrations, setRegistrations] = useState([]); // For Admin view of a specific event
    const [viewingEventId, setViewingEventId] = useState(null); // Which event's registrations admin is viewing

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        organizer: ''
    });

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user.role === 'admin';

    // Fetch Events
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/events', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Create Event
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ title: '', description: '', date: '', location: '', organizer: '' });
                fetchEvents();
            } else {
                alert('Failed to create event');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Delete Event
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await fetch(`http://localhost:5000/api/events/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            fetchEvents();
        } catch (err) {
            console.error(err);
        }
    };

    // Register for Event
    const handleRegister = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/events/${id}/register`, {
                method: 'POST',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                alert('Registered successfully!');
                fetchEvents(); // Refresh to update button state
            } else {
                const data = await res.json();
                alert(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // View Registrations (Admin)
    const handleViewRegistrations = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/events/${id}/registrations`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setRegistrations(data);
            setViewingEventId(id);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="events-container">
            <div className="header-row">
                <h2>🎉 Upcoming Events</h2>
                {isAdmin && (
                    <button className="create-btn" onClick={() => setIsModalOpen(true)}>
                        + Create Event
                    </button>
                )}
            </div>

            {loading ? <div className="loading">Loading events...</div> : (
                <div className="events-grid">
                    {events.length > 0 ? (
                        events.map(event => (
                            <div key={event.id} className="event-card">
                                <div className="date-badge">
                                    <span className="month">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="day">{new Date(event.date).getDate()}</span>
                                </div>
                                <div className="event-content">
                                    <h3 className="event-title">{event.title}</h3>
                                    <p className="event-info">📍 {event.location} | 🕒 {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="event-desc">{event.description}</p>
                                    <p className="event-organizer">Organized by: {event.organizer}</p>

                                    <div className="card-actions">
                                        {user.role === 'student' && (
                                            <button
                                                className={`register-btn ${event.is_registered ? 'registered' : ''}`}
                                                onClick={() => !event.is_registered && handleRegister(event.id)}
                                                disabled={event.is_registered}
                                            >
                                                {event.is_registered ? '✓ Registered' : 'Register Now'}
                                            </button>
                                        )}

                                        {isAdmin && (
                                            <div className="admin-actions">
                                                <button className="view-btn" onClick={() => handleViewRegistrations(event.id)}>👥 View {event.registrations_count || ''}</button>
                                                <button className="delete-btn" onClick={() => handleDelete(event.id)}>🗑️</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">No upcoming events. Stay tuned!</div>
                    )}
                </div>
            )}

            {/* Create Event Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Create New Event</h3>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Event Title</label>
                                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea cols="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date & Time</label>
                                    <input type="datetime-local" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Organizer</label>
                                <input type="text" value={formData.organizer} onChange={e => setFormData({ ...formData, organizer: e.target.value })} placeholder="e.g. Cultural Committee" required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="save-btn">Create Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Admin Registrations Viewer Modal */}
            {viewingEventId && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>Registered Students</h3>
                            <button className="close-icon" onClick={() => setViewingEventId(null)}>×</button>
                        </div>
                        <div className="registrations-list">
                            {registrations.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Reg No</th>
                                            <th>Class</th>
                                            <th>Registered At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrations.map(reg => (
                                            <tr key={reg.id}>
                                                <td>{reg.name}</td>
                                                <td>{reg.reg_no}</td>
                                                <td>{reg.department} {reg.year}-{reg.section}</td>
                                                <td>{new Date(reg.registered_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No registrations yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .events-container { padding: 1rem; }
                .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .header-row h2 { font-size: 1.8rem; color: #1f2937; margin: 0; }
                .create-btn { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; }

                .events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
                
                .event-card {
                    background: white; border-radius: 16px; overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex;
                    transition: transform 0.2s; border: 1px solid #f3f4f6;
                }
                .event-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1); }
                
                .date-badge {
                    background: #f3f4f6; padding: 1rem; display: flex; flex-direction: column;
                    align-items: center; justify-content: center; min-width: 80px;
                    border-right: 1px solid #e5e7eb; color: var(--primary-color);
                }
                .date-badge .month { font-size: 0.9rem; font-weight: 700; text-transform: uppercase; }
                .date-badge .day { font-size: 1.8rem; font-weight: 800; line-height: 1; }
                
                .event-content { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
                .event-title { margin: 0 0 0.5rem 0; color: #111827; font-size: 1.25rem; }
                .event-info { color: #6b7280; font-size: 0.9rem; margin-bottom: 0.5rem; }
                .event-desc { color: #4b5563; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1rem; flex-grow: 1; }
                .event-organizer { font-size: 0.85rem; color: #9ca3af; font-style: italic; margin-bottom: 1rem; }
                
                .card-actions { margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
                
                .register-btn { 
                    background: var(--primary-color); color: white; border: none; padding: 0.6rem 1.2rem; 
                    border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; width: 100%;
                }
                .register-btn.registered { background: #d1fae5; color: #065f46; cursor: default; }
                .register-btn:hover:not(.registered) { background: #4338ca; }

                .admin-actions { display: flex; gap: 0.5rem; width: 100%; }
                .view-btn { flex: 1; background: #e5e7eb; color: #374151; border: none; padding: 0.6rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
                .delete-btn { background: #fee2e2; color: #ef4444; border: none; padding: 0.6rem; border-radius: 6px; cursor: pointer; }

                /* Modal Specifics */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); }
                .modal-content { background: white; padding: 2rem; border-radius: 12px; width: 90%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
                .large-modal { max-width: 700px; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; }
                .modal-header h3 { margin: 0; color: var(--primary-color); }
                .close-icon { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280; }
                
                .registrations-list table { width: 100%; border-collapse: collapse; }
                .registrations-list th, .registrations-list td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .registrations-list th { background: #f9fafb; font-weight: 600; color: #374151; }
                
                .empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem; color: #9ca3af; border: 2px dashed #e5e7eb; border-radius: 12px; font-size: 1.1rem; }
            `}</style>
        </div>
    );
};

export default EventsView;
