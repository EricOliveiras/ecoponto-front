import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../services/auth";
import {
  adminListEcopontos,
  adminDeleteEcoponto,
  type EcoPonto,
} from "../services/api";

// 1. Importa os dois modais
import { EcopontoFormModal } from "../components/EcopontoFormModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal"; // <-- NOVO

export function AdminDashboard() {
  const navigate = useNavigate();
  const [ecopontos, setEcopontos] = useState<EcoPonto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados do Modal de Formulário (Adicionar/Editar)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentEcoponto, setCurrentEcoponto] = useState<EcoPonto | null>(null);

  // --- 2. NOVOS ESTADOS PARA O MODAL DE APAGAR ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ecopontoToDelete, setEcopontoToDelete] = useState<EcoPonto | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false); // Feedback de loading

  // ... (loadData, useEffect, handleLogout - sem mudanças) ...
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

  // --- 3. FUNÇÃO 'handleDelete' ATUALIZADA ---
  // Esta função agora APENAS abre o modal de confirmação
  const handleDeleteClick = (ponto: EcoPonto) => {
    setEcopontoToDelete(ponto); // Guarda quem queremos apagar
    setIsDeleteModalOpen(true); // Abre o modal
  };

  // --- 4. NOVA FUNÇÃO (Chamada pelo modal) ---
  // Esta função é que faz o trabalho de apagar
  const handleConfirmDelete = async () => {
    if (!ecopontoToDelete) return; // Segurança

    setIsDeleting(true);
    const success = await adminDeleteEcoponto(ecopontoToDelete.id);

    if (success) {
      loadData(); // Recarrega a tabela
    } else {
      alert("Falha ao apagar o ecoponto.");
    }

    setIsDeleting(false);
    setIsDeleteModalOpen(false); // Fecha o modal
    setEcopontoToDelete(null); // Limpa o estado
  };

  // Funções do Modal de Formulário (sem mudanças)
  const handleOpenCreateModal = () => {
    setCurrentEcoponto(null);
    setIsFormModalOpen(true);
  };
  const handleOpenEditModal = (ponto: EcoPonto) => {
    setCurrentEcoponto(ponto);
    setIsFormModalOpen(true);
  };
  const handleModalSave = () => {
    loadData(); // Recarrega a tabela
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      {/* Cabeçalho (sem mudanças) */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Painel de Admin
        </h1>
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

      {/* Tabela (Quase sem mudanças) */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold mb-4">Gerir Ecopontos</h2>

        {loading && <p className="text-gray-500">A carregar ecopontos...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
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
                        {/* --- 5. LIGA O NOVO HANDLER --- */}
                        <button
                          onClick={() => handleDeleteClick(ponto)} // <--- ATUALIZADO
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

      {/* --- Renderiza os DOIS modais --- */}

      {/* 1. Modal de Adicionar/Editar */}
      <EcopontoFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleModalSave}
        ecopontoToEdit={currentEcoponto}
      />

      {/* 2. Modal de Apagar */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={ecopontoToDelete?.nome || ""}
        isLoading={isDeleting}
      />
    </div>
  );
}
