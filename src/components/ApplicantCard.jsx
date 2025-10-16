import React from "react";
import "./ApplicantCard.css";

export default function ApplicantCard({ applicant }) {
  return (
    <div className="applicant-card">
      <div className="applicant-header">
        <img src={applicant.avatar || "/default-avatar.png"} alt="Applicant" className="applicant-avatar" />
        <div className="applicant-info">
          <h4>{applicant.name}</h4>
          <p>{applicant.major || applicant.qualification}</p>
          <p>{applicant.university || applicant.experience}</p>
        </div>
      </div>
      <div className="applicant-details">
        <p className="applicant-email">{applicant.email}</p>
        <p className="applicant-phone">{applicant.phone}</p>
      </div>
      <div className="applicant-actions">
        <button className="view-cv-button">View CV</button>
        <button className="contact-button">Contact</button>
      </div>
    </div>
  );
}