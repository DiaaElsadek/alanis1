import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import "./Home.css";

const demoServices = [
  { id: "1", title: "Child Care", provider: "CaringHands", location: "Cairo", price: "$15/hr", shortDesc: "Experienced with newborns and toddlers", type: "Full-time" },
  { id: "2", title: "Elderly Care", provider: "SeniorComfort", location: "Giza", price: "$18/hr", shortDesc: "Specialized in Alzheimer's care", type: "Part-time" },
  { id: "3", title: "House Keeping", provider: "HomeHelpers", location: "Alexandria", price: "$12/hr", shortDesc: "Cleaning, cooking, and organization", type: "Remote" },
];

const features = [
  { id: 1, title: "Easy to Use", desc: "Simple interface for families and caregivers.", icon: "🖥️" },
  { id: 2, title: "Verified Providers", desc: "All caregivers are thoroughly screened and verified.", icon: "✅" },
  { id: 3, title: "Instant Booking", desc: "Book trusted care services with just a few clicks.", icon: "🔔" },
  { id: 4, title: "Secure Payments", desc: "Safe and hassle-free payment options.", icon: "💳" },
];

const testimonials = [
  { id: 1, name: "Ahmed Osama", role: "Parent", message: "Found the perfect nanny for our twins within days!", avatar: "👨‍💼" },
  { id: 2, name: "Mona Hassan", role: "Caregiver", message: "This platform helped me grow my client base significantly.", avatar: "👩‍⚕️" },
];

const stats = [
  { id: 1, label: "Available Services", value: 120 },
  { id: 2, label: "Happy Families", value: 500 },
  { id: 3, label: "Verified Caregivers", value: 85 },
];

