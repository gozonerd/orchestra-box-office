import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  it("should render all menu items", () => {
    const mockPageChange = vi.fn();
    render(<Sidebar currentPage="dashboard" onPageChange={mockPageChange} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Pipelines")).toBeInTheDocument();
    expect(screen.getByText("Runs")).toBeInTheDocument();
    expect(screen.getByText("Budgets")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("should render quick stats section", () => {
    const mockPageChange = vi.fn();
    render(<Sidebar currentPage="dashboard" onPageChange={mockPageChange} />);

    expect(screen.getByText("Quick Stats")).toBeInTheDocument();
    expect(screen.getByText("Total Cost")).toBeInTheDocument();
    expect(screen.getByText("ROI")).toBeInTheDocument();
    expect(screen.getByText("Outcomes")).toBeInTheDocument();
  });

  it("should highlight current page", () => {
    const mockPageChange = vi.fn();
    const { container } = render(
      <Sidebar currentPage="pipelines" onPageChange={mockPageChange} />
    );

    const pipelineButton = screen.getByText("Pipelines").closest("button");
    expect(pipelineButton).toHaveClass("bg-blue-50");
  });
});
