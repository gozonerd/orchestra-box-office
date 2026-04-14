import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BudgetPage } from "./BudgetPage";

// Mock the useDatabase hook
vi.mock("../hooks/useDatabase", () => ({
  useDatabase: () => ({
    listPipelines: vi.fn().mockResolvedValue([
      { id: "p1", name: "Pipeline 1", description: "Test Pipeline" },
    ]),
    listAllBudgets: vi.fn().mockResolvedValue([
      {
        id: "b1",
        pipeline_id: "p1",
        period: "2024-01",
        allocated_cents: 100000,
        spent_cents: 50000,
      },
      {
        id: "b2",
        pipeline_id: "p1",
        period: "2024-02",
        allocated_cents: 100000,
        spent_cents: 90000,
      },
    ]),
    createBudget: vi.fn().mockResolvedValue(null),
    updateBudget: vi.fn().mockResolvedValue(true),
    deleteBudget: vi.fn().mockResolvedValue(true),
  }),
  formatCurrency: (cents: number) => `$${(cents / 100).toFixed(2)}`,
}));

// Mock metrics utility
vi.mock("../utils/metrics", () => ({
  formatCurrency: (cents: number) => `$${(cents / 100).toFixed(2)}`,
  getBudgetMetrics: () => [
    {
      pipelineId: "p1",
      pipelineName: "Pipeline 1",
      allocatedCents: 200000,
      spentCents: 140000,
      utilizationPercent: 70,
    },
  ],
}));

describe("BudgetPage", () => {
  it("should render budget page title", async () => {
    render(<BudgetPage />);

    const title = await waitFor(() => screen.getByText("Budget Tracking"));
    expect(title).toBeInTheDocument();
  });

  it("should display New Budget button", async () => {
    render(<BudgetPage />);

    const button = await waitFor(() => screen.getByText("New Budget"));
    expect(button).toBeInTheDocument();
  });

  it("should show loading state initially", () => {
    render(<BudgetPage />);
    expect(screen.getByText("Loading budgets...")).toBeInTheDocument();
  });

  it("should display pipeline budget cards", async () => {
    render(<BudgetPage />);

    await waitFor(() => {
      const pipelineElements = screen.getAllByText("Pipeline 1");
      expect(pipelineElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should display budget metrics", async () => {
    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Allocated/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Spent/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Utilization/)[0]).toBeInTheDocument();
    });
  });

  it("should display utilization percentage", async () => {
    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getByText(/70.0%/)).toBeInTheDocument();
    });
  });

  it("should display All Budgets section", async () => {
    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getByText("All Budgets")).toBeInTheDocument();
    });
  });

  it("should show period and amounts for each budget", async () => {
    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getByText("2024-01")).toBeInTheDocument();
      expect(screen.getByText("2024-02")).toBeInTheDocument();
    });
  });

  it("should display delete button for each budget", async () => {
    render(<BudgetPage />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText("Delete");
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it("should display +$100 quick update button", async () => {
    render(<BudgetPage />);

    await waitFor(() => {
      const updateButtons = screen.getAllByText("+$100");
      expect(updateButtons.length).toBeGreaterThan(0);
    });
  });
});
