export interface Ataque {
  id: number;
  ip: string;
  endpoint: string;
  payload: string;
  tipo: 'BRUTE_FORCE' | 'SQL_INJECTION' | 'XSS' | 'NO_AUTH' | 'OTRO';
  severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  timestamp: string;
  userAgent: string;
  detalles: string | null;
}
