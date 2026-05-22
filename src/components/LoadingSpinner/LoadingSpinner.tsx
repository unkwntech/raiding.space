import React from 'react';
import './LoadingSpinner.css';

export function LoadingSpinner(): React.ReactElement {
  return (
    <div className="loading-spinner-wrap">
      <div className="loading-spinner" />
      <span>Loading skyhook data...</span>
    </div>
  );
}
