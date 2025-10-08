import React from 'react';

// Reusable loading spinner component
export default function LoadingSpinner({ size = 'md', color = 'green', fullScreen = false }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    green: 'border-green-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    blue: 'border-blue-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
}

// Button loading state component
export function LoadingButton({ loading, children, disabled, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`${props.className} relative`}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </span>
      )}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </button>
  );
}

// Inline loading indicator
export function InlineLoader({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <LoadingSpinner size="sm" color="green" />
      <span className="text-gray-600 text-sm">{text}</span>
    </div>
  );
}

// Overlay loading indicator
export function LoadingOverlay({ show, text = 'Loading...' }) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-40 rounded-lg">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" color="green" />
        <p className="text-gray-700 font-medium">{text}</p>
      </div>
    </div>
  );
}
