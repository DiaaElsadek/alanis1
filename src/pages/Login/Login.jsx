import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import "./Login.css";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api";

// تسجيل عادي
const loginUser = async (credentials) => {
    console.log("Sending login data:", credentials); // للتصحيح
    
    const response = await api.post("/Account/login", credentials, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.data.succeeded) {
        return response.data.data;
    } else {
        throw new Error(response.data.message || "Login failed");
    }
};

// تسجيل بجوجل
const loginWithGoogle = async (credentialResponse) => {
    const response = await api.post("/Account/login/google", {
        token: credentialResponse.credential
    });

    if (response.data.succeeded) {
        return response.data.data;
    } else {
        throw new Error(response.data.message || "Google Login failed");
    }
};

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loginInput, setLoginInput] = useState("");
    const [password, setPassword] = useState("");
    const [loginMethod, setLoginMethod] = useState("email");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});

    // Mutation العادي
    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            handleAuthSuccess(data);
        },
        onError: (error) => {
            console.error("Login error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Login failed";
            setErrors({ general: errorMessage });
        },
    });

    // Mutation جوجل
    const googleLoginMutation = useMutation({
        mutationFn: loginWithGoogle,
        onSuccess: (data) => {
            saveAuthData(data);
            dispatch(login(data));
            navigate("/ClientDashboard", { replace: true });
        },
        onError: (error) => {
            console.error("Google login error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Google login failed";
            setErrors({ general: errorMessage });
        },
    });

    // حفظ التوكينات
    const saveAuthData = (data) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        
        // تنظيف التخزين أولاً
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("userData");
        
        // حفظ البيانات الجديدة
        if (data.accessToken) {
            storage.setItem("authToken", data.accessToken);
        }
        if (data.id) {
            storage.setItem("userId", data.id);
        }
        if (data.refreshToken) {
            storage.setItem("refreshToken", data.refreshToken);
        }
        if (data) {
            storage.setItem("userData", JSON.stringify(data));
        }
        
        // إعداد الهيدر الافتراضي لـ axios
        if (data.accessToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        }
    };

    const handleAuthSuccess = (data) => {
        saveAuthData(data);
        dispatch(login(data));

        // التوجيه بناءً على الدور
        if (data.roles && data.roles.includes("Admin")) {
            navigate("/AdminDashboard", { replace: true });
        } else if (data.roles && data.roles.includes("Provider")) {
            navigate("/FreelancerDashboard", { replace: true });
        } else if (data.roles && data.roles.includes("User")) {
            navigate("/ClientDashboard", { replace: true });
        } else {
            navigate("/home", { replace: true });
        }
    };

    // التحقق من صحة الإدخال
    const validateForm = () => {
        const newErrors = {};
        
        if (!loginInput.trim()) {
            newErrors.loginInput = "Email or phone number is required";
        } else {
            if (loginMethod === "email") {
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(loginInput)) {
                    newErrors.loginInput = "Please enter a valid email address";
                }
            } else {
                // تبسيط تحقق رقم الهاتف
                const phoneRegex = /^[0-9+\-\s()]{10,}$/;
                if (!phoneRegex.test(loginInput.replace(/\s/g, ''))) {
                    newErrors.loginInput = "Please enter a valid phone number";
                }
            }
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // الكشف التلقائي عن نوع الإدخال
    const detectInputType = (input) => {
        const emailRegex = /\S+@\S+\.\S+/;
        
        if (emailRegex.test(input)) {
            return "email";
        } else {
            return "phone";
        }
    };

    const handleLoginInputChange = (value) => {
        setLoginInput(value);
        
        // الكشف التلقائي عن نوع الإدخال
        if (value.trim()) {
            const detectedType = detectInputType(value);
            setLoginMethod(detectedType);
        }
        
        // مسح الأخطاء عند الكتابة
        if (errors.loginInput || errors.general) {
            setErrors(prev => ({ 
                ...prev, 
                loginInput: "",
                general: "" 
            }));
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // إعداد بيانات التسجيل بناءً على نوع الإدخال
        const loginData = { 
            password: password 
        };
        
        if (loginMethod === "email") {
            loginData.email = loginInput.trim();
        } else {
            loginData.phoneNumber = loginInput.trim().replace(/\s/g, '');
        }

        console.log("Attempting login with:", loginData);
        loginMutation.mutate(loginData);
    };

    const handleGoogleSuccess = (credentialResponse) => {
        console.log("Google login response:", credentialResponse);
        
        if (credentialResponse.credential) {
            googleLoginMutation.mutate(credentialResponse);
        } else {
            setErrors({ general: "Invalid Google ID Token" });
        }
    };

    const handleGoogleError = () => {
        setErrors({ general: "Google Login failed. Please try again." });
    };

    const handleGuestLogin = () => {
        const guestData = {
            email: "guest@system.com",
            role: "guest",
            name: "Guest User",
            id: "guest-" + Date.now()
        };
        
        // حفظ بيانات الضيف
        sessionStorage.setItem("userData", JSON.stringify(guestData));
        dispatch(login(guestData));
        navigate("/home", { replace: true });
    };

    // تبديل طريقة التسجيل يدوياً
    const toggleLoginMethod = () => {
        setLoginMethod(prev => prev === "email" ? "phone" : "email");
        setLoginInput("");
        setErrors(prev => ({ ...prev, loginInput: "" }));
    };

    return (
        <div className="custom-login-container">
            <div className="custom-login-card">
                <div className="custom-login-header">
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue to your account</p>
                </div>

                {errors.general && (
                    <div className="custom-error-message">
                        <span>⚠️</span>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleLogin} className="custom-login-form">
                    {/* Email أو Phone - حقل واحد */}
                    <div className="custom-input-group">
                        <div className="input-header">
                            <label htmlFor="loginInput">
                                {loginMethod === "email" ? "Email Address" : "Phone Number"}
                            </label>
                            <button
                                type="button"
                                className="switch-method-btn"
                                onClick={toggleLoginMethod}
                            >
                                Use {loginMethod === "email" ? "Phone" : "Email"}
                            </button>
                        </div>
                        
                        <input
                            id="loginInput"
                            type={loginMethod === "email" ? "email" : "tel"}
                            placeholder={
                                loginMethod === "email" 
                                    ? "Enter your email address" 
                                    : "Enter your phone number (e.g., 0512345678)"
                            }
                            value={loginInput}
                            onChange={(e) => handleLoginInputChange(e.target.value)}
                            className={errors.loginInput ? "error" : ""}
                            disabled={loginMutation.isPending || googleLoginMutation.isPending}
                        />
                        {errors.loginInput && (
                            <span className="input-error">{errors.loginInput}</span>
                        )}
                        
                        {/* تلميح للكشف التلقائي */}
                        <div className="input-hint">
                            {loginInput && (
                                <small>
                                    Detected as: <strong>{loginMethod}</strong>
                                </small>
                            )}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="custom-input-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-container">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={errors.password ? "error" : ""}
                                disabled={loginMutation.isPending || googleLoginMutation.isPending}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loginMutation.isPending || googleLoginMutation.isPending}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="input-error">{errors.password}</span>
                        )}
                        
                        <div className="password-options">
                            <Link to="/forgot-password" className="forgot-password-link">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    {/* Remember me */}
                    <div className="custom-login-options">
                        <div className="remember-me-container">
                            <input
                                id="rememberMe"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                                disabled={loginMutation.isPending || googleLoginMutation.isPending}
                            />
                            <label htmlFor="rememberMe" className="remember-me-label">
                                Remember me
                            </label>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className={`custom-login-button ${
                            loginMutation.isPending ? "loading" : ""
                        }`}
                        disabled={loginMutation.isPending || googleLoginMutation.isPending}
                    >
                        {loginMutation.isPending ? (
                            <>
                                <span className="spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Guest Login */}
                <button 
                    className="guest-login-button" 
                    onClick={handleGuestLogin}
                    type="button"
                    disabled={loginMutation.isPending || googleLoginMutation.isPending}
                >
                    Continue as Guest
                </button>

                {/* Divider */}
                <div className="login-divider">
                    <span>Or continue with</span>
                </div>

                {/* Google Login */}
                <div className="google-login-container">
                    <GoogleLogin 
                        onSuccess={handleGoogleSuccess} 
                        onError={handleGoogleError}
                        theme="filled_blue"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                    />
                    {(googleLoginMutation.isPending || loginMutation.isPending) && (
                        <div className="loading-overlay">
                            <span className="spinner"></span>
                            Processing...
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="custom-login-footer">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register" className="signup-link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;