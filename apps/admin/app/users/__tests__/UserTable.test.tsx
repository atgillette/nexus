import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserTable } from "../components/UserTable";
import { mockAdminUser, mockSEUser } from "./test-utils";

describe("UserTable", () => {
  const mockOnEditUser = jest.fn();
  const mockOnDeleteUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders table headers correctly", () => {
    render(
      <UserTable
        users={[]}
        activeTab="admin"
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Cost Rate")).toBeInTheDocument();
    expect(screen.getByText("Bill Rate")).toBeInTheDocument();
    expect(screen.getByText("Assigned Clients")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("renders users when data is provided", () => {
    const users = [mockAdminUser, mockSEUser];
    
    render(
      <UserTable
        users={users}
        activeTab="admin"
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />
    );

    // Check both users are rendered
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("se@example.com")).toBeInTheDocument();
  });

  it("displays empty state when no users are found", () => {
    render(
      <UserTable
        users={[]}
        activeTab="admin"
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />
    );

    expect(screen.getByText("No admin users found.")).toBeInTheDocument();
  });

  it("displays correct empty state message for SE tab", () => {
    render(
      <UserTable
        users={[]}
        activeTab="se"
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />
    );

    expect(screen.getByText("No se users found.")).toBeInTheDocument();
  });

  it("handles undefined users array gracefully", () => {
    render(
      <UserTable
        users={undefined}
        activeTab="admin"
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />
    );

    expect(screen.getByText("No admin users found.")).toBeInTheDocument();
  });

  it("formats currency values correctly", () => {
    render(
      <UserTable
        users={[mockAdminUser]}
        activeTab="admin"
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />
    );

    expect(screen.getByText("$75/hr")).toBeInTheDocument();
    expect(screen.getByText("$150/hr")).toBeInTheDocument();
  });

  it("displays N/A for null values", () => {
    render(
      <UserTable
        users={[mockSEUser]}
        activeTab="se"
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />
    );

    const naElements = screen.getAllByText("N/A");
    expect(naElements.length).toBeGreaterThan(0);
  });

  it("applies correct styling classes", () => {
    const { container } = render(
      <UserTable
        users={[mockAdminUser]}
        activeTab="admin"
        onEditUser={mockOnEditUser}
        onDeleteUser={mockOnDeleteUser}
      />
    );

    const tableContainer = container.querySelector(".bg-card");
    expect(tableContainer).toHaveClass("rounded-lg", "border", "border-border");
    
    const table = container.querySelector("table");
    expect(table).toHaveClass("w-full");
  });
});