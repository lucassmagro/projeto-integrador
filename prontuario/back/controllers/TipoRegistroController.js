import TipoRegistro from "../models/TipoRegistro.js";

async function listar(req, res) {
  const dados = await TipoRegistro.findAll({ order: [["id", "ASC"]] });
  return res.json(dados);
}

export default { listar };
