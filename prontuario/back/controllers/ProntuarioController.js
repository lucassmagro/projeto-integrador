import Prontuario from "../models/Prontuario.js";
import RegistroClinico from "../models/RegistroClinico.js";
import banco from "../Banco.js";
import { QueryTypes } from "sequelize";

async function buscarPorPaciente(req, res) {
  const paciente_id = req.params.paciente_id;

  try {
    // Usa a view, exigência de BD1
    const registros = await banco.query(
      `SELECT * FROM sistema.vw_historico_clinico
       WHERE paciente_id = :paciente_id`,
      {
        replacements: { paciente_id: Number(paciente_id) },
        type: QueryTypes.SELECT,
      },
    );

    if (registros.length > 0) {
      // View devolve registro_id/tipo_registro, frontend espera id/tipo_registro_id
      const tipos = await banco.query(
        `SELECT id, descricao FROM sistema.tipo_registro`,
        { type: QueryTypes.SELECT },
      );
      const idPorDescricao = Object.fromEntries(
        tipos.map((t) => [t.descricao, t.id]),
      );

      const registrosMapeados = registros.map((r) => ({
        ...r,
        id: r.registro_id,
        tipo_registro_id: idPorDescricao[r.tipo_registro] ?? null,
      }));

      const prontuario = {
        id: registros[0].prontuario_id,
        paciente_id: registros[0].paciente_id,
        data_criacao: registros[0].prontuario_criado_em,
      };
      return res.json({ prontuario, registros: registrosMapeados });
    }

    // View só traz prontuário com registros, aqui checa se existe um vazio
    const prontuario = await Prontuario.findOne({ where: { paciente_id } });
    if (!prontuario) {
      return res.status(404).json({
        mensagem: "Prontuário não encontrado para este paciente.",
      });
    }

    return res.json({ prontuario, registros: [] });
  } catch (erro) {
    console.error("Erro em buscarPorPaciente:", erro);
    return res.status(500).json({ mensagem: erro.message });
  }
}

async function buscarPorId(req, res) {
  const id = req.params.id;

  try {
    const prontuario = await Prontuario.findByPk(id);
    if (!prontuario) {
      return res.status(404).json({ mensagem: "Prontuário não encontrado." });
    }

    const registros = await RegistroClinico.findAll({
      where: { prontuario_id: id },
      order: [["data_registro", "DESC"]],
    });

    return res.json({ prontuario, registros });
  } catch (erro) {
    console.error("Erro em buscarPorId:", erro);
    return res.status(500).json({ mensagem: erro.message });
  }
}

export default { buscarPorPaciente, buscarPorId };
