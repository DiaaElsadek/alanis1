import React from "react";
import { Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { useParams } from "react-router-dom";

// Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ClientDashboard from "./pages/ClientDashboard/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard/FreelancerDashboard";
import Notifications from "./pages/Notifications/Notifications";
import Messages from "./pages/Messages/Messages";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import JobsList from "./pages/JobsList/JobsList";
import JobDetails from "./pages/JobDetails/JobDetails";
import About from "./pages/About/About";
import OTPVerify from "./pages/OTPVerify/OTPVerify";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ChangePassword from "./pages/ChangePassword/ChangePassword";
import AddCategory from "./pages/AddCategory/AddCategory";
import CreateAdmin from "./pages/CreateAdmin/CreateAdmin"; //  إضافة صفحة إنشاء الأدمن
import PendingApproval from "./pages/PendingApproval/PendingApproval"; //  إضافة صفحة انتظار الموافقة
import ServiceType from "./pages/ServiceType/ServiceType";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // هنا يمكنك إضافة منطق التحقق من المصادقة
  return children;
};

// Layout Components
const DefaultLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const DashboardLayout = ({ children }) => (
  <>
    {children}
  </>
);

const AuthLayout = ({ children }) => (
  <>
    {children}
  </>
);

function App() {

  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        {/*  Public Routes with Layout */}
        <Route
          path="/"
          element={
            <DefaultLayout>
              <Home />
            </DefaultLayout>
          }
        />
        <Route
          path="/Home"
          element={
            <DefaultLayout>
              <Home />
            </DefaultLayout>
          }
        />
        <Route
          path="/JobsList"
          element={
            <DefaultLayout>
              <JobsList />
            </DefaultLayout>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <DefaultLayout>
              <JobDetails />
            </DefaultLayout>
          }
        />
        <Route
          path="/About"
          element={
            <DefaultLayout>
              <About />
            </DefaultLayout>
          }
        />
        <Route
          path="/Notifications"
          element={
            <DefaultLayout>
              <Notifications />
            </DefaultLayout>
          }
        />
        <Route
          path="/Messages"
          element={
            <DefaultLayout>
              <Messages />
            </DefaultLayout>
          }
        />

        {/*  Auth Routes without Layout */}
        <Route
          path="/Login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/Register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />
        <Route
          path="/OTPVerify"
          element={
            <AuthLayout>
              <OTPVerify />
            </AuthLayout>
          }
        />
        <Route
          path="/ForgotPassword"
          element={
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          }
        />
        <Route
          path="/ResetPassword"
          element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          }
        />
        <Route
          path="/ChangePassword"
          element={
            <AuthLayout>
              <ChangePassword />
            </AuthLayout>
          }
        />
        <Route
          path="/PendingApproval"
          element={
            <AuthLayout>
              <PendingApproval />
            </AuthLayout>
          }
        />

        {/*  Dashboard Routes with Dashboard Layout */}
        <Route
          path="/ClientDashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ClientDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/FreelancerDashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <FreelancerDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/AdminDashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ServiceType/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ServiceType />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/*  Admin Management Routes */}
        <Route
          path="/CreateAdmin"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CreateAdmin />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/AddCategory"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AddCategory />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/*404 Page - Keep this at the end */}
        <Route
          path="*"
          element={
            <DefaultLayout>
              <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-4xl font-bold text-gray-800">404</h1>
                <p className="text-lg text-gray-600 mt-4">Page Not Found</p>
                <button
                  onClick={() => window.history.back()}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </DefaultLayout>
          }
        />
      </Routes>
    </div>
  );
}

export default App;