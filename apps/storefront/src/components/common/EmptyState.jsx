import React from 'react';
import { PackageSearch } from 'lucide-react';
import { Button } from '../ui/button';

export function EmptyState({
  title = 'No products found',
  description = 'Try adjusting your search criteria or resetting filters to find what you are looking for.',
  actionText = 'Clear All Filters',
  onAction,
}) {
  return (
    <div className="text-center py-16 px-4 bg-card rounded-2xl border border-border shadow-2xs">
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
        <PackageSearch className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">{description}</p>
      {onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          size="sm"
          className="font-semibold text-xs"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
