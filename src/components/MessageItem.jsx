import React, { useState } from "react";
import "./MessageItem.css";

export default function MessageItem({ message }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get status icon based on message status
  const getStatusIcon = () => {
    switch(message.status) {
      case 'unread':
        return <span className="status-icon unread">●</span>;
      case 'archived':
        return <span className="status-icon archived">📁</span>;
      default:
        return <span className="status-icon read">✓</span>;
    }
  };

  return (
    <div 
      className={`message-item ${message.status === 'unread' ? 'unread' : ''} ${isExpanded ? 'expanded' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="message-avatar">
        <img 
          src={message.avatar || `https://ui-avatars.com/api/?name=${message.senderName}&background=4ecdc4&color=fff`} 
          alt={message.senderName}
        />
        {getStatusIcon()}
      </div>
      
      <div className="message-content">
        <div className="message-header">
          <div className="sender-info">
            <span className="sender-name">{message.senderName}</span>
            <span className="message-time">{formatDate(message.timestamp)}</span>
          </div>
          <div className="message-subject">{message.subject}</div>
        </div>
        
        <div className="message-preview">
          {message.preview}
        </div>
        
        {isExpanded && (
          <div className="message-details">
            <div className="message-body">
              {message.body || "No message content available. This is a placeholder for the actual message content."}
            </div>
            <div className="message-actions">
              <button className="action-btn reply">Reply</button>
              <button className="action-btn archive">
                {message.status === 'archived' ? 'Unarchive' : 'Archive'}
              </button>
              <button className="action-btn delete">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}