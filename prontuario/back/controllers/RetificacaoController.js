import banco from "../Banco.js";
import RetificacaoRegistro from "../models/RetificacaoRegistro.js";
import RegistroClinico from "../models/RegistroClinico.js";

async function getDiagnostico(registro_id) {
  const [rows] = await banco.query(
    "SELECT descricao FROM sistema.diagnostico WHERE registro_id = :id LIMIT 1",
    { replacements: { id: registro_id } }
  );
  return rows[0]?.descricao || null;
}

async function listarPorRegistro(req, res) {
  const registro_original_id = req.params.registro_clinico_id;

  const retificacoes = await RetificacaoRegistro.findAll({
    where: { registro_original_id },
    order: [["data_criacao", "DESC"]],
  });

  const lista = await Promise.all(retificacoes.map(async (r) => {
    const conteudo_anterior = await getDiagnostico(r.registro_original_id);
    const conteudo_novo = await getDiagnostico(r.registro_corrigido_id);
    return {
      id: r.id,
      medico_id: r.profissional_id,
      motivo_retificacao: r.motivo,
      conteudo_anterior: conteudo_anterior || "-",
      conteudo_novo: conteudo_novo || "-",
      data_retificacao: r.data_criacao,
    };
  }));

  return res.json(lista);
}

async function inserir(req, res) {
  const { registro_clinico_id, medico_id, motivo_retificacao, conteudo_anterior, conteudo_novo } = req.body;

  const registroOriginal = await RegistroClinico.findByPk(registro_clinico_id);
  if (!registroOriginal) {
    return res.status(404).json({ mensagem: "Registro clínico original não encontrado." });
  }

  if (registroOriginal.status === "RETIFICADO") {
    return res.status(422).json({ mensagem: "Este registro já foi retificado." });
  }

  // Cria o registro corrigido com o mesmo contexto do original
  const registroCorrigido = await RegistroClinico.create({
    prontuario_id: registroOriginal.prontuario_id,
    consulta_id: registroOriginal.consulta_id,
    profissional_id: medico_id,
    tipo: registroOriginal.tipo,
  });

  // Insere o diagnóstico corrigido no novo registro
  if (conteudo_novo) {
    await banco.query(
      "INSERT INTO sistema.diagnostico (registro_id, codigo_cid, descricao) VALUES (:rid, 'S99', :desc)",
      { replacements: { rid: registroCorrigido.id, desc: conteudo_novo } }
    );
  }

  // Marca o original como RETIFICADO (permitido pelo trigger: ATIVO -> RETIFICADO)
  await banco.query(
    "UPDATE sistema.registro_clinico SET status = 'RETIFICADO' WHERE id = :id",
    { replacements: { id: registro_clinico_id } }
  );

  // Registra o vínculo da retificação
  const retificacao = await RetificacaoRegistro.create({
    registro_original_id: registro_clinico_id,
    registro_corrigido_id: registroCorrigido.id,
    profissional_id: medico_id,
    motivo: motivo_retificacao,
  });

  return res.status(201).json(retificacao);
}

export default { listarPorRegistro, inserir };
