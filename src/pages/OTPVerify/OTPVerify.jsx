import React, { useState } from "react";
import "./OTPVerify.css";
import { useNavigate } from "react-router-dom";

const OTPVerify = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ otp: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    // ✅ Verify OTP
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.otp) {
            setErrors({ otp: "OTP is required" });
            return;
        }

        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            alert("❌ UserId or Token not found. Please register again.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://elanis.runasp.net/api/Account/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: userId,
                    otp: formData.otp,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.succeeded) {
                throw new Error(data.message || "OTP verification failed");
            }

            alert("✅ OTP verified successfully!");
            console.log("OTP Verified:", data);

            if (data.userId) localStorage.setItem("userId", data.userId);
            if (data.token) localStorage.setItem("token", data.token);

            navigate("/ClientDashboard");
        } catch (err) {
            console.error(err.message);
            alert("❌ " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Resend OTP
    const handleResendOTP = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("❌ UserId not found. Please register again.");
            return;
        }

        setResendLoading(true);

        try {
            const res = await fetch("http://elanis.runasp.net/api/Account/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            const data = await res.json();

            if (!res.ok || !data.succeeded) {
                throw new Error(data.message || "Failed to resend OTP");
            }

            alert("✅ OTP resent successfully!");
            console.log("Resend OTP:", data);
        } catch (err) {
            console.error(err.message);
            alert("❌ " + err.message);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="custom-register-container">
            <div className="custom-register-card">
                <div className="custom-register-header">
                    <h2>Verify The OTP</h2>
                    <p>Please enter the OTP sent to your email/phone</p>
                </div>

                <form onSubmit={handleSubmit} className="custom-register-form">
                    <div className="custom-input-group">
                        <label>Enter the OTP</label>
                        <input
                            type="text"
                            name="otp"
                            value={formData.otp}
                            onChange={handleChange}
                        />
                        {errors.otp && <span className="input-error">{errors.otp}</span>}
                    </div>

                    <button type="submit" className="custom-register-button" disabled={loading}>
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>

                {/* ✅ زرار إعادة إرسال OTP */}
                <button
                    onClick={handleResendOTP}
                    className="custom-register-button resend-otp-button"
                    disabled={resendLoading}
                >
                    {resendLoading ? "Resending..." : "Resend OTP"}
                </button>
            </div>
        </div>
    );
};

export default OTPVerify;
