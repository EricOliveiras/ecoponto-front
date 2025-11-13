import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

// 1. CSS do Tailwind
import "./index.css";

// 2. CSS do Mapa (Mapbox GL)
import "mapbox-gl/dist/mapbox-gl.css";

// --- ATUALIZAÇÃO AQUI ---

// 3. REMOVA O CSS ANTIGO (do search-js-react)
// import "@mapbox/search-js-react/dist/search-js-react.css";

// 4. ADICIONE O CSS NOVO (do mapbox-gl-geocoder)
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
// ------------------------

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
