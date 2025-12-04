"use client";

import api from '@/lib/api';
import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.post('/auth/register', {
                email: form.email,
                full_name: form.fullName,
                password: form.password,
                role: form.role,
            });
            if (response.status === 201) {
                setMessage({ text: 'Registration successful! You can now log in.', type: 'success' });
                setForm({
                    fullName: '',
                    email: '',
                    password: '',
                    role: 'EMPLOYEE',
                });
            }

            const { token, user } = response.data;
            localStorage.setItem('token', token);

            if(user.role === 'ADMIN') window.location.href = '/admin/dashboard';
            else if(user.role === 'MANAGER') window.location.href = '/manager/dashboard';
            else window.location.href = '/employee/dashboard';
        }
        catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            setMessage({ text: errorMessage, type: 'error' });
            console.error('Registration error:', error.response?.data);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center auth-background px-4 py-12">
            <div className="w-full max-w-md animate-fade-in">
                <div className="auth-card rounded-2xl shadow-lg p-8 md:p-10 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--accent-color)' }}>
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold auth-label">Create Account</h2>
                        <p className="auth-text-secondary text-sm">Join our employee management system</p>
                    </div>

                    {/* Message Alert */}
                    {message && (
                        <div className={`border p-3 rounded-lg ${
                            message.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}>
                            <div className="flex items-center gap-2">
                                {message.type === 'success' ? (
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <p className={`text-sm ${
                                    message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                                }`}>
                                    {message.text}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="fullName" className="block text-sm font-medium auth-label">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                className="auth-input w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none"
                                placeholder="your full name"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-medium auth-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="auth-input w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="password" className="block text-sm font-medium auth-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="auth-input w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="role" className="block text-sm font-medium auth-label">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="auth-input w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none appearance-none cursor-pointer"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                            >
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-button w-full text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 mt-6"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm auth-text-secondary">
                            Already have an account?{" "}
                            <Link href="/login" className="font-semibold auth-link">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
