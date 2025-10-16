// services/authService.js
const API_BASE_URL = "http://elanis.runasp.net/api";

class AuthService {
  // Login
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/Account/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return await response.json();
  }

  // Google Login
  async googleLogin(token) {
    const response = await fetch(`${API_BASE_URL}/Account/login/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    return await response.json();
  }

  // Register User
  async registerUser(userData) {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });

    const response = await fetch(`${API_BASE_URL}/Account/register-user`, {
      method: "POST",
      body: formData,
    });
    return await response.json();
  }

  // Register Service Provider
  async registerServiceProvider(providerData) {
    const formData = new FormData();
    Object.keys(providerData).forEach(key => {
      if (Array.isArray(providerData[key])) {
        providerData[key].forEach(item => formData.append(key, item));
      } else {
        formData.append(key, providerData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/Account/register-service-provider`, {
      method: "POST",
      body: formData,
    });
    return await response.json();
  }

  // Verify OTP
  async verifyOTP(otpData) {
    const response = await fetch(`${API_BASE_URL}/Account/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(otpData),
    });
    return await response.json();
  }

  // Resend OTP
  async resendOTP(email) {
    const response = await fetch(`${API_BASE_URL}/Account/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  }

  // Forgot Password
  async forgotPassword(email) {
    const response = await fetch(`${API_BASE_URL}/Account/forget-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  }

  // Reset Password
  async resetPassword(resetData) {
    const response = await fetch(`${API_BASE_URL}/Account/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resetData),
    });
    return await response.json();
  }

  // Change Password
  async changePassword(changePasswordData) {
    const response = await fetch(`${API_BASE_URL}/Account/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.getToken()}`,
      },
      body: JSON.stringify(changePasswordData),
    });
    return await response.json();
  }

  // Refresh Token
  async refreshToken(refreshToken) {
    const response = await fetch(`${API_BASE_URL}/Account/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
    return await response.json();
  }

  // Logout
  async logout() {
    const token = this.getToken();
    if (token) {
      await fetch(`${API_BASE_URL}/Account/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
    }
    this.clearAuthData();
  }

  // Helper methods
  getToken() {
    return localStorage.getItem("token");
  }

  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }

  setAuthData(authData) {
    if (authData.accessToken) {
      localStorage.setItem("token", authData.accessToken);
    }
    if (authData.refreshToken) {
      localStorage.setItem("refreshToken", authData.refreshToken);
    }
    if (authData.user) {
      localStorage.setItem("userData", JSON.stringify(authData.user));
    }
  }

  clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  getUserData() {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  }
}

export default new AuthService();