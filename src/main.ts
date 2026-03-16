import './style.css';
import L from 'leaflet';

// ============================================
// INTERFACES E TIPOS
// ============================================

interface OverpassTags {
  name?: string;
  brand?: string;
  [key: string]: string | undefined;
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: OverpassTags;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface Station {
  id: number;
  name: string;
  lat: number;
  lng: number;
  currentPrice: string;
}

interface StateData {
  uf: string;
  name: string;
  lat: number;
  lng: number;
  precoMedio: number;
}

// ============================================
// DADOS DOS ESTADOS BRASILEIROS
// ============================================

const statesData: StateData[] = [
  { uf: 'AC', name: 'Acre', lat: -9.0238, lng: -70.8120, precoMedio: 7.49 },
  { uf: 'AL', name: 'Alagoas', lat: -9.5328, lng: -36.6666, precoMedio: 6.15 },
  { uf: 'AP', name: 'Amapá', lat: 1.4192, lng: -51.7705, precoMedio: 5.95 },
  { uf: 'AM', name: 'Amazonas', lat: -3.4168, lng: -65.8561, precoMedio: 6.80 },
  { uf: 'BA', name: 'Bahia', lat: -12.5797, lng: -41.7007, precoMedio: 6.45 },
  { uf: 'CE', name: 'Ceará', lat: -5.3283, lng: -39.3043, precoMedio: 6.30 },
  { uf: 'DF', name: 'Distrito Federal', lat: -15.7998, lng: -47.8645, precoMedio: 5.99 },
  { uf: 'ES', name: 'Espírito Santo', lat: -19.1834, lng: -40.3089, precoMedio: 6.10 },
  { uf: 'GO', name: 'Goiás', lat: -15.8270, lng: -49.8362, precoMedio: 6.05 },
  { uf: 'MA', name: 'Maranhão', lat: -4.9609, lng: -45.2744, precoMedio: 6.20 },
  { uf: 'MT', name: 'Mato Grosso', lat: -12.6819, lng: -56.9211, precoMedio: 6.35 },
  { uf: 'MS', name: 'Mato Grosso do Sul', lat: -20.3297, lng: -54.5555, precoMedio: 6.12 },
  { uf: 'MG', name: 'Minas Gerais', lat: -18.5122, lng: -44.5550, precoMedio: 5.98 },
  { uf: 'PA', name: 'Pará', lat: -3.2024, lng: -52.2159, precoMedio: 6.40 },
  { uf: 'PB', name: 'Paraíba', lat: -7.1153, lng: -36.1956, precoMedio: 6.18 },
  { uf: 'PR', name: 'Paraná', lat: -25.2521, lng: -52.0215, precoMedio: 6.09 },
  { uf: 'PE', name: 'Pernambuco', lat: -8.8137, lng: -36.9541, precoMedio: 6.25 },
  { uf: 'PI', name: 'Piauí', lat: -7.7183, lng: -42.7289, precoMedio: 6.32 },
  { uf: 'RJ', name: 'Rio de Janeiro', lat: -22.9094, lng: -43.2094, precoMedio: 5.95 },
  { uf: 'RN', name: 'Rio Grande do Norte', lat: -5.7945, lng: -36.5810, precoMedio: 6.45 },
  { uf: 'RS', name: 'Rio Grande do Sul', lat: -30.0346, lng: -51.2177, precoMedio: 6.05 },
  { uf: 'RO', name: 'Rondônia', lat: -11.5057, lng: -63.5806, precoMedio: 7.12 },
  { uf: 'RR', name: 'Roraima', lat: 2.7376, lng: -62.0751, precoMedio: 6.60 },
  { uf: 'SC', name: 'Santa Catarina', lat: -27.2423, lng: -50.2189, precoMedio: 6.15 },
  { uf: 'SP', name: 'São Paulo', lat: -23.5505, lng: -46.6333, precoMedio: 6.00 },
  { uf: 'SE', name: 'Sergipe', lat: -10.5741, lng: -37.3857, precoMedio: 6.22 },
  { uf: 'TO', name: 'Tocantins', lat: -10.1753, lng: -48.2982, precoMedio: 6.48 },
];

// ============================================
// VARIÁVEIS DE ESTADO
// ============================================

let currentFuel: string = 'Gasolina';
let currentStation: Station | null = null;
let map: L.Map | null = null;
let currentTileLayer: L.TileLayer | null = null;
let markersGroup: L.LayerGroup | null = null;
let statesGroup: L.LayerGroup | null = null;

// Fator diário para simular flutuação de mercado (Variação entre -2% e +2%)
const fatorDiario: number = 1.00 + (Math.random() * 0.04 - 0.02);

// ============================================
// DEFINIÇÕES DE CAMADAS DO MAPA (TILES)
// ============================================

const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  subdomains: 'abcd',
  maxZoom: 20,
});

