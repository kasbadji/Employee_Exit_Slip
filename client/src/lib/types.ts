export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
}

export interface ManagerDashboardStats {
  totalRequests: number;
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
    department?: string;
  };
  exitDate?: string;
  exitTime?: string;
}

export interface StatusHistoryEntry {
  id_history: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment: string | null;
  createdAt: string;
  changedBy: {
    id_user: number;
    full_name: string;
    role: Role;
    email: string;
  };
}

export interface ExitRequestWithHistory extends ExitRequest {
  history: StatusHistoryEntry[];
}
