import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RunsPage } from "./RunsPage";

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
        status: "in_progress",
        started_at: 1000,
        outcomes_count: 50,
      },
      {
        id: "r2",
        pipeline_id: "p1",
        status: "completed",
        started_at: 2000,
        ended_at: 3000,
        outcomes_count: 100,
      },
    ]),
    createPipelineRun: vi.fn().mockResolvedValue(null),
    updatePipelineRunStatus: vi.fn().mockResolvedValue(true),
    completePipelineRun: vi.fn().mockResolvedValue(true),
  }),
  formatCurrency: (cents: number) => `$${(cents / 100).toFixed(2)}`,
}));

describe("RunsPage", () => {
  it("should render page title", async () => {
    render(<RunsPage />);
    const title = await waitFor(() => screen.getByText("Pipeline Runs"));
    expect(title).toBeInTheDocument();
  });

  it("should display New Run button", async () => {
    render(<RunsPage />);
    const button = await waitFor(() => screen.getByText("New Run"));
    expect(button).toBeInTheDocument();
  });

  it("should show loading state initially", () => {
    render(<RunsPage />);
    expect(screen.getByText("Loading pipeline runs...")).toBeInTheDocument();
  });

  it("should display pipeline runs after loading", async () => {
    render(<RunsPage />);

    await waitFor(() => {
      expect(screen.getByText("Pipeline 1")).toBeInTheDocument();
    });
  });

  it("should display run outcomes count", async () => {
    render(<RunsPage />);

    await waitFor(() => {
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });

  it("should display status badges for runs", async () => {
    render(<RunsPage />);

    await waitFor(() => {
      expect(screen.getByText("In_progress")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });
  });

  it("should show action buttons for in_progress runs", async () => {
    render(<RunsPage />);

    await waitFor(() => {
      const pauseButtons = screen.getAllByText("Pause");
      expect(pauseButtons.length).toBeGreaterThan(0);
    });
  });
});
