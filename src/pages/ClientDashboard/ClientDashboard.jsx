import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBookings } from "../../redux/bookingsSlice";
import { fetchServices } from "../../redux/servicesSlice";
import { fetchNotifications } from "../../redux/notificationsSlice";
import { fetchMessages } from "../../redux/messagesSlice";
import { logout } from "../../redux/authSlice"; // ✅ استيراد logout action
import ServiceCard from "../../components/ServiceCard";
import StatsCard from "../../components/StatsCard";
import { Link, useNavigate } from "react-router-dom";
import "./ClientDashboard.css";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // استخدام useSelector بشكل آمن
  const bookingsState = useSelector(state => state.bookings);
  const servicesState = useSelector(state => state.services);
  const notificationsState = useSelector(state => state.notifications);
  const messagesState = useSelector(state => state.messages);
  const authState = useSelector(state => state.auth);
  
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedServiceType, setSelectedServiceType] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // تحميل البيانات فقط إذا كان المستخدم مسجلاً الدخول
    if (authState.isAuthenticated) {
      dispatch(fetchMyBookings());
      dispatch(fetchServices());
      dispatch(fetchNotifications());
      dispatch(fetchMessages());
    }
  }, [dispatch, authState.isAuthenticated]);

  // معالجة آمنة للبيانات
  const myBookings = Array.isArray(bookingsState?.myBookings) ? bookingsState.myBookings : [];
  const services = Array.isArray(servicesState?.services) ? servicesState.services : [];
  const notifications = Array.isArray(notificationsState?.items) ? notificationsState.items : [];
  const messages = Array.isArray(messagesState?.messages) ? messagesState.messages : [];

  // حساب الإحصائيات بشكل آمن
  const bookingsCount = myBookings.length;
  const completedCount = myBookings.filter(booking => 
    booking?.status === "Completed" || booking?.status === "completed"
  ).length;
  const pendingCount = myBookings.filter(booking => 
    booking?.status === "Pending" || booking?.status === "pending"
  ).length;
  const cancelledCount = myBookings.filter(booking => 
    booking?.status === "Cancelled" || booking?.status === "cancelled"
  ).length;
  
  const totalSpent = myBookings.reduce((sum, booking) => {
    const price = parseFloat(booking?.price) || 0;
    return sum + price;
  }, 0);

  // عد الإشعارات والرسائل غير المقروءة بشكل آمن
  const unreadNotificationsCount = notifications.filter(n => !n?.read).length;
  const unreadMessagesCount = messages.filter(m => !m?.read).length;

  // بيانات الملف الشخصي من Redux أو بيانات افتراضية
  const userProfile = authState?.user || {};
  const mockProfile = {
    name: userProfile?.firstName && userProfile?.lastName 
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : userProfile?.name || "User",
    location: userProfile?.address || "Cairo, Egypt",
    memberSince: "2023",
    profileViews: 42,
    profileImage: userProfile?.profileImage || "/default-avatar.png",
    email: userProfile?.email || "user@example.com",
    phone: userProfile?.phoneNumber || "+20 123 456 7890"
  };

  // تصفية الخدمات حسب النوع
  const filteredServices = selectedServiceType === "all"
    ? services
    : services.filter(service => service?.category === selectedServiceType);

  // أول 4 خدمات كمقترحات
  const recommendedServices = services.slice(0, 4);

  // فئات الخدمات
  const serviceCategories = [
    { id: "all", name: "All Services", icon: "🏠" },
    { id: "childcare", name: "Child Care", icon: "👶" },
    { id: "eldercare", name: "Elder Care", icon: "👵" },
    { id: "nursing", name: "Nursing", icon: "💊" },
    { id: "housekeeping", name: "Housekeeping", icon: "🧹" }
  ];

  const handleChangePassword = () => {
    navigate("/ChangePassword");
  };

  // ✅ دالة تسجيل الخروج المحسنة
  const handleLogout = async () => {
    if (isLoggingOut) return; // منع النقر المتعدد
    
    setIsLoggingOut(true);
    
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      
      // محاولة تسجيل الخروج من السيرفر إذا كان هناك توكن
      if (token) {
        try {
          const response = await fetch("http://elanis.runasp.net/api/Account/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          if (response.ok) {
            console.log("✅ Logged out successfully from server");
          } else {
            console.warn("⚠️ Server logout failed, but continuing with local logout");
          }
        } catch (serverError) {
          console.warn("⚠️ Server logout error, but continuing with local logout:", serverError);
        }
      }

      // ✅ 1. إرسال action تسجيل الخروج إلى Redux
      dispatch(logout());
      
      // ✅ 2. تنظيف التخزين المحلي بشكل كامل
      const storageItems = [
        "authToken", "token", "userId", "userData", "refreshToken",
        "bookings", "services", "notifications", "messages"
      ];
      
      storageItems.forEach(item => {
        localStorage.removeItem(item);
        sessionStorage.removeItem(item);
      });
      
      // ✅ 3. مسح كامل للتخزين المؤقت
      localStorage.clear();
      sessionStorage.clear();
      
      // ✅ 4. إعادة تعيين حالة التطبيق
      setTimeout(() => {
        // ✅ 5. إعادة التوجيه للصفحة الرئيسية
        navigate("/", { replace: true });
        
        // ✅ 6. إعادة تحميل الصفحة لضمان تنظيف كامل للذاكرة
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error("❌ Logout error:", error);
      
      // حتى في حالة الخطأ، نظف البيانات المحلية
      dispatch(logout());
      localStorage.clear();
      sessionStorage.clear();
      navigate("/", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ✅ التحقق من مصادقة المستخدم
  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authState.isAuthenticated, navigate]);

  // مكون القائمة الجانبية
  const DashboardSidebar = () => {
    const navItems = [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "bookings", label: "My Bookings", icon: "📅" },
      { id: "providers", label: "Service Providers", icon: "👥" },
      { id: "favorites", label: "Favorites", icon: "⭐" },
      { id: "statistics", label: "Statistics", icon: "📈" },
      { id: "messages", label: "Messages", icon: "💬" },
      { id: "settings", label: "Settings", icon: "⚙️" }
    ];

    return (
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="profile-summary">
            <img 
              src={mockProfile.profileImage} 
              alt="Profile" 
              className="profile-image"
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
            <div className="profile-info">
              <h3>{mockProfile.name}</h3>
              <p>Client since {mockProfile.memberSince}</p>
              <span className="client-badge">👤 Client Account</span>
            </div>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
            disabled={isLoggingOut}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => {
                setActiveSection(item.id);
                setIsSidebarOpen(false);
              }}
              disabled={isLoggingOut}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
              {item.id === "messages" && unreadMessagesCount > 0 && (
                <span className="message-badge">{unreadMessagesCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="stat-value">{bookingsCount}</span>
              <span className="stat-label">Bookings</span>
            </div>
            <div className="quick-stat">
              <span className="stat-value">{completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="quick-stat">
              <span className="stat-value">${totalSpent.toFixed(2)}</span>
              <span className="stat-label">Spent</span>
            </div>
          </div>
          <div className="sidebar-actions">
            <button 
              className="support-button"
              disabled={isLoggingOut}
            >
              💬 Support
            </button>
            <button 
              className={`logout-button ${isLoggingOut ? 'loading' : ''}`} 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <span className="logout-spinner"></span>
                  Logging out...
                </>
              ) : (
                <>
                  🚪 Logout
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <>
            <div className="welcome-banner">
              <div className="welcome-content">
                <h1>Welcome back, {mockProfile.name}!</h1>
                <p>Here's what's happening with your services today</p>
              </div>
              <div className="welcome-actions">
                <Link to="/JobsList">
                  <button className="primary-button" disabled={isLoggingOut}>
                    Book a New Service
                  </button>
                </Link>
                <button className="secondary-button" disabled={isLoggingOut}>
                  Schedule Consultation
                </button>
              </div>
            </div>

            <div className="stats-row">
              <StatsCard title="Total Bookings" value={bookingsCount} icon="📅" trend="up" />
              <StatsCard title="Completed Services" value={completedCount} icon="✅" trend="up" />
              <StatsCard title="Pending Requests" value={pendingCount} icon="⏳" />
              <StatsCard title="Profile Views" value={mockProfile.profileViews} icon="👁️" trend="up" />
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h3 className="section-title">Quick Access</h3>
                <Link to="/services" className="view-all">View All Services</Link>
              </div>
              <div className="categories-grid">
                {serviceCategories.map(category => (
                  <div
                    key={category.id}
                    className={`category-card ${selectedServiceType === category.id ? 'active' : ''}`}
                    onClick={() => {
                      if (!isLoggingOut) {
                        setSelectedServiceType(category.id);
                        setActiveSection("providers");
                      }
                    }}
                  >
                    <div className="category-icon">{category.icon}</div>
                    <span>{category.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h3 className="section-title">Recommended Providers</h3>
                <span className="recommendation-badge">Based on your preferences</span>
              </div>
              {recommendedServices.length > 0 ? (
                <div className="cards-grid">
                  {recommendedServices.map(service => (
                    <ServiceCard key={service.id || service._id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No service providers available at the moment</p>
                </div>
              )}
            </div>
          </>
        );

      // ... باقي الأقسام تبقى كما هي مع إضافة disabled={isLoggingOut} للأزرار
      
      case "settings":
        return (
          <div className="dashboard-section">
            <h3 className="section-title">Account Settings</h3>
            <div className="settings-container">
              <div className="setting-group">
                <h4>Profile Information</h4>
                <div className="setting-item">
                  <label>Full Name</label>
                  <input type="text" defaultValue={mockProfile.name} disabled={isLoggingOut} />
                </div>
                <div className="setting-item">
                  <label>Email Address</label>
                  <input type="email" defaultValue={mockProfile.email} disabled={isLoggingOut} />
                </div>
                <div className="setting-item">
                  <label>Phone Number</label>
                  <input type="tel" defaultValue={mockProfile.phone} disabled={isLoggingOut} />
                </div>
                <div className="setting-item">
                  <label>Location</label>
                  <input type="text" defaultValue={mockProfile.location} disabled={isLoggingOut} />
                </div>
              </div>

              <div className="setting-group">
                <h4>Notification Preferences</h4>
                <div className="setting-item toggle">
                  <label>Email Notifications</label>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked disabled={isLoggingOut} />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item toggle">
                  <label>SMS Notifications</label>
                  <label className="toggle-switch">
                    <input type="checkbox" disabled={isLoggingOut} />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item toggle">
                  <label>Booking Reminders</label>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked disabled={isLoggingOut} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-actions">
                <button className="primary-button" disabled={isLoggingOut}>
                  Save Changes
                </button>
                <button 
                  className="primary-button" 
                  onClick={handleChangePassword}
                  disabled={isLoggingOut}
                >
                  Change Password
                </button>
                <button className="secondary-button" disabled={isLoggingOut}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="dashboard-section">
            <h3>Section not found</h3>
            <p>The requested section is not available.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <DashboardSidebar />

      <div className="dashboard-main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setIsSidebarOpen(true)}
              disabled={isLoggingOut}
            >
              ☰
            </button>
            <div className="header-brand">
              <h1>Client Dashboard</h1>
              <p>Manage your services and bookings</p>
            </div>
          </div>

          <div className="header-actions">
            <button className="notification-button" disabled={isLoggingOut}>
              🔔
              {unreadNotificationsCount > 0 && (
                <span className="badge">{unreadNotificationsCount}</span>
              )}
            </button>
            <button className="profile-button" disabled={isLoggingOut}>
              <img 
                src={mockProfile.profileImage} 
                alt="Profile" 
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
              <span>{mockProfile.name}</span>
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}