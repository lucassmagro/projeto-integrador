export const TIPO_REGISTRO_LABELS = {
  EVOLUCAO_MEDICA: "Evolução Médica",
  EVOLUCAO_ENFERMAGEM: "Evolução de Enfermagem",
  ANAMNESE: "Anamnese",
  OBSERVACAO: "Observação",
  RETORNO: "Retorno Clínico",
};

export const labelTipo = (descricao) =>
  TIPO_REGISTRO_LABELS[descricao] ?? descricao;
