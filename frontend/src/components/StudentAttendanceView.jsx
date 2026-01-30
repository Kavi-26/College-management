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

    if (loading) return <div>Loading attendance data...</div>;
    if (!stats) return <div>No attendance records found.</div>;

    const getColor = (pct) => {
        if (pct >= 85) return 'green';
        if (pct >= 75) return 'orange';
        return 'red';
    };

    return (
        <div className="student-attendance">
            <h2>My Attendance</h2>

            {/* Overall Card */}
            <div className="card overview-card">
                <div className="circle-chart" style={{ borderColor: getColor(stats.overall) }}>
                    <span className="percentage">{stats.overall}%</span>
                    <span className="label">Overall</span>
                </div>
                <div className="details">
                    <p>Total Classes: <strong>{stats.totalClasses}</strong></p>
                    <p>Attended: <strong>{stats.classesAttended}</strong></p>
                    {stats.overall < 75 && (
                        <div className="warning-badge">⚠️ Low Attendance!</div>
                    )}
                </div>
            </div>

            {/* Subject-wise List */}
            <h3>Subject-wise Breakdown</h3>
            <div className="subject-list grid">
                {Object.entries(stats.subjects).map(([subject, data]) => (
                    <div key={subject} className="card subject-card">
                        <h4>{subject}</h4>
                        <div className="progress-bar-bg">
                            <div
                                className="progress-bar-fill"
                                style={{
                                    width: `${data.percentage}%`,
                                    backgroundColor: getColor(data.percentage)
                                }}
                            ></div>
                        </div>
                        <div className="subject-stats">
                            <span>{data.percentage}%</span>
                            <span>{data.present}/{data.total} Classes</span>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .student-attendance {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .overview-card {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    padding: 2rem;
                }
                .circle-chart {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    border: 8px solid #ddd;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .percentage {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-color);
                }
                .label {
                    font-size: 0.8rem;
                    color: var(--text-light);
                }
                .warning-badge {
                    margin-top: 0.5rem;
                    color: #b91c1c;
                    background-color: #fecaca;
                    padding: 0.3rem 0.6rem;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: inline-block;
                }
                .subject-card h4 {
                    margin-bottom: 1rem;
                }
                .progress-bar-bg {
                    width: 100%;
                    height: 10px;
                    background-color: #e5e7eb;
                    border-radius: 5px;
                    margin-bottom: 0.5rem;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%;
                    border-radius: 5px;
                    transition: width 0.5s ease;
                }
                .subject-stats {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    color: var(--text-light);
                }
            `}</style>
        </div>
    );
};

export default StudentAttendanceView;
