import React from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { formatDate } from '../../lib/formatters';

export function ReviewsList({ reviews = [], avgRating = 5.0, reviewCount = 0 }) {
  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-navy">Customer Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(avgRating) ? 'fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-navy">{avgRating} out of 5</span>
            <span className="text-xs text-muted">({reviewCount} verified reviews)</span>
          </div>
        </div>

        <button
          onClick={() => alert('Review submission requires an account with a verified purchase.')}
          className="px-4 py-2 text-xs font-semibold text-navy bg-white border border-border rounded-xl hover:bg-canvas transition"
        >
          Write a Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-canvas rounded-xl border border-dashed border-border text-sm text-muted">
          No customer reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r, idx) => (
            <div
              key={r.id || idx}
              className="bg-white rounded-xl border border-border p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-navy/10 text-navy font-bold text-xs flex items-center justify-center">
                    {(r.customer?.name || 'A')[0]}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-navy flex items-center gap-1.5">
                      <span>{r.customer?.name || 'Verified Buyer'}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-teal fill-teal-50" />
                    </div>
                    <span className="text-[10px] text-muted">Verified Purchase</span>
                  </div>
                </div>

                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < r.rating ? 'fill-current' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>

              {r.createdAt && (
                <div className="text-[11px] text-muted">{formatDate(r.createdAt)}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
