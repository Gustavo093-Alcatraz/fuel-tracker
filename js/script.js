const body = document.body;
const modeToggle = document.getElementById('modeToggle');
const dynamicCard = document.getElementById('dynamicCard');
let currentFuel = "Gasolina";
let map;
let currentTileLayer;
let currentStation = null;
let markersGroup;
let statesGroup;

// Fator diário para simular flutuação de mercado a cada acesso (Variação entre -2% e +2%)
const fatorDiario = 1.00 + (Math.random() * 0.04 - 0.02);

// Dados dos 27 estados (coordenadas centrais e preço médio base da Gasolina)
const statesData = [
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
    { uf: 'TO', name: 'Tocantins', lat: -10.1753, lng: -48.2982, precoMedio: 6.48 }
];

// Definições de Camadas do Mapa (Tiles Minimalistas da CartoDB)
const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    subdomains: 'abcd',
    maxZoom: 20
});

const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    subdomains: 'abcd',
    maxZoom: 20
});

// --- LÓGICA DE SIMULAÇÃO DE PREÇOS ---
function simulatePrice(fuelType) {
    const baseGasolina = 5.80; // Preço base fictício
    let price = baseGasolina;

    switch (fuelType) {
        case 'Gasolina': price = baseGasolina; break;
        case 'Aditivada': price = baseGasolina * 1.05; break;
        case 'Etanol': price = baseGasolina * 0.70; break;
        case 'Diesel': price = baseGasolina * 0.90; break;
    }

    // Adiciona uma pequena variação randômica (+/- 10 centavos) para dar realismo entre os postos
    price += (Math.random() * 0.20 - 0.10);
    return price.toFixed(2);
}

// --- TAREFA 1 & 3: LEAFLET & MARCADORES DIVICON ---
async function initApp() {
    // Inicializa o mapa focado em Porto Velho, RO
    map = L.map('map', {
        zoomControl: false // Oculta o controle de zoom padrão para manter minimalismo
    });

    // O evento 'load' deve ser atrelado antes do primeiro 'setView'
    map.on('load', handleZoomChange);
    map.setView([-14.2350, -51.9253], 4);

    // Define o estilo de mapa inicial (Claro ou Escuro) baseado na classe do body
    const isDark = body.classList.contains('dark-mode');
    currentTileLayer = isDark ? cartoDark : cartoLight;
    currentTileLayer.addTo(map);

    // Camada de grupo para gerenciar os marcadores reais
    markersGroup = L.layerGroup().addTo(map);
    statesGroup = L.layerGroup().addTo(map);

    // Evento que dispara a busca de novos postos na API sempre que o usuário mover o mapa
    map.on('moveend', () => {
        if (map.getZoom() >= 7) fetchStations();
    });

    // Redimensionamento Automático Responsivo
    window.addEventListener('resize', () => {
        map.invalidateSize();
    });

    // Monitorar a mudança de zoom para alternar os marcadores
    map.on('zoomend', handleZoomChange);
}

