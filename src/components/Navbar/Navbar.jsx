import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import "./Navbar.css";

export default function Navbar() {
  // ✅ استخدام آمن لـ useSelector مع قيم افتراضية
  const authState = useSelector((state) => state.auth);
  const user = authState?.user || null;
  const dispatch = useDispatch();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ✅ Scroll hide/show effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setHidden(true); // Hide on scroll down
      } else {
        setHidden(false); // Show on scroll up
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // ✅ Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.nav-menu') && !e.target.closest('.nav-toggle')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  // ✅ إغلاق القائمة عند تغيير المسار
  useEffect(() => {
    setMenuOpen(false);
  }, [window.location.pathname]);

  // ✅ تحديد الرابط حسب نوع المستخدم بشكل صحيح
  const getDashboardLink = () => {
    if (!user) return "/";
    
    // استخدام roles إذا كان موجوداً أو role
    const userRole = user.roles?.[0] || user.role;
    
    switch (userRole?.toLowerCase()) {
      case "user":
      case "client":
      case "claint": // تصحيح الخطأ الإملائي
        return "/ClientDashboard";
      case "admin":
        return "/AdminDashboard";
      case "provider":
      case "freelancer":
      case "company":
        return "/FreelancerDashboard";
      default:
        return "/";
    }
  };

  // ✅ Get user role display name
  const getUserRoleDisplay = () => {
    if (!user) return "";
    
    const userRole = user.roles?.[0] || user.role;
    
    switch (userRole?.toLowerCase()) {
      case "user":
      case "client":
        return "Client";
      case "admin":
        return "Admin";
      case "provider":
      case "freelancer":
        return "Service Provider";
      case "company":
        return "Company";
      default:
        return "User";
    }
  };

  // ✅ Get user display name
  const getUserDisplayName = () => {
    if (!user) return "User";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    return user.name || user.email || user.username || "User";
  };

  // ✅ Handle logout
  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    
    // تنظيف إضافي للتخزين المحلي
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");
    sessionStorage.clear();
  };

  // ✅ Handle menu toggle
  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  // ✅ Handle link click
  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${hidden ? "navbar--hidden" : ""}`}>
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={handleLinkClick}>
          <span className="logo-icon">🏠</span>
          <span className="logo-highlight">Care</span>Home
        </Link>

        {/* Hamburger Icon */}
        <div 
          className={`nav-toggle ${menuOpen ? "active" : ""}`} 
          onClick={handleMenuToggle}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* Navigation Links */}
        <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
          {/* Main Navigation */}
          <li>
            <Link to="/" onClick={handleLinkClick}>Home</Link>
          </li>
          <li>
            <Link to="/JobsList" onClick={handleLinkClick}>Jobs</Link>
          </li>
 

          {/* Conditional Navigation based on auth */}
          {!user ? (
            // Not authenticated - Show login/register
            <>
              <li className="nav-auth">
                <Link to="/login" className="btn-login" onClick={handleLinkClick}>
                  <span className="btn-icon">🔐</span>
                  Login
                </Link>
              </li>
              <li className="nav-auth">
                <Link to="/register" className="btn-register" onClick={handleLinkClick}>
                  <span className="btn-icon">👤</span>
                  Register
                </Link>
              </li>
            </>
          ) : (
            // Authenticated - Show user info and actions
            <>
              

              {/* Messages & Notifications */}
              <li className="nav-quick-actions">
                <Link to="/messages" className="nav-action-btn" onClick={handleLinkClick}>
                  <span className="action-icon"></span>
                  <span className="action-text">Messages</span>
                </Link>
                <Link to="/notifications" className="nav-action-btn" onClick={handleLinkClick}>
                  <span className="action-icon"></span>
                  <span className="action-text">Notifications</span>
                </Link>
              </li>

              {/* Dashboard */}
              <li>
                <Link
                  to={getDashboardLink()}
                  className="btn-dashboard"
                  onClick={handleLinkClick}
                >
                  <span className="dashboard-icon">📊</span>
                  Dashboard
                </Link>
              </li>
              {/* Logout */}
              <li>
                <button
                  onClick={handleLogout}
                  className="btn-logout"
                >
                  <span className="logout-icon">🚪</span>
                  Logout
                </button>
              </li>
              {/* User Information */}
              <li className="nav-user-info">
                <div className="user-welcome">
                  <span className="welcome-text">Welcome,</span>
                  <span className="user-name">{getUserDisplayName()}</span>
                  <span className="user-role">{getUserRoleDisplay()}</span>
                </div>
              </li>
            </>
          )}
        </ul>

        {/* Mobile User Info (shown only on mobile when menu is open) */}
        {user && menuOpen && (
          <div className="mobile-user-info">
            <div className="user-avatar">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-details">
              <div className="user-name-mobile">{getUserDisplayName()}</div>
              <div className="user-role-mobile">{getUserRoleDisplay()}</div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}