// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import jobsReducer from "./jobsSlice";
import applicationsReducer from "./applicationsSlice";
import notificationsReducer from "./notificationsSlice";
import messagesReducer from "./messagesSlice";
import bookingsReducer from './bookingsSlice';
import servicesReducer from './servicesSlice';
import providersReducer from './providersSlice'; // إضافة جديدة

export const store = configureStore({
  reducer: {
    bookings: bookingsReducer,
    services: servicesReducer,
    providers: providersReducer, // إضافة الـ providers reducer
    auth: authReducer,
    jobs: jobsReducer,
    applications: applicationsReducer,
    notifications: notificationsReducer,
    messages: messagesReducer,
  },
});