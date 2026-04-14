import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Dashboard } from "./Dashboard";

// Mock the useDatabase hook
vi.mock("../hooks/useDatabase", () => ({
  useDatabase: () => ({
    listPipelines: vi.fn().mockResolvedValue([
      { id: "p1", name: "Pipeline 1", description: "Test Pipeline" },
    ]),
    listAllPipelineRuns: vi.fn().mockResolvedValue([
      {
        id: "r1",
        pipeline_id: "p1",
        status: "completed",
        started_at: 1000,
        outcomes_count: 100,
      },
    ]),
    listAllBudgets: vi.fn().mockResolvedValue([
      {
        id: "b1",
        pipeline_id: "p1",
        period: "2024-01",
        allocated_cents: 100000,
        spent_cents: 50000,
      },
    ]),
  }),
}));

describe("Dashboard", () => {
  it("should render dashboard title", async () => {
    render(<Dashboard />);
    const title = await waitFor(() => screen.getByText("Dashboard"));
    expect(title).toBeInTheDocument();
  });

  it("should display metric cards", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Total Pipelines")).toBeInTheDocument();
      expect(screen.getByText("Total Cost")).toBeInTheDocument();
      expect(screen.getByText("Total Outcomes")).toBeInTheDocument();
      expect(screen.getByText("Active Runs")).toBeInTheDocument();
    });
  });

  it("should display ROI metric", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("ROI")).toBeInTheDocument();
    });
  });

  it("should display average cost per outcome", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Avg Cost per Outcome")).toBeInTheDocument();
    });
  });

  it("should display chart sections", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("ROI by Pipeline")).toBeInTheDocument();
      expect(screen.getByText("Cost per Outcome by Pipeline")).toBeInTheDocument();
      expect(screen.getByText("Budget Utilization by Pipeline")).toBeInTheDocument();
      expect(screen.getByText("Budget Utilization %")).toBeInTheDocument();
    });
  });

  it("should display loading state initially", () => {
    render(<Dashboard />);
    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });
});
