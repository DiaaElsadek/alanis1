import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobById } from "../../redux/jobsSlice";
import { applyToJob } from "../../redux/applicationsSlice";
import "./JobDetails.css"; // We'll create this CSS file

export default function JobDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentJob, status } = useSelector(state => state.jobs);

  useEffect(() => {
    dispatch(fetchJobById(id));
  }, [dispatch, id]);

  const handleApply = async () => {
    try {
      await dispatch(applyToJob({ jobId: id })).unwrap();
      alert("Application submitted successfully!");
    } catch (e) {
      alert(e?.message || "An error occurred");
    }
  };

  if (status === "loading") return <div className="job-details-loading">Loading...</div>;
  if (!currentJob) return <div className="job-details-error">Job not found</div>;

  return (
    <div className="job-details-container">
      <div className="job-details-header">
        <div className="company-info">
          <div className="company-logo">
            {currentJob.company ? currentJob.company.charAt(0) : 'C'}
          </div>
          <div className="job-title-section">
            <h2>{currentJob.title}</h2>
            <div className="company-details">
              <span className="company-name">{currentJob.company}</span>
              <span className="location">{currentJob.location}</span>
            </div>
          </div>
        </div>
        <button onClick={handleApply} className="apply-button">
          Apply Now
        </button>
      </div>

      <div className="job-details-content">
        <div className="job-info-grid">
          <div className="info-card">
            <h3>Job Type</h3>
            <p>{currentJob.type || "Full-time"}</p>
          </div>
          <div className="info-card">
            <h3>Experience Level</h3>
            <p>{currentJob.level || "Mid-level"}</p>
          </div>
          <div className="info-card">
            <h3>Salary Range</h3>
            <p>{currentJob.salary || "Competitive"}</p>
          </div>
          <div className="info-card">
            <h3>Remote Policy</h3>
            <p>{currentJob.remote || "On-site"}</p>
          </div>
        </div>

        <div className="job-description-section">
          <h2>Job Description</h2>
          <p>{currentJob.description}</p>
        </div>

        <div className="requirements-section">
          <h2>Requirements</h2>
          <ul>
            {(currentJob.requirements || [
              "Bachelor's degree in related field",
              "3+ years of professional experience",
              "Strong communication skills"
            ]).map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>

        <div className="benefits-section">
          <h2>Benefits</h2>
          <div className="benefits-grid">
            {(currentJob.benefits || [
              "Health insurance",
              "Flexible working hours",
              "Professional development",
              "Paid time off"
            ]).map((benefit, index) => (
              <div key={index} className="benefit-item">
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="job-details-footer">
        <button onClick={handleApply} className="apply-button-large">
          Apply for this Position
        </button>
      </div>
    </div>
  );
}