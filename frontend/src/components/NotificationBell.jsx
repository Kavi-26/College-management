import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // We use a separate socket connection or reuse? 
    // Ideally reuse, but for simplicity we create one or assume global socket from context.
    // Let's create one here since we haven't set up context.
    const socketRef = useRef();

    useEffect(() => {
        // Initial Fetch
        fetchNotifications();

        // Socket setup
        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('join_user_room', user.id);

        socketRef.current.on('notification', (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            // Optional: Play sound
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/notifications', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="notification-bell-container">
            <button className="bell-icon" onClick={toggleOpen}>
                🔔
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="dropdown">
                    <div className="dropdown-header">
                        <h4>Notifications</h4>
                        <button onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className="list">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} className={`item ${!n.is_read ? 'unread' : ''}`} onClick={() => !n.is_read && handleMarkAsRead(n.id)}>
                                    <div className="icon">
                                        {n.type === 'attendance' && '📅'}
                                        {n.type === 'result' && '🎓'}
                                        {n.type === 'event' && '🎉'}
                                        {n.type === 'chat' && '💬'}
                                    </div>
                                    <div className="content">
                                        <div className="title">{n.title}</div>
                                        <div className="msg">{n.message}</div>
                                        <div className="time">{new Date(n.created_at).toLocaleString()}</div>
                                    </div>
                                    {!n.is_read && <div className="dot"></div>}
                                </div>
                            ))
                        ) : (
                            <div className="empty">No notifications</div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .notification-bell-container { position: relative; }
                .bell-icon { background: none; border: none; font-size: 1.5rem; cursor: pointer; position: relative; }
                .badge { 
                    position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; 
                    border-radius: 50%; width: 18px; height: 18px; font-size: 0.75rem; 
                    display: flex; align-items: center; justify-content: center; font-weight: bold;
                }
                
                .dropdown {
                    position: absolute; top: 100%; right: 0; width: 320px;
                    background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 100; border: 1px solid #e5e7eb; overflow: hidden;
                    margin-top: 10px;
                }
                .dropdown-header {
                    padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;
                    background: #f9fafb;
                }
                .dropdown-header h4 { margin: 0; font-size: 0.95rem; color: #374151; }
                .dropdown-header button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #9ca3af; }
                
                .list { max-height: 400px; overflow-y: auto; }
                .item { padding: 1rem; border-bottom: 1px solid #f3f4f6; cursor: pointer; display: flex; gap: 0.75rem; transition: background 0.2s; }
                .item:hover { background: #f9fafb; }
                .item.unread { background: #eff6ff; }
                
                .icon { font-size: 1.2rem; }
                .content { flex: 1; }
                .title { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem; color: #1f2937; }
                .msg { font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem; line-height: 1.4; }
                .time { font-size: 0.7rem; color: #9ca3af; }
                
                .dot { width: 8px; height: 8px; background: var(--primary-color); border-radius: 50%; margin-top: 5px; }
                .empty { padding: 2rem; text-align: center; color: #9ca3af; font-size: 0.9rem; }
            `}</style>
        </div>
    );
};

export default NotificationBell;
