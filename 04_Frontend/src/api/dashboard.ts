import { api } from "./http";

export interface DashboardSummary {
  kpis: {
    totalEnProceso: number;
    consolasEnLab: number;    // <--- NUEVO
    validadoresEnLab: number; // <--- NUEVO
    totalReparados: number;
    totalOperativos: number;
    totalPods: number;
    podsReparados: number;
  };
  charts: {
    pieData: Array<{ name: string; value: number }>;
    barData: Array<{ name: string; cantidad: number }>;
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get("/api/dashboard/summary");
  return data;
}