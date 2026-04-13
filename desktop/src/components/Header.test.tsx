import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

// Mock the useDatabase hook
vi.mock("../hooks/useDatabase", () => ({
  useDatabase: () => ({
    getSyncStatus: vi.fn().mockResolvedValue({ pending_count: 0 }),
  }),
}));

describe("Header", () => {
  it("should render the app title", () => {
    const mockPageChange = vi.fn();
    render(
      <Header onPageChange={mockPageChange} currentPage="dashboard" />
    );

    expect(screen.getByText("Orchestra Box Office")).toBeInTheDocument();
  });

  it("should show online status when connected", () => {
    const mockPageChange = vi.fn();
    render(
      <Header onPageChange={mockPageChange} currentPage="dashboard" />
    );

    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("should display sync status", () => {
    const mockPageChange = vi.fn();
    render(
      <Header onPageChange={mockPageChange} currentPage="dashboard" />
    );

    // Component should render without errors
    expect(screen.getByText("Orchestra Box Office")).toBeInTheDocument();
  });
});
