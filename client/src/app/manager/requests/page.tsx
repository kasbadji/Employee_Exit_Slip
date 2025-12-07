'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchManagerRequests } from '@/lib/api';
import type { ExitRequest } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function ManagerRequestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<ExitRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ExitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'MANAGER')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [statusFilter, searchQuery, requests]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchManagerRequests();
      setRequests(data);
    } catch (err) {
      setError('Failed to load exit requests. Please try again.');
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.employee?.full_name.toLowerCase().includes(query) ||
          req.employee?.email.toLowerCase().includes(query) ||
          req.reason.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleViewDetails = (id: number) => {
    router.push(`/manager/requests/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getStatusCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === 'PENDING').length,
      approved: requests.filter((r) => r.status === 'APPROVED').length,
      rejected: requests.filter((r) => r.status === 'REJECTED').length,
    };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen auth-background flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen auth-background">
      <div className="manager-requests-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Exit Requests</h1>
            <p className="page-subtitle">
              Manage and review employee exit requests
            </p>
          </div>
          <button
            onClick={() => router.push('/manager/dashboard')}
            className="btn-secondary"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-all">
            <div className="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">All Requests</p>
              <p className="stat-value">{statusCounts.all}</p>
            </div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Pending</p>
              <p className="stat-value">{statusCounts.pending}</p>
            </div>
          </div>

          <div className="stat-card stat-approved">
            <div className="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Approved</p>
              <p className="stat-value">{statusCounts.approved}</p>
            </div>
          </div>

          <div className="stat-card stat-rejected">
            <div className="stat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="stat-content">
              <p className="stat-label">Rejected</p>
              <p className="stat-value">{statusCounts.rejected}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-bar">
            <svg
              className="search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="clear-search"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="filter-tabs">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as StatusFilter[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`filter-tab ${
                    statusFilter === status ? 'active' : ''
                  }`}
                >
                  {status}
                  <span className="filter-badge">
                    {status === 'ALL'
                      ? statusCounts.all
                      : statusCounts[status.toLowerCase() as keyof typeof statusCounts]}
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3>No requests found</h3>
            <p>
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'There are no exit requests matching the selected filter'}
            </p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map((request) => (
              <div key={request.id_request} className="request-card">
                <div className="request-header">
                  <div className="employee-info">
                    <div className="employee-avatar">
                      {request.employee?.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="employee-name">
                        {request.employee?.full_name}
                      </h3>
                      <p className="employee-email">
                        {request.employee?.email}
                      </p>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="request-body">
                  <div className="request-field">
                    <label>Reason</label>
                    <p className="request-reason">{request.reason}</p>
                  </div>

                  <div className="request-field">
                    <label>Requested Date</label>
                    <p className="request-date">
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

                <div className="request-footer">
                  <button
                    onClick={() => handleViewDetails(request.id_request)}
                    className="btn-primary"
                  >
                    View Details
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .manager-requests-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          animation: fadeIn 0.5s ease-in;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .btn-secondary {
          display: flex;
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
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border-color: var(--accent-color);
        }

        .btn-secondary svg {
          width: 1.25rem;
          height: 1.25rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background-color: var(--card-bg);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .stat-all {
          border-color: #6366f1;
        }

        .stat-all .stat-icon {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }

        .stat-pending {
          border-color: #f59e0b;
        }

        .stat-pending .stat-icon {
          background: linear-gradient(135deg, #f59e0b, #f97316);
        }

        .stat-approved {
          border-color: #10b981;
        }

        .stat-approved .stat-icon {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .stat-rejected {
          border-color: #ef4444;
        }

        .stat-rejected .stat-icon {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon svg {
          width: 32px;
          height: 32px;
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .filters-section {
          background-color: var(--card-bg);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .search-bar {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.25rem;
          height: 1.25rem;
          color: var(--text-secondary);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 3rem 0.875rem 3rem;
          border: 2px solid var(--input-border);
          border-radius: 12px;
          font-size: 1rem;
          background-color: var(--input-bg);
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          color: var(--text-secondary);
          transition: all 0.3s ease;
        }

        .clear-search:hover {
          color: var(--text-primary);
        }

        .clear-search svg {
          width: 1.25rem;
          height: 1.25rem;
        }

        .filter-tabs {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border: 2px solid var(--input-border);
          background-color: var(--input-bg);
          color: var(--text-secondary);
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-tab:hover {
          border-color: var(--accent-color);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .filter-tab.active {
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
          border-color: var(--accent-color);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .filter-badge {
          background-color: rgba(255, 255, 255, 0.2);
          padding: 0.125rem 0.5rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .filter-tab.active .filter-badge {
          background-color: rgba(255, 255, 255, 0.3);
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background-color: #fee2e2;
          color: #991b1b;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border-left: 4px solid #ef4444;
        }

        .error-banner svg {
          width: 1.5rem;
          height: 1.5rem;
          flex-shrink: 0;
        }

        .empty-state {
          background-color: var(--card-bg);
          border-radius: 16px;
          padding: 4rem 2rem;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .empty-state svg {
          width: 80px;
          height: 80px;
          color: var(--text-secondary);
          margin: 0 auto 1.5rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 0;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }

        .request-card {
          background-color: var(--card-bg);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 2px solid transparent;
          display: flex;
          flex-direction: column;
        }

        .request-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-color: var(--accent-color);
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
          gap: 1rem;
        }

        .employee-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          min-width: 0;
        }

        .employee-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .employee-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .employee-email {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-badge {
          padding: 0.375rem 0.875rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .status-pending {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #92400e;
        }

        .status-approved {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
        }

        .status-rejected {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #991b1b;
        }

        .request-body {
          flex: 1;
          margin-bottom: 1.25rem;
        }

        .request-field {
          margin-bottom: 1rem;
        }

        .request-field:last-child {
          margin-bottom: 0;
        }

        .request-field label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.375rem;
        }

        .request-reason {
          color: var(--text-primary);
          font-size: 0.9375rem;
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .request-date {
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0;
        }

        .request-footer {
          padding-top: 1rem;
          border-top: 2px solid var(--input-border);
        }

        .btn-primary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
        }

        .btn-primary svg {
          width: 1.125rem;
          height: 1.125rem;
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
          to {
            transform: rotate(360deg);
          }
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
          .manager-requests-container {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .page-title {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .requests-grid {
            grid-template-columns: 1fr;
          }

          .filter-tabs {
            justify-content: center;
          }
        }

        @media (prefers-color-scheme: dark) {
          .error-banner {
            background-color: rgba(239, 68, 68, 0.1);
            color: #fca5a5;
          }

          .search-input:focus {
            box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.1);
          }

          .filter-tab.active {
            box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
          }

          .btn-primary {
            box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
          }

          .btn-primary:hover {
            box-shadow: 0 6px 20px rgba(0, 184, 148, 0.4);
          }

          .employee-avatar {
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
