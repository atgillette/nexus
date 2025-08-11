import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserTableRow } from "../components/UserTableRow";
import { mockAdminUser, mockSEUser } from "./test-utils";

describe("UserTableRow", () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockFormatCurrency = (amount: number | null | undefined) => 
    amount ? `$${amount}/hr` : "N/A";
  const mockFormatPhoneNumber = (phone: string | null | undefined) => 
    phone || "N/A";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders user information correctly", () => {
    render(
      <table>
        <tbody>
          <UserTableRow
            user={mockAdminUser}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            formatCurrency={mockFormatCurrency}
            formatPhoneNumber={mockFormatPhoneNumber}
          />
        </tbody>
      </table>
    );

    // Check name is displayed
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    
    // Check email is displayed
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    
    // Check phone is displayed
    expect(screen.getByText("+1 234 567 8900")).toBeInTheDocument();
    
    // Check rates are formatted correctly
    expect(screen.getByText("$75/hr")).toBeInTheDocument();
    expect(screen.getByText("$150/hr")).toBeInTheDocument();
    
    // Check assigned clients are displayed
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Tech Co")).toBeInTheDocument();
  });

  it("displays initials when avatar is not available", () => {
    render(
      <table>
        <tbody>
          <UserTableRow
            user={mockSEUser}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            formatCurrency={mockFormatCurrency}
            formatPhoneNumber={mockFormatPhoneNumber}
          />
        </tbody>
      </table>
    );

    // Check initials are displayed
    expect(screen.getByText("JS")).toBeInTheDocument();
  });

  it("displays N/A for missing phone and rates", () => {
    render(
      <table>
        <tbody>
          <UserTableRow
            user={mockSEUser}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            formatCurrency={mockFormatCurrency}
            formatPhoneNumber={mockFormatPhoneNumber}
          />
        </tbody>
      </table>
    );

    // Check N/A is displayed for missing values
    const naElements = screen.getAllByText("N/A");
    expect(naElements).toHaveLength(3); // phone, cost rate, bill rate
  });

  it("displays 'None assigned' when no clients are assigned", () => {
    render(
      <table>
        <tbody>
          <UserTableRow
            user={mockSEUser}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            formatCurrency={mockFormatCurrency}
            formatPhoneNumber={mockFormatPhoneNumber}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText("None assigned")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    render(
      <table>
        <tbody>
          <UserTableRow
            user={mockAdminUser}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            formatCurrency={mockFormatCurrency}
            formatPhoneNumber={mockFormatPhoneNumber}
          />
        </tbody>
      </table>
    );

    const editButton = screen.getByTitle("Edit user");
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockAdminUser);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <table>
        <tbody>
          <UserTableRow
            user={mockAdminUser}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            formatCurrency={mockFormatCurrency}
            formatPhoneNumber={mockFormatPhoneNumber}
          />
        </tbody>
      </table>
    );

    const deleteButton = screen.getByTitle("Delete user");
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockAdminUser);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it("applies hover styles on row", () => {
    const { container } = render(
      <table>
        <tbody>
          <UserTableRow
            user={mockAdminUser}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            formatCurrency={mockFormatCurrency}
            formatPhoneNumber={mockFormatPhoneNumber}
          />
        </tbody>
      </table>
    );

    const row = container.querySelector("tr");
    expect(row).toHaveClass("hover:bg-accent/50");
  });
});