import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDatabase } from "./useDatabase";

describe("useDatabase", () => {
  it("should initialize with no error", () => {
    const { result } = renderHook(() => useDatabase());
    expect(result.current.error).toBeNull();
  });

  it("should have all pipeline methods", () => {
    const { result } = renderHook(() => useDatabase());
    expect(result.current.createPipeline).toBeDefined();
    expect(result.current.getPipeline).toBeDefined();
    expect(result.current.listPipelines).toBeDefined();
    expect(result.current.updatePipeline).toBeDefined();
    expect(result.current.deletePipeline).toBeDefined();
  });

  it("should have all run methods", () => {
    const { result } = renderHook(() => useDatabase());
    expect(result.current.createPipelineRun).toBeDefined();
    expect(result.current.getPipelineRun).toBeDefined();
    expect(result.current.listPipelineRuns).toBeDefined();
    expect(result.current.updatePipelineRunStatus).toBeDefined();
    expect(result.current.completePipelineRun).toBeDefined();
  });

  it("should have all budget methods", () => {
    const { result } = renderHook(() => useDatabase());
    expect(result.current.createBudget).toBeDefined();
    expect(result.current.getBudget).toBeDefined();
    expect(result.current.listBudgets).toBeDefined();
    expect(result.current.updateBudget).toBeDefined();
    expect(result.current.deleteBudget).toBeDefined();
  });

  it("should have sync method", () => {
    const { result } = renderHook(() => useDatabase());
    expect(result.current.getSyncStatus).toBeDefined();
  });

  it("should have setError method", () => {
    const { result } = renderHook(() => useDatabase());
    expect(result.current.setError).toBeDefined();
  });
});
