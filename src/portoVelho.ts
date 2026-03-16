/**
 * Postos fictícios de Porto Velho - RO
 * 30 postos com coordenadas e preços realistas
 */

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

// Bairros de Porto Velho
const bairros = [
  { nome: 'Centro', lat: -8.7619, lng: -63.9039 },
  { nome: 'Jardim das Palmeiras', lat: -8.7550, lng: -63.9100 },
  { nome: 'Pedrinhas', lat: -8.7480, lng: -63.8950 },
  { nome: 'São Cristovão', lat: -8.7700, lng: -63.9150 },
  { nome: 'Liberdade', lat: -8.7650, lng: -63.8900 },
  { nome: 'Flamengo', lat: -8.7800, lng: -63.9200 },
  { nome: 'Aeroporto', lat: -8.7400, lng: -63.9300 },
  { nome: 'Industrial', lat: -8.7900, lng: -63.8800 },
  { nome: 'Nova Porto Velho', lat: -8.7350, lng: -63.9100 },
  { nome: 'Triângulo', lat: -8.7550, lng: -63.8850 },
  { nome: 'Olaria', lat: -8.7750, lng: -63.8950 },
  { nome: 'Costa e Silva', lat: -8.7500, lng: -63.9250 },
  { nome: 'Jardim dos Estados', lat: -8.7680, lng: -63.8780 },
  { nome: 'Vila Embratel', lat: -8.7300, lng: -63.9050 },
  { nome: 'Cohab', lat: -8.7850, lng: -63.9100 },
];

const nomesPostos = [
  'Posto São José', 'Posto Central', 'Posto do Bairro', 'Posto Avenida',
  'Posto Brasil', 'Posto Nacional', 'Posto Petróleo', 'Posto Combustíveis',
  'Auto Posto', 'Posto 24 Horas', 'Posto Rodovia', 'Posto Express',
  'Posto Econômico', 'Posto Popular', 'Posto Amigo', 'Posto Confiança',
  'Posto Qualidade', 'Posto Rápido', 'Posto Fácil', 'Posto Direto',
  'Posto Capital', 'Posto Metrópole', 'Posto Cidade', 'Posto Regional',
  'Posto Estação', 'Posto Ponto', 'Posto Lugar', 'Posto Porto',
  'Posto Madeira', 'Posto Rondônia',
];

const bandeiras = [
  'Shell', 'Petrobras', 'Ipiranga', 'Ale', 'BR',
  'Posto Independente', 'Raízen',
];

const ruas = [
  'Av. Carlos Gomes', 'Av. Jorge Teixeira', 'Av. Lauro Sodré',
  'Av. Sete de Setembro', 'Rua José Bonifácio', 'Rua Marechal Deodoro',
  'Av. Guaporé', 'Av. Brasil', 'Rua Dom Pedro II', 'Av. Presidente Dutra',
  'Rua Barão do Solimões', 'Av. Beira Rio', 'Rua João Pessoa',
  'Av. Tancredo Neves', 'Rua Getúlio Vargas',
];

/**
 * Gera os 30 postos de Porto Velho
 */
export function gerarPostosPortoVelho(): PostoFicticio[] {
  const postos: PostoFicticio[] = [];

  // Preço base de Porto Velho (mais alto devido ao transporte)
  const precoBaseGasolina = 6.89;

  for (let i = 0; i < 30; i++) {
    const bairro = bairros[i % bairros.length];

    // Variação de preço realista (± R$ 0,25)
    const variacao = (Math.random() * 0.50) - 0.25;
    const precoGasolina = precoBaseGasolina + variacao;

    // Outros combustíveis
    const precos = {
      gasolina: precoGasolina,
      aditivada: precoGasolina * 1.05,
      etanol: precoGasolina * 0.70,
      diesel: precoGasolina * 0.90,
      s10: precoGasolina * 0.95,
      podium: precoGasolina * 1.15,
    };

    // Pequena variação nas coordenadas dentro do bairro
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;

    const nomeBandeira = bandeiras[Math.floor(Math.random() * bandeiras.length)];
    const nomePosto = nomesPostos[i];

    postos.push({
      id: 110020500 + i, // IBGE de Porto Velho + índice
      nome: nomeBandeira === 'Posto Independente' ? nomePosto : `${nomeBandeira} - ${nomePosto}`,
      endereco: `${ruas[Math.floor(Math.random() * ruas.length)]}, ${Math.floor(Math.random() * 2000) + 100}`,
      bairro: bairro.nome,
      municipio: 'Porto Velho',
      uf: 'RO',
      lat: bairro.lat + latOffset,
      lng: bairro.lng + lngOffset,
      precos,
    });
  }

  return postos;
}

/**
 * Postos pré-gerados de Porto Velho
 */
export const postosPortoVelho: PostoFicticio[] = gerarPostosPortoVelho();
