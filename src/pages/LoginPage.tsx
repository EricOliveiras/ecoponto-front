import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { saveToken, isAuthenticated } from "../services/auth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Feedback de loading
  const navigate = useNavigate();

  // Se o utilizador já estiver logado, redireciona-o
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Ativa o loading

    // --- LÓGICA DE LOGIN REAL ---
    const { token, error: apiError } = await login(email, password);

    setIsLoading(false); // Desativa o loading

    if (token) {
      // SUCESSO!
      console.log("Login bem-sucedido!");
      saveToken(token); // Guarda o token
      navigate("/admin"); // Redireciona
    } else {
      // FALHA!
      setError(apiError || "Ocorreu um erro desconhecido");
    }
  };

  return (
    // O JSX do formulário (com 'disabled' e 'isLoading')
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Admin EcoPonto
        </h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline-blue focus:border-blue-500"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline-blue focus:border-blue-500"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline-blue transition duration-150 ease-in-out disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "A entrar..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
