import banco from "../Banco.js";
import RetificacaoRegistro from "../models/RetificacaoRegistro.js";
import RegistroClinico from "../models/RegistroClinico.js";

async function listarPorRegistro(req, res) {
  const registro_clinico_id = req.params.registro_clinico_id;

  try {
    const retificacoes = await RetificacaoRegistro.findAll({
      where: { registro_clinico_id },
      order: [["data_retificacao", "DESC"]],
    });
    return res.json(retificacoes);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

async function inserir(req, res) {
  const {
    registro_clinico_id,
    motivo_retificacao,
    conteudo_anterior,
    conteudo_novo,
  } = req.body;

  try {
    const registroOriginal =
      await RegistroClinico.findByPk(registro_clinico_id);
    if (!registroOriginal) {
      return res
        .status(404)
        .json({ mensagem: "Registro clínico original não encontrado." });
    }

    if (registroOriginal.retificado) {
      return res
        .status(422)
        .json({ mensagem: "Este registro já foi retificado." });
    }

    const retificacao = await RetificacaoRegistro.create({
      registro_clinico_id,
      //medico_id,
      motivo_retificacao,
      conteudo_anterior,
      conteudo_novo,
    });

    await banco.query(
      "UPDATE sistema.registro_clinico SET retificado = true WHERE id = :id",
      { replacements: { id: registro_clinico_id } },
    );

    return res.status(201).json(retificacao);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

export default { listarPorRegistro, inserir };
