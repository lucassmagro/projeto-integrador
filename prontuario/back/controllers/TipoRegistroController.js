import TipoRegistro from "../models/TipoRegistro.js";

async function listar(req, res) {
  try {
    const dados = await TipoRegistro.findAll();
    return res.json(dados);
  } catch (erro) {
    console.error("Erro ao listar tipos de registro:", erro);
    return res.status(500).json({ error: "Erro ao carregar tipos de registro." });
  }
}

export default { listar };
