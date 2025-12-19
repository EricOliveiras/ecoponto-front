import { useState, useEffect, Fragment } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import {
  Dialog,
  Transition,
  Tab,
  TransitionChild,
  DialogPanel,
  TabGroup,
  TabList,
  TabPanels,
  TabPanel,
} from "@headlessui/react";
import {
  Info,
  X,
  Battery,
  Droplet,
  Computer,
  Menu,
  Clock,
  Linkedin,
  Github,
  MapPin, // Adicionado para o ícone de localização do usuário
} from "lucide-react";

import {
  processarEcopontos,
  type EcoPontoProcessado,
} from "../utils/ecopontoUtils";
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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function MapPage() {
  const [listaOriginal, setListaOriginal] = useState<EcoPonto[]>([]);
  const [listaProcessada, setListaProcessada] = useState<EcoPontoProcessado[]>(
    []
  );

  const [tipoFiltro, setTipoFiltro] = useState("todos");

  // Tenta carregar a localização salva no localStorage ao iniciar
  const [userCoords, setUserCoords] = useState<[number, number] | null>(() => {
    const saved = localStorage.getItem("user_location");
    return saved ? JSON.parse(saved) : null;
  });

  const [viewState, setViewState] = useState({
    longitude: userCoords ? userCoords[1] : DEFAULT_LON,
    latitude: userCoords ? userCoords[0] : DEFAULT_LAT,
    zoom: userCoords ? 14 : DEFAULT_ZOOM,
  });

  const {
    activeEcopontoId,
    setSelectedEcoponto,
    closeSidebar,
    isListOpen,
    setIsListOpen,
  } = useMapStore();

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Efeito 1: Obter a localização precisa e salvar no localStorage
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords: [number, number] = [latitude, longitude];

        setViewState((prev) => ({ ...prev, latitude, longitude, zoom: 14 }));
        setUserCoords(coords);

        // Salva para uso futuro
        localStorage.setItem("user_location", JSON.stringify(coords));
      },
      () => {
        console.warn(
          "Geolocalização falhou. Usando localização padrão ou salva."
        );
        if (!userCoords) setUserCoords(DEFAULT_COORDS);
      },
      {
        enableHighAccuracy: true, // Garante a maior precisão possível (GPS)
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Efeito 2: Buscar Ecopontos
  useEffect(() => {
    if (userCoords) {
      const [lat, lon] = userCoords;
      fetchEcopontos(lat, lon, tipoFiltro).then((pontos) => {
        setListaOriginal(pontos);
      });
    }
  }, [userCoords, tipoFiltro]);

  // Efeito 3: Processar os Ecopontos
  useEffect(() => {
    if (userCoords && listaOriginal) {
      const processados = processarEcopontos(listaOriginal, userCoords);
      setListaProcessada(processados);
    } else {
      setListaProcessada([]);
    }
  }, [listaOriginal, userCoords]);

  // Efeito 4: Mover o mapa quando um item da lista é clicado
  useEffect(() => {
    if (activeEcopontoId) {
      const pontoAtivo = listaProcessada.find((p) => p.id === activeEcopontoId);
      if (pontoAtivo) {
        setViewState({
          latitude: pontoAtivo.latitude,
          longitude: pontoAtivo.longitude,
          zoom: 16,
        });
      }
    }
  }, [activeEcopontoId, listaProcessada]);

  return (
    <div className="relative w-screen h-screen" onClick={closeSidebar}>
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

      {/* Filtro */}
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

      {/* Botão de Lista */}
      <div className="absolute top-4 left-4 z-[1000] shadow-lg">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsListOpen(true);
          }}
          className="p-3 bg-white rounded-md text-gray-700 hover:bg-gray-100"
          title="Ver lista de Ecopontos"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <DetalheSidebar />

      {/* Sidebar de Lista */}
      <Transition show={isListOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[1500]" onClose={setIsListOpen}>
          <TransitionChild
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
                <TransitionChild
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-200"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-center">
                          <h2 className="text-xl font-bold text-gray-800">
                            Ecopontos Próximos
                          </h2>
                          <button
                            onClick={() => setIsListOpen(false)}
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {!userCoords ? (
                          <p className="p-4 text-gray-500">
                            A obter a sua localização...
                          </p>
                        ) : listaProcessada.length === 0 ? (
                          <p className="p-4 text-gray-500">
                            Nenhum ponto encontrado.
                          </p>
                        ) : (
                          <ul>
                            {listaProcessada.map((ponto) => (
                              <li
                                key={ponto.id}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                                  ponto.id === activeEcopontoId
                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                    : ""
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEcoponto(ponto);
                                  setIsListOpen(false);
                                }}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <h3 className="font-semibold text-gray-900">
                                    {ponto.nome}
                                  </h3>
                                  <span className="text-sm font-medium text-gray-700">
                                    {ponto.distanciaKm.toFixed(1)} km
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {ponto.logradouro}
                                </p>
                                {ponto.horario_funcionamento && (
                                  <div className="mt-2 flex items-center text-sm text-gray-500">
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    {ponto.horario_funcionamento}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
        onClick={closeSidebar}
      >
        <NavigationControl position="bottom-right" />

        {/* Marcador da Minha Localização */}
        {userCoords && (
          <Marker
            longitude={userCoords[1]}
            latitude={userCoords[0]}
            anchor="center"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute h-8 w-8 bg-blue-500 rounded-full opacity-30 animate-ping" />
              <div className="relative bg-blue-600 p-1.5 rounded-full border-2 border-white shadow-lg">
                <MapPin className="w-5 h-5 text-white fill-current" />
              </div>
            </div>
          </Marker>
        )}

        {listaProcessada.map((ponto) => (
          <Marker
            key={ponto.id}
            longitude={ponto.longitude}
            latitude={ponto.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedEcoponto(ponto);
            }}
            scale={ponto.id === activeEcopontoId ? 1.5 : 1}
          />
        ))}
      </Map>

      {/* MODAL DE INFORMAÇÕES */}
      <Transition appear show={isInfoModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[2000]"
          onClose={() => setIsInfoModalOpen(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="relative w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <button
                    onClick={() => setIsInfoModalOpen(false)}
                    className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <TabGroup>
                    <div className="flex justify-center items-center mb-4">
                      <TabList className="flex space-x-1 rounded-xl bg-blue-100 p-1">
                        <Tab
                          className={({ selected }) =>
                            classNames(
                              "w-full rounded-lg py-2 px-4 text-sm font-medium leading-5",
                              "focus:outline-none",
                              selected
                                ? "bg-white shadow text-blue-700"
                                : "text-blue-500 hover:bg-white/[0.6]"
                            )
                          }
                        >
                          Guia de Descarte
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            classNames(
                              "w-full rounded-lg py-2 px-4 text-sm font-medium leading-5",
                              "focus:outline-none",
                              selected
                                ? "bg-white shadow text-blue-700"
                                : "text-blue-500 hover:bg-white/[0.6]"
                            )
                          }
                        >
                          Sobre o Projeto
                        </Tab>
                      </TabList>
                    </div>

                    <TabPanels className="mt-4">
                      <TabPanel>
                        <div className="space-y-6">
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
                                Nunca jogue no lixo comum. Elas contêm metais
                                pesados que contaminam o solo e a água.
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
                                1 litro de óleo pode contaminar 25.000 litros de
                                água. Guarde o óleo usado em garrafas PET.
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
                                Telemóveis, computadores e cabos contêm
                                plásticos e metais valiosos que podem ser
                                reciclados.
                              </p>
                            </div>
                          </div>
                        </div>
                      </TabPanel>

                      <TabPanel>
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-800">
                            Sobre este Projeto
                          </h4>
                          <p className="text-sm text-gray-600">
                            Esta aplicação é um Projeto de Extensão
                            Universitária focado em "Agir Local, Pensar Global",
                            alinhado com os Objetivos de Desenvolvimento
                            Sustentável (ODS) 4 (Educação) e 12 (Consumo
                            Responsável).
                          </p>
                          <p className="text-sm text-gray-600">
                            Desenvolvido por: <strong>Eric Oliveira</strong>
                          </p>

                          <div className="flex space-x-4">
                            <a
                              href="https://www.linkedin.com/in/heyeriic/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              <Linkedin className="w-4 h-4" /> LinkedIn
                            </a>
                            <a
                              href="https://github.com/EricOliveiras"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-black"
                            >
                              <Github className="w-4 h-4" /> GitHub
                            </a>
                          </div>
                        </div>
                      </TabPanel>
                    </TabPanels>
                  </TabGroup>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none"
                      onClick={() => setIsInfoModalOpen(false)}
                    >
                      Fechar
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
