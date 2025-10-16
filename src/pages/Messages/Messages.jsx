import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages } from "../../redux/messagesSlice";
import MessageItem from "../../components/MessageItem"; // استدعاء من مجلد components
import "./Messages.css";

export default function Messages() {
  const dispatch = useDispatch();
  const { messages, status, error } = useSelector((state) => state.messages);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMessages());
    }
  }, [dispatch, status]);

  // فلترة الرسائل حسب الفلتر والبحث
  const filteredMessages = messages.filter((message) => {
    const matchesFilter = filter === "all" || message.status === filter;
    const matchesSearch =
      message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="messages-container">
      {/* الهيدر */}
      <div className="messages-header">
        <div className="messages-header-content">
          <h2 className="messages-title">Messages</h2>
          <p className="messages-subtitle">Manage your conversations</p>
        </div>

        <div className="messages-search">
          <div className="messages-search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="messages-content">
        {/* الشريط الجانبي */}
        <div className="messages-sidebar">
          <div className="filter-section">
            <h3>Filter by</h3>
            <div className="filter-options">
              <button
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All Messages
              </button>
              <button
                className={`filter-btn ${filter === "unread" ? "active" : ""}`}
                onClick={() => setFilter("unread")}
              >
                Unread
              </button>
              <button
                className={`filter-btn ${filter === "archived" ? "active" : ""}`}
                onClick={() => setFilter("archived")}
              >
                Archived
              </button>
            </div>
          </div>

          <div className="messages-quick-stats">
            <h3>Overview</h3>
            <div className="messages-stat-item">
              <span className="messages-stat-label">Total conversations</span>
              <span className="messages-stat-value">{messages.length}</span>
            </div>
            <div className="messages-stat-item">
              <span className="messages-stat-label">Unread</span>
              <span className="messages-stat-value">
                {messages.filter((m) => m.status === "unread").length}
              </span>
            </div>
          </div>
        </div>

        {/* الرسائل الرئيسية */}
        <div className="messages-main">
          <div className="messages-toolbar">
            <div className="messages-stats">
              <span>
                {filteredMessages.length} conversation
                {filteredMessages.length !== 1 ? "s" : ""}
                {filter !== "all" && ` (filtered)`}
              </span>
              {filter !== "all" && (
                <button
                  className="clear-filter-btn"
                  onClick={() => setFilter("all")}
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="view-options">
              <button className="view-option-btn active">Latest</button>
              <button className="view-option-btn">Unread</button>
            </div>
          </div>

          {/* حالة التحميل */}
          {status === "loading" && (
            <div className="messages-loading">
              <div className="loading-spinner"></div>
              <p>Loading your conversations...</p>
            </div>
          )}

          {/* حالة الخطأ */}
          {status === "failed" && (
            <div className="messages-error">
              <div className="error-icon">⚠️</div>
              <h3>Couldn't load messages</h3>
              <p className="error-text">
                {error || "Please check your connection and try again"}
              </p>
              <button
                className="retry-button"
                onClick={() => dispatch(fetchMessages())}
              >
                Try Again
              </button>
            </div>
          )}

          {/* حالة النجاح */}
          {status === "succeeded" && (
            <>
              {filteredMessages.length ? (
                <div className="messages-list">
                  {filteredMessages.map((m) => (
                    <MessageItem key={m.id} message={m} />
                  ))}
                </div>
              ) : (
                <div className="messages-empty">
                  <div className="empty-icon">💬</div>
                  <h3>No conversations found</h3>
                  <p>
                    {searchTerm || filter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Your messages will appear here once you start conversations"}
                  </p>
                  {(searchTerm || filter !== "all") && (
                    <button
                      className="clear-filters-btn"
                      onClick={() => {
                        setFilter("all");
                        setSearchTerm("");
                      }}
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
