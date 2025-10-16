import React from 'react';
import './CaregiverCard.css';

const CaregiverCard = ({ caregiver, onSelect, isSelected, onEdit, onVerify, onDelete }) => {
  return (
    <div 
      className={`caregiver-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(caregiver)}
    >
      <div className="caregiver-header">
        <div className="caregiver-avatar">
          {caregiver.name?.charAt(0) || 'C'}
        </div>
        <div className="caregiver-basic-info">
          <h4 className="caregiver-name">{caregiver.name || 'Unknown Caregiver'}</h4>
          <span className={`status-badge ${caregiver.verified ? 'verified' : 'pending'}`}>
            {caregiver.verified ? 'Verified' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="caregiver-details">
        <div className="detail-row">
          <span className="detail-label">Service:</span>
          <span className="detail-value">{caregiver.serviceType || 'Not specified'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Experience:</span>
          <span className="detail-value">{caregiver.experience || '0'} years</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Location:</span>
          <span className="detail-value">{caregiver.location || 'Not specified'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Rate:</span>
          <span className="detail-value">{caregiver.hourlyRate || '0'} EGP/hour</span>
        </div>
      </div>

      {caregiver.skills && (
        <div className="caregiver-skills">
          <span className="skills-label">Skills:</span>
          <div className="skills-tags">
            {caregiver.skills.split(',').map((skill, index) => (
              <span key={index} className="skill-tag">{skill.trim()}</span>
            ))}
          </div>
        </div>
      )}

      <div className="caregiver-actions">
        <button 
          className="btn-edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(caregiver);
          }}
        >
          Edit
        </button>
        <button 
          className={`btn-verify ${caregiver.verified ? 'verified' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onVerify(caregiver.id);
          }}
        >
          {caregiver.verified ? 'Unverify' : 'Verify'}
        </button>
        <button 
          className="btn-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(caregiver.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default CaregiverCard;