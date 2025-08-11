export type UserRole = 'admin' | 'se';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'se' | 'client';
  phone?: string | null;
  costRate?: number | null;
  billRate?: number | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  assignedClients: string[];
  companyAssignments: {
    companyId: string;
    companyName: string;
  }[];
}

export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'se';
  phone: string;
  costRate: string;
  billRate: string;
  companyAssignments: string[];
}

export interface Company {
  id: string;
  name: string;
}