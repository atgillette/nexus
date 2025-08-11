import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DeleteUserDialog } from "../components/DeleteUserDialog";
import { mockAdminUser } from "./test-utils";

describe("DeleteUserDialog", () => {
  const mockOnOpenChange = jest.fn();
  const mockOnConfirmDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog when open", () => {
    render(
      <DeleteUserDialog
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        userToDelete={mockAdminUser}
        onConfirmDelete={mockOnConfirmDelete}
        isDeleting={false}
      />
    );

    expect(screen.getByText("Delete User")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete user/)).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    const { container } = render(
      <DeleteUserDialog
        isOpen={false}
        onOpenChange={mockOnOpenChange}
        userToDelete={mockAdminUser}
        onConfirmDelete={mockOnConfirmDelete}
        isDeleting={false}
      />
    );

    // Dialog should not be visible
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeInTheDocument();
  });

  it("displays warning message with user name", () => {
    render(
      <DeleteUserDialog
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        userToDelete={mockAdminUser}
        onConfirmDelete={mockOnConfirmDelete}
        isDeleting={false}
      />
    );

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
  });

  it("handles null userToDelete gracefully", () => {
    render(
      <DeleteUserDialog
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        userToDelete={null}
        onConfirmDelete={mockOnConfirmDelete}
        isDeleting={false}
      />
    );

    expect(screen.getByText(/Are you sure you want to delete user/)).toBeInTheDocument();
    // Should not crash when user is null
  });

  it("calls onConfirmDelete when Delete button is clicked", () => {
    render(
      <DeleteUserDialog
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        userToDelete={mockAdminUser}
        onConfirmDelete={mockOnConfirmDelete}
        isDeleting={false}
      />
    );

    const deleteButton = screen.getByRole("button", { name: "Delete User" });
    fireEvent.click(deleteButton);

    expect(mockOnConfirmDelete).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange when Cancel button is clicked", () => {
    render(
      <DeleteUserDialog
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        userToDelete={mockAdminUser}
        onConfirmDelete={mockOnConfirmDelete}
        isDeleting={false}
      />
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnOpenChange).toHaveBeenCalledTimes(1);
  });

  it("shows loading state when deleting", () => {
    render(
      <DeleteUserDialog
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        userToDelete={mockAdminUser}
        onConfirmDelete={mockOnConfirmDelete}
        isDeleting={true}
      />
    );

    expect(screen.getByText("Deleting...")).toBeInTheDocument();
    
    // Buttons should be disabled
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    const deleteButton = screen.getByRole("button", { name: "Deleting..." });
    
    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it("applies destructive variant to delete button", () => {
    render(
      <DeleteUserDialog
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        userToDelete={mockAdminUser}
        onConfirmDelete={mockOnConfirmDelete}
        isDeleting={false}
      />
    );

    const deleteButton = screen.getByRole("button", { name: "Delete User" });
    expect(deleteButton).toHaveAttribute("variant", "destructive");
  });
});