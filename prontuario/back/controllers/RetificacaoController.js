import RetificacaoRegistro from "../models/RetificacaoRegistro.js";
import RegistroClinico from "../models/RegistroClinico.js";

async function listarPorRegistro(req, res) {
  const registro_clinico_id = req.params.registro_clinico_id;
  const dados = await RetificacaoRegistro.findAll({
    where: { registro_clinico_id },
    order: [["data_retificacao", "DESC"]],
  });
  return res.json(dados);
}

async function inserir(req, res) {
  const { registro_clinico_id, medico_id, motivo_retificacao, conteudo_anterior, conteudo_novo } = req.body;

  // Verifica se o registro original existe
  const registro = await RegistroClinico.findByPk(registro_clinico_id);
  if (!registro) {
    return res.status(404).json({ mensagem: "Registro clínico original não encontrado." });
  }

  // Cria a retificação (o dado original NÃO é alterado)
  const retificacao = await RetificacaoRegistro.create({
    registro_clinico_id,
    medico_id,
    motivo_retificacao,
    conteudo_anterior,
    conteudo_novo,
  });

  // Marca o registro original como retificado
  await RegistroClinico.update(
    { retificado: true },
    { where: { id: registro_clinico_id } }
  );

  return res.status(201).json(retificacao);
}

export default { listarPorRegistro, inserir };
