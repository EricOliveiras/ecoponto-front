// O App.tsx agora será o nosso roteador principal
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MapPage } from "./pages/MapPage";

// --- NOVOS IMPORTS ---
import { AdminDashboard } from "./pages/AdminDashboard"; // Importa a página de admin
import { ProtectedRoute } from "./routes/ProtectedRoute"; // Importa o "porteiro"
import { LoginPage } from "./pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- ROTAS PÚBLICAS --- */}
        <Route path="/" element={<MapPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* --- ROTAS PRIVADAS (DE ADMIN) --- */}
        {/* O ProtectedRoute "envolve" as rotas de admin */}
        <Route element={<ProtectedRoute />}>
          {/* É AQUI QUE A ROTA /admin É DEFINIDA */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
