"use client";

import { useAuth } from "@/hooks/useAuth";
import { createExitRequest, fetchMyExitRequests } from "@/lib/api";
import { ExitRequest } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";

export default function ExitRequestsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [requests, setRequests] = useState<ExitRequest[]>([]);
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && (!user || user.role !== "EMPLOYEE")) {
            router.push("/login");
        }


    (async () => {
        try {
            const data = await fetchMyExitRequests();
            setRequests(data);
        }
        catch (err) {
            console.error(err);
            setError("Failed to load exit requests.");
        }
        finally {
            setDataLoading(false);
        }
      })();
    }, [user, loading, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        if (!reason.trim()) return;

        try {
            const newRequest = await createExitRequest(reason.trim());
            setRequests((prev) => [...prev, newRequest]);
            setReason("");
        }
        catch (err) {
            console.error(err);
            setError("Failed to create exit request.");
        }
        finally {
            setSubmitting(false);
        }
    };

    const getStatusBadgeClasses = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "APPROVED":
                return "bg-green-100 text-green-800 border-green-200";
            case "REJECTED":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    if (loading || dataLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 border-r-blue-600 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-600 font-medium">Loading your requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Header Section */}
                <div className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                        Exit Requests
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base">
                        Manage your exit requests and track their status
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 sm:mb-8 p-4 rounded-xl bg-red-50 border-l-4 border-red-500 shadow-sm animate-in slide-in-from-top duration-300">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-red-800 font-medium text-sm sm:text-base">{error}</p>
                        </div>
                    </div>
                )}

                {/* Create New Request Form */}
                <div className="mb-8 sm:mb-12">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                        <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4 sm:px-8 sm:py-5">
                            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Submit New Exit Request
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                            <div className="space-y-2">
                                <label htmlFor="reason" className="block text-sm font-semibold text-slate-700">
                                    Reason for Exit <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    rows={5}
                                    placeholder="Please provide a detailed reason for your exit request..."
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none resize-none text-slate-900 placeholder:text-slate-400"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {reason.length} characters
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !reason.trim()}
                                className="mt-6 w-full sm:w-auto px-8 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Submit Exit Request
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Previous Requests Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center">
                            <svg className="w-7 h-7 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Request History
                        </h2>
                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {requests.length} {requests.length === 1 ? "Request" : "Requests"}
                        </span>
                    </div>

                    {requests.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-slate-600 text-lg font-medium">No exit requests found</p>
                                <p className="text-slate-500 text-sm max-w-md">
                                    You haven&apos;t submitted any exit requests yet. Use the form above to create your first request.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:gap-6">
                            {requests.map((req) => (
                                <div
                                    key={req.id_request}
                                    className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
                                >
                                    <div className="p-6 sm:p-8">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Request ID</p>
                                                    <p className="text-sm font-mono text-slate-700">#{req.id_request}</p>
                                                </div>
                                            </div>
                                            <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusBadgeClasses(req.status)} transition-all duration-200`}>
                                                {req.status}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Reason</p>
                                                <p className="text-slate-800 leading-relaxed">{req.reason}</p>
                                            </div>

                                            <div className="flex items-center text-sm text-slate-600">
                                                <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="font-medium">Submitted:</span>
                                                <span className="ml-2">{new Date(req.requestedAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
