import { api } from "./http";

// --- TIPOS DE ENTRADA (Para crear) ---
export interface CreateOSPayload {
  tipo: "CONSOLA" | "VALIDADOR";
  es_pod: boolean;
  foto_dano_url?: string;
  falla: string;
  bus_ppu: string;
  serie_equipo: string;
  modelo?: string;
  marca?: string;
}

// --- TIPOS DE SALIDA (Lo que viene de la DB) ---
// Actualizado para reflejar tu tabla real 'pmp.ordenes_servicio'
export interface OrdenServicio {
  codigo_os: string;        // PK (ej: MV-000001)
  tipo_equipo: "CONSOLA" | "VALIDADOR";
  estado_id: number;        // ID numérico del estado
  estado_nombre?: string;   // Nombre del estado (ej: 'EN_RUTA')
  falla: string;
  bus_ppu: string;
  
  // Series específicas según la DB
  validador_serie?: string;
  consola_serie?: string;
  
  tecnico_nombre?: string;
  fecha: string;            // timestamp creación
}

// --- FUNCIONES (ENDPOINTS) ---

/**
 * Crea una nueva Orden de Servicio
 */
export const createOS = async (payload: CreateOSPayload) => {
  const { data } = await api.post("/api/os/crear", payload);
  return data;
};

/**
 * Obtiene una OS específica por su código
 */
export async function getOs(codigoOS: string): Promise<OrdenServicio> {
  const { data } = await api.get<OrdenServicio>(`/api/os/${encodeURIComponent(codigoOS)}`);
  return data;
}

/**
 * Lista todas las OS (Opcional, si tienes una vista general)
 */
export async function listOs(): Promise<OrdenServicio[]> {
  try {
    const { data } = await api.get<OrdenServicio[]>("/api/os");
    return data;
  } catch (error) {
    console.error("Error listando OS", error);
    return [];
  }
}