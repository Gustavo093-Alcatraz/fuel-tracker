import './style.css';
import L from 'leaflet';
import { postosPortoVelho, type PostoFicticio } from './portoVelho';
import { todosPostos, municipiosBase, type PostoFicticio as PostoGeral } from './ficticios';

// ============================================
// INTERFACES E TIPOS
// ============================================

interface Station {
  id: number;
  name: string;
  lat: number;
  lng: number;
  currentPrice: string;
  endereco?: string;
  bairro?: string;
  municipio?: string;
  produto?: string;
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
let municipiosGroup: L.LayerGroup | null = null;

// Cache de Marcadores
const markerCache = new Map<string, L.Marker>();
let debounceTimer: number | null = null;

// Postos fictícios (Porto Velho)
let postosFicticiosCache: PostoFicticio[] = postosPortoVelho;

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
    case 'S10':
      price = baseGasolina * 0.95;
      break;
    case 'Podium':
      price = baseGasolina * 1.15;
      break;
  }

  // Adiciona variação randômica (+/- 10 centavos)
  price += Math.random() * 0.20 - 0.10;
  return price.toFixed(2);
}

/**
 * Cria um ícone brutalist para os marcadores
 */
function createBrutalistIcon(price: string, type: 'posto' | 'municipio' | 'estado' = 'posto'): L.DivIcon {
  const className = type === 'posto' ? 'pin' : (type === 'municipio' ? 'pin-municipio' : 'pin-estado');
  return L.divIcon({
    html: `<div class="${className}">${price}</div>`,
    iconSize: [80, 80],
    iconAnchor: [40, 80],
    className: `leaflet-brutalist-marker marker-${type}`,
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

  // Informações adicionais do posto (API ANP)
  const endereco = currentStation?.endereco || '';
  const bairro = currentStation?.bairro || '';
  const municipio = currentStation?.municipio || '';
  const produto = currentStation?.produto || currentFuel;

  dynamicCard.innerHTML = `
    <div class="post-details animate-fadeIn">
      <span class="font-mono font-bold text-xs" style="color: var(--accent-neon); background: #000; padding: 2px 5px;">
        ANP_${stationId}
      </span>
      <h2 class="text-3xl font-black leading-none uppercase mt-[10px]">${name}</h2>
      <div class="font-mono font-bold text-xs uppercase mt-2">${produto}</div>
      <div class="font-mono font-bold text-[4rem] leading-none tracking-tighter my-2" style="color: var(--fuel-color); -webkit-text-stroke: 1px var(--border-color, #000);">
        R$ ${price}
      </div>
      ${endereco ? `<div class="font-mono text-xs uppercase opacity-60 mt-2">${endereco}</div>` : ''}
      ${bairro ? `<div class="font-mono text-xs uppercase opacity-60">${bairro}</div>` : ''}
      ${municipio ? `<div class="font-mono text-xs uppercase opacity-60">${municipio}</div>` : ''}
      <div class="font-mono text-xs uppercase opacity-60 mt-2">
        Última atualização: Hoje, ${timeString}
      </div>
      <button id="buyButton" class="mt-6 w-full bg-white dark:bg-[#222222] border-brutal border-black dark:border-white py-4 px-6 font-black text-lg uppercase cursor-pointer shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3">
        <span class="text-2xl">⚡</span> COMPRAR AGORA
      </button>
    </div>
  `;

  document.getElementById('buyButton')?.addEventListener('click', openPaymentModal);

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
      <div class="font-mono font-bold text-[4rem] leading-none tracking-tighter my-2" style="color: var(--fuel-color); -webkit-text-stroke: 1px var(--border-color, #000);">
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
 * Renderiza os marcadores dos estados (preços fictícios baseados em Porto Velho)
 */
async function renderStateMarkers(): Promise<void> {
  if (!statesGroup || !map) {
    console.warn('[ESTADOS] Grupos não inicializados');
    return;
  }

  statesGroup.clearLayers();

  const fuelMultipliers: Record<string, number> = {
    'Gasolina': 1.0,
    'Aditivada': 1.05,
    'Etanol': 0.70,
    'Diesel': 0.90,
    'S10': 0.95,
    'Podium': 1.15,
  };
  const multiplier = fuelMultipliers[currentFuel] || 1.0;

  statesData.forEach((state) => {
    const basePrice = state.precoMedio * multiplier;
    const currentPrice = (basePrice * fatorDiario).toFixed(2);
    const cacheKey = `state-${state.uf}-${currentFuel}`;

    let marker = markerCache.get(cacheKey);
    if (!marker) {
      const brutalistIcon = createBrutalistIcon(currentPrice, 'estado');
      marker = L.marker([state.lat, state.lng], { icon: brutalistIcon });
      marker.on('click', () => {
        if (map) map.setView([state.lat, state.lng], 8);
        showStateInfo(state, currentPrice);
      });
      markerCache.set(cacheKey, marker);
    } else {
      // Update icon if fuel changed (though cache key includes fuel, so this is just incase)
      marker.setIcon(createBrutalistIcon(currentPrice, 'estado'));
    }

    statesGroup?.addLayer(marker);
  });
}

/**
 * Renderiza os marcadores dos municípios (Zoom 5-8)
 */
async function renderMunicipiosMarkers(): Promise<void> {
  if (!municipiosGroup || !map) return;

  municipiosGroup.clearLayers();

  const fuelMultipliers: Record<string, number> = {
    'Gasolina': 1.0,
    'Aditivada': 1.05,
    'Etanol': 0.70,
    'Diesel': 0.90,
    'S10': 0.95,
    'Podium': 1.15,
  };
  const multiplier = fuelMultipliers[currentFuel] || 1.0;

  // Filtra municípios visíveis
  const bounds = map.getBounds();
  const visibleMunicipios = municipiosBase.filter(m => bounds.contains([m.lat, m.lng]));

  visibleMunicipios.forEach((m) => {
    const basePrice = m.precoBaseGasolina * multiplier;
    const currentPrice = (basePrice * fatorDiario).toFixed(2);
    const cacheKey = `mun-${m.ibge}-${currentFuel}`;

    let marker = markerCache.get(cacheKey);
    if (!marker) {
      const brutalistIcon = createBrutalistIcon(currentPrice, 'municipio');
      marker = L.marker([m.lat, m.lng], { icon: brutalistIcon });
      marker.on('click', () => {
        if (map) map.setView([m.lat, m.lng], 12);
        // Reuse showStateInfo for now as the format is similar
        showStateInfo({ uf: m.uf, name: m.nome, lat: m.lat, lng: m.lng, precoMedio: m.precoBaseGasolina }, currentPrice);
      });
      markerCache.set(cacheKey, marker);
    } else {
      marker.setIcon(createBrutalistIcon(currentPrice, 'municipio'));
    }
    municipiosGroup?.addLayer(marker);
  });
}

/**
 * Busca postos de combustível (Porto Velho - fictícios)
 */
async function fetchStations(): Promise<void> {
  if (!map || !markersGroup) return;

  const statusBadge = document.getElementById('mapStatus');
  if (statusBadge) statusBadge.classList.add('active');

  markersGroup.clearLayers();

  const bounds = map.getBounds();
  const produtoKeyMap: Record<string, keyof PostoGeral['precos']> = {
    'Gasolina': 'gasolina',
    'Aditivada': 'aditivada',
    'Etanol': 'etanol',
    'Diesel': 'diesel',
    'S10': 's10',
    'Podium': 'podium',
  };
  const produtoKey = produtoKeyMap[currentFuel] || 'gasolina';

  // Usar todos os postos para escala global
  const postosVisiveis = todosPostos.filter(posto => bounds.contains([posto.lat, posto.lng]));

  postosVisiveis.forEach((posto) => {
    const currentPrice: string = posto.precos[produtoKey].toFixed(2);
    const cacheKey = `posto-${posto.id}-${currentFuel}`;

    let marker = markerCache.get(cacheKey);
    if (!marker) {
      const brutalistIcon = createBrutalistIcon(currentPrice, 'posto');
      marker = L.marker([posto.lat, posto.lng], { icon: brutalistIcon });
      marker.on('click', () => {
        currentStation = {
          id: posto.id,
          name: posto.nome,
          lat: posto.lat,
          lng: posto.lng,
          currentPrice,
          endereco: posto.endereco,
          bairro: posto.bairro,
          municipio: posto.municipio,
          produto: currentFuel,
        };
        updateStationView();
      });
      markerCache.set(cacheKey, marker);
    } else {
      marker.setIcon(createBrutalistIcon(currentPrice, 'posto'));
    }
    markersGroup?.addLayer(marker);
  });

  if (statusBadge) statusBadge.classList.remove('active');
}

/**
 * Alterna entre marcadores de estado e postos baseado no zoom
 */
async function handleZoomChange(): Promise<void> {
  if (!map || !markersGroup || !statesGroup || !municipiosGroup) return;

  const zoom = map.getZoom();

  if (zoom < 5) {
    if (map.hasLayer(markersGroup)) map.removeLayer(markersGroup);
    if (map.hasLayer(municipiosGroup)) map.removeLayer(municipiosGroup);
    if (!map.hasLayer(statesGroup)) map.addLayer(statesGroup);
    await renderStateMarkers();
  } else if (zoom >= 5 && zoom <= 8) {
    if (map.hasLayer(statesGroup)) map.removeLayer(statesGroup);
    if (map.hasLayer(markersGroup)) map.removeLayer(markersGroup);
    if (!map.hasLayer(municipiosGroup)) map.addLayer(municipiosGroup);
    await renderMunicipiosMarkers();
  } else {
    if (map.hasLayer(statesGroup)) map.removeLayer(statesGroup);
    if (map.hasLayer(municipiosGroup)) map.removeLayer(municipiosGroup);
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

  console.log(`[SYS] ${postosFicticiosCache.length} postos de Porto Velho carregados`);

  // Inicializa o mapa focado em Porto Velho, RO
  map = L.map('map', {
    zoomControl: false,
  });

  // Foca em Porto Velho no zoom 11
  map.setView([-8.7619, -63.9039], 11);

  // Define o estilo de mapa inicial baseado no dark mode
  const isDark: boolean = document.documentElement.classList.contains('dark');
  currentTileLayer = isDark ? cartoDark : cartoLight;
  currentTileLayer.addTo(map);

  // Camadas de grupo para marcadores
  markersGroup = L.layerGroup().addTo(map);
  statesGroup = L.layerGroup().addTo(map);
  municipiosGroup = L.layerGroup().addTo(map);

  // Evento: buscar novos postos ao mover o mapa (com debounce)
  map.on('moveend', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(async () => {
      if (map) await handleZoomChange();
    }, 200);
  });

  // Redimensionamento responsivo
  window.addEventListener('resize', () => {
    if (map) map.invalidateSize();
  });

  // Monitorar mudança de zoom
  map.on('zoomend', handleZoomChange);

  // Chama inicialmente após o mapa estar pronto
  setTimeout(async () => {
    if (map) {
      map.invalidateSize();
      await handleZoomChange();
    }
  }, 300);
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
      document.documentElement.setAttribute('data-fuel', fuelType.toLowerCase());

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

  // Modal Control
  const modal = document.getElementById('paymentModal');
  const closeBtn = document.getElementById('closeModal');
  
  closeBtn?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
}

/**
 * Abre o modal de pagamento
 */
function openPaymentModal(): void {
  const modal = document.getElementById('paymentModal');
  const modalContent = document.getElementById('modalContent');
  if (!modal || !modalContent || !currentStation) return;

  const price = currentStation.currentPrice;
  const stationName = currentStation.name;

  modal.classList.remove('hidden');
  
  // Initial View: Selection
  renderPaymentMethodSelection(modalContent, stationName, price);
}

function renderPaymentMethodSelection(container: HTMLElement, station: string, price: string): void {
  const priceNum = parseFloat(price);
  const serviceFee = 1.50;
  let liters = 20; // Valor padrão
  
  const updateContent = () => {
    const fuelTotal = liters * priceNum;
    const total = (fuelTotal + serviceFee).toFixed(2);
    
    container.innerHTML = `
      <h3 class="text-3xl font-black uppercase italic mb-1 tracking-tighter">RESERVA DE BICO</h3>
      <p class="font-mono text-xs opacity-60 uppercase mb-6">${station}</p>
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="bg-black text-white p-4 border-brutal border-white shadow-brutal-sm">
          <div class="font-mono text-[10px] uppercase opacity-60 mb-1">Preço / Litro</div>
          <div class="text-2xl font-black">R$ ${price}</div>
        </div>
        <div class="bg-black text-white p-4 border-brutal border-white shadow-brutal-sm">
          <div class="font-mono text-[10px] uppercase opacity-60 mb-1 text-accent-neon">Quantidade (L)</div>
          <input type="number" id="litersInput" value="${liters}" min="1" step="1" 
            class="bg-transparent text-2xl font-black w-full outline-none border-b-2 border-accent-neon text-accent-neon" />
        </div>
      </div>

      <div class="font-mono text-[10px] uppercase opacity-60 flex justify-between mb-2 px-1">
        <span>Subtotal Combustível: R$ ${fuelTotal.toFixed(2)}</span>
        <span>Taxa de Serviço: R$ ${serviceFee.toFixed(2)}</span>
      </div>

      <div class="bg-accent-neon text-black p-5 border-brutal border-black mb-6 shadow-brutal-sm">
        <div class="flex justify-between items-center">
          <div class="font-mono font-bold uppercase text-xs">Total a Pagar</div>
          <div id="totalDisplay" class="text-4xl font-black leading-none text-right">R$ ${total}</div>
        </div>
        <div class="text-[10px] font-mono font-bold uppercase text-right mt-1 opacity-60">
          + R$ ${serviceFee.toFixed(2)} TAXA DE SERVIÇO
        </div>
      </div>

      <div class="space-y-3">
        <button id="payPix" class="w-full border-brutal border-black dark:border-white p-4 font-black uppercase flex items-center gap-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group">
          <div class="w-10 h-10 border-2 border-black dark:border-white flex items-center justify-center group-hover:bg-accent-neon group-hover:border-black group-hover:text-black transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
          </div>
          <span>PIX (INSTANTÂNEO)</span>
        </button>
        <button id="payCard" class="w-full border-brutal border-black dark:border-white p-4 font-black uppercase flex items-center gap-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group">
          <div class="w-10 h-10 border-2 border-black dark:border-white flex items-center justify-center group-hover:bg-accent-neon group-hover:border-black group-hover:text-black transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
          </div>
          <span>CARTÃO DE CRÉDITO</span>
        </button>
      </div>

      <div class="mt-8 p-4 bg-[#f0f0f0] dark:bg-[#2a2a2a] border-l-brutal border-black dark:border-white">
        <h4 class="font-black text-xs uppercase mb-1 flex items-center gap-2">
          <span class="text-lg">⚠️</span> IMPORTANTE_INFO
        </h4>
        <p class="font-mono text-[11px] uppercase leading-snug font-bold">
          ESTA RESERVA GARANTE O PREÇO ATUAL POR <span class="text-red-600 dark:text-accent-neon">02 HORAS</span>. 
          APRESENTE O QR CODE OU COMPROVANTE DIGITAL AO FRENTISTA PARA LIBERAR O ABASTECIMENTO IMEDIATAMENTE.
        </p>
      </div>
    `;

    // Re-attach listeners
    const input = document.getElementById('litersInput') as HTMLInputElement;
    input?.addEventListener('input', (e) => {
      liters = parseFloat((e.target as HTMLInputElement).value) || 0;
      updateTotalDisplay();
    });

    document.getElementById('payPix')?.addEventListener('click', () => renderPixPayment(container, (liters * priceNum + serviceFee).toFixed(2)));
    document.getElementById('payCard')?.addEventListener('click', () => renderCardPayment(container, (liters * priceNum + serviceFee).toFixed(2)));
  };

  const updateTotalDisplay = () => {
    const fuelTotal = liters * priceNum;
    const total = (fuelTotal + serviceFee).toFixed(2);
    
    // Update Subtotal display if present
    const subtotalDisplay = container.querySelector('.px-1 span:first-child');
    if (subtotalDisplay) subtotalDisplay.textContent = `Subtotal Combustível: R$ ${fuelTotal.toFixed(2)}`;
    
    const totalDisplay = container.querySelector('#totalDisplay');
    if (totalDisplay) totalDisplay.textContent = `R$ ${total}`;
  };

  updateContent();
}

function renderPixPayment(container: HTMLElement, price: string): void {
  container.innerHTML = `
    <h3 class="text-2xl font-black uppercase italic mb-2">Pagamento via PIX</h3>
    <p class="font-mono text-xs opacity-60 uppercase mb-6">Escaneie o QR Code abaixo</p>
    
    <div class="bg-white p-4 border-brutal border-black flex flex-col items-center mb-6">
      <img src="C:/Users/gustavo.lobo/.gemini/antigravity/brain/a625fdab-5e23-4ab2-8488-43e786d8293f/qr_code_pix_1773693493555.png" alt="PIX QR Code" class="w-48 h-48 mb-4 grayscale contrast-125" />
      <div class="font-mono text-[10px] bg-black text-white px-2 py-1 uppercase tracking-widest">PIX_TOKEN: 8273x_RVM_FUEL</div>
      <div class="mt-4 font-black text-2xl">TOTAL: R$ ${price}</div>
    </div>

    <div class="bg-[#faff00] text-black p-4 border-brutal border-black mb-6 animate-pulse">
      <div class="font-mono text-xs font-bold uppercase text-center">Aguardando confirmação do banco...</div>
    </div>

    <button id="backToMethods" class="w-full border-brutal border-black dark:border-white p-2 font-mono font-bold text-xs uppercase hover:bg-black hover:text-white transition-all">
      VOLTAR
    </button>
  `;

  // Simulação de confirmação automática após 5 segundos para fins de demo
  setTimeout(() => renderSuccessScreen(container, price), 5000);

  document.getElementById('backToMethods')?.addEventListener('click', () => {
    if (currentStation) renderPaymentMethodSelection(container, currentStation.name, price);
  });
}

function renderCardPayment(container: HTMLElement, price: string): void {
  container.innerHTML = `
    <h3 class="text-2xl font-black uppercase italic mb-2">Cartão de Crédito</h3>
    <p class="font-mono text-xs opacity-60 uppercase mb-6">Insira os dados do cartão</p>
    
    <div class="space-y-4 mb-6">
      <input type="text" placeholder="NÚMERO DO CARTÃO" class="w-full bg-[#eee] dark:bg-[#222] border-brutal border-black dark:border-white p-4 font-mono font-bold text-sm" />
      <div class="grid grid-cols-2 gap-4">
        <input type="text" placeholder="VALIDADE" class="bg-[#eee] dark:bg-[#222] border-brutal border-black dark:border-white p-4 font-mono font-bold text-sm" />
        <input type="text" placeholder="CVV" class="bg-[#eee] dark:bg-[#222] border-brutal border-black dark:border-white p-4 font-mono font-bold text-sm" />
      </div>
      <input type="text" placeholder="NOME NO CARTÃO" class="w-full bg-[#eee] dark:bg-[#222] border-brutal border-black dark:border-white p-4 font-mono font-bold text-sm uppercase" />
    </div>

    <button id="confirmCard" class="w-full bg-black text-white p-4 font-black uppercase hover:bg-accent-neon hover:text-black transition-all">
      CONFIRMAR PAGAMENTO R$ ${price}
    </button>

    <button id="backToMethods" class="w-full border-brutal border-black dark:border-white p-2 font-mono font-bold text-xs uppercase mt-4 hover:bg-black hover:text-white transition-all">
      VOLTAR
    </button>
  `;

  document.getElementById('confirmCard')?.addEventListener('click', () => {
    const btn = document.getElementById('confirmCard') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerText = 'PROCESSANDO...';
    setTimeout(() => renderSuccessScreen(container, price), 2000);
  });

  document.getElementById('backToMethods')?.addEventListener('click', () => {
    if (currentStation) renderPaymentMethodSelection(container, currentStation.name, price);
  });
}

function renderSuccessScreen(container: HTMLElement, price: string): void {
  const protocol = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  container.innerHTML = `
    <div class="text-center py-10 animate-fadeIn">
      <div class="w-24 h-24 bg-accent-green text-black rounded-full flex items-center justify-center mx-auto mb-8 border-brutal border-black shadow-brutal">
        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"/></svg>
      </div>
      
      <h3 class="text-4xl font-black uppercase mb-2">PAGAMENTO<br/>CONFIRMADO!</h3>
      <p class="font-mono text-xs opacity-60 uppercase mb-8">Protocolo: #${protocol}</p>
      
      <div class="bg-black text-white p-6 border-brutal border-white mb-8 text-left">
        <div class="font-mono text-[10px] uppercase opacity-60 mb-2">Reserva Confirmada para:</div>
        <div class="font-black text-xl uppercase mb-4">${currentStation?.name}</div>
        <div class="flex justify-between border-t border-white/20 pt-4">
          <span class="font-mono text-xs uppercase">Total Pago:</span>
          <span class="font-black text-accent-neon text-xl">R$ ${price}</span>
        </div>
      </div>

      <div class="bg-[#eee] dark:bg-[#333] p-4 text-xs font-mono font-bold uppercase mb-8 leading-snug">
        O preço foi garantido por 2 horas. Apresente este protocolo no balcão ou diretamente no bico.
      </div>

      <button id="closeSuccess" class="w-full bg-black text-white py-4 font-black uppercase hover:bg-white hover:text-black border-brutal border-black transition-all shadow-brutal-sm">
        FECHAR E VOLTAR AO MAPA
      </button>
    </div>
  `;

  document.getElementById('closeSuccess')?.addEventListener('click', () => {
    document.getElementById('paymentModal')?.classList.add('hidden');
  });
}

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO (CORRIGIDO PARA VITE/ESM)
// ============================================

function bootstrap() {
  const mapElement = document.getElementById('map');
  if (mapElement) {
    document.documentElement.setAttribute('data-fuel', currentFuel.toLowerCase());
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
