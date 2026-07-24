import React from 'react';

/**
 * Skeleton loader for table rows.
 * Renders `rows` number of placeholder rows with `cols` columns.
 */
export default function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }, (_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="skeleton h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * Skeleton loader for card-style lists (like Budgets page).
 */
export function CardSkeleton({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="p-6">
          <div className="skeleton h-16 w-full" />
        </div>
      ))}
    </>
  );
}

