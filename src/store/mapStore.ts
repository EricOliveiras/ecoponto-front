import { create } from "zustand";
import type { EcoPonto } from "../services/api"; // Importa a nossa interface

// Interface completa do nosso estado global
interface MapState {
  // Para a sidebar de DETALHES (que mostra a foto)
  selectedEcoponto: EcoPonto | null;
  isSidebarOpen: boolean;
  setSelectedEcoponto: (ponto: EcoPonto) => void;
  closeSidebar: () => void;

  // Para a sidebar de LISTA (que mostra a lista ordenada)
  isListOpen: boolean;
  setIsListOpen: (isOpen: boolean) => void;

  // Para destacar o item na lista e dar zoom
  activeEcopontoId: string | null;
  setActiveEcopontoId: (id: string | null) => void;
}

// Cria o "hook" do Zustand com todas as funções
export const useMapStore = create<MapState>((set) => ({
  // Estado inicial
  selectedEcoponto: null,
  isSidebarOpen: false,
  isListOpen: false,
  activeEcopontoId: null,

  // Ações da sidebar de DETALHES
  setSelectedEcoponto: (ponto) =>
    set({
      selectedEcoponto: ponto,
      isSidebarOpen: true,
      activeEcopontoId: ponto.id, // Ativa o item na lista também
    }),
  closeSidebar: () =>
    set({
      selectedEcoponto: null,
      isSidebarOpen: false,
      activeEcopontoId: null, // Desativa o item
    }),

  // Ações da sidebar de LISTA
  setIsListOpen: (isOpen) => set({ isListOpen: isOpen }),

  // Ações do item ATIVO
  setActiveEcopontoId: (id) => set({ activeEcopontoId: id }),
}));
