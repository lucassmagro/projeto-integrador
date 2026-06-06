-- =============================================================================
-- G5 - Prontuario | Script de demonstracao (seed + uso dos artefatos)
-- Evidencia que View, Stored Procedure e Trigger sao "utilizados pelo sistema".
-- =============================================================================

-- ---------------------------------------------------------------------------
-- SEED
-- ---------------------------------------------------------------------------
INSERT INTO usuario_profissional (id, nome, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Dra. Ana Costa',  'MEDICO'),
    ('22222222-2222-2222-2222-222222222222', 'Enf. Bruno Lima', 'ENFERMEIRO'),
    ('33333333-3333-3333-3333-333333333333', 'Aud. Carla Reis', 'AUDITOR');

INSERT INTO prontuario (id, paciente_id) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a1000000-0000-0000-0000-0000000000a1');

INSERT INTO alergia (prontuario_id, descricao) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Penicilina'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dipirona');

INSERT INTO registro_clinico (id, prontuario_id, consulta_id, profissional_id, tipo) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     'c0000000-0000-0000-0000-0000000000c4',
     '11111111-1111-1111-1111-111111111111',
     'EVOLUCAO_MEDICA');

INSERT INTO diagnostico (registro_id, codigo_cid, descricao) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'J11', 'Influenza'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'R50', 'Febre nao especificada');

INSERT INTO sintoma (registro_id, descricao, intensidade) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cefaleia', 6);

INSERT INTO observacao_clinica (registro_id, descricao) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Paciente orientado a repouso e hidratacao.');

\echo '== 1) VIEW vw_resumo_clinico (consumida por G6/G7/G12) =='
SELECT * FROM vw_resumo_clinico;

\echo '== 2) TRIGGER bloqueia DELETE fisico (RF02) =='
DELETE FROM registro_clinico WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

\echo '== 3) TRIGGER bloqueia sobrescrita de dado clinico (RF02) =='
UPDATE registro_clinico SET tipo = 'ANAMNESE'
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

\echo '== 4) PROCEDURE sp_registrar_retificacao (fluxo legal de correcao) =='
CALL sp_registrar_retificacao(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Correcao de CID lancado incorretamente',
    'EVOLUCAO_MEDICA',
    '200.100.10.5'
);

\echo '== 5) Estado apos a retificacao: original RETIFICADO + novo ATIVO =='
SELECT id, status, data_registro FROM registro_clinico ORDER BY data_registro;

\echo '== 6) Vinculo de retificacao gravado =='
SELECT registro_original_id, registro_corrigido_id, motivo FROM retificacao;

\echo '== 7) Auditoria LGPD gravada (RNF05) =='
SELECT usuario_id, paciente_id, ip_origem, acao_executada FROM log_auditoria;

\echo '== 8) PROCEDURE rejeita role nao autorizada (AUDITOR) - RNF02 =='
CALL sp_registrar_retificacao(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'Tentativa indevida',
    'EVOLUCAO_MEDICA',
    '10.0.0.9'
);
