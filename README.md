# ⚛️ EcoPonto App (Frontend)

Esta é a interface de utilizador (UI) do projeto EcoPonto, construída com React, Vite e Mapbox.

Esta aplicação consome a API Go EcoPonto (o seu backend) para fornecer uma plataforma visual de mapeamento (ODS 12) e um painel de administração completo para a gestão dos pontos de coleta.

O projeto foi construído com a filosofia "Agir Local, Pensar Global", sendo totalmente configurável através de variáveis de ambiente para ser facilmente adaptado a qualquer cidade.

## ✨ Funcionalidades (Features)

### Interface Pública (Mapa)

- **Mapa Interativo (Mapbox)**: Renderiza todos os ecopontos públicos
- **Geolocalização**: Pede a localização do utilizador para centrar o mapa
- **Filtragem Dinâmica**: Permite ao utilizador filtrar pontos por tipo de resíduo
- **Lista de Proximidade (Recolhível)**: Barra lateral que mostra pontos mais próximos, ordenados por distância
- **Sidebar de Detalhes**: Foto, horário e guia educacional (ODS 4)
- **Design Responsivo**: Layout adaptável via Tailwind CSS
- **"Pensar Global"**: Título, coordenadas e país 100% configuráveis via .env

### Interface de Admin (Painel)

- **Login Seguro**: Autenticação com Token JWT
- **Rotas Protegidas**: Painel `/admin` inacessível sem token válido
- **Dashboard CRUD**: Criar, ler, atualizar e apagar ecopontos
- **Geocoding/Reverse Geocoding**: Mapbox com preenchimento automático de campos
- **Upload de Imagem**: Integração com Cloudinary
- **Modal de Confirmação**: Operações destrutivas com confirmação

## 🛠️ Stack Tecnológico

- **Framework**: ⚛️ React com TypeScript
- **Build**: ⚡ Vite
- **Mapas**: 🗺️ Mapbox GL JS
- **Estilização**: 💅 Tailwind CSS
- **Componentes**: @headlessui/react
- **Estado**: Zustand
- **API**: Axios
- **Upload**: Cloudinary
- **Ícones**: Lucide React

## 🚀 Como Executar

### Pré-requisitos

- Node.js (v18+) e NPM
- EcoPonto API (Backend) em execução

### Instalação

```bash
cd ecoponto-front
npm install
```

### Configuração (.env)

Crie `.env` na raiz com as chaves necessárias (veja `.env.example`).

### Executar

```bash
npm run dev
```

Disponível em `http://localhost:5173`.

---

Desenvolvido por [Eric Oliveira](https://github.com/ericoliveiras) | [LinkedIn](https://www.linkedin.com/in/heyeriic/)
