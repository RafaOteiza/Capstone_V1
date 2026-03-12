import { api } from "./http";

export interface LabTicket {
  codigo_os: string;
  fecha: string;
  falla: string;
  estado_id: number;
  estado_nombre: string;
  bus_ppu: string;
  serie: string;
  tecnico_origen: string;
  tecnico_laboratorio_id?: string; // ID del técnico asignado
}

export interface LabTech {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

// Obtener cola
export const getLabQueue = async (type: 'VALIDADOR' | 'CONSOLA') => {
  const { data } = await api.get<LabTicket[]>(`/api/lab/queue/${type}`);
  return data;
};

// Obtener técnicos
export const getLabTechnicians = async () => {
  const { data } = await api.get<LabTech[]>("/api/lab/technicians");
  return data;
};

// Asignar
export const assignTicket = async (codigo_os: string, tecnico_id: string) => {
  const { data } = await api.put("/api/lab/assign", { codigo_os, tecnico_id });
  return data;
};

// Mover Estado
export const moveTicket = async (codigo_os: string, nuevo_estado_id: number, comentario?: string) => {
  const { data } = await api.put("/api/lab/move", { codigo_os, nuevo_estado_id, comentario });
  return data;
};