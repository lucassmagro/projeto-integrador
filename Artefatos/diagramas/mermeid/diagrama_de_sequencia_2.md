sequenceDiagram
autonumber
participant API_G6 as G6 - Receitas
participant API_G5 as G5 - Prontuário
participant DB as Banco G5

    Note over API_G6,API_G5: Mesmo fluxo aplicável para G7 (Exames) e G12 (Telemedicina)

    API_G6->>API_G5: GET /api/v1/internos/pacientes/{paciente_id}/resumo

    API_G5->>DB: SELECT prontuário, diagnósticos ativos e alergias

    alt Paciente sem prontuário cadastrado
        DB-->>API_G5: vazio
        API_G5-->>API_G6: 404 Not Found
    else Prontuário encontrado
        DB-->>API_G5: dados do prontuário
        API_G5->>DB: INSERT LogAuditoria (LGPD — RNF05)
        API_G5-->>API_G6: 200 OK { ResumoClinico }
    end
