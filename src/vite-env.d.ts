/// <reference types="vite/client" />

// Adiciona os tipos para as nossas novas variáveis de ambiente
interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_DEFAULT_MAP_LAT: string;
  readonly VITE_DEFAULT_MAP_LON: string;
  readonly VITE_DEFAULT_MAP_ZOOM: string;
  readonly VITE_GEOCODING_COUNTRY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
