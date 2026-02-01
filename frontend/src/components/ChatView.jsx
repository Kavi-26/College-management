import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:5000");

const ChatView = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // Room Logic: 
    // If Student: Department-Year-Section (e.g., BCA-III-A)
    // If Faculty: Can select which room to join (for now defaulting to BCA-III-A for demo)
    // Ideally faculty should pick from a list.

    const [room, setRoom] = useState('');
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (user.role === 'student') {
            const studentRoom = `${user.department}-${user.year}-${user.section}`;
            setRoom(studentRoom);
            if (studentRoom !== "") {
                socket.emit("join_room", studentRoom);
                fetchHistory(studentRoom);
            }
        } else {
            // Default room for faculty for now
            const defaultRoom = 'BCA-III-A';
            setRoom(defaultRoom);
            socket.emit("join_room", defaultRoom);
            fetchHistory(defaultRoom);
        }
    }, []);

    const fetchHistory = async (roomName) => {
        try {
            const res = await fetch(`http://localhost:5000/api/chat/history/${roomName}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            // Map DB fields to UI fields if needed, or use as is
            // DB: text, sender_name, created_at
            // UI expects: message, author, time
            const formatted = data.map(msg => ({
                id: msg.id,
                message: msg.text,
                author: msg.sender_name,
                sender_id: msg.sender_id,
                time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setMessageList(formatted);
            scrollToBottom();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const handleReceiveMessage = (data) => {
            setMessageList((list) => [...list, data]);
            scrollToBottom();
        };

        socket.on("receive_message", handleReceiveMessage);

        // Cleanup listener to prevent duplicates
        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, []);

    const sendMessage = async () => {
        if (currentMessage !== "") {
            const messageData = {
                room: room,
                author: user.name,
                sender_id: user.id,
                sender_name: user.name,
                sender_role: user.role,
                text: currentMessage, // for DB
                message: currentMessage, // for UI
                time: new Date(toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
            };

            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
            scrollToBottom();
        }
    };

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>💬 Community Chat</h3>
                <span className="room-badge">Room: {room}</span>
            </div>

            <div className="chat-body">
                {messageList.map((msg, index) => {
                    const isMe = msg.sender_id === user.id; // DB
                    // Check fallback if checking against socket payload which might reuse 'author'
                    // actually cleaner to use sender_id consistently

                    return (
                        <div key={index} className={`message-container ${isMe ? "you" : "other"}`}>
                            <div className="message-content">
                                <div className="message-meta">
                                    <span id="author">{msg.author || msg.sender_name}</span>
                                    <span id="time">{msg.time}</span>
                                </div>
                                <p>{msg.message}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div className="chat-footer">
                <input
                    type="text"
                    value={currentMessage}
                    placeholder="Type a message..."
                    onChange={(event) => setCurrentMessage(event.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={sendMessage}>&#9658;</button>
            </div>

            <style>{`
                .chat-container {
                    display: flex; flex-direction: column; height: 80vh; background: white;
                    border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden;
                    max-width: 900px; margin: 0 auto;
                }
                .chat-header {
                    background: var(--primary-color); color: white; padding: 1rem 1.5rem;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .chat-header h3 { margin: 0; font-size: 1.2rem; }
                .room-badge { background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.9rem; }
                
                .chat-body {
                    flex: 1; padding: 1.5rem; overflow-y: auto; background: #f9fafb;
                    display: flex; flex-direction: column; gap: 1rem;
                }
                
                .message-container { display: flex; width: 100%; }
                .you { justify-content: flex-end; }
                .other { justify-content: flex-start; }
                
                .message-content {
                    max-width: 60%; padding: 0.75rem 1rem; border-radius: 12px;
                    position: relative; word-wrap: break-word;
                }
                .you .message-content {
                    background: var(--primary-color); color: white;
                    border-bottom-right-radius: 2px;
                }
                .other .message-content {
                    background: white; color: #1f2937; border: 1px solid #e5e7eb;
                    border-bottom-left-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                
                .message-meta {
                    display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 0.25rem; font-size: 0.75rem;
                }
                .you .message-meta { color: rgba(255,255,255,0.9); }
                .other .message-meta { color: #6b7280; }
                
                .message-content p { margin: 0; line-height: 1.5; }
                
                .chat-footer {
                    padding: 1rem; background: white; border-top: 1px solid #e5e7eb; display: flex; gap: 0.5rem;
                }
                .chat-footer input {
                    flex: 1; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 25px;
                    outline: none; font-size: 1rem;
                }
                .chat-footer input:focus { border-color: var(--primary-color); }
                .chat-footer button {
                    width: 45px; height: 45px; border-radius: 50%; border: none;
                    background: var(--primary-color); color: white; font-size: 1.2rem;
                    cursor: pointer; display: flex; align-items: center; justify-content: center;
                    transition: transform 0.1s;
                }
                .chat-footer button:hover { transform: scale(1.05); }
            `}</style>
        </div>
    );
};

export default ChatView;
