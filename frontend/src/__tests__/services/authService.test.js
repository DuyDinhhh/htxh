import { isAuthenticated, getUser, logout } from "../../services/authService";

describe("AuthService", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear mock calls
    jest.clearAllMocks();
  });

  describe("isAuthenticated", () => {
    it("should return true when token exists in localStorage", () => {
      localStorage.setItem("token", "test-token");
      expect(isAuthenticated()).toBe(true);
    });

    it("should return false when token does not exist in localStorage", () => {
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe("getUser", () => {
    it("should return user object when user data exists in localStorage", () => {
      const mockUser = { id: 1, name: "Test User", email: "test@example.com" };
      localStorage.setItem("user", JSON.stringify(mockUser));

      const result = getUser();
      expect(result).toEqual(mockUser);
    });

    it("should return null when user data does not exist in localStorage", () => {
      expect(getUser()).toBeNull();
    });

    it("should return null when user data is invalid JSON", () => {
      localStorage.setItem("user", "invalid-json");
      expect(getUser()).toBeNull();
    });
  });

  describe("logout", () => {
    it("should remove token and user from localStorage", () => {
      // Mock window.location.href
      delete window.location;
      window.location = { href: "" };

      localStorage.setItem("token", "test-token");
      localStorage.setItem("user", JSON.stringify({ id: 1 }));

      logout();

      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });

    it("should redirect to login page", () => {
      // Mock window.location.href
      delete window.location;
      window.location = { href: "" };

      logout();

      expect(window.location.href).toBe("/login");
    });
  });
});
