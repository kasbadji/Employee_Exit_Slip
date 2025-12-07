'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import { fetchRequestsDetails } from '../../../../lib/api';
import type { ExitRequestWithHistory } from '../../../../lib/types';

export default function RequestDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [request, setRequest] = useState<ExitRequestWithHistory | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
        return;
      }
      if (user.role !== 'MANAGER') {
        router.replace('/login');
        return;
      }

      const id = Number(params.id);
      if (Number.isNaN(id)) {
        setError('Invalid request id');
        setDataLoading(false);
        return;
      }

      (async () => {
        try {
          const data = await fetchRequestsDetails(id);
          setRequest(data);
        } catch (e) {
          console.error(e);
          setError('Failed to load request details');
        } finally {
          setDataLoading(false);
        }
      })();
    }
  }, [user, loading, router, params.id]);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen auth-background flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen auth-background">
        <div className="details-container">
          <button onClick={() => router.back()} className="back-button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to requests
          </button>
          <div className="error-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>{error || 'Request not found'}</h3>
            <p>The request you're looking for doesn't exist or you don't have permission to view it.</p>
          </div>
        </div>

        <style jsx>{`
          .details-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem;
            animation: fadeIn 0.5s ease-in;
          }

          .back-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background-color: var(--card-bg);
            color: var(--text-primary);
            border: 2px solid var(--input-border);
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-bottom: 2rem;
          }

          .back-button:hover {
            transform: translateX(-4px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            border-color: var(--accent-color);
          }

          .back-button svg {
            width: 1.25rem;
            height: 1.25rem;
          }

          .error-state {
            background-color: var(--card-bg);
            border-radius: 16px;
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            border-left: 4px solid #ef4444;
          }

          .error-state svg {
            width: 80px;
            height: 80px;
            color: #ef4444;
            margin: 0 auto 1.5rem;
          }

          .error-state h3 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 0.5rem 0;
          }

          .error-state p {
            color: var(--text-secondary);
            font-size: 1rem;
            margin: 0;
          }

          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(0, 123, 255, 0.1);
            border-top-color: var(--accent-color);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (prefers-color-scheme: dark) {
            .loading-spinner {
              border: 4px solid rgba(0, 184, 148, 0.1);
              border-top-color: var(--accent-color);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen auth-background">
      <div className="details-container">
        <button onClick={() => router.back()} className="back-button">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to requests
        </button>

        {/* Request Details Card */}
        <div className="request-details-card">
          <div className="card-header">
            <h1 className="card-title">Exit Request #{request.id_request}</h1>
          </div>

          <div className="card-content">
            <div className="employee-section">
              <div className="employee-avatar">
                {(request.employee?.full_name ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div className="employee-details">
                <h2 className="employee-name">{request.employee?.full_name}</h2>
                <p className="employee-email">{request.employee?.email}</p>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="info-content">
                  <p className="info-label">Requested At</p>
                  <p className="info-value">
                    {new Date(request.requestedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="info-content">
                  <p className="info-label">Current Status</p>
                  <StatusBadge status={request.status} />
                </div>
              </div>
            </div>

            <div className="reason-section">
              <div className="reason-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="reason-content">
                <p className="reason-label">Reason for Exit</p>
                <p className="reason-text">{request.reason}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status History Card */}
        <div className="history-card">
          <div className="card-header">
            <h2 className="card-title">Status History</h2>
          </div>

          <div className="card-content">
            {!request.history || request.history.length === 0 ? (
              <div className="empty-history">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No history entries yet.</p>
              </div>
            ) : (
              <div className="history-timeline">
                {request.history.map((h, index) => (
                  <div key={h.id_history} className="history-item">
                    <div className="timeline-marker">
                      <div className="marker-number">{index + 1}</div>
                      {index < request.history.length - 1 && <div className="timeline-line"></div>}
                    </div>

                    <div className="history-content">
                      <div className="history-header">
                        <StatusBadge status={h.status} />
                        <span className="history-time">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(h.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="history-user">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="user-name">{h.changedBy.full_name}</span>
                        <span className="user-role">({h.changedBy.role})</span>
                      </div>

                      {h.comment && (
                        <div className="history-comment">
                          <p className="comment-label">Comment</p>
                          <p className="comment-text">{h.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .details-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
          animation: fadeIn 0.5s ease-in;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: var(--card-bg);
          color: var(--text-primary);
          border: 2px solid var(--input-border);
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }

        .back-button:hover {
          transform: translateX(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border-color: var(--accent-color);
        }

        .back-button svg {
          width: 1.25rem;
          height: 1.25rem;
        }

        .request-details-card,
        .history-card {
          background-color: var(--card-bg);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
          border: 2px solid var(--input-border);
        }

        .card-header {
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
          padding: 1.5rem;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .card-content {
          padding: 2rem;
        }

        .employee-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(0, 123, 255, 0.05), rgba(138, 92, 246, 0.05));
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .employee-avatar {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.75rem;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .employee-details {
          flex: 1;
        }

        .employee-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .employee-email {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background-color: var(--input-bg);
          border-radius: 12px;
          border: 2px solid var(--input-border);
          transition: all 0.3s ease;
        }

        .info-item:hover {
          border-color: var(--accent-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .info-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-icon svg {
          width: 24px;
          height: 24px;
          color: white;
        }

        .info-content {
          flex: 1;
          min-width: 0;
        }

        .info-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.375rem 0;
        }

        .info-value {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .reason-section {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(249, 115, 22, 0.1));
          border-radius: 12px;
          border: 2px solid rgba(245, 158, 11, 0.3);
        }

        .reason-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .reason-icon svg {
          width: 24px;
          height: 24px;
          color: white;
        }

        .reason-content {
          flex: 1;
        }

        .reason-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: #92400e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.5rem 0;
        }

        .reason-text {
          font-size: 1rem;
          color: var(--text-primary);
          line-height: 1.6;
          margin: 0;
        }

        .empty-history {
          text-align: center;
          padding: 3rem 2rem;
        }

        .empty-history svg {
          width: 64px;
          height: 64px;
          color: var(--text-secondary);
          margin: 0 auto 1rem;
          opacity: 0.5;
        }

        .empty-history p {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 0;
        }

        .history-timeline {
          position: relative;
        }

        .history-item {
          display: flex;
          gap: 1.5rem;
          position: relative;
        }

        .history-item:not(:last-child) {
          margin-bottom: 2rem;
        }

        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }

        .marker-number {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.125rem;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          z-index: 1;
        }

        .timeline-line {
          width: 3px;
          flex: 1;
          background: linear-gradient(180deg, var(--accent-color), var(--accent-hover));
          margin-top: 0.5rem;
          border-radius: 2px;
        }

        .history-content {
          flex: 1;
          background-color: var(--input-bg);
          border-radius: 12px;
          padding: 1.5rem;
          border: 2px solid var(--input-border);
          transition: all 0.3s ease;
        }

        .history-content:hover {
          border-color: var(--accent-color);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .history-time {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .history-time svg {
          width: 1rem;
          height: 1rem;
        }

        .history-user {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9375rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .history-user svg {
          width: 1.125rem;
          height: 1.125rem;
          color: var(--accent-color);
        }

        .user-name {
          font-weight: 600;
        }

        .user-role {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .history-comment {
          padding: 1rem;
          background-color: var(--card-bg);
          border-radius: 8px;
          border: 1px solid var(--input-border);
        }

        .comment-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.5rem 0;
        }

        .comment-text {
          font-size: 0.9375rem;
          color: var(--text-primary);
          line-height: 1.6;
          margin: 0;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(0, 123, 255, 0.1);
          border-top-color: var(--accent-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .details-container {
            padding: 1rem;
          }

          .card-content {
            padding: 1.5rem;
          }

          .employee-section {
            flex-direction: column;
            text-align: center;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .history-item {
            gap: 1rem;
          }
        }

        @media (prefers-color-scheme: dark) {
          .employee-avatar {
            box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
          }

          .marker-number {
            box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
          }

          .loading-spinner {
            border: 4px solid rgba(0, 184, 148, 0.1);
            border-top-color: var(--accent-color);
          }
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }) {
  const styles: Record<typeof status, { bg: string; text: string; icon: JSX.Element }> = {
    PENDING: {
      bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      text: '#92400e',
      icon: <span className="pulse-dot"></span>
    },
    APPROVED: {
      bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      text: '#065f46',
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    },
    REJECTED: {
      bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
      text: '#991b1b',
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )
    },
  };

  const style = styles[status];

  return (
    <>
      <span className="status-badge">
        {style.icon}
        {status}
      </span>

      <style jsx>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: ${style.bg};
          color: ${style.text};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .status-badge svg {
          width: 1rem;
          height: 1rem;
        }

        .pulse-dot {
          width: 10px;
          height: 10px;
          background-color: #f59e0b;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
