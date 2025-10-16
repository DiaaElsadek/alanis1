// redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// دالة مساعدة لتحميل بيانات المستخدم من التخزين المحلي بشكل آمن
const loadUserFromStorage = () => {
  try {
    const userData = localStorage.getItem("userData");
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    // إذا لم توجد بيانات، ارجع null
    if (!userData || userData === "undefined") {
      return null;
    }
    
    // حاول تحليل JSON بشكل آمن
    const parsedData = JSON.parse(userData);
    
    return {
      user: parsedData,
      token: token,
      userId: userId,
      isAuthenticated: !!(token && parsedData)
    };
  } catch (error) {
    console.error("Error loading user data from storage:", error);
    // في حالة الخطأ، امسح البيانات التالفة
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    return null;
  }
};

const initialState = loadUserFromStorage() || {
  user: null,
  token: null,
  userId: null,
  isAuthenticated: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const userData = action.payload;
      
      // تأكد أن البيانات موجودة قبل الحفظ
      if (userData) {
        state.user = userData;
        state.token = userData.accessToken || userData.token;
        state.userId = userData.id || userData.userId;
        state.isAuthenticated = true;
        
        // حفظ في localStorage بشكل آمن
        try {
          if (userData.accessToken) {
            localStorage.setItem("token", userData.accessToken);
          }
          if (userData.id) {
            localStorage.setItem("userId", userData.id);
          }
          if (userData.refreshToken) {
            localStorage.setItem("refreshToken", userData.refreshToken);
          }
          
          // تأكد أن userData ليس undefined قبل الحفظ
          if (userData && typeof userData === 'object') {
            localStorage.setItem("userData", JSON.stringify(userData));
          }
        } catch (error) {
          console.error("Error saving auth data to localStorage:", error);
        }
      }
    },
    
    register: (state, action) => {
      const userData = action.payload;
      
      if (userData) {
        state.user = userData;
        state.token = userData.accessToken;
        state.userId = userData.id;
        state.isAuthenticated = true;
        
        // حفظ في localStorage بشكل آمن
        try {
          if (userData.accessToken) {
            localStorage.setItem("token", userData.accessToken);
          }
          if (userData.id) {
            localStorage.setItem("userId", userData.id);
          }
          if (userData) {
            localStorage.setItem("userData", JSON.stringify(userData));
          }
        } catch (error) {
          console.error("Error saving registration data to localStorage:", error);
        }
      }
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userId = null;
      state.isAuthenticated = false;
      
      // مسح البيانات من localStorage
      try {
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("userData");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("refreshToken");
      } catch (error) {
        console.error("Error clearing auth data from storage:", error);
      }
    },
    
    updateUser: (state, action) => {
      if (state.user && action.payload) {
        state.user = { ...state.user, ...action.payload };
        
        // تحديث localStorage
        try {
          localStorage.setItem("userData", JSON.stringify(state.user));
        } catch (error) {
          console.error("Error updating user data in localStorage:", error);
        }
      }
    },
    
    clearAuthError: (state) => {
      state.error = null;
    }
  }
});

export const { login, register, logout, updateUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;