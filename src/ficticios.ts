/**
 * Gerador de postos fictícios realistas para municípios brasileiros
 * Gera pelo menos 10 postos por município com preços coerentes
 */

export interface MunicipioData {
  ibge: string;
  nome: string;
  uf: string;
  lat: number;
  lng: number;
  precoBaseGasolina: number;
}

export interface PostoFicticio {
  id: number;
  nome: string;
  endereco: string;
  bairro: string;
  municipio: string;
  uf: string;
  lat: number;
  lng: number;
  precos: {
    gasolina: number;
    aditivada: number;
    etanol: number;
    diesel: number;
    s10: number;
    podium: number;
  };
}

// Capitais e principais cidades por estado (dados básicos)
export const municipiosBase: MunicipioData[] = [
  // Rondônia
  { ibge: '1100205', nome: 'Porto Velho', uf: 'RO', lat: -8.7619, lng: -63.9039, precoBaseGasolina: 6.89 },
  { ibge: '1100106', nome: 'Cacoal', uf: 'RO', lat: -11.4342, lng: -61.4462, precoBaseGasolina: 6.79 },
  { ibge: '1100114', nome: 'Ji-Paraná', uf: 'RO', lat: -10.8875, lng: -61.9531, precoBaseGasolina: 6.85 },
  { ibge: '1100122', nome: 'Ariquemes', uf: 'RO', lat: -9.9139, lng: -63.0408, precoBaseGasolina: 6.92 },
  { ibge: '1100130', nome: 'Vilhena', uf: 'RO', lat: -12.7389, lng: -60.1458, precoBaseGasolina: 6.95 },

  // Acre
  { ibge: '1200401', nome: 'Rio Branco', uf: 'AC', lat: -9.9747, lng: -67.8243, precoBaseGasolina: 7.49 },

  // Amazonas
  { ibge: '1302603', nome: 'Manaus', uf: 'AM', lat: -3.1019, lng: -60.0250, precoBaseGasolina: 6.80 },
  { ibge: '1300607', nome: 'Parintins', uf: 'AM', lat: -2.6281, lng: -56.7369, precoBaseGasolina: 7.10 },

  // ... (adicionar mais cidades conforme necessário)

  // São Paulo (exemplo de como expandir)
  { ibge: '3550308', nome: 'São Paulo', uf: 'SP', lat: -23.5505, lng: -46.6333, precoBaseGasolina: 6.00 },
  { ibge: '3509502', nome: 'Campinas', uf: 'SP', lat: -22.9099, lng: -47.0626, precoBaseGasolina: 5.95 },
  { ibge: '3518800', nome: 'Guarulhos', uf: 'SP', lat: -23.4538, lng: -46.5333, precoBaseGasolina: 5.98 },

  // Rio de Janeiro
  { ibge: '3304557', nome: 'Rio de Janeiro', uf: 'RJ', lat: -22.9068, lng: -43.1729, precoBaseGasolina: 5.95 },
  { ibge: '3303906', nome: 'Niterói', uf: 'RJ', lat: -22.8833, lng: -43.1036, precoBaseGasolina: 5.98 },

  // Minas Gerais
  { ibge: '3106200', nome: 'Belo Horizonte', uf: 'MG', lat: -19.9167, lng: -43.9345, precoBaseGasolina: 5.98 },
  { ibge: '3106705', nome: 'Betim', uf: 'MG', lat: -19.9678, lng: -44.1983, precoBaseGasolina: 5.95 },

  // Rio Grande do Sul
  { ibge: '4314902', nome: 'Porto Alegre', uf: 'RS', lat: -30.0346, lng: -51.2177, precoBaseGasolina: 6.05 },
  { ibge: '4309209', nome: 'Caxias do Sul', uf: 'RS', lat: -29.1678, lng: -51.1794, precoBaseGasolina: 6.08 },

  // Paraná
  { ibge: '4106902', nome: 'Curitiba', uf: 'PR', lat: -25.4284, lng: -49.2733, precoBaseGasolina: 6.09 },
  { ibge: '4104808', nome: 'Londrina', uf: 'PR', lat: -23.3045, lng: -51.1696, precoBaseGasolina: 6.12 },

  // Bahia
  { ibge: '2927408', nome: 'Salvador', uf: 'BA', lat: -12.9714, lng: -38.5014, precoBaseGasolina: 6.45 },
  { ibge: '2905701', nome: 'Feira de Santana', uf: 'BA', lat: -12.2664, lng: -38.9663, precoBaseGasolina: 6.40 },

  // Ceará
  { ibge: '2304400', nome: 'Fortaleza', uf: 'CE', lat: -3.7319, lng: -38.5267, precoBaseGasolina: 6.30 },

  // Pernambuco
  { ibge: '2602902', nome: 'Recife', uf: 'PE', lat: -8.0476, lng: -34.8770, precoBaseGasolina: 6.25 },

  // Goiás
  { ibge: '5208707', nome: 'Goiânia', uf: 'GO', lat: -16.6869, lng: -49.2648, precoBaseGasolina: 6.05 },

  // Mato Grosso
  { ibge: '5103403', nome: 'Cuiabá', uf: 'MT', lat: -15.6014, lng: -56.0979, precoBaseGasolina: 6.35 },

  // Mato Grosso do Sul
  { ibge: '5002704', nome: 'Campo Grande', uf: 'MS', lat: -20.4428, lng: -54.6464, precoBaseGasolina: 6.12 },

  // Distrito Federal
  { ibge: '5300108', nome: 'Brasília', uf: 'DF', lat: -15.7939, lng: -47.8828, precoBaseGasolina: 5.99 },

  // Espírito Santo
  { ibge: '3205309', nome: 'Vitória', uf: 'ES', lat: -20.3155, lng: -40.3128, precoBaseGasolina: 6.10 },

  // Santa Catarina
  { ibge: '4205407', nome: 'Florianópolis', uf: 'SC', lat: -27.5954, lng: -48.5480, precoBaseGasolina: 6.15 },

  // Paraíba
  { ibge: '2507507', nome: 'João Pessoa', uf: 'PB', lat: -7.1153, lng: -34.8631, precoBaseGasolina: 6.18 },

  // Rio Grande do Norte
  { ibge: '2408102', nome: 'Natal', uf: 'RN', lat: -5.7945, lng: -35.2110, precoBaseGasolina: 6.45 },

  // Alagoas
  { ibge: '2700308', nome: 'Maceió', uf: 'AL', lat: -9.6658, lng: -35.7353, precoBaseGasolina: 6.15 },

  // Sergipe
  { ibge: '2800308', nome: 'Aracaju', uf: 'SE', lat: -10.9091, lng: -37.0677, precoBaseGasolina: 6.22 },

  // Piauí
  { ibge: '2205003', nome: 'Teresina', uf: 'PI', lat: -5.0892, lng: -42.8019, precoBaseGasolina: 6.32 },

  // Maranhão
  { ibge: '2104009', nome: 'São Luís', uf: 'MA', lat: -2.5297, lng: -44.3028, precoBaseGasolina: 6.20 },

  // Tocantins
  { ibge: '1721000', nome: 'Palmas', uf: 'TO', lat: -10.1689, lng: -48.3317, precoBaseGasolina: 6.48 },

  // Roraima
  { ibge: '1400100', nome: 'Boa Vista', uf: 'RR', lat: 2.8235, lng: -60.6758, precoBaseGasolina: 6.60 },

  // Amapá
  { ibge: '1600303', nome: 'Macapá', uf: 'AP', lat: 0.0389, lng: -51.0664, precoBaseGasolina: 5.95 },

  // Pará
  { ibge: '1501402', nome: 'Belém', uf: 'PA', lat: -1.4558, lng: -48.5039, precoBaseGasolina: 6.40 },
];

