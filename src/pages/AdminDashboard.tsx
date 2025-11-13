import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../services/auth";
import {
  adminListEcopontos,
  adminDeleteEcoponto,
  type EcoPonto,
} from "../services/api";
import { EcopontoFormModal } from "../components/EcopontoFormModal";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [ecopontos, setEcopontos] = useState<EcoPonto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEcoponto, setCurrentEcoponto] = useState<EcoPonto | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminListEcopontos();
      setEcopontos(data);
    } catch (err) {
      setError("Falha ao carregar dados.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem a certeza que quer apagar este ecoponto?")) {
      const success = await adminDeleteEcoponto(id);
      if (success) {
        loadData();
      } else {
        alert("Falha ao apagar o ecoponto.");
      }
    }
  };

  const handleOpenCreateModal = () => {
    setCurrentEcoponto(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ponto: EcoPonto) => {
    setCurrentEcoponto(ponto);
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      {" "}
      {/* Adiciona padding responsivo */}
      {/* --- ATUALIZAÇÃO RESPONSIVA CABEÇALHO --- */}
      {/* Empilha em ecrãs 'xs' (default), fica lado-a-lado em 'sm' (small) e maiores */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Painel de Admin
        </h1>
        {/* Botões ficam num 'wrapper' para empilhar corretamente */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={handleOpenCreateModal}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-150"
          >
            Adicionar Ponto
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-150"
          >
            Sair (Logout)
          </button>
        </div>
      </header>
      {/* --- ATUALIZAÇÃO RESPONSIVA TABELA --- */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold mb-4">Gerir Ecopontos</h2>

        {loading && <p className="text-gray-500">A carregar ecopontos...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          // 'overflow-x-auto' garante que a tabela pode rolar horizontalmente
          // se o ecrã for *realmente* pequeno, sem quebrar o layout da página.
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>

                  {/* Coluna 'Bairro' agora está oculta (hidden) em 'xs', e aparece (md:table-cell) em 'md' */}
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bairro
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ecopontos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Nenhum ecoponto encontrado. Clique em "Adicionar Ponto"
                      para começar.
                    </td>
                  </tr>
                ) : (
                  ecopontos.map((ponto) => (
                    <tr key={ponto.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ponto.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ponto.tipo_residuo}
                      </td>

                      {/* Célula 'Bairro' também oculta (hidden) em 'xs' */}
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ponto.bairro || "N/D"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenEditModal(ponto)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(ponto.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Apagar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <EcopontoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        ecopontoToEdit={currentEcoponto}
      />
    </div>
  );
}
