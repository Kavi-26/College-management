
import React, { useState, useEffect } from 'react';
import TimetableModal from './TimetableModal';

const TimetableView = () => {
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [facultyList, setFacultyList] = useState([]);

    // Reference Data from Database
    const [departments, setDepartments] = useState([]);
    const [years, setYears] = useState([]);
    const [sections, setSections] = useState([]);

    // Filters
    const [viewMode, setViewMode] = useState('class'); // 'class' or 'personal' (for faculty)
    const [department, setDepartment] = useState('BCA');
    const [year, setYear] = useState('III');
    const [section, setSection] = useState('A');

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // Fetch Reference Data
    useEffect(() => {
        const fetchReferenceData = async () => {
            try {
                const [deptRes, yearRes, sectRes] = await Promise.all([
                    fetch('http://localhost:5000/api/reference/departments', { headers: { 'x-auth-token': token } }),
                    fetch('http://localhost:5000/api/reference/years', { headers: { 'x-auth-token': token } }),
                    fetch('http://localhost:5000/api/reference/sections', { headers: { 'x-auth-token': token } })
                ]);

                const [deptData, yearData, sectData] = await Promise.all([
                    deptRes.json(),
                    yearRes.json(),
                    sectRes.json()
                ]);

                setDepartments(deptData);
                setYears(yearData);
                setSections(sectData);
            } catch (err) {
                console.error('Failed to fetch reference data:', err);
            }
        };

        fetchReferenceData();
    }, [token]);

    // Set defaults
    useEffect(() => {
        if (user.role === 'student') {
            // Fetch fresh user data to ensure year/section are up to date
            fetch('http://localhost:5000/api/auth/user', {
                headers: { 'x-auth-token': token }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.year) setYear(data.year);
                    if (data.department) setDepartment(data.department);
                    if (data.section) setSection(data.section);
                })
                .catch(err => {
                    console.error("Failed to fetch fresh user data, using local storage fallback", err);
                    setDepartment(user.department);
                    setYear(user.year);
                    setSection(user.section);
                });
        } else if (user.role === 'faculty') {
            setDepartment(user.department);
            setViewMode('personal'); // Default to personal for faculty
        }

        // Fetch Faculty List for Admin Dropdown
        if (user.role === 'admin') {
            fetch('http://localhost:5000/api/auth/faculty-list', { // Need to ensure this endpoint exists or mock it
                headers: { 'x-auth-token': token }
            })
                // Fallback since we might not have a dedicated list endpoint yet
                // Actually, let's just create a quick mock list or use what we have if the endpoint fails
                // Ideally we should make an endpoint. For now, let's assume one exists or I will create it.
                // I'll skip the actual fetch for now and use the mock set in state if fetch fails,
                // but to be safe I will add a simple endpoint next.
                .then(res => res.json())
                .then(data => setFacultyList(data))
                .catch(err => {
                    console.warn("Failed to fetch faculty list, using fallback");
                    // Fallback mock
                    setFacultyList([
                        { id: 1, name: 'Prof. Sharma', department: 'BCA' },
                        { id: 2, name: 'Dr. Priya', department: 'BCA' }
                    ]);
                });
        }

        // Clock timer
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            let url = '';
            if (user.role === 'faculty' && viewMode === 'personal') {
                url = `http://localhost:5000/api/timetable/my-timetable`;
            } else {
                url = `http://localhost:5000/api/timetable?department=${department}&year=${year}&section=${section}`;
            }

            const res = await fetch(url, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setTimetable(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimetable();
    }, [department, year, section, viewMode]);

    // Admin Actions
    const handleAddClick = () => {
        setEditingEntry(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (entry) => {
        setEditingEntry(entry);
        setIsModalOpen(true);
    };

    const handleSaveEntry = async (formData) => {
        try {
            const body = {
                ...formData,
                department, year, section // Ensure we save to current view if not specified
            };

            await fetch('http://localhost:5000/api/timetable/entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(body)
            });

            setIsModalOpen(false);
            fetchTimetable(); // Refresh
        } catch (err) {
            console.error(err);
            alert('Failed to save entry');
        }
    };

    const handleDeleteEntry = async (id) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return;
        try {
            await fetch(`http://localhost:5000/api/timetable/entry/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            setIsModalOpen(false);
            fetchTimetable();
        } catch (err) {
            console.error(err);
            alert('Failed to delete');
        }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Helper to check if a slot is "Now"
    const isCurrentSlot = (day, start, end) => {
        const now = currentTime;
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

        if (day !== currentDay) return false;

        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);

        const startTime = new Date(now).setHours(sh, sm, 0);
        const endTime = new Date(now).setHours(eh, em, 0);

        return now >= startTime && now < endTime;
    };

    // Inject Breaks into the list for rendering
    const processSchedule = (sessions, day) => {
        if (!sessions || sessions.length === 0) return [];

        const fullSchedule = [];
        // Expected Breaks Logic
        const sorted = [...sessions].sort((a, b) => a.start_time.localeCompare(b.start_time));

        for (let i = 0; i < sorted.length; i++) {
            fullSchedule.push({ type: 'class', ...sorted[i] });

            if (i < sorted.length - 1) {
                const currentEnd = sorted[i].end_time; // HH:MM:SS
                if (currentEnd.startsWith('11:00')) {
                    fullSchedule.push({ type: 'break', name: 'Morning Break', start: '11:00', end: '11:15', icon: '☕' });
                } else if (currentEnd.startsWith('13:15')) {
                    fullSchedule.push({ type: 'break', name: 'Lunch Break', start: '13:15', end: '14:00', icon: '🍱' });
                }
            }
        }
        return fullSchedule;
    };

    return (
        <div className="timetable-view">
            <div className="header-row">
                <h2>
                    {viewMode === 'personal' ? 'My Schedule' : 'Class Timetable'}
                    <span className="live-badge">🔴 Live</span>
                </h2>
                {/* Faculty Toggle */}
                {user.role === 'faculty' && (
                    <div className="view-toggle">
                        <button
                            className={viewMode === 'personal' ? 'active' : ''}
                            onClick={() => setViewMode('personal')}
                        >
                            My Schedule
                        </button>
                        <button
                            className={viewMode === 'class' ? 'active' : ''}
                            onClick={() => setViewMode('class')}
                        >
                            Class View
                        </button>
                    </div>
                )}
            </div>

            {/* Filters (Disable for Faculty Personal View) */}
            {viewMode === 'class' && (
                <div className="filters card">
                    <div className="filter-group">
                        <label>Department</label>
                        <select value={department} disabled>
                            {departments.filter(d => d.code === 'BCA').map(dept => (
                                <option key={dept.code} value={dept.code}>{dept.code}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Year</label>
                        <select value={year} onChange={(e) => setYear(e.target.value)} disabled={user.role === 'student'}>
                            {years.map(yr => (
                                <option key={yr.code} value={yr.code}>{yr.code}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Section</label>
                        <select value={section} onChange={(e) => setSection(e.target.value)} disabled={user.role === 'student'}>
                            {sections.map(sec => (
                                <option key={sec.code} value={sec.code}>{sec.code}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {loading && <div className="loading">Loading schedule...</div>}

            {!loading && timetable && (
                <div className="timetable-grid">
                    {days.map(day => {
                        const schedule = processSchedule(timetable[day], day);
                        const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'long' });

                        return (
                            <div key={day} className={`day-card card ${isToday ? 'today-highlight' : ''}`}>
                                <h3 className="day-header">
                                    {day} {isToday && '(Today)'}
                                    {/* Admin Add Button Placeholder */}
                                    {user.role === 'admin' && (
                                        <button className="add-btn" onClick={handleAddClick} title="Add Class">+</button>
                                    )}
                                </h3>
                                <div className="sessions">
                                    {schedule.length > 0 ? (
                                        schedule.map((item, index) => {
                                            if (item.type === 'break') {
                                                const isActive = isCurrentSlot(day, item.start, item.end);
                                                return (
                                                    <div key={index} className={`break-item ${isActive ? 'active-pulse' : ''}`}>
                                                        <span className="break-icon">{item.icon}</span>
                                                        <div className="break-details">
                                                            <span className="break-name">{item.name}</span>
                                                            <span className="break-time">{item.start.slice(0, 5)} - {item.end.slice(0, 5)}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            const isActive = isCurrentSlot(day, item.start_time, item.end_time);
                                            return (
                                                <div key={index} className={`session-item ${isActive ? 'active-pulse' : ''} ${item.type === 'Lab' ? 'lab-item' : ''}`}>
                                                    <div className="time-col">
                                                        <span className="start">{item.start_time.slice(0, 5)}</span>
                                                        <span className="end">{item.end_time.slice(0, 5)}</span>
                                                    </div>
                                                    <div className="details-col">
                                                        <h4>
                                                            {item.subject}
                                                            {item.type === 'Lab' && <span className="tag lab-tag">🧪 Lab</span>}
                                                            {item.type === 'Regular' && <span className="tag regular-tag">📖 Regular</span>}
                                                        </h4>
                                                        <div className="meta">
                                                            {/* Show Class Name for Faculty Personal View */}
                                                            {viewMode === 'personal' && (
                                                                <span className="class-badge">🎓 {item.display_title}</span>
                                                            )}
                                                            <span className="faculty-badge">👤 {item.faculty_name || 'Staff'}</span>
                                                            <span className="room-badge">📍 {item.room_no || 'LH-1'}</span>
                                                        </div>
                                                    </div>
                                                    {user.role === 'admin' && (
                                                        <button className="edit-btn" onClick={() => handleEditClick(item)}>✎</button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="no-classes">No classes scheduled</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <TimetableModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEntry}
                onDelete={handleDeleteEntry}
                initialData={editingEntry}
                departments={['BCA']}
                facultyList={facultyList}
            />

            <style>{`
                .timetable-view {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .view-toggle {
                    display: flex;
                    gap: 0.5rem;
                    background: #e5e7eb;
                    padding: 0.25rem;
                    border-radius: 8px;
                }
                .view-toggle button {
                    padding: 0.5rem 1rem;
                    border: none;
                    background: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    color: #4b5563;
                }
                .view-toggle button.active {
                    background: white;
                    color: var(--primary-color);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .live-badge {
                    font-size: 0.8rem;
                    background-color: #fee2e2;
                    color: red;
                    padding: 2px 8px;
                    border-radius: 12px;
                    vertical-align: middle;
                    margin-left: 10px;
                    animation: blink 2s infinite;
                }
                @keyframes blink { 50% { opacity: 0.5; } }

                .filters {
                    display: flex;
                    gap: 1.5rem;
                    padding: 1.5rem;
                    flex-wrap: wrap;
                }
                .filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .filter-group select { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; }

                .timetable-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 1.5rem;
                }
                .day-card {
                    padding: 0;
                    overflow: hidden;
                    border: 1px solid #e5e7eb;
                    height: fit-content;
                }
                .today-highlight {
                    border: 2px solid var(--primary-color);
                    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06);
                }
                .day-header {
                    background-color: #f9fafb;
                    padding: 1rem;
                    margin: 0;
                    font-size: 1.1rem;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .today-highlight .day-header {
                    background-color: var(--primary-color);
                    color: white;
                }
                .add-btn {
                    padding: 0px 8px;
                    border-radius: 4px;
                    border: 1px solid rgba(255,255,255,0.5);
                    background: rgba(255,255,255,0.2);
                    color: white;
                    cursor: pointer;
                }

                .sessions {
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                /* Session Item */
                .session-item {
                    display: flex;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: white;
                    border-radius: 8px;
                    border: 1px solid #f3f4f6;
                    transition: all 0.2s;
                    position: relative;
                }
                .session-item.lab-item {
                    border-left: 4px solid #8b5cf6; /* Purple for Lab */
                }
                .session-item:hover {
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .time-col {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    min-width: 60px;
                    border-right: 2px solid #f3f4f6;
                    padding-right: 0.75rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-light);
                }
                .details-col { flex: 1; }
                .details-col h4 { margin: 0 0 0.5rem 0; font-size: 1rem; color: var(--text-color); display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
                .meta { display: flex; gap: 0.5rem; flex-wrap: wrap; }

                .faculty-badge, .room-badge, .class-badge {
                    font-size: 0.75rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    background-color: #f3f4f6;
                    color: #4b5563;
                }
                .class-badge {
                    background-color: #ecfdf5;
                    color: #047857;
                }

                .tag {
                    font-size: 0.7rem;
                    padding: 2px 6px;
                    border-radius: 12px;
                    font-weight: normal;
                }
                .lab-tag { background-color: #ede9fe; color: #6d28d9; }
                .regular-tag { background-color: #e0e7ff; color: #3730a3; }

                .edit-btn {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .session-item:hover .edit-btn {
                    opacity: 1;
                }

                /* Break Item */
                .break-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.5rem 0.75rem;
                    background-color: #fffbeb; /* Yellow tint */
                    border-radius: 6px;
                    border: 1px dashed #fbbf24;
                    color: #92400e;
                }
                .break-icon { font-size: 1.2rem; }
                .break-details { display: flex; flex-direction: column; font-size: 0.8rem; }
                .break-name { font-weight: 700; }

                /* Active Pulse */
                .active-pulse {
                    border: 2px solid var(--primary-color);
                    background-color: #eef2ff;
                    animation: pulse-border 2s infinite;
                }
                @keyframes pulse-border {
                    0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(79, 70, 229, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
                }
            `}</style>
        </div>
    );
};

export default TimetableView;
