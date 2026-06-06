-- =============================================================================
-- PROJETO INTEGRADOR 2026 - Banco de Dados 1
-- Modulo: G5 - Prontuario (unica fonte de verdade clinica do paciente)
-- SGBD: PostgreSQL 16
-- Padrao de nomes: snake_case, sem acentuacao
-- Modelagem normalizada ate a 3FN
-- =============================================================================

-- =============================================================================
-- 0. TIPOS ENUMERADOS (espelham os enums do diagrama de classes)
-- =============================================================================

CREATE TYPE role_profissional AS ENUM ('MEDICO', 'ENFERMEIRO', 'AUDITOR');

CREATE TYPE status_registro   AS ENUM ('ATIVO', 'RETIFICADO');

CREATE TYPE tipo_registro     AS ENUM (
    'EVOLUCAO_MEDICA',
    'EVOLUCAO_ENFERMAGEM',
    'ANAMNESE',
    'OBSERVACAO_ENFERMAGEM'
);

-- =============================================================================
-- 1. TABELAS
-- =============================================================================

-- Profissional de saude autorizado a registrar (RNF02).
CREATE TABLE usuario_profissional (
    id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome  VARCHAR(150)      NOT NULL,
    role  role_profissional NOT NULL
);

-- Raiz do agregado. paciente_id referencia G1 (outro modulo): sem FK fisica,
-- pois o dado vive em outro banco -- padrao de microsservicos.
CREATE TABLE prontuario (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id  UUID      NOT NULL,
    data_criacao TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_prontuario_paciente UNIQUE (paciente_id)
);

-- Alergias relevantes do paciente (compoem o resumo clinico - RF04).
CREATE TABLE alergia (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prontuario_id UUID         NOT NULL,
    descricao     VARCHAR(200) NOT NULL,
    CONSTRAINT fk_alergia_prontuario
        FOREIGN KEY (prontuario_id) REFERENCES prontuario (id)
);

-- Registro clinico imutavel (RF01/RF02). consulta_id referencia G4 (sem FK fisica).
CREATE TABLE registro_clinico (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prontuario_id   UUID            NOT NULL,
    consulta_id     UUID            NOT NULL,
    profissional_id UUID            NOT NULL,
    tipo            tipo_registro   NOT NULL,
    status          status_registro NOT NULL DEFAULT 'ATIVO',
    data_registro   TIMESTAMP       NOT NULL DEFAULT now(),
    CONSTRAINT fk_registro_prontuario
        FOREIGN KEY (prontuario_id)   REFERENCES prontuario (id),
    CONSTRAINT fk_registro_profissional
        FOREIGN KEY (profissional_id) REFERENCES usuario_profissional (id)
);

CREATE INDEX idx_registro_prontuario ON registro_clinico (prontuario_id);
CREATE INDEX idx_registro_consulta   ON registro_clinico (consulta_id);

-- Diagnosticos do registro (1..*).
CREATE TABLE diagnostico (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_id UUID         NOT NULL,
    codigo_cid  VARCHAR(10)  NOT NULL,
    descricao   VARCHAR(500) NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_diagnostico_registro
        FOREIGN KEY (registro_id) REFERENCES registro_clinico (id)
);

-- Sintomas do registro (0..*).
CREATE TABLE sintoma (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_id UUID         NOT NULL,
    descricao   VARCHAR(500) NOT NULL,
    intensidade SMALLINT     NOT NULL,
    CONSTRAINT fk_sintoma_registro
        FOREIGN KEY (registro_id) REFERENCES registro_clinico (id),
    CONSTRAINT ck_sintoma_intensidade CHECK (intensidade BETWEEN 1 AND 10)
);

-- Observacoes clinicas do registro (0..*).
CREATE TABLE observacao_clinica (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_id UUID          NOT NULL,
    descricao   VARCHAR(1000) NOT NULL,
    CONSTRAINT fk_observacao_registro
        FOREIGN KEY (registro_id) REFERENCES registro_clinico (id)
);

