export const TIPO_REGISTRO_LABELS = {
  EVOLUCAO_MEDICA:       'Evolução Médica',
  EVOLUCAO_ENFERMAGEM:   'Evolução de Enfermagem',
  ANAMNESE:              'Anamnese',
  OBSERVACAO_ENFERMAGEM: 'Observação de Enfermagem',
};

export const labelTipo = (descricao) =>
  TIPO_REGISTRO_LABELS[descricao] ?? descricao;
