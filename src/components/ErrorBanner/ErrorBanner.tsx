import React from 'react';
import './ErrorBanner.css';

interface ErrorBannerProps {
  error: Error;
}

export function ErrorBanner({ error }: ErrorBannerProps): React.ReactElement {
  return (
    <div className="error-banner">
      <strong>Error loading skyhook data:</strong> {error.message}
    </div>
  );
}
