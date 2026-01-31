import React, { useEffect, useState } from 'react';

const StudentAttendanceView = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/attendance/my-stats', {
                    headers: { 'x-auth-token': token }
                });
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    if (loading) return <div className="loading">Loading attendance details...</div>;
    if (!stats) return <div className="no-data">No attendance records found for you.</div>;

    const getColor = (pct) => {
        if (pct >= 85) return 'var(--success-color)';
        if (pct >= 75) return 'var(--warning-color)';
        return 'var(--danger-color)';
    };

    return (
        <div className="student-attendance">
            <h2>My Attendance Dashboard</h2>

            {/* Overall Stats Big Card */}
            <div className={`card overview-card ${stats.overall < 75 ? 'warning-bg' : ''}`}>
                <div className="chart-container">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                        <path className="circle-bg"
                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path className="circle"
                            strokeDasharray={`${stats.overall}, 100`}
                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                            style={{ stroke: getColor(stats.overall) }}
                        />
                        <text x="18" y="20.35" className="percentage-text">{stats.overall}%</text>
                    </svg>
                </div>
                <div className="overview-details">
                    <h3>Overall Attendance</h3>
                    <div className="stat-row">
                        <span>Total Classes Conducted:</span>
                        <strong>{stats.totalClasses}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Classes Attended:</span>
                        <strong>{stats.classesAttended}</strong>
                    </div>
                    {stats.overall < 75 && (
                        <div className="alert-badge">
                            ⚠️ Low Attendance Warning! Please attend more classes.
                        </div>
                    )}
                </div>
            </div>

            {/* Subject-wise Breakdown */}
            <h3>Subject Performance</h3>
            <div className="subjects-grid">
                {stats.subjects && Object.entries(stats.subjects).map(([subject, data]) => (
                    <div key={subject} className="card subject-card">
                        <div className="subject-header">
                            <h4>{subject}</h4>
                            <span className={`badge ${data.percentage >= 75 ? 'good' : 'bad'}`}>
                                {data.percentage}%
                            </span>
                        </div>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${data.percentage}%`,
                                    backgroundColor: getColor(data.percentage)
                                }}
                            ></div>
                        </div>
                        <div className="subject-footer">
                            <small>{data.present}/{data.total} Sessions</small>
                            <small className={data.percentage < 75 ? 'text-danger' : 'text-success'}>
                                {data.percentage < 75 ? 'Needs Improvement' : 'Good Standing'}
                            </small>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                :root {
                    --success-color: #10b981; /* Green */
                    --warning-color: #f59e0b; /* Orange */
                    --danger-color: #ef4444; /* Red */
                }
                .student-attendance {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    padding-bottom: 2rem;
                }
                h2, h3 { color: var(--text-color); }
                
                /* Circular Chart */
                .circular-chart {
                    display: block;
                    margin: 10px auto;
                    max-width: 120px;
                    max-height: 120px;
                }
                .circle-bg {
                    fill: none;
                    stroke: #eee;
                    stroke-width: 3.8;
                }
                .circle {
                    fill: none;
                    stroke-width: 3.8;
                    stroke-linecap: round;
                    animation: progress 1s ease-out forwards;
                }
                .percentage-text {
                    fill: #666;
                    font-family: sans-serif;
                    font-weight: bold;
                    font-size: 0.5em;
                    text-anchor: middle;
                }

                @keyframes progress {
                    0% { stroke-dasharray: 0 100; }
                }

                .overview-card {
                    display: flex;
                    align-items: center;
                    gap: 3rem;
                    padding: 2rem;
                    background: white;
                }
                .warning-bg {
                    border-left: 5px solid var(--danger-color);
                }
                .overview-details {
                    flex: 1;
                }
                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    max-width: 300px;
                    margin-bottom: 0.5rem;
                    color: var(--text-light);
                }
                .stat-row strong { color: var(--text-color); }
                
                .alert-badge {
                    margin-top: 1rem;
                    background-color: #fee2e2;
                    color: #991b1b;
                    padding: 0.75rem;
                    border-radius: 6px;
                    font-weight: 500;
                    display: inline-block;
                }

                /* Subjects Grid */
                .subjects-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                .subject-card {
                    padding: 1.5rem;
                    transition: transform 0.2s;
                }
                .subject-card:hover {
                    transform: translateY(-3px);
                }
                .subject-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .subject-header h4 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: var(--primary-color);
                }
                .badge {
                    padding: 0.25rem 0.6rem;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: bold;
                }
                .badge.good { background-color: #d1fae5; color: #065f46; }
                .badge.bad { background-color: #fee2e2; color: #991b1b; }

                .progress-bar-container {
                    width: 100%;
                    height: 8px;
                    background-color: #f3f4f6;
                    border-radius: 4px;
                    margin-bottom: 1rem;
                    overflow: hidden;
                }
                .progress-bar {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 1s ease-in-out;
                }

                .subject-footer {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    color: var(--text-light);
                }
                .text-danger { color: var(--danger-color); font-weight: 500; }
                .text-success { color: var(--success-color); font-weight: 500; }

                .loading, .no-data {
                    padding: 3rem;
                    text-align: center;
                    color: var(--text-light);
                    font-size: 1.1rem;
                }
            `}</style>
        </div>
    );
};

export default StudentAttendanceView;
