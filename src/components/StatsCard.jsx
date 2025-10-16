import React from "react";
import "./StatsCard.css";

const StatsCard = ({ title, value, icon, trend, trendValue }) => {
  const getTrendColor = () => {
    if (!trend) return "neutral";
    return trend === "up" ? "positive" : "negative";
  };

  const formatValue = (val) => {
    if (typeof val === "number") {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toString();
    }
    return val;
  };

  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <div className="stats-icon">{icon}</div>
        {trend && (
          <div className={`trend-indicator trend-${getTrendColor()}`}>
            {trend === "up" ? "↗" : "↘"}
            {trendValue && <span>{trendValue}%</span>}
          </div>
        )}
      </div>
      
      <div className="stats-content">
        <h3 className="stats-value">{formatValue(value)}</h3>
        <p className="stats-title">{title}</p>
      </div>
      
      <div className="stats-progress">
        <div 
          className="progress-bar"
          style={{ 
            width: typeof value === "number" ? `${Math.min(value / 100 * 100, 100)}%` : "0%" 
          }}
        ></div>
      </div>
    </div>
  );
};

export default StatsCard;