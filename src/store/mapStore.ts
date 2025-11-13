import { create } from "zustand";
import type { EcoPonto } from "../services/api";

// Interface do nosso estado global
interface MapState {
  selectedEcoponto: EcoPonto | null;
  setSelectedEcoponto: (ponto: EcoPonto | null) => void;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

// Cria o "hook" do Zustand
export const useMapStore = create<MapState>((set) => ({
  // O ponto que está selecionado
  selectedEcoponto: null,
  // A sidebar está aberta?
  isSidebarOpen: false,

  // Ação para selecionar um ponto
  setSelectedEcoponto: (ponto) =>
    set({ selectedEcoponto: ponto, isSidebarOpen: ponto !== null }),

  // Ação para abrir a sidebar (usado pelo 'set')
  openSidebar: () => set({ isSidebarOpen: true }),

  // Ação para fechar a sidebar
  closeSidebar: () => set({ isSidebarOpen: false, selectedEcoponto: null }),
}));
