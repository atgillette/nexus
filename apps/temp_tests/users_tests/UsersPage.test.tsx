import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import UsersPage from "../page";
import { mockAdminUser, mockSEUser, mockCompanies } from "./test-utils";

// Mock the TRPC API
const mockRefetch = jest.fn();
const mockMutate = jest.fn();

jest.mock("@/utils/trpc", () => ({
  api: {
    users: {
      listAll: {
        useQuery: jest.fn(() => ({
          data: [mockAdminUser, mockSEUser],
          isLoading: false,
          error: null,
          refetch: mockRefetch,
        })),
      },
      create: {
        useMutation: jest.fn(() => ({
          mutate: mockMutate,
          isLoading: false,
        })),
      },
      update: {
        useMutation: jest.fn(() => ({
          mutate: mockMutate,
          isLoading: false,
        })),
      },
      delete: {
        useMutation: jest.fn(() => ({
          mutate: mockMutate,
          isLoading: false,
        })),
      },
    },
    companies: {
      list: {
        useQuery: jest.fn(() => ({
          data: mockCompanies,
          isLoading: false,
          error: null,
        })),
      },
    },
  },
}));

// Mock the components (we've already tested them individually)
jest.mock("../components", () => ({
  UserTable: jest.fn(({ users, activeTab, onEditUser, onDeleteUser }) => (
    <div data-testid="user-table">
      {users?.length === 0 ? (
        <div>No {activeTab} users found.</div>
      ) : (
        users?.map((user) => {
          const typedUser = user as { id: string; firstName: string; lastName: string };
          return (
          <div key={typedUser.id}>
            <span>{typedUser.firstName} {typedUser.lastName}</span>
            <button onClick={() => onEditUser(user)}>Edit</button>
            <button onClick={() => onDeleteUser(user)}>Delete</button>
          </div>
        );})
      )}
    </div>
  )),
  UserForm: jest.fn(({ isOpen, onOpenChange, editingUser, onSubmit }) => 
    isOpen ? (
      <div data-testid="user-form">
        <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
        <button onClick={() => onOpenChange(false)}>Cancel</button>
        <button onClick={() => onSubmit({ 
          firstName: "Test", 
          lastName: "User", 
          email: "test@example.com",
          role: "admin" as const 
        })}>
          Submit
        </button>
      </div>
    ) : null
  ),
  DeleteUserDialog: jest.fn(({ isOpen, onOpenChange, userToDelete, onConfirmDelete }) =>
    isOpen ? (
      <div data-testid="delete-dialog">
        <div>Delete {userToDelete?.firstName} {userToDelete?.lastName}?</div>
        <button onClick={() => onOpenChange(false)}>Cancel</button>
        <button onClick={onConfirmDelete}>Confirm Delete</button>
      </div>
    ) : null
  ),
  UserTabs: jest.fn(({ activeTab, onTabChange }) => (
    <div data-testid="user-tabs">
      <button 
        className={activeTab === "admin" ? "active" : ""}
        onClick={() => onTabChange("admin")}
      >
        Admin Users
      </button>
      <button 
        className={activeTab === "se" ? "active" : ""}
        onClick={() => onTabChange("se")}
      >
        SE Users
      </button>
    </div>
  )),
}));

