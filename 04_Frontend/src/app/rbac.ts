export const ROLES = {
  ADMIN: "admin",
  JEFE_LAB: "jefe_laboratorio",
  TEC_LAB: "tecnico_laboratorio",
  TEC_TERRENO: "tecnico_terreno",
  QA: "qa",
  BODEGA: "bodega",
  CONTADOR: "contador"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function hasAnyRole(userRole: string | undefined, allowed: string[]): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole);
}