function handleZoomChange() {
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

function renderStateMarkers() {
    statesGroup.clearLayers();

    statesData.forEach(state => {
        let basePrice = state.precoMedio;

        // Proporção de preço baseada no tipo de combustível selecionado
        switch (currentFuel) {
            case 'Gasolina': break;
            case 'Aditivada': basePrice *= 1.05; break;
            case 'Etanol': basePrice *= 0.70; break;
            case 'Diesel': basePrice *= 0.90; break;
        }

        const currentPrice = (basePrice * fatorDiario).toFixed(2);

        const brutalistIcon = L.divIcon({
            className: '', // Usa apenas as classes internas no HTML
            html: `<div class="pin">${currentPrice}</div>`,
            iconSize: [80, 80],
            iconAnchor: [40, 80]
        });

        const marker = L.marker([state.lat, state.lng], { icon: brutalistIcon }).addTo(statesGroup);

        // Evento prático: ao clicar no pino do estado, o mapa aproxima a câmera daquela região
        marker.on('click', () => map.setView([state.lat, state.lng], 8));
    });
}

async function fetchStations() {
    // Evita chamadas excessivas na API se o zoom estiver muito distante
    if (map.getZoom() < 7) return;

    const statusBadge = document.getElementById('mapStatus');
    statusBadge.classList.add('active');

    // Limpa todos os marcadores antigos da tela
    markersGroup.clearLayers();

    const bounds = map.getBounds();
    const sul = bounds.getSouth();
    const oeste = bounds.getWest();
    const norte = bounds.getNorth();
    const leste = bounds.getEast();

    // Query Overpass formatada conforme exigido
    const query = `[out:json][timeout:25];(node"amenity"="fuel";way"amenity"="fuel";);out center;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        data.elements.forEach(element => {
            // Garante captura de coordenadas tanto para 'node' quanto para 'way' (via out center)
            const lat = element.lat || element.center.lat;
            const lon = element.lon || element.center.lon;

            const name = element.tags?.name || element.tags?.brand || "Posto Independente";
            const currentPrice = simulatePrice(currentFuel);

            const station = { id: element.id, name: name, lat: lat, lng: lon, currentPrice: currentPrice };

            // Instancia o Pin usando o L.divIcon com a div do CSS Brutalista
            const brutalistIcon = L.divIcon({
                className: '', // Removido leaflet-brutalist-marker para não sobrescrever a div .pin interna
                html: `<div class="pin">${currentPrice}</div>`,
                iconSize: [80, 80],
                iconAnchor: [40, 80] // Ajuste para a ponta do pino tocar exatamente a coordenada
            });

            const marker = L.marker([lat, lon], { icon: brutalistIcon }).addTo(markersGroup);

            marker.on('click', () => { currentStation = station; updateStationView(); });
        });
    } catch (error) {
        console.error('[SYS] Erro ao buscar dados na Overpass API:', error);
    } finally {
        statusBadge.classList.remove('active');
    }
}

// Inicia a Aplicação
initApp();

// Atualiza a Sidebar com base no posto selecionado
function updateStationView() {
    if (!currentStation) return;
    const displayedPrice = currentStation.currentPrice || simulatePrice(currentFuel);
    showPost(currentStation.name, `R$ ${displayedPrice}`);
}

// Toggle Dark Mode
modeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    modeToggle.innerText = isDark ? "MODE: DARK" : "MODE: LIGHT";

    // Troca a camada visual do Leaflet dinamicamente
    if (map) {
        map.removeLayer(currentTileLayer);
        currentTileLayer = isDark ? cartoDark : cartoLight;
        currentTileLayer.addTo(map);
    }
});

// Set Active Fuel Type
// (Tornado global anexando em window para ser acessível aos onClick do HTML)
window.setFuel = function (btn, type) {
    document.querySelectorAll('.fuel-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFuel = type;

    // Atualiza a visualização do mapa dependendo do nível de zoom atual
    if (map.getZoom() < 7) {
        renderStateMarkers();
    } else {
        fetchStations();
    }

    // Recalcula o preço automaticamente se um posto já estiver em foco
    if (currentStation) {
        updateStationView();
    }
};

// Show Post Details
window.showPost = function (name, price) {
    dynamicCard.classList.remove('empty');

    const now = new Date();
    const timeString = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0');
    const stationId = currentStation ? currentStation.id : 'N/A';

    dynamicCard.innerHTML = `
        <div class="post-details">
            <span class="filter-label" style="color: var(--accent-color); background: #000; padding: 2px 5px;">OSM_NODE_${stationId}</span>
            <h2 style="margin-top: 10px">${name}</h2>
            <div class="filter-label">${currentFuel}</div>
            <div class="price-tag">${price}</div>
            <div class="update-time">Última atualização: Hoje, ${timeString}</div>
        </div>
    `;

    // Visual feedback on click
    const card = document.querySelector('.post-details');
    card.style.animation = 'none';
    card.offsetHeight; /* trigger reflow */
    card.style.animation = 'fadeIn 0.3s ease';
}
