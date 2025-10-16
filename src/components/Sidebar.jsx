import React from "react";
import "./Sidebar.css";

const Sidebar = ({ userType, activeSection, setActiveSection, profile, stats }) => {
  const studentMenu = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "applications", label: "Applications", icon: "📝" },
    { id: "cv", label: "My Resume", icon: "📄" },
    { id: "statistics", label: "Statistics", icon: "📈" }
  ];

  const companyMenu = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "jobs", label: "Job Management", icon: "💼" },
    { id: "applicants", label: "Applicants", icon: "👥" },
    { id: "statistics", label: "Statistics", icon: "📈" }
  ];

  const graduateMenu = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "applications", label: "Applications", icon: "📝" },
    { id: "cv", label: "My Resume", icon: "📄" },
    { id: "experience", label: "Experience", icon: "💼" },
    { id: "statistics", label: "Statistics", icon: "📈" }
  ];

  const menuItems = userType === "student" ? studentMenu : 
                   userType === "company" ? companyMenu : graduateMenu;

  const getStatsSummary = () => {
    if (userType === "student") {
      return `Applications: ${stats.applicationsCount || 0}`;
    } else if (userType === "company") {
      return `Jobs: ${stats.publishedJobs || 0}`;
    } else {
      return `Applications: ${stats.applicationsCount || 0}`;
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="profile-avatar">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile.name} />
            ) : (
              <span>{profile?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="profile-info">
            <h3 className="user-name">{profile?.name || "User Name"}</h3>
            <p className="user-role">
              {userType === "student" ? "Student" : 
               userType === "company" ? "Company" : "Graduate"}
            </p>
            <p className="user-stats">{getStatsSummary()}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h4 className="nav-section-title">Main Menu</h4>
          <ul className="nav-menu">
            {menuItems.map(item => (
              <li key={item.id}>
                <button 
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {activeSection === item.id && <div className="active-indicator"></div>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-section">
          <h4 className="nav-section-title">Quick Access</h4>
          <ul className="nav-menu">
            <li>
              <button className="nav-item">
                <span className="nav-icon">🔔</span>
                <span className="nav-label">Notifications</span>
                <span className="nav-badge">3</span>
              </button>
            </li>
            <li>
              <button className="nav-item">
                <span className="nav-icon">✉️</span>
                <span className="nav-label">Messages</span>
              </button>
            </li>
            <li>
              <button className="nav-item">
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-actions">
          <button className="help-button">
            <span className="help-icon">❓</span>
            Help & Support
          </button>
          <button className="logout-button">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
        
        <div className="sidebar-status">
          <div className="status-indicator"></div>
          <span>Online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;