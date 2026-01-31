

import React, { useState, useEffect } from 'react';

const TimetableView = () => {
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Filters
    const [department, setDepartment] = useState('BCA');
    const [year, setYear] = useState('III');
    const [section, setSection] = useState('A');

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // Set defaults
    useEffect(() => {
        if (user.role === 'student') {
            setDepartment(user.department);
            setYear(user.year);
            setSection(user.section);
        } else if (user.role === 'faculty') {
            setDepartment(user.department);
        }

        // Clock timer
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/timetable?department=${department}&year=${year}&section=${section}`, {
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
    }, [department, year, section]);

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
        // We know the standard times now:
        // 10:40 - 10:55 (Break)
        // 12:35 - 01:25 (Lunch)
        // 03:05 - 03:20 (Break) - adjusted from seed logic

        // Simpler approach: Sort sessions, find gaps > 10 mins
        const sorted = [...sessions].sort((a, b) => a.start_time.localeCompare(b.start_time));

        for (let i = 0; i < sorted.length; i++) {
            fullSchedule.push({ type: 'class', ...sorted[i] });

            if (i < sorted.length - 1) {
                const currentEnd = sorted[i].end_time; // HH:MM:SS
                const nextStart = sorted[i + 1].start_time;

                // Let's identify specific breaks by their known start times
                if (currentEnd.startsWith('10:40')) {
                    fullSchedule.push({ type: 'break', name: 'Morning Break', start: '10:40', end: '10:55', icon: '☕' });
                } else if (currentEnd.startsWith('12:35')) {
                    fullSchedule.push({ type: 'break', name: 'Lunch Break', start: '12:35', end: '13:25', icon: '🍱' });
                } else if (currentEnd.startsWith('15:05')) { // Adjusted based on seed
                    fullSchedule.push({ type: 'break', name: 'Afternoon Break', start: '15:05', end: '15:20', icon: '🥤' });
                }
            }
        }
        return fullSchedule;
    };

    return (
        <div className="timetable-view">
            <h2>
                Class Timetable
                <span className="live-badge">🔴 Live</span>
            </h2>

            {/* Filters */}
            <div className="filters card">
                <div className="filter-group">
                    <label>Department</label>
                    <select value={department} onChange={(e) => setDepartment(e.target.value)} disabled={user.role === 'student'}>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="CSE">CSE</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Year</label>
                    <select value={year} onChange={(e) => setYear(e.target.value)} disabled={user.role === 'student'}>
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Section</label>
                    <select value={section} onChange={(e) => setSection(e.target.value)} disabled={user.role === 'student'}>
                        <option value="A">A</option>
                        <option value="B">B</option>
                    </select>
                </div>
            </div>

            {loading && <div className="loading">Loading schedule...</div>}

            {!loading && timetable && (
                <div className="timetable-grid">
                    {days.map(day => {
                        const schedule = processSchedule(timetable[day], day);
                        const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'long' });

                        return (
                            <div key={day} className={`day-card card ${isToday ? 'today-highlight' : ''}`}>
                                <h3 className="day-header">{day} {isToday && '(Today)'}</h3>
                                <div className="sessions">
                                    {schedule.length > 0 ? (
                                        schedule.map((item, index) => {
                                            const isActive = isCurrentSlot(day, item.start_time || item.start, item.end_time || item.end);

                                            if (item.type === 'break') {
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

                                            return (
                                                <div key={index} className={`session-item ${isActive ? 'active-pulse' : ''}`}>
                                                    <div className="time-col">
                                                        <span className="start">{item.start_time.slice(0, 5)}</span>
                                                        <span className="end">{item.end_time.slice(0, 5)}</span>
                                                    </div>
                                                    <div className="details-col">
                                                        <h4>{item.subject}</h4>
                                                        <div className="meta">
                                                            <span className="faculty-badge">👤 {item.faculty_name || 'Staff'}</span>
                                                            <span className="room-badge">📍 {item.room_no || 'LH-1'}</span>
                                                        </div>
                                                    </div>
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

            <style>{`
                .timetable-view {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
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
                }
                .today-highlight .day-header {
                    background-color: var(--primary-color);
                    color: white;
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
                .details-col h4 { margin: 0 0 0.5rem 0; font-size: 1rem; color: var(--text-color); }
                .meta { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                
                .faculty-badge, .room-badge {
                    font-size: 0.75rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    background-color: #f3f4f6;
                    color: #4b5563;
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