describe("UsersPage Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Page Rendering", () => {
    it("renders the main page structure", () => {
      render(<UsersPage />);

      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("Manage system users and permissions")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add User" })).toBeInTheDocument();
      expect(screen.getByTestId("user-tabs")).toBeInTheDocument();
      expect(screen.getByTestId("user-table")).toBeInTheDocument();
    });

    it("displays loading state when fetching data", () => {
      const { api } = jest.requireMock("@/utils/trpc");
      api.users.listAll.useQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      render(<UsersPage />);
      expect(screen.getByText("Loading users...")).toBeInTheDocument();
    });

    it("displays error message when API fails", () => {
      const { api } = jest.requireMock("@/utils/trpc");
      api.users.listAll.useQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: new Error("Failed to fetch users"),
        refetch: mockRefetch,
      });

      render(<UsersPage />);
      expect(screen.getByText(/Failed to load users/)).toBeInTheDocument();
    });
  });

  describe("Tab Switching", () => {
    it("filters users by role when switching tabs", () => {
      render(<UsersPage />);

      // Initially shows admin tab
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();

      // Switch to SE tab
      const seTab = screen.getByText("SE Users");
      fireEvent.click(seTab);

      // Should now show SE users
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("maintains tab state when performing actions", async () => {
      render(<UsersPage />);

      // Switch to SE tab
      const seTab = screen.getByText("SE Users");
      fireEvent.click(seTab);

      // Open add user form
      const addButton = screen.getByRole("button", { name: "Add User" });
      fireEvent.click(addButton);

      // Form should open
      expect(screen.getByTestId("user-form")).toBeInTheDocument();

      // Cancel form
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      // Should still be on SE tab
      const activeTab = screen.getByText("SE Users").closest("button");
      expect(activeTab).toHaveClass("active");
    });
  });

  describe("User Creation", () => {
    it("opens form when Add User button is clicked", () => {
      render(<UsersPage />);

      const addButton = screen.getByRole("button", { name: "Add User" });
      fireEvent.click(addButton);

      expect(screen.getByTestId("user-form")).toBeInTheDocument();
      expect(screen.getByText("Add New User")).toBeInTheDocument();
    });

    it("calls create mutation when form is submitted", async () => {
      render(<UsersPage />);

      // Open form
      const addButton = screen.getByRole("button", { name: "Add User" });
      fireEvent.click(addButton);

      // Submit form
      const submitButton = screen.getByText("Submit");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
            role: "admin",
          }),
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          })
        );
      });
    });
  });

  describe("User Editing", () => {
    it("opens form with user data when edit is clicked", () => {
      render(<UsersPage />);

      const editButton = screen.getAllByText("Edit")[0];
      fireEvent.click(editButton);

      expect(screen.getByTestId("user-form")).toBeInTheDocument();
      expect(screen.getByText("Edit User")).toBeInTheDocument();
    });

    it("calls update mutation when edit form is submitted", async () => {
      render(<UsersPage />);

      // Click edit on first user
      const editButton = screen.getAllByText("Edit")[0];
      fireEvent.click(editButton);

      // Submit form
      const submitButton = screen.getByText("Submit");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockAdminUser.id,
          }),
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          })
        );
      });
    });
  });

  describe("User Deletion", () => {
    it("opens confirmation dialog when delete is clicked", () => {
      render(<UsersPage />);

      const deleteButton = screen.getAllByText("Delete")[0];
      fireEvent.click(deleteButton);

      expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
      expect(screen.getByText(/Delete John Doe/)).toBeInTheDocument();
    });

    it("calls delete mutation when deletion is confirmed", async () => {
      render(<UsersPage />);

      // Click delete on first user
      const deleteButton = screen.getAllByText("Delete")[0];
      fireEvent.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByText("Confirm Delete");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          { id: mockAdminUser.id },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          })
        );
      });
    });

    it("closes dialog when cancel is clicked", () => {
      render(<UsersPage />);

      // Open delete dialog
      const deleteButton = screen.getAllByText("Delete")[0];
      fireEvent.click(deleteButton);

      expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();

      // Cancel deletion
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId("delete-dialog")).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("refetches data on retry", () => {
      const { api } = jest.requireMock("@/utils/trpc");
      api.users.listAll.useQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: new Error("Failed to fetch users"),
        refetch: mockRefetch,
      });

      render(<UsersPage />);

      const retryButton = screen.getByRole("button", { name: "Retry" });
      fireEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe("Search and Filtering", () => {
    it("filters users based on search input", async () => {
      const user = userEvent.setup();
      render(<UsersPage />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      await user.type(searchInput, "John");

      // John should be visible
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      
      // Jane should not be visible (different tab)
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });

    it("shows no results message when search has no matches", async () => {
      const user = userEvent.setup();
      render(<UsersPage />);

      const searchInput = screen.getByPlaceholderText("Search users...");
      await user.type(searchInput, "NonexistentUser");

      expect(screen.getByText("No admin users found.")).toBeInTheDocument();
    });
  });
});