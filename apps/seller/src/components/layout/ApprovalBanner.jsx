import React from 'react';
import { Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

export function ApprovalBanner({ status, rejectionReason, onOpenSettings }) {
  if (status === 'APPROVED') {
    return null;
  }

  if (status === 'PENDING') {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs mb-6 shadow-xs animate-fade-in">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
          <span>
            <strong className="font-bold">Application Pending Review:</strong> Your seller profile is awaiting admin verification. You can set up your catalog drafts and review store settings while approval is in progress.
          </span>
        </div>
        <span className="shrink-0 font-semibold px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-800 text-[11px]">
          Pending Admin Action
        </span>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-900 px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-6 shadow-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong className="font-bold">Application Declined:</strong> {rejectionReason || 'Please review your business or tax information and re-submit for review.'}
          </span>
        </div>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="shrink-0 px-3 py-1 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition"
          >
            Update Information
          </button>
        )}
      </div>
    );
  }

  if (status === 'SUSPENDED') {
    return (
      <div className="bg-gray-100 border border-gray-300 text-gray-900 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs mb-6 shadow-xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong className="font-bold">Account Suspended:</strong> Your merchant privileges have been temporarily paused. Please contact Nexora platform support for assistance.
        </span>
      </div>
    );
  }

  return null;
}

export default ApprovalBanner;
