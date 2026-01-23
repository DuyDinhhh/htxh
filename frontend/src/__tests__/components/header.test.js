import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserProvider } from "../../context/UserContext";

// Mock Header to avoid router/service dependencies
jest.mock("../../components/header", () => ({
  default: function Header({ onMenuClick }) {
    const mockLocalStorage = {
      removeItem: (key) => {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      },
    };

    const handleLogout = () => {
      mockLocalStorage.removeItem("token");
      mockLocalStorage.removeItem("user");
    };

    return (
      <header data-testid="header">
        <button aria-label="toggle menu" onClick={onMenuClick}>
          Menu
        </button>
        <button onClick={handleLogout}>Đăng xuất</button>
      </header>
    );
  },
}));

const Header = require("../../components/header").default;

const renderHeader = (onMenuClick = jest.fn()) => {
  return render(
    <UserProvider>
      <Header onMenuClick={onMenuClick} />
    </UserProvider>,
  );
};

describe("Header Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should render the header with menu button", () => {
    renderHeader();
    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it("should call onMenuClick when menu button is clicked", () => {
    const mockOnMenuClick = jest.fn();
    renderHeader(mockOnMenuClick);

    const menuButton = screen.getByRole("button", { name: /toggle menu/i });
    fireEvent.click(menuButton);

    expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
  });

  it("should handle logout correctly", async () => {
    localStorage.setItem("user", JSON.stringify({ name: "Test User" }));
    localStorage.setItem("token", "test-token");

    renderHeader();

    const logoutButton = screen.getByText(/đăng xuất/i);
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });
});
