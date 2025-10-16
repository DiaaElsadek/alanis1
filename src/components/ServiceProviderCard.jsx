import React from "react";
import { Link } from "react-router-dom";

export default function ServiceProviderCard({ provider }) {
  // Add safe default values if provider is undefined
  if (!provider) {
    return (
      <div className="provider-card">
        <div className="provider-card-content">
          <div className="provider-header">
            <img src="/default-avatar.png" alt="Provider" className="provider-avatar" />
            <div className="provider-info">
              <h4>Loading...</h4>
              <div className="provider-rating">⭐ 0.0 (0 reviews)</div>
            </div>
          </div>
          <p>Provider information is loading...</p>
        </div>
      </div>
    );
  }

  const {
    name = "Unknown Provider",
    avatar = "/default-avatar.png",
    rating = 0.0,
    reviewCount = 0,
    bio = "Professional service provider",
    serviceType = "Service",
    skills = [],
    isAvailable = false
  } = provider;

  return (
    <div className="provider-card">
      <div className="provider-card-content">
        <div className="provider-header">
          <img src={avatar} alt={name} className="provider-avatar" />
          <div className="provider-info">
            <h4>{name}</h4>
            <div className="provider-rating">
              ⭐ {rating} ({reviewCount} reviews)
            </div>
          </div>
        </div>
        
        <p>{bio}</p>
        
        <div className="provider-services">
          <span className="service-tag">{serviceType}</span>
          {skills.slice(0, 2).map((skill, index) => (
            <span key={index} className="service-tag">{skill}</span>
          ))}
        </div>
        
        <div className="provider-status">
          <div className="status-indicator">
            <span className={`status-dot ${isAvailable ? 'status-available' : 'status-busy'}`}></span>
            {isAvailable ? 'Available Now' : 'Busy'}
          </div>
          <Link to={`/provider/${provider.id}`}>
            <button className="request-button">View Details</button>
          </Link>
        </div>
      </div>
    </div>
  );
}