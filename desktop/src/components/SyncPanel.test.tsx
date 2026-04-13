import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SyncPanel } from "./SyncPanel";

// Mock the useSync hook
vi.mock("../hooks/useSync", () => ({
  useSync: () => ({
    syncStatus: {
      pending_count: 5,
      last_sync: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      in_progress: false,
    },
    syncQueue: [],
    lastError: null,
    getSyncStatus: vi.fn(),
    triggerSync: vi.fn().mockResolvedValue(true),
    retrySyncEntry: vi.fn(),
    handleConflict: vi.fn(),
    clearSyncedEntries: vi.fn(),
  }),
}));

describe("SyncPanel", () => {
  it("should render sync status indicator", async () => {
    render(<SyncPanel />);

    await waitFor(() => {
      expect(screen.getByText(/pending change/)).toBeInTheDocument();
    });
  });

  it("should display pending changes count", async () => {
    render(<SyncPanel />);

    await waitFor(() => {
      expect(screen.getByText(/5 pending changes/)).toBeInTheDocument();
    });
  });

  it("should display last sync time", async () => {
    render(<SyncPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Last sync:/)).toBeInTheDocument();
    });
  });

  it("should show expand/collapse button", () => {
    render(<SyncPanel />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should expand panel when clicked", async () => {
    render(<SyncPanel />);
    const expandButton = screen.getAllByRole("button")[0];

    // First click to expand
    expandButton.click();

    await waitFor(() => {
      expect(screen.getByText(/Sync Now/)).toBeInTheDocument();
    });
  });

  it("should display sync info message when expanded", async () => {
    render(<SyncPanel />);
    const expandButton = screen.getAllByRole("button")[0];
    expandButton.click();

    await waitFor(() => {
      expect(
        screen.getByText(/changes are saved locally/i)
      ).toBeInTheDocument();
    });
  });

  it("should display Sync Now button when panel is expanded", async () => {
    render(<SyncPanel />);
    const expandButton = screen.getAllByRole("button")[0];
    expandButton.click();

    await waitFor(() => {
      const syncButton = screen.getByText(/Sync Now/);
      expect(syncButton).toBeInTheDocument();
      expect(syncButton.closest("button")).not.toBeDisabled();
    });
  });
});
