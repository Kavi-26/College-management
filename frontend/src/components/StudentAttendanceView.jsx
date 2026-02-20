import React, { useEffect, useState } from 'react';
import { BarChart3, Calendar, CalendarDays, CheckCircle2, XCircle, Clock, BookOpen, TrendingUp, AlertTriangle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const StudentAttendanceView = () => {
    const [stats, setStats] = useState(null);
    const [monthly, setMonthly] = useState([]);
    const [dailyLog, setDailyLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('yearly');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [dailyLoading, setDailyLoading] = useState(false);
    const token = localStorage.getItem('token');

    const currentYear = new Date().getFullYear();
    const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, monthlyRes] = await Promise.all([
                    fetch('http://localhost:5000/api/attendance/my-stats', { headers: { 'x-auth-token': token } }),
                    fetch(`http://localhost:5000/api/attendance/my-monthly?year=${currentYear}`, { headers: { 'x-auth-token': token } })
                ]);
                const statsData = await statsRes.json();
                const monthlyData = await monthlyRes.json();
                setStats(statsData);
                setMonthly(Array.isArray(monthlyData) ? monthlyData : []);
                if (!selectedMonth) setSelectedMonth(currentMonth);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [token]);

    useEffect(() => {
        if (selectedMonth && activeTab === 'daily') {
            fetchDaily(selectedMonth);
        }
    }, [selectedMonth, activeTab]);

    const fetchDaily = async (month) => {
        setDailyLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/attendance/my-daily?month=${month}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setDailyLog(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setDailyLoading(false);
        }
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

    const getStatusBadge = (pct) => {
        const p = parseFloat(pct);
        if (p >= 85) return { label: 'Excellent', bg: '#ecfdf5', color: '#065f46' };
        if (p >= 75) return { label: 'Good', bg: '#fffbeb', color: '#92400e' };
        return { label: 'Low', bg: '#fef2f2', color: '#991b1b' };
    };

    const monthName = (m) => {
        const [y, mo] = m.split('-');
        return new Date(y, parseInt(mo) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    };

    const dayName = (d) => {
        return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    if (loading) return (
        <div className="att-loading">
            <div className="loader-ring"></div>
            <p>Loading your attendance...</p>
            <style>{`
                .att-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:50vh; gap:1rem; color:#64748b; }
                .loader-ring { width:48px; height:48px; border:4px solid #e2e8f0; border-top-color:#6366f1; border-radius:50%; animation:spin 0.8s linear infinite; }
                @keyframes spin { to { transform:rotate(360deg); } }
            `}</style>
        </div>
    );

    if (!stats) return (
        <div className="att-empty">
            <Calendar size={48} />
            <h3>No Attendance Records</h3>
            <p>Your attendance records will appear here once classes begin.</p>
            <style>{`
                .att-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:50vh; gap:1rem; color:#94a3b8; text-align:center; }
                .att-empty h3 { margin:0; color:#475569; }
                .att-empty p { margin:0; }
            `}</style>
        </div>
    );

    const tabs = [
        { id: 'yearly', label: 'Year Overview', icon: BarChart3 },
        { id: 'monthly', label: 'Monthly', icon: Calendar },
        { id: 'daily', label: 'Daily Log', icon: CalendarDays }
    ];

    return (
        <div className="att-dashboard">
            {/* Hero Stats Card */}
            <div className="hero-card">
                <div className="hero-bg-decor"></div>
                <div className="hero-left">
                    <svg viewBox="0 0 36 36" className="donut-chart">
                        <path className="donut-bg"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="donut-fill"
                            strokeDasharray={`${stats.overall}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            style={{ stroke: getColor(stats.overall) }} />
                        <text x="18" y="18.5" className="donut-text">{stats.overall}%</text>
                        <text x="18" y="22.5" className="donut-sub">Overall</text>
                    </svg>
                </div>
                <div className="hero-right">
                    <h2>Attendance Overview</h2>
                    <div className="stat-pills">
                        <div className="pill">
                            <CheckCircle2 size={16} />
                            <span>Present: <strong>{stats.classesAttended}</strong></span>
                        </div>
                        <div className="pill absent-pill">
                            <XCircle size={16} />
                            <span>Absent: <strong>{stats.totalClasses - stats.classesAttended}</strong></span>
                        </div>
                        <div className="pill total-pill">
                            <BookOpen size={16} />
                            <span>Total: <strong>{stats.totalClasses}</strong></span>
                        </div>
                    </div>
                    {parseFloat(stats.overall) < 75 && (
                        <div className="warning-strip">
                            <AlertTriangle size={16} />
                            <span>Attendance below 75%! Please attend more classes.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-bar">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}>
                            <Icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {/* YEARLY TAB */}
                {activeTab === 'yearly' && (
                    <div className="yearly-view">
                        <h3 className="section-title">
                            <TrendingUp size={20} />
                            Subject Performance
                        </h3>
                        <div className="subjects-grid">
                            {stats.subjects && Object.entries(stats.subjects).map(([subject, data], idx) => {
                                const badge = getStatusBadge(data.percentage);
                                return (
                                    <div key={subject} className="subject-card" style={{ animationDelay: `${idx * 0.08}s` }}>
                                        <div className="subj-top">
                                            <div className="subj-icon" style={{ background: getGradient(data.percentage) }}>
                                                <BookOpen size={18} />
                                            </div>
                                            <div className="subj-info">
                                                <h4>{subject}</h4>
                                                <span className="subj-sessions">{data.present}/{data.total} sessions</span>
                                            </div>
                                            <span className="subj-pct" style={{ background: badge.bg, color: badge.color }}>
                                                {data.percentage}%
                                            </span>
                                        </div>
                                        <div className="progress-track">
                                            <div className="progress-fill" style={{
                                                width: `${data.percentage}%`,
                                                background: getGradient(data.percentage)
                                            }}></div>
                                        </div>
                                        <div className="subj-bottom">
                                            <span style={{ color: badge.color }}>{badge.label}</span>
                                            {parseFloat(data.percentage) < 75 && (
                                                <span className="need-classes">
                                                    Need {Math.ceil((0.75 * data.total - data.present) / 0.25)} more classes
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* MONTHLY TAB */}
                {activeTab === 'monthly' && (
                    <div className="monthly-view">
                        <h3 className="section-title">
                            <Calendar size={20} />
                            Monthly Breakdown — {currentYear}
                        </h3>
                        {monthly.length === 0 ? (
                            <div className="empty-state">
                                <Calendar size={40} />
                                <p>No monthly data available yet.</p>
                            </div>
                        ) : (
                            <div className="monthly-grid">
                                {monthly.map((m, idx) => {
                                    const badge = getStatusBadge(m.percentage);
                                    return (
                                        <div key={m.month} className="month-card" style={{ animationDelay: `${idx * 0.08}s` }}
                                            onClick={() => { setSelectedMonth(m.month); setActiveTab('daily'); }}>
                                            <div className="month-header">
                                                <span className="month-name">{monthName(m.month)}</span>
                                                <span className="month-badge" style={{ background: badge.bg, color: badge.color }}>
                                                    {m.percentage}%
                                                </span>
                                            </div>
                                            <div className="month-bar-track">
                                                <div className="month-bar-fill" style={{
                                                    width: `${m.percentage}%`,
                                                    background: getGradient(m.percentage)
                                                }}></div>
                                            </div>
                                            <div className="month-stats">
                                                <div className="m-stat">
                                                    <CheckCircle2 size={14} />
                                                    <span>{m.present} Present</span>
                                                </div>
                                                <div className="m-stat absent">
                                                    <XCircle size={14} />
                                                    <span>{m.absent} Absent</span>
                                                </div>
                                                <div className="m-stat total">
                                                    <BookOpen size={14} />
                                                    <span>{m.total} Total</span>
                                                </div>
                                            </div>
                                            <div className="view-details">
                                                <Eye size={14} />
                                                View Daily Log →
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* DAILY TAB */}
                {activeTab === 'daily' && (
                    <div className="daily-view">
                        <div className="daily-header">
                            <h3 className="section-title">
                                <CalendarDays size={20} />
                                Daily Attendance
                            </h3>
                            <div className="month-picker">
                                <button onClick={() => {
                                    const [y, m] = selectedMonth.split('-').map(Number);
                                    const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
                                    setSelectedMonth(prev);
                                }}><ChevronLeft size={18} /></button>
                                <span className="current-month">{monthName(selectedMonth)}</span>
                                <button onClick={() => {
                                    const [y, m] = selectedMonth.split('-').map(Number);
                                    const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
                                    setSelectedMonth(next);
                                }}><ChevronRight size={18} /></button>
                            </div>
                        </div>

                        {dailyLoading ? (
                            <div className="att-loading" style={{ minHeight: '30vh' }}>
                                <div className="loader-ring"></div>
                            </div>
                        ) : dailyLog.length === 0 ? (
                            <div className="empty-state">
                                <CalendarDays size={40} />
                                <p>No attendance records for this month.</p>
                            </div>
                        ) : (
                            <div className="daily-list">
                                {dailyLog.map((day, idx) => (
                                    <div key={day.date} className="day-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                                        <div className="day-left">
                                            <div className="day-date-box">
                                                <span className="day-num">{new Date(day.date).getDate()}</span>
                                                <span className="day-name">{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                                            </div>
                                            <div className="day-summary">
                                                <span className="day-label">{dayName(day.date)}</span>
                                                <span className="day-ratio">
                                                    <CheckCircle2 size={13} /> {day.present}/{day.total} classes attended
                                                </span>
                                            </div>
                                        </div>
                                        <div className="day-periods">
                                            {day.periods.map((p, pi) => (
                                                <div key={pi} className={`period-chip ${p.status === 'Present' || p.status === 'On Duty' ? 'present' : 'absent'}`}
                                                    title={`P${p.period}: ${p.subject} — ${p.status}`}>
                                                    <span className="p-num">P{p.period}</span>
                                                    <span className="p-status-icon">
                                                        {p.status === 'Present' || p.status === 'On Duty' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .att-dashboard {
                    display: flex; flex-direction: column; gap: 1.25rem;
                    animation: fadeUp 0.4s ease;
                    padding-bottom: 2rem;
                }
                @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                @keyframes cardIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

                /* Hero Card */
                .hero-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2rem;
                    display: flex; align-items: center; gap: 2.5rem;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
                    border: 1px solid #f1f5f9;
                    position: relative;
                    overflow: hidden;
                }
                .hero-bg-decor {
                    position: absolute; top: -50%; right: -10%;
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%);
                    pointer-events: none;
                }
                .hero-left { flex-shrink: 0; }
                .donut-chart { width: 140px; height: 140px; }
                .donut-bg { fill:none; stroke:#f1f5f9; stroke-width:3.2; }
                .donut-fill { fill:none; stroke-width:3.2; stroke-linecap:round; animation:draw 1.2s ease-out forwards; }
                @keyframes draw { 0% { stroke-dasharray:0 100; } }
                .donut-text { fill:#1e293b; font-size:0.55em; font-weight:800; text-anchor:middle; font-family:inherit; }
                .donut-sub { fill:#94a3b8; font-size:0.25em; text-anchor:middle; font-family:inherit; }

                .hero-right { flex:1; position:relative; z-index:1; }
                .hero-right h2 { margin:0 0 1rem; font-size:1.35rem; color:#1e293b; font-weight:700; }

                .stat-pills { display:flex; gap:0.65rem; flex-wrap:wrap; }
                .pill {
                    display:inline-flex; align-items:center; gap:0.4rem;
                    background:#ecfdf5; color:#065f46;
                    padding:0.45rem 0.85rem; border-radius:10px;
                    font-size:0.82rem; font-weight:500;
                }
                .pill strong { font-weight:700; }
                .absent-pill { background:#fef2f2; color:#991b1b; }
                .total-pill { background:#eff6ff; color:#1e40af; }

                .warning-strip {
                    display:flex; align-items:center; gap:0.5rem;
                    margin-top:1rem;
                    background:linear-gradient(135deg, #fef2f2, #fee2e2);
                    color:#991b1b;
                    padding:0.6rem 1rem; border-radius:10px;
                    font-size:0.82rem; font-weight:600;
                    border:1px solid #fecaca;
                }

                /* Tab Bar */
                .tab-bar {
                    display:flex; gap:0.4rem;
                    background:white;
                    border-radius:14px;
                    padding:0.35rem;
                    box-shadow:0 2px 12px rgba(0,0,0,0.05);
                    border:1px solid #f1f5f9;
                }
                .tab-btn {
                    flex:1; display:flex; align-items:center; justify-content:center; gap:0.45rem;
                    padding:0.75rem 1rem; border:none; border-radius:10px;
                    background:transparent; color:#64748b;
                    font-weight:600; font-size:0.85rem; cursor:pointer;
                    transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
                }
                .tab-btn.active {
                    background:linear-gradient(135deg, #6366f1, #4f46e5);
                    color:white;
                    box-shadow:0 4px 14px rgba(99,102,241,0.3);
                }
                .tab-btn:hover:not(.active) { background:#f8fafc; color:#334155; }

                /* Section Title */
                .section-title {
                    display:flex; align-items:center; gap:0.6rem;
                    font-size:1.05rem; font-weight:700; color:#1e293b;
                    margin:0 0 1.25rem;
                }
                .section-title svg { color:#6366f1; }

                /* Empty State */
                .empty-state {
                    display:flex; flex-direction:column; align-items:center;
                    padding:3rem; color:#94a3b8; text-align:center; gap:0.75rem;
                }

                /* YEARLY VIEW - Subjects */
                .subjects-grid {
                    display:grid;
                    grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));
                    gap:1rem;
                }
                .subject-card {
                    background:white; border-radius:16px;
                    padding:1.25rem;
                    border:1px solid #f1f5f9;
                    box-shadow:0 2px 8px rgba(0,0,0,0.04);
                    transition:all 0.3s; animation:cardIn 0.4s ease both;
                }
                .subject-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.08); }
                .subj-top { display:flex; align-items:center; gap:0.85rem; margin-bottom:0.85rem; }
                .subj-icon {
                    width:40px; height:40px; border-radius:11px;
                    display:flex; align-items:center; justify-content:center;
                    color:white; flex-shrink:0;
                }
                .subj-info { flex:1; }
                .subj-info h4 { margin:0; font-size:0.92rem; font-weight:650; color:#1e293b; }
                .subj-sessions { font-size:0.75rem; color:#94a3b8; }
                .subj-pct {
                    padding:0.3rem 0.7rem; border-radius:8px;
                    font-size:0.82rem; font-weight:700;
                }
                .progress-track {
                    width:100%; height:6px; background:#f1f5f9;
                    border-radius:3px; overflow:hidden; margin-bottom:0.65rem;
                }
                .progress-fill { height:100%; border-radius:3px; transition:width 1s ease-out; }
                .subj-bottom {
                    display:flex; justify-content:space-between; align-items:center;
                    font-size:0.78rem; font-weight:600;
                }
                .need-classes { color:#94a3b8; font-weight:500; }

                /* MONTHLY VIEW */
                .monthly-grid {
                    display:grid;
                    grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));
                    gap:1rem;
                }
                .month-card {
                    background:white; border-radius:16px;
                    padding:1.25rem;
                    border:1px solid #f1f5f9;
                    box-shadow:0 2px 8px rgba(0,0,0,0.04);
                    cursor:pointer;
                    transition:all 0.3s; animation:cardIn 0.4s ease both;
                }
                .month-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.08); border-color:#c7d2fe; }
                .month-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem; }
                .month-name { font-weight:700; font-size:0.95rem; color:#1e293b; }
                .month-badge { padding:0.25rem 0.65rem; border-radius:8px; font-size:0.82rem; font-weight:700; }
                .month-bar-track { width:100%; height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden; margin-bottom:0.85rem; }
                .month-bar-fill { height:100%; border-radius:3px; transition:width 1s ease-out; }
                .month-stats { display:flex; gap:0.85rem; margin-bottom:0.65rem; }
                .m-stat { display:flex; align-items:center; gap:0.3rem; font-size:0.78rem; font-weight:500; color:#10b981; }
                .m-stat.absent { color:#ef4444; }
                .m-stat.total { color:#6366f1; }
                .view-details {
                    display:flex; align-items:center; gap:0.35rem;
                    font-size:0.78rem; color:#6366f1; font-weight:600;
                    padding-top:0.5rem; border-top:1px solid #f1f5f9;
                }

                /* DAILY VIEW */
                .daily-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:0.5rem; }
                .month-picker {
                    display:flex; align-items:center; gap:0.35rem;
                    background:white; border-radius:12px;
                    padding:0.3rem; box-shadow:0 2px 8px rgba(0,0,0,0.06);
                    border:1px solid #f1f5f9;
                }
                .month-picker button {
                    width:34px; height:34px; border:none; border-radius:8px;
                    background:transparent; cursor:pointer; color:#64748b;
                    display:flex; align-items:center; justify-content:center;
                    transition:all 0.2s;
                }
                .month-picker button:hover { background:#f1f5f9; color:#6366f1; }
                .current-month { font-weight:700; font-size:0.88rem; color:#1e293b; padding:0 0.6rem; min-width:140px; text-align:center; }

                .daily-list { display:flex; flex-direction:column; gap:0.75rem; }
                .day-card {
                    display:flex; align-items:center; justify-content:space-between; gap:1rem;
                    background:white; border-radius:14px;
                    padding:1rem 1.25rem;
                    border:1px solid #f1f5f9;
                    box-shadow:0 2px 6px rgba(0,0,0,0.03);
                    animation:cardIn 0.35s ease both;
                    transition:all 0.2s;
                }
                .day-card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.06); }
                .day-left { display:flex; align-items:center; gap:0.85rem; }
                .day-date-box {
                    width:48px; height:48px; border-radius:12px;
                    background:linear-gradient(135deg, #6366f1, #8b5cf6);
                    color:white; display:flex; flex-direction:column;
                    align-items:center; justify-content:center;
                    flex-shrink:0;
                }
                .day-num { font-size:1.1rem; font-weight:800; line-height:1; }
                .day-name { font-size:0.6rem; font-weight:600; opacity:0.85; text-transform:uppercase; }
                .day-summary { display:flex; flex-direction:column; gap:0.15rem; }
                .day-label { font-weight:600; font-size:0.88rem; color:#1e293b; }
                .day-ratio { display:flex; align-items:center; gap:0.3rem; font-size:0.78rem; color:#10b981; font-weight:500; }

                .day-periods { display:flex; gap:0.4rem; flex-wrap:wrap; }
                .period-chip {
                    display:flex; align-items:center; gap:0.25rem;
                    padding:0.3rem 0.55rem; border-radius:8px;
                    font-size:0.72rem; font-weight:600;
                    transition:all 0.2s;
                }
                .period-chip.present { background:#ecfdf5; color:#065f46; }
                .period-chip.absent { background:#fef2f2; color:#991b1b; }
                .p-num { font-weight:700; }

                /* Responsive */
                @media (max-width: 700px) {
                    .hero-card { flex-direction:column; text-align:center; gap:1.5rem; }
                    .stat-pills { justify-content:center; }
                    .day-card { flex-direction:column; align-items:flex-start; }
                    .day-periods { width:100%; }
                    .daily-header { flex-direction:column; }
                }
            `}</style>
        </div>
    );
};

export default StudentAttendanceView;
