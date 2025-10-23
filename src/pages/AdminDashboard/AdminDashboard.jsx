import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchServiceProviders } from "../../redux/providersSlice";
import { fetchServices } from "../../redux/servicesSlice";
import { fetchNotifications } from "../../redux/notificationsSlice";
import { fetchMessages } from "../../redux/messagesSlice";
import { logout } from "../../redux/authSlice";
import ServiceCard from "../../components/ServiceCard";
import StatsCard from "../../components/StatsCard";
import "./AdminDashboard.css";

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
  const [loading, setLoading] = useState(false);

  // بيانات API
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });

  // ✅ التحقق من مصادقة المستخدم
  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authState.isAuthenticated, navigate]);

  // جلب إحصائيات Dashboard
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

  // جلب التصنيفات
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
          setCategories(data.data);
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

  // جلب طلبات مزودي الخدمة
  const fetchServiceProviderApplications = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const response = await fetch(
        `http://elanis.runasp.net/api/Admin/service-provider-applications?page=${page}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.succeeded) {
          setApplications(data.data.items);
          setPagination({
            page: data.data.page,
            pageSize: data.data.pageSize,
            totalCount: data.data.totalCount,
            totalPages: data.data.totalPages,
            hasNextPage: data.data.hasNextPage,
            hasPreviousPage: data.data.hasPreviousPage
          });
        } else {
          console.error("Error fetching applications:", data.message);
        }
      } else {
        console.error("HTTP error:", response.status);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // جلب تفاصيل طلب محدد
  const fetchApplicationDetails = async (id) => {
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const response = await fetch(
        `http://elanis.runasp.net/api/Admin/service-provider-applications/${id}`,
        {
          method: "GET",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.succeeded) {
          setSelectedApplication(data.data);
          return data.data;
        } else {
          console.error("Error fetching application details:", data.message);
        }
      } else {
        console.error("HTTP error:", response.status);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
    return null;
  };

  // الموافقة على طلب مزود خدمة
  const approveApplication = async (id) => {
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const response = await fetch(
        `http://elanis.runasp.net/api/Admin/service-provider-applications/${id}/approve`,
        {
          method: "POST",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.succeeded) {
          alert("Application approved successfully!");
          fetchServiceProviderApplications(pagination.page, pagination.pageSize);
          fetchDashboardStats();
        } else {
          alert(`Error: ${data.message}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Approve error:", err);
      alert("Error approving application");
    }
  };

  // رفض طلب مزود خدمة
  const rejectApplication = async (id, rejectionReason) => {
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const response = await fetch(
        `http://elanis.runasp.net/api/Admin/service-provider-applications/${id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ rejectionReason })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.succeeded) {
          alert("Application rejected successfully!");
          fetchServiceProviderApplications(pagination.page, pagination.pageSize);
          fetchDashboardStats();
        } else {
          alert(`Error: ${data.message}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Reject error:", err);
      alert("Error rejecting application");
    }
  };

  // ✅ تعليق مزود خدمة - معدل
  const suspendProvider = async (applicationId, reason) => {
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      
      // البحث عن الـ application للحصول على userId
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        alert("Application not found");
        return;
      }

      // استخدام userId كـ provider ID
      const response = await fetch(
        `http://elanis.runasp.net/api/Admin/service-providers/${application.userId}/suspend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ reason })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.succeeded) {
          alert("Provider suspended successfully!");
          fetchServiceProviderApplications(pagination.page, pagination.pageSize);
        } else {
          alert(`Error: ${data.message}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Suspend error:", err);
      alert("Error suspending provider");
    }
  };

  // ✅ تفعيل مزود خدمة - معدل
  const activateProvider = async (applicationId) => {
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      
      // البحث عن الـ application للحصول على userId
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        alert("Application not found");
        return;
      }

      // استخدام userId كـ provider ID
      const response = await fetch(
        `http://elanis.runasp.net/api/Admin/service-providers/${application.userId}/activate`,
        {
          method: "POST",
          headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.succeeded) {
          alert("Provider activated successfully!");
          fetchServiceProviderApplications(pagination.page, pagination.pageSize);
        } else {
          alert(`Error: ${data.message}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Activate error:", err);
      alert("Error activating provider");
    }
  };

  // تحميل البيانات عند تغيير القسم النشط
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchDashboardStats();
      fetchServiceTypes();

      if (activeSection === "providers") {
        fetchServiceProviderApplications();
      }

      dispatch(fetchServiceProviders());
      dispatch(fetchServices());
      dispatch(fetchNotifications());
      dispatch(fetchMessages());
    }
  }, [dispatch, authState.isAuthenticated, activeSection]);

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
  const pendingApplications = applications.filter(app => app.status === 1).length;
  const verifiedProviders = providers.filter(provider =>
    provider?.verificationStatus === "verified" || provider?.status === "verified"
  ).length;
  const totalServices = services.length;
  const activeServices = services.filter(service =>
    service?.status === "active" || service?.isActive === true
  ).length;

  // ✅ دالة تسجيل الخروج المحسنة
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");

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
          }
        } catch (serverError) {
          console.warn("⚠️ Server logout error:", serverError);
        }
      }

      dispatch(logout());

      const storageItems = [
        "authToken", "token", "userId", "userData", "refreshToken",
        "providers", "services", "notifications", "messages", "stats", "categories"
      ];

      storageItems.forEach(item => {
        localStorage.removeItem(item);
        sessionStorage.removeItem(item);
      });

      localStorage.clear();
      sessionStorage.clear();

      setTimeout(() => {
        navigate("/", { replace: true });
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error("❌ Logout error:", error);
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
    { id: 3, type: "verification", message: "Provider verification completed", time: "1 day ago", user: "Fatima Hassan", priority: "low" }
  ];

  // System alerts
  const systemAlerts = [
    { id: 1, type: "warning", message: "Server load at 85%", time: "30 min ago" },
    { id: 2, type: "info", message: "Database backup completed", time: "2 hours ago" },
    { id: 3, type: "success", message: "New system update available", time: "1 day ago" }
  ];

  // وظائف المساعدة
  const getStatusText = (status) => {
    switch (status) {
      case 1: return "Pending";
      case 2: return "Rejected";
      case 3: return "Approved";
      default: return "Unknown";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 1: return "status-pending";
      case 2: return "status-rejected";
      case 3: return "status-approved";
      default: return "status-unknown";
    }
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
              {item.id === "providers" && pendingApplications > 0 && (
                <span className="alert-badge">{pendingApplications}</span>
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
              <span className="stat-value">{pendingApplications}</span>
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
                  <span className="stat-number">{stats?.totalServiceProviders || 0}</span>
                  <span className="stat-label">Total Providers</span>
                </div>
                <div className="stat-badge warning">
                  <span className="stat-number">{stats?.pendingApplications || 0}</span>
                  <span className="stat-label">Pending Applications</span>
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
              <StatsCard title="Total Earnings" value={`$${stats?.totalEarnings || 0}`} icon="💰" trend="up" />
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
                <span className="total-count">{categories?.length || 0} total categories</span>
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
                          navigate(`/ServiceType/${category.id}`);
                        }
                      }}
                    >
                      <div className="category-icon">{category.iconUrl || "🏠"}</div>
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
            </div>
          </>
        );

      case "providers":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <div className="section-title-group">
                <h3 className="section-title">Service Providers Management</h3>
                <div className="provider-stats">
                  <div className="stat-item">
                    <span className="stat-number">{pagination.totalCount}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number warning">{pendingApplications}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number success">{applications.filter(app => app.status === 3).length}</span>
                    <span className="stat-label">Approved</span>
                  </div>
                </div>
              </div>
              <div className="section-actions">
                <button
                  className="action-btn refresh-btn"
                  onClick={() => fetchServiceProviderApplications()}
                  disabled={loading || isLoggingOut}
                >
                  <span className="btn-icon">🔄</span>
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button className="action-btn export-btn" disabled={isLoggingOut}>
                  <span className="btn-icon">📊</span>
                  Export Data
                </button>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls">
              <button
                onClick={() => fetchServiceProviderApplications(pagination.page - 1, pagination.pageSize)}
                disabled={!pagination.hasPreviousPage || loading || isLoggingOut}
                className="pagination-btn prev-btn"
              >
                <span className="pagination-icon">←</span>
                Previous
              </button>
              <div className="pagination-info">
                <span className="page-current">{pagination.page}</span>
                <span className="page-separator">of</span>
                <span className="page-total">{pagination.totalPages}</span>
              </div>
              <button
                onClick={() => fetchServiceProviderApplications(pagination.page + 1, pagination.pageSize)}
                disabled={!pagination.hasNextPage || loading || isLoggingOut}
                className="pagination-btn next-btn"
              >
                Next
                <span className="pagination-icon">→</span>
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading applications...</p>
              </div>
            ) : applications.length > 0 ? (
              <div className="applications-container">
                <div className="applications-table">
                  <div className="table-header">
                    <div className="header-column provider-info">Provider Information</div>
                    <div className="header-column contact">Contact</div>
                    <div className="header-column rate">Hourly Rate</div>
                    <div className="header-column status">Status</div>
                    <div className="header-column date">Applied Date</div>
                    <div className="header-column actions">Actions</div>
                  </div>
                  <div className="table-body">
                    {applications.map((application, index) => (
                      <div key={application.id} className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                        <div className="table-cell provider-info">
                          <div className="provider-avatar">
                            {application.firstName?.charAt(0)}{application.lastName?.charAt(0)}
                          </div>
                          <div className="provider-details">
                            <h4 className="provider-name">
                              {application.firstName} {application.lastName}
                            </h4>
                            <p className="provider-email">{application.userEmail}</p>
                            <p className="provider-bio">{application.bio?.substring(0, 60)}...</p>
                          </div>
                        </div>
                        <div className="table-cell contact">
                          <div className="contact-info">
                            <span className="contact-phone">📞 {application.phoneNumber}</span>
                            <span className="contact-email">✉️ {application.userEmail}</span>
                          </div>
                        </div>
                        <div className="table-cell rate">
                          <div className="rate-badge">
                            <span className="rate-amount">${application.hourlyRate}</span>
                            <span className="rate-period">/hour</span>
                          </div>
                        </div>
                        <div className="table-cell status">
                          <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                            <span className="status-dot"></span>
                            {getStatusText(application.status)}
                          </span>
                        </div>
                        <div className="table-cell date">
                          <div className="date-info">
                            <span className="date-day">{new Date(application.createdAt).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="date-full">{new Date(application.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="table-cell actions">
                          <div className="action-buttons">
                            <button
                              className="action-btn view-btn"
                              onClick={() => fetchApplicationDetails(application.id)}
                              disabled={isLoggingOut}
                              title="View Details"
                            >
                              <span className="btn-icon">👁️</span>
                              View
                            </button>
                            {application.status === 1 && (
                              <div className="action-group">
                                <button
                                  className="action-btn approve-btn"
                                  onClick={() => approveApplication(application.id)}
                                  disabled={isLoggingOut}
                                  title="Approve Application"
                                >
                                  <span className="btn-icon">✅</span>
                                  Approve
                                </button>
                                <button
                                  className="action-btn reject-btn"
                                  onClick={() => {
                                    const reason = prompt("Enter rejection reason:");
                                    if (reason) rejectApplication(application.id, reason);
                                  }}
                                  disabled={isLoggingOut}
                                  title="Reject Application"
                                >
                                  <span className="btn-icon">❌</span>
                                  Reject
                                </button>
                              </div>
                            )}
                            {application.status === 3 && (
                              <div className="action-group">
                                <button
                                  className="action-btn suspend-btn"
                                  onClick={() => {
                                    const reason = prompt("Enter suspension reason:");
                                    if (reason) suspendProvider(application.id, reason);
                                  }}
                                  disabled={isLoggingOut}
                                  title="Suspend Provider"
                                >
                                  <span className="btn-icon">⏸️</span>
                                  Suspend
                                </button>
                                <button
                                  className="action-btn activate-btn"
                                  onClick={() => activateProvider(application.id)}
                                  disabled={isLoggingOut}
                                  title="Activate Provider"
                                >
                                  <span className="btn-icon">▶️</span>
                                  Activate
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3 className="empty-title">No Applications Found</h3>
                <p className="empty-text">No service provider applications at the moment</p>
                <button className="cta-button" disabled={isLoggingOut}>
                  <span className="btn-icon">➕</span>
                  Invite Providers
                </button>
              </div>
            )}

            {/* Application Details Modal */}
            {selectedApplication && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <div className="modal-title">
                      <h3>Application Details</h3>
                      <p>Complete information about the provider application</p>
                    </div>
                    <button
                      className="modal-close"
                      onClick={() => setSelectedApplication(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="detail-grid">
                      <div className="detail-section">
                        <h4 className="section-title">Personal Information</h4>
                        <div className="detail-row">
                          <div className="detail-item">
                            <label>Full Name</label>
                            <span>{selectedApplication.firstName} {selectedApplication.lastName}</span>
                          </div>
                          <div className="detail-item">
                            <label>Email Address</label>
                            <span>{selectedApplication.userEmail}</span>
                          </div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-item">
                            <label>Phone Number</label>
                            <span>{selectedApplication.phoneNumber}</span>
                          </div>
                          <div className="detail-item">
                            <label>Hourly Rate</label>
                            <span className="rate-highlight">${selectedApplication.hourlyRate}/hour</span>
                          </div>
                        </div>
                      </div>

                      <div className="detail-section">
                        <h4 className="section-title">Professional Details</h4>
                        <div className="detail-item full-width">
                          <label>Bio</label>
                          <p className="detail-text">{selectedApplication.bio}</p>
                        </div>
                        <div className="detail-item full-width">
                          <label>Experience</label>
                          <p className="detail-text">{selectedApplication.experience}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="modal-btn secondary"
                      onClick={() => setSelectedApplication(null)}
                    >
                      Close
                    </button>
                    {selectedApplication.status === 1 && (
                      <div className="modal-actions">
                        <button
                          className="modal-btn success"
                          onClick={() => approveApplication(selectedApplication.id)}
                        >
                          Approve Application
                        </button>
                        <button
                          className="modal-btn danger"
                          onClick={() => {
                            const reason = prompt("Enter rejection reason:");
                            if (reason) rejectApplication(selectedApplication.id, reason);
                          }}
                        >
                          Reject Application
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

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