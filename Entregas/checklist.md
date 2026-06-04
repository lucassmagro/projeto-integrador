# Checklist Geral do Projeto Integrador: G5 - Prontuário

## Entrega 1: Concepção (Peso: 20%)

- [ ] Escrever a Visão do Produto (Problema, público-alvo e papel do G5 no ecossistema).

- [ ] Levantar e descrever os Requisitos Funcionais (RFs) do Prontuário com critérios de aceitação.

- [ ] Definir os Requisitos Não Funcionais (RNFs) mensuráveis (Desempenho, Segurança/LGPD, Usabilidade).

- [ ] Construir a Matriz de Rastreabilidade Inicial (RFs $\rightarrow$ Casos de Uso $\rightarrow$ Endpoints).

- [ ] Escrever o apêndice de declaração de uso de IA para a Entrega 1.

## Entrega 2: Modelagem e Arquitetura (Peso: 25%)

- [ ] Desenhar o Diagrama de Casos de Uso em UML (Cobrindo todos os RFs).

- [ ] Documentar o passo a passo de ao menos 3 Casos de Uso críticos (Fluxos principais, alternativos e exceções).

- [ ] Criar o Diagrama de Classes do módulo de Prontuário (coerente com o modelo de dados).

- [ ] Modelar Diagramas de Sequência para consumo da API do G4 (Consultas).

- [ ] Modelar Diagramas de Sequência para fornecimento de API aos módulos G6 (Receitas), G7 (Exames) e G12 (Telemedicina).

- [ ] Atualizar o apêndice de declaração de uso de IA para a Entrega 2.

## Entrega 3: Processo e Qualidade (Peso: 25%)

- [ ] Configurar o quadro Kanban no GitHub Projects (formato Entrega $\rightarrow$ Histórias $\rightarrow$ Tarefas).

- [ ] Enviar o link do board compartilhado para o e-mail do professor (cidinei.cassol@unoesc.edu.br).

- [ ] Realizar o Planejamento de Sprints (Alocar tarefas em pelo menos 3 Sprints).

- [ ] Documentar a Política de Versionamento e Branching (Fluxo do Git, padrão de commits e branches).

- [ ] Elaborar o Plano de Testes (Estratégia de pirâmide: unitário, integração, ponta a ponta).

- [ ] Escrever e implementar no mínimo 5 Casos de Teste focados nos RFs prioritários.

- [ ] Conduzir e documentar pelo menos uma cerimônia de Retrospectiva (o que foi bem, o que foi mal, ações de melhoria).

- [ ] Capturar evidências de execução (Printscreens mostrando movimentação real do board).

- [ ] Atualizar o apêndice de declaração de uso de IA para a Entrega 3.

## Entrega 4: Encerramento e Defesa (Peso: 30%)

- [ ] Escrever o arquivo `README.md` completo no repositório (Visão geral, stack, como rodar localmente, link da API e contatos do grupo).

- [ ] Elaborar a Retrospectiva Final do Projeto (2 a 4 páginas com lições aprendidas pelo grupo e individualmente).

- [ ] Preparar os slides e roteiro da Defesa Oral de 20 a 30 minutos (Apresentação dos constructos de Engenharia de Software e decisões arquiteturais).

- [ ] Revisar os artefatos finais e fechar a declaração geral de uso de IA.

## Entrega: Implementação e Integração (Código)

- [ ] Implementar a modelagem do Banco de Dados para o Prontuário (Tabelas de histórico e registros clínicos).

- [ ] Desenvolver o endpoint de Registro Clínico (Garantindo validação rigorosa de consulta ativa e impedindo registros sem consulta).

- [ ] Desenvolver o endpoint de Consulta de Histórico (Garantindo que nenhuma informação seja sobrescrita ou deletada).

- [ ] Desenvolver script/rotina de integração REST para consumir dados do módulo G4 (Consultas).

- [ ] Configurar CORS e documentar endpoints REST fornecidos para as APIs do G6, G7 e G12.
