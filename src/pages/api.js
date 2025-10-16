import axios from "axios";

const api = axios.create({
    baseURL: "https://elanis.runasp.net/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor قبل كل Request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor للـ Response
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // لو رجع Unauthorized وماجربناش ريفريش قبل كده
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken =
                localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

            if (!refreshToken) {
                console.error("No refresh token found");
                return Promise.reject(error);
            }

            try {
                // Call للـ refresh-token
                const res = await axios.post(
                    "https://elanis.runasp.net/api/Account/refresh-token",
                    JSON.stringify(refreshToken),
                    { headers: { "Content-Type": "application/json" } }
                );

                if (res.data.succeeded) {
                    const { accessToken, refreshToken: newRefresh } = res.data.data;

                    // خزن التوكينات الجديدة
                    localStorage.setItem("authToken", accessToken);
                    localStorage.setItem("refreshToken", newRefresh);

                    // عدل الهيدر للـ request الأصلي وجرب تاني
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (err) {
                console.error("Refresh token failed", err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
