import { Fragment } from "react";
import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { useMapStore } from "../store/mapStore";

// Helper para formatar o tipo de resíduo
const formatTipo = (tipo: string) => {
  const tipos: { [key: string]: string } = {
    pilha: "Pilhas e Baterias",
    oleo: "Óleo de Cozinha",
    eletronico: "Lixo Eletrónico",
    geral: "Resíduos Gerais",
  };
  return tipos[tipo] || "Não especificado";
};

// Placeholder de imagem
const placeholderImg =
  "https://placehold.co/600x400/e2e8f0/cbd5e1?text=Sem+Foto";

export function DetalheSidebar() {
  // Lê o estado global do Zustand
  const { isSidebarOpen, selectedEcoponto, closeSidebar } = useMapStore();

  if (!selectedEcoponto) {
    return null; // Não renderiza nada se nenhum ponto estiver selecionado
  }

  return (
    <Transition.Root show={isSidebarOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1000]" onClose={closeSidebar}>
        {/* Overlay (fundo escuro) */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-full md:max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      {/* Cabeçalho da Sidebar */}
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-xl font-bold text-gray-900">
                          {selectedEcoponto.nome}
                        </Dialog.Title>
                        <button
                          type="button"
                          className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                          onClick={closeSidebar}
                        >
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Conteúdo da Sidebar */}
                      <div className="mt-8">
                        <div className="flow-root">
                          {/* Imagem */}
                          <div className="mb-4">
                            <img
                              src={selectedEcoponto.foto_url || placeholderImg}
                              alt={`Foto do local ${selectedEcoponto.nome}`}
                              className="w-full h-48 object-cover rounded-lg shadow"
                            />
                          </div>

                          {/* Informações */}
                          <dl className="divide-y divide-gray-200">
                            <div className="py-4">
                              <dt className="text-sm font-medium text-gray-500">
                                Tipo de Resíduo
                              </dt>
                              <dd className="mt-1 text-lg text-gray-900 font-semibold">
                                {formatTipo(selectedEcoponto.tipo_residuo)}
                              </dd>
                            </div>
                            <div className="py-4">
                              <dt className="text-sm font-medium text-gray-500">
                                Endereço
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {selectedEcoponto.logradouro},{" "}
                                {selectedEcoponto.bairro}
                              </dd>
                            </div>
                            <div className="py-4">
                              <dt className="text-sm font-medium text-gray-500">
                                Horário
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {selectedEcoponto.horario_funcionamento ||
                                  "Não informado"}
                              </dd>
                            </div>
                          </dl>

                          {/* Guia Educacional (ODS 4/12) */}
                          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800">
                              Guia de Descarte
                            </h4>
                            <p className="text-sm text-blue-700 mt-2">
                              {getGuiaDescarte(selectedEcoponto.tipo_residuo)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

// Helper que retorna o texto educacional
function getGuiaDescarte(tipo: string): string {
  switch (tipo) {
    case "pilha":
      return "Pilhas e baterias contêm metais pesados (chumbo, mercúrio) que contaminam o solo. Nunca jogue no lixo comum. Deposite apenas em coletores específicos como este.";
    case "oleo":
      return "1 litro de óleo contamina 25.000 litros de água. Guarde o óleo usado em garrafas PET e leve a um ponto de coleta. Jamais jogue na pia.";
    case "eletronico":
      return "Lixo eletrónico (E-Lixo) contém plásticos e metais valiosos que podem ser reciclados. Não misture com o lixo doméstico.";
    default:
      return "Verifique com o local quais resíduos são aceites. Na dúvida, não misture lixo orgânico com reciclável.";
  }
}
