import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchServiceProviders } from "../../redux/providersSlice";
import { fetchServices } from "../../redux/servicesSlice";
import { fetchNotifications } from "../../redux/notificationsSlice";
import { fetchMessages } from "../../redux/messagesSlice";
import { logout } from "../../redux/authSlice"; // ✅ استيراد logout action
import ServiceCard from "../../components/ServiceCard";
import StatsCard from "../../components/StatsCard";
import "./AdminDashboard.css";
import { AlignCenter } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // استخدام useSelector بشكل آمن
  const providersState = useSelector(state => state.providers);
  const servicesState = useSelector(state => state.services);
  const notificationsState = useSelector(state => state.notifications);
  const messagesState = useSelector(state => state.messages);
  const authState = useSelector(state => state.auth);

  const [activeSection, setActiveSection] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [verificationData, setVerificationData] = useState({
    providerId: "",
    status: "approved",
    notes: ""
  });

  // endpoint pages of categories -> endpoint 2
  const [applications, setApplications] = useState([]);

  // بيانات API
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState(null);

  // ✅ التحقق من مصادقة المستخدم
  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authState.isAuthenticated, navigate]);

  // جلب إحصائيات Dashboard
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const response = await fetch("http://elanis.runasp.net/api/Admin/dashboard-stats", {
          method: "GET",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.succeeded) {
            setStats(data.data);
            console.log("Dashboard stats:", data.data);
          } else {
            console.error("Error fetching stats:", data.message);
          }
        } else {
          console.error("HTTP error:", response.status);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    if (authState.isAuthenticated) {
      fetchDashboardStats();
    }
  }, [authState.isAuthenticated]);

  // جلب التصنيفات
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        const response = await fetch("http://elanis.runasp.net/api/ServiceType", {
          method: "GET",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.succeeded) {
            setCategories(data.data); // استخدام نفس state لو عايز تعرضهم
            console.log("Service Types:", data.data);
          } else {
            console.error("Error fetching service types:", data.message);
          }
        } else {
          console.error("HTTP error:", response.status);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    if (authState.isAuthenticated) {
      fetchServiceTypes();
    }
  }, [authState.isAuthenticated]);


  useEffect(() => {
    // تحميل البيانات فقط إذا كان المستخدم مسجلاً الدخول
    if (authState.isAuthenticated) {
      dispatch(fetchServiceProviders());
      dispatch(fetchServices());
      dispatch(fetchNotifications());
      dispatch(fetchMessages());
    }
  }, [dispatch, authState.isAuthenticated]);

  // معالجة آمنة للبيانات
  const providers = Array.isArray(providersState?.providers) ? providersState.providers : [];
  const services = Array.isArray(servicesState?.services) ? servicesState.services : [];
  const notifications = Array.isArray(notificationsState?.items) ? notificationsState.items : [];
  const messages = Array.isArray(messagesState?.messages) ? messagesState.messages : [];

  // عد الإشعارات والرسائل غير المقروءة بشكل آمن
  const unreadNotificationsCount = notifications.filter(n => !n?.read).length;
  const unreadMessagesCount = messages.filter(m => !m?.read).length;

  // بيانات المدير من Redux أو بيانات افتراضية
  const userProfile = authState?.user || {};
  const mockAdmin = {
    name: userProfile?.firstName && userProfile?.lastName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : userProfile?.name || "Admin Manager",
    role: userProfile?.role || "System Administrator",
    department: userProfile?.department || "Operations",
    joinDate: userProfile?.joinDate || "2023-01-15",
    profileImage: userProfile?.profileImage || "/admin-avatar.png"
  };

  // حساب الإحصائيات بشكل آمن
  const totalProviders = providers.length;
  const pendingVerification = providers.filter(provider =>
    provider?.verificationStatus === "pending" || provider?.status === "pending"
  ).length;
  const verifiedProviders = providers.filter(provider =>
    provider?.verificationStatus === "verified" || provider?.status === "verified"
  ).length;
  const totalServices = services.length;
  const activeServices = services.filter(service =>
    service?.status === "active" || service?.isActive === true
  ).length;

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
        "providers", "services", "notifications", "messages", "stats", "categories"
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

  // Service categories
  const serviceCategories = [
    { id: "all", name: "All Services", count: totalServices, icon: "🏠" },
    { id: "childcare", name: "Child Care", count: services.filter(s => s?.category === "childcare").length, icon: "👶" },
    { id: "eldercare", name: "Elder Care", count: services.filter(s => s?.category === "eldercare").length, icon: "👵" },
    { id: "nursing", name: "Nursing", count: services.filter(s => s?.category === "nursing").length, icon: "💊" },
    { id: "housekeeping", name: "Housekeeping", count: services.filter(s => s?.category === "housekeeping").length, icon: "🧹" }
  ];

  // Filter services by category
  const filteredServices = selectedCategory === "all"
    ? services
    : services.filter(service => service?.category === selectedCategory);

  // Recent activities
  const recentActivities = [
    { id: 1, type: "provider_register", message: "New service provider registered", time: "2 hours ago", user: "Ahmed Mohamed", priority: "high" },
    { id: 2, type: "booking", message: "New booking created", time: "4 hours ago", user: "Sarah Johnson", priority: "medium" },
    { id: 3, type: "verification", message: "Provider verification completed", time: "1 day ago", user: "Fatima Hassan", priority: "low" },
    { id: 4, type: "support", message: "Support ticket resolved", time: "2 days ago", user: "Support Team", priority: "medium" },
    { id: 5, type: "payment", message: "Payment issue reported", time: "3 days ago", user: "Mohamed Ali", priority: "high" }
  ];

  // System alerts
  const systemAlerts = [
    { id: 1, type: "warning", message: "Server load at 85%", time: "30 min ago" },
    { id: 2, type: "info", message: "Database backup completed", time: "2 hours ago" },
    { id: 3, type: "success", message: "New system update available", time: "1 day ago" }
  ];

  const handleVerification = (providerId, status) => {
    // Mock verification process
    alert(`Provider ${providerId} ${status} successfully!`);
    setShowVerificationForm(false);
    setVerificationData({
      providerId: "",
      status: "approved",
      notes: ""
    });
  };

  // مكون القائمة الجانبية المدمج
  const Sidebar = () => {
    const navItems = [
      { id: "overview", label: "Dashboard Overview", icon: "📊" },
      { id: "providers", label: "Providers Management", icon: "👥" },
      { id: "services", label: "Services Management", icon: "🏠" },
      { id: "bookings", label: "Bookings Management", icon: "📅" },
      { id: "analytics", label: "Platform Analytics", icon: "📈" },
      { id: "reports", label: "Reports", icon: "📋" },
      { id: "messages", label: "Messages", icon: "💬" },
      { id: "settings", label: "System Settings", icon: "⚙️" }
    ];

    return (
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-summary">
            <img
              src={mockAdmin.profileImage}
              alt="Admin"
              className="admin-image"
              onError={(e) => {
                e.target.src = "/admin-avatar.png";
              }}
            />
            <div className="admin-info">
              <h3>{mockAdmin.name}</h3>
              <p>{mockAdmin.role}</p>
              <span className="admin-badge">🛡️ System Admin</span>
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
              {item.id === "providers" && pendingVerification > 0 && (
                <span className="alert-badge">{pendingVerification}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="system-stats">
            <div className="system-stat">
              <span className="stat-value">{totalProviders}</span>
              <span className="stat-label">Providers</span>
            </div>
            <div className="system-stat">
              <span className="stat-value">{totalServices}</span>
              <span className="stat-label">Services</span>
            </div>
            <div className="system-stat">
              <span className="stat-value">{pendingVerification}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>

          <div className="system-health">
            <div className="health-indicator">
              <span className="health-label">System Status</span>
              <span className="health-status good">🟢 Operational</span>
            </div>
          </div>

          <div className="sidebar-actions">
            <button
              className="support-button"
              disabled={isLoggingOut}
            >
              🛟 Support
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
            <div className="admin-welcome">
              <div className="welcome-content">
                <h1>Welcome back, {mockAdmin.name}!</h1>
                <p>Here's your platform overview and recent activities</p>
              </div>
              <div className="welcome-stats">
                <div className="stat-badge primary">
                  <span className="stat-number">{totalProviders}</span>
                  <span className="stat-label">Total Providers</span>
                </div>
                <div className="stat-badge warning">
                  <span className="stat-number">{pendingVerification}</span>
                  <span className="stat-label">Pending Verification</span>
                </div>
                <div className="stat-badge success">
                  <span className="stat-number">${stats?.totalEarnings || 0}</span>
                  <span className="stat-label">Total Earnings</span>
                </div>
              </div>
            </div>

            <div className="stats-row">
              <StatsCard title="Total Users" value={stats?.totalUsers} icon="👥" trend="up" />
              <StatsCard title="Total Service Providers" value={stats?.totalServiceProviders} icon="👥" trend="up" />
              <StatsCard title="Pending Applications" value={stats?.pendingApplications} icon="⏳" trend="down" />
              <StatsCard title="Total Service Requests" value={stats?.totalServiceRequests} icon="📅" trend="up" />
              <StatsCard title="Completed Service Requests" value={stats?.completedServiceRequests} icon="✅" trend="up" />
              <StatsCard title="Total Earnings" value={stats?.totalEarnings} icon="💰" trend="up" />
              <StatsCard title="Total Reviews" value={stats?.totalReviews} icon="⭐" trend="up" />
              <StatsCard title="Average Rating" value={stats?.averageRating} icon="📊" trend="up" />
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-section">
                <div className="section-header">
                  <h3 className="section-title">Recent Activities</h3>
                  <span className="view-all">View All</span>
                </div>
                <div className="activities-list">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className={`activity-item priority-${activity.priority}`}>
                      <div className="activity-icon">
                        {activity.type === 'provider_register' && '👤'}
                        {activity.type === 'booking' && '📅'}
                        {activity.type === 'verification' && '✅'}
                        {activity.type === 'support' && '💬'}
                        {activity.type === 'payment' && '💰'}
                      </div>
                      <div className="activity-content">
                        <p className="activity-message">{activity.message}</p>
                        <div className="activity-meta">
                          <span className="activity-user">{activity.user}</span>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                      </div>
                      <div className="activity-actions">
                        <button className="action-btn small" disabled={isLoggingOut}>View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-section">
                <div className="section-header">
                  <h3 className="section-title">System Alerts</h3>
                  <span className="alert-count">{systemAlerts.length} alerts</span>
                </div>
                <div className="alerts-list">
                  {systemAlerts.map(alert => (
                    <div key={alert.id} className={`alert-item ${alert.type}`}>
                      <div className="alert-icon">
                        {alert.type === 'warning' && '⚠️'}
                        {alert.type === 'info' && 'ℹ️'}
                        {alert.type === 'success' && '✅'}
                      </div>
                      <div className="alert-content">
                        <p className="alert-message">{alert.message}</p>
                        <span className="alert-time">{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h3 className="section-title">Service Types</h3>
                <span className="total-count">{applications?.length} total services</span>
              </div>
              <div className="categories-grid">
                {/* Add New Category */}
                <div
                  className="category-card add-new"
                  onClick={() => !isLoggingOut && navigate("/AddCategory")}
                >
                  <div className="category-icon">➕</div>
                  <div className="category-info">
                    <span className="category-name">Add New Category</span>
                    <span className="category-count">Create new category</span>
                  </div>
                </div>

                {/* Categories Cards */}
                {categories?.length > 0 ? (
                  categories.map(category => (
                    <div
                      key={category.id}
                      className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => {
                        if (!isLoggingOut) {
                          setSelectedCategory(category.id);
                          // navigate للصفحة الجديدة مع إرسال الـ id
                          navigate(`/ServiceType/${category.id}`);
                        }
                      }} // هنا قفلت الـ onClick صح
                    >
                      <div className="category-icon">{category.iconUrl ?? "🏠"}</div>
                      <div className="category-info">
                        <span className="category-name">{category.name || "Unnamed Category"}</span>
                        <span className="category-count">{category.categoriesCount || 0} services</span>
                      </div>
                      <div className="category-arrow">→</div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No service categories available.</p>
                )}

              </div>

            </div >
          </>
        );

      case "providers":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <div className="section-title-group">
                <h3 className="section-title">Service Providers Management</h3>
                <div className="provider-stats">
                  <span className="stat-total">Total: {totalProviders}</span>
                  <span className="stat-pending">Pending: {pendingVerification}</span>
                  <span className="stat-verified">Verified: {verifiedProviders}</span>
                </div>
              </div>
              <div className="section-actions">
                <button
                  className="action-button primary"
                  onClick={() => setShowVerificationForm(!showVerificationForm)}
                  disabled={isLoggingOut}
                >
                  {showVerificationForm ? "Cancel" : "Verify Provider"}
                </button>
                <button className="action-button secondary" disabled={isLoggingOut}>
                  Export Data
                </button>
              </div>
            </div>

            {showVerificationForm && (
              <div className="verification-form">
                <h4>Provider Verification</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Provider ID</label>
                    <input
                      type="text"
                      value={verificationData.providerId}
                      onChange={(e) => setVerificationData({ ...verificationData, providerId: e.target.value })}
                      placeholder="Enter provider ID"
                      disabled={isLoggingOut}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={verificationData.status}
                      onChange={(e) => setVerificationData({ ...verificationData, status: e.target.value })}
                      disabled={isLoggingOut}
                    >
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Notes</label>
                    <textarea
                      value={verificationData.notes}
                      onChange={(e) => setVerificationData({ ...verificationData, notes: e.target.value })}
                      placeholder="Add verification notes..."
                      rows="3"
                      disabled={isLoggingOut}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    className="submit-button"
                    onClick={() => handleVerification(verificationData.providerId, verificationData.status)}
                    disabled={isLoggingOut}
                  >
                    Submit Verification
                  </button>
                </div>
              </div>
            )}

            {providers.length > 0 ? (
              <div className="providers-table">
                <div className="table-header">
                  <span>Provider Information</span>
                  <span>Services</span>
                  <span>Status</span>
                  <span>Rating</span>
                  <span>Actions</span>
                </div>
                <div className="table-body">
                  {providers.map(provider => (
                    <div key={provider.id || provider._id} className="table-row">
                      <div className="provider-info">
                        <img
                          src={provider.avatar || provider.profileImage || "/default-avatar.png"}
                          alt={provider.name}
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                        <div className="provider-details">
                          <span className="provider-name">{provider.name || "Unknown Provider"}</span>
                          <span className="provider-email">{provider.email || "No email"}</span>
                          <span className="provider-join">Joined: {provider.joinDate || "Unknown"}</span>
                        </div>
                      </div>
                      <div className="provider-services">
                        {provider.services?.slice(0, 2).map(service => (
                          <span key={service} className="service-tag">{service}</span>
                        ))}
                        {provider.services?.length > 2 && (
                          <span className="more-tag">+{provider.services.length - 2} more</span>
                        )}
                      </div>
                      <div className="provider-status">
                        <span className={`status-badge status-${provider.verificationStatus || provider.status || "unknown"}`}>
                          {provider.verificationStatus || provider.status || "unknown"}
                        </span>
                      </div>
                      <div className="provider-rating">
                        ⭐ {provider.rating || "N/A"}
                        <span className="rating-count">({provider.reviews || 0})</span>
                      </div>
                      <div className="provider-actions">
                        <button className="action-btn view" disabled={isLoggingOut}>View</button>
                        <button className="action-btn edit" disabled={isLoggingOut}>Edit</button>
                        <button className="action-btn verify" disabled={isLoggingOut}>Verify</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Service Providers</h3>
                <p className="empty-text">No service providers registered yet</p>
                <button className="cta-button" disabled={isLoggingOut}>
                  Invite Providers
                </button>
              </div>
            )}
          </div>
        );

      // ... باقي الأقسام (services, analytics, settings) تبقى كما هي مع إضافة disabled={isLoggingOut}

      default:
        return (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Section Not Found</h3>
            <p className="empty-text">The requested section is not available</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

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
              <h1>Admin Dashboard</h1>
              <p>Platform Management & Analytics</p>
            </div>
          </div>

          <div className="header-actions">
            <button className="notification-button" disabled={isLoggingOut}>
              🔔
              {unreadNotificationsCount > 0 &&
                <span className="badge">{unreadNotificationsCount}</span>
              }
            </button>
            <button className="alert-button" disabled={isLoggingOut}>
              ⚠️
              <span className="alert-dot"></span>
            </button>
            <button className="profile-button" disabled={isLoggingOut}>
              <img
                src={mockAdmin.profileImage}
                alt="Admin"
                onError={(e) => {
                  e.target.src = "/admin-avatar.png";
                }}
              />
              <span>{mockAdmin.name}</span>
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