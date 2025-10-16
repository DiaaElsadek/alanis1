import React from 'react';
import './BookingCard.css';

const BookingCard = ({ booking, onStatusUpdate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#28a745';
      case 'Confirmed':
        return '#17a2b8';
      case 'Pending':
        return '#ffc107';
      case 'Cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="booking-card">
      <div className="booking-header">
        <h4 className="booking-title">{booking.service?.title || 'Service Booking'}</h4>
        <span 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(booking.status) }}
        >
          {booking.status}
        </span>
      </div>

      <div className="booking-details">
        <div className="detail-item">
          <span className="detail-icon">👤</span>
          <span className="detail-text">
            {booking.client?.name || booking.clientName || 'Unknown Client'}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">👩‍⚕️</span>
          <span className="detail-text">
            {booking.caregiver || booking.provider?.name || 'Unknown Caregiver'}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <span className="detail-text">
            {formatDate(booking.date)} at {booking.time}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">⏱️</span>
          <span className="detail-text">
            {booking.duration || '4 hours'}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">💰</span>
          <span className="detail-text">
            {booking.price ? `${booking.price} EGP` : 'Price not set'}
          </span>
        </div>
      </div>

      <div className="booking-actions">
        {booking.status === 'Pending' && (
          <>
            <button 
              className="btn-confirm"
              onClick={() => onStatusUpdate(booking.id, 'Confirmed')}
            >
              Confirm
            </button>
            <button 
              className="btn-cancel"
              onClick={() => onStatusUpdate(booking.id, 'Cancelled')}
            >
              Cancel
            </button>
          </>
        )}
        {booking.status === 'Confirmed' && (
          <>
            <button 
              className="btn-complete"
              onClick={() => onStatusUpdate(booking.id, 'Completed')}
            >
              Mark Complete
            </button>
            <button 
              className="btn-cancel"
              onClick={() => onStatusUpdate(booking.id, 'Cancelled')}
            >
              Cancel
            </button>
          </>
        )}
        {(booking.status === 'Completed' || booking.status === 'Cancelled') && (
          <button 
            className="btn-details"
            onClick={() => alert(`Booking details for ${booking.service?.title}`)}
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;