import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import NewClientPage from "../new/page";
import { api } from "@nexus/trpc/react";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock TRPC
jest.mock("@nexus/trpc/react", () => ({
  api: {
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
      create: {
        useMutation: jest.fn(),
      },
    },
  },
}));

// Type definitions for UI components
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode };
type DivProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & { children?: React.ReactNode };
type SpanProps = React.HTMLAttributes<HTMLSpanElement>;
type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

// Mock UI components that might cause issues in tests
jest.mock("@nexus/ui", () => {
  const actual = jest.requireActual("@nexus/ui");
  return {
    AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Button: actual.Button || (({ children, ...props }: ButtonProps) => <button {...props}>{children}</button>),
    Card: actual.Card || (({ children }: DivProps) => <div>{children}</div>),
    CardContent: actual.CardContent || (({ children }: DivProps) => <div>{children}</div>),
    Input: actual.Input || ((props: InputProps) => <input {...props} />),
    Label: actual.Label || (({ children, ...props }: LabelProps) => <label {...props}>{children}</label>),
    Select: actual.Select || (({ children }: DivProps) => <div>{children}</div>),
    SelectContent: actual.SelectContent || (({ children }: DivProps) => <div>{children}</div>),
    SelectItem: actual.SelectItem || (({ children, ...props }: DivProps) => <div {...props}>{children}</div>),
    SelectTrigger: actual.SelectTrigger || (({ children }: DivProps) => <div>{children}</div>),
    SelectValue: actual.SelectValue || ((props: SpanProps) => <span {...props} />),
    Checkbox: actual.Checkbox || ((props: CheckboxProps) => <input type="checkbox" {...props} />),
  };
});

