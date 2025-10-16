import React, { useState } from "react";
import "../Register/Register.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("user");
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    address: "",
    dateOfBirth: "",
    bio: "",
    nationalId: "",
    experience: "",
    hourlyRate: "",
    idDocument: null,
    certificate: null,
    selectedCategoryIds: [],
    manualCategories: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [categoryInputMethod, setCategoryInputMethod] = useState("select");

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else if (name === "selectedCategoryIds") {
      const selected = Array.from(e.target.selectedOptions, (o) => o.value);
      setFormData({ ...formData, selectedCategoryIds: selected });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
      
      if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
      
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
      
      if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (step === 2) {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";

      if (userType === "provider") {
        if (!formData.bio || formData.bio.trim().length < 20) 
          newErrors.bio = "Bio must be at least 20 characters";
        if (!formData.nationalId) newErrors.nationalId = "National ID is required";
        if (!formData.experience || formData.experience.trim().length < 20)
          newErrors.experience = "Experience must be at least 20 characters";
        if (!formData.hourlyRate || formData.hourlyRate <= 0) 
          newErrors.hourlyRate = "Valid hourly rate is required";
        if (!formData.idDocument) newErrors.idDocument = "ID document is required";
        
        if (categoryInputMethod === "select" && formData.selectedCategoryIds.length === 0)
          newErrors.selectedCategoryIds = "Please select at least one service category";
        if (categoryInputMethod === "manual" && !formData.manualCategories.trim())
          newErrors.manualCategories = "Please enter at least one service category";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const parseManualCategories = (text) => {
    if (!text || text.trim().length === 0) return [];
    
    return text
      .split(/[,،\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map((item, index) => (index + 1).toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      
      // ✅ Common fields for both user types
      formDataToSend.append("Email", formData.email);
      formDataToSend.append("PhoneNumber", formData.phoneNumber);
      formDataToSend.append("Password", formData.password);
      formDataToSend.append("ConfirmPassword", formData.confirmPassword);
      formDataToSend.append("FirstName", formData.firstName);
      formDataToSend.append("LastName", formData.lastName);
      formDataToSend.append("Address", formData.address);
      
      // ✅ DateOfBirth as string($date-time)
      const dateOfBirth = new Date(formData.dateOfBirth).toISOString();
      formDataToSend.append("DateOfBirth", dateOfBirth);

      let endpoint = "";

      if (userType === "user") {
        endpoint = "http://elanis.runasp.net/api/Account/register-user";
      } else {
        endpoint = "http://elanis.runasp.net/api/Account/register-service-provider";
        
        // ✅ Provider specific fields
        formDataToSend.append("Bio", formData.bio || "");
        formDataToSend.append("NationalId", formData.nationalId);
        formDataToSend.append("Experience", formData.experience);
        
        // ✅ HourlyRate as number($double)
        formDataToSend.append("HourlyRate", parseFloat(formData.hourlyRate));
        
        // ✅ Files handling
        if (formData.idDocument) {
          formDataToSend.append("IdDocument", formData.idDocument);
        }
        
        if (formData.certificate) {
          formDataToSend.append("Certificate", formData.certificate);
        }

        // ✅ Handle categories - استخدام نفس الطريقة المستخدمة في الكلينت
        let categoryIds = [];
        if (categoryInputMethod === "select") {
          categoryIds = formData.selectedCategoryIds;
        } else {
          categoryIds = parseManualCategories(formData.manualCategories);
        }

        if (categoryIds.length === 0) {
          throw new Error("Please select or enter at least one service category");
        }

        // ✅ إضافة الـ categories بنفس طريقة الكلينت
        categoryIds.forEach(id => {
          formDataToSend.append("SelectedCategoryIds", id);
        });

        console.log("Categories being sent:", categoryIds);
      }

      // ✅ Debug: طباعة البيانات المرسلة
      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      console.log("Sending request to:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
        // ✅ لا تضيف headers لـ FormData - سيضاف تلقائياً
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        throw new Error("Invalid server response");
      }

      console.log("Response data:", data);

      if (!response.ok || !data.succeeded) {
        const errorMessage = data.message || `Registration failed (${response.status})`;
        const serverErrors = data.errors || [];
        
        if (serverErrors.length > 0) {
          throw new Error(`${errorMessage}: ${serverErrors.join(", ")}`);
        } else {
          throw new Error(errorMessage);
        }
      }

      alert("✅ Registration successful!");
      
      if (userType === "user") {
        // Save user data and navigate
        if (data.data) {
          localStorage.setItem("userId", data.data.id);
          localStorage.setItem("token", data.data.accessToken);
          localStorage.setItem("userData", JSON.stringify(data.data));
        }
        navigate("/otpverify");
      } else {
        navigate("/pending-approval");
      }
    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = err.message || "Registration failed. Please try again.";
      
      // ✅ تحسين رسائل الخطأ
      if (errorMessage.includes("service category")) {
        errorMessage = "❌ Please select or enter at least one service category";
      } else if (errorMessage.includes("Experience")) {
        errorMessage = "❌ Experience description must be at least 20 characters long";
      } else if (errorMessage.includes("Bio")) {
        errorMessage = "❌ Bio must be at least 20 characters long";
      } else if (errorMessage.includes("categories") || errorMessage.includes("category")) {
        errorMessage = "❌ Please select or enter at least one service category";
      } else if (errorMessage.includes("DateOfBirth") || errorMessage.includes("date")) {
        errorMessage = "❌ Please enter a valid date of birth";
      } else if (errorMessage.includes("HourlyRate") || errorMessage.includes("rate")) {
        errorMessage = "❌ Please enter a valid hourly rate";
      } else if (errorMessage.includes("Email")) {
        errorMessage = "❌ Email already exists or is invalid";
      } else if (errorMessage.includes("PhoneNumber")) {
        errorMessage = "❌ Phone number already exists or is invalid";
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <div className="custom-input-group">
        <label>Account Type</label>
        <div className="user-type-selector">
          <button
            type="button"
            className={`user-type-btn ${userType === "user" ? "active" : ""}`}
            onClick={() => setUserType("user")}
          >
            👤 User
          </button>
          <button
            type="button"
            className={`user-type-btn ${userType === "provider" ? "active" : ""}`}
            onClick={() => setUserType("provider")}
          >
            🔧 Service Provider
          </button>
        </div>
      </div>

      <div className="custom-input-group">
        <label>Email</label>
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          placeholder="Enter your email"
        />
        {errors.email && <span className="input-error">{errors.email}</span>}
      </div>

      <div className="custom-input-group">
        <label>Phone Number</label>
        <input 
          type="text" 
          name="phoneNumber" 
          value={formData.phoneNumber} 
          onChange={handleChange} 
          placeholder="Enter your phone number"
        />
        {errors.phoneNumber && <span className="input-error">{errors.phoneNumber}</span>}
      </div>

      <div className="custom-input-group">
        <label>Password</label>
        <input 
          type="password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          placeholder="Create password (min 6 characters)"
        />
        {errors.password && <span className="input-error">{errors.password}</span>}
      </div>

      <div className="custom-input-group">
        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <h3 className="form-section-title">Personal Information</h3>
      
      <div className="form-row">
        <div className="custom-input-group">
          <label>First Name</label>
          <input 
            type="text" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleChange} 
            placeholder="Enter your first name"
          />
          {errors.firstName && <span className="input-error">{errors.firstName}</span>}
        </div>

        <div className="custom-input-group">
          <label>Last Name</label>
          <input 
            type="text" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleChange} 
            placeholder="Enter your last name"
          />
          {errors.lastName && <span className="input-error">{errors.lastName}</span>}
        </div>
      </div>

      <div className="custom-input-group">
        <label>Address</label>
        <textarea 
          name="address" 
          value={formData.address} 
          onChange={handleChange} 
          placeholder="Enter your full address"
          rows="3"
        />
        {errors.address && <span className="input-error">{errors.address}</span>}
      </div>

      <div className="custom-input-group">
        <label>Date of Birth</label>
        <input 
          type="date" 
          name="dateOfBirth" 
          value={formData.dateOfBirth} 
          onChange={handleChange} 
          max={new Date().toISOString().split('T')[0]}
        />
        {errors.dateOfBirth && <span className="input-error">{errors.dateOfBirth}</span>}
      </div>

      {userType === "provider" && (
        <>
          <h3 className="form-section-title">Professional Information</h3>
          
          <div className="custom-input-group">
            <label>Bio <span className="required">*</span></label>
            <textarea 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              placeholder="Tell us about your experience and skills (minimum 20 characters)..."
              rows="4"
              minLength="20"
            />
            <div className="character-count">
              {formData.bio.length}/20 characters minimum
              {formData.bio.length < 20 && (
                <span className="count-warning"> - Need {20 - formData.bio.length} more characters</span>
              )}
            </div>
            {errors.bio && <span className="input-error">{errors.bio}</span>}
          </div>

          <div className="form-row">
            <div className="custom-input-group">
              <label>National ID <span className="required">*</span></label>
              <input 
                type="text" 
                name="nationalId" 
                value={formData.nationalId} 
                onChange={handleChange} 
                placeholder="Enter your national ID"
              />
              {errors.nationalId && <span className="input-error">{errors.nationalId}</span>}
            </div>

            <div className="custom-input-group">
              <label>Experience Description <span className="required">*</span></label>
              <textarea 
                name="experience" 
                value={formData.experience} 
                onChange={handleChange} 
                placeholder="Describe your experience in detail (minimum 20 characters)..."
                rows="3"
                minLength="20"
              />
              <div className="character-count">
                {formData.experience.length}/20 characters minimum
                {formData.experience.length < 20 && (
                  <span className="count-warning"> - Need {20 - formData.experience.length} more characters</span>
                )}
              </div>
              {errors.experience && <span className="input-error">{errors.experience}</span>}
            </div>
          </div>

          <div className="custom-input-group">
            <label>Hourly Rate (SAR) <span className="required">*</span></label>
            <input 
              type="number" 
              name="hourlyRate" 
              value={formData.hourlyRate} 
              onChange={handleChange} 
              placeholder="Enter hourly rate"
              min="0"
              step="0.01"
            />
            {errors.hourlyRate && <span className="input-error">{errors.hourlyRate}</span>}
          </div>

          <div className="custom-input-group">
            <label>ID Document <span className="required">*</span></label>
            <input 
              type="file" 
              name="idDocument" 
              onChange={handleChange} 
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
            <small>National ID or Residence Permit (PDF, JPG, PNG)</small>
            {errors.idDocument && <span className="input-error">{errors.idDocument}</span>}
          </div>

          <div className="custom-input-group">
            <label>Certificates (Optional)</label>
            <input 
              type="file" 
              name="certificate" 
              onChange={handleChange} 
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <small>Professional certificates if available</small>
          </div>

          <div className="custom-input-group">
            <label>Service Categories Selection Method</label>
            <div className="input-method-selector">
              <button
                type="button"
                className={`method-btn ${categoryInputMethod === "select" ? "active" : ""}`}
                onClick={() => setCategoryInputMethod("select")}
              >
                📋 Select from List
              </button>
              <button
                type="button"
                className={`method-btn ${categoryInputMethod === "manual" ? "active" : ""}`}
                onClick={() => setCategoryInputMethod("manual")}
              >
                ✍️ Enter Manually
              </button>
            </div>
          </div>

          {categoryInputMethod === "select" ? (
            <div className="custom-input-group">
              <label>Services Offered <span className="required">*</span></label>
              <select 
                name="selectedCategoryIds" 
                multiple 
                value={formData.selectedCategoryIds} 
                onChange={handleChange}
                className="multi-select"
                size="5"
              >
                <option value="1">Electrical</option>
                <option value="2">Plumbing</option>
                <option value="3">Painting</option>
                <option value="4">AC & Refrigeration</option>
                <option value="5">Appliances</option>
                <option value="6">Cleaning</option>
                <option value="7">Installation</option>
                <option value="8">Repair</option>
              </select>
              <div className="selection-info">
                <small>Hold Ctrl (Cmd on Mac) to select multiple services</small>
                <div className="selected-count">
                  Selected: {formData.selectedCategoryIds.length} category(s)
                </div>
              </div>
              {errors.selectedCategoryIds && <span className="input-error">{errors.selectedCategoryIds}</span>}
            </div>
          ) : (
            <div className="custom-input-group">
              <label>Services Offered <span className="required">*</span></label>
              <textarea 
                name="manualCategories" 
                value={formData.manualCategories} 
                onChange={handleChange} 
                placeholder="Enter your services (one per line or separated by commas)
Examples:
Electrical, Plumbing, Painting
Or:
1. Electrical wiring
2. Plumbing repairs
3. Painting services"
                rows="6"
              />
              <div className="input-help">
                <small>💡 Enter one service per line, or separate with commas</small>
                <div className="character-count">
                  {formData.manualCategories.length} characters entered
                </div>
              </div>
              {errors.manualCategories && <span className="input-error">{errors.manualCategories}</span>}
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <div className="custom-register-container">
      <div className="custom-register-card">
        <div className="custom-register-header">
          <h2>Create {userType === "user" ? "User" : "Service Provider"} Account</h2>
          <p>Fill in the details to register as a {userType === "user" ? "user" : "service provider"}</p>
          {userType === "provider" && (
            <div className="provider-notice">
              <span>⚠️ Service providers require verification before accepting bookings</span>
            </div>
          )}
        </div>

        <div className="progress-bar">
          <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
            <span>1</span>
            <small>Account Info</small>
          </div>
          <div className={`progress-line ${currentStep >= 2 ? "active" : ""}`}></div>
          <div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
            <span>2</span>
            <small>Personal Info</small>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="custom-register-form">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                className="nav-button prev"
                onClick={handlePrevStep}
                disabled={isLoading}
              >
                Previous
              </button>
            )}
            
            {currentStep < 2 ? (
              <button
                type="button"
                className="nav-button next"
                onClick={handleNextStep}
                disabled={isLoading}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className={`custom-register-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Registering...
                  </>
                ) : (
                  `Register as ${userType === "user" ? "User" : "Service Provider"}`
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;