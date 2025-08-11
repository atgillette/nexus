import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { UserForm } from "../components/UserForm";
import { mockAdminUser, mockCompanies } from "./test-utils";

describe("UserForm", () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Form Rendering", () => {
    it("renders all form fields", () => {
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Role/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Cost Rate/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Bill Rate/)).toBeInTheDocument();
      expect(screen.getByText("Assigned Companies")).toBeInTheDocument();
    });

    it("shows 'Add New User' title when creating", () => {
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByText("Add New User")).toBeInTheDocument();
    });

    it("shows 'Edit User' title when editing", () => {
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={mockAdminUser}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByText("Edit User")).toBeInTheDocument();
    });

    it("displays required field indicators", () => {
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      // Check for asterisks on required fields
      const requiredFields = screen.getAllByText("*");
      expect(requiredFields.length).toBeGreaterThan(0);
    });
  });

  describe("Form Validation", () => {
    it("shows validation error for empty first name", async () => {
      const user = userEvent.setup();
      
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const submitButton = screen.getByRole("button", { name: "Create User" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/First name is required/)).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid email", async () => {
      const user = userEvent.setup();
      
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const emailInput = screen.getByLabelText(/Email/);
      await user.type(emailInput, "invalid-email");

      const submitButton = screen.getByRole("button", { name: "Create User" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid email address/)).toBeInTheDocument();
      });
    });

    it("shows validation error for invalid phone number", async () => {
      const user = userEvent.setup();
      
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const phoneInput = screen.getByLabelText(/Phone/);
      await user.type(phoneInput, "123"); // Too short

      const submitButton = screen.getByRole("button", { name: "Create User" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Phone number must have at least 10 digits/)).toBeInTheDocument();
      });
    });

    it("validates bill rate is not less than cost rate", async () => {
      const user = userEvent.setup();
      
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const costRateInput = screen.getByLabelText(/Cost Rate/);
      const billRateInput = screen.getByLabelText(/Bill Rate/);
      
      await user.type(costRateInput, "100");
      await user.type(billRateInput, "50");

      const submitButton = screen.getByRole("button", { name: "Create User" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Bill rate must be equal to or higher than cost rate/)).toBeInTheDocument();
      });
    });
  });

  describe("Form Population", () => {
    it("populates form fields when editing a user", async () => {
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={mockAdminUser}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("John")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
        expect(screen.getByDisplayValue("admin@example.com")).toBeInTheDocument();
        expect(screen.getByDisplayValue("+1 234 567 8900")).toBeInTheDocument();
        expect(screen.getByDisplayValue("75")).toBeInTheDocument();
        expect(screen.getByDisplayValue("150")).toBeInTheDocument();
      });
    });

    it("resets form when switching from edit to create", async () => {
      const { rerender } = render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={mockAdminUser}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      // Switch to create mode
      rerender(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText(/First Name/) as HTMLInputElement;
        expect(firstNameInput.value).toBe("");
      });
    });
  });

  describe("Company Assignments", () => {
    it("displays all available companies", () => {
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      mockCompanies.forEach(company => {
        expect(screen.getByText(company.name)).toBeInTheDocument();
      });
    });

    it("checks assigned companies when editing", () => {
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={mockAdminUser}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const acmeCheckbox = screen.getByRole("checkbox", { name: /Acme Corp/ });
      const techCheckbox = screen.getByRole("checkbox", { name: /Tech Co/ });
      
      expect(acmeCheckbox).toBeChecked();
      expect(techCheckbox).toBeChecked();
    });

    it("shows message when no companies available", () => {
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={[]}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(screen.getByText("No companies available")).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("calls onSubmit with form data when valid", async () => {
      const user = userEvent.setup();
      
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      // Fill in required fields
      await user.type(screen.getByLabelText(/First Name/), "Test");
      await user.type(screen.getByLabelText(/Last Name/), "User");
      await user.type(screen.getByLabelText(/Email/), "test@example.com");

      const submitButton = screen.getByRole("button", { name: "Create User" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
          })
        );
      });
    });

    it("shows loading state when submitting", () => {
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        />
      );

      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    });
  });

  describe("Modal Controls", () => {
    it("calls onOpenChange when Cancel is clicked", () => {
      render(
        <UserForm
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          editingUser={null}
          companies={mockCompanies}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});