/**
 * Nomes fictícios de postos (combinações realistas)
 */
const nomesPostos = [
  'Posto São José', 'Posto Central', 'Posto do Bairro', 'Posto Avenida',
  'Posto Brasil', 'Posto Nacional', 'Posto Petróleo', 'Posto Combustíveis',
  'Auto Posto', 'Posto 24 Horas', 'Posto Rodovia', 'Posto Express',
  'Posto Econômico', 'Posto Popular', 'Posto Amigo', 'Posto Confiança',
  'Posto Qualidade', 'Posto Rápido', 'Posto Fácil', 'Posto Direto',
  'Posto Capital', 'Posto Metrópole', 'Posto Cidade', 'Posto Regional',
  'Posto Estação', 'Posto Ponto', 'Posto Lugar', 'Posto Centro',
  'Posto Norte', 'Posto Sul', 'Posto Leste', 'Posto Oeste',
];

const bandeiras = [
  'Shell', 'Petrobras', 'Ipiranga', 'Ale', 'BR',
  'Posto Independente', 'Raízen', 'Replan',
];

const bairros = [
  'Centro', 'Jardins', 'Vila Nova', 'Parque', 'Jardim',
  'Bairro Industrial', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste',
  'Residencial', 'Comercial', 'Vila', 'Jardim América', 'Jardim Europa',
];

