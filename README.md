# Prontuário Eletrônico - G5

Módulo de prontuário eletrônico de um sistema hospitalar. Permite registrar a
evolução clínica dos pacientes, consultar o histórico e corrigir registros por
retificação, sem apagar o dado original.

---

### Sobre o projeto

Este é o módulo do Grupo 5 do Projeto Integrador do curso de Sistemas de
Informação da UNOESC Chapecó. O trabalho junta três disciplinas do semestre em
um sistema só.

| Disciplina             | O que entrou no módulo                                                    |
| ---------------------- | ------------------------------------------------------------------------- |
| Banco de Dados I       | Modelagem das tabelas, view, stored procedure e trigger no schema sistema |
| Programação I          | Backend em Node.js/Express com Sequelize e frontend em React              |
| Engenharia de Software | Levantamento de requisitos, diagramas UML e documentação                  |

---

### Funcionalidades

| Código | Descrição                                      |
| ------ | ---------------------------------------------- |
| RF01   | Registro clínico vinculado a uma consulta      |
| RF02   | Imutabilidade dos registros (trigger no banco) |
| RF03   | Retificação formal com trilha de auditoria     |
| RF04   | Consulta de histórico por paciente             |
| RF05   | Campos dinâmicos por tipo de registro          |

---

### Tecnologias

- Node.js 18
- Express
- Sequelize
- PostgreSQL
- React 18
- Bootstrap
- React Router v6
- Axios
- React Toastify

---

### Estrutura do projeto

```text
Prontuario/
├── back/                                 API REST (porta 3005)
│   ├── controllers/
│   │   ├── ProntuarioController.js        busca prontuário por paciente ou id
│   │   ├── RegistroClinicoController.js   cria e lista registros clínicos
│   │   ├── RetificacaoController.js       cria e lista retificações
│   │   └── TipoRegistroController.js      lista os tipos de registro
│   ├── models/
│   │   ├── Prontuario.js
│   │   ├── RegistroClinico.js
│   │   ├── RetificacaoRegistro.js
│   │   └── TipoRegistro.js
│   ├── migrations/
│   │   └── fix_tipos.sql                 corrige os tipos de registro existentes
│   ├── Banco.js                          conexão com o PostgreSQL
│   ├── index.js                          rotas e inicialização da API
│   └── scripts.sql                       cria tabelas, view, procedure e trigger
└── front/
    └── src/
        ├── componentes/
        │   ├── Menu.js                   barra de navegação
        │   ├── Footer.js                 rodapé
        │   ├── LandingPage.js            página inicial com a documentação
        │   ├── PaginaInicial.js          busca de prontuário e exportar PDF
        │   ├── PaginaRegistroCadastro.js formulário de novo registro
        │   └── PaginaRetificacaoForm.js  formulário de retificação
        ├── servicos/
        │   └── api.js                    chamadas HTTP com axios
        ├── utils/
        │   └── tipoRegistroLabels.js     nomes amigáveis dos tipos
        ├── App.js                        rotas do React Router
        └── App.css                       estilos da aplicação
```

---

### Banco de dados

Schema: `sistema`

Tabelas:

| Tabela               | Descrição                                     |
| -------------------- | --------------------------------------------- |
| prontuario           | um prontuário por paciente                    |
| registro_clinico     | registros imutáveis vinculados a uma consulta |
| retificacao_registro | trilha de auditoria das correções             |
| tipo_registro        | tipos de registro usados no formulário        |

Objetos adicionais:

- View `vw_historico_clinico`: usada pelo endpoint GET /prontuario/paciente/:id
- Stored Procedure `sp_registrar_evolucao_clinica`: chamada no POST /registro-clinico
- Trigger `trg_bloquear_update_registro_clinico`: impede alteração dos dados clínicos

---

### Como rodar

Pré-requisitos: Node.js 18+ e PostgreSQL com o schema sistema criado.

Crie o arquivo `back/.env` com as credenciais do banco:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nome_do_banco
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

Banco: rode o `back/scripts.sql` para criar as tabelas e os objetos. Depois rode
o `back/migrations/fix_tipos.sql` para acertar os tipos de registro.

Backend (porta 3005), em um terminal:

```bash
cd Prontuario/back
npm install
node index.js
```

Frontend (porta 3000), em outro terminal:

```bash
cd Prontuario/front
npm install
npm start
```

---

### Endpoints da API

Base: `http://localhost:3005`

| Método | Rota                                       | Descrição                             |
| ------ | ------------------------------------------ | ------------------------------------- |
| GET    | /teste                                     | verifica se a API está no ar          |
| GET    | /tipo-registro                             | lista os tipos de registro            |
| GET    | /prontuario/paciente/:paciente_id          | prontuário e registros de um paciente |
| GET    | /prontuario/:id                            | prontuário por id                     |
| GET    | /registro-clinico                          | lista todos os registros clínicos     |
| GET    | /registro-clinico/:id                      | um registro clínico por id            |
| POST   | /registro-clinico                          | cria um registro clínico              |
| GET    | /retificacao/registro/:registro_clinico_id | retificações de um registro           |
| POST   | /retificacao                               | cria uma retificação                  |

Não existe PUT nem DELETE em /registro-clinico. O trigger
`trg_bloquear_update_registro_clinico` bloqueia alteração dos dados clínicos, só
o campo retificado pode mudar. Para corrigir um registro use o POST /retificacao.

---

### Integrações

O projeto não tem acesso às APIs dos outros grupos. Os valores de paciente_id,
consulta_id e medico_id são informados manualmente pelo usuário, é uma simulação
local.

| Relação | Grupo              | Dado                                       |
| ------- | ------------------ | ------------------------------------------ |
| Consome | G4 (Consultas)     | consulta_id que origina o registro         |
| Fornece | G6 (Receitas)      | histórico clínico para emitir receitas     |
| Fornece | G7 (Exames)        | contexto diagnóstico para solicitar exames |
| Fornece | G12 (Telemedicina) | prontuário em atendimentos remotos         |

---

### Integrantes

- Alexandre Reitemeyer
- Beatriz Miranda
- Lucas Santos Magro

---

### Repositório

<https://github.com/lucassmagro/projeto-integrador>
