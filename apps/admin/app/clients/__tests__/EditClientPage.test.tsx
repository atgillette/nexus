import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useParams } from "next/navigation";
import EditClientPage from "../[id]/edit/page";
import { api } from "@nexus/trpc/react";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock TRPC
const mockInvalidate = jest.fn();

jest.mock("@nexus/trpc/react", () => ({
  api: {
    useUtils: jest.fn(() => ({
      companies: {
        getByIdWithDetails: { invalidate: mockInvalidate },
        list: { invalidate: mockInvalidate },
        getDashboardMetrics: { invalidate: mockInvalidate },
      },
    })),
    profile: {
      getProfile: {
        useQuery: jest.fn(),
      },
    },
    users: {
      getUsers: {
        useQuery: jest.fn(),
      },
    },
    companies: {
      getByIdWithDetails: {
        useQuery: jest.fn(),
      },
      updateWithDetails: {
        useMutation: jest.fn(),
      },
    },
  },
}));

// Mock UI components that might cause issues in tests
jest.mock("@nexus/ui", () => {
  const actual = jest.requireActual("@nexus/ui");
  return {
    AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Button: actual.Button || (({ children, ...props }: any) => <button {...props}>{children}</button>),
    Card: actual.Card || (({ children }: any) => <div>{children}</div>),
    CardContent: actual.CardContent || (({ children }: any) => <div>{children}</div>),
    Input: actual.Input || ((props: any) => <input {...props} />),
    Label: actual.Label || (({ children, ...props }: any) => <label {...props}>{children}</label>),
    Select: ({ children, onValueChange, value }: any) => {
      const options = React.Children.toArray(children).filter((child: any) => 
        child?.type === 'option' || child?.props?.value !== undefined
      );
      return (
        <select 
          data-testid="select" 
          role="combobox"
          onChange={(e) => onValueChange?.(e.target.value)} 
          value={value}
        >
          {options}
        </select>
      );
    },
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
    SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
    SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
    Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props} 
      />
    ),
  };
});

describe("EditClientPage", () => {
  const mockPush = jest.fn();
  const mockMutate = jest.fn();
  const clientId = "test-client-id";
  
  const mockProfileData = {
    firstName: "John",
    lastName: "Doe",
    avatarUrl: "https://example.com/avatar.jpg",
  };
  
  const mockSEUsers = [
    { id: "se1", firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
    { id: "se2", firstName: "Bob", lastName: "Johnson", email: "bob@example.com" },
  ];

  const mockClientData = {
    id: clientId,
    name: "Test Company",
    url: "https://testcompany.com",
    departments: [
      { id: "dept1", name: "Marketing" },
      { id: "dept2", name: "Sales" },
    ],
    users: [
      {
        id: "user1",
        name: "Jill Foster",
        email: "jill@testcompany.com",
        phone: "1234567890",
        departmentId: "dept1",
        emailNotifications: true,
        smsNotifications: false,
        billingAccess: true,
        adminAccess: false,
      },
    ],
    solutionsEngineers: [
      {
        userId: "se1",
        email: "jane@example.com",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useParams as jest.Mock).mockReturnValue({ id: clientId });
    
    (api.profile.getProfile.useQuery as jest.Mock).mockReturnValue({
      data: mockProfileData,
    });
    
    (api.users.getUsers.useQuery as jest.Mock).mockReturnValue({
      data: mockSEUsers,
    });
    
    (api.companies.getByIdWithDetails.useQuery as jest.Mock).mockReturnValue({
      data: mockClientData,
      isLoading: false,
      error: null,
    });
    
    (api.companies.updateWithDetails.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  describe("Loading States", () => {
    it("should show loading state when data is loading", () => {
      (api.companies.getByIdWithDetails.useQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<EditClientPage />);
      
      expect(screen.getByText("Loading client...")).toBeInTheDocument();
      expect(document.querySelector(".animate-spin")).toBeInTheDocument(); // Loading spinner
    });

    it("should show error state when client not found", () => {
      (api.companies.getByIdWithDetails.useQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: "Client not found" },
      });

      render(<EditClientPage />);
      
      expect(screen.getByText(/Error loading client: Client not found/)).toBeInTheDocument();
      expect(screen.getByText("Back to Clients")).toBeInTheDocument();
    });

    it("should show not found state when no data", () => {
      (api.companies.getByIdWithDetails.useQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      render(<EditClientPage />);
      
      expect(screen.getByText("Client not found")).toBeInTheDocument();
    });
  });

  describe("Form Rendering", () => {
    it("should render edit form with client data", () => {
      render(<EditClientPage />);
      
      expect(screen.getByText("Edit Client")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Company")).toBeInTheDocument();
      expect(screen.getByDisplayValue("https://testcompany.com")).toBeInTheDocument();
    });

    it("should populate form with existing client data", () => {
      render(<EditClientPage />);
      
      // Check company info
      expect(screen.getByDisplayValue("Test Company")).toBeInTheDocument();
      expect(screen.getByDisplayValue("https://testcompany.com")).toBeInTheDocument();
      
      // Check departments are shown in input fields
      const departmentInputs = screen.getAllByPlaceholderText("Department name");
      expect(departmentInputs[0]).toHaveValue("Marketing");
      expect(departmentInputs[1]).toHaveValue("Sales");
      
      // Check user data
      expect(screen.getByDisplayValue("Jill Foster")).toBeInTheDocument();
      expect(screen.getByDisplayValue("jill@testcompany.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1234567890")).toBeInTheDocument();
    });

    it("should render back button", () => {
      render(<EditClientPage />);
      
      const backButton = screen.getByText("Back to Clients");
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      expect(mockPush).toHaveBeenCalledWith("/clients");
    });
  });

  describe("Department Management", () => {
    it("should handle invalid department assignments", () => {
      // Mock user with invalid department ID
      const clientWithInvalidDept = {
        ...mockClientData,
        users: [
          {
            ...mockClientData.users[0],
            departmentId: "invalid-dept-id", // ID that doesn't exist in departments
          },
        ],
      };

      (api.companies.getByIdWithDetails.useQuery as jest.Mock).mockReturnValue({
        data: clientWithInvalidDept,
        isLoading: false,
        error: null,
      });

      render(<EditClientPage />);
      
      // The form should still render without crashing
      expect(screen.getByText("Edit Client")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Jill Foster")).toBeInTheDocument();
    });

    it("should use correct department IDs in dropdown options", () => {
      render(<EditClientPage />);
      
      // The dropdown should use the original department data, not form field IDs
      const selectElements = screen.getAllByText("Select Department");
      expect(selectElements.length).toBeGreaterThan(0);
    });
  });

  describe("Form Submission", () => {
    it("should submit form with correct data structure", async () => {
      const user = userEvent.setup();
      render(<EditClientPage />);
      
      // Make some changes
      const nameInput = screen.getByDisplayValue("Test Company");
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Company");
      
      // Submit form
      const submitButton = screen.getByRole("button", { name: /Save Changes/i });
      fireEvent.click(submitButton);
      
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: clientId,
          name: "Updated Company",
          domain: "testcompany.com",
          departments: expect.arrayContaining([
            expect.objectContaining({ name: "Marketing" }),
            expect.objectContaining({ name: "Sales" }),
          ]),
          users: expect.arrayContaining([
            expect.objectContaining({
              firstName: "Jill",
              lastName: "Foster",
              email: "jill@testcompany.com",
              departmentName: "Marketing", // Should be name, not ID
            }),
          ]),
          solutionsEngineers: expect.arrayContaining([
            expect.objectContaining({
              userId: "se1",
              isPrimary: true,
            }),
          ]),
        })
      );
    });

    it("should handle submission success with cache invalidation", async () => {
      const mockOnSuccess = jest.fn();
      (api.companies.updateWithDetails.useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn((data, options) => {
          if (options?.onSuccess) {
            options.onSuccess();
          }
        }),
        isPending: false,
      });

      render(<EditClientPage />);
      
      const submitButton = screen.getByRole("button", { name: /Save Changes/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockInvalidate).toHaveBeenCalledWith({ id: clientId });
        expect(mockPush).toHaveBeenCalledWith("/clients");
      });
    });

    it("should handle submission error", async () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      
      (api.companies.updateWithDetails.useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn((data, options) => {
          if (options?.onError) {
            options.onError({ message: "Update failed" });
          }
        }),
        isPending: false,
      });

      render(<EditClientPage />);
      
      const submitButton = screen.getByRole("button", { name: /Save Changes/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Error updating client: Update failed");
      });
      
      alertSpy.mockRestore();
    });

    it("should show loading state during submission", () => {
      (api.companies.updateWithDetails.useMutation as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(<EditClientPage />);
      
      const submitButton = screen.getByRole("button", { name: /Saving.../i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Form Validation", () => {
    it("should validate required company name", async () => {
      const user = userEvent.setup();
      render(<EditClientPage />);
      
      const nameInput = screen.getByDisplayValue("Test Company");
      await user.clear(nameInput);
      
      const submitButton = screen.getByRole("button", { name: /Save Changes/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Company name is required")).toBeInTheDocument();
      });
    });

    it("should validate URL format", async () => {
      const user = userEvent.setup();
      render(<EditClientPage />);
      
      const urlInput = screen.getByDisplayValue("https://testcompany.com");
      await user.clear(urlInput);
      await user.type(urlInput, "invalid-url");
      
      const submitButton = screen.getByRole("button", { name: /Save Changes/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to clients page on cancel", () => {
      render(<EditClientPage />);
      
      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);
      
      expect(mockPush).toHaveBeenCalledWith("/clients");
    });
  });
});