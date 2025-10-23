import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import "./Login.css";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api";

// تسجيل عادي بدون الاعتماد على interceptor
const loginUser = async (credentials) => {
    console.log("Sending login data:", credentials);

    const headers = {
        "Content-Type": "application/json",
        "accept": "text/plain",
    };

    const response = await api.post(
        "http://elanis.runasp.net/api/Account/login",
        credentials,
        { headers }
    );

    console.log(response);

    // لازم توصل للبيانات من response.data
    if (response.data.succeeded) {
        return response.data.data;
    } else {
        throw new Error(response.data.message || "Login failed");
    }
};

// تسجيل بجوجل
const loginWithGoogle = async (credentialResponse) => {
    const response = await api.post("/api/Account/login/google", {
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
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
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
        if (data.role === "Admin") {
            navigate("/AdminDashboard", { replace: true });
        } else if (data.role === "Provider") {
            navigate("/FreelancerDashboard", { replace: true });
        } else if (data.role === "User") {
            navigate("/ClientDashboard", { replace: true });
        } else {
            navigate("/home", { replace: true });
        }
    };

    // التحقق من صحة الإدخال
    const validateForm = () => {
        const newErrors = {};

        // التحقق من البريد الإلكتروني
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else {
            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(email)) {
                newErrors.email = "Please enter a valid email address";
            }
        }

        // التحقق من رقم الهاتف
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        } else {
            // تبسيط تحقق رقم الهاتف
            const phoneRegex = /^[0-9+\-\s()]{10,}$/;
            if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
                newErrors.phoneNumber = "Please enter a valid phone number";
            }
        }

        // التحقق من كلمة المرور
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // إعداد بيانات التسجيل
        const loginData = {
            email: email.trim(),
            phoneNumber: phoneNumber.trim().replace(/\s/g, ''),
            password: password
        };

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

    // مسح الأخطاء عند الكتابة
    const clearError = (field) => {
        if (errors[field] || errors.general) {
            setErrors(prev => ({
                ...prev,
                [field]: "",
                general: ""
            }));
        }
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
                    {/* Email */}
                    <div className="custom-input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                clearError("email");
                            }}
                            className={errors.email ? "error" : ""}
                            disabled={loginMutation.isPending || googleLoginMutation.isPending}
                        />
                        {errors.email && (
                            <span className="input-error">{errors.email}</span>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div className="custom-input-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            placeholder="Enter your phone number (e.g., 0512345678)"
                            value={phoneNumber}
                            onChange={(e) => {
                                setPhoneNumber(e.target.value);
                                clearError("phoneNumber");
                            }}
                            className={errors.phoneNumber ? "error" : ""}
                            disabled={loginMutation.isPending || googleLoginMutation.isPending}
                        />
                        {errors.phoneNumber && (
                            <span className="input-error">{errors.phoneNumber}</span>
                        )}
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
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    clearError("password");
                                }}
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
                        className={`custom-login-button ${loginMutation.isPending ? "loading" : ""
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