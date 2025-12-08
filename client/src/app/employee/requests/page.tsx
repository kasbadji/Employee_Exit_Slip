"use client";

import { useAuth } from "@/hooks/useAuth";
import { fetchMyExitRequests } from "@/lib/api";
import { ExitRequest } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EmployeeLayout from "@/components/EmployeeLayout";
import StatusBadge from "@/components/StatusBadge";
import CreateRequestModal from "@/components/CreateRequestModal";

type FilterType = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AllRequestsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [requests, setRequests] = useState<ExitRequest[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ExitRequest | null>(null);

    useEffect(() => {
        if (!loading && (!user || user.role !== "EMPLOYEE")) {
            router.push("/login");
            return;
        }

        if (!loading && user) {
            loadRequests();
        }
    }, [user, loading, router]);

    const loadRequests = async () => {
        try {
            const data = await fetchMyExitRequests();
            setRequests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setDataLoading(false);
        }
    };

    const handleCreateSuccess = (newRequest: ExitRequest) => {
        setRequests((prev) => [newRequest, ...prev]);
    };

    const filteredRequests = filter === 'ALL'
        ? requests
        : requests.filter(r => r.status === filter);

    const getCounts = () => ({
        all: requests.length,
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length,
    });

    const counts = getCounts();

    if (loading || dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <EmployeeLayout>
            {/* Page Header with Filter and New Request Button */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">All Requests</h1>
                        <p className="text-gray-600">View and manage exit slip requests</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>New Request</span>
                    </button>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            filter === 'ALL'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        All {counts.all > 0 && `(${counts.all})`}
                    </button>
                    <button
                        onClick={() => setFilter('PENDING')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            filter === 'PENDING'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Pending {counts.pending > 0 && `(${counts.pending})`}
                    </button>
                    <button
                        onClick={() => setFilter('APPROVED')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            filter === 'APPROVED'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Approved {counts.approved > 0 && `(${counts.approved})`}
                    </button>
                    <button
                        onClick={() => setFilter('REJECTED')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            filter === 'REJECTED'
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Rejected {counts.rejected > 0 && `(${counts.rejected})`}
                    </button>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {filter === 'ALL'
                                    ? 'Get started by creating a new exit request.'
                                    : `No ${filter.toLowerCase()} requests at the moment.`}
                            </p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reason
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Requested At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRequests.map((request) => (
                                    <tr key={request.id_request} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900 line-clamp-2">{request.reason}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-900">
                                                {new Date(request.requestedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(request.requestedAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={request.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedRequest(request)}
                                                className="text-purple-600 hover:text-purple-900 text-sm font-medium flex items-center space-x-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span>View</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create Request Modal */}
            <CreateRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* View Request Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={() => setSelectedRequest(null)}
                    />
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                                    <p className="text-sm text-gray-500">Review exit slip information</p>
                                </div>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Current Status */}
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-500 mb-2">Current Status</p>
                                <StatusBadge status={selectedRequest.status} />
                            </div>

                            {/* Employee Information */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Employee Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start space-x-3 bg-blue-50 rounded-lg p-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Employee Name</p>
                                            <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3 bg-purple-50 rounded-lg p-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Department</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedRequest.employee?.department || 'Engineering'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Exit Details */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Exit Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start space-x-3 bg-blue-50 rounded-lg p-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Exit Date</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedRequest.exitDate || new Date(selectedRequest.requestedAt).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3 bg-yellow-50 rounded-lg p-3">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Exit Time</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {selectedRequest.exitTime || new Date(selectedRequest.requestedAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reason for Exit */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Reason for Exit</h3>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-sm text-gray-700">{selectedRequest.reason}</p>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="border-t pt-4">
                                <div className="space-y-1 text-xs text-gray-500">
                                    <p>
                                        • Created: {new Date(selectedRequest.requestedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}, {new Date(selectedRequest.requestedAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <p>
                                        • Last Updated: {new Date(selectedRequest.requestedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}, {new Date(selectedRequest.requestedAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </EmployeeLayout>
    );
}
