import React, { useState } from "react";
import "./ChangePassword.css";
import api from "../api"; // ✅ نفس الـ api.js اللي عامل فيه الـ interceptors
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.currentPassword) newErrors.currentPassword = "Current password is required";
        if (!formData.newPassword) newErrors.newPassword = "New password is required";
        if (formData.newPassword.length < 6) newErrors.newPassword = "Password must be at least 6 characters";
        if (formData.confirmNewPassword !== formData.newPassword)
            newErrors.confirmNewPassword = "Passwords do not match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const res = await api.post("/Account/change-password", formData);
            if (res.data.succeeded) {
                setSuccessMsg("✅ Password changed successfully!");
                setTimeout(() => navigate("/login"), 1500); // رجعه للوجين بعد التغيير
            } else {
                setErrors({ general: res.data.message || "Password change failed" });
            }
        } catch (err) {
            setErrors({ general: err.response?.data?.message || "Something went wrong" });
        }
    };

    return (
        <div className="custom-register-container">
            <div className="custom-register-card">
                <div className="custom-register-header">
                    <h2>Change Password</h2>
                    <p>Update your account password</p>
                </div>

                {errors.general && <div className="custom-error-message">⚠️ {errors.general}</div>}
                {successMsg && <div className="custom-success-message">{successMsg}</div>}

                <form onSubmit={handleSubmit} className="custom-register-form">
                    <div className="custom-input-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                        />
                        {errors.currentPassword && <span className="input-error">{errors.currentPassword}</span>}
                    </div>

                    <div className="custom-input-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                        />
                        {errors.newPassword && <span className="input-error">{errors.newPassword}</span>}
                    </div>

                    <div className="custom-input-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmNewPassword && (
                            <span className="input-error">{errors.confirmNewPassword}</span>
                        )}
                    </div>

                    <button type="submit" className="custom-register-button">
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
