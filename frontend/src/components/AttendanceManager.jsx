import React, { useState, useEffect } from 'react';

const AttendanceManager = () => {
    const [activeTab, setActiveTab] = useState('mark'); // 'mark' or 'report'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Form States
    const today = new Date().toISOString().split('T')[0];
    const [markDate] = useState(today); // Locked to today
    const [reportDate, setReportDate] = useState(today); // Flexible for reports

    const [period, setPeriod] = useState('1');
    const [periodSubject, setPeriodSubject] = useState('');
    const [department, setDepartment] = useState('BCA');
    const [year, setYear] = useState('III');
    const [section, setSection] = useState('A');

    // Data
    const [students, setStudents] = useState([]);
    const [isTaken, setIsTaken] = useState(false);
    const [reportData, setReportData] = useState([]);

    const token = localStorage.getItem('token');

    // Fetch Students for Marking (Check transparency)
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/attendance/students?department=${department}&year=${year}&section=${section}&date=${markDate}&period=${period}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();

            // Backend returns { students: [], isTaken: boolean }
            setIsTaken(data.isTaken);
            if (data.isTaken) {
                setMessage(`Attendance for Period ${period} is already submitted.`);
                // Use existing statuses
                setStudents(data.students);
            } else {
                setMessage('');
                // If not taken, set default check to Present
                setStudents(data.students.map(s => ({ ...s, status: 'Present' })));
            }

        } catch (err) {
            console.error(err);
            setMessage('Error fetching student list');
        } finally {
            setLoading(false);
        }
    };

    // Toggle Attendance Status
    const toggleStatus = (id) => {
        if (isTaken) return; // Prevent editing if already taken
        setStudents(students.map(s =>
            s.id === id ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' } : s
        ));
    };

    // Submit Attendance
    const handleSubmit = async () => {
        if (isTaken) return; // double check

        if (!periodSubject) {
            setMessage('Please enter a subject.');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                date: markDate,
                period,
                subject: periodSubject,
                department,
                year,
                section,
                studentStatuses: students.map(s => ({ student_id: s.id, status: s.status }))
            };

            const res = await fetch('http://localhost:5000/api/attendance/mark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            setMessage(data.message);
            setIsTaken(true); // Lock it after successful submit
        } catch (err) {
            setMessage('Error marking attendance');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Daily Report
    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/attendance/daily-report?date=${reportDate}&department=${department}&year=${year}&section=${section}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setReportData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="attendance-manager">
            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'mark' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mark')}
                >
                    Mark Attendance
                </button>
                <button
                    className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
                    onClick={() => setActiveTab('report')}
                >
                    View Report
                </button>
            </div>

            {/* Filters / Controls */}
            <div className="controls card">
                <div className="control-group">
                    <label>Date {activeTab === 'mark' ? '(Today)' : ''}</label>
                    {activeTab === 'mark' ? (
                        <input
                            type="date"
                            value={markDate}
                            disabled={true}
                            title="You can only mark attendance for today"
                        />
                    ) : (
                        <input
                            type="date"
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                        />
                    )}
                </div>
                <div className="control-group">
                    <label>Department</label>
                    <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="CSE">CSE</option>
                    </select>
                </div>
                <div className="control-group">
                    <label>Year</label>
                    <select value={year} onChange={(e) => setYear(e.target.value)}>
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                    </select>
                </div>
                <div className="control-group">
                    <label>Section</label>
                    <select value={section} onChange={(e) => setSection(e.target.value)}>
                        <option value="A">A</option>
                        <option value="B">B</option>
                    </select>
                </div>

                {activeTab === 'mark' && (
                    <>
                        <div className="control-group">
                            <label>Period (1-5)</label>
                            <select value={period} onChange={(e) => {
                                setPeriod(e.target.value);
                                setStudents([]); // Clear list on period change to force fetch
                                setIsTaken(false);
                                setMessage('');
                            }}>
                                {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="control-group">
                            <label>Subject</label>
                            <input
                                type="text"
                                placeholder="e.g. Java"
                                value={periodSubject}
                                onChange={(e) => setPeriodSubject(e.target.value)}
                                disabled={isTaken}
                            />
                        </div>
                        <button className="primary-btn" onClick={fetchStudents}>
                            {students.length > 0 ? 'Refresh List' : 'Fetch Students'}
                        </button>
                    </>
                )}

                {activeTab === 'report' && (
                    <button className="primary-btn" onClick={fetchReport}>Get Report</button>
                )}
            </div>

            {/* Error/Success Message */}
            {message && <div className={`alert ${isTaken ? 'warning' : 'info'}`}>{message}</div>}

            {/* Mark Attendance View */}
            {activeTab === 'mark' && students.length > 0 && (
                <div className="student-list card">
                    <h3>Class List {isTaken && <span className="badge">Read Only - Submitted</span>}</h3>
                    <div className="list-header">
                        <span>Reg No</span>
                        <span>Name</span>
                        <span>Status</span>
                    </div>
                    {students.map(student => (
                        <div key={student.id} className="list-item">
                            <span>{student.reg_no}</span>
                            <span>{student.name}</span>
                            <button
                                className={`status-toggle ${student.status ? student.status.toLowerCase() : 'present'}`}
                                onClick={() => toggleStatus(student.id)}
                                disabled={isTaken}
                                style={{ opacity: isTaken ? 0.7 : 1, cursor: isTaken ? 'not-allowed' : 'pointer' }}
                            >
                                {student.status || 'Present'}
                            </button>
                        </div>
                    ))}
                    {!isTaken && (
                        <div className="actions">
                            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Saving...' : 'Submit Attendance'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Report View */}
            {activeTab === 'report' && reportData.length > 0 && (
                <div className="report-view card">
                    <h3>Daily Attendance Report ({reportDate})</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Reg No</th>
                                    <th>1</th>
                                    <th>2</th>
                                    <th>3</th>
                                    <th>4</th>
                                    <th>5</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.name}</td>
                                        <td>{student.reg_no}</td>
                                        {[1, 2, 3, 4, 5].map(p => (
                                            <td key={p} className={`status-s ${student.periods[p].toLowerCase()}`}>
                                                {student.periods[p] === 'Present' ? 'P' : student.periods[p] === 'Absent' ? 'A' : '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`
                .attendance-manager {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .tabs {
                    display: flex;
                    gap: 1rem;
                    border-bottom: 2px solid #e5e7eb;
                }
                .tab-btn {
                    padding: 0.75rem 1.5rem;
                    background: none;
                    border: none;
                    font-weight: 600;
                    color: #6b7280;
                    cursor: pointer;
                    border-bottom: 3px solid transparent;
                    margin-bottom: -2px;
                }
                .tab-btn.active {
                    color: var(--primary-color);
                    border-color: var(--primary-color);
                }
                .controls {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    align-items: flex-end;
                }
                .control-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .control-group label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-light);
                }
                .control-group input, .control-group select {
                    padding: 0.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    min-width: 150px;
                }
                .primary-btn {
                    padding: 0.6rem 1.2rem;
                    background-color: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .alert {
                    padding: 1rem;
                    background-color: #dbeafe;
                    color: #1e40af;
                    border-radius: 4px;
                }
                .alert.warning {
                    background-color: #fef3c7;
                    color: #92400e;
                }
                .list-header {
                    display: grid;
                    grid-template-columns: 1fr 2fr 1fr;
                    padding: 0.75rem;
                    background-color: #f9fafb;
                    font-weight: 600;
                    border-bottom: 1px solid #e5e7eb;
                }
                .list-item {
                    display: grid;
                    grid-template-columns: 1fr 2fr 1fr;
                    padding: 0.75rem;
                    align-items: center;
                    border-bottom: 1px solid #f3f4f6;
                }
                .status-toggle {
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .status-toggle.present {
                    background-color: #dcfce7;
                    color: #166534;
                }
                .status-toggle.absent {
                    background-color: #fee2e2;
                    color: #991b1b;
                }
                .submit-btn {
                    margin-top: 1.5rem;
                    width: 100%;
                    padding: 1rem;
                    background-color: #059669;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                }
                .submit-btn:disabled {
                    background-color: #a7f3d0;
                    cursor: not-allowed;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 0.75rem;
                    text-align: left;
                    border-bottom: 1px solid #e5e7eb;
                }
                .badge {
                    background-color: #fef3c7;
                    color: #92400e;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    margin-left: 1rem;
                }
                .status-s.present { color: green; font-weight: bold; }
                .status-s.absent { color: red; font-weight: bold; }
            `}</style>
        </div>
    );
};

export default AttendanceManager;
