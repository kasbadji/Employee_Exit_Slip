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

//! ----- Helper function For Manager Dashboard ------
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

export async function decideExitRequest(
  id: number,
  status: 'APPROVED' | 'REJECTED'
): Promise<ExitRequest>
{
  const res = await api.post(`/exit-requests/manager/${id}/decide`, { status});

  return res.data;
}

//! ----- Helper function For Employee Dashboard ------
export async function createExitRequest(reason: string): Promise<ExitRequest>
{
  const res = await api.post('/exit-requests', { raison: reason });

  return res.data;
}

export async function fetchMyExitRequests(): Promise<ExitRequest[]>
{
  const res = await api.get('/exit-requests/my');

  return res.data;
}

