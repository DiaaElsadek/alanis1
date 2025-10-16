import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markAllRead, markAsRead } from "../../redux/notificationsSlice";
import "./Notifications.css";

export default function Notifications() {
  const dispatch = useDispatch();
  const { items, status } = useSelector(state => state.notifications);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNotifications());
    }
  }, [dispatch, status]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInHours = (now - notificationDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return notificationDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }
  };

  const unreadCount = items.filter(item => !item.read).length;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="header-content">
          <h2 className="notifications-title">Notifications</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
        {items.length > 0 && unreadCount > 0 && (
          <button 
            onClick={() => dispatch(markAllRead())} 
            className="mark-all-read-btn"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="notifications-content">
        <div className="notifications-list">
          {status === "loading" ? (
            <div className="notifications-loading">
              <div className="loading-spinner"></div>
              <p>Loading your notifications...</p>
            </div>
          ) : items.length ? (
            items.map(n => (
              <div 
                key={n.id} 
                className={`notification-item ${n.read ? "read" : "unread"}`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="notification-icon">
                  {n.type === 'success' && (
                    <div className="icon-wrapper success">
                      <span>✓</span>
                    </div>
                  )}
                  {n.type === 'warning' && (
                    <div className="icon-wrapper warning">
                      <span>!</span>
                    </div>
                  )}
                  {n.type === 'error' && (
                    <div className="icon-wrapper error">
                      <span>✕</span>
                    </div>
                  )}
                  {!n.type && (
                    <div className="icon-wrapper default">
                      <span>💬</span>
                    </div>
                  )}
                </div>
                <div className="notification-content">
                  <p className="notification-message">{n.message}</p>
                  <span className="notification-time">{formatTime(n.createdAt)}</span>
                </div>
                {!n.read && <div className="unread-indicator"></div>}
              </div>
            ))
          ) : (
            <div className="notifications-empty">
              <div className="empty-icon">🔔</div>
              <h3>No notifications yet</h3>
              <p>We'll notify you when something arrives</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}