-- Adendo: complementacao posterior sem alterar o original (RF05).
CREATE TABLE adendo_clinico (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_id     UUID          NOT NULL,
    profissional_id UUID          NOT NULL,
    descricao       VARCHAR(1000) NOT NULL,
    data_criacao    TIMESTAMP     NOT NULL DEFAULT now(),
    CONSTRAINT fk_adendo_registro
        FOREIGN KEY (registro_id)     REFERENCES registro_clinico (id),
    CONSTRAINT fk_adendo_profissional
        FOREIGN KEY (profissional_id) REFERENCES usuario_profissional (id)
);

-- Retificacao: correcao legal que aponta para o original e gera novo registro (RF02).
CREATE TABLE retificacao (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_original_id UUID         NOT NULL,
    registro_corrigido_id UUID        NOT NULL,
    profissional_id      UUID         NOT NULL,
    motivo               VARCHAR(500) NOT NULL,
    data_criacao         TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT fk_retif_original
        FOREIGN KEY (registro_original_id)  REFERENCES registro_clinico (id),
    CONSTRAINT fk_retif_corrigido
        FOREIGN KEY (registro_corrigido_id) REFERENCES registro_clinico (id),
    CONSTRAINT fk_retif_profissional
        FOREIGN KEY (profissional_id)       REFERENCES usuario_profissional (id),
    CONSTRAINT uq_retif_original UNIQUE (registro_original_id)
);

