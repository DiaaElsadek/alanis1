import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobs } from "../../redux/jobsSlice";
import JobCard from "../../components/JobCard";
import "./JobsList.css";

export default function JobsList() {
  const dispatch = useDispatch();
  const { jobs, status, error } = useSelector(state => state.jobs);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [experienceFilters, setExperienceFilters] = useState({
    entry: false,
    mid: false,
    senior: false
  });

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  // Handle experience filter changes
  const handleExperienceFilter = (level) => {
    setExperienceFilters(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  // Filter jobs based on selected filters and search term
  const filteredJobs = jobs.filter(job => {
    // Filter by job type
    const matchesType = filter === "all" || job.type === filter;
    
    // Filter by search term
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by experience level if any are selected
    const hasExperienceFilter = Object.values(experienceFilters).some(value => value);
    const matchesExperience = !hasExperienceFilter || 
      (experienceFilters.entry && job.level === "entry") ||
      (experienceFilters.mid && job.level === "mid") ||
      (experienceFilters.senior && job.level === "senior");
    
    return matchesType && matchesSearch && matchesExperience;
  });

  // Check if any filters are active
  const hasActiveFilters = filter !== "all" || 
    Object.values(experienceFilters).some(value => value) ||
    searchTerm.length > 0;

  // Reset all filters
  const resetAllFilters = () => {
    setFilter("all");
    setSearchTerm("");
    setExperienceFilters({
      entry: false,
      mid: false,
      senior: false
    });
  };

  return (
    <div className="jobs-list-container">
      <div className="jobs-hero">
        <div className="jobs-hero-content">
          <h1 className="jobs-hero-title">Find Your Next Opportunity</h1>
          <p className="jobs-hero-subtitle">Discover roles that match your skills and career goals</p>
          
          <div className="jobs-hero-search">
            <div className="jobs-search-container">
              <span className="jobs-search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search by job title, company, or keywords..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="search-button">Search</button>
          </div>
        </div>
        <div className="hero-gradient"></div>
      </div>
      
      <div className="jobs-main-content">
        <div className="sidebar-filters">
          <div className="filters-header">
            <h3>Filters</h3>
            {hasActiveFilters && (
              <button className="reset-all-filters" onClick={resetAllFilters}>
                Reset All
              </button>
            )}
          </div>
          
          <div className="filter-group">
            <h4>Job Type</h4>
            <div className="filter-options">
              <label className="filter-option">
                <input 
                  type="radio" 
                  name="job-type" 
                  checked={filter === "all"} 
                  onChange={() => setFilter("all")} 
                />
                <span>All Jobs</span>
              </label>
              <label className="filter-option">
                <input 
                  type="radio" 
                  name="job-type" 
                  checked={filter === "full-time"} 
                  onChange={() => setFilter("full-time")} 
                />
                <span>Full Time</span>
              </label>
              <label className="filter-option">
                <input 
                  type="radio" 
                  name="job-type" 
                  checked={filter === "part-time"} 
                  onChange={() => setFilter("part-time")} 
                />
                <span>Part Time</span>
              </label>
              <label className="filter-option">
                <input 
                  type="radio" 
                  name="job-type" 
                  checked={filter === "remote"} 
                  onChange={() => setFilter("remote")} 
                />
                <span>Remote</span>
              </label>
            </div>
          </div>
          
          <div className="filter-group">
            <h4>Experience Level</h4>
            <div className="filter-options">
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={experienceFilters.entry}
                  onChange={() => handleExperienceFilter("entry")}
                />
                <span>Entry Level</span>
              </label>
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={experienceFilters.mid}
                  onChange={() => handleExperienceFilter("mid")}
                />
                <span>Mid Level</span>
              </label>
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={experienceFilters.senior}
                  onChange={() => handleExperienceFilter("senior")}
                />
                <span>Senior Level</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="jobs-content">
          <div className="jobs-header">
            <h2>Available Positions</h2>
            <div className="results-count">
              <span>{filteredJobs.length} of {jobs.length} jobs</span>
              {hasActiveFilters && (
                <div className="active-filters">
                  {filter !== "all" && (
                    <div className="active-filter">
                      <span>{filter}</span>
                      <button onClick={() => setFilter("all")}>×</button>
                    </div>
                  )}
                  {experienceFilters.entry && (
                    <div className="active-filter">
                      <span>Entry Level</span>
                      <button onClick={() => handleExperienceFilter("entry")}>×</button>
                    </div>
                  )}
                  {experienceFilters.mid && (
                    <div className="active-filter">
                      <span>Mid Level</span>
                      <button onClick={() => handleExperienceFilter("mid")}>×</button>
                    </div>
                  )}
                  {experienceFilters.senior && (
                    <div className="active-filter">
                      <span>Senior Level</span>
                      <button onClick={() => handleExperienceFilter("senior")}>×</button>
                    </div>
                  )}
                  {searchTerm.length > 0 && (
                    <div className="active-filter">
                      <span>Search: "{searchTerm}"</span>
                      <button onClick={() => setSearchTerm("")}>×</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {status === "loading" ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading job opportunities...</p>
            </div>
          ) : status === "failed" ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Unable to load jobs</h3>
              <p>{error || "Please check your connection and try again"}</p>
              <button 
                className="retry-button"
                onClick={() => dispatch(fetchJobs())}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {filteredJobs.length > 0 ? (
                <div className="jobs-grid">
                  {filteredJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No jobs match your criteria</h3>
                  <p>Try adjusting your search terms or filters</p>
                  <button 
                    onClick={resetAllFilters}
                    className="clear-filters-button"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}