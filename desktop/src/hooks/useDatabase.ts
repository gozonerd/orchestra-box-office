import { invoke } from "@tauri-apps/api/tauri";
import { useCallback, useState } from "react";

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
}

export interface PipelineRun {
  id: string;
  pipeline_id: string;
  status: string;
  started_at: number;
  ended_at?: number;
  outcomes_count: number;
}

export interface Budget {
  id: string;
  pipeline_id: string;
  period: string;
  allocated_cents: number;
  spent_cents: number;
}

export interface SyncStatus {
  pending_count: number;
  last_sync?: number;
}

/**
 * Custom hook for database operations via Tauri IPC
 */
export const useDatabase = () => {
  const [error, setError] = useState<string | null>(null);

  // ============= PIPELINE OPERATIONS =============

  const createPipeline = useCallback(
    async (name: string, description?: string): Promise<Pipeline | null> => {
      try {
        const result = await invoke<Pipeline>("create_pipeline", {
          name,
          description,
        });
        setError(null);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to create pipeline: ${msg}`);
        return null;
      }
    },
    []
  );

  const getPipeline = useCallback(async (id: string): Promise<Pipeline | null> => {
    try {
      const result = await invoke<Pipeline | null>("get_pipeline", { id });
      setError(null);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to get pipeline: ${msg}`);
      return null;
    }
  }, []);

  const listPipelines = useCallback(async (): Promise<Pipeline[]> => {
    try {
      const result = await invoke<Pipeline[]>("list_pipelines");
      setError(null);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to list pipelines: ${msg}`);
      return [];
    }
  }, []);

  const updatePipeline = useCallback(
    async (
      id: string,
      name: string,
      description?: string
    ): Promise<boolean> => {
      try {
        await invoke("update_pipeline", {
          id,
          name,
          description,
        });
        setError(null);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to update pipeline: ${msg}`);
        return false;
      }
    },
    []
  );

  const deletePipeline = useCallback(async (id: string): Promise<boolean> => {
    try {
      await invoke("delete_pipeline", { id });
      setError(null);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to delete pipeline: ${msg}`);
      return false;
    }
  }, []);

  // ============= PIPELINE RUN OPERATIONS =============

  const createPipelineRun = useCallback(
    async (
      pipeline_id: string,
      status: string,
      outcomes_count: number
    ): Promise<PipelineRun | null> => {
      try {
        const result = await invoke<PipelineRun>("create_pipeline_run", {
          pipeline_id,
          status,
          outcomes_count,
        });
        setError(null);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to create run: ${msg}`);
        return null;
      }
    },
    []
  );

  const getPipelineRun = useCallback(
    async (id: string): Promise<PipelineRun | null> => {
      try {
        const result = await invoke<PipelineRun | null>("get_pipeline_run", {
          id,
        });
        setError(null);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to get run: ${msg}`);
        return null;
      }
    },
    []
  );

  const listPipelineRuns = useCallback(
    async (pipeline_id: string): Promise<PipelineRun[]> => {
      try {
        const result = await invoke<PipelineRun[]>("list_pipeline_runs", {
          pipeline_id,
        });
        setError(null);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to list runs: ${msg}`);
        return [];
      }
    },
    []
  );

  const listAllPipelineRuns = useCallback(async (): Promise<PipelineRun[]> => {
    try {
      const result = await invoke<PipelineRun[]>("list_all_pipeline_runs");
      setError(null);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to list all runs: ${msg}`);
      return [];
    }
  }, []);

  const updatePipelineRunStatus = useCallback(
    async (id: string, status: string): Promise<boolean> => {
      try {
        await invoke("update_pipeline_run_status", { id, status });
        setError(null);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to update run status: ${msg}`);
        return false;
      }
    },
    []
  );

  const completePipelineRun = useCallback(async (id: string): Promise<boolean> => {
    try {
      await invoke("complete_pipeline_run", { id });
      setError(null);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to complete run: ${msg}`);
      return false;
    }
  }, []);

  // ============= BUDGET OPERATIONS =============

  const createBudget = useCallback(
    async (
      pipeline_id: string,
      period: string,
      allocated_cents: number,
      spent_cents: number
    ): Promise<Budget | null> => {
      try {
        const result = await invoke<Budget>("create_budget", {
          pipeline_id,
          period,
          allocated_cents,
          spent_cents,
        });
        setError(null);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to create budget: ${msg}`);
        return null;
      }
    },
    []
  );

  const getBudget = useCallback(async (id: string): Promise<Budget | null> => {
    try {
      const result = await invoke<Budget | null>("get_budget", { id });
      setError(null);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to get budget: ${msg}`);
      return null;
    }
  }, []);

  const listBudgets = useCallback(
    async (pipeline_id: string): Promise<Budget[]> => {
      try {
        const result = await invoke<Budget[]>("list_budgets", {
          pipeline_id,
        });
        setError(null);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to list budgets: ${msg}`);
        return [];
      }
    },
    []
  );

  const listAllBudgets = useCallback(async (): Promise<Budget[]> => {
    try {
      const result = await invoke<Budget[]>("list_all_budgets");
      setError(null);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to list all budgets: ${msg}`);
      return [];
    }
  }, []);

  const updateBudget = useCallback(
    async (id: string, spent_cents: number): Promise<boolean> => {
      try {
        await invoke("update_budget", { id, spent_cents });
        setError(null);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to update budget: ${msg}`);
        return false;
      }
    },
    []
  );

  const deleteBudget = useCallback(async (id: string): Promise<boolean> => {
    try {
      await invoke("delete_budget", { id });
      setError(null);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to delete budget: ${msg}`);
      return false;
    }
  }, []);

  // ============= SYNC OPERATIONS =============

  const getSyncStatus = useCallback(async (): Promise<SyncStatus | null> => {
    try {
      const result = await invoke<SyncStatus>("get_sync_status");
      setError(null);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to get sync status: ${msg}`);
      return null;
    }
  }, []);

  return {
    error,
    setError,
    // Pipelines
    createPipeline,
    getPipeline,
    listPipelines,
    updatePipeline,
    deletePipeline,
    // Runs
    createPipelineRun,
    getPipelineRun,
    listPipelineRuns,
    listAllPipelineRuns,
    updatePipelineRunStatus,
    completePipelineRun,
    // Budgets
    createBudget,
    getBudget,
    listBudgets,
    listAllBudgets,
    updateBudget,
    deleteBudget,
    // Sync
    getSyncStatus,
  };
};
