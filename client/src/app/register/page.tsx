"use client";

import api from '@/lib/api';
import Link from 'next/link';
import { useState } from 'react';
import "./register.css";

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

            const { token, user } = response.data;

            if (token && user) {
                localStorage.setItem('token', token);
                setMessage({ text: 'Registration successful! Redirecting...', type: 'success' });

                // Reset form
                setForm({
                    fullName: '',
                    email: '',
                    password: '',
                    role: 'EMPLOYEE',
                });

                // Redirect based on role
                setTimeout(() => {
                    if(user.role === 'ADMIN') window.location.href = '/admin/dashboard';
                    else if(user.role === 'MANAGER') window.location.href = '/manager/dashboard';
                    else window.location.href = '/employee';
                }, 500);
            }
        }
        catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            setMessage({ text: errorMessage, type: 'error' });
            console.error('Registration error:', error.response?.data || error.message);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card-wrapper">
                <div className="register-card">
                    {/* Header */}
                    <div className="register-header">
                        <div className="register-icon-wrapper">
                            <svg className="register-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h2 className="register-title">Create Account</h2>
                        <p className="register-subtitle">Join our employee management system</p>
                    </div>

                    {/* Message Alert */}
                    {message && (
                        <div className={`register-message-alert ${
                            message.type === 'success'
                                ? 'register-message-success'
                                : 'register-message-error'
                        }`}>
                            <div className="register-message-content">
                                {message.type === 'success' ? (
                                    <svg className="register-message-icon register-message-icon-success" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="register-message-icon register-message-icon-error" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <p className={`register-message-text ${
                                    message.type === 'success' ? 'register-message-text-success' : 'register-message-text-error'
                                }`}>
                                    {message.text}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="register-form-group">
                            <label htmlFor="fullName" className="register-label">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                className="register-input"
                                placeholder="your full name"
                                required
                            />
                        </div>

                        <div className="register-form-group">
                            <label htmlFor="email" className="register-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="register-input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="register-form-group">
                            <label htmlFor="password" className="register-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="register-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="register-form-group">
                            <label htmlFor="role" className="register-label">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="register-select"
                            >
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="register-button"
                        >
                            {loading ? (
                                <span className="register-button-content">
                                    <svg className="register-spinner" fill="none" viewBox="0 0 24 24">
                                        <circle className="register-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="register-spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="register-footer">
                        <p className="register-footer-text">
                            Already have an account?{" "}
                            <Link href="/login" className="register-link">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
