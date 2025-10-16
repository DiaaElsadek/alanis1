import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceCard.css';

const ServiceCard = ({ service, showDetails = false }) => {
  return (
    <div className="service-card">
      <div className="service-image">
        <img src={service.image || "/default-service.jpg"} alt={service.title} />
      </div>
      <div className="service-content">
        <h4>{service.title}</h4>
        <p className="service-provider">By {service.provider}</p>
        <p className="service-description">{service.description}</p>
        
        {showDetails && (
          <div className="service-details">
            <div className="service-rating">
              <span className="rating-stars">⭐ {service.rating}</span>
              <span className="reviews-count">({service.reviews} reviews)</span>
            </div>
            <div className="service-category">
              <span className="category-badge">{service.category}</span>
            </div>
          </div>
        )}
        
        <div className="service-footer">
          <span className="service-price">${service.price}/hour</span>
          <Link to={`/services/${service.id}`}>
            <button className="book-button">Book Now</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;