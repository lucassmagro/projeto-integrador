# G5 - Prontuário

Módulo do Sistema de Saúde Integrado responsável pelo registro e consulta do histórico clínico dos pacientes.

## Stack

- **Back-end:** Node.js + Express + Sequelize
- **Front-end:** React + Bootstrap 5
- **Banco de dados:** PostgreSQL

## Como rodar localmente

### 1. Banco de dados

Certifique-se de ter o PostgreSQL rodando e execute o script SQL:

```bash
psql -U postgres -f back/scripts.sql
```

### 2. Back-end

```bash
cd back
npm install
npm run dev
```

A API ficará disponível em: `http://localhost:3005`

### 3. Front-end

```bash
cd front
npm install
npm start
```

O front ficará disponível em: `http://localhost:3000`

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/tipo-registro` | Lista os tipos de registro |
| GET | `/prontuario/paciente/:paciente_id` | Busca prontuário + registros por paciente |
| GET | `/prontuario/:id` | Busca prontuário por ID (usado por G6, G7, G12) |
| GET | `/registro-clinico` | Lista todos os registros |
| GET | `/registro-clinico/:id` | Busca registro por ID |
| POST | `/registro-clinico` | Cria novo registro clínico (valida consulta no G4) |
| GET | `/retificacao/registro/:id` | Lista retificações de um registro |
| POST | `/retificacao` | Cria retificação (dados originais são preservados) |

## Integrações

- **Consome:** G4 - Consultas (`http://localhost:3004`) para validar se a consulta existe e está ativa antes de salvar um registro.
- **Fornece:** G6 (Receitas), G7 (Exames), G12 (Telemedicina) — endpoint `GET /prontuario/paciente/:id`

## Grupo

- Integrante 1
- Integrante 2
- Integrante 3