const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  subdomains: 'abcd',
  maxZoom: 20,
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Simula o preço do combustível com variação aleatória
 */
function simulatePrice(fuelType: string): string {
  const baseGasolina: number = 5.80;
  let price: number = baseGasolina;

  switch (fuelType) {
    case 'Gasolina':
      price = baseGasolina;
      break;
    case 'Aditivada':
      price = baseGasolina * 1.05;
      break;
    case 'Etanol':
      price = baseGasolina * 0.70;
      break;
    case 'Diesel':
      price = baseGasolina * 0.90;
      break;
  }

  // Adiciona variação randômica (+/- 10 centavos)
  price += Math.random() * 0.20 - 0.10;
  return price.toFixed(2);
}

/**
 * Cria um ícone brutalist para os marcadores
 */
function createBrutalistIcon(price: string): L.DivIcon {
  return L.divIcon({
    html: `<div class="pin">${price}</div>`,
    iconSize: [80, 80],
    iconAnchor: [40, 80],
    className: 'leaflet-brutalist-marker',
  });
}

/**
 * Atualiza a sidebar com os dados do posto selecionado
 */
function updateStationView(): void {
  if (!currentStation) return;

  const dynamicCard = document.getElementById('dynamicCard');
  if (!dynamicCard) return;

  const displayedPrice: string = currentStation.currentPrice || simulatePrice(currentFuel);
  showPost(currentStation.name, `R$ ${displayedPrice}`);
}

/**
 * Exibe os detalhes do posto na sidebar
 */
function showPost(name: string, price: string): void {
  const dynamicCard = document.getElementById('dynamicCard');
  if (!dynamicCard) return;

  dynamicCard.classList.remove('empty');

  const now: Date = new Date();
  const timeString: string = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
  const stationId: string | number = currentStation ? currentStation.id : 'N/A';

  dynamicCard.innerHTML = `
    <div class="post-details animate-fadeIn">
      <span class="font-mono font-bold text-xs" style="color: var(--accent-neon); background: #000; padding: 2px 5px;">
        OSM_NODE_${stationId}
      </span>
      <h2 class="text-3xl font-black leading-none uppercase mt-[10px]">${name}</h2>
      <div class="font-mono font-bold text-xs uppercase mt-2">${currentFuel}</div>
      <div class="font-mono font-bold text-[4rem] leading-none tracking-tighter my-2" style="color: var(--accent-neon); -webkit-text-stroke: 1px var(--border-color, #000);">
        ${price}
      </div>
      <div class="font-mono text-xs uppercase opacity-60">
        Última atualização: Hoje, ${timeString}
      </div>
    </div>
  `;

  // Trigger reflow para reiniciar animação
  const card = dynamicCard.querySelector('.post-details') as HTMLElement | null;
  if (card) {
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'fadeIn 0.3s ease';
  }
}

/**
 * Exibe informações do estado selecionado (zoom out)
 */
