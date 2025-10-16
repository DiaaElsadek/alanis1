import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyApplications } from "../redux/applicationsSlice";
import "./Applications.css";

export default function Applications() {
  const dispatch = useDispatch();
  const { myApplications, status, error } = useSelector(state => state.applications);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState(null);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      case 'under review': return 'status-under-review';
      default: return '';
    }
  };

  const handleWithdraw = (application) => {
    setApplicationToWithdraw(application);
    // In a real app, you would dispatch an action here
    console.log("Withdraw application:", application.id);
    // Simulate API call delay
    setTimeout(() => {
      setApplicationToWithdraw(null);
      alert(`Application for ${application.job.title} has been withdrawn.`);
    }, 1000);
  };

  const filteredApplications = filterStatus === "all" 
    ? myApplications 
    : myApplications.filter(app => app.status.toLowerCase() === filterStatus.toLowerCase());

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (status === "failed") {
    return (
      <div className="applications-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error || "Failed to load your applications. Please try again."}</p>
          <button 
            className="btn-primary" 
            onClick={() => dispatch(fetchMyApplications())}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h2>My Job Applications</h2>
        <p>Track the status of all your job applications in one place</p>
      </div>
      
      {status === "loading" ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your applications...</p>
        </div>
      ) : myApplications.length ? (
        <>
          <div className="applications-filters">
            <label htmlFor="status-filter">Filter by status:</label>
            <select 
              id="status-filter"
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="under review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="applications-count">
              {filteredApplications.length} of {myApplications.length} applications
            </span>
          </div>
          
          <div className="applications-list">
            {filteredApplications.map(application => (
              <div key={application.id} className="application-card">
                <div className="application-main-info">
                  <h3 className="job-title">{application.job?.title || "Job Title"}</h3>
                  <p className="company-name">{application.job?.company || "Company Name"}</p>
                  <p className="application-date">
                    Applied on: {formatDate(application.date)}
                  </p>
                </div>
                <div className="application-status">
                  <span className={`status-badge ${getStatusClass(application.status)}`}>
                    {application.status}
                  </span>
                </div>
                <div className="application-actions">
                  <button 
                    className="btn-view" 
                    onClick={() => setSelectedApplication(application)}
                  >
                    View Details
                  </button>
                  {application.status.toLowerCase() === "pending" && (
                    <button 
                      className="btn-withdraw" 
                      onClick={() => handleWithdraw(application)}
                      disabled={applicationToWithdraw?.id === application.id}
                    >
                      {applicationToWithdraw?.id === application.id ? "Withdrawing..." : "Withdraw Application"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No applications yet</h3>
          <p>You haven't applied to any jobs yet. Start browsing available positions to apply.</p>
          <button className="btn-primary">Browse Jobs</button>
        </div>
      )}
      
      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Application Details</h3>
              <button className="modal-close" onClick={() => setSelectedApplication(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-item">
                <strong>Job Title:</strong> {selectedApplication.job?.title || "N/A"}
              </div>
              <div className="detail-item">
                <strong>Company:</strong> {selectedApplication.job?.company || "N/A"}
              </div>
              <div className="detail-item">
                <strong>Applied On:</strong> {formatDate(selectedApplication.date)}
              </div>
              <div className="detail-item">
                <strong>Status:</strong> 
                <span className={`status-badge ${getStatusClass(selectedApplication.status)}`}>
                  {selectedApplication.status}
                </span>
              </div>
              <div className="detail-item">
                <strong>Application ID:</strong> {selectedApplication.id || "N/A"}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setSelectedApplication(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Withdrawal Confirmation Modal */}
      {applicationToWithdraw && (
        <div className="modal-overlay" onClick={() => setApplicationToWithdraw(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Withdrawal</h3>
              <button className="modal-close" onClick={() => setApplicationToWithdraw(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to withdraw your application for <strong>{applicationToWithdraw.job?.title}</strong> at <strong>{applicationToWithdraw.job?.company}</strong>?</p>
              <p className="text-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-withdraw" 
                onClick={() => handleWithdraw(applicationToWithdraw)}
              >
                Confirm Withdrawal
              </button>
              <button 
                className="btn-view" 
                onClick={() => setApplicationToWithdraw(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}