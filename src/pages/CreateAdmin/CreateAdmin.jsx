import React, { useState } from "react";
import api from "../../services/api"; // استيراد الـ API الذي لديك
import "../Register/Register.css"; // استخدام نفس التنسيق
import { useNavigate } from "react-router-dom";

const CreateAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    adminToken: "" // حقل التوكن الاختياري
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must contain only numbers";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setSuccessMessage("");

    try {
      const adminData = {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName
      };

      console.log("📤 Sending admin creation request:", adminData);

      // ✅ استخدام الـ API الموجود لديك مع التوكن إذا تم إدخاله
      const config = {};
      
      // إذا تم إدخال توكن أدمن، أضفه إلى الهيدر
      if (formData.adminToken) {
        config.headers = {
          Authorization: `Bearer ${formData.adminToken}`
        };
      }

      const response = await api.post("/Account/create-admin", adminData, config);

      console.log("✅ Admin Creation Success:", response.data);

      if (response.data.succeeded) {
        const adminUser = response.data.data;
        
        setSuccessMessage(`✅ Admin account created successfully! Welcome ${adminUser.firstName} ${adminUser.lastName}`);
        
        // تفريغ النموذج
        setFormData({
          email: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          adminToken: "" // مسح التوكن بعد النجاح
        });

        // حفظ بيانات الأدمن الجديد إذا كان هناك توكن
        if (adminUser.accessToken) {
          localStorage.setItem("authToken", adminUser.accessToken);
          localStorage.setItem("refreshToken", adminUser.refreshToken);
          localStorage.setItem("userData", JSON.stringify(adminUser));
        }

        setTimeout(() => {
          alert(`Admin Account Created Successfully!\n\nEmail: ${adminUser.email}\nRole: ${adminUser.role}\nStatus: Active`);
        }, 1000);

      } else {
        throw new Error(response.data.message || "Admin creation failed");
      }

    } catch (err) {
      console.error("❌ Admin creation error:", err);
      
      let errorMessage = "Admin creation failed. Please check your data and try again.";
      
      if (err.response?.data) {
        const serverError = err.response.data;
        
        if (serverError.errors && Array.isArray(serverError.errors)) {
          errorMessage = serverError.errors.join(", ");
        } else if (serverError.message) {
          errorMessage = serverError.message;
        }
        
        console.log("🔍 Server error details:", serverError);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // تحسين رسائل الخطأ
      if (errorMessage.includes("Email") || errorMessage.toLowerCase().includes("email")) {
        errorMessage = "❌ Email address is already registered or invalid.";
      } else if (errorMessage.includes("PhoneNumber") || errorMessage.toLowerCase().includes("phone")) {
        errorMessage = "❌ Phone number is already registered or invalid.";
      } else if (errorMessage.includes("Password") || errorMessage.toLowerCase().includes("password")) {
        errorMessage = "❌ Password requirements not met. Minimum 6 characters required.";
      } else if (errorMessage.includes("Unauthorized") || errorMessage.includes("401")) {
        errorMessage = "❌ Unauthorized: You need admin privileges to create admin accounts.";
      } else if (errorMessage.includes("Forbidden") || errorMessage.includes("403")) {
        errorMessage = "❌ Forbidden: Your account doesn't have permission to create admin accounts.";
      } else if (errorMessage.includes("network") || errorMessage.includes("Network")) {
        errorMessage = "❌ Network connection error. Please check your internet connection.";
      }
      
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="custom-register-container">
      <div className="custom-register-card">
        <div className="custom-register-header">
          <h2>Create Admin Account</h2>
          <p>Fill in the details to create a new administrator account</p>
          <div className="admin-notice">
            <span>⚠️ You need to be logged in as admin to create new admin accounts</span>
          </div>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="custom-register-form">
          <div className="form-section">
            <h3 className="form-section-title">Admin Information</h3>
            
            <div className="form-row">
              <div className="custom-input-group">
                <label>First Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  placeholder="Enter first name"
                  required
                  minLength="2"
                />
                {errors.firstName && <span className="input-error">{errors.firstName}</span>}
              </div>

              <div className="custom-input-group">
                <label>Last Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  placeholder="Enter last name"
                  required
                  minLength="2"
                />
                {errors.lastName && <span className="input-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="custom-input-group">
              <label>Email Address <span className="required">*</span></label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter admin email address"
                required
              />
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>

            <div className="custom-input-group">
              <label>Phone Number <span className="required">*</span></label>
              <input 
                type="text" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleChange} 
                placeholder="Enter phone number (numbers only)"
                required
              />
              {errors.phoneNumber && <span className="input-error">{errors.phoneNumber}</span>}
            </div>

            <div className="form-row">
              <div className="custom-input-group">
                <label>Password <span className="required">*</span></label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Create password (min 6 characters)"
                  required
                  minLength="6"
                />
                {errors.password && <span className="input-error">{errors.password}</span>}
              </div>

              <div className="custom-input-group">
                <label>Confirm Password <span className="required">*</span></label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  minLength="6"
                />
                {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* حقل التوكن الاختياري */}
            <div className="custom-input-group">
              <label>Admin Token (Optional)</label>
              <input 
                type="password" 
                name="adminToken" 
                value={formData.adminToken} 
                onChange={handleChange} 
                placeholder="Enter admin token if needed"
              />
              <div className="input-help">
                <small>If you have a specific admin token, enter it here. Otherwise, the system will use your current session.</small>
              </div>
            </div>
          </div>

          <div className="form-navigation">
            <button 
              type="button"
              className="nav-button prev"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Back
            </button>
            
            <button 
              type="submit" 
              className={`custom-register-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating Admin...
                </>
              ) : (
                "Create Admin Account"
              )}
            </button>
          </div>
        </form>

        <div className="admin-features">
          <h4>Admin Account Features:</h4>
          <ul>
            <li>✅ Full system access and control</li>
            <li>✅ User management capabilities</li>
            <li>✅ Service provider approvals</li>
            <li>✅ System configuration</li>
            <li>✅ Reports and analytics</li>
            <li>✅ Create other admin accounts</li>
          </ul>

          <div className="current-user-info">
            <h5>Current Session:</h5>
            <p>
              The system will use your current authentication token to create the admin account. 
              Make sure you are logged in with an admin account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;