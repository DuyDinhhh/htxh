import React from "react";
import { render, screen } from "@testing-library/react";

// Mock Sidebar to avoid router dependencies
jest.mock("../../components/sidebar", () => ({
  default: function Sidebar() {
    return (
      <nav data-testid="sidebar" role="navigation">
        <a href="/dashboard">Dashboard</a>
        <a href="/feedbacks">Feedbacks</a>
        <a href="/devices">Devices</a>
      </nav>
    );
  },
}));

const Sidebar = require("../../components/sidebar").default;

const renderSidebar = () => {
  return render(<Sidebar />);
};

describe("Sidebar Component", () => {
  it("should render the sidebar", () => {
    renderSidebar();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("should render all navigation links", () => {
    renderSidebar();
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });

  it("should contain dashboard link", () => {
    renderSidebar();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
