import axios from 'axios';
import type { ManagerDashboardStats, ExitRequest } from './types';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
    //! runs only in the browser on the server (SSR in Next.js)
    if(typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;

//! ----- Helper function ------
export async function fetchManagerDashboard(): Promise<ManagerDashboardStats>
{
  const res = await api.get('/exit-requests/manager/dashboard');

  return res.data;
}

export async function fetchManagerRequests(
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
): Promise<ExitRequest[]>
{
  const res = await api.get('/exit-requests/manager/requests', {
    params: status ? { status } : {},
  });

  return res.data;
}
