/**
 * Tipos compartilhados com o backend
 */

export interface StationData {
  cod_municipio_ibge: string;
  municipio: string;
  uf: string;
  revenda: string;
  cnpj_revenda: string;
  bairro: string;
  endereco: string;
  produto: string;
  preco_venda: number;
  data_coleta: string;
  latitude?: number;
  longitude?: number;
}

export interface StationsResponse {
  success: boolean;
  data: StationData[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  count?: number;
  lastUpdate?: Date;
}

export interface HealthResponse {
  success: boolean;
  status: string;
  cacheSize: number;
  lastUpdate?: Date;
}
