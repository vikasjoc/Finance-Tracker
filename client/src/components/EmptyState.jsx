import React from 'react';

/**
 * Consistent empty state placeholder with emoji, message,
 * and optional action button.
 */
export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="p-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-gray-400">{title}</p>
      {description && (
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-primary-600 hover:text-primary-500 text-sm mt-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