function showStateInfo(state: StateData, price: string): void {
  const dynamicCard = document.getElementById('dynamicCard');
  if (!dynamicCard) return;

  dynamicCard.classList.remove('empty');

  const now: Date = new Date();
  const timeString: string = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  dynamicCard.innerHTML = `
    <div class="post-details animate-fadeIn">
      <span class="font-mono font-bold text-xs" style="color: var(--accent-neon); background: #000; padding: 2px 5px;">
        ${state.uf}
      </span>
      <h2 class="text-3xl font-black leading-none uppercase mt-[10px]">${state.name}</h2>
      <div class="font-mono font-bold text-xs uppercase mt-2">${currentFuel}</div>
      <div class="font-mono font-bold text-[4rem] leading-none tracking-tighter my-2" style="color: var(--accent-neon); -webkit-text-stroke: 1px var(--border-color, #000);">
        R$ ${price}
      </div>
      <div class="font-mono text-xs uppercase opacity-60 mt-2">
        PREÇO APROXIMADO
      </div>
      <div class="font-mono text-xs uppercase opacity-60">
        Última atualização: Hoje, ${timeString}
      </div>
    </div>
  `;

  // Trigger reflow para reiniciar animação
  const card = dynamicCard.querySelector('.post-details') as HTMLElement | null;
  if (card) {
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'fadeIn 0.3s ease';
  }
}

/**
 * Renderiza os marcadores dos estados
 */
function renderStateMarkers(): void {
  if (!statesGroup || !map) return;

  statesGroup.clearLayers();

  statesData.forEach((state) => {
    let basePrice: number = state.precoMedio;

    // Proporção baseada no combustível selecionado
    switch (currentFuel) {
      case 'Gasolina':
        break;
      case 'Aditivada':
        basePrice *= 1.05;
        break;
      case 'Etanol':
        basePrice *= 0.70;
        break;
      case 'Diesel':
        basePrice *= 0.90;
        break;
    }

    const currentPrice: string = (basePrice * fatorDiario).toFixed(2);

    const brutalistIcon = createBrutalistIcon(currentPrice);
    const marker = L.marker([state.lat, state.lng], { icon: brutalistIcon });

    marker.on('click', () => {
      if (map) {
        map.setView([state.lat, state.lng], 8);
      }
      // Mostra informação do estado selecionado
      showStateInfo(state, currentPrice);
    });

    statesGroup?.addLayer(marker);
  });
}

/**
 * Busca postos de combustível na Overpass API
 */
