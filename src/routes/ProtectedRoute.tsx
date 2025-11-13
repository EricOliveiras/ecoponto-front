import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../services/auth";

/**
 * Este componente verifica se o utilizador está autenticado.
 * Se estiver, renderiza as rotas filhas (através do <Outlet />).
 * Se não estiver, redireciona para a página de login.
 */
export function ProtectedRoute() {
  const isAuth = isAuthenticated();

  if (!isAuth) {
    // Redireciona para /login, guardando a página que tentou aceder
    return <Navigate to="/login" replace />;
  }

  // Se está autenticado, renderiza a rota que foi pedida (ex: /admin)
  return <Outlet />;
}
