import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AttendanceManager from '../components/AttendanceManager';
import StudentAttendanceView from '../components/StudentAttendanceView';
import TimetableView from '../components/TimetableView';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'attendance', etc.

  const [facultyStats, setFacultyStats] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      const u = JSON.parse(storedUser);
      setUser(u);

      // Fetch stats if faculty
      if (u.role === 'faculty') {
        fetch('http://localhost:5000/api/attendance/faculty-stats', {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        })
          .then(res => res.json())
          .then(data => setFacultyStats(data))
          .catch(err => console.error(err));
      }
    }
  }, [navigate]);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'attendance':
        if (user.role === 'student') return <StudentAttendanceView />;
        if (['faculty', 'admin'].includes(user.role)) return <AttendanceManager />;
        return null;
      case 'timetable':
        return <TimetableView />;
      case 'dashboard':
      default:
        return (
          <div className="content-area">
            <div className="card welcome-card">
              <h2>Welcome back, {user.name}! 👋</h2>
              <p>Here is what's happening in your department today.</p>
            </div>

            <div className="grid">
              <div
                className="card stat-card clickable"
                onClick={() => setActiveView('attendance')}
              >
                <h3>Attendance (Today)</h3>
                <div className="stat-value">
                  {user.role === 'faculty' && facultyStats ? `${facultyStats.todayPercentage}%` : 'View →'}
                </div>
              </div>
              <div className="card stat-card">
                <h3>Notices</h3>
                <div className="stat-value">3 New</div>
              </div>
              <div className="card stat-card">
                <h3>Upcoming Events</h3>
                <div className="stat-value">Freshers Day</div>
              </div>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">SmartCollege</div>
        <nav className="nav-menu">
          <button
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>

          {/* Show Attendance for All Roles */}
          <button
            className={`nav-item ${activeView === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveView('attendance')}
          >
            Attendance
          </button>

          <button
            className={`nav-item ${activeView === 'timetable' ? 'active' : ''}`}
            onClick={() => setActiveView('timetable')}
          >
            Timetable
          </button>
          <a href="#" className="nav-item">Notices</a>
          <a href="#" className="nav-item">Resources</a>
          <button onClick={handleLogout} className="nav-item logout">Logout</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h1 className="page-title">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h1>
          <div className="user-profile">
            <div className="avatar">{user.name.charAt(0)}</div>
            <span>{user.name} ({user.role})</span>
          </div>
        </header>

        <div className="content-area">
          {renderContent()}
        </div>
      </main>

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-color);
        }
        .sidebar {
          width: 250px;
          background-color: white;
          padding: 1.5rem;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary-color);
          margin-bottom: 2rem;
        }
        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .nav-item {
          padding: 0.75rem 1rem;
          border-radius: var(--radius);
          color: var(--text-light);
          font-weight: 500;
          transition: all 0.2s;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          text-decoration: none;
          display: block;
        }
        .nav-item:hover, .nav-item.active {
          background-color: #eef2ff;
          color: var(--primary-color);
        }
        .logout {
          margin-top: auto;
          color: #ef4444;
        }
        .logout:hover {
          background-color: #fee2e2;
          color: #ef4444;
        }
        .main-content {
          flex: 1;
        }
        .top-bar {
          background-color: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }
        .page-title {
          font-size: 1.25rem;
          font-weight: 600;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .avatar {
          width: 36px;
          height: 36px;
          background-color: var(--primary-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
        .content-area {
          padding: 2rem;
        }
        .welcome-card {
          margin-bottom: 2rem;
          background: linear-gradient(to right, #4f46e5, #4338ca);
          color: white;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .stat-card {
          cursor: pointer;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          transition: transform 0.2s;
        }
        .stat-card h3 {
          color: var(--text-light);
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-color);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
