flowchart LR
%% ─────────────────────────────────────────────────────────────
%% ATORES
%% Profissional: ator primário que inicia os casos de uso de
%% escrita e consulta clínica (RF01, RF02, RF03).
%% Sistemas do Ecossistema: atores secundários (G6, G7, G12) que
%% consomem dados do prontuário via integração interna (RF04).
%% G4 (Consultas): sistema externo cujo status é validado antes
%% de qualquer registro clínico ser persistido (RF01).
%% ─────────────────────────────────────────────────────────────
Profissional["Profissional de Saúde\n(Médico / Enfermeiro)"]
Sistemas["Sistemas do Ecossistema\n(G6, G7, G12)"]
G4["Módulo G4\n(Consultas)"]

    %% ─────────────────────────────────────────────────────────────
    %% FRONTEIRA DO SISTEMA — Módulo G5 (Prontuário)
    %% Todos os casos de uso residem dentro deste módulo.
    %% UC01..UC04 são os casos de uso principais (derivados dos RFs).
    %% UC_Validar e UC_Log são casos de uso de suporte, sempre
    %% incluídos por outros UCs via relacionamento <<include>>.
    %% ─────────────────────────────────────────────────────────────
    subgraph G5 ["Módulo G5 - Prontuário"]
        direction TB

        %% Casos de uso principais
        UC1([UC01: Registrar Evolução Clínica])
        UC2([UC02: Registrar Retificação])
        UC3([UC03: Consultar Histórico Clínico])
        UC4([UC04: Obter Resumo Clínico])

        %% Casos de uso de suporte (incluídos)
        %% UC_Validar: garante que só consultas com status REALIZADA
        %% originem registros clínicos (RF01 — critério de aceitação 1).
        UC_Validar([Validar Status da Consulta])

        %% UC_Log: registra toda operação de leitura e escrita em
        %% log imutável de auditoria, exigência LGPD (RNF05).
        UC_Log([Registrar Log de Auditoria - LGPD])
    end

    %% ─────────────────────────────────────────────────────────────
    %% RELACIONAMENTOS: Ator → Casos de Uso Principais
    %% O Profissional inicia os fluxos de registro e consulta.
    %% Os Sistemas do Ecossistema acessam apenas o resumo clínico.
    %% ─────────────────────────────────────────────────────────────
    Profissional --> UC1
    Profissional --> UC2
    Profissional --> UC3
    Sistemas --> UC4

    %% ─────────────────────────────────────────────────────────────
    %% RELACIONAMENTOS: <<include>> — Validação
    %% UC01 obrigatoriamente inclui a validação da consulta no G4
    %% antes de persistir qualquer dado clínico.
    %% ─────────────────────────────────────────────────────────────
    UC1 -. "<< include >>" .-> UC_Validar

    %% ─────────────────────────────────────────────────────────────
    %% RELACIONAMENTOS: <<include>> — Auditoria
    %% Todo caso de uso (leitura e escrita) inclui o registro de
    %% log de auditoria, garantindo rastreabilidade completa (RNF05).
    %% ─────────────────────────────────────────────────────────────
    UC1 -. "<< include >>" .-> UC_Log
    UC2 -. "<< include >>" .-> UC_Log
    UC3 -. "<< include >>" .-> UC_Log
    UC4 -. "<< include >>" .-> UC_Log

    %% ─────────────────────────────────────────────────────────────
    %% INTEGRAÇÃO EXTERNA
    %% UC_Validar consome a API REST do módulo G4 para verificar
    %% se a consulta existe e possui status = REALIZADA (RF01).
    %% ─────────────────────────────────────────────────────────────
    UC_Validar -->|Consome API| G4

    classDef actor fill:#f4f4f4,stroke:#333,stroke-width:2px;
    classDef usecase fill:#e1f5fe,stroke:#00838f,stroke-width:2px,color:#000;
    classDef system fill:#ffffff,stroke:#999,stroke-width:2px,stroke-dasharray: 5 5;

    class Profissional,Sistemas,G4 actor;
    class UC1,UC2,UC3,UC4,UC_Validar,UC_Log usecase;
    class G5 system;
