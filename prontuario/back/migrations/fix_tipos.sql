-- Migração de-para dos tipos de registro para os valores esperados pelo frontend.
-- Preserva TODOS os registros clínicos existentes (nenhum registro é apagado).
-- Executar manualmente no banco antes de rodar a aplicação. Não altera scripts.sql.

-- Passo 1: inserir os novos tipos (mantendo os antigos por ora)
INSERT INTO sistema.tipo_registro (descricao) VALUES
  ('EVOLUCAO_MEDICA'),
  ('EVOLUCAO_ENFERMAGEM'),
  ('ANAMNESE'),
  ('OBSERVACAO_ENFERMAGEM')
ON CONFLICT (descricao) DO NOTHING;

-- Passo 2: atualizar os registros clínicos apontando para os novos tipos.
-- Mapeamento: EVOLUCAO → EVOLUCAO_MEDICA, DIAGNOSTICO → EVOLUCAO_MEDICA,
--             SINTOMA → ANAMNESE, OBSERVACAO → OBSERVACAO_ENFERMAGEM
-- A trigger de imutabilidade (trg_bloquear_update_registro_clinico) bloqueia
-- UPDATE em tipo_registro_id. Ela é desabilitada APENAS durante esta migração
-- de dados e reabilitada logo em seguida — o fluxo da aplicação continua intacto.
ALTER TABLE sistema.registro_clinico
  DISABLE TRIGGER trg_bloquear_update_registro_clinico;

UPDATE sistema.registro_clinico
SET tipo_registro_id = (
  SELECT id FROM sistema.tipo_registro WHERE descricao = 'EVOLUCAO_MEDICA'
)
WHERE tipo_registro_id IN (
  SELECT id FROM sistema.tipo_registro WHERE descricao IN ('EVOLUCAO', 'DIAGNOSTICO')
);

UPDATE sistema.registro_clinico
SET tipo_registro_id = (
  SELECT id FROM sistema.tipo_registro WHERE descricao = 'ANAMNESE'
)
WHERE tipo_registro_id IN (
  SELECT id FROM sistema.tipo_registro WHERE descricao = 'SINTOMA'
);

UPDATE sistema.registro_clinico
SET tipo_registro_id = (
  SELECT id FROM sistema.tipo_registro WHERE descricao = 'OBSERVACAO_ENFERMAGEM'
)
WHERE tipo_registro_id IN (
  SELECT id FROM sistema.tipo_registro WHERE descricao = 'OBSERVACAO'
);

ALTER TABLE sistema.registro_clinico
  ENABLE TRIGGER trg_bloquear_update_registro_clinico;

-- Passo 3: remover os tipos antigos (agora sem referências)
DELETE FROM sistema.tipo_registro
WHERE descricao IN ('DIAGNOSTICO', 'SINTOMA', 'OBSERVACAO', 'EVOLUCAO');
