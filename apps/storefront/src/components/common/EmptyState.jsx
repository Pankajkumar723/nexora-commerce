import React from 'react';
import { PackageSearch } from 'lucide-react';

export function EmptyState({
  title = 'No products found',
  description = 'Try adjusting your search criteria or resetting filters to find what you are looking for.',
  actionText = 'Clear All Filters',
  onAction,
}) {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-card border border-border">
      <div className="w-16 h-16 bg-blue-50 text-royal-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
        <PackageSearch className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-navy mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-md mx-auto mb-6">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 border border-border text-sm font-medium rounded-lg text-navy bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-blue transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
