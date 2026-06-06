erDiagram

    prontuario {
        bigserial id PK
        bigint    paciente_id  "ref. G1 (sem FK física)"
        timestamp data_criacao
    }

    tipo_registro {
        serial      id        PK
        varchar50   descricao UK
    }

    registro_clinico {
        bigserial id            PK
        bigint    prontuario_id FK
        bigint    consulta_id      "ref. G4 (sem FK física)"
        bigint    medico_id        "ref. G2 (sem FK física)"
        integer   tipo_registro_id FK
        text      diagnostico      "AES-256 em repouso"
        text      sintomas         "AES-256 em repouso"
        text      observacoes      "AES-256 em repouso"
        timestamp data_registro
        boolean   retificado
    }

    retificacao_registro {
        bigserial id                  PK
        bigint    registro_clinico_id FK
        bigint    medico_id              "ref. G2 (sem FK física)"
        text      motivo_retificacao
        text      conteudo_anterior
        text      conteudo_novo
        timestamp data_retificacao
    }

    audit_log {
        bigserial id          PK
        bigint    user_id
        bigint    paciente_id
        varchar20 acao           "CHECK: ESCRITA | LEITURA | RETIFICACAO"
        timestamp data_hora
        varchar45 ip_origem
    }

    prontuario         ||--o{ registro_clinico     : "possui"
    tipo_registro      ||--o{ registro_clinico     : "classifica"
    registro_clinico   ||--o{ retificacao_registro : "retificado por"
