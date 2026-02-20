import React, { useState, useEffect } from 'react';
import { ClipboardList, BarChart3, Calendar, CalendarDays, TrendingUp, CheckCircle2, XCircle, BookOpen, Users, Search, Download } from 'lucide-react';

const AttendanceManager = () => {
    const [activeTab, setActiveTab] = useState('mark');
    const [reportMode, setReportMode] = useState('daily'); // daily, monthly, yearly
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const currentYear = new Date().getFullYear();

    const [markDate, setMarkDate] = useState(today);
    const [reportDate, setReportDate] = useState(today);
    const [reportMonth, setReportMonth] = useState(currentMonth);
    const [reportYear, setReportYear] = useState(currentYear);

    const [period, setPeriod] = useState('1');
    const [periodSubject, setPeriodSubject] = useState('');
    const [department, setDepartment] = useState('BCA');
    const [year, setYear] = useState('III');
    const [section, setSection] = useState('A');

    const [students, setStudents] = useState([]);
    const [isTaken, setIsTaken] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [monthlyReport, setMonthlyReport] = useState([]);
    const [yearlyReport, setYearlyReport] = useState({ report: [], subjects: [] });

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/attendance/students?department=${department}&year=${year}&section=${section}&date=${markDate}&period=${period}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setIsTaken(data.isTaken);
            if (data.isTaken) {
                setMessage(`Attendance for Period ${period} is already submitted.`);
                setStudents(data.students);
            } else {
                setMessage('');
                setStudents(data.students.map(s => ({ ...s, status: 'Present' })));
            }
        } catch (err) {
            console.error(err);
            setMessage('Error fetching student list');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (id) => {
        if (!isAdmin && isTaken) return;
        setStudents(students.map(s =>
            s.id === id ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' } : s
        ));
    };

    const handleSubmit = async () => {
        if (!isAdmin && isTaken) return;
        if (!periodSubject) { setMessage('Please enter a subject.'); return; }
        setLoading(true);
        try {
            const payload = {
                date: markDate, period, subject: periodSubject,
                department, year, section,
                studentStatuses: students.map(s => ({ student_id: s.id, status: s.status }))
            };
            const res = await fetch('http://localhost:5000/api/attendance/mark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setMessage(data.message);
            setIsTaken(true);
        } catch (err) {
            setMessage('Error marking attendance');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!department || !year || !section || !markDate || !period || activeTab !== 'mark') return;
        const fetchSubject = async () => {
            try {
                const dayName = new Date(markDate).toLocaleDateString('en-US', { weekday: 'long' });
                const res = await fetch(`http://localhost:5000/api/timetable/get-subject?department=${department}&year=${year}&section=${section}&day=${dayName}&period=${period}`, {
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                if (data.subject) setPeriodSubject(data.subject);
            } catch (error) {
                console.error("Failed to auto-fetch subject", error);
            }
        };
        fetchSubject();
    }, [department, year, section, markDate, period, activeTab]);

    // Fetch Daily Report
    const fetchDailyReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/attendance/daily-report?date=${reportDate}&department=${department}&year=${year}&section=${section}`, {
                headers: { 'x-auth-token': token }
            });
            setReportData(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    // Fetch Monthly Report
    const fetchMonthlyReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/attendance/monthly-class-report?month=${reportMonth}&department=${department}&year=${year}&section=${section}`, {
                headers: { 'x-auth-token': token }
            });
            setMonthlyReport(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    // Fetch Yearly Report
    const fetchYearlyReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/attendance/yearly-class-report?calendarYear=${reportYear}&department=${department}&year=${year}&section=${section}`, {
                headers: { 'x-auth-token': token }
            });
            setYearlyReport(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleFetchReport = () => {
        if (reportMode === 'daily') fetchDailyReport();
        else if (reportMode === 'monthly') fetchMonthlyReport();
        else fetchYearlyReport();
    };

    const getColor = (pct) => {
        const p = parseFloat(pct);
        if (p >= 85) return '#10b981';
        if (p >= 75) return '#f59e0b';
        return '#ef4444';
    };

    const getGradient = (pct) => {
        const p = parseFloat(pct);
        if (p >= 85) return 'linear-gradient(135deg, #10b981, #059669)';
        if (p >= 75) return 'linear-gradient(135deg, #f59e0b, #d97706)';
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
    };

    const monthName = (m) => {
        const [y, mo] = m.split('-');
        return new Date(y, parseInt(mo) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="am-container">
            {/* Main Tabs */}
            <div className="main-tabs">
                <button className={`main-tab ${activeTab === 'mark' ? 'active' : ''}`} onClick={() => setActiveTab('mark')}>
                    <ClipboardList size={18} /> Mark Attendance
                </button>
                <button className={`main-tab ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>
                    <BarChart3 size={18} /> View Report
                </button>
            </div>

            {/* Controls */}
            <div className="controls-card">
                <div className="controls-grid">
                    {activeTab === 'mark' ? (
                        <div className="ctrl-group">
                            <label>Date</label>
                            <input type="date" value={markDate} onChange={e => setMarkDate(e.target.value)}
                                disabled={!isAdmin} className="ctrl-input" />
                        </div>
                    ) : (
                        <>
                            {reportMode === 'daily' && (
                                <div className="ctrl-group">
                                    <label>Date</label>
                                    <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} className="ctrl-input" />
                                </div>
                            )}
                            {reportMode === 'monthly' && (
                                <div className="ctrl-group">
                                    <label>Month</label>
                                    <input type="month" value={reportMonth} onChange={e => setReportMonth(e.target.value)} className="ctrl-input" />
                                </div>
                            )}
                            {reportMode === 'yearly' && (
                                <div className="ctrl-group">
                                    <label>Year</label>
                                    <select value={reportYear} onChange={e => setReportYear(e.target.value)} className="ctrl-input">
                                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            )}
                        </>
                    )}
                    <div className="ctrl-group">
                        <label>Department</label>
                        <select value={department} disabled className="ctrl-input"><option value="BCA">BCA</option></select>
                    </div>
                    <div className="ctrl-group">
                        <label>Year</label>
                        <select value={year} onChange={e => setYear(e.target.value)} className="ctrl-input">
                            <option value="I">I</option><option value="II">II</option><option value="III">III</option>
                        </select>
                    </div>
                    <div className="ctrl-group">
                        <label>Section</label>
                        <select value={section} onChange={e => setSection(e.target.value)} className="ctrl-input">
                            <option value="A">A</option><option value="B">B</option>
                        </select>
                    </div>

                    {activeTab === 'mark' && (
                        <>
                            <div className="ctrl-group">
                                <label>Period</label>
                                <select value={period} onChange={e => { setPeriod(e.target.value); setStudents([]); setIsTaken(false); setMessage(''); }} className="ctrl-input">
                                    {[1, 2, 3, 4, 5, 6].map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="ctrl-group">
                                <label>Subject</label>
                                <input type="text" placeholder="e.g. Java" value={periodSubject}
                                    onChange={e => setPeriodSubject(e.target.value)} disabled={isTaken} className="ctrl-input" />
                            </div>
                        </>
                    )}
                </div>
                <div className="ctrl-actions">
                    {activeTab === 'mark' ? (
                        <>
                            <button className="action-btn primary" onClick={fetchStudents}>
                                <Search size={16} /> {students.length > 0 ? 'Refresh List' : 'Fetch Students'}
                            </button>
                            {students.length > 0 && !isTaken && (
                                <button className="action-btn secondary" onClick={() => {
                                    const allAbsent = students.every(s => s.status === 'Absent');
                                    setStudents(students.map(s => ({ ...s, status: allAbsent ? 'Present' : 'Absent' })));
                                }}>
                                    {students.every(s => s.status === 'Absent') ? 'Mark All Present' : 'Mark All Absent'}
                                </button>
                            )}
                        </>
                    ) : (
                        <button className="action-btn primary" onClick={handleFetchReport}>
                            <Search size={16} /> Get Report
                        </button>
                    )}
                </div>
            </div>

            {/* Report Mode Sub-tabs */}
            {activeTab === 'report' && (
                <div className="report-tabs">
                    {[
                        { id: 'daily', label: 'Daily', icon: CalendarDays },
                        { id: 'monthly', label: 'Monthly', icon: Calendar },
                        { id: 'yearly', label: 'Yearly', icon: TrendingUp }
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id}
                                className={`report-tab ${reportMode === tab.id ? 'active' : ''}`}
                                onClick={() => setReportMode(tab.id)}>
                                <Icon size={16} /> {tab.label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Alert */}
            {message && (
                <div className={`alert-banner ${isTaken ? 'warn' : 'info'}`}>
                    {isTaken ? '⚠️' : 'ℹ️'} {message}
                    <button className="alert-dismiss" onClick={() => setMessage('')}>×</button>
                </div>
            )}

            {/* MARK TAB */}
            {activeTab === 'mark' && students.length > 0 && (
                <div className="mark-card">
                    <div className="mark-header">
                        <h3><Users size={20} /> Class List</h3>
                        {isTaken && <span className="status-badge locked">🔒 Submitted</span>}
                        <span className="student-count">{students.length} students</span>
                    </div>
                    <div className="mark-table-wrap">
                        <table className="mark-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Reg No</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s, idx) => (
                                    <tr key={s.id} className={`mark-row ${(s.status || 'Present').toLowerCase()}`}>
                                        <td className="row-num">{idx + 1}</td>
                                        <td className="reg-no">{s.reg_no}</td>
                                        <td className="stu-name">{s.name}</td>
                                        <td>
                                            <button
                                                className={`status-chip ${(s.status || 'Present').toLowerCase()}`}
                                                onClick={() => toggleStatus(s.id)}
                                                disabled={!isAdmin && isTaken}>
                                                {s.status === 'Present' ? <><CheckCircle2 size={14} /> Present</> :
                                                    <><XCircle size={14} /> Absent</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {(!isTaken || isAdmin) && (
                        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                            <CheckCircle2 size={18} />
                            {loading ? 'Saving...' : (isTaken ? 'Update Attendance' : 'Submit Attendance')}
                        </button>
                    )}
                </div>
            )}

            {/* DAILY REPORT */}
            {activeTab === 'report' && reportMode === 'daily' && reportData.length > 0 && (
                <div className="report-card">
                    <div className="report-header">
                        <h3><CalendarDays size={20} /> Daily Report — {new Date(reportDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                    </div>
                    <div className="table-scroll">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Reg No</th>
                                    {[1, 2, 3, 4, 5, 6].map(p => <th key={p} className="period-th">P{p}</th>)}
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((s, idx) => {
                                    const presentCount = [1, 2, 3, 4, 5, 6].filter(p => s.periods[p] === 'Present' || s.periods[p] === 'On Duty').length;
                                    const totalCount = [1, 2, 3, 4, 5, 6].filter(p => s.periods[p] && s.periods[p] !== '-').length;
                                    return (
                                        <tr key={s.id}>
                                            <td className="row-num">{idx + 1}</td>
                                            <td className="stu-name">{s.name}</td>
                                            <td className="reg-no">{s.reg_no}</td>
                                            {[1, 2, 3, 4, 5, 6].map(p => {
                                                const st = s.periods[p];
                                                return (
                                                    <td key={p} className="period-cell">
                                                        <span className={`period-badge ${st === 'Present' ? 'p' : st === 'Absent' ? 'a' : st === 'On Duty' ? 'od' : 'na'}`}>
                                                            {st === 'Present' ? 'P' : st === 'Absent' ? 'A' : st === 'On Duty' ? 'OD' : '—'}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                            <td className="total-cell">
                                                <span style={{ color: getColor(totalCount > 0 ? (presentCount / totalCount * 100) : 100), fontWeight: 700 }}>
                                                    {presentCount}/{totalCount}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MONTHLY REPORT */}
            {activeTab === 'report' && reportMode === 'monthly' && monthlyReport.length > 0 && (
                <div className="report-card">
                    <div className="report-header">
                        <h3><Calendar size={20} /> Monthly Report — {monthName(reportMonth)}</h3>
                    </div>
                    <div className="table-scroll">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Reg No</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Total</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyReport.map((s, idx) => (
                                    <tr key={s.id}>
                                        <td className="row-num">{idx + 1}</td>
                                        <td className="stu-name">{s.name}</td>
                                        <td className="reg-no">{s.reg_no}</td>
                                        <td><span className="count-badge present">{s.present}</span></td>
                                        <td><span className="count-badge absent">{s.absent}</span></td>
                                        <td><span className="count-badge total">{s.total}</span></td>
                                        <td>
                                            <div className="pct-cell">
                                                <div className="mini-bar">
                                                    <div className="mini-fill" style={{ width: `${s.percentage}%`, background: getGradient(s.percentage) }}></div>
                                                </div>
                                                <span style={{ color: getColor(s.percentage), fontWeight: 700, fontSize: '0.85rem' }}>{s.percentage}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* YEARLY REPORT */}
            {activeTab === 'report' && reportMode === 'yearly' && yearlyReport.report && yearlyReport.report.length > 0 && (
                <div className="report-card">
                    <div className="report-header">
                        <h3><TrendingUp size={20} /> Yearly Report — {reportYear}</h3>
                    </div>
                    <div className="table-scroll">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Reg No</th>
                                    {yearlyReport.subjects.map(sub => <th key={sub} className="subj-th">{sub}</th>)}
                                    <th>Overall</th>
                                </tr>
                            </thead>
                            <tbody>
                                {yearlyReport.report.map((s, idx) => (
                                    <tr key={s.id}>
                                        <td className="row-num">{idx + 1}</td>
                                        <td className="stu-name">{s.name}</td>
                                        <td className="reg-no">{s.reg_no}</td>
                                        {yearlyReport.subjects.map(sub => {
                                            const data = s.subjects[sub];
                                            return (
                                                <td key={sub} className="subj-cell">
                                                    {data ? (
                                                        <span className="subj-pct" style={{ color: getColor(data.percentage) }}>
                                                            {data.percentage}%
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                            );
                                        })}
                                        <td>
                                            <div className="pct-cell">
                                                <div className="mini-bar">
                                                    <div className="mini-fill" style={{ width: `${s.percentage}%`, background: getGradient(s.percentage) }}></div>
                                                </div>
                                                <span style={{ color: getColor(s.percentage), fontWeight: 700, fontSize: '0.85rem' }}>{s.percentage}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}

            <style>{`
                .am-container {
                    display: flex; flex-direction: column; gap: 1.15rem;
                    animation: fadeUp 0.4s ease;
                    position: relative;
                }
                @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

                /* Main Tabs */
                .main-tabs {
                    display: flex; gap: 0.35rem;
                    background: white; border-radius: 14px;
                    padding: 0.35rem;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
                    border: 1px solid #f1f5f9;
                }
                .main-tab {
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    padding: 0.75rem 1rem; border: none; border-radius: 10px;
                    background: transparent; color: #64748b;
                    font-weight: 600; font-size: 0.88rem; cursor: pointer;
                    transition: all 0.3s;
                }
                .main-tab.active {
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                    box-shadow: 0 4px 14px rgba(99,102,241,0.3);
                }
                .main-tab:hover:not(.active) { background: #f8fafc; }

                /* Controls */
                .controls-card {
                    background: white; border-radius: 16px;
                    padding: 1.25rem;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                    border: 1px solid #f1f5f9;
                }
                .controls-grid {
                    display: flex; flex-wrap: wrap; gap: 0.85rem;
                    margin-bottom: 1rem;
                }
                .ctrl-group {
                    display: flex; flex-direction: column; gap: 0.35rem;
                }
                .ctrl-group label {
                    font-size: 0.72rem; font-weight: 600; color: #64748b;
                    text-transform: uppercase; letter-spacing: 0.04em;
                }
                .ctrl-input {
                    padding: 0.55rem 0.75rem;
                    border: 2px solid #e2e8f0; border-radius: 10px;
                    font-size: 0.85rem; color: #1e293b;
                    background: #f8fafc; min-width: 130px;
                    transition: all 0.2s;
                }
                .ctrl-input:focus { outline: none; border-color: #6366f1; background: white; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
                .ctrl-actions { display: flex; gap: 0.65rem; flex-wrap: wrap; }

                .action-btn {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    padding: 0.6rem 1.1rem; border: none; border-radius: 10px;
                    font-weight: 600; font-size: 0.85rem; cursor: pointer;
                    transition: all 0.3s;
                }
                .action-btn.primary {
                    background: linear-gradient(135deg, #6366f1, #4f46e5); color: white;
                    box-shadow: 0 3px 10px rgba(99,102,241,0.25);
                }
                .action-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.35); }
                .action-btn.secondary { background: #f1f5f9; color: #475569; }
                .action-btn.secondary:hover { background: #e2e8f0; }

                /* Report Sub-tabs */
                .report-tabs {
                    display: flex; gap: 0.35rem;
                    background: white; border-radius: 12px; padding: 0.3rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    border: 1px solid #f1f5f9;
                }
                .report-tab {
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
                    padding: 0.6rem; border: none; border-radius: 9px;
                    background: transparent; color: #94a3b8;
                    font-weight: 600; font-size: 0.82rem; cursor: pointer;
                    transition: all 0.25s;
                }
                .report-tab.active {
                    background: #ede9fe; color: #6366f1;
                }
                .report-tab:hover:not(.active) { background: #f8fafc; color: #64748b; }

                /* Alert */
                .alert-banner {
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.75rem 1rem; border-radius: 12px;
                    font-size: 0.85rem; font-weight: 500;
                    animation: fadeSlide 0.3s ease;
                }
                @keyframes fadeSlide { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform:translateY(0); } }
                .alert-banner.info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
                .alert-banner.warn { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
                .alert-dismiss { margin-left: auto; background: none; border: none; font-size: 1.1rem; cursor: pointer; color: inherit; opacity: 0.5; }

                /* Mark Card */
                .mark-card {
                    background: white; border-radius: 16px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                    border: 1px solid #f1f5f9;
                    overflow: hidden;
                }
                .mark-header {
                    display: flex; align-items: center; gap: 0.75rem;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fafbfc;
                }
                .mark-header h3 { margin: 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; color: #1e293b; }
                .status-badge.locked { background: #fef3c7; color: #92400e; padding: 0.2rem 0.7rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; }
                .student-count { margin-left: auto; font-size: 0.8rem; color: #94a3b8; font-weight: 500; }

                .mark-table { width: 100%; border-collapse: collapse; }
                .mark-table thead { background: #f8fafc; }
                .mark-table th { padding: 0.7rem 1rem; text-align: left; font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 700; border-bottom: 1px solid #f1f5f9; }
                .mark-table td { padding: 0.65rem 1rem; border-bottom: 1px solid #f8fafc; }
                .row-num { color: #94a3b8; font-size: 0.8rem; width: 40px; }
                .reg-no { font-family: monospace; color: #64748b; font-size: 0.85rem; }
                .stu-name { font-weight: 600; color: #1e293b; font-size: 0.9rem; }

                .status-chip {
                    display: inline-flex; align-items: center; gap: 0.3rem;
                    padding: 0.35rem 0.85rem; border-radius: 20px;
                    border: none; font-weight: 600; font-size: 0.8rem;
                    cursor: pointer; transition: all 0.2s;
                }
                .status-chip.present { background: #ecfdf5; color: #065f46; }
                .status-chip.absent { background: #fef2f2; color: #991b1b; }
                .status-chip:disabled { opacity: 0.6; cursor: not-allowed; }

                .submit-btn {
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    width: calc(100% - 2.5rem); margin: 1.25rem;
                    padding: 0.85rem;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white; border: none; border-radius: 12px;
                    font-size: 0.95rem; font-weight: 600; cursor: pointer;
                    box-shadow: 0 4px 14px rgba(16,185,129,0.3);
                    transition: all 0.3s;
                }
                .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16,185,129,0.4); }
                .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

                /* Report Card */
                .report-card {
                    background: white; border-radius: 16px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
                    border: 1px solid #f1f5f9;
                    overflow: hidden;
                    animation: fadeUp 0.3s ease;
                }
                .report-header {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fafbfc;
                }
                .report-header h3 { margin: 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; color: #1e293b; }
                .report-header h3 svg { color: #6366f1; }

                .table-scroll { overflow-x: auto; }
                .report-table { width: 100%; border-collapse: collapse; min-width: 600px; }
                .report-table thead { background: #f8fafc; }
                .report-table th { padding: 0.7rem 0.85rem; text-align: left; font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 700; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
                .report-table td { padding: 0.6rem 0.85rem; border-bottom: 1px solid #f8fafc; font-size: 0.85rem; }
                .report-table tbody tr:hover { background: #fafbfe; }

                .period-th, .subj-th { text-align: center !important; }
                .period-cell, .subj-cell { text-align: center; }
                .period-badge {
                    display: inline-block; width: 28px; height: 28px;
                    line-height: 28px; text-align: center;
                    border-radius: 8px; font-size: 0.75rem; font-weight: 700;
                }
                .period-badge.p { background: #ecfdf5; color: #065f46; }
                .period-badge.a { background: #fef2f2; color: #991b1b; }
                .period-badge.od { background: #eff6ff; color: #1e40af; }
                .period-badge.na { background: #f8fafc; color: #cbd5e1; }
                .total-cell { text-align: center; }

                .count-badge {
                    display: inline-block; padding: 0.2rem 0.6rem;
                    border-radius: 8px; font-size: 0.8rem; font-weight: 700;
                }
                .count-badge.present { background: #ecfdf5; color: #065f46; }
                .count-badge.absent { background: #fef2f2; color: #991b1b; }
                .count-badge.total { background: #eff6ff; color: #1e40af; }

                .pct-cell { display: flex; align-items: center; gap: 0.5rem; }
                .mini-bar { width: 60px; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; flex-shrink: 0; }
                .mini-fill { height: 100%; border-radius: 3px; transition: width 0.8s ease; }

                .subj-pct { font-weight: 700; font-size: 0.82rem; }

                /* Loading */
                .loading-overlay {
                    position: absolute; inset: 0;
                    background: rgba(255,255,255,0.6);
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 16px; z-index: 10;
                }
                .spinner {
                    width: 36px; height: 36px;
                    border: 3px solid #e2e8f0;
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Responsive */
                @media (max-width: 768px) {
                    .controls-grid { flex-direction: column; }
                    .ctrl-input { min-width: 100%; }
                    .main-tabs, .report-tabs { flex-direction: column; }
                }
            `}</style>
        </div>
    );
};

export default AttendanceManager;