describe("NewClientPage", () => {
  const mockPush = jest.fn();
  const mockMutate = jest.fn();
  const mockProfileData = {
    firstName: "John",
    lastName: "Doe",
    avatarUrl: "https://example.com/avatar.jpg",
  };
  const mockSEUsers = [
    { id: "se1", firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
    { id: "se2", firstName: "Bob", lastName: "Johnson", email: "bob@example.com" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (api.profile.getProfile.useQuery as jest.Mock).mockReturnValue({
      data: mockProfileData,
    });
    (api.users.getUsers.useQuery as jest.Mock).mockReturnValue({
      data: mockSEUsers,
    });
    (api.companies.create.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  describe("Form Rendering", () => {
    it("should render all form sections", () => {
      render(<NewClientPage />);
      
      expect(screen.getByText("Add New Client")).toBeInTheDocument();
      expect(screen.getByLabelText(/Company Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Company URL/)).toBeInTheDocument();
      expect(screen.getByText("Manage Departments")).toBeInTheDocument();
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("Assign Solutions Engineers")).toBeInTheDocument();
    });

    it("should render back button", () => {
      render(<NewClientPage />);
      
      const backButton = screen.getByText("Back to Clients");
      expect(backButton).toBeInTheDocument();
      
      fireEvent.click(backButton);
      expect(mockPush).toHaveBeenCalledWith("/clients");
    });

    it("should render form action buttons", () => {
      render(<NewClientPage />);
      
      expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Create Client/i })).toBeInTheDocument();
    });
  });

  describe("Company Information", () => {
    it("should validate required company name", async () => {
      render(<NewClientPage />);
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Company name is required")).toBeInTheDocument();
      });
    });

    it("should validate URL format", async () => {
      const user = userEvent.setup();
      render(<NewClientPage />);
      
      const urlInput = screen.getByLabelText(/Company URL/);
      await user.clear(urlInput);
      await user.type(urlInput, "invalid-url");
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();
      });
    });

    it("should accept valid company information", async () => {
      const user = userEvent.setup();
      render(<NewClientPage />);
      
      const nameInput = screen.getByLabelText(/Company Name/);
      const urlInput = screen.getByLabelText(/Company URL/);
      
      await user.type(nameInput, "Test Company");
      await user.clear(urlInput);
      await user.type(urlInput, "https://testcompany.com");
      
      expect(nameInput).toHaveValue("Test Company");
      expect(urlInput).toHaveValue("https://testcompany.com");
    });
  });

  describe("Department Management", () => {
    it("should add a new department", async () => {
      render(<NewClientPage />);
      
      const addButton = screen.getByRole("button", { name: /Add Department/i });
      fireEvent.click(addButton);
      
      await waitFor(() => {
        const departmentInputs = screen.getAllByPlaceholderText("Department name");
        expect(departmentInputs).toHaveLength(1);
      });
    });

    it("should remove a department", async () => {
      render(<NewClientPage />);
      
      // Add a department first
      const addButton = screen.getByRole("button", { name: /Add Department/i });
      fireEvent.click(addButton);
      
      await waitFor(() => {
        const departmentInputs = screen.getAllByPlaceholderText("Department name");
        expect(departmentInputs).toHaveLength(1);
      });
      
      // Remove the department
      const removeButtons = screen.getAllByRole("button").filter(btn => 
        btn.querySelector('svg.lucide-trash2')
      );
      fireEvent.click(removeButtons[0]);
      
      await waitFor(() => {
        const departmentInputs = screen.queryAllByPlaceholderText("Department name");
        expect(departmentInputs).toHaveLength(0);
      });
    });

    it("should validate duplicate department names", async () => {
      const user = userEvent.setup();
      render(<NewClientPage />);
      
      // Add two departments
      const addButton = screen.getByRole("button", { name: /Add Department/i });
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      
      await waitFor(() => {
        const departmentInputs = screen.getAllByPlaceholderText("Department name");
        expect(departmentInputs).toHaveLength(2);
      });
      
      // Enter same name in both
      const departmentInputs = screen.getAllByPlaceholderText("Department name");
      await user.type(departmentInputs[0], "Engineering");
      await user.type(departmentInputs[1], "Engineering");
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Department names must be unique")).toBeInTheDocument();
      });
    });
  });

  describe("User Management", () => {
    it("should add a new user", async () => {
      render(<NewClientPage />);
      
      const addButton = screen.getByRole("button", { name: /Add User/i });
      fireEvent.click(addButton);
      
      await waitFor(() => {
        const nameInputs = screen.getAllByPlaceholderText("First Last");
        expect(nameInputs).toHaveLength(1);
      });
    });

    it("should validate user name format", async () => {
      const user = userEvent.setup();
      render(<NewClientPage />);
      
      // Add a user
      const addButton = screen.getByRole("button", { name: /Add User/i });
      fireEvent.click(addButton);
      
      // Enter only first name
      const nameInput = screen.getByPlaceholderText("First Last");
      await user.type(nameInput, "John");
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Please enter both first and last name")).toBeInTheDocument();
      });
    });

    it("should validate email format", async () => {
      const user = userEvent.setup();
      render(<NewClientPage />);
      
      // Add a user
      const addButton = screen.getByRole("button", { name: /Add User/i });
      fireEvent.click(addButton);
      
      // Enter invalid email
      const emailInput = screen.getByPlaceholderText("email@example.com");
      await user.type(emailInput, "invalid-email");
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      });
    });

    it("should validate phone number", async () => {
      const user = userEvent.setup();
      render(<NewClientPage />);
      
      // Add a user
      const addButton = screen.getByRole("button", { name: /Add User/i });
      fireEvent.click(addButton);
      
      // Enter invalid phone
      const phoneInput = screen.getByPlaceholderText("(555) 555-5555");
      await user.type(phoneInput, "123");
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Phone number must have at least 10 digits")).toBeInTheDocument();
      });
    });

    it("should validate duplicate emails", async () => {
      const user = userEvent.setup();
      render(<NewClientPage />);
      
      // Add two users
      const addButton = screen.getByRole("button", { name: /Add User/i });
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      
      // Enter same email in both
      const emailInputs = screen.getAllByPlaceholderText("email@example.com");
      await user.type(emailInputs[0], "test@example.com");
      await user.type(emailInputs[1], "test@example.com");
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("User email addresses must be unique")).toBeInTheDocument();
      });
    });

    it("should handle user permissions checkboxes", async () => {
      render(<NewClientPage />);
      
      // Add a user
      const addButton = screen.getByRole("button", { name: /Add User/i });
      fireEvent.click(addButton);
      
      // Check permissions
      const billingCheckbox = screen.getByLabelText(/Billing Access/i);
      const adminCheckbox = screen.getByLabelText(/Admin Access/i);
      
      fireEvent.click(billingCheckbox);
      fireEvent.click(adminCheckbox);
      
      expect(billingCheckbox).toBeChecked();
      expect(adminCheckbox).toBeChecked();
    });
  });

  describe("Solutions Engineers", () => {
    it("should add a new SE assignment", async () => {
      render(<NewClientPage />);
      
      const addButton = screen.getByRole("button", { name: /Add Solutions Engineer/i });
      fireEvent.click(addButton);
      
      await waitFor(() => {
        const seSelects = screen.getAllByText("Select SE");
        expect(seSelects).toHaveLength(1);
      });
    });

    it("should auto-populate SE email when selected", async () => {
      render(<NewClientPage />);
      
      // Add an SE
      const addButton = screen.getByRole("button", { name: /Add Solutions Engineer/i });
      fireEvent.click(addButton);
      
      // Select an SE
      const selectTrigger = screen.getByText("Select SE");
      fireEvent.click(selectTrigger);
      
      await waitFor(() => {
        const option = screen.getByText("Jane Smith");
        fireEvent.click(option);
      });
      
      // Check if email is displayed
      await waitFor(() => {
        expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      });
    });

    it("should validate duplicate SE assignments", async () => {
      render(<NewClientPage />);
      
      // Add two SE assignments
      const addButton = screen.getByRole("button", { name: /Add Solutions Engineer/i });
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      
      // Select same SE in both
      const selectTriggers = screen.getAllByText("Select SE");
      
      fireEvent.click(selectTriggers[0]);
      await waitFor(() => {
        const option = screen.getByText("Jane Smith");
        fireEvent.click(option);
      });
      
      fireEvent.click(selectTriggers[1]);
      await waitFor(() => {
        const options = screen.getAllByText("Jane Smith");
        fireEvent.click(options[options.length - 1]);
      });
      
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText("Each Solutions Engineer can only be assigned once")).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit valid form data", async () => {
      const user = userEvent.setup();
      render(<NewClientPage />);
      
      // Fill in company info
      const nameInput = screen.getByLabelText(/Company Name/);
      const urlInput = screen.getByLabelText(/Company URL/);
      
      await user.type(nameInput, "Test Company");
      await user.clear(urlInput);
      await user.type(urlInput, "https://testcompany.com");
      
      // Submit form
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          name: "Test Company",
          domain: "testcompany.com",
          industry: undefined,
          departments: undefined,
          users: undefined,
          solutionsEngineers: undefined,
        });
      });
    });

    it("should handle submission success", async () => {
      const user = userEvent.setup();
      
      // Mock successful mutation
      (api.companies.create.useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn((data, { onSuccess }) => {
          onSuccess?.();
        }),
        isPending: false,
      });
      
      render(<NewClientPage />);
      
      // Fill in required fields
      const nameInput = screen.getByLabelText(/Company Name/);
      const urlInput = screen.getByLabelText(/Company URL/);
      
      await user.type(nameInput, "Test Company");
      await user.clear(urlInput);
      await user.type(urlInput, "https://testcompany.com");
      
      // Submit form
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/clients");
      });
    });

    it("should handle submission error", async () => {
      const user = userEvent.setup();
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      
      // Mock failed mutation
      (api.companies.create.useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn((data, { onError }) => {
          onError?.({ message: "Failed to create client" });
        }),
        isPending: false,
      });
      
      render(<NewClientPage />);
      
      // Fill in required fields
      const nameInput = screen.getByLabelText(/Company Name/);
      const urlInput = screen.getByLabelText(/Company URL/);
      
      await user.type(nameInput, "Test Company");
      await user.clear(urlInput);
      await user.type(urlInput, "https://testcompany.com");
      
      // Submit form
      const submitButton = screen.getByRole("button", { name: /Create Client/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Error creating client: Failed to create client");
      });
      
      alertSpy.mockRestore();
    });

    it("should show loading state during submission", async () => {
      // Mock pending mutation
      (api.companies.create.useMutation as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });
      
      render(<NewClientPage />);
      
      const submitButton = screen.getByRole("button", { name: /Creating.../i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Navigation", () => {
    it("should navigate to clients page on cancel", () => {
      render(<NewClientPage />);
      
      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);
      
      expect(mockPush).toHaveBeenCalledWith("/clients");
    });
  });
});