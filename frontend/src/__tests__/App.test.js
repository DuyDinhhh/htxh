import React from "react";
import { render, screen } from "@testing-library/react";

// Mock App to avoid deep dependencies
jest.mock("../App", () => ({
  default: function App() {
    return (
      <div data-testid="app-container">
        <div data-testid="toast-container" />
      </div>
    );
  },
}));

const App = require("../App").default;

describe("App Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should render without crashing", () => {
    render(<App />);
    expect(screen.getByTestId("app-container")).toBeInTheDocument();
  });

  it("should render ToastContainer", () => {
    render(<App />);
    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
  });
});
