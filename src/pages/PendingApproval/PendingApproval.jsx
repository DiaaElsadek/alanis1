import React from "react";
import { useNavigate } from "react-router-dom";

const PendingApproval = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Application Under Review
          </h1>
          <p className="text-gray-600 mb-6">
            Your service provider application is currently being reviewed by our team. 
            This process usually takes 24-48 hours. You will receive an email notification 
            once your account is approved.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-700 text-left space-y-1">
            <li>✅ Background verification</li>
            <li>✅ Document validation</li>
            <li>✅ Service category approval</li>
            <li>✅ Account activation</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Homepage
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back to Login
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Need help? Contact support at support@elanis.com
        </p>
      </div>
    </div>
  );
};

export default PendingApproval;