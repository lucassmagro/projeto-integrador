erDiagram
usuario_profissional ||--o{ registro_clinico : registra
usuario_profissional ||--o{ adendo_clinico : cria
usuario_profissional ||--o{ retificacao : autoriza
prontuario ||--o{ registro_clinico : possui
prontuario ||--o{ alergia : tem
registro_clinico ||--o{ diagnostico : contem
registro_clinico ||--o{ sintoma : contem
registro_clinico ||--o{ observacao_clinica : contem
registro_clinico ||--o{ adendo_clinico : complementado_por
registro_clinico ||--o| retificacao : original_de

    usuario_profissional {
        uuid id PK
        varchar nome
        enum role "MEDICO|ENFERMEIRO|AUDITOR"
    }
    prontuario {
        uuid id PK
        uuid paciente_id "ref G1 (sem FK fisica)"
        timestamp data_criacao
    }
    alergia {
        uuid id PK
        uuid prontuario_id FK
        varchar descricao
    }
    registro_clinico {
        uuid id PK
        uuid prontuario_id FK
        uuid consulta_id "ref G4 (sem FK fisica)"
        uuid profissional_id FK
        enum tipo
        enum status "ATIVO|RETIFICADO"
        timestamp data_registro
    }
    diagnostico {
        uuid id PK
        uuid registro_id FK
        varchar codigo_cid
        varchar descricao
        boolean ativo
    }
    sintoma {
        uuid id PK
        uuid registro_id FK
        varchar descricao
        smallint intensidade "CHECK 1..10"
    }
    observacao_clinica {
        uuid id PK
        uuid registro_id FK
        varchar descricao
    }
    adendo_clinico {
        uuid id PK
        uuid registro_id FK
        uuid profissional_id FK
        varchar descricao
        timestamp data_criacao
    }
    retificacao {
        uuid id PK
        uuid registro_original_id FK "UNIQUE"
        uuid registro_corrigido_id FK
        uuid profissional_id FK
        varchar motivo
        timestamp data_criacao
    }
    log_auditoria {
        uuid id PK
        uuid usuario_id
        uuid paciente_id
        varchar ip_origem
        varchar acao_executada
        timestamp data_hora
    }
