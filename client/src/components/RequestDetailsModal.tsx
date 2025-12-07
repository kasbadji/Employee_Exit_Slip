'use client';

import { useEffect, useState } from 'react';
import { fetchRequestsDetails } from '../lib/api';
import type { ExitRequestWithHistory } from '../lib/types';

interface RequestDetailsModalProps {
  requestId: number | null;
  onClose: () => void;
  canApprove?: boolean;
}

export default function RequestDetailsModal({ requestId, onClose, canApprove = false }: RequestDetailsModalProps) {
  const [request, setRequest] = useState<ExitRequestWithHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requestId === null) {
      setRequest(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await fetchRequestsDetails(requestId);
        setRequest(data);
      } catch (e) {
        console.error(e);
        setError('Failed to load request details');
      } finally {
        setLoading(false);
      }
    })();
  }, [requestId]);

  if (requestId === null) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Request Details</h2>
            <p className="modal-subtitle">Review exit slip information</p>
          </div>
          <button onClick={onClose} className="close-button" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && request && (
            <>
              {/* Current Status */}
              <div className="status-section">
                <div className="flex items-center justify-between">
                  <span className="section-label">Current Status</span>
                  <span className={`status-badge-modal status-${request.status.toLowerCase()}`}>
                    {request.status === 'PENDING' && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {request.status === 'APPROVED' && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {request.status === 'REJECTED' && (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {request.status}
                  </span>
                </div>
              </div>

              {/* Employee Information */}
              <div className="info-section">
                <h3 className="section-title">Employee Information</h3>
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-icon bg-indigo-100 text-indigo-600">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="info-label">Employee Name</p>
                      <p className="info-value">{request.employee?.full_name ?? 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-icon bg-purple-100 text-purple-600">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="info-label">Department</p>
                      <p className="info-value">{request.employee?.department ?? 'Engineering'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exit Details */}
              <div className="info-section">
                <h3 className="section-title">Exit Details</h3>
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-icon bg-blue-100 text-blue-600">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="info-label">Exit Date</p>
                      <p className="info-value">
                        {new Date(request.requestedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-icon bg-yellow-100 text-yellow-600">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="info-label">Exit Time</p>
                      <p className="info-value">
                        {new Date(request.requestedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason for Exit */}
              <div className="reason-section">
                <h3 className="section-title">Reason for Exit</h3>
                <div className="reason-box">
                  <p>{request.reason}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {canApprove && request.status === 'PENDING' && (
                <div className="action-buttons">
                  <button className="btn-approve">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve Request
                  </button>
                  <button className="btn-reject">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                    Reject Request
                  </button>
                </div>
              )}

              {/* Timestamps */}
              <div className="timestamps">
                <p className="timestamp-item">
                  • Created: {new Date(request.requestedAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .modal-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0.25rem 0 0 0;
        }

        .close-button {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          background-color: #f3f4f6;
          color: #111827;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .status-section {
          margin-bottom: 1.5rem;
        }

        .section-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
        }

        .status-badge-modal {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status-badge-modal svg {
          width: 1rem;
          height: 1rem;
        }

        .status-pending {
          background-color: #fef3c7;
          color: #d97706;
        }

        .status-approved {
          background-color: #d1fae5;
          color: #059669;
        }

        .status-rejected {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .info-section {
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 1rem 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }

        .info-card {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 10px;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-icon svg {
          width: 20px;
          height: 20px;
        }

        .info-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          margin: 0 0 0.25rem 0;
        }

        .info-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .reason-section {
          margin-bottom: 1.5rem;
        }

        .reason-box {
          padding: 1rem;
          background: #f9fafb;
          border-radius: 10px;
          border-left: 3px solid #6366f1;
        }

        .reason-box p {
          margin: 0;
          color: #374151;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .btn-approve,
        .btn-reject {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-approve {
          background-color: #10b981;
          color: white;
        }

        .btn-approve:hover {
          background-color: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-reject {
          background-color: #ef4444;
          color: white;
        }

        .btn-reject:hover {
          background-color: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .btn-approve svg,
        .btn-reject svg {
          width: 1.25rem;
          height: 1.25rem;
        }

        .timestamps {
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .timestamp-item {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0.25rem 0;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .info-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
