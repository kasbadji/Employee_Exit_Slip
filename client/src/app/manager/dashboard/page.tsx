'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchManagerDashboard,
  fetchManagerRequests,
} from '../../../lib/api';
import type {
  ManagerDashboardStats,
  ExitRequest,
} from '../../../lib/types';
import RequestDetailsModal from '../../../components/RequestDetailsModal';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<ManagerDashboardStats | null>(null);
  const [requests, setRequests] = useState<ExitRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests'>('overview');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [canApproveRequest, setCanApproveRequest] = useState(false);

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

      (async () => {
        try {
          const [s, r] = await Promise.all([
            fetchManagerDashboard(),
            fetchManagerRequests(),
          ]);
          setStats(s);
          setRequests(r);
        } catch (e) {
          console.error(e);
          setError('Failed to load dashboard data.');
        } finally {
          setDataLoading(false);
        }
      })();
    }
  }, [user, loading, router]);

  if (loading || dataLoading || !stats) {
    return (
      <div className="min-h-screen auth-background flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <div className="min-h-screen auth-background">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-left">
            <div className="logo-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="page-title">Exit Slip Management</h1>
              <p className="page-subtitle">Welcome, {user?.full_name} · {user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="btn-logout"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            All Requests
            <span className="tab-badge">{stats.totalRequests || requests.length}</span>
          </button>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards Section */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Requests</p>
                  <p className="stat-value">{stats.totalRequests || requests.length}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-yellow">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Pending</p>
                  <p className="stat-value">{stats.totalPending}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-green">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Approved</p>
                  <p className="stat-value">{stats.totalApproved}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon stat-icon-red">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <p className="stat-label">Rejected</p>
                  <p className="stat-value">{stats.totalRejected}</p>
                </div>
              </div>
            </div>

            {/* Recent Requests Section */}
            <div className="requests-section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Recent Requests</h2>
                  <p className="section-subtitle">Latest exit slip submissions</p>
                </div>
                {pendingRequests.length > 0 && (
                  <span className="pending-badge">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {pendingRequests.length} Pending Review
                  </span>
                )}
              </div>

              <div className="requests-content">
                {pendingRequests.length === 0 ? (
                  <div className="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3>No pending requests</h3>
                    <p>There are no pending exit slip requests at this time</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="requests-table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Department</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRequests.slice(0, 4).map((r) => (
                          <tr key={r.id_request}>
                            <td className="employee-name-cell">{r.employee?.full_name ?? 'Unknown'}</td>
                            <td className="department-cell">{r.employee?.department ?? 'Engineering'}</td>
                            <td className="date-cell">
                              {new Date(r.requestedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="time-cell">
                              {new Date(r.requestedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })}
                            </td>
                            <td className="reason-cell">{r.reason}</td>
                            <td>
                              <span className={`status-badge status-${r.status.toLowerCase()}`}>
                                {r.status === 'PENDING' && (
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                {r.status === 'APPROVED' && (
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                {r.status === 'REJECTED' && (
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                {r.status}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => {
                                  setSelectedRequestId(r.id_request);
                                  setCanApproveRequest(true);
                                }}
                                className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-600 text-sm font-medium cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* All Requests Tab Content */}
        {activeTab === 'requests' && (
          <div className="requests-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">All Requests</h2>
                <p className="section-subtitle">View and manage exit slip requests</p>
              </div>
            </div>

            <div className="requests-content">
              {requests.length === 0 ? (
                <div className="empty-state">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3>No requests found</h3>
                  <p>There are no exit slip requests at this time</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="requests-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r) => (
                        <tr key={r.id_request}>
                          <td className="employee-name-cell">{r.employee?.full_name ?? 'Unknown'}</td>
                          <td className="department-cell">{r.employee?.department ?? 'Engineering'}</td>
                          <td className="date-cell">
                            {new Date(r.requestedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="time-cell">
                            {new Date(r.requestedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </td>
                          <td className="reason-cell">{r.reason}</td>
                          <td>
                            <span className={`status-badge status-${r.status.toLowerCase()}`}>
                              {r.status === 'PENDING' && (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {r.status === 'APPROVED' && (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {r.status === 'REJECTED' && (
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {r.status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedRequestId(r.id_request);
                                setCanApproveRequest(false);
                              }}
                              className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-600 text-sm font-medium cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal
        requestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
        canApprove={canApproveRequest}
      />

      <style jsx>{`
        .dashboard-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0;
          animation: fadeIn 0.5s ease-in;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2.5rem;
          background-color: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo-icon svg {
          width: 28px;
          height: 28px;
          color: white;
        }

        .page-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .page-subtitle {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0.25rem 0 0 0;
        }

        .btn-logout {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background-color: #ffffff;
          color: #4b5563;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-logout:hover {
          background-color: #f9fafb;
          border-color: #9ca3af;
          color: #1f2937;
        }

        .btn-logout svg {
          width: 1.125rem;
          height: 1.125rem;
        }

        .tabs-container {
          display: flex;
          gap: 0;
          padding: 0 2.5rem;
          background-color: #ffffff;
          border-bottom: 1px solid #e5e7eb;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .tab-button:hover {
          color: #1f2937;
          background-color: #f9fafb;
        }

        .tab-button.active {
          color: #667eea;
          border-bottom-color: #667eea;
          font-weight: 600;
        }

        .tab-button svg {
          width: 1.125rem;
          height: 1.125rem;
        }

        .tab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 0.375rem;
          background-color: #e5e7eb;
          color: #374151;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tab-button.active .tab-badge {
          background-color: #667eea;
          color: white;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          padding: 2rem 2.5rem;
          background-color: #f8f9fa;
        }

        .stat-card {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #d1d5db;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon-blue {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .stat-icon-yellow {
          background: linear-gradient(135deg, #f6ad55, #ed8936);
        }

        .stat-icon-green {
          background: linear-gradient(135deg, #48bb78, #38a169);
        }

        .stat-icon-red {
          background: linear-gradient(135deg, #fc8181, #f56565);
        }

        .stat-icon svg {
          width: 24px;
          height: 24px;
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
          margin: 0 0 0.5rem 0;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .requests-section {
          background-color: #ffffff;
          margin: 2rem 2.5rem;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.75rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }

        .section-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .pending-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #fef3c7;
          color: #d97706;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid #fde68a;
        }

        .pending-badge svg {
          width: 1rem;
          height: 1rem;
        }

        .requests-content {
          padding: 0;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-state svg {
          width: 64px;
          height: 64px;
          color: #9ca3af;
          margin: 0 auto 1rem;
          opacity: 0.4;
        }

        .empty-state h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .requests-table {
          width: 100%;
          border-collapse: collapse;
        }

        .requests-table thead th {
          background-color: #f9fafb;
          color: #6b7280;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 0.875rem 1.25rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .requests-table tbody tr {
          transition: all 0.15s ease;
          border-bottom: 1px solid #f3f4f6;
        }

        .requests-table tbody tr:last-child {
          border-bottom: none;
        }

        .requests-table tbody tr:hover {
          background-color: #f9fafb;
        }

        .requests-table tbody td {
          padding: 1rem 1.25rem;
          vertical-align: middle;
          font-size: 0.875rem;
          color: #1f2937;
        }

        .employee-name-cell {
          font-weight: 500;
          color: #111827;
        }

        .department-cell {
          color: #6b7280;
        }

        .date-cell {
          font-weight: 400;
          color: #374151;
        }

        .time-cell {
          font-weight: 400;
          color: #374151;
        }

        .reason-cell {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #4b5563;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge svg {
          width: 14px;
          height: 14px;
        }

        .status-pending {
          background-color: #fef3c7;
          color: #d97706;
          border: 1px solid #fde68a;
        }

        .status-approved {
          background-color: #d1fae5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        .status-rejected {
          background-color: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .btn-view-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background-color: transparent;
          color: #667eea;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-direction: row;
        }

        .btn-view-link:hover {
          background-color: #eef2ff;
        }

        .btn-view-link svg {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }

        .requests-table tbody td:last-child {
          text-align: center;
        }

        .requests-table tbody td button {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          transition: all 0.2s ease;
        }

        .requests-table tbody td button:hover {
          text-decoration: none;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem;
          }

          .tabs-container {
            padding: 0 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            padding: 1.5rem 1rem;
          }

          .requests-section {
            margin: 1.5rem 1rem;
          }

          .table-wrapper {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .requests-table {
            min-width: 900px;
          }
        }


      `}</style>
    </div>
  );
}
