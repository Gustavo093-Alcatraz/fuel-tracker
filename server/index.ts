import express from 'express';
import axios from 'axios';
import csv from 'csv-parser';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// URL do dado aberto da ANP (preços médios por estado/mês)
// Dados atualizados semanalmente
const ANP_DATA_URL = 'https://dadosabertos.anp.gov.br/arquivos/combustiveis/Preco/Preco-Combustiveis-Municipio.csv';

// Cache em memória (validade: 1 hora)
let stationsCache: StationData[] = [];
let lastUpdate: Date | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

interface StationData {
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

/**
 * Baixa e processa o CSV da ANP
 */
async function fetchANPData(): Promise<StationData[]> {
  console.log('[ANP] Baixando dados...');
  
  try {
    const response = await axios.get(ANP_DATA_URL, {
      responseType: 'stream',
      timeout: 30000,
    });

    const results: StationData[] = [];
    
    return new Promise((resolve, reject) => {
      response.data
        .pipe(csv({ separator: ';' }))
        .on('data', (row: any) => {
          // Filtra apenas postos com preço e localização
          if (row.preco_venda && row.latitude && row.longitude) {
            results.push({
              cod_municipio_ibge: row.cod_municipio_ibge,
              municipio: row.municipio,
              uf: row.uf,
              revenda: row.revenda,
              cnpj_revenda: row.cnpj_revenda,
              bairro: row.bairro,
              endereco: row.endereco,
              produto: row.produto,
              preco_venda: parseFloat(row.preco_venda.replace(',', '.')),
              data_coleta: row.data_coleta,
              latitude: parseFloat(row.latitude),
              longitude: parseFloat(row.longitude),
            });
          }
        })
        .on('end', () => {
          console.log(`[ANP] ${results.length} postos processados`);
          resolve(results);
        })
        .on('error', (err: Error) => {
          console.error('[ANP] Erro ao processar CSV:', err);
          reject(err);
        });
    });
  } catch (error) {
    console.error('[ANP] Erro ao baixar dados:', error);
    throw error;
  }
}

/**
 * Obtém dados do cache ou atualiza
 */
async function getStationsData(): Promise<StationData[]> {
  const now = new Date();
  
  if (stationsCache.length > 0 && lastUpdate && 
      (now.getTime() - lastUpdate.getTime()) < CACHE_DURATION) {
    console.log('[API] Usando cache...');
    return stationsCache;
  }

  console.log('[API] Atualizando cache...');
  stationsCache = await fetchANPData();
  lastUpdate = now;
  return stationsCache;
}

/**
 * API: Lista todos os postos (com paginação)
 */
app.get('/api/stations', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const uf = req.query.uf as string | undefined;
    const produto = req.query.produto as string | undefined;

    let stations = await getStationsData();

    // Filtros
    if (uf) {
      stations = stations.filter(s => s.uf === uf);
    }
    if (produto) {
      stations = stations.filter(s => 
        s.produto.toLowerCase().includes(produto.toLowerCase())
      );
    }

    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedStations = stations.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedStations,
      pagination: {
        page,
        limit,
        total: stations.length,
        totalPages: Math.ceil(stations.length / limit),
      },
      lastUpdate,
    });
  } catch (error) {
    console.error('[API] Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados',
    });
  }
});

/**
 * API: Busca postos por coordenadas (raio)
 */
app.get('/api/stations/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 0.1; // ~10km
    const produto = req.query.produto as string | undefined;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'Lat e Lng são obrigatórios',
      });
    }

    let stations = await getStationsData();

    // Filtro por produto
    if (produto) {
      stations = stations.filter(s => 
        s.produto.toLowerCase().includes(produto.toLowerCase())
      );
    }

    // Filtro por distância (fórmula de Haversine simplificada)
    const nearbyStations = stations.filter(station => {
      if (!station.latitude || !station.longitude) return false;
      
      const dLat = station.latitude - lat;
      const dLng = station.longitude - lng;
      const distance = Math.sqrt(dLat * dLat + dLng * dLng);
      
      return distance <= radius;
    });

    res.json({
      success: true,
      data: nearbyStations.slice(0, 100), // Limita a 100 resultados
      count: nearbyStations.length,
    });
  } catch (error) {
    console.error('[API] Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar postos próximos',
    });
  }
});

/**
 * API: Status do serviço
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    cacheSize: stationsCache.length,
    lastUpdate,
  });
});

// Serve arquivos estáticos do build
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 FuelStrk API rodando em http://localhost:${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   GET /api/stations - Lista postos (paginado)`);
  console.log(`   GET /api/stations/nearby?lat=&lng=&radius= - Postos próximos`);
  console.log(`   GET /api/health - Status`);
});