async function fetchStations(): Promise<void> {
  if (!map || !markersGroup) return;

  // Evita chamadas excessivas se o zoom estiver muito distante
  if (map.getZoom() < 7) return;

  const statusBadge = document.getElementById('mapStatus');
  if (statusBadge) statusBadge.classList.add('active');

  // Limpa marcadores antigos
  markersGroup.clearLayers();

  const bounds = map.getBounds();
  const sul = bounds.getSouth();
  const oeste = bounds.getWest();
  const norte = bounds.getNorth();
  const leste = bounds.getEast();

  // Query Overpass
  const query = `[out:json][timeout:25];(node["amenity"="fuel"](${sul},${oeste},${norte},${leste});way["amenity"="fuel"](${sul},${oeste},${norte},${leste}););out center;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data: OverpassResponse = await response.json();

    data.elements.forEach((element: OverpassElement) => {
      // Garante captura de coordenadas para 'node' ou 'way'
      const lat: number = element.lat ?? element.center?.lat ?? 0;
      const lon: number = element.lon ?? element.center?.lon ?? 0;

      const name: string = element.tags?.name ?? element.tags?.brand ?? 'Posto Independente';
      const currentPrice: string = simulatePrice(currentFuel);

      const station: Station = {
        id: element.id,
        name,
        lat,
        lng: lon,
        currentPrice,
      };

      const brutalistIcon = createBrutalistIcon(currentPrice);
      const marker = L.marker([lat, lon], { icon: brutalistIcon });

      marker.on('click', () => {
        currentStation = station;
        updateStationView();
      });

      markersGroup?.addLayer(marker);
    });
  } catch (error) {
    console.error('[SYS] Erro ao buscar dados na Overpass API:', error);
  } finally {
    if (statusBadge) statusBadge.classList.remove('active');
  }
}

/**
 * Alterna entre marcadores de estado e postos baseado no zoom
 */
function handleZoomChange(): void {
  if (!map || !markersGroup || !statesGroup) return;

  const zoom = map.getZoom();

  if (zoom < 7) {
    if (map.hasLayer(markersGroup)) map.removeLayer(markersGroup);
    if (!map.hasLayer(statesGroup)) map.addLayer(statesGroup);
    renderStateMarkers();
  } else {
    if (map.hasLayer(statesGroup)) map.removeLayer(statesGroup);
    if (!map.hasLayer(markersGroup)) map.addLayer(markersGroup);
    fetchStations();
  }
}

/**
 * Inicializa o mapa e a aplicação
 */
async function initApp(): Promise<void> {
  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error('[SYS] Elemento #map não encontrado');
    return;
  }

  // Inicializa o mapa focado no Brasil
  map = L.map('map', {
    zoomControl: false,
  });

  map.setView([-14.2350, -51.9253], 4);

  // Define o estilo de mapa inicial baseado no dark mode
  const isDark: boolean = document.documentElement.classList.contains('dark');
  currentTileLayer = isDark ? cartoDark : cartoLight;
  currentTileLayer.addTo(map);

  // Camadas de grupo para marcadores
  markersGroup = L.layerGroup().addTo(map);
  statesGroup = L.layerGroup().addTo(map);

  // Evento: buscar novos postos ao mover o mapa
  map.on('moveend', () => {
    if (map && map.getZoom() >= 7) fetchStations();
  });

  // Redimensionamento responsivo
  window.addEventListener('resize', () => {
    if (map) map.invalidateSize();
  });

  // Monitorar mudança de zoom
  map.on('zoomend', handleZoomChange);

  // Evento load do mapa
  map.on('load', handleZoomChange);

  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 200);
}

/**
 * Configura os event listeners da aplicação
 */
function setupEventListeners(): void {
  // Toggle Dark Mode
  const modeToggle = document.getElementById('modeToggle');
  if (modeToggle) {
    modeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark: boolean = document.documentElement.classList.contains('dark');
      modeToggle.innerText = isDark ? 'MODE: DARK' : 'MODE: LIGHT';

      // Troca a camada do mapa
      if (map && currentTileLayer) {
        map.removeLayer(currentTileLayer);
        currentTileLayer = isDark ? cartoDark : cartoLight;
        currentTileLayer.addTo(map);
      }
    });
  }

  // Fuel Type Buttons
  const fuelButtons = document.querySelectorAll('.fuel-btn');
  fuelButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const fuelType = target.getAttribute('data-fuel');

      if (!fuelType) return;

      // Remove active de todos e adiciona no clicado
      fuelButtons.forEach((b) => b.classList.remove('active', 'bg-accent-neon', 'text-black'));
      target.classList.add('active', 'bg-accent-neon', 'text-black');

      currentFuel = fuelType;

      // Atualiza visualização baseado no zoom
      if (map) {
        if (map.getZoom() < 7) {
          renderStateMarkers();
        } else {
          fetchStations();
        }
      }

      // Recalcula preço se houver posto em foco
      if (currentStation) {
        updateStationView();
      }
    });
  });
}

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO (CORRIGIDO PARA VITE/ESM)
// ============================================

function bootstrap() {
  const mapElement = document.getElementById('map');
  if (mapElement) {
    initApp();
    setupEventListeners();
  } else {
    // Fallback caso o script carregue bizarramente rápido
    window.addEventListener('DOMContentLoaded', () => {
      initApp();
      setupEventListeners();
    });
  }
}

bootstrap();
