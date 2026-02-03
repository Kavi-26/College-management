import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardCheck, Calendar, Bell, Award,
  MessageCircle, BookOpen, Settings, LogOut, Search, User,
  Menu, X, Shield, Plus, FileText, CheckCircle
} from 'lucide-react';

// Components
import AttendanceManager from '../components/AttendanceManager';
import StudentAttendanceView from '../components/StudentAttendanceView';
import TimetableView from '../components/TimetableView';
import NoticeBoard from '../components/NoticeBoard';
import ResultView from '../components/ResultView';
import EventsView from '../components/EventsView';
import ChatView from '../components/ChatView';
import NotificationBell from '../components/NotificationBell';
import ResourceBrowser from '../components/ResourceBrowser';
import AdminPanel from '../components/AdminPanel';
import SearchResults from '../components/SearchResults';
import SettingsView from '../components/SettingsView';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data for widgets
  const [facultyStats, setFacultyStats] = useState(null);
  const [recentNotices, setRecentNotices] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      const u = JSON.parse(storedUser);
      setUser(u);
      const token = localStorage.getItem('token');

      // Fetch Faculty Stats
      if (u.role === 'faculty') {
        fetch('http://localhost:5000/api/attendance/faculty-stats', {
          headers: { 'x-auth-token': token }
        })
          .then(res => res.json())
          .then(data => setFacultyStats(data))
          .catch(err => console.error(err));
      }

      // Fetch Recent Notices for Activity Feed
      fetch('http://localhost:5000/api/notices?limit=5', {
        headers: { 'x-auth-token': token }
      })
        .then(res => res.json())
        .then(data => setRecentNotices(data.slice(0, 3))) // Just top 3
        .catch(err => console.error(err));
    }
  }, [navigate]);

  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setShowSearchResults(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/search?q=${query}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await res.json();
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (err) { console.error(err); }
  };

  const handleSearchResultClick = (item) => {
    setShowSearchResults(false);
    if (item.type === 'notice') setActiveView('notices');
    if (item.type === 'event') setActiveView('events');
    if (item.type === 'resource') setActiveView('resources');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      className={`nav-item ${activeView === id ? 'active' : ''}`}
      onClick={() => { setActiveView(id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const QuickAction = ({ icon: Icon, label, action, color }) => (
    <div className="quick-action-card" onClick={action} style={{ '--accent': color }}>
      <div className="qa-icon"><Icon size={24} /></div>
      <span>{label}</span>
    </div>
  );

  const renderDashboardHome = () => (
    <div className="dashboard-home animate-fade-in">
      {/* Welcome Section */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p>You have {recentNotices.length} new updates today.</p>
        </div>
        <div className="date-badge">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Quick Actions Widget */}
        <div className="widget quick-actions">
          <h3>Quick Actions</h3>
          <div className="qa-grid">
            <QuickAction icon={Calendar} label="Timetable" action={() => setActiveView('timetable')} color="#6366f1" />
            <QuickAction icon={Bell} label="Notices" action={() => setActiveView('notices')} color="#ec4899" />

            {user.role === 'faculty' && (
              <>
                <QuickAction icon={ClipboardCheck} label="Attendance" action={() => setActiveView('attendance')} color="#10b981" />
                <QuickAction icon={Plus} label="Upload" action={() => setActiveView('resources')} color="#f59e0b" />
              </>
            )}
            {user.role === 'student' && (
              <>
                <QuickAction icon={Award} label="Results" action={() => setActiveView('results')} color="#8b5cf6" />
                <QuickAction icon={BookOpen} label="Resources" action={() => setActiveView('resources')} color="#06b6d4" />
              </>
            )}
            {user.role === 'admin' && (
              <QuickAction icon={Shield} label="Admin" action={() => setActiveView('admin')} color="#ef4444" />
            )}
          </div>
        </div>

        {/* Stats Widget */}
        <div className="widget stats-widget">
          <h3>Overview</h3>
          <div className="stats-list">
            <div className="stat-row">
              <div className="stat-icon b-blue"><ClipboardCheck size={18} /></div>
              <div className="stat-info">
                <span>Attendance</span>
                <strong>{user.role === 'faculty' && facultyStats ? `${facultyStats.todayPercentage}% Marked` : 'Check Status'}</strong>
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-icon b-purple"><MessageCircle size={18} /></div>
              <div className="stat-info">
                <span>Messages</span>
                <strong>Join Chat</strong>
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-icon b-green"><Calendar size={18} /></div>
              <div className="stat-info">
                <span>Schedule</span>
                <strong>View Full</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="widget activity-feed">
          <h3>Recent Activity</h3>
          <div className="feed-list">
            {recentNotices.length > 0 ? (
              recentNotices.map((notice, idx) => (
                <div key={idx} className="feed-item" onClick={() => setActiveView('notices')}>
                  <div className="feed-icon"><FileText size={16} /></div>
                  <div className="feed-content">
                    <h4>{notice.title}</h4>
                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-feed">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'attendance': return user.role === 'student' ? <StudentAttendanceView /> : <AttendanceManager />;
      case 'timetable': return <TimetableView />;
      case 'notices': return <NoticeBoard />;
      case 'results': return <ResultView />;
      case 'events': return <EventsView />;
      case 'chat': return <ChatView />;
      case 'resources': return <ResourceBrowser />;
      case 'admin': return <AdminPanel />;
      case 'settings': return <SettingsView theme={theme} toggleTheme={toggleTheme} />;
      default: return renderDashboardHome();
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon"><div className="inner-sq"></div></div>
            {isSidebarOpen && <span>SmartCollege</span>}
          </div>
          <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="nav-menu">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="attendance" icon={ClipboardCheck} label="Attendance" />
          <NavItem id="timetable" icon={Calendar} label="Timetable" />
          <NavItem id="notices" icon={Bell} label="Notices" />
          <NavItem id="results" icon={Award} label="Results" />
          <NavItem id="events" icon={Calendar} label="Events" />
          <NavItem id="chat" icon={MessageCircle} label="Community" />
          <NavItem id="resources" icon={BookOpen} label="Resources" />
          {user.role === 'admin' && <NavItem id="admin" icon={Shield} label="Admin Panel" />}
        </nav>

        <div className="sidebar-footer">
          <NavItem id="settings" icon={Settings} label="Settings" />
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="header-left">
            <h2 className="page-title">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h2>
          </div>

          <div className="header-right">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => handleSearch(e.target.value)}
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results-dropdown">
                  {searchResults.map(item => (
                    <div key={item.id} className="search-item" onClick={() => handleSearchResultClick(item)}>
                      <span>{item.type.toUpperCase()}:</span> {item.title || item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <NotificationBell />

            <div className="user-profile clickable" onClick={() => navigate('/profile')}>
              <div className="avatar">
                {user.name.charAt(0)}
              </div>
              <div className="user-info">
                <span className="name">{user.name}</span>
                <span className="role">{user.role}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-scrollable">
          {renderContent()}
        </div>
      </main>

      <style>{`
        /* Layout */
        .dashboard-layout { display: flex; height: 100vh; background: var(--bg-color); overflow: hidden; }
        
        /* Sidebar */
        .sidebar { background: var(--bg-card); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; transition: width 0.3s ease; z-index: 50; }
        .sidebar.open { width: 260px; }
        .sidebar.closed { width: 80px; }
        
        .sidebar-header { padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; height: 70px; }
        .logo { display: flex; align-items: center; gap: 0.75rem; font-weight: 800; font-size: 1.25rem; color: var(--primary-color); }
        .logo-icon { width: 32px; height: 32px; background: var(--primary-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .inner-sq { width: 12px; height: 12px; background: white; border-radius: 2px; }
        .toggle-btn { background: none; border: none; cursor: pointer; color: var(--text-light); }

        .nav-menu { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; overflow-y: auto; }
        .nav-item { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1rem; border: none; background: transparent; color: var(--text-light); font-weight: 500; cursor: pointer; border-radius: var(--radius); transition: all 0.2s; text-decoration: none; width: 100%; }
        .nav-item:hover { background: rgba(99, 102, 241, 0.1); color: var(--primary-color); }
        .nav-item.active { background: var(--primary-color); color: white; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4); }
        .sidebar.closed .nav-item span { display: none; }
        .sidebar.closed .nav-item { justify-content: center; padding: 1rem; }

        .sidebar-footer { padding: 1rem; border-top: 1px solid var(--border-color); }
        .logout { color: #ef4444; }
        .logout:hover { background: #fee2e2; color: #ef4444; }

        /* Main Content */
        .main-content { flex: 1; display: flex; flex-direction: column; position: relative; }
        
        .top-bar { height: 70px; background: var(--glass-bg); backdrop-filter: blur(10px); border-bottom: 1px solid var(--glass-border); padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; z-index: 40; }
        .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-color); margin: 0; }
        
        .header-right { display: flex; align-items: center; gap: 1.5rem; }
        
        .search-wrapper { position: relative; background: var(--bg-input, #fff); border: 1px solid var(--border-color); border-radius: 20px; padding: 0.4rem 1rem; display: flex; align-items: center; gap: 0.5rem; width: 250px; transition: all 0.2s; }
        .search-wrapper:focus-within { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .search-wrapper input { border: none; outline: none; background: transparent; font-size: 0.9rem; width: 100%; color: var(--text-color); }
        .search-icon { color: var(--text-light); }
        
        .user-profile { display: flex; align-items: center; gap: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 30px; transition: background 0.2s; }
        .user-profile:hover { background: rgba(0,0,0,0.05); }
        .avatar { width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; box-shadow: var(--shadow-sm); }
        .user-info { display: flex; flex-direction: column; line-height: 1.2; }
        .name { font-weight: 600; font-size: 0.9rem; color: var(--text-color); }
        .role { font-size: 0.75rem; color: var(--text-light); text-transform: capitalize; }

        /* Content Area */
        .content-scrollable { flex: 1; overflow-y: auto; padding: 2rem; }
        
        /* Dashboard Home */
        .welcome-banner { background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); border-radius: var(--radius); padding: 2.5rem; color: white; margin-bottom: 2rem; position: relative; overflow: hidden; box-shadow: var(--shadow-lg); display: flex; justify-content: space-between; align-items: flex-end; }
        .welcome-banner h1 { margin: 0 0 0.5rem; font-size: 2rem; }
        .welcome-banner p { margin: 0; opacity: 0.9; }
        .date-badge { background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; font-weight: 500; backdrop-filter: blur(5px); }

        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        
        .widget { background: var(--bg-card); border-radius: var(--radius); padding: 1.5rem; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); }
        .widget h3 { margin: 0 0 1rem; font-size: 1.1rem; color: var(--text-color); }

        /* Quick Actions */
        .qa-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .quick-action-card { background: var(--bg-color); padding: 1rem; border-radius: var(--radius); cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; border: 1px solid transparent; text-align: center; }
        .quick-action-card:hover { border-color: var(--accent); background: white; box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .qa-icon { width: 40px; height: 40px; background: rgba(99, 102, 241, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--accent); }
        .quick-action-card span { font-size: 0.9rem; font-weight: 500; color: var(--text-color); }

        /* Overview List */
        .stats-list { display: flex; flex-direction: column; gap: 1rem; }
        .stat-row { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: var(--bg-color); border-radius: var(--radius); }
        .stat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .b-blue { background: #e0e7ff; color: #4338ca; }
        .b-purple { background: #f3e8ff; color: #7e22ce; }
        .b-green { background: #dcfce7; color: #15803d; }
        .stat-info { display: flex; flex-direction: column; }
        .stat-info span { font-size: 0.8rem; color: var(--text-light); }
        .stat-info strong { font-size: 0.95rem; color: var(--text-color); }

        /* Feed */
        .feed-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .feed-item { display: flex; gap: 1rem; padding: 0.75rem; border-radius: var(--radius); cursor: pointer; transition: background 0.2s; border-bottom: 1px solid var(--border-color); }
        .feed-item:last-child { border-bottom: none; }
        .feed-item:hover { background: var(--bg-color); }
        .feed-icon { margin-top: 3px; color: var(--secondary-color); }
        .feed-content h4 { margin: 0 0 0.25rem; font-size: 0.95rem; color: var(--text-color); font-weight: 600; }
        .feed-content span { font-size: 0.8rem; color: var(--text-light); }
        .empty-feed { color: var(--text-light); font-size: 0.9rem; text-align: center; padding: 1rem; }

        .search-results-dropdown { position: absolute; top: 100%; left: 0; width: 100%; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius); box-shadow: var(--shadow-lg); overflow: hidden; margin-top: 5px; z-index: 100; }
        .search-item { padding: 0.75rem 1rem; cursor: pointer; border-bottom: 1px solid var(--border-color); display: flex; gap: 0.5rem; font-size: 0.9rem; }
        .search-item:hover { background: var(--bg-color); }

        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
           .sidebar { position: absolute; height: 100%; box-shadow: var(--shadow-lg); }
           .sidebar.closed { transform: translateX(-100%); width: 0; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
