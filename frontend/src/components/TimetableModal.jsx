import React, { useState, useEffect } from 'react';

const TimetableModal = ({ isOpen, onClose, onSave, onDelete, initialData, departments, facultyList }) => {
    if (!isOpen) return null;

    const [subjects, setSubjects] = useState([]);
    const [rooms, setRooms] = useState([]);
    const token = localStorage.getItem('token');

    const [formData, setFormData] = useState({
        day_of_week: 'Monday',
        start_time: '09:00',
        end_time: '10:00',
        subject: '',
        faculty_id: '',
        department: 'BCA',
        year: 'III',
        section: 'A',
        room_no: 'LH-101',
        type: 'Regular'
    });

    // Fetch subjects and rooms
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsRes, roomsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/reference/subjects', { headers: { 'x-auth-token': token } }),
                    fetch('http://localhost:5000/api/reference/rooms', { headers: { 'x-auth-token': token } })
                ]);

                const [subjectsData, roomsData] = await Promise.all([
                    subjectsRes.json(),
                    roomsRes.json()
                ]);

                setSubjects(subjectsData);
                setRooms(roomsData);
            } catch (err) {
                console.error('Failed to fetch modal data:', err);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen, token]);

    useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData });
        } else {
            // Reset for Add mode
            setFormData({
                day_of_week: 'Monday',
                start_time: '09:00',
                end_time: '10:00',
                subject: '',
                faculty_id: facultyList.length > 0 ? facultyList[0].id : '',
                department: departments.length > 0 ? departments[0].code : 'BCA',
                year: 'III',
                section: 'A',
                room_no: rooms.length > 0 ? rooms[0].room_no : 'LH-101',
                type: 'Regular'
            });
        }
    }, [initialData, facultyList, departments, rooms]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{initialData ? 'Edit Class' : 'Add Class'}</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Day</label>
                            <select
                                value={formData.day_of_week}
                                onChange={e => setFormData({ ...formData, day_of_week: e.target.value })}
                            >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d =>
                                    <option key={d} value={d}>{d}</option>
                                )}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Regular">Regular</option>
                                <option value="Lab">Lab</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Time</label>
                            <input
                                type="time"
                                value={formData.start_time}
                                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>End Time</label>
                            <input
                                type="time"
                                value={formData.end_time}
                                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Subject</label>
                        <select
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            required
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(subj => (
                                <option key={subj.id} value={subj.name}>{subj.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Faculty</label>
                        <select
                            value={formData.faculty_id}
                            onChange={e => setFormData({ ...formData, faculty_id: e.target.value })}
                            required
                        >
                            <option value="">Select Faculty</option>
                            {facultyList.map(f => (
                                <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Room No</label>
                            <select
                                value={formData.room_no}
                                onChange={e => setFormData({ ...formData, room_no: e.target.value })}
                            >
                                {rooms.map(room => (
                                    <option key={room.room_no} value={room.room_no}>
                                        {room.room_no} ({room.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        {initialData && (
                            <button type="button" className="delete-btn" onClick={() => onDelete(initialData.id)}>
                                Delete
                            </button>
                        )}
                        <div className="right-actions">
                            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                            <button type="submit" className="save-btn">Save</button>
                        </div>
                    </div>
                </form>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                .modal-content h3 {
                    margin-top: 0;
                    color: var(--primary-color);
                    border-bottom: 2px solid #f3f4f6;
                    padding-bottom: 1rem;
                    margin-bottom: 1.5rem;
                }
                .form-row {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .form-group {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                .form-group label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #4b5563;
                }
                .form-group input, .form-group select {
                    padding: 0.6rem;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 1rem;
                }
                .form-group input:focus, .form-group select:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }
                .modal-actions {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f3f4f6;
                }
                .right-actions {
                    display: flex;
                    gap: 1rem;
                    margin-left: auto;
                }
                button {
                    padding: 0.6rem 1.2rem;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                }
                .save-btn {
                    background-color: var(--primary-color);
                    color: white;
                }
                .save-btn:hover { background-color: #4338ca; }
                .cancel-btn {
                    background-color: #f3f4f6;
                    color: #4b5563;
                }
                .cancel-btn:hover { background-color: #e5e7eb; }
                .delete-btn {
                    background-color: #fee2e2;
                    color: #ef4444;
                }
                .delete-btn:hover { background-color: #fca5a5; }
            `}</style>
        </div>
    );
};

export default TimetableModal;
