-- =============================================================================
-- G5 - Prontuario | Script de demonstracao (seed + evidencia dos artefatos)
-- Dados ficticios para testes sem dependencia dos modulos externos (G1, G4).
-- =============================================================================

SET search_path TO sistema;

-- ---------------------------------------------------------------------------
-- SEED
-- ---------------------------------------------------------------------------

INSERT INTO usuario_profissional (nome, role) VALUES
    ('Dra. Ana Costa',      'MEDICO'),      -- id: 1
    ('Enf. Bruno Lima',     'ENFERMEIRO'),  -- id: 2
    ('Aud. Carla Reis',     'AUDITOR'),     -- id: 3
    ('Dr. Pedro Alves',     'MEDICO'),      -- id: 4
    ('Enf. Julia Mendes',   'ENFERMEIRO');  -- id: 5

-- paciente_id representa referencia externa ao modulo G1
INSERT INTO prontuario (paciente_id) VALUES
    (1001),  -- id: 1
    (1002),  -- id: 2
    (1003);  -- id: 3

INSERT INTO alergia (prontuario_id, descricao) VALUES
    (1, 'Penicilina'),
    (1, 'Dipirona'),
    (2, 'AAS'),
    (3, 'Ibuprofeno');

-- consulta_id representa referencia externa ao modulo G4
INSERT INTO registro_clinico (prontuario_id, consulta_id, profissional_id, tipo) VALUES
    (1, 201, 1, 'EVOLUCAO_MEDICA'),         -- id: 1  paciente 1001
    (1, 202, 2, 'OBSERVACAO_ENFERMAGEM'),   -- id: 2  paciente 1001
    (1, 203, 1, 'ANAMNESE'),               -- id: 3  paciente 1001
    (2, 204, 4, 'EVOLUCAO_MEDICA'),         -- id: 4  paciente 1002
    (2, 205, 5, 'EVOLUCAO_ENFERMAGEM'),     -- id: 5  paciente 1002
    (3, 206, 1, 'ANAMNESE');               -- id: 6  paciente 1003

INSERT INTO diagnostico (registro_id, codigo_cid, descricao) VALUES
    (1, 'J11',  'Influenza nao identificada - paciente com quadro gripal'),
    (2, 'Z00',  'Exame geral de rotina'),
    (3, 'J45',  'Asma persistente leve'),
    (4, 'I10',  'Hipertensao arterial primaria'),
    (5, 'E11',  'Diabetes mellitus tipo 2 sem complicacoes'),
    (6, 'M54',  'Dorsalgia - dor lombar cronica');

INSERT INTO sintoma (registro_id, descricao, intensidade) VALUES
    (1, 'Febre alta, cefaleia intensa e mialgia',        7),
    (2, 'Dispneia leve ao esforco',                      4),
    (3, 'Crises de broncoespasmo noturnas',              6),
    (4, 'Cefaleia occipital e tontura postural',         5),
    (5, 'Poliuria, polidipsia e fadiga cronica',         6),
    (6, 'Dor lombar irradiada para membro inferior direito', 8);

INSERT INTO observacao_clinica (registro_id, descricao) VALUES
    (1, 'Paciente orientado a repouso, hidratacao e uso de antitermico'),
    (2, 'Saturacao O2 98%, PA 120x80 mmHg, FC 78 bpm'),
    (3, 'Prescrito broncodilatador e corticoide inalatorio'),
    (4, 'Inicio de anti-hipertensivo, retorno em 15 dias'),
    (5, 'Encaminhado ao endocrinologista, dieta hipoglicidica orientada'),
    (6, 'Solicitado RX coluna lombar e encaminhamento para fisioterapia');

-- ---------------------------------------------------------------------------
-- EVIDENCIA DO TRIGGER (RF02 - imutabilidade)
-- Tenta DELETE e UPDATE proibidos, captura os erros esperados.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
    DELETE FROM registro_clinico WHERE id = 1;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO ESPERADO (RF02 - DELETE): %', SQLERRM;
END;
$$;

DO $$
BEGIN
    UPDATE registro_clinico SET tipo = 'ANAMNESE' WHERE id = 1;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO ESPERADO (RF02 - UPDATE tipo): %', SQLERRM;
END;
$$;

-- ---------------------------------------------------------------------------
-- EVIDENCIA DA STORED PROCEDURE (retificacao com sucesso)
-- Dra. Ana Costa (MEDICO, id=1) retifica o registro 1 do paciente 1001.
-- ---------------------------------------------------------------------------

CALL sp_registrar_retificacao(
    1,
    1,
    'Correcao de diagnostico: Influenza confirmada por teste rapido',
    'EVOLUCAO_MEDICA',
    '192.168.1.10'
);

-- Apos a SP: registro 1 fica RETIFICADO, registro 7 e criado como correcao.
-- Inserir diagnostico e sintoma no registro corrigido (id=7):
INSERT INTO diagnostico (registro_id, codigo_cid, descricao) VALUES
    (7, 'J10', 'Influenza confirmada por identificacao de virus');

INSERT INTO sintoma (registro_id, descricao, intensidade) VALUES
    (7, 'Febre alta, cefaleia intensa e mialgia', 7);

-- ---------------------------------------------------------------------------
-- EVIDENCIA DA VIEW (vw_resumo_clinico)
-- ---------------------------------------------------------------------------

SELECT * FROM vw_resumo_clinico;

-- ---------------------------------------------------------------------------
-- EVIDENCIA DA STORED PROCEDURE (tentativa invalida - AUDITOR nao pode retificar)
-- ---------------------------------------------------------------------------

DO $$
BEGIN
    CALL sp_registrar_retificacao(
        2,
        3,
        'Tentativa indevida por auditor',
        'OBSERVACAO_ENFERMAGEM',
        '10.0.0.9'
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO ESPERADO (RNF02 - role invalida): %', SQLERRM;
END;
$$;

-- ---------------------------------------------------------------------------
-- VERIFICACOES FINAIS
-- ---------------------------------------------------------------------------

SELECT id, status, tipo, data_registro FROM registro_clinico ORDER BY id;
SELECT registro_original_id, registro_corrigido_id, motivo FROM retificacao;
SELECT usuario_id, paciente_id, ip_origem, acao_executada FROM log_auditoria;
