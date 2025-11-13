import type { EcoPonto } from "../services/api";

/**
 * MOTOR 1: CÁLCULO DE DISTÂNCIA (Fórmula de Haversine)
 */
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em km
}
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * MOTOR 2: (SIMPLIFICADO)
 * A lógica de "Aberto/Fechado" foi removida.
 */

/**
 * Função principal que o nosso App vai usar.
 * Recebe a lista da API e a localização do utilizador.
 * Retorna a lista ORDENADA.
 */
export type EcoPontoProcessado = EcoPonto & {
  distanciaKm: number;
};

export function processarEcopontos(
  lista: EcoPonto[],
  userCoords: [number, number]
): EcoPontoProcessado[] {
  const [userLat, userLon] = userCoords;

  const processados = lista.map((ponto) => {
    // 1. Calcula a distância
    const distanciaKm = getDistance(
      userLat,
      userLon,
      ponto.latitude,
      ponto.longitude
    );

    return {
      ...ponto,
      distanciaKm: distanciaKm,
    };
  });

  // 2. Ordena a lista (mais perto primeiro)
  processados.sort((a, b) => a.distanciaKm - b.distanciaKm);

  return processados;
}
