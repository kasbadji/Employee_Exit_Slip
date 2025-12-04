export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface User {
  id_user: number;
  email: string;
  name?: string;
  role: Role;
  createdAt?: string;
}
