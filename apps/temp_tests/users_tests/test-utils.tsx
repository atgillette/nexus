import { render } from "@testing-library/react";
import type { User, Company } from "../types";

// Mock data
export const mockAdminUser: User = {
  id: "1",
  email: "admin@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "admin",
  phone: "+1 234 567 8900",
  costRate: 75,
  billRate: 150,
  avatarUrl: "https://example.com/avatar.jpg",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  assignedClients: ["Acme Corp", "Tech Co"],
  companyAssignments: [
    { companyId: "comp1", companyName: "Acme Corp" },
    { companyId: "comp2", companyName: "Tech Co" },
  ],
};

export const mockSEUser: User = {
  id: "2",
  email: "se@example.com",
  firstName: "Jane",
  lastName: "Smith",
  role: "se",
  phone: null,
  costRate: null,
  billRate: null,
  avatarUrl: null,
  isActive: true,
  createdAt: new Date("2024-01-02"),
  assignedClients: [],
  companyAssignments: [],
};

export const mockCompanies: Company[] = [
  { id: "comp1", name: "Acme Corp" },
  { id: "comp2", name: "Tech Co" },
  { id: "comp3", name: "StartupXYZ" },
];

// Custom render function with providers if needed
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui);
}

// Mock TRPC API
export const mockApi = {
  users: {
    getUsers: {
      useQuery: jest.fn(() => ({
        data: [mockAdminUser, mockSEUser],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })),
    },
    getCompanies: {
      useQuery: jest.fn(() => ({
        data: mockCompanies,
        isLoading: false,
        error: null,
      })),
    },
    createUser: {
      useMutation: jest.fn(() => ({
        mutate: jest.fn(),
        isPending: false,
      })),
    },
    updateUser: {
      useMutation: jest.fn(() => ({
        mutate: jest.fn(),
        isPending: false,
      })),
    },
    deleteUser: {
      useMutation: jest.fn(() => ({
        mutate: jest.fn(),
        isPending: false,
      })),
    },
  },
  profile: {
    getProfile: {
      useQuery: jest.fn(() => ({
        data: mockAdminUser,
        isLoading: false,
        error: null,
      })),
    },
  },
};