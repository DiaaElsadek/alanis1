import axios from "axios";

const api = axios.create({
    baseURL: "http://elanis.runasp.net/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

// Interceptor قبل كل Request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // طباعة معلومات الـ Request للتdebug
        console.log(`🚀 ${config.method?.toUpperCase()} Request to: ${config.url}`, {
            headers: config.headers,
            data: config.data
        });

        return config;
    },
    (error) => {
        console.error("❌ Request Interceptor Error:", error);
        return Promise.reject(error);
    }
);

// Interceptor للـ Response
api.interceptors.response.use(
    (response) => {
        // معالجة الـ Response الناجح
        console.log(`✅ ${response.status} Response from: ${response.config.url}`, response.data);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // طباعة معلومات الخطأ
        console.error(`❌ ${error.response?.status} Error from: ${originalRequest?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // معالجة حالة 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

            if (!refreshToken) {
                console.error("❌ No refresh token found - Redirecting to login");
                redirectToLogin();
                return Promise.reject(error);
            }

            try {
                console.log("🔄 Attempting token refresh...");
                
                // طلب تجديد التوكن
                const res = await axios.post(
                    "http://elanis.runasp.net/api/Account/refresh-token",
                    { refreshToken },
                    { 
                        headers: { "Content-Type": "application/json" },
                        timeout: 5000
                    }
                );

                if (res.data.succeeded) {
                    const { accessToken, refreshToken: newRefresh } = res.data.data;

                    console.log("✅ Token refresh successful");

                    // حفظ التوكنات الجديدة
                    localStorage.setItem("authToken", accessToken);
                    localStorage.setItem("refreshToken", newRefresh);

                    // تحديث الهيدر وإعادة المحاولة
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } else {
                    throw new Error(res.data.message || "Token refresh failed");
                }
            } catch (refreshError) {
                console.error("❌ Refresh token failed:", refreshError);
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        // معالجة أخطاء أخرى
        handleCommonErrors(error);

        return Promise.reject(error);
    }
);

// 🔄 دالة إعادة التوجيه لصفحة Login
const redirectToLogin = () => {
    // مسح البيانات المحفوظة
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("refreshToken");
    
    // إعادة التوجيه لصفحة Login
    if (window.location.pathname !== "/Login" && window.location.pathname !== "/AdminLogin") {
        window.location.href = "/Login";
    }
};

// 🚨 دالة معالجة الأخطاء الشائعة
const handleCommonErrors = (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
        case 400:
            console.error("❌ Bad Request:", message);
            break;
        case 403:
            console.error("❌ Forbidden: Access denied");
            redirectToLogin();
            break;
        case 404:
            console.error("❌ Not Found:", error.config.url);
            break;
        case 500:
            console.error("❌ Server Error:", message);
            break;
        case 502:
        case 503:
            console.error("❌ Server Unavailable:", message);
            break;
        default:
            if (error.code === 'NETWORK_ERROR') {
                console.error("❌ Network Error: Please check your internet connection");
            } else if (error.code === 'TIMEOUT') {
                console.error("❌ Request Timeout: Server took too long to respond");
            }
            break;
    }
};

// ==================== 🔐 AUTH API FUNCTIONS ====================

export const authAPI = {
    // تسجيل الدخول
    login: async (email, password) => {
        try {
            const response = await api.post("/Account/login", {
                email,
                password
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // تسجيل الدخول كأدمن
    adminLogin: async (email, password) => {
        try {
            const response = await api.post("/Account/login", {
                email,
                password
            });
            
            if (response.data.succeeded) {
                const userData = response.data.data;
                // التحقق إذا كان المستخدم أدمن
                if (userData.role === "Admin") {
                    return response.data;
                } else {
                    throw new Error("User does not have admin privileges");
                }
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // تسجيل مستخدم عادي
    registerUser: async (userData) => {
        try {
            const response = await api.post("/Account/register-user", userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // تسجيل مقدم خدمة
    registerServiceProvider: async (providerData) => {
        try {
            // استخدام FormData للملفات
            const formData = new FormData();
            
            // إضافة الحقول النصية
            Object.keys(providerData).forEach(key => {
                if (key === 'idDocument' || key === 'certificate') {
                    if (providerData[key]) {
                        formData.append(key, providerData[key]);
                    }
                } else if (key === 'selectedCategoryIds') {
                    providerData[key].forEach(categoryId => {
                        formData.append(key, categoryId);
                    });
                } else if (key === 'hourlyRate') {
                    formData.append(key, parseFloat(providerData[key]));
                } else {
                    formData.append(key, providerData[key]);
                }
            });

            const response = await axios.post(
                "http://elanis.runasp.net/api/Account/register-service-provider",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    timeout: 30000
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // إنشاء أدمن
    createAdmin: async (adminData, adminToken = null) => {
        try {
            const config = {};
            
            // إذا تم توفير توكن أدمن، استخدامه
            if (adminToken) {
                config.headers = {
                    Authorization: `Bearer ${adminToken}`
                };
            }

            const response = await api.post("/Account/create-admin", adminData, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // تحديث التوكن
    refreshToken: async (refreshToken) => {
        try {
            const response = await api.post("/Account/refresh-token", { refreshToken });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // نسيان كلمة المرور
    forgotPassword: async (email) => {
        try {
            const response = await api.post("/Account/forgot-password", { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // إعادة تعيين كلمة المرور
    resetPassword: async (email, token, newPassword, confirmPassword) => {
        try {
            const response = await api.post("/Account/reset-password", {
                email,
                token,
                newPassword,
                confirmPassword
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // تغيير كلمة المرور
    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        try {
            const response = await api.post("/Account/change-password", {
                currentPassword,
                newPassword,
                confirmPassword
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // التحقق من البريد الإلكتروني
    verifyEmail: async (email, token) => {
        try {
            const response = await api.post("/Account/verify-email", { email, token });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// ==================== 👥 USER MANAGEMENT API FUNCTIONS ====================

export const userAPI = {
    // الحصول على بيانات المستخدم الحالي
    getCurrentUser: async () => {
        try {
            const response = await api.get("/User/profile");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // تحديث بيانات المستخدم
    updateProfile: async (userData) => {
        try {
            const response = await api.put("/User/profile", userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // الحصول على جميع المستخدمين (لأدمن)
    getAllUsers: async () => {
        try {
            const response = await api.get("/Admin/users");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // حذف مستخدم (لأدمن)
    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/Admin/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// ==================== 🛠️ CATEGORIES API FUNCTIONS ====================

export const categoriesAPI = {
    // الحصول على جميع الفئات
    getCategories: async () => {
        try {
            const response = await api.get("/Categories");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // إنشاء فئة جديدة (لأدمن)
    createCategory: async (categoryData) => {
        try {
            const response = await api.post("/Admin/categories", categoryData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // تحديث فئة (لأدمن)
    updateCategory: async (categoryId, categoryData) => {
        try {
            const response = await api.put(`/Admin/categories/${categoryId}`, categoryData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // حذف فئة (لأدمن)
    deleteCategory: async (categoryId) => {
        try {
            const response = await api.delete(`/Admin/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// ==================== 🔧 SERVICE PROVIDERS API FUNCTIONS ====================

export const providersAPI = {
    // الحصول على جميع مقدمي الخدمة (لأدمن)
    getAllProviders: async () => {
        try {
            const response = await api.get("/Admin/providers");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // الموافقة على مقدم خدمة (لأدمن)
    approveProvider: async (providerId) => {
        try {
            const response = await api.put(`/Admin/providers/${providerId}/approve`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // رفض مقدم خدمة (لأدمن)
    rejectProvider: async (providerId, reason) => {
        try {
            const response = await api.put(`/Admin/providers/${providerId}/reject`, { reason });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // الحصول على مقدمي الخدمة pending
    getPendingProviders: async () => {
        try {
            const response = await api.get("/Admin/providers/pending");
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// ==================== 🛠️ JOBS API FUNCTIONS ====================

export const jobsAPI = {
    // الحصول على جميع الوظائف
    getJobs: async () => {
        try {
            const response = await api.get("/Jobs");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // الحصول على وظيفة محددة
    getJob: async (jobId) => {
        try {
            const response = await api.get(`/Jobs/${jobId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // إنشاء وظيفة جديدة
    createJob: async (jobData) => {
        try {
            const response = await api.post("/Jobs", jobData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // تحديث وظيفة
    updateJob: async (jobId, jobData) => {
        try {
            const response = await api.put(`/Jobs/${jobId}`, jobData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // حذف وظيفة
    deleteJob: async (jobId) => {
        try {
            const response = await api.delete(`/Jobs/${jobId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// ==================== 🔧 UTILITY FUNCTIONS ====================

// دوال مساعدة للـ API
export const setAuthTokens = (accessToken, refreshToken, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("authToken", accessToken);
    storage.setItem("refreshToken", refreshToken);
};

export const clearAuthTokens = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("refreshToken");
};

export const isAuthenticated = () => {
    return !!(localStorage.getItem("authToken") || sessionStorage.getItem("authToken"));
};

export const isAdmin = () => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    return userData.role === "Admin";
};

export const getAuthToken = () => {
    return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("userData") || "null");
};

export default api;