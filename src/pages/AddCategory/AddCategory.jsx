import React, { useState } from "react";
import "./AddCategory.css";
import { useNavigate } from "react-router-dom";

const AddCategory = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        iconUrl: "",
        isActive: true,
    });

    // For applications list
    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const nursingIcons = [
        { label: "Nurse", value: "🩺" },
        { label: "Hospital", value: "🏥" },
        { label: "Ambulance", value: "🚑" },
        { label: "Medicine", value: "💊" },
        { label: "Injection", value: "💉" },
        { label: "Doctor", value: "👨‍⚕️" },
        { label: "Doctor (female)", value: "👩‍⚕️" },
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://elanis.runasp.net/api/ServiceType/admin", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIwMmU4NGVlZC0yY2E4LTRhMzQtYWFmMS1mZDQwNDJmZGFkYzciLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJhZG1pbiIsIlVzZXJJZCI6IjAyZTg0ZWVkLTJjYTgtNGEzNC1hYWYxLWZkNDA0MmZkYWRjNyIsIkZ1bGxOYW1lIjoiIiwicm9sZSI6IkFkbWluIiwibmJmIjoxNzYwNjE4MTYxLCJleHAiOjE3NjEyMjI5NjEsImlhdCI6MTc2MDYxODE2MSwiaXNzIjoiSG9tZUNhcmVBcGkiLCJhdWQiOiJIb21lQ2FyZUNsaWVudHMifQ.AmJDDlboAK09KdtGhnLs-cMsz1gr7gc80u3YAQLjWZY",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            console.log("Data: ", data);

            if (response.ok && data.succeeded) {
                setMessage("✅ Category created successfully!");
                // Go back to previous page
                navigate(-1);
                setFormData({
                    name: "",
                    description: "",
                    iconUrl: "",
                    isActive: true,
                });
            } else {
                setMessage("❌ Error: " + (data.message || "Failed to create category"));
            }
        } catch (error) {
            console.error(error);
            setMessage("⚠️ Server error, please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="about-page">
            {/* Hero Section */}
            <div className="about-hero">
                <div className="about-hero-content">
                    <h1>Create a New Category</h1>
                    <p className="about-hero-subtitle">
                        Add a new service category to your platform.
                    </p>
                </div>
            </div>

            {/* Main Container */}
            <div className="about-container full-width-container">
                <div className="about-story">
                    <div className="about-story-content wide-form">
                        <h2 className="about-story-header-title">Category Details</h2>
                        <form
                            onSubmit={handleSubmit}
                            className="about-visual-card category-form"
                        >
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Icon</label>
                                <select
                                    name="iconUrl"
                                    value={formData.iconUrl}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                >
                                    <option value="">-- Select an Icon --</option>
                                    {nursingIcons.map((icon) => (
                                        <option key={icon.value} value={icon.value}>
                                            {icon.value} {icon.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                    />
                                    Active
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="about-btn about-btn-primary"
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Create Category"}
                            </button>

                            {message && <p className="form-message">{message}</p>}
                        </form>
                    </div>
                </div>

                {/* Existing Applications */}
                <div className="categories-grid applications-container">
                    {loading ? (
                        <p className="loading-text">Loading...</p>
                    ) : (
                        applications.map(app => (
                            <div key={app.id} className="category-card app-card">
                                <div className="category-icon">👤</div>
                                <div className="category-info">
                                    <span className="category-name">{app.firstName} {app.lastName}</span>
                                    <span className="category-count">{app.userEmail}</span>
                                    <span className="category-count">{app.phoneNumber}</span>
                                    <span className="category-count">Hourly Rate: ${app.hourlyRate}</span>
                                    <span className={`category-count status-${app.status}`}>
                                        Status: {app.status === 1 ? "Pending" : app.status === 2 ? "Approved" : "Rejected"}
                                    </span>
                                </div>
                                <div className="category-arrow">→</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddCategory;
