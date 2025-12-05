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

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<ManagerDashboardStats | null>(null);
  const [requests, setRequests] = useState<ExitRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

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
            fetchManagerRequests('PENDING'),
          ]);
          setStats(s);
          setRequests(r);
        } catch (e) {
          console.error(e);
        } finally {
          setDataLoading(false);
        }
      })();
    }
  }, [user, loading, router]);

  if (loading || dataLoading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Welcome back, {user?.full_name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Stats Cards Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Card */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-yellow-400 to-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium uppercase tracking-wide opacity-90">Pending</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.totalPending}</p>
                </div>
                <div className="bg-white bg-opacity-30 rounded-full p-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50">
              <p className="text-xs text-gray-600">Awaiting your review</p>
            </div>
          </div>

          {/* Approved Card */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-green-400 to-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium uppercase tracking-wide opacity-90">Approved</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.totalApproved}</p>
                </div>
                <div className="bg-white bg-opacity-30 rounded-full p-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50">
              <p className="text-xs text-gray-600">Successfully processed</p>
            </div>
          </div>

          {/* Rejected Card */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-red-400 to-pink-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium uppercase tracking-wide opacity-90">Rejected</p>
                  <p className="text-4xl font-bold text-white mt-2">{stats.totalRejected}</p>
                </div>
                <div className="bg-white bg-opacity-30 rounded-full p-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50">
              <p className="text-xs text-gray-600">Declined requests</p>
            </div>
          </div>
        </section>

        {/* Pending Requests Table Section */}
        <section className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Pending Exit Requests</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {requests.length} pending
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-sm text-gray-500">No pending requests at the moment</p>
              </div>
            ) : (
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Requested At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((r) => (
                    <tr
                      key={r.id_request}
                      className="hover:bg-indigo-50 transition-colors duration-150 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {(r.employee?.full_name ?? 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {r.employee?.full_name ?? 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={r.reason}>
                          {r.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(r.requestedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(r.requestedAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
