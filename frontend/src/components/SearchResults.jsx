import React from 'react';

const SearchResults = ({ results, onClose, onNavigate }) => {
    if (!results || results.length === 0) return null;

    return (
        <div className="search-results-dropdown">
            <div className="search-header">
                <h4>Search Results ({results.length})</h4>
                <button onClick={onClose}>×</button>
            </div>
            <div className="results-list">
                {results.map((item, index) => (
                    <div
                        key={`${item.type}-${item.id}-${index}`}
                        className="result-item"
                        onClick={() => onNavigate(item)}
                    >
                        <div className="icon">
                            {item.type === 'student' && '👨‍🎓'}
                            {item.type === 'notice' && '📢'}
                            {item.type === 'event' && '📅'}
                            {item.type === 'resource' && '📚'}
                        </div>
                        <div className="info">
                            <div className="title">{item.title}</div>
                            <div className="subtitle">{item.subtitle} • {item.type.toUpperCase()}</div>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                .search-results-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    z-index: 50;
                    margin-top: 0.5rem;
                    max-height: 400px;
                    overflow-y: auto;
                }
                .search-header {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #f3f4f6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.875rem;
                    color: #6b7280;
                    background: #f9fafb;
                }
                .search-header button { border: none; background: none; font-size: 1.2rem; cursor: pointer; }
                .result-item {
                    padding: 0.75rem 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: background 0.2s;
                    border-bottom: 1px solid #f3f4f6;
                }
                .result-item:last-child { border-bottom: none; }
                .result-item:hover { background-color: #f3f4f6; }
                .icon { font-size: 1.25rem; }
                .info { flex: 1; }
                .title { font-weight: 500; font-size: 0.95rem; color: #1f2937; }
                .subtitle { font-size: 0.75rem; color: #9ca3af; }
            `}</style>
        </div>
    );
};

export default SearchResults;