-- Trilha de auditoria persistente (RNF05 / LGPD).
CREATE TABLE log_auditoria (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID         NOT NULL,
    paciente_id     UUID         NOT NULL,
    ip_origem       VARCHAR(45)  NOT NULL,
    acao_executada  VARCHAR(100) NOT NULL,
    data_hora       TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_auditoria_paciente ON log_auditoria (paciente_id);

-- =============================================================================
-- 2. VIEW - Resumo Clinico (RF04)
-- Consumida por G6 (Receitas), G7 (Exames) e G12 (Telemedicina).
-- Entrega diagnosticos ativos, alergias e ultima atualizacao por paciente.
-- =============================================================================

CREATE OR REPLACE VIEW vw_resumo_clinico AS
SELECT
    p.id          AS prontuario_id,
    p.paciente_id AS paciente_id,
    (
        SELECT COUNT(*)
        FROM diagnostico d
        JOIN registro_clinico rc ON rc.id = d.registro_id
        WHERE rc.prontuario_id = p.id
          AND rc.status = 'ATIVO'
          AND d.ativo
    ) AS qtd_diagnosticos_ativos,
    (
        SELECT ARRAY_AGG(DISTINCT d.codigo_cid)
        FROM diagnostico d
        JOIN registro_clinico rc ON rc.id = d.registro_id
        WHERE rc.prontuario_id = p.id
          AND rc.status = 'ATIVO'
          AND d.ativo
    ) AS cids_ativos,
    (
        SELECT ARRAY_AGG(a.descricao)
        FROM alergia a
        WHERE a.prontuario_id = p.id
    ) AS alergias,
    (
        SELECT MAX(rc.data_registro)
        FROM registro_clinico rc
        WHERE rc.prontuario_id = p.id
          AND rc.status = 'ATIVO'
    ) AS ultima_atualizacao
FROM prontuario p;

-- =============================================================================
-- 3. TRIGGER - Imutabilidade do registro clinico (RF02)
-- Bloqueia DELETE fisico e qualquer UPDATE, exceto a transicao controlada
-- de status ATIVO -> RETIFICADO (usada exclusivamente pela procedure).
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_impedir_alteracao_registro()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        RAISE EXCEPTION
            'RF02: exclusao fisica de registro clinico nao permitida. Utilize retificacao.';
    END IF;

    -- TG_OP = 'UPDATE': nenhum dado clinico pode ser sobrescrito.
    IF (NEW.id              IS DISTINCT FROM OLD.id
        OR NEW.prontuario_id   IS DISTINCT FROM OLD.prontuario_id
        OR NEW.consulta_id     IS DISTINCT FROM OLD.consulta_id
        OR NEW.profissional_id IS DISTINCT FROM OLD.profissional_id
        OR NEW.tipo            IS DISTINCT FROM OLD.tipo
        OR NEW.data_registro   IS DISTINCT FROM OLD.data_registro) THEN
        RAISE EXCEPTION
            'RF02: sobrescrita de dados clinicos nao permitida.';
    END IF;

    IF NOT (OLD.status = 'ATIVO' AND NEW.status = 'RETIFICADO') THEN
        RAISE EXCEPTION
            'RF02: unica alteracao permitida e a transicao ATIVO -> RETIFICADO via retificacao.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_imutabilidade_registro
    BEFORE UPDATE OR DELETE ON registro_clinico
    FOR EACH ROW
    EXECUTE FUNCTION fn_impedir_alteracao_registro();

-- =============================================================================
-- 4. STORED PROCEDURE - Registrar Retificacao (RF02 + RNF02 + RNF05)
-- Operacao atomica: valida o profissional, cria o registro corrigido,
-- marca o original como RETIFICADO, grava a retificacao e a auditoria.
-- =============================================================================

CREATE OR REPLACE PROCEDURE sp_registrar_retificacao(
    p_registro_original_id UUID,
    p_profissional_id      UUID,
    p_motivo               VARCHAR,
    p_tipo                 tipo_registro,
    p_ip_origem            VARCHAR
)
LANGUAGE plpgsql AS $$
DECLARE
    v_role          role_profissional;
    v_prontuario_id UUID;
    v_consulta_id   UUID;
    v_paciente_id   UUID;
    v_novo_id       UUID;
BEGIN
    -- RNF02: somente MEDICO ou ENFERMEIRO podem registrar.
    SELECT role INTO v_role
    FROM usuario_profissional
    WHERE id = p_profissional_id;

    IF v_role IS NULL THEN
        RAISE EXCEPTION 'Profissional % inexistente.', p_profissional_id;
    END IF;

    IF v_role NOT IN ('MEDICO', 'ENFERMEIRO') THEN
        RAISE EXCEPTION 'RNF02: role % nao autorizada a retificar.', v_role;
    END IF;

    -- Recupera contexto do registro original (deve estar ATIVO).
    SELECT rc.prontuario_id, rc.consulta_id, p.paciente_id
    INTO   v_prontuario_id, v_consulta_id, v_paciente_id
    FROM   registro_clinico rc
    JOIN   prontuario p ON p.id = rc.prontuario_id
    WHERE  rc.id = p_registro_original_id
      AND  rc.status = 'ATIVO';

    IF v_prontuario_id IS NULL THEN
        RAISE EXCEPTION 'Registro original inexistente ou ja retificado.';
    END IF;

    -- Cria o novo registro (correcao).
    INSERT INTO registro_clinico (prontuario_id, consulta_id, profissional_id, tipo, status)
    VALUES (v_prontuario_id, v_consulta_id, p_profissional_id, p_tipo, 'ATIVO')
    RETURNING id INTO v_novo_id;

    -- Marca o original como RETIFICADO (transicao permitida pelo trigger).
    UPDATE registro_clinico
    SET status = 'RETIFICADO'
    WHERE id = p_registro_original_id;

    -- Registra o vinculo da retificacao.
    INSERT INTO retificacao (registro_original_id, registro_corrigido_id, profissional_id, motivo)
    VALUES (p_registro_original_id, v_novo_id, p_profissional_id, p_motivo);

    -- RNF05 / LGPD: auditoria persistente da operacao.
    INSERT INTO log_auditoria (usuario_id, paciente_id, ip_origem, acao_executada)
    VALUES (p_profissional_id, v_paciente_id, p_ip_origem, 'RETIFICAR_REGISTRO');
END;
$$;