const partners = [
  { id: 1, name: "CaringHands", logo: "/logos/caringhands.png" },
  { id: 2, name: "SeniorComfort", logo: "/logos/seniorcomfort.png" },
  { id: 3, name: "HomeHelpers", logo: "/logos/homehelpers.png" },
];

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authState = useSelector(state => state.auth);
  const user = authState?.user || null;
  const isAuthenticated = authState?.isAuthenticated || false;

  // ✅ دالة تسجيل الخروج المحسنة
  const handleLogout = async () => {
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

      // ✅ إرسال action تسجيل الخروج إلى Redux
      dispatch(logout());
      
      // ✅ تنظيف التخزين المحلي بشكل كامل
      const storageItems = [
        "authToken", "token", "userId", "userData", "refreshToken",
        "bookings", "services", "notifications", "messages"
      ];
      
      storageItems.forEach(item => {
        localStorage.removeItem(item);
        sessionStorage.removeItem(item);
      });
      
      // ✅ مسح كامل للتخزين المؤقت
      localStorage.clear();
      sessionStorage.clear();
      
      // ✅ إعادة التوجيه للصفحة الرئيسية
      navigate("/", { replace: true });
      
    } catch (error) {
      console.error("❌ Logout error:", error);
      
      // حتى في حالة الخطأ، نظف البيانات المحلية
      dispatch(logout());
      localStorage.clear();
      sessionStorage.clear();
      navigate("/", { replace: true });
    }
  };

  // ✅ الحصول على رابط Dashboard بناءً على نوع المستخدم
  const getDashboardLink = () => {
    if (!user) return "/";
    
    const userRole = user.roles?.[0] || user.role;
    
    switch (userRole?.toLowerCase()) {
      case "user":
      case "client":
        return "/ClientDashboard";
      case "admin":
        return "/AdminDashboard";
      case "provider":
      case "freelancer":
        return "/FreelancerDashboard";
      default:
        return "/";
    }
  };

  // ✅ الحصول على اسم العرض للمستخدم
  const getUserDisplayName = () => {
    if (!user) return "User";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    return user.name || user.email || user.username || "User";
  };

  return (
    <main className="home-page">
      {/* Header Section with Auth Status */}
      <header className="home-header">
        <div className="home-container">
          <div className="header-content">
            <div className="logo">
              <Link to="/" className="logo-link">
                <span className="logo-icon">🏠</span>
                <span className="logo-text">CareHome</span>
              </Link>
            </div>
            
            <nav className="home-nav">
              {isAuthenticated ? (
                <div className="user-menu">
                  <span className="welcome-text">Welcome, {getUserDisplayName()}</span>
                  <Link to={getDashboardLink()} className="nav-link dashboard-link">
                    📊 Dashboard
                  </Link>
                  <button onClick={handleLogout} className="nav-link logout-btn">
                    🚪 Logout
                  </button>
                </div>
              ) : (
                <div className="auth-links">
                  <Link to="/login" className="nav-link login-link">
                    🔐 Login
                  </Link>
                  <Link to="/register" className="nav-link register-link">
                    👤 Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="home-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Quality Home Care Services</h1>
              <p>Find trusted caregivers for your loved ones or offer your professional care services</p>
              <div className="hero-buttons">
                <Link to="/JobsList" className="btn btn-primary">
                  <span>Find Caregivers</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 18L14 12L10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link to="/register" className="btn btn-secondary">Join as Provider</Link>
                
                {/* ✅ عرض رابط Dashboard للمستخدمين المسجلين */}
                {isAuthenticated && (
                  <Link to={getDashboardLink()} className="btn btn-outline">
                    📊 Go to Dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="hero-visual">
              <div className="floating-card card-1">
                <div className="card-icon">👶</div>
                <p>Child Care</p>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">👵</div>
                <p>Elderly Care</p>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">🏠</div>
                <p>House Keeping</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="featured-jobs">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title-home">Featured Services</h2>
            <Link to="/services" className="view-all">View All <span>&rarr;</span></Link>
          </div>
          <div className="jobs-grids">
            {demoServices.map(service => (
              <div key={service.id} className="job-card">
                <div className="job-card-header">
                  <div className="job-title-wrapper">
                    <h3>{service.title}</h3>
                    <span className="job-type">{service.type}</span>
                  </div>
                  <span className="salary">{service.price}</span>
                </div>
                <div className="company-info">
                  <span className="company">{service.provider}</span>
                  <span className="location">{service.location}</span>
                </div>
                <p className="job-desc">{service.shortDesc}</p>
                <div className="job-card-footer">
                  <Link to={`/services/${service.id}`} className="apply-btn">
                    <span>Book Now</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <button className="save-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Save</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title-home">Why Choose Our Platform</h2>
          </div>
          <div className="features-grid">
            {features.map(feature => (
              <div key={feature.id} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
                <div className="feature-hover-effect"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="home-stats-section">
        <div className="home-container">
          <div className="home-stats-grid">
            {stats.map(stat => (
              <div key={stat.id} className="home-stat-item">
                <div className="home-stat-value">{stat.value}+</div>
                <div className="home-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title-home">Success Stories</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map(test => (
              <div key={test.id} className="testimonial-card">
                <div className="testimonial-content">
                  <div className="quote-icon">"</div>
                  <p>{test.message}</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{test.avatar}</div>
                  <div className="author-info">
                    <h4>{test.name}</h4>
                    <span>{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="home-container">
          <div className="section-header">
            <h2 className="section-title-home">Trusted Care Providers</h2>
          </div>
          <div className="partners-grid">
            {partners.map(partner => (
              <div key={partner.id} className="partner-logo">
                <div className="logo-placeholder">
                  {partner.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="home-container">
          <div className="cta-content">
            <h2>Ready to Find Quality Care?</h2>
            <p>Join hundreds of families and professional caregivers already using our platform</p>
            <div className="cta-buttons">
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()} className="btn btn-primary">
                    📊 Go to Dashboard
                  </Link>
                  <Link to="/JobsList" className="btn btn-secondary">
                    🔍 Browse Services
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary">Find Care Services</Link>
                  <Link to="/register?type=provider" className="btn btn-secondary">Become a Provider</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}