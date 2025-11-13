import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Map, { Marker } from "react-map-gl";
import { Geocoder } from "@mapbox/search-js-react";

import type {
  EcoPonto,
  CreateEcopontoData,
  UpdateEcopontoData,
} from "../services/api";
import { adminCreateEcoponto, adminUpdateEcoponto } from "../services/api";

// --- ATUALIZAÇÃO 1: LÊ AS CHAVES DO .ENV ---
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const DEFAULT_LAT = parseFloat(
  import.meta.env.VITE_DEFAULT_MAP_LAT || "-1.359"
);
const DEFAULT_LON = parseFloat(
  import.meta.env.VITE_DEFAULT_MAP_LON || "-48.488"
);
const DEFAULT_ZOOM = parseFloat(import.meta.env.VITE_DEFAULT_MAP_ZOOM || "12");
const GEOCODING_COUNTRY = import.meta.env.VITE_GEOCODING_COUNTRY || "br";

// --- NOVAS VARIÁVEIS DO CLOUDINARY ---
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
// ------------------------------------

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  ecopontoToEdit: EcoPonto | null;
}

const initialState = {
  nome: "",
  tipo_residuo: "",
  logradouro: "",
  bairro: "",
  cidade: "",
  estado: "",
  horario_funcionamento: "",
  foto_url: "",
};

// ... (Função fetchAddressFromCoords - Cole-a aqui) ...
async function fetchAddressFromCoords(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,place,neighborhood,region&language=pt-BR`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.features || data.features.length === 0) return null;
    const bestResult = data.features[0];
    const context = bestResult.context || [];
    const getFromContext = (idPrefix: string) =>
      context.find(
        (c: any) => typeof c.id === "string" && c.id.startsWith(idPrefix)
      )?.text || "";
    return {
      logradouro: bestResult.text || getFromContext("address"),
      bairro: getFromContext("neighborhood"),
      cidade: getFromContext("place"),
      estado: (getFromContext("region")?.short_code || "")
        .toUpperCase()
        .replace("BR-", ""),
    };
  } catch (err) {
    return null;
  }
}
// ---------------------------------------------------

export function EcopontoFormModal({
  isOpen,
  onClose,
  onSave,
  ecopontoToEdit,
}: ModalProps) {
  const isEditMode = !!ecopontoToEdit;

  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- ATUALIZAÇÃO 2: NOVO ESTADO DE UPLOAD ---
  const [isUploading, setIsUploading] = useState(false);

  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const [viewState, setViewState] = useState({
    longitude: DEFAULT_LON,
    latitude: DEFAULT_LAT,
    zoom: DEFAULT_ZOOM,
  });

  // Preenche dados se for edição (Sem mudanças)
  useEffect(() => {
    setError("");
    setIsUploading(false); // Reseta o estado de upload
    if (isEditMode && ecopontoToEdit) {
      setFormData({
        nome: ecopontoToEdit.nome,
        tipo_residuo: ecopontoToEdit.tipo_residuo,
        logradouro: ecopontoToEdit.logradouro,
        bairro: ecopontoToEdit.bairro,
        cidade: "",
        estado: "",
        horario_funcionamento: ecopontoToEdit.horario_funcionamento || "",
        foto_url: ecopontoToEdit.foto_url || "",
      });
      const pos = {
        lat: ecopontoToEdit.latitude,
        lon: ecopontoToEdit.longitude,
      };
      setMarkerPosition(pos);
      setViewState({ longitude: pos.lon, latitude: pos.lat, zoom: 16 });
    } else {
      setFormData(initialState);
      setMarkerPosition(null);
      setViewState({
        longitude: DEFAULT_LON,
        latitude: DEFAULT_LAT,
        zoom: DEFAULT_ZOOM,
      });
    }
  }, [ecopontoToEdit, isEditMode, isOpen]);

  // Submissão do formulário (Sem mudanças na lógica)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    let success = false;

    // Prepara os dados opcionais (horário, foto)
    const optionalData = {
      horario_funcionamento: formData.horario_funcionamento || undefined,
      foto_url: formData.foto_url || undefined,
    };

    if (isEditMode && ecopontoToEdit) {
      // --- LÓGICA DE ATUALIZAÇÃO ---
      const updateData: UpdateEcopontoData = {
        nome: formData.nome,
        tipo_residuo: formData.tipo_residuo,
        logradouro: formData.logradouro,
        bairro: formData.bairro,
        ...optionalData, // Adiciona os novos campos
        latitude: markerPosition?.lat,
        longitude: markerPosition?.lon,
      };
      const result = await adminUpdateEcoponto(ecopontoToEdit.id, updateData);
      if (result) success = true;
    } else {
      // --- LÓGICA DE CRIAÇÃO ---
      if (!markerPosition) {
        setError("Use a busca ou clique no mapa para definir um endereço.");
        setIsLoading(false);
        return;
      }
      const createData: CreateEcopontoData & {
        latitude?: number;
        longitude?: number;
      } = {
        nome: formData.nome,
        tipo_residuo: formData.tipo_residuo,
        logradouro: formData.logradouro,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        latitude: markerPosition.lat,
        longitude: markerPosition.lon,
        ...optionalData, // Adiciona os novos campos
      };
      if (
        !createData.nome ||
        !createData.logradouro ||
        !createData.bairro ||
        !createData.cidade ||
        !createData.estado
      ) {
        setError(
          "Endereço incompleto. Use a busca ou o clique no mapa para preencher os dados."
        );
        setIsLoading(false);
        return;
      }
      const result = await adminCreateEcoponto(
        createData as CreateEcopontoData
      );
      if (result) success = true;
    }

    setIsLoading(false);
    if (success) {
      onSave();
      onClose();
    } else {
      setError("Erro ao salvar. Tente novamente.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- ATUALIZAÇÃO 3: NOVA FUNÇÃO (UPLOAD P/ CLOUDINARY) ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);
      setError("");

      // Monta o FormData para o Cloudinary
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: uploadData,
          }
        );

        if (!response.ok) throw new Error("Falha no upload da imagem");

        const data = await response.json();

        // SUCESSO! Guarda a URL segura no estado do formulário
        setFormData((prev) => ({
          ...prev,
          foto_url: data.secure_url,
        }));
      } catch (err) {
        setError("Erro ao carregar a imagem. Tente novamente.");
      } finally {
        setIsUploading(false);
      }
    }
  };
  // ---------------------------------------------

  // ... (fetchAddressFromCoords, handleMapInteraction, handleGeocoderRetrieve - Sem mudanças) ...
  const handleMapInteraction = async (lngLat: { lat: number; lng: number }) => {
    const newPos = { lat: lngLat.lat, lon: lngLat.lng };
    setMarkerPosition(newPos);
    setError("A verificar endereço do pin...");
    const address = await fetchAddressFromCoords(newPos.lat, newPos.lon);
    if (address) {
      setError("");
      setFormData((prev) => ({
        ...prev,
        nome: prev.nome || address.logradouro,
        logradouro: address.logradouro,
        bairro: address.bairro,
        cidade: address.cidade,
        estado: address.estado,
        horario_funcionamento: prev.horario_funcionamento,
        foto_url: prev.foto_url,
      }));
    } else {
      setError(
        "Não foi possível identificar o endereço deste local. Preencha manualmente."
      );
    }
  };
  const handleGeocoderRetrieve = (feature: any) => {
    const coords = feature?.geometry?.coordinates;
    const context = feature?.context ?? [];
    const getFromContext = (idPrefix: string) =>
      context.find(
        (c: any) => typeof c.id === "string" && c.id.startsWith(idPrefix)
      )?.text || "";
    if (!coords) return;
    const pos = { lat: coords[1], lon: coords[0] };
    setMarkerPosition(pos);
    setViewState({ latitude: pos.lat, longitude: pos.lon, zoom: 16 });
    setFormData((prev) => ({
      ...prev,
      nome: prev.nome || feature?.text || "",
      logradouro: feature?.text || prev.logradouro,
      bairro: getFromContext("neighborhood"),
      cidade: getFromContext("place"),
      estado: (getFromContext("region")?.short_code || "")
        .toUpperCase()
        .replace("BR-", ""),
      horario_funcionamento: prev.horario_funcionamento,
      foto_url: prev.foto_url,
    }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        {/* ... (Overlay) ... */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-medium leading-6 text-gray-900"
                >
                  {isEditMode ? "Editar Ecoponto" : "Adicionar Novo Ecoponto"}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  {error && (
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                  )}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Coluna 1 */}
                    <div className="space-y-4">
                      {/* ... (Campos Nome, Tipo, Logradouro, Bairro) ... */}
                      <div>
                        <label
                          htmlFor="nome"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Nome
                        </label>
                        <input
                          type="text"
                          name="nome"
                          id="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="tipo_residuo"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Tipo de Resíduo
                        </label>
                        <select
                          name="tipo_residuo"
                          id="tipo_residuo"
                          value={formData.tipo_residuo}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2"
                          required
                        >
                          <option value="">Selecione um tipo</option>
                          <option value="pilha">Pilhas e Baterias</option>
                          <option value="oleo">Óleo de Cozinha</option>
                          <option value="eletronico">Eletrônicos</option>
                          <option value="geral">Geral</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="logradouro"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Logradouro
                        </label>
                        <input
                          type="text"
                          name="logradouro"
                          id="logradouro"
                          value={formData.logradouro}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2"
                          required
                          placeholder="Preenchido pela busca"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="bairro"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Bairro
                        </label>
                        <input
                          type="text"
                          name="bairro"
                          id="bairro"
                          value={formData.bairro}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2"
                          required
                          placeholder="Preenchido pela busca"
                        />
                      </div>

                      {!isEditMode && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="cidade"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Cidade
                            </label>
                            <input
                              type="text"
                              name="cidade"
                              id="cidade"
                              value={formData.cidade}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2"
                              required
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="estado"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Estado
                            </label>
                            <input
                              type="text"
                              name="estado"
                              id="estado"
                              value={formData.estado}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2"
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* --- CAMPO HORÁRIO (Sem mudança) --- */}
                      <div>
                        <label
                          htmlFor="horario_funcionamento"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Horário (Opcional)
                        </label>
                        <input
                          type="text"
                          name="horario_funcionamento"
                          id="horario_funcionamento"
                          value={formData.horario_funcionamento}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm px-3 py-2"
                          placeholder="Ex: Seg-Sex 08:00-18:00"
                        />
                      </div>

                      {/* --- ATUALIZAÇÃO 4: CAMPO DE UPLOAD DE FOTO --- */}
                      <div>
                        <label
                          htmlFor="foto_upload"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Foto (Opcional)
                        </label>
                        {/* Pré-visualização da imagem (se existir) */}
                        {formData.foto_url && (
                          <img
                            src={formData.foto_url}
                            alt="Pré-visualização"
                            className="mt-2 w-full h-32 object-cover rounded-md"
                          />
                        )}
                        {/* Mostra "A carregar..." enquanto o upload está a decorrer */}
                        {isUploading ? (
                          <div className="mt-2 text-sm text-blue-600">
                            A carregar imagem...
                          </div>
                        ) : (
                          <input
                            type="file"
                            name="foto_upload"
                            id="foto_upload"
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-500
                                       file:mr-4 file:py-2 file:px-4
                                       file:rounded-md file:border-0
                                       file:text-sm file:font-semibold
                                       file:bg-blue-50 file:text-blue-700
                                       hover:file:bg-blue-100"
                            accept="image/png, image/jpeg"
                            // Desativa o botão de ficheiro enquanto outro upload está a decorrer
                            disabled={isUploading}
                          />
                        )}
                      </div>
                      {/* ------------------------------- */}
                    </div>

                    {/* Coluna 2 (Mapa e Busca - sem mudanças) */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Procurar Endereço
                        </label>
                        <div className="mt-2">
                          <Geocoder
                            accessToken={MAPBOX_TOKEN}
                            placeholder="Buscar endereço..."
                            onRetrieve={handleGeocoderRetrieve}
                            country={GEOCODING_COUNTRY}
                          />
                        </div>
                      </div>

                      <div className="h-64 w-full rounded-md overflow-hidden z-0">
                        <Map
                          {...viewState}
                          onMove={(evt) => setViewState(evt.viewState)}
                          mapboxAccessToken={MAPBOX_TOKEN}
                          mapStyle="mapbox://styles/mapbox/streets-v12"
                          style={{ width: "100%", height: "100%" }}
                          onClick={(e) => handleMapInteraction(e.lngLat)}
                        >
                          {markerPosition && (
                            <Marker
                              longitude={markerPosition.lon}
                              latitude={markerPosition.lat}
                              draggable={true}
                              onDragEnd={(e: any) =>
                                handleMapInteraction(e.lngLat)
                              }
                            />
                          )}
                        </Map>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Use a busca OU clique/arraste o pin no mapa.
                      </p>
                    </div>
                  </div>

                  {/* Botões Salvar/Cancelar */}
                  <div className="mt-6 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      onClick={onClose}
                    >
                      Cancelar
                    </button>
                    {/* --- ATUALIZAÇÃO 5: LÓGICA DO BOTÃO SALVAR --- */}
                    <button
                      type="submit"
                      disabled={isLoading || isUploading}
                      className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isLoading
                        ? "Salvando..."
                        : isUploading
                        ? "Aguarde a imagem..."
                        : "Salvar"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
