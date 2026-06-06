# Prontuário Eletrônico — Módulo G5

> **Projeto Integrador · Sistemas de Informação · Grupo 5**

---

## Visão Geral

O módulo **G5 — Prontuário Eletrônico** centraliza e protege o histórico clínico dos pacientes no sistema hospitalar integrado. Desenvolvido com Node.js + Express (backend), React (frontend) e PostgreSQL (banco de dados), o sistema garante **imutabilidade dos registros clínicos** via trigger no banco de dados, exigindo retificações formais auditáveis para qualquer correção — em conformidade com requisitos de segurança e rastreabilidade em sistemas de saúde.

---

## Sobre o Projeto Integrador

Este módulo faz parte do **Projeto Integrador** do curso de Sistemas de Informação, integrando três disciplinas:

| Disciplina | Contribuição |
|------------|-------------|
| **Banco de Dados I** | Modelagem relacional, triggers, views, stored procedures, schema `sistema` |
| **Programação I** | Backend Node.js/Express, frontend React 18, ORM Sequelize |
| **Engenharia de Software** | Requisitos funcionais, diagramas UML, casos de uso, documentação técnica |

---

## Funcionalidades

| # | Requisito | Descrição |
|---|-----------|-----------|
| RF01 | Registro Clínico | Criação de registros de evolução médica/enfermagem, anamnese e observações, vinculados à consulta |
| RF02 | Imutabilidade | Registros clínicos não podem ser alterados após criação (bloqueio por trigger no PostgreSQL) |
| RF03 | Retificação Formal | Correções via retificação que preservam o original e criam trilha de auditoria (data, médico, motivo) |
| RF04 | Consulta por Paciente | Busca de prontuário + histórico de registros por ID do paciente |
| RF05 | Tipos de Registro | Campos exibidos dinamicamente conforme o tipo: evolução médica, enfermagem, anamnese ou observação |

---

## Arquitetura

```
Prontuario/
├── back/                              # API REST Node.js + Express (porta 3005)
│   ├── controllers/
│   │   ├── ProntuarioController.js    # Busca prontuário por paciente ou ID
│   │   ├── RegistroClinicoController.js
│   │   ├── RetificacaoController.js
│   │   └── TipoRegistroController.js
│   ├── models/                        # Modelos Sequelize
│   │   ├── Prontuario.js
│   │   ├── RegistroClinico.js
│   │   ├── RetificacaoRegistro.js
│   │   └── TipoRegistro.js
│   ├── Banco.js                       # Conexão PostgreSQL via Sequelize
│   └── index.js                       # Entry point da API
└── front/                             # React 18 (Create React App)
    └── src/
        ├── componentes/
        │   ├── Menu.js                # Navbar responsiva
        │   ├── Footer.js
        │   ├── LandingPage.js         # Página inicial do módulo
        │   ├── PaginaInicial.js       # Busca de prontuários
        │   ├── PaginaRegistroCadastro.js
        │   └── PaginaRetificacaoForm.js
        ├── servicos/
        │   └── api.js                 # Camada HTTP (axios)
        ├── App.js                     # Roteamento React Router v6
        ├── App.css                    # Design system (tokens, animações)
        └── index.js
```

---

## Como Executar

### Pré-requisitos

- **Node.js** 18+
- **PostgreSQL** com o schema `sistema` criado (execute `back/scripts.sql`)
- Crie um arquivo `back/.env` com as credenciais do banco:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nome_do_banco
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

### Backend

```bash
cd Prontuario/back
npm install
node index.js
# API disponível em http://localhost:3005
```

### Frontend

```bash
cd Prontuario/front
npm install
npm start
# App disponível em http://localhost:3000
```

---

## Endpoints da API

Base URL: `http://localhost:3005`

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/teste` | Health check da API |
| `GET` | `/tipo-registro` | Lista tipos de registro (lookup) |
| `GET` | `/prontuario/paciente/:paciente_id` | Prontuário + registros por ID do paciente |
| `GET` | `/prontuario/:id` | Prontuário por ID |
| `GET` | `/registro-clinico` | Lista todos os registros clínicos |
| `GET` | `/registro-clinico/:id` | Registro clínico por ID |
| `POST` | `/registro-clinico` | Cria novo registro clínico |
| `GET` | `/retificacao/registro/:registro_clinico_id` | Retificações de um registro |
| `POST` | `/retificacao` | Cria nova retificação |

> **`PUT` e `DELETE` em `/registro-clinico` são bloqueados intencionalmente** — o trigger `trg_bloquear_update_registro_clinico` impede alterações nos dados clínicos (apenas o campo `retificado` pode ser modificado via `UPDATE` direto).

---

## Fluxo do Sistema

```
[G2 Médicos]  ─┐
               ├──► [G5 Prontuário] ──► [G6 Receitas]
[G4 Consultas] ─┘                   ├──► [G7 Exames]
                                    └──► [G12 Telemedicina]
```

### Dependências (Consome)

| Módulo | Dado recebido |
|--------|--------------|
| **G2 — Médicos** | `medico_id` do responsável pelo registro |
| **G4 — Consultas** | `consulta_id` que origina o registro clínico |

### Provedores (Fornece)

| Módulo | Dado fornecido |
|--------|----------------|
| **G6 — Receitas** | Histórico clínico para emissão de receitas |
| **G7 — Exames** | Contexto diagnóstico para solicitação de exames |
| **G12 — Telemedicina** | Prontuário completo em consultas remotas |

---

## Banco de Dados

**Schema:** `sistema`

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `prontuario` | Prontuário por paciente (1:1) |
| `registro_clinico` | Registros imutáveis vinculados à consulta |
| `retificacao_registro` | Trilha de auditoria de correções |
| `tipo_registro` | Lookup de tipos: `EVOLUCAO_MEDICA`, `EVOLUCAO_ENFERMAGEM`, `ANAMNESE`, `OBSERVACAO_ENFERMAGEM` |

### Objetos adicionais

- **View** `vw_historico_clinico` — histórico clínico consolidado
- **Stored Procedure** `sp_registrar_evolucao_clinica` — encapsula criação de registros
- **Trigger** `trg_bloquear_update_registro_clinico` — impede UPDATE nos campos clínicos; permite apenas `retificado = true`

---

## Desenvolvimento

A parte de **frontend** (interface React, design system e layout institucional) foi desenvolvida com auxílio da IA **Claude Code** (Anthropic).

---

## Repositório

**GitHub:** https://github.com/lucassmagro/projeto-integrador

---

*G5 — Prontuário Eletrônico · Projeto Integrador · Sistemas de Informação*
