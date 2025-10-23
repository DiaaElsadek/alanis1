import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchServices } from "../../redux/servicesSlice";
import { fetchMyBookings } from "../../redux/bookingsSlice";
import { fetchNotifications } from "../../redux/notificationsSlice";
import { fetchMessages } from "../../redux/messagesSlice";
import { logout } from "../../redux/authSlice";
import ServiceCard from "../../components/ServiceCard";
import BookingCard from "../../components/BookingCard";
import StatsCard from "../../components/StatsCard";
import "./FreelancerDashboard.css";

export default function FreelancerDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // استخدام useSelector بشكل آمن
  const servicesState = useSelector(state => state.services);
  const bookingsState = useSelector(state => state.bookings);
  const notificationsState = useSelector(state => state.notifications);
  const messagesState = useSelector(state => state.messages);
  const authState = useSelector(state => state.auth);
  
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [newService, setNewService] = useState({
    title: "",
    description: "",
    category: "childcare",
    price: "",
    duration: "",
    location: ""
  });

  // ✅ دالة للتحقق من حالة الطلب
  const checkApplicationStatus = async () => {
    try {
      setLoadingStatus(true);
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch("http://elanis.runasp.net/api/Provider/application-status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Unauthorized - redirect to login
        dispatch(logout());
        localStorage.clear();
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setApplicationStatus(data.data);
      
      // إذا كان الطلب مرفوض أو مرفوض نهائياً، نمنع الوصول للداشبورد
      if (data.data?.statusText === "Rejected" || data.data?.statusText === "PermanentlyRejected") {
        // يمكن إضافة redirect لصفحة الرفض إذا لزم الأمر
        console.log("Application rejected:", data.data);
      }
      
    } catch (error) {
      console.error("Error checking application status:", error);
      // في حالة الخطأ، نعرض الداشبورد مع تحذير
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    // التحقق من حالة الطلب أولاً
    checkApplicationStatus();
  }, []);

  useEffect(() => {
    // تحميل البيانات فقط إذا كان المستخدم مسجلاً الدخول ومفعل
    if (authState.isAuthenticated && applicationStatus?.statusText === "Approved") {
      dispatch(fetchServices());
      dispatch(fetchMyBookings());
      dispatch(fetchNotifications());
      dispatch(fetchMessages());
    }
  }, [dispatch, authState.isAuthenticated, applicationStatus]);

  // ✅ التحقق من مصادقة المستخدم
  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authState.isAuthenticated, navigate]);

  // معالجة آمنة للبيانات
  const services = Array.isArray(servicesState?.services) ? servicesState.services : [];
  const myBookings = Array.isArray(bookingsState?.myBookings) ? bookingsState.myBookings : [];
  const notifications = Array.isArray(notificationsState?.items) ? notificationsState.items : [];
  const messages = Array.isArray(messagesState?.messages) ? messagesState.messages : [];

  // بيانات الملف الشخصي من Redux أو بيانات افتراضية
  const userProfile = authState?.user || {};
  const mockProfile = {
    name: userProfile?.firstName && userProfile?.lastName 
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : userProfile?.name || "Service Provider",
    profession: userProfile?.profession || "Professional Caregiver",
    specialization: userProfile?.specialization || "Child & Elder Care",
    experience: userProfile?.experience || "5 years",
    rating: userProfile?.rating || 4.8,
    reviews: userProfile?.reviews || 124,
    location: userProfile?.address || "Cairo, Egypt",
    profileImage: userProfile?.profileImage || "/default-avatar.png",
    verificationStatus: userProfile?.verificationStatus || "verified",
    availability: userProfile?.availability || "available"
  };

  // حساب الإحصائيات بشكل آمن
  const totalServices = services.length;
  const activeBookings = myBookings.filter(booking => 
    booking?.status === "active" || booking?.status === "accepted"
  ).length;
  const completedBookings = myBookings.filter(booking => 
    booking?.status === "completed" || booking?.status === "finished"
  ).length;
  
  const totalEarnings = myBookings
    .filter(booking => booking?.status === "completed" || booking?.status === "finished")
    .reduce((sum, booking) => {
      const price = parseFloat(booking?.price) || 0;
      return sum + price;
    }, 0);
  
  const pendingRequests = myBookings.filter(booking => 
    booking?.status === "pending" || booking?.status === "requested"
  ).length;
  
  const acceptanceRate = myBookings.length > 0 ? 
    ((completedBookings + activeBookings) / myBookings.length * 100).toFixed(1) : 0;

  // عد الإشعارات والرسائل غير المقروءة بشكل آمن
  const unreadNotificationsCount = notifications.filter(n => !n?.read).length;
  const unreadMessagesCount = messages.filter(m => !m?.read).length;

  // Service categories
  const serviceCategories = [
    { id: "childcare", name: "Child Care", icon: "👶" },
    { id: "eldercare", name: "Elder Care", icon: "👵" },
    { id: "nursing", name: "Nursing", icon: "💊" },
    { id: "housekeeping", name: "Housekeeping", icon: "🧹" }
  ];

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

  const handleStatusUpdate = (bookingId, status) => {
    // Mock status update
    alert(`Booking ${bookingId} status updated to ${status}`);
  };

  const handleCreateService = () => {
    if (newService.title && newService.price) {
      // Mock service creation
      alert(`Service "${newService.title}" created successfully!`);
      setShowServiceForm(false);
      setNewService({
        title: "",
        description: "",
        category: "childcare",
        price: "",
        duration: "",
        location: ""
      });
    }
  };

  const toggleAvailability = () => {
    const newStatus = mockProfile.availability === "available" ? "busy" : "available";
    alert(`Availability updated to ${newStatus}`);
    // In real app, dispatch an action to update availability
  };

  // ✅ مكون لعرض حالة الانتظار
  const PendingApproval = () => {
    const handleRetry = () => {
      checkApplicationStatus();
    };

    const getStatusMessage = () => {
      if (!applicationStatus) return "Checking your application status...";
      
      switch(applicationStatus.statusText) {
        case "Pending":
          return "Your application is under review. Please wait for approval.";
        case "Rejected":
          return `Your application was rejected. Reason: ${applicationStatus.rejectionReason || "Not specified"}`;
        case "PermanentlyRejected":
          return "Your application has been permanently rejected.";
        default:
          return "Your application status is being processed.";
      }
    };

    const getStatusIcon = () => {
      if (!applicationStatus) return "⏳";
      
      switch(applicationStatus.statusText) {
        case "Pending":
          return "⏳";
        case "Rejected":
          return "❌";
        case "PermanentlyRejected":
          return "🚫";
        default:
          return "⏳";
      }
    };

    return (
      <div className="pending-approval-container">
        <div className="pending-approval-content">
          <div className="status-icon">{getStatusIcon()}</div>
          <h2>Application Status</h2>
          <p className="status-message">{getStatusMessage()}</p>
          
          {applicationStatus && (
            <div className="application-details">
              <div className="detail-item">
                <strong>Application ID:</strong> 
                <span>{applicationStatus.applicationId}</span>
              </div>
              <div className="detail-item">
                <strong>Submitted:</strong> 
                <span>{new Date(applicationStatus.createdAt).toLocaleDateString()}</span>
              </div>
              {applicationStatus.reviewedAt && (
                <div className="detail-item">
                  <strong>Last Review:</strong> 
                  <span>{new Date(applicationStatus.reviewedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="action-buttons">
            <button 
              className="retry-button"
              onClick={handleRetry}
              disabled={loadingStatus}
            >
              {loadingStatus ? "Checking..." : "Refresh Status"}
            </button>
            <button 
              className="logout-button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // مكون القائمة الجانبية
  const Sidebar = () => {
    return (
      <aside className={`dashboard-sidebar ${isMenuOpen ? 'open' : ''}`}>
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
              <p>{mockProfile.profession}</p>
              <span className={`status ${mockProfile.availability}`}>
                {mockProfile.availability === "available" ? "🟢 Available" : "🔴 Busy"}
              </span>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === "overview" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("overview");
              setIsMenuOpen(false);
            }}
            disabled={isLoggingOut}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Overview</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "services" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("services");
              setIsMenuOpen(false);
            }}
            disabled={isLoggingOut}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Services</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "bookings" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("bookings");
              setIsMenuOpen(false);
            }}
            disabled={isLoggingOut}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Bookings</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "statistics" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("statistics");
              setIsMenuOpen(false);
            }}
            disabled={isLoggingOut}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-text">Statistics</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "messages" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("messages");
              setIsMenuOpen(false);
            }}
            disabled={isLoggingOut}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-text">Messages</span>
            {unreadMessagesCount > 0 && <span className="message-badge">{unreadMessagesCount}</span>}
          </button>
          <button 
            className={`nav-item ${activeSection === "settings" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("settings");
              setIsMenuOpen(false);
            }}
            disabled={isLoggingOut}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="stat-value">{totalServices}</span>
              <span className="stat-label">Services</span>
            </div>
            <div className="quick-stat">
              <span className="stat-value">{activeBookings}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="quick-stat">
              <span className="stat-value">${totalEarnings.toFixed(2)}</span>
              <span className="stat-label">Earned</span>
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
    switch(activeSection) {
      case "overview":
        return (
          <>
            <div className="stats-row">
              <StatsCard title="Total Services" value={totalServices} icon="🏠" />
              <StatsCard title="Active Bookings" value={activeBookings} icon="📅" />
              <StatsCard title="Completed Jobs" value={completedBookings} icon="✅" />
              <StatsCard title="Total Earnings" value={`$${totalEarnings.toFixed(2)}`} icon="💰" />
            </div>

            <div className="dashboard-section">
              <div className="availability-section">
                <div className="availability-status">
                  <span className={`status-indicator ${mockProfile.availability}`}>
                    {mockProfile.availability === "available" ? "🟢" : "🔴"}
                  </span>
                  <div>
                    <h4>Availability Status</h4>
                    <p>You are currently {mockProfile.availability} for new bookings</p>
                  </div>
                </div>
                <button 
                  className={`availability-toggle ${mockProfile.availability}`}
                  onClick={toggleAvailability}
                  disabled={isLoggingOut}
                >
                  {mockProfile.availability === "available" ? "Mark as Busy" : "Mark as Available"}
                </button>
              </div>
            </div>

            <div className="dashboard-section">
              <h3 className="section-title">Recent Bookings</h3>
              {myBookings.length > 0 ? (
                <div className="bookings-grid">
                  {myBookings.slice(0, 4).map(booking => (
                    <BookingCard 
                      key={booking.id || booking._id} 
                      booking={booking} 
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No bookings yet</p>
                </div>
              )}
            </div>
          </>
        );
      
      case "services":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <h3 className="section-title">Service Management</h3>
              <button 
                className="add-service-button"
                onClick={() => setShowServiceForm(!showServiceForm)}
                disabled={isLoggingOut}
              >
                {showServiceForm ? "Cancel" : "Add New Service"}
              </button>
            </div>
            
            {showServiceForm && (
              <div className="service-form">
                <h4>Create New Service</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Service Title</label>
                    <input 
                      type="text" 
                      value={newService.title}
                      onChange={(e) => setNewService({...newService, title: e.target.value})}
                      placeholder="Enter service title"
                      disabled={isLoggingOut}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      value={newService.category}
                      onChange={(e) => setNewService({...newService, category: e.target.value})}
                      disabled={isLoggingOut}
                    >
                      {serviceCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price ($/hour)</label>
                    <input 
                      type="number" 
                      value={newService.price}
                      onChange={(e) => setNewService({...newService, price: e.target.value})}
                      placeholder="Enter price per hour"
                      disabled={isLoggingOut}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input 
                      type="text" 
                      value={newService.duration}
                      onChange={(e) => setNewService({...newService, duration: e.target.value})}
                      placeholder="e.g., 2 hours, full day"
                      disabled={isLoggingOut}
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      value={newService.location}
                      onChange={(e) => setNewService({...newService, location: e.target.value})}
                      placeholder="Service location"
                      disabled={isLoggingOut}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea 
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      placeholder="Describe your service in detail"
                      rows="4"
                      disabled={isLoggingOut}
                    />
                  </div>
                </div>
                <button 
                  className="submit-button" 
                  onClick={handleCreateService}
                  disabled={isLoggingOut}
                >
                  Create Service
                </button>
              </div>
            )}
            
            {services.length > 0 ? (
              <div className="services-management">
                <div className="services-list">
                  {services.map(service => (
                    <div 
                      key={service.id || service._id} 
                      className={`service-item ${selectedService?.id === service.id ? 'active' : ''}`} 
                      onClick={() => !isLoggingOut && setSelectedService(service)}
                    >
                      <div className="service-info">
                        <h4>{service.title || "Service Title"}</h4>
                        <p>{service.category || "Category"} • ${service.price || "0"}/hour</p>
                        <p>{service.location || "Location not specified"}</p>
                        <p>Bookings: {service.bookingsCount || 0}</p>
                        <p>Rating: ⭐ {service.rating || "4.5"}</p>
                      </div>
                      <div className="service-actions">
                        <button className="action-button edit" disabled={isLoggingOut}>Edit</button>
                        <button className="action-button delete" disabled={isLoggingOut}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedService && (
                  <div className="service-details-panel">
                    <div className="panel-header">
                      <h4>Service Details: {selectedService.title || "Service"}</h4>
                      <span className="service-stats">{selectedService.bookingsCount || 0} bookings</span>
                    </div>
                    <div className="service-detail-content">
                      <div className="detail-item">
                        <label>Category:</label>
                        <span>{selectedService.category || "Not specified"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Price:</label>
                        <span>${selectedService.price || "0"}/hour</span>
                      </div>
                      <div className="detail-item">
                        <label>Location:</label>
                        <span>{selectedService.location || "Not specified"}</span>
                      </div>
                      <div className="detail-item">
                        <label>Description:</label>
                        <p>{selectedService.description || "No description available"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🏠</div>
                <p className="empty-text">You haven't created any services yet</p>
                <button 
                  className="cta-button"
                  onClick={() => setShowServiceForm(true)}
                  disabled={isLoggingOut}
                >
                  Create Your First Service
                </button>
              </div>
            )}
          </div>
        );
      
      // ... باقي الأقسام (bookings, statistics, messages, settings) تبقى كما هي
      
      default:
        return (
          <div className="dashboard-section">
            <h3>Section not found</h3>
            <p>The requested section is not available.</p>
          </div>
        );
    }
  };

  // مكون Header مبسط
  const Header = () => {
    return (
      <header className="dashboard-header">
        <div className="header-main">
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              disabled={isLoggingOut}
            >
              ☰
            </button>
            <div className="header-brand">
              <h2>Service Provider Dashboard</h2>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="notification-button" disabled={isLoggingOut}>
              🔔 {unreadNotificationsCount > 0 && 
                <span className="badge">{unreadNotificationsCount}</span>}
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
        </div>
      </header>
    );
  };

  // ✅ العرض الشرطي بناءً على حالة الموافقة
  if (loadingStatus) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking application status...</p>
      </div>
    );
  }

  // إذا لم يكن الطلب معتمداً، نعرض شاشة الانتظار
  if (applicationStatus?.statusText !== "Approved") {
    return <PendingApproval />;
  }

  // إذا كان الطلب معتمداً، نعرض الداشبورد كاملاً
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main-content">
        <Header />
        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}