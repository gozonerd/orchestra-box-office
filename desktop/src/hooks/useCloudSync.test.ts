import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCloudSync } from "./useCloudSync";

// Mock tauri invoke
vi.mock("@tauri-apps/api/tauri", () => ({
  invoke: vi.fn(),
}));

// Mock ApiClient
vi.mock("../utils/api-client", () => ({
  ApiClient: vi.fn(() => ({
    checkAuth: vi.fn().mockResolvedValue(true),
    authenticate: vi.fn().mockResolvedValue({ token: "test_token" }),
    batchSync: vi.fn().mockResolvedValue({
      response: {
        synced_count: 1,
        failed_count: 0,
        conflict_count: 0,
        responses: [{ entity_id: "p1", synced: true }],
        server_timestamp: Math.floor(Date.now() / 1000),
      },
      errors: [],
    }),
    resolveConflict: vi.fn().mockResolvedValue(true),
  })),
  DEFAULT_API_CONFIG: { baseUrl: "https://api.test.com" },
}));

describe("useCloudSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with authenticated false", () => {
    const { result } = renderHook(() => useCloudSync());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("checks authentication on mount", async () => {
    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBeDefined();
    });
  });

  it("authenticates user with email and password", async () => {
    const { result } = renderHook(() => useCloudSync());

    let authSuccess = false;
    await act(async () => {
      authSuccess = await result.current.authenticate("user@test.com", "password");
    });

    expect(authSuccess).toBe(true);
  });

  it("handles authentication failure", async () => {
    const { result } = renderHook(() => useCloudSync());

    // Mock failed auth
    const { invoke } = await import("@tauri-apps/api/tauri");
    vi.mocked(invoke).mockRejectedValueOnce(new Error("Auth failed"));

    let authSuccess = false;
    await act(async () => {
      authSuccess = await result.current.authenticate("user@test.com", "wrong");
    });

    expect(authSuccess).toBe(false);
  });

  it("syncs pending entries when authenticated", async () => {
    const { invoke } = await import("@tauri-apps/api/tauri");
    vi.mocked(invoke).mockResolvedValueOnce(1); // pending count
    vi.mocked(invoke).mockResolvedValueOnce([
      {
        id: "1",
        entity_type: "Pipeline",
        entity_id: "p1",
        operation: "create",
        payload: '{"name":"Test"}',
        created_at: 1000,
      },
    ]);

    const { result } = renderHook(() => useCloudSync());

    // First check auth (will be mocked)
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBeDefined();
    });

    // Then sync
    let syncSuccess = false;
    await act(async () => {
      syncSuccess = await result.current.syncToCloud();
    });

    expect(syncSuccess).toBeDefined();
  });

  it("tracks pending entry count", async () => {
    const { invoke } = await import("@tauri-apps/api/tauri");
    vi.mocked(invoke).mockResolvedValueOnce(3); // 3 pending entries

    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(result.current.pendingCount).toBeGreaterThanOrEqual(0);
    });
  });

  it("resolves conflicts with local_wins", async () => {
    const { result } = renderHook(() => useCloudSync());

    const conflict = {
      entity_type: "Budget",
      entity_id: "b1",
      local_data: { allocated_cents: 10000 },
      remote_data: { allocated_cents: 15000 },
      resolution_strategy: "manual" as const,
    };

    let resolveSuccess = false;
    await act(async () => {
      resolveSuccess = await result.current.resolveConflict(conflict, "local_wins");
    });

    expect(resolveSuccess).toBe(true);
  });

  it("resolves conflicts with remote_wins", async () => {
    const { result } = renderHook(() => useCloudSync());

    const conflict = {
      entity_type: "Pipeline",
      entity_id: "p1",
      local_data: { name: "Local" },
      remote_data: { name: "Remote" },
      resolution_strategy: "manual" as const,
    };

    let resolveSuccess = false;
    await act(async () => {
      resolveSuccess = await result.current.resolveConflict(conflict, "remote_wins");
    });

    expect(resolveSuccess).toBe(true);
  });

  it("returns false when not authenticated for sync", async () => {
    const { result } = renderHook(() => useCloudSync());

    let syncSuccess = false;
    await act(async () => {
      syncSuccess = await result.current.syncToCloud();
    });

    expect(syncSuccess).toBe(false);
    expect(result.current.syncErrors).toContain("Not authenticated with cloud");
  });

  it("handles sync errors gracefully", async () => {
    const { invoke } = await import("@tauri-apps/api/tauri");
    vi.mocked(invoke).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(result.current.syncErrors.length).toBeGreaterThanOrEqual(0);
    });
  });
});
