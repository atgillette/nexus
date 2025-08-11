import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserTabs } from "../components/UserTabs";

describe("UserTabs", () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders both tab buttons", () => {
    render(
      <UserTabs activeTab="admin" onTabChange={mockOnTabChange} />
    );

    expect(screen.getByText("Admin Users")).toBeInTheDocument();
    expect(screen.getByText("SE Users")).toBeInTheDocument();
  });

  it("applies active styles to admin tab when selected", () => {
    render(
      <UserTabs activeTab="admin" onTabChange={mockOnTabChange} />
    );

    const adminButton = screen.getByText("Admin Users");
    const seButton = screen.getByText("SE Users");

    expect(adminButton).toHaveClass("bg-primary", "text-primary-foreground");
    expect(seButton).toHaveClass("bg-background", "text-foreground", "border");
  });

  it("applies active styles to SE tab when selected", () => {
    render(
      <UserTabs activeTab="se" onTabChange={mockOnTabChange} />
    );

    const adminButton = screen.getByText("Admin Users");
    const seButton = screen.getByText("SE Users");

    expect(seButton).toHaveClass("bg-primary", "text-primary-foreground");
    expect(adminButton).toHaveClass("bg-background", "text-foreground", "border");
  });

  it("calls onTabChange with 'admin' when Admin Users is clicked", () => {
    render(
      <UserTabs activeTab="se" onTabChange={mockOnTabChange} />
    );

    const adminButton = screen.getByText("Admin Users");
    fireEvent.click(adminButton);

    expect(mockOnTabChange).toHaveBeenCalledWith("admin");
    expect(mockOnTabChange).toHaveBeenCalledTimes(1);
  });

  it("calls onTabChange with 'se' when SE Users is clicked", () => {
    render(
      <UserTabs activeTab="admin" onTabChange={mockOnTabChange} />
    );

    const seButton = screen.getByText("SE Users");
    fireEvent.click(seButton);

    expect(mockOnTabChange).toHaveBeenCalledWith("se");
    expect(mockOnTabChange).toHaveBeenCalledTimes(1);
  });

  it("applies hover styles to inactive tabs", () => {
    render(
      <UserTabs activeTab="admin" onTabChange={mockOnTabChange} />
    );

    const seButton = screen.getByText("SE Users");
    expect(seButton).toHaveClass("hover:bg-accent", "hover:text-accent-foreground");
  });

  it("has correct spacing between tabs", () => {
    const { container } = render(
      <UserTabs activeTab="admin" onTabChange={mockOnTabChange} />
    );

    const tabContainer = container.querySelector(".flex");
    expect(tabContainer).toHaveClass("space-x-2");
  });
});