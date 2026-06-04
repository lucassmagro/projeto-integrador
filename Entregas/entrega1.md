# Entrega 1: Documento de Concepção (Escopo + Requisitos)

**Módulo:** 8.5 G5 - Prontuário

**Referência Técnica:** [Prontuário Médico - CFM](https://portal.cfm.org.br/artigos/prontuario-medico)

---

## 1. Visão do Produto

**Problema**
A descentralização, a volatilidade e a fragmentação dos históricos clínicos representam graves riscos à segurança do paciente, propiciando diagnósticos imprecisos e a perda de informações cruciais, como alergias e tratamentos anteriores. Além disso, a ausência de comunicação em tempo real entre a triagem, os exames e as prescrições atrasa a tomada de decisão médica. Somado a isso, a alteração não rastreável ou a perda de dados prejudica a continuidade do cuidado, eleva a incidência de erros médicos e compromete a validade legal dos prontuários.

**Público-Alvo**
Médicos, enfermeiros e demais profissionais de saúde autorizados que realizam o atendimento direto ao paciente, bem como auditores em saúde (para leitura).

**O Módulo no Ecossistema**
O Prontuário (G5) atua como a única fonte de verdade clínica do paciente. Ele possui uma forte dependência de consumo de dados do Módulo de Consultas (G4), pois não existe registro sem consulta prévia. Simultaneamente, atua como pilar de dados para os módulos de desfecho clínico, fornecendo os insumos (diagnósticos, condições pré-existentes) necessários para a emissão de Receitas (G6), solicitação de Exames (G7) e atendimentos via Telemedicina (G12).

---

## 2. Requisitos Funcionais (RFs)

### RF01: Registrar Evolução Clínica

**Descrição:** O sistema deve permitir a inserção de diagnósticos, sintomas e observações clínicas, vinculando-os obrigatoriamente a uma consulta válida.

**Prioridade:** Alta (Crítica)

**Critério de Aceitação 1:** Dado que o usuário tenta salvar o registro clínico, se o ID da consulta (G4) fornecido não existir, estiver com status "Cancelada" ou pertencer a outro paciente, o sistema deve retornar erro 422 (Unprocessable Entity) e impedir o salvamento.

**Critério de Aceitação 2:** O registro salvo deve conter, no mínimo: ID do paciente, ID da consulta, ID do profissional de saúde, timestamp exato do servidor no momento da gravação, sintomas, diagnóstico e observações.

### RF02: Garantir Imutabilidade dos Registros

**Descrição:** O sistema deve garantir que nenhum registro clínico consolidado seja excluído ou sobrescrito.

**Prioridade:** Alta (Crítica)

**Critério de Aceitação 1:** Dado um registro clínico já persistido no banco de dados, requisições de deleção física (DELETE) ou atualização destrutiva (PUT/PATCH sobre dados originais) devem ser bloqueadas, retornando erro 403 (Forbidden) ou 405 (Method Not Allowed).

**Critério de Aceitação 2:** Para correções, o sistema deve exigir a criação de um novo registro do tipo "Retificação", que deve manter um ponteiro para o ID do registro original, sem alterar os dados iniciais.

### RF03: Listar Histórico Clínico do Paciente

**Descrição:** O sistema deve fornecer uma visão estruturada e cronológica de todos os registros clínicos de um paciente.

**Prioridade:** Alta

**Critério de Aceitação 1:** A busca deve exigir o ID do paciente como parâmetro obrigatório.

**Critério de Aceitação 2:** A listagem deve ser retornada em ordem cronológica decrescente (do registro mais recente para o mais antigo).

**Critério de Aceitação 3:** O retorno deve suportar paginação, limitando a resposta a um tamanho de página definido pelo cliente (ex.: 20 ou 50 itens).

### RF04: Fornecer Resumo Clínico para Integração

**Descrição:** O sistema deve disponibilizar os dados consolidados do paciente (ex.: CIDs ativos, alergias cadastradas nas observações) para consumo dos módulos G6, G7 e G12.

**Prioridade:** Média

**Critério de Aceitação 1:** O sistema deve expor um endpoint específico de leitura que retorne o JSON estruturado do resumo clínico.

**Critério de Aceitação 2:** A requisição só deve ser aceita se originada por um serviço interno autenticado, retornando 401 (Unauthorized) caso contrário.

---

## 3. Requisitos Não Funcionais (RNFs)

| ID        | Categoria           | Descrição Métrica e Testável                                                                                                                                                                                                                                                                                                                            |
| --------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RNF01** | Desempenho          | A consulta de listagem do histórico clínico (primeira página, limite de 20 registros) deve retornar em um tempo máximo de resposta de 500 ms no percentil 95 (P95), sob uma carga concorrente de 100 requisições simultâneas.                                                                                                                           |
| **RNF02** | Segurança           | 100% das requisições para APIs do módulo G5 devem exigir um token JWT válido assinado (ex.: via RS256). O acesso de escrita aos registros clínicos só será permitido se o token contiver a role MEDICO ou ENFERMEIRO.                                                                                                                                   |
| **RNF03** | Usabilidade         | A interface de usuário (frontend) desenvolvida para consulta de histórico deve permitir que o profissional acesse os detalhes de um registro clínico com, no máximo, 2 cliques a partir da tela principal de listagem do paciente.                                                                                                                      |
| **RNF04** | Interoperabilidade  | Toda a comunicação de entrada e saída do módulo G5 com os módulos externos (G4, G6, G7, G12) deve ocorrer exclusivamente através de APIs RESTful, utilizando o formato estruturado application/json aderente à especificação OpenAPI 3.0.                                                                                                               |
| **RNF05** | Conformidade (LGPD) | Todos os dados sensíveis de saúde (texto das observações, diagnósticos e sintomas) devem ser obrigatoriamente criptografados em repouso no banco de dados utilizando o algoritmo AES-256. O sistema deve registrar um log de auditoria persistente e imutável para toda leitura de histórico, contendo: user_id, paciente_id, timestamp e IP de origem. |
| **RNF06** | Disponibilidade     | O módulo G5 deve garantir um SLA de tempo de atividade de 99,9%, medido mensalmente (tolerância de inatividade de, no máximo, 43 minutos e 49 segundos por mês).                                                                                                                                                                                        |

---

## 4. Matriz de Rastreabilidade Inicial

A tabela abaixo cruza o requisito funcional, o Caso de Uso (UC) no qual ele é exercitado na prática clínica, a interface técnica correspondente (Endpoints de API) e as integrações necessárias.

| ID RF    | Caso de Uso (UC) Associado         | Método HTTP | Mapeamento de Endpoint (API REST)                   | Observações e Integrações                                                       |
| -------- | ---------------------------------- | ----------- | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| **RF01** | UC01 - Registrar Evolução Clínica  | POST        | `/api/v1/consultas/{consulta_id}/prontuarios`       | Consome status validado do módulo G4.                                           |
| **RF02** | UC02 - Corrigir/Retificar Registro | POST        | `/api/v1/prontuarios/{prontuario_id}/retificacoes`  | Cria nova versão. PUT/PATCH/DELETE estarão bloqueados via Gateway (Erro 405).   |
| **RF03** | UC03 - Visualizar Linha do Tempo   | GET         | `/api/v1/pacientes/{paciente_id}/historico-clinico` | Retorna base visual para profissionais. Suporta query params `?page=1&size=20`. |
| **RF04** | UC04 - Resgatar Contexto Clínico   | GET         | `/api/v1/internos/pacientes/{paciente_id}/resumo`   | Retorna JSON base estruturado para consumo interno dos módulos G6, G7 e G12.    |

---

## Apêndice: Declaração de Uso de IA

**Ferramentas Utilizadas:** _(Preencha aqui quais IAs seu grupo utilizou, por exemplo: Gemini, ChatGPT, etc.)_ **Forma de Uso:** A Inteligência Artificial foi utilizada como ferramenta de apoio à formatação, revisão ortográfica e padronização técnica dos requisitos levantados pelo grupo, garantindo a clareza e aderência às métricas exigidas pelo documento de Engenharia de Software. Todo o contexto clínico, regras de negócio e validação dos critérios foram revisados manualmente pelos integrantes do grupo.
