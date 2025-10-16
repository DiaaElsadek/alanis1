import React, { useState } from "react";
import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        phoneNumber: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://elanis.runasp.net/api/Account/forget-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok || !data.succeeded) {
                throw new Error(data.message || "Failed to send OTP");
            }

            alert("✅ " + data.message);

            // خزن الـ userId عشان تستخدمه في verify otp
            if (data.data?.userId) {
                localStorage.setItem("userId", data.data.userId);
            }

            navigate("/reset-password"); // يوديه على صفحة الـ OTP

        } catch (err) {
            console.error(err.message);
            alert("❌ " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="custom-register-container">
            <div className="custom-register-card">
                <div className="custom-register-header">
                    <h2>Forgot Password</h2>
                    <p>Enter your email and phone number to receive an OTP</p>
                </div>

                <form onSubmit={handleSubmit} className="custom-register-form">
                    <div className="custom-input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <span className="input-error">{errors.email}</span>}
                    </div>

                    <div className="custom-input-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                        {errors.phoneNumber && (
                            <span className="input-error">{errors.phoneNumber}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="custom-register-button"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
