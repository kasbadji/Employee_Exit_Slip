"use client";

import api from '@/lib/api';
import { useState } from 'react';

export default function RegisterPage() {
//! ------------------Hooks-----------------
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

//! ------------------Handle Change-----------------
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

//! ------------------Handle Submit-----------------
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
                setMessage('Registration successful! You can now log in.');
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
            setMessage(errorMessage);
            console.error('Registration error:', error.response?.data);
        }
        finally {
            setLoading(false);
        }
    };

//! ------------------User Interface-----------------
return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {message && (
            <div className="mb-4 p-3 text-center text-white bg-blue-500 rounded">
                {message}
            </div>
        )}
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block mb-1 font-semibold" htmlFor="fullName">Full Name</label>
                <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block mb-1 font-semibold" htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block mb-1 font-semibold" htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block mb-1 font-semibold" htmlFor="role">Role</label>
                <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                </select>
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    </div>
);
}
