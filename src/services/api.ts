import axios from "axios";

// --- ATUALIZAÇÃO IMPORTANTE ---

// 1. Define a URL RAIZ da API com base no ambiente
const VITE_API_ROOT = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL_PROD
  : "http://localhost:8080";

// Validação (ajuda a detetar erros durante o build)
if (import.meta.env.PROD && !VITE_API_ROOT) {
  console.error(
    "VITE_API_URL_PROD não está definida nas variáveis de ambiente!"
  );
}
// ------------------------------

// Define a URL base da sua API Go
const api = axios.create({
  baseURL: `${VITE_API_ROOT}/api`,
});

// Interceptor: é executado ANTES de CADA requisição
api.interceptors.request.use(
  (config) => {
    // 1. Pega o token do localStorage
    const token = localStorage.getItem("ecoponto-token");

    // 2. Se o token existir, adiciona-o ao header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // 3. Retorna a configuração modificada
    return config;
  },
  (error) => {
    // Em caso de erro na configuração
    return Promise.reject(error);
  }
);

// --- VERIFIQUE ESTA INTERFACE ---
export interface EcoPonto {
  id: string;
  nome: string;
  tipo_residuo: string;
  latitude: number;
  longitude: number;
  logradouro: string;
  bairro: string;
  created_at: string;
  horario_funcionamento?: string | null;
  foto_url?: string | null;
}
// ---------------------------------

// Interface para os dados de CRIAÇÃO (com geocoding)
export interface CreateEcopontoData {
  nome: string;
  tipo_residuo: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude?: number;
  longitude?: number;
  horario_funcionamento?: string;
  foto_url?: string;
}

// Interface para os dados de UPDATE (campos opcionais)
export interface UpdateEcopontoData {
  nome?: string;
  tipo_residuo?: string;
  logradouro?: string;
  bairro?: string;
  horario_funcionamento?: string;
  foto_url?: string;
  latitude?: number;
  longitude?: number;
}

// --- Funções da API  ---

export const fetchEcopontos = async (
  lat: number,
  lon: number,
  tipo: string
) => {
  try {
    const params = new URLSearchParams();
    params.append("lat", lat.toString());
    params.append("lon", lon.toString());
    params.append("dist", "10000"); // 10km
    if (tipo && tipo !== "todos") {
      params.append("tipo", tipo);
    }
    params.append("_", new Date().getTime().toString()); // Cache buster

    const response = await api.get(`/ecopontos?${params.toString()}`);
    return (response.data as EcoPonto[]) ?? [];
  } catch (err) {
    console.error("Erro ao buscar ecopontos:", err);
    return [];
  }
};

interface LoginResponse {
  token: string;
}
export const login = async (
  email: string,
  password: string
): Promise<{ token?: string; error?: string }> => {
  try {
    const response = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    if (response.data && response.data.token) {
      return { token: response.data.token };
    }
    return { error: "Resposta de login inválida" };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      if (err.response.status === 401) {
        return { error: "Email ou senha inválidos" };
      }
      return { error: err.response.data?.error || "Erro do servidor" };
    }
    return { error: "Não foi possível conectar ao servidor" };
  }
};

export const adminListEcopontos = async (): Promise<EcoPonto[]> => {
  try {
    const response = await api.get("/ecopontos/all");
    return (response.data as EcoPonto[]) ?? [];
  } catch (err) {
    console.error("Erro ao buscar lista de admin:", err);
    return [];
  }
};

export const adminCreateEcoponto = async (
  data: CreateEcopontoData
): Promise<EcoPonto | null> => {
  try {
    const response = await api.post("/ecopontos", data);
    return response.data as EcoPonto;
  } catch (err) {
    console.error("Erro ao criar ecoponto:", err);
    return null;
  }
};

export const adminUpdateEcoponto = async (
  id: string,
  data: UpdateEcopontoData
): Promise<EcoPonto | null> => {
  try {
    const response = await api.put(`/ecopontos/${id}`, data);
    return response.data as EcoPonto;
  } catch (err) {
    console.error("Erro ao atualizar ecoponto:", err);
    return null;
  }
};

export const adminDeleteEcoponto = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/ecopontos/${id}`);
    return true; // Sucesso
  } catch (err) {
    console.error("Erro ao apagar ecoponto:", err);
    return false; // Falha
  }
};
