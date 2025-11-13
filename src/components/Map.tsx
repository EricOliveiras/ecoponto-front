import { useState, useEffect, Fragment } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import { Dialog, Transition } from "@headlessui/react";
import { Info, X, Battery, Droplet, Computer } from "lucide-react";

import { fetchEcopontos, type EcoPonto } from "../services/api";
import { useMapStore } from "../store/mapStore";
import { DetalheSidebar } from "../components/DetalheSidebar";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const APP_TITLE = import.meta.env.VITE_APP_TITLE || "EcoPonto";
const DEFAULT_LAT = parseFloat(
  import.meta.env.VITE_DEFAULT_MAP_LAT || "-1.359"
);
const DEFAULT_LON = parseFloat(
  import.meta.env.VITE_DEFAULT_MAP_LON || "-48.488"
);
const DEFAULT_ZOOM = parseFloat(import.meta.env.VITE_DEFAULT_MAP_ZOOM || "12");

const DEFAULT_COORDS: [number, number] = [DEFAULT_LAT, DEFAULT_LON];

const tiposDeFiltro = [
  { value: "todos", label: "Todos os Tipos" },
  { value: "pilha", label: "Pilhas e Baterias" },
  { value: "oleo", label: "Óleo de Cozinha" },
  { value: "eletronico", label: "Eletrônicos" },
];

export function MapComponent() {
  const [ecopontos, setEcopontos] = useState<EcoPonto[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [buscaCoords, setBuscaCoords] = useState<[number, number] | null>(null);

  const [viewState, setViewState] = useState({
    longitude: DEFAULT_LON,
    latitude: DEFAULT_LAT,
    zoom: DEFAULT_ZOOM,
  });

  const { setSelectedEcoponto, closeSidebar } = useMapStore();

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Efeitos (sem mudanças)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setViewState((prev) => ({ ...prev, latitude, longitude, zoom: 14 }));
        setBuscaCoords([latitude, longitude]);
      },
      () => {
        console.warn("Geolocalização falhou. Usando localização padrão.");
        setBuscaCoords(DEFAULT_COORDS);
      }
    );
  }, []);

  useEffect(() => {
    if (buscaCoords) {
      const [lat, lon] = buscaCoords;
      console.log(`Buscando ${tipoFiltro} perto de ${lat}, ${lon}`);

      fetchEcopontos(lat, lon, tipoFiltro).then((pontos) => {
        setEcopontos(pontos);
      });
    }
  }, [buscaCoords, tipoFiltro]);

  return (
    <div className="relative w-screen h-screen" onClick={closeSidebar}>
      {/* --- ATUALIZAÇÃO AQUI --- */}
      {/* Cabeçalho (Movido para 'bottom-4' por defeito, e 'top-4' em ecrãs médios 'md') */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:top-4 md:bottom-auto z-[1000] p-3 sm:p-4 bg-white rounded-lg shadow-xl flex items-center space-x-2 sm:space-x-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">
          {APP_TITLE}
        </h1>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsInfoModalOpen(true);
          }}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none"
          title="Sobre o projeto"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* --- ATUALIZAÇÃO AQUI --- */}
      {/* Filtro (Agora 'top-4' em todos os ecrãs, o que é limpo) */}
      <div className="absolute top-4 right-4 z-[1000] shadow-lg">
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className="p-2 text-base sm:text-lg rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 bg-white"
        >
          {tiposDeFiltro.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sidebar de Detalhes (já está responsiva) */}
      <DetalheSidebar />

      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-left" />

        {ecopontos.map((ponto) => (
          <Marker
            key={ponto.id}
            longitude={ponto.longitude}
            latitude={ponto.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedEcoponto(ponto);
            }}
          />
        ))}
      </Map>

      {/* Modal de Informações (ODS 4/12) - (sem mudanças) */}
      <Transition appear show={isInfoModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[2000]"
          onClose={() => setIsInfoModalOpen(false)}
        >
          {/* ... (Conteúdo do Modal - sem mudanças) ... */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900 flex justify-between items-center"
                  >
                    <span>Como Descartar Corretamente?</span>
                    <button
                      onClick={() => setIsInfoModalOpen(false)}
                      className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Title>

                  <div className="mt-4 space-y-6">
                    <p className="text-sm text-gray-600">
                      Este mapa ajuda-o a encontrar locais para o descarte
                      responsável (ODS 12), promovendo a educação para a
                      sustentabilidade (ODS 4).
                    </p>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-600">
                        <Battery className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Pilhas e Baterias
                        </h4>
                        <p className="text-sm text-gray-600">
                          Nunca jogue no lixo comum. Elas contêm metais pesados
                          (chumbo, mercúrio) que contaminam o solo e a água. Use
                          o filtro "Pilhas" para encontrar o ponto de coleta
                          mais próximo.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                        <Droplet className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Óleo de Cozinha
                        </h4>
                        <p className="text-sm text-gray-600">
                          1 litro de óleo pode contaminar 25.000 litros de água.
                          Guarde o óleo usado em garrafas PET e leve a um ponto
                          de coleta "Óleo".
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Computer className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Lixo Eletrónico (E-Lixo)
                        </h4>
                        <p className="text-sm text-gray-600">
                          Telemóveis, computadores, cabos e carregadores velhos
                          contêm plásticos e metais valiosos que podem (e devem)
                          ser reciclados. Use o filtro "Eletrónico".
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none"
                      onClick={() => setIsInfoModalOpen(false)}
                    >
                      Entendido!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
