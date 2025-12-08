"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import "./login.css";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const user = await login(email, password);

            // Redirect based on user role
            if (user.role === "EMPLOYEE") {
                router.push("/employee/requests");
            } else if (user.role === "MANAGER" || user.role === "ADMIN") {
                router.push("/manager/dashboard");
            }
        }
        catch (error: any) {
            setError(error.message || "An unexpected error occurred");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-card-wrapper">
                <div className="login-card">
                    {/* Header */}
                    <div className="login-header">
                        <div className="login-icon-wrapper">
                            <svg className="login-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="login-title">Welcome Back</h2>
                        <p className="login-subtitle">Sign in to continue to your account</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="login-error-alert">
                            <div className="login-error-content">
                                <svg className="login-error-icon" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="login-error-text">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-form-group">
                            <label htmlFor="email" className="login-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="login-input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="login-form-group">
                            <label htmlFor="password" className="login-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="login-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-button"
                        >
                            {loading ? (
                                <span className="login-button-content">
                                    <svg className="login-spinner" fill="none" viewBox="0 0 24 24">
                                        <circle className="login-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="login-spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="login-footer">
                        <p className="login-footer-text">
                            Don't have an account?{" "}
                            <Link href="/register" className="login-link">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
