import React from "react";
import "./JobCard.css";

const JobCard = ({ job, isGraduate = false }) => {
  const formatSalary = (salary) => {
    if (!salary) return "Competitive";
    if (typeof salary === "number") return `$${salary.toLocaleString()}`;
    return salary;
  };

  const getJobTypeColor = (type) => {
    const typeColors = {
      "full-time": "#28a745",
      "part-time": "#ffc107",
      contract: "#17a2b8",
      internship: "#6f42c1",
      remote: "#dc3545"
    };
    return typeColors[type.toLowerCase()] || "#6c757d";
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="company-logo">
          {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
        </div>
        <div className="job-title-section">
          <h3 className="job-title">{job.title}</h3>
          <p className="company-name">{job.company || "Tech Company"}</p>
        </div>
      </div>

      <div className="job-details">
        <div className="detail-item">
          <span className="detail-icon">📍</span>
          <span className="detail-text">{job.location || "Remote"}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">💰</span>
          <span className="detail-text">{formatSalary(job.salary)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">⏰</span>
          <span 
            className="detail-text job-type"
            style={{ color: getJobTypeColor(job.type) }}
          >
            {job.type || "Full-time"}
          </span>
        </div>
      </div>

      <p className="job-description">
        {job.description || "We're looking for a talented professional to join our team..."}
      </p>

      <div className="job-skills">
        {(job.skills || ["JavaScript", "React", "Node.js"]).slice(0, 3).map((skill, index) => (
          <span key={index} className="skill-tag">{skill}</span>
        ))}
        {(job.skills && job.skills.length > 3) && (
          <span className="skill-tag-more">+{job.skills.length - 3} more</span>
        )}
      </div>

      <div className="job-card-footer">
        <div className="job-meta">
          <span className="posted-date">
            Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "recently"}
          </span>
          {job.applicantsCount !== undefined && (
            <span className="applicants-count">
              {job.applicantsCount} applicant{job.applicantsCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="job-actions">
          <button className="apply-btn">
            Apply Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="save-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {isGraduate && (
        <div className="graduate-badge">
          <span>🎓 Graduate Opportunity</span>
        </div>
      )}
    </div>
  );
};

export default JobCard;