const TIPOS = [
  { id: 1, descricao: "EVOLUCAO_MEDICA" },
  { id: 2, descricao: "EVOLUCAO_ENFERMAGEM" },
  { id: 3, descricao: "ANAMNESE" },
  { id: 4, descricao: "OBSERVACAO_ENFERMAGEM" },
];

function listar(req, res) {
  return res.json(TIPOS);
}

export default { listar };
