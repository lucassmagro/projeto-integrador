import RegistroClinico from "../models/RegistroClinico.js";
import banco from "../Banco.js";
import { QueryTypes } from "sequelize";

async function listar(req, res) {
  const dados = await RegistroClinico.findAll({
    order: [["data_registro", "DESC"]],
  });
  return res.json(dados);
}

async function selecionar(req, res) {
  const id = req.params.id;
  const dados = await RegistroClinico.findByPk(id);
  if (!dados) {
    return res.status(404).json({ mensagem: "Registro não encontrado." });
  }
  return res.json(dados);
}

// G4 indisponível, dados informados manualmente
async function inserir(req, res) {
  const {
    consulta_id,
    paciente_id,
    medico_id,
    tipo_registro_id,
    diagnostico,
    sintomas,
    observacoes,
  } = req.body;

  if (!paciente_id || !consulta_id || !medico_id) {
    return res.status(422).json({
      mensagem: "paciente_id, consulta_id e medico_id são obrigatórios.",
    });
  }

  try {
    // Valida antes da SP para evitar erro genérico de FK
    const tipoValido = await banco.query(
      "SELECT id FROM sistema.tipo_registro WHERE id = :id",
      {
        replacements: { id: Number(tipo_registro_id) },
        type: QueryTypes.SELECT,
      },
    );
    if (!tipoValido.length) {
      return res.status(422).json({ mensagem: "Tipo de registro inválido." });
    }

    // Cria via stored procedure, exigência de BD1
    await banco.query(
      `CALL sistema.sp_registrar_evolucao_clinica(
        :p_paciente_id, :p_consulta_id, :p_medico_id,
        :p_tipo_registro_id, :p_diagnostico, :p_sintomas, :p_observacoes
      )`,
      {
        replacements: {
          p_paciente_id: Number(paciente_id),
          p_consulta_id: Number(consulta_id),
          p_medico_id: Number(medico_id),
          p_tipo_registro_id: Number(tipo_registro_id),
          p_diagnostico: diagnostico || null,
          p_sintomas: sintomas || null,
          p_observacoes: observacoes || null,
        },
      },
    );

    return res
      .status(201)
      .json({ mensagem: "Registro clínico criado com sucesso." });
  } catch (erro) {
    return res.status(422).json({
      mensagem:
        "Erro ao criar registro clínico. Verifique os dados e tente novamente.",
    });
  }
}

export default { listar, selecionar, inserir };
