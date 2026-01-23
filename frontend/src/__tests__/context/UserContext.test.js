import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { UserProvider, useUser } from "../../context/UserContext";

// Test component that uses the context
const TestComponent = () => {
  const { user, setUser } = useUser();
  return (
    <div>
      <div data-testid="user-data">
        {user ? JSON.stringify(user) : "No user"}
      </div>
      <button onClick={() => setUser({ id: 1, name: "Test User" })}>
        Set User
      </button>
    </div>
  );
};

describe("UserContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should provide default null user when localStorage is empty", () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    expect(screen.getByTestId("user-data")).toHaveTextContent("No user");
  });

  it("should load user from localStorage on mount", async () => {
    const mockUser = {
      id: 1,
      name: "Stored User",
      email: "stored@example.com",
    };
    localStorage.setItem("user", JSON.stringify(mockUser));

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-data")).toHaveTextContent(
        JSON.stringify(mockUser),
      );
    });
  });

  it("should handle invalid JSON in localStorage gracefully", async () => {
    localStorage.setItem("user", "invalid-json");

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-data")).toHaveTextContent("No user");
    });
  });

  it("should allow updating user context", async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    const button = screen.getByRole("button", { name: /set user/i });

    await act(async () => {
      button.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user-data")).toHaveTextContent("Test User");
    });
  });
});
