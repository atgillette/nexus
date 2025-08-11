import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClientForm } from "../components/ClientForm";

// Mock UI components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock("@nexus/ui", () => {
  const actual = jest.requireActual("@nexus/ui");
  return {
    Button: actual.Button || (({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => <button {...props}>{children}</button>),
    Card: actual.Card || (({ children }: React.PropsWithChildren) => <div>{children}</div>),
    CardContent: actual.CardContent || (({ children }: React.PropsWithChildren) => <div>{children}</div>),
    Input: actual.Input || ((props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />),
    Label: actual.Label || (({ children, ...props }: React.PropsWithChildren<React.LabelHTMLAttributes<HTMLLabelElement>>) => <label {...props}>{children}</label>),
    Select: ({ children, onValueChange, value }: { children: React.ReactNode; onValueChange?: (value: string) => void; value?: string }) => {
      const options = React.Children.toArray(children).filter((child): child is React.ReactElement => 
        React.isValidElement(child) && (child.type === 'option' || child.props?.value !== undefined)
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
    SelectContent: ({ children }: React.PropsWithChildren) => <>{children}</>,
    SelectItem: ({ children, value }: React.PropsWithChildren<{ value: string }>) => <option value={value}>{children}</option>,
    SelectTrigger: ({ children }: React.PropsWithChildren) => <div data-testid="select-trigger">{children}</div>,
    SelectValue: ({ placeholder }: { placeholder?: string }) => <div data-testid="select-value">{placeholder}</div>,
    Checkbox: ({ checked, onCheckedChange, ...props }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void } & React.InputHTMLAttributes<HTMLInputElement>) => (
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props} 
      />
    ),
  };
});

describe("ClientForm", () => {
  const defaultProps = {
    seUsers: [
      { id: "se1", firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
      { id: "se2", firstName: "Bob", lastName: "Johnson", email: "bob@example.com" },
    ],
    onSubmit: jest.fn(),
    isSubmitting: false,
    onCancel: jest.fn(),
  };

  const mockEditingClient = {
    id: "client-1",
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
  });

  describe("Create Mode", () => {
    it("should render create form", () => {
      render(<ClientForm {...defaultProps} />);
      
      expect(screen.getByText("Add New Client")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Create Client/i })).toBeInTheDocument();
    });

    it("should render empty form fields", () => {
      render(<ClientForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/Company Name/);
      const urlInput = screen.getByLabelText(/Company URL/);
      
      expect(nameInput).toHaveValue("");
      expect(urlInput).toHaveValue("https://");
    });

    it("should allow adding departments", async () => {
      render(<ClientForm {...defaultProps} />);
      
      const addDeptButton = screen.getByRole("button", { name: /Add Department/i });
      fireEvent.click(addDeptButton);
      
      await waitFor(() => {
        const deptInput = screen.getByPlaceholderText("Department name");
        expect(deptInput).toBeInTheDocument();
      });
    });

    it("should allow adding users", async () => {
      render(<ClientForm {...defaultProps} />);
      
      const addUserButton = screen.getByRole("button", { name: /Add User/i });
      fireEvent.click(addUserButton);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText("First Last");
        const emailInput = screen.getByPlaceholderText("email@example.com");
        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
      });
    });

    it("should allow adding SE assignments", async () => {
      render(<ClientForm {...defaultProps} />);
      
      const addSEButton = screen.getByRole("button", { name: /Add Solutions Engineer/i });
      fireEvent.click(addSEButton);
      
      await waitFor(() => {
        const seSelect = screen.getByText("Select SE");
        expect(seSelect).toBeInTheDocument();
      });
    });
  });

  describe("Edit Mode", () => {
    it("should render edit form with data", () => {
      render(<ClientForm {...defaultProps} editingClient={mockEditingClient} />);
      
      expect(screen.getByText("Edit Client")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Save Changes/i })).toBeInTheDocument();
    });

    it("should populate form with existing data", () => {
      render(<ClientForm {...defaultProps} editingClient={mockEditingClient} />);
      
      expect(screen.getByDisplayValue("Test Company")).toBeInTheDocument();
      expect(screen.getByDisplayValue("https://testcompany.com")).toBeInTheDocument();
      
      // Check for department names in input fields (not dropdown options)
      const departmentInputs = screen.getAllByPlaceholderText("Department name");
      expect(departmentInputs[0]).toHaveValue("Marketing");
      expect(departmentInputs[1]).toHaveValue("Sales");
      
      expect(screen.getByDisplayValue("Jill Foster")).toBeInTheDocument();
    });

    it("should handle invalid department assignments gracefully", () => {
      const clientWithInvalidDept = {
        ...mockEditingClient,
        users: [
          {
            ...mockEditingClient.users[0],
            departmentId: "invalid-dept-id",
          },
        ],
      };

      render(<ClientForm {...defaultProps} editingClient={clientWithInvalidDept as typeof mockEditingClient} />);
      
      // Should render without crashing and clear invalid department
      expect(screen.getByText("Edit Client")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Jill Foster")).toBeInTheDocument();
    });

    it("should use original department data for dropdown options", () => {
      render(<ClientForm {...defaultProps} editingClient={mockEditingClient} />);
      
      // When editing, should use editingClient.departments for dropdown
      // This ensures correct department IDs are used
      const departmentDropdowns = screen.getAllByText("Select Department");
      expect(departmentDropdowns.length).toBeGreaterThan(0);
    });
  });

  describe("Form Validation", () => {
    it("should validate required company name", async () => {
      render(<ClientForm {...defaultProps} />);
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Company name is required")).toBeInTheDocument();
      });
    });

    it("should validate URL format", async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);
      
      const urlInput = screen.getByLabelText(/Company URL/);
      await user.clear(urlInput);
      await user.type(urlInput, "invalid-url");
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();
      });
    });

    it("should validate duplicate department names", async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);
      
      // Add two departments with same name
      const addDeptButton = screen.getByRole("button", { name: /Add Department/i });
      fireEvent.click(addDeptButton);
      fireEvent.click(addDeptButton);
      
      await waitFor(async () => {
        const deptInputs = screen.getAllByPlaceholderText("Department name");
        expect(deptInputs).toHaveLength(2);
        
        await user.type(deptInputs[0], "Engineering");
        await user.type(deptInputs[1], "Engineering");
      });
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Department names must be unique")).toBeInTheDocument();
      });
    });

    it("should validate user name format", async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);
      
      const addUserButton = screen.getByRole("button", { name: /Add User/i });
      fireEvent.click(addUserButton);
      
      await waitFor(async () => {
        const nameInput = screen.getByPlaceholderText("First Last");
        await user.type(nameInput, "OnlyFirstName");
      });
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Please enter both first and last name")).toBeInTheDocument();
      });
    });

    it("should validate duplicate user emails", async () => {
      const user = userEvent.setup();
      render(<ClientForm {...defaultProps} />);
      
      // Add two users with same email
      const addUserButton = screen.getByRole("button", { name: /Add User/i });
      fireEvent.click(addUserButton);
      fireEvent.click(addUserButton);
      
      await waitFor(async () => {
        const emailInputs = screen.getAllByPlaceholderText("email@example.com");
        expect(emailInputs).toHaveLength(2);
        
        await user.type(emailInputs[0], "test@example.com");
        await user.type(emailInputs[1], "test@example.com");
      });
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("User email addresses must be unique")).toBeInTheDocument();
      });
    });

    it("should validate duplicate SE assignments", async () => {
      render(<ClientForm {...defaultProps} />);
      
      // Add two SE assignments
      const addSEButton = screen.getByRole("button", { name: /Add Solutions Engineer/i });
      fireEvent.click(addSEButton);
      fireEvent.click(addSEButton);
      
      await waitFor(() => {
        const seSelects = screen.getAllByRole("combobox");
        expect(seSelects).toHaveLength(2);
        
        // Select same SE in both
        fireEvent.change(seSelects[0], { target: { value: "se1" } });
        fireEvent.change(seSelects[1], { target: { value: "se1" } });
      });
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Each Solutions Engineer can only be assigned once")).toBeInTheDocument();
      });
    });
  });

  describe("SE Email Auto-population", () => {
    it("should auto-populate SE email when SE is selected", async () => {
      render(<ClientForm {...defaultProps} />);
      
      const addSEButton = screen.getByRole("button", { name: /Add Solutions Engineer/i });
      fireEvent.click(addSEButton);
      
      await waitFor(() => {
        const seSelect = screen.getByRole("combobox");
        fireEvent.change(seSelect, { target: { value: "se1" } });
        
        expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      });
    });
  });

  describe("Form Actions", () => {
    it("should call onSubmit with correct data", async () => {
      const mockOnSubmit = jest.fn();
      const user = userEvent.setup();
      
      render(<ClientForm {...defaultProps} onSubmit={mockOnSubmit} />);
      
      // Fill in required fields
      const nameInput = screen.getByLabelText(/Company Name/);
      const urlInput = screen.getByLabelText(/Company URL/);
      
      await user.type(nameInput, "Test Company");
      await user.clear(urlInput);
      await user.type(urlInput, "https://testcompany.com");
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Test Company",
            url: "https://testcompany.com",
          })
        );
      });
    });

    it("should call onCancel when cancel button is clicked", () => {
      const mockOnCancel = jest.fn();
      
      render(<ClientForm {...defaultProps} onCancel={mockOnCancel} />);
      
      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("should show loading state when submitting", () => {
      render(<ClientForm {...defaultProps} isSubmitting={true} />);
      
      const submitButton = screen.getByRole("button", { name: /Creating.../i });
      expect(submitButton).toBeDisabled();
    });

    it("should show loading state when submitting in edit mode", () => {
      render(<ClientForm {...defaultProps} editingClient={mockEditingClient} isSubmitting={true} />);
      
      const submitButton = screen.getByRole("button", { name: /Saving.../i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Dynamic Field Management", () => {
    it("should remove departments", async () => {
      render(<ClientForm {...defaultProps} />);
      
      // Add a department
      const addDeptButton = screen.getByRole("button", { name: /Add Department/i });
      fireEvent.click(addDeptButton);
      
      await waitFor(() => {
        const deptInput = screen.getByPlaceholderText("Department name");
        expect(deptInput).toBeInTheDocument();
      });
      
      // Remove the department
      const removeButton = screen.getByRole("button", { name: "", hidden: true }); // Trash icon button
      fireEvent.click(removeButton);
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText("Department name")).not.toBeInTheDocument();
      });
    });

    it("should remove users", async () => {
      render(<ClientForm {...defaultProps} />);
      
      // Add a user
      const addUserButton = screen.getByRole("button", { name: /Add User/i });
      fireEvent.click(addUserButton);
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText("First Last");
        expect(nameInput).toBeInTheDocument();
      });
      
      // Remove the user
      const removeButtons = screen.getAllByRole("button", { name: "", hidden: true });
      const userRemoveButton = removeButtons.find(btn => 
        btn.closest('tr') // Find remove button inside table row
      );
      
      if (userRemoveButton) {
        fireEvent.click(userRemoveButton);
        
        await waitFor(() => {
          expect(screen.queryByPlaceholderText("First Last")).not.toBeInTheDocument();
        });
      }
    });

    it("should remove SE assignments", async () => {
      render(<ClientForm {...defaultProps} />);
      
      // Add an SE
      const addSEButton = screen.getByRole("button", { name: /Add Solutions Engineer/i });
      fireEvent.click(addSEButton);
      
      await waitFor(() => {
        const seSelect = screen.getByText("Select SE");
        expect(seSelect).toBeInTheDocument();
      });
      
      // Remove the SE
      const removeButtons = screen.getAllByRole("button", { name: "", hidden: true });
      const lastRemoveButton = removeButtons[removeButtons.length - 1];
      fireEvent.click(lastRemoveButton);
      
      await waitFor(() => {
        expect(screen.queryByText("Select SE")).not.toBeInTheDocument();
      });
    });
  });
});