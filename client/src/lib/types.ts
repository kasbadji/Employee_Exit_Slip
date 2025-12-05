export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
}

export interface ManagerDashboardStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
}

export interface ExitRequest {
  id_request: number;
  reason: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  employee?: {
    id_user: number;
    full_name: string;
    email: string;
  };
}
