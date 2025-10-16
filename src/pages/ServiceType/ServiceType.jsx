// ServiceType.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ServiceType.css";

const ServiceType = () => {
    const { id } = useParams();
    const [serviceType, setServiceType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const fetchServiceType = async () => {
        setLoading(true);
        setMessage("");
        try {
            const response = await fetch(`http://elanis.runasp.net/api/ServiceType/${id}`, {
                method: "GET",
                headers: {
                    Authorization: "Bearer YOUR_TOKEN_HERE",
                    Accept: "application/json",
                },
            });
            const data = await response.json();
            if (response.ok && data.succeeded) {
                setServiceType(data.data);
            } else {
                setMessage("❌ Error: " + (data.message || "Failed to fetch Service Type"));
            }
        } catch (error) {
            console.error(error);
            setMessage("⚠️ Server error, please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceType();
    }, [id]);

    if (loading) {
        return <div className="st-container st-loading">Loading Service Type...</div>;
    }

    if (message) {
        return (
            <div className="st-container st-message">
                <p>{message}</p>
                <button className="st-back-btn" onClick={() => window.history.back()}>
                    ← Back
                </button>
            </div>
        );
    }

    if (!serviceType) {
        return (
            <div className="st-container st-message">
                <p>No Service Type found.</p>
                <button className="st-back-btn" onClick={() => window.history.back()}>
                    ← Back
                </button>
            </div>
        );
    }

    return (
        <div className="st-container">
            <div className="st-header">
                <h2 className="st-title">{serviceType.name} Details</h2>
                <button className="st-back-btn" onClick={() => window.history.back()}>
                    ← Back
                </button>
            </div>

            <div className="st-main-card">
                <div className="st-icon">{serviceType.iconUrl || "🚑"}</div>
                <div className="st-info">
                    <h3 className="st-name">{serviceType.name}</h3>
                    <p className="st-description">{serviceType.description}</p>
                    <p className={`st-status ${serviceType.isActive ? "active" : "inactive"}`}>
                        Status: {serviceType.isActive ? "Active" : "Inactive"}
                    </p>
                    <p className="st-created">
                        Created At: {new Date(serviceType.createdAt).toLocaleString()}
                    </p>
                </div>
            </div>

            {serviceType.categories && serviceType.categories.length > 0 && (
                <div className="st-categories-section">
                    <h3 className="st-subtitle">Categories</h3>
                    <div className="st-categories-grid">
                        {serviceType.categories.length !== 0 ? serviceType.categories.map((cat) => (
                            <div key={cat.id} className="st-category-card">
                                <div className="st-category-icon">📌</div>
                                <div className="st-category-info">
                                    <span className="st-category-name">{cat.name}</span>
                                    <span className={`st-category-status ${cat.isActive ? "active" : "inactive"}`}>
                                        {cat.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        ))
                            :
                            <div>
                                No Categories
                            </div>
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceType;
