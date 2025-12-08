'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchManagerDashboard,
  fetchManagerRequests,
  exportManagerRequestsCsv,
} from '../../../lib/api';
import type {
  ManagerDashboardStats,
  ExitRequest,
} from '../../../lib/types';
import RequestDetailsModal from '../../../components/RequestDetailsModal';
import './dashboard.css';

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
  const [isExporting, setIsExporting] = useState(false);

  const loadDashboardData = async () => {
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
    }
  };

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
        setDataLoading(true);
        await loadDashboardData();
        setDataLoading(false);
      })();
    }
  }, [user, loading, router]);

  const handleDecisionMade = () => {
    // Refresh dashboard data after a decision is made
    loadDashboardData();
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await exportManagerRequestsCsv();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `all_exit_requests_${timestamp}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting requests:', err);
      setError('Failed to export requests. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading || dataLoading || !stats) {
    return (
      <div className="min-h-screen auth-background flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <div className="min-h-screen auth-background" style={{padding: 0}}>
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
              <button
                onClick={handleExport}
                disabled={isExporting || requests.length === 0}
                className="btn-export"
              >
                {isExporting ? (
                  <>
                    <div className="spinner-small"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export to CSV
                  </>
                )}
              </button>
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
        onDecision={handleDecisionMade}
      />
    </div>
  );
}