const ruas = [
  'Av. Principal', 'Rua das Flores', 'Av. Brasil', 'Rua Central',
  'Av. da Saudade', 'Rua do Comércio', 'Av. Independência',
  'Rua 15 de Novembro', 'Av. São Paulo', 'Rua Minas Gerais',
];

/**
 * Gera postos fictícios para um município
 * @param municipio Dados do município
 * @param quantidade Quantidade de postos (padrão: 12)
 */
export function gerarPostosFicticios(
  municipio: MunicipioData,
  quantidade: number = 12
): PostoFicticio[] {
  const postos: PostoFicticio[] = [];

  for (let i = 0; i < quantidade; i++) {
    // Variação de preço realista (± R$ 0,30 do base)
    const variacaoGasolina = (Math.random() * 0.60) - 0.30;
    const precoGasolina = municipio.precoBaseGasolina + variacaoGasolina;

    // Outros combustíveis baseados na gasolina
    const precos = {
      gasolina: precoGasolina,
      aditivada: precoGasolina * 1.05,
      etanol: precoGasolina * 0.70,
      diesel: precoGasolina * 0.90,
      s10: precoGasolina * 0.95,
      podium: precoGasolina * 1.15,
    };

    // Gera coordenadas próximas ao centro do município (raio de ~5km)
    const latOffset = (Math.random() - 0.5) * 0.09; // ~5km
    const lngOffset = (Math.random() - 0.5) * 0.09;

    const nomeBandeira = bandeiras[Math.floor(Math.random() * bandeiras.length)];
    const nomePosto = `${nomesPostos[Math.floor(Math.random() * nomesPostos.length)]} ${i + 1}`;

    postos.push({
      id: parseInt(municipio.ibge) * 100 + i,
      nome: nomeBandeira === 'Posto Independente' ? nomePosto : `${nomeBandeira} - ${nomePosto}`,
      endereco: `${ruas[Math.floor(Math.random() * ruas.length)]}, ${Math.floor(Math.random() * 1000)}`,
      bairro: bairros[Math.floor(Math.random() * bairros.length)],
      municipio: municipio.nome,
      uf: municipio.uf,
      lat: municipio.lat + latOffset,
      lng: municipio.lng + lngOffset,
      precos,
    });
  }

  return postos;
}

/**
 * Gera postos para todos os municípios
 */
export function gerarTodosPostos(quantidadePorMunicipio: number = 12): PostoFicticio[] {
  const todosPostos: PostoFicticio[] = [];

  for (const municipio of municipiosBase) {
    const postos = gerarPostosFicticios(municipio, quantidadePorMunicipio);
    todosPostos.push(...postos);
  }

  return todosPostos;
}

/**
 * Busca postos próximos a uma coordenada
 */
export function buscarPostosProximos(
  lat: number,
  lng: number,
  raio: number = 0.1, // ~10km
  postos: PostoFicticio[]
): PostoFicticio[] {
  return postos.filter(posto => {
    const dLat = posto.lat - lat;
    const dLng = posto.lng - lng;
    const distancia = Math.sqrt(dLat * dLat + dLng * dLng);
    return distancia <= raio;
  });
}

/**
 * Calcula preço médio por estado
 */
export function calcularPrecoMedioEstado(
  uf: string,
  produto: keyof PostoFicticio['precos'],
  postos: PostoFicticio[]
): number | null {
  const postosEstado = postos.filter(p => p.uf === uf);
  if (postosEstado.length === 0) return null;

  const soma = postosEstado.reduce((acc, p) => acc + p.precos[produto], 0);
  return soma / postosEstado.length;
}
/**
 * Todos os postos gerados
 */
export const todosPostos: PostoFicticio[] = gerarTodosPostos